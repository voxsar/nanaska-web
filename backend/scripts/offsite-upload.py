#!/usr/bin/env python3
"""
Copy database backups and PITR change logs to S3 (s3://$AWS_BUCKET/nanaska_web/)
and, with --prune, keep only the newest backup on this server.

Uses AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_DEFAULT_REGION / AWS_BUCKET
from the environment (backup-db.sh exports them from backend/.env).

A local file is deleted ONLY after the copy in S3 has been confirmed with the
same size. If any upload fails, nothing is deleted.
"""
import argparse
import os
import re
import sys

import boto3

PREFIX = 'nanaska_web'
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
BACKUPS = os.path.join(ROOT, 'backups')
PITR = os.path.join(BACKUPS, 'pitr')
TS = re.compile(r'(\d{8}_\d{6})')


def local_files():
    out = []
    for d, pattern, sub in ((BACKUPS, r'^nanaska_db_backup_.*\.sql\.tar\.gz$', 'backups'),
                            (PITR, r'^nanaska_changes_.*\.log$', 'pitr')):
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if re.match(pattern, f):
                    out.append((os.path.join(d, f), '%s/%s/%s' % (PREFIX, sub, f)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--prune', action='store_true', help='keep only the newest backup locally')
    a = ap.parse_args()
    bucket = os.environ.get('AWS_BUCKET')
    if not bucket:
        sys.exit('AWS_BUCKET not set')
    s3 = boto3.client('s3', region_name=os.environ.get('AWS_DEFAULT_REGION'))

    ok, failed = [], 0
    for path, key in local_files():
        size = os.path.getsize(path)
        try:
            try:
                have = s3.head_object(Bucket=bucket, Key=key)['ContentLength']
            except s3.exceptions.ClientError:
                have = None
            if have != size:
                s3.upload_file(path, bucket, key)
                have = s3.head_object(Bucket=bucket, Key=key)['ContentLength']
                print('uploaded  s3://%s/%s (%d bytes)' % (bucket, key, size))
            if have == size:
                ok.append(path)
            else:
                raise RuntimeError('size mismatch after upload')
        except Exception as e:  # noqa: BLE001
            failed += 1
            print('FAILED    %s: %s' % (key, e), file=sys.stderr)

    if failed:
        sys.exit('%d upload(s) failed; nothing was deleted locally' % failed)

    if a.prune:
        backups = [p for p in ok if p.endswith('.sql.tar.gz')]
        if not backups:
            return
        newest = max(backups, key=lambda p: TS.search(os.path.basename(p)).group(1))
        newest_ts = TS.search(os.path.basename(newest)).group(1)
        for p in ok:
            ts = TS.search(os.path.basename(p)).group(1)
            if p.endswith('.sql.tar.gz'):
                drop = p != newest
            else:  # a rolled change log is only needed for dumps OLDER than itself
                drop = ts <= newest_ts
            if drop:
                os.remove(p)
                print('removed local %s (safe in S3)' % os.path.relpath(p, ROOT))
        print('kept newest local backup: %s' % os.path.basename(newest))


if __name__ == '__main__':
    main()
