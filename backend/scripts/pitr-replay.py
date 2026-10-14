#!/usr/bin/env python3
"""
Replay the PITR change logs (backups/pitr/nanaska_changes_*.log + current.log)
on top of a restored database backup, optionally stopping at a point in time.

Recovery procedure
  1. Create an empty database and restore the dump you want to start from:
       tar -xzf backups/nanaska_db_backup_<TS>.sql.tar.gz -C /tmp
       psql <target> -f /tmp/nanaska_db_backup_<TS>.sql
  2. Replay every change log written AFTER that dump, oldest first, ending with
     current.log. Pass them all in one call, in order:
       python3 scripts/pitr-replay.py --psql "psql -h 127.0.0.1 -p 5433 -U nanaska_app -d <target>" \
           --until "2026-10-13 12:50:00+05:30" \
           backups/pitr/nanaska_changes_<TS_A>.log backups/pitr/nanaska_changes_<TS_B>.log backups/pitr/current.log
     Log "nanaska_changes_<TS>.log" holds the changes from the previous backup up
     to the moment backup <TS> was taken, so to recover from dump <TS_k> you need
     the logs with a timestamp LATER than <TS_k>, plus current.log.
  3. Use --dry-run to print the SQL instead of applying it.

Replay is idempotent: INSERTs use ON CONFLICT DO NOTHING, so overlap between a
dump and the start of the following log is harmless.
"""
import argparse
import re
import shlex
import subprocess
import sys
from datetime import datetime

IDENT = r'(?:"(?:[^"]|"")+"|[A-Za-z_][A-Za-z0-9_$]*)'
COL_RE = re.compile(r'(' + IDENT + r')\[((?:[^\]]|\[\])*)\]:')
TABLE_RE = re.compile(r'^table (' + IDENT + r')\.(' + IDENT + r'): (INSERT|UPDATE|DELETE|TRUNCATE):\s?(.*)$')
COMMIT_RE = re.compile(r'^COMMIT \d+ \(at (.+)\)$')


def norm(ident):
    """Unquoted identifier name (test_decoding quotes only when needed)."""
    return ident[1:-1].replace('""', '"') if ident.startswith('"') else ident


def q(ident):
    return '"%s"' % norm(ident).replace('"', '""')


def parse_ts(s):
    s = re.sub(r'\s+([+-]\d\d(?::?\d\d)?)$', r'\1', s.strip())
    for fmt in ('%Y-%m-%d %H:%M:%S.%f%z', '%Y-%m-%d %H:%M:%S%z', '%Y-%m-%d %H:%M:%S.%f', '%Y-%m-%d %H:%M:%S'):
        for cand in (s, re.sub(r'([+-]\d\d)$', r'\g<1>00', s)):
            try:
                return datetime.strptime(cand, fmt)
            except ValueError:
                pass
    raise ValueError('cannot parse timestamp: ' + s)


def parse_tuple(text):
    """Return ordered [(column, literal_sql)] from a test_decoding tuple string."""
    out, pos = [], 0
    while pos < len(text):
        m = COL_RE.match(text, pos)
        if not m:
            break
        col, pos = norm(m.group(1)), m.end()
        if text[pos] == "'":
            i = pos + 1
            while True:
                j = text.index("'", i)
                if text[j + 1:j + 2] == "'":
                    i = j + 2
                    continue
                break
            val, pos = text[pos:j + 1], j + 1
        else:
            j = text.find(' ', pos)
            j = len(text) if j == -1 else j
            val, pos = text[pos:j], j
        if pos < len(text) and text[pos] == ' ':
            pos += 1
        out.append((col, val))
    return out


def pk_columns(psql_cmd, schema, table):
    q = ("select a.attname from pg_index i join pg_attribute a on a.attrelid=i.indrelid and a.attnum=any(i.indkey) "
         "where i.indrelid='%s.%s'::regclass and i.indisprimary order by array_position(i.indkey, a.attnum)"
         % (norm(schema).replace("'", "''"), norm(table).replace("'", "''")))
    r = subprocess.run(shlex.split(psql_cmd) + ['-Atc', q], capture_output=True, text=True)
    if r.returncode:
        sys.exit('psql failed: ' + r.stderr)
    return r.stdout.split()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('logs', nargs='+')
    ap.add_argument('--psql', required=True, help='psql command that connects to the TARGET database')
    ap.add_argument('--until', help='stop after the last transaction committed at or before this time')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    until = parse_ts(a.until) if a.until else None
    if until is not None and until.tzinfo is None:
        until = until.astimezone()

    pks, sql, txn, applied, skipped = {}, [], [], 0, 0

    def flush(commit_ts):
        nonlocal txn, applied, skipped
        ts = parse_ts(commit_ts)
        if until is not None and ts > until:
            skipped += 1
            txn = []
            return False
        if txn:
            sql.append('BEGIN;')
            sql.extend(txn)
            sql.append('COMMIT;')
            applied += 1
        txn = []
        return True

    stop = False
    for path in a.logs:
        with open(path, encoding='utf-8') as fh:
            for line in fh:
                line = line.rstrip('\n')
                if line.startswith('BEGIN'):
                    txn = []
                    continue
                m = COMMIT_RE.match(line)
                if m:
                    if not flush(m.group(1)):
                        stop = True
                        break
                    continue
                m = TABLE_RE.match(line)
                if not m:
                    continue
                schema, table, op, rest = m.groups()
                fq = '%s.%s' % (q(schema), q(table))
                if op == 'TRUNCATE':
                    txn.append('TRUNCATE %s;' % fq)
                    continue
                if (schema, table) not in pks:
                    pks[(schema, table)] = pk_columns(a.psql, schema, table)
                pk = pks[(schema, table)]
                if op == 'INSERT':
                    cols = parse_tuple(rest)
                    txn.append('INSERT INTO %s (%s) VALUES (%s) ON CONFLICT DO NOTHING;' % (
                        fq, ', '.join(q(c) for c, _ in cols), ', '.join(v for _, v in cols)))
                elif op == 'DELETE':
                    cols = dict(parse_tuple(rest))
                    where = ' AND '.join('%s = %s' % (q(c), cols[c]) for c in (pk or cols))
                    txn.append('DELETE FROM %s WHERE %s;' % (fq, where))
                else:  # UPDATE
                    old = {}
                    if rest.startswith('old-key: '):
                        head, _, rest = rest[len('old-key: '):].partition(' new-tuple: ')
                        old = dict(parse_tuple(head))
                    new = parse_tuple(rest)
                    newd = dict(new)
                    where = ' AND '.join('%s = %s' % (q(c), old.get(c, newd[c])) for c in pk)
                    sets = ', '.join('%s = %s' % (q(c), v) for c, v in new if v != 'unchanged-toast-datum')
                    txn.append('UPDATE %s SET %s WHERE %s;' % (fq, sets, where))
        if stop:
            break

    script = '\n'.join(sql) + '\n'
    if a.dry_run:
        sys.stdout.write(script)
    else:
        r = subprocess.run(shlex.split(a.psql) + ['-v', 'ON_ERROR_STOP=1', '-q'], input=script, text=True)
        if r.returncode:
            sys.exit('replay failed')
    sys.stderr.write('replayed %d transactions, skipped %d (after --until)\n' % (applied, skipped))


if __name__ == '__main__':
    main()
