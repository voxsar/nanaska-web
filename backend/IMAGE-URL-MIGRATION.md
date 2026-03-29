# Image URL Migration Guide

This guide explains how to migrate database image URLs from external WordPress URLs to local paths.

## Overview

As part of the image migration process, all lecturer and testimonial images have been downloaded from `images.nanaska.com` and `www.nanaska.com/wp-content/uploads/` to `/public/images/`. 

**External URL Format:**
```
https://www.nanaska.com/wp-content/uploads/2021/04/Channa.png
```

**Local Path Format:**
```
/images/2021-04-Channa.png
```

## Files Created

### 1. Database Backup Script
**Location:** `backend/scripts/backup-db.sh`

Creates a compressed PostgreSQL backup before making any changes.

**Usage:**
```bash
cd backend
./scripts/backup-db.sh
```

**Output:** Creates backup in `backend/backups/nanaska_db_backup_YYYYMMDD_HHMMSS.sql.gz`

### 2. Database Migration Script
**Location:** `backend/scripts/migrate-image-urls.ts`

Updates existing database records to use local image paths.

**Affected Tables:**
- `lecturers.image_url`
- `testimonials.image_url`
- `blog_posts.cover_url`
- `page_meta.og_image`

**Usage:**
```bash
cd backend
npx ts-node scripts/migrate-image-urls.ts
```

### 3. Updated Seed File
**Location:** `backend/prisma/seed.ts`

All image URLs in the seed file have been updated to use local paths.

**Usage:**
```bash
cd backend
npm run prisma:seed
```

## Migration Steps

### For New Installations (No Existing Data)

1. Simply run the seed:
   ```bash
   cd backend
   npm run prisma:seed
   ```

### For Existing Databases (Production/Staging)

1. **Backup the database first:**
   ```bash
   cd backend
   ./scripts/backup-db.sh
   ```

2. **Run the migration script:**
   ```bash
   npx ts-node scripts/migrate-image-urls.ts
   ```

3. **Verify the changes:**
   - Check that lecturer and testimonial images are displaying correctly
   - Verify that API responses return local paths
   - Test on frontend that images load properly

## Verification

After running the migration, you can verify the changes:

```sql
-- Check lecturers
SELECT name, image_url FROM lecturers WHERE image_url IS NOT NULL LIMIT 5;

-- Check testimonials
SELECT student_name, image_url FROM testimonials WHERE image_url IS NOT NULL LIMIT 5;

-- Count remaining external URLs (should be 0)
SELECT COUNT(*) FROM lecturers WHERE image_url LIKE '%nanaska.com/wp-content/uploads/%';
SELECT COUNT(*) FROM testimonials WHERE image_url LIKE '%nanaska.com/wp-content/uploads/%';
```

## Rollback

If you need to roll back the changes:

```bash
cd backend/backups

# Find your backup file
ls -lht

# Restore (example with a specific backup)
gunzip nanaska_db_backup_20260329_120000.sql.gz
psql -h <host> -U <user> -d <database> -f nanaska_db_backup_20260329_120000.sql
```

## Important Notes

1. **No Data Loss:** The migration only updates URLs, no data is deleted
2. **Images Required:** Ensure all images exist in `/public/images/` before running migration
3. **API Changes:** Frontend will automatically receive local paths from the API after migration
4. **Idempotent:** The migration script can be run multiple times safely

## Troubleshooting

### Images Not Loading

1. Verify images exist:
   ```bash
   ls -la public/images/ | wc -l
   ```

2. Check image paths match pattern:
   ```bash
   # Images should follow: YYYY-MM-filename.ext
   ls public/images/ | head -10
   ```

### Migration Fails

1. Check database connection:
   ```bash
   cd backend
   npx prisma db pull
   ```

2. Verify .env file has DATABASE_URL set correctly

3. Check TypeScript compiles:
   ```bash
   npx ts-node --version
   ```

## Summary of Changes

### Seed File Updates
- ✅ 11 lecturer image URLs updated
- ✅ 53 testimonial image URLs updated
- ✅ All paths now use `/images/YYYY-MM-filename.ext` format

### Scripts Created
- ✅ `backup-db.sh` - Database backup utility
- ✅ `migrate-image-urls.ts` - Migration script for existing data

### Files Not Modified
- Frontend static data (`src/data/lecturersData.js`, `src/data/testimonialsData.js`) - already updated
- Downloaded images in `/public/images/` - already present (152 files)

## Next Steps

After successful migration:

1. **Restart backend API** (if running):
   ```bash
   pm2 restart nanaska-api
   ```

2. **Test frontend**:
   - Visit lecturer pages
   - Check testimonials section
   - Verify images load correctly

3. **Monitor logs** for any 404 errors on missing images

4. **Remove backup files** after confirming everything works (optional):
   ```bash
   # Keep at least 2-3 recent backups
   rm backend/backups/nanaska_db_backup_20260301_*.sql.gz
   ```
