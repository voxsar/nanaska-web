#!/bin/bash
# Streams every committed change of the Nanaska database into a text log.
# Runs under pm2 as `nanaska-pitr`. The log is rolled by scripts/backup-db.sh
# (rename + SIGHUP) each time a database backup is taken.
set -e
cd "$(dirname "$0")/.."
set -a; . ./.pitr.env; set +a
export PGPASSWORD="$PITR_DB_PASSWORD"
mkdir -p backups/pitr
exec pg_recvlogical -h "$PITR_DB_HOST" -p "$PITR_DB_PORT" -U "$PITR_DB_USER" -d "$PITR_DB_NAME" \
    -S nanaska_pitr -P test_decoding --start \
    -o include-timestamp=1 -o skip-empty-xacts=1 \
    -f backups/pitr/current.log --fsync-interval=1
