# Database Backup System

This document describes the automated backup and restore system for the Nanaska database.

## Overview

The backup system automatically creates PostgreSQL database backups every 4 hours and provides a web UI for managing backups.

## Features

- **Automatic Backups**: Runs every 4 hours via NestJS scheduler
- **Manual Backups**: Create backups on-demand via admin UI
- **Backup Format**: SQL dumps compressed as `.tar.gz` files
- **Restore Functionality**: One-click restore from any backup
- **Backup Management**: List, view, and delete backups
- **Superadmin Only**: Restricted to superadmin users

## Architecture

### Backend Components

#### 1. Backup Script (`scripts/backup-db.sh`)
- Extracts database credentials from `DATABASE_URL` environment variable
- Handles URL-encoded passwords
- Uses `pg_dump` to create SQL backup
- Compresses backup as `.tar.gz` file
- Stores backups in `backend/backups/` directory

#### 2. Scheduler Service (`src/scheduler/scheduler.service.ts`)
- Cron job: `@Cron('0 */4 * * *')` - runs every 4 hours
- Executes `backup-db.sh` script
- Logs backup status and errors

#### 3. Backups Module (`src/backups/`)
- **BackupsController**: REST API endpoints at `/admin/backups`
- **BackupsService**: Business logic for backup operations
- **BackupsModule**: NestJS module registration

#### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/backups` | List all backup files | Superadmin |
| `POST` | `/admin/backups` | Create a new backup | Superadmin |
| `POST` | `/admin/backups/restore` | Restore from backup | Superadmin |
| `DELETE` | `/admin/backups` | Delete a backup file | Superadmin |

### Frontend Components

#### Admin Backups Page (`src/admin/pages/BackupsPage.jsx`)
- List all available backups with metadata (filename, size, date)
- Create manual backups
- Restore database from selected backup
- Delete unwanted backups
- Warning messages for destructive operations

#### Navigation
- Added to Admin Sidebar under "Superadmin" section
- Route: `/admin/backups`
- Icon: 💾

## Usage

### Automatic Backups

Backups run automatically every 4 hours. No manual intervention required.

The schedule is: **00:00, 04:00, 08:00, 12:00, 16:00, 20:00 (server time)**

### Manual Backup

1. Navigate to **Admin → Database Backups**
2. Click **"Create Backup Now"** button
3. Wait for confirmation message
4. New backup appears in the list

### Restore Database

⚠️ **WARNING**: Restoring a backup will completely overwrite the current database!

1. Navigate to **Admin → Database Backups**
2. Find the backup you want to restore
3. Click **"Restore"** button
4. Confirm the warning dialog
5. Wait for restoration to complete

### Delete Backup

1. Navigate to **Admin → Database Backups**
2. Find the backup you want to delete
3. Click **"Delete"** button
4. Confirm deletion
5. Backup file is permanently removed

## File Naming Convention

Backups are named with the following pattern:

```
nanaska_db_backup_YYYYMMDD_HHMMSS.sql.tar.gz
```

Example: `nanaska_db_backup_20260329_085138.sql.tar.gz`

## Storage Location

```
backend/
  backups/
    nanaska_db_backup_20260329_085138.sql.tar.gz
    nanaska_db_backup_20260329_120001.sql.tar.gz
    ...
```

## Backup Retention

Currently, backups are kept indefinitely. To enable automatic cleanup:

1. Edit `backend/scripts/backup-db.sh`
2. Uncomment the cleanup line:
   ```bash
   find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +30 -delete
   ```
3. Adjust `+30` to desired retention days (e.g., `+7` for 7 days)

## Technical Details

### Database Connection

- Uses `DATABASE_URL` environment variable
- Format: `postgresql://user:password@host:port/database`
- Handles URL-encoded passwords (e.g., `%23` → `#`)

### Path Resolution

- Uses `process.cwd()` to locate scripts and backup directory
- Works correctly when code is compiled to `dist/` folder
- PM2 config sets `cwd: '/var/www/nanaska-web/backend'`
- Ensures backup script is found at `{cwd}/scripts/backup-db.sh`

### Backup Process

1. Parse `DATABASE_URL` to extract credentials
2. Execute `pg_dump` with options:
   - `--clean`: Drop existing objects before recreating
   - `--if-exists`: Use IF EXISTS when dropping objects
   - `--no-owner`: Skip ownership resets
   - `--no-privileges`: Skip privilege resets
3. Compress SQL file with `tar -czf`
4. Remove uncompressed SQL file
5. Log backup details

### Restore Process

1. Extract `.tar.gz` archive
2. Find `.sql` file in archive
3. Parse database credentials from `DATABASE_URL`
4. Execute SQL file using `psql`
5. Cleanup temporary files
6. Log restore status

### Security

- All endpoints require `AdminJwtAuthGuard` and `SuperadminGuard`
- Only superadmin users can access backup features
- Passwords are handled securely via environment variables
- No credentials exposed in logs or responses

## Troubleshooting

### Backup Script Fails

**Issue**: `pg_dump: error: connection to server failed`

**Solution**: 
- Check `DATABASE_URL` in `.env` file
- Verify PostgreSQL is running
- Test database connection: `psql "$DATABASE_URL"`

### URL Decoding Issues

**Issue**: Password authentication fails

**Solution**:
- Ensure special characters in password are URL-encoded in `DATABASE_URL`
- Example: `#` → `%23`, `@` → `%40`, `!` → `%21`

### Scheduler Not Running

**Issue**: No automatic backups

**Solution**:
- Check backend logs: `pm2 logs nanaska-backend`
- Verify scheduler is enabled in `AppModule`
- Check for error messages in logs

### Restore Fails

**Issue**: Restore operation fails

**Solution**:
- Verify backup file is valid: `tar -tzf backup.tar.gz`
- Check database permissions
- Review backend logs for detailed error messages

## Monitoring

View backup logs in PM2:

```bash
cd /var/www/nanaska-web/backend
pm2 logs nanaska-backend | grep -i backup
```

Check scheduled jobs:

```bash
# The cron expression '0 */4 * * *' means:
# - Minute: 0
# - Hour: Every 4 hours
# - Day: Every day
# - Month: Every month
# - Day of week: Every day
```

## Related Files

```
backend/
  scripts/
    backup-db.sh                    # Backup shell script
  src/
    backups/
      backups.controller.ts         # REST API controller
      backups.service.ts            # Service with business logic
      backups.module.ts             # NestJS module
    scheduler/
      scheduler.service.ts          # Cron job scheduler
    app.module.ts                   # Registers BackupsModule

src/admin/
  pages/
    BackupsPage.jsx                 # Admin UI page
    BackupsPage.css                 # Styling
  components/
    AdminSidebar.jsx                # Navigation (updated)
  AdminApp.jsx                      # Route configuration (updated)
```

## Future Enhancements

- [ ] Cloud storage integration (S3, Google Cloud Storage)
- [ ] Backup encryption
- [ ] Scheduled cleanup of old backups
- [ ] Backup verification/integrity checks
- [ ] Email notifications on backup success/failure
- [ ] Backup size limits and quotas
- [ ] Incremental backups
- [ ] Multi-database backup support
