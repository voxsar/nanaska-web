#!/bin/bash
# Database Backup Script for Nanaska
# Usage: ./scripts/backup-db.sh

set -e

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set. Please check your .env file."
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

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

# Perform the backup using pg_dump
export PGPASSWORD="$DB_PASS"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --no-owner --no-privileges \
    -f "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress the backup file
    gzip "$BACKUP_FILE"
    echo ""
    echo "✓ Backup completed successfully!"
    echo "✓ File: ${BACKUP_FILE}.gz"
    echo "✓ Size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
    echo ""
    echo "To restore this backup, run:"
    echo "  gunzip ${BACKUP_FILE}.gz"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BACKUP_FILE"
else
    echo ""
    echo "✗ Backup failed!"
    exit 1
fi

# List recent backups
echo "Recent backups:"
ls -lht "$BACKUP_DIR" | head -6

# Clean up backups older than 30 days (optional)
# find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +30 -delete

unset PGPASSWORD
