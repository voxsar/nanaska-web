#!/bin/bash
# Database Backup Script for Nanaska
# Usage: ./scripts/backup-db.sh

set -e

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs -d '\n')
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set. Please check your .env file."
    exit 1
fi

# Function to URL decode a string
urldecode() {
    local url_encoded="${1//+/ }"
    printf '%b' "${url_encoded//%/\\x}"
}

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS_ENCODED=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# URL decode the password
DB_PASS=$(urldecode "$DB_PASS_ENCODED")

# Create backups directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/nanaska_db_backup_$TIMESTAMP.sql"

echo "=========================================="
echo "Nanaska Database Backup"
echo "=========================================="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo "=========================================="

# Roll the PITR change log (see scripts/pitr-stream.sh): everything up to this
# moment is stored beside this backup as nanaska_changes_<TIMESTAMP>.log
PITR_DIR="$BACKUP_DIR/pitr"
if [ -f "$PITR_DIR/current.log" ]; then
    mv "$PITR_DIR/current.log" "$PITR_DIR/nanaska_changes_$TIMESTAMP.log"
    PITR_PID=$(pgrep -f "pg_recvlogical.*-S nanaska_pitr" | head -1 || true)
    if [ -n "$PITR_PID" ]; then
        kill -HUP "$PITR_PID"
        echo "PITR log rolled: $PITR_DIR/nanaska_changes_$TIMESTAMP.log"
    else
        echo "WARNING: PITR streamer not running; change log was not rolled over cleanly"
    fi
fi

# Perform the backup using pg_dump
export PGPASSWORD="$DB_PASS"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --no-owner --no-privileges \
    -f "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Create a tar.gz archive of the backup file
    TAR_FILE="${BACKUP_FILE}.tar.gz"
    tar -czf "$TAR_FILE" -C "$BACKUP_DIR" "$(basename $BACKUP_FILE)"
    
    # Remove the uncompressed SQL file
    rm "$BACKUP_FILE"
    
    echo ""
    echo "✓ Backup completed successfully!"
    echo "✓ File: ${TAR_FILE}"
    echo "✓ Size: $(du -h ${TAR_FILE} | cut -f1)"
    echo ""
    echo "To restore this backup, run:"
    echo "  tar -xzf ${TAR_FILE} -C $BACKUP_DIR"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ${BACKUP_FILE}"
else
    echo ""
    echo "✗ Backup failed!"
    exit 1
fi

# Copy backups and PITR logs to S3 (s3://$AWS_BUCKET/nanaska_web/), then keep
# only the newest backup on this server. Files are deleted locally only after
# the S3 copy is confirmed; a failure here never fails the backup itself.
if [ -n "$AWS_BUCKET" ]; then
    python3 -I "$(dirname "$0")/offsite-upload.py" --prune \
        || echo "WARNING: off-site upload failed; local backups were kept"
else
    echo "WARNING: AWS_BUCKET not set; skipping off-site upload"
fi

# List recent backups
echo "Recent backups:"
ls -lht "$BACKUP_DIR" | head -6

# Clean up backups older than 30 days (optional)
# find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +30 -delete

unset PGPASSWORD
