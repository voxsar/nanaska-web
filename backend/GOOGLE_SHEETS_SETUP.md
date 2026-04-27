# Google Sheets Integration Setup Guide

This guide explains how to set up Google Sheets integration for auto-syncing enrollment submissions.

## Prerequisites

- A Google Cloud Project
- Access to Google Sheets
- Admin access to the Nanaska backend

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Sheets API"
3. Click **Enable**

### 3. Create a Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Fill in the service account details:
   - Name: `nanaska-sheets-sync` (or your preferred name)
   - Description: `Service account for syncing enrollment data to Google Sheets`
4. Click **Create and Continue**
5. Skip the optional steps (roles and user access)
6. Click **Done**

### 4. Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key > Create New Key**
5. Select **JSON** format
6. Click **Create**
7. A JSON file will be downloaded - **keep this secure!**

### 5. Create Google Sheet

1. Create a new Google Sheet or use an existing one
2. Create a sheet/tab named `Enrollment Submissions` (or your preferred name)
3. Note the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 6. Share Sheet with Service Account

1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from step 3) as an editor
   - Example: `nanaska-sheets-sync@project-name.iam.gserviceaccount.com`
4. Uncheck "Notify people"
5. Click **Share**

### 7. Configure Backend Environment

1. Open your `backend/.env` file
2. Add the following variables:

```env
# Google Sheets Integration
# Copy the entire contents of the downloaded JSON key file and format as a single line
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"nanaska-sheets-sync@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# The Spreadsheet ID from step 5
GOOGLE_SHEETS_SPREADSHEET_ID=1abc123def456ghi789jkl

# Sheet name (optional, defaults to "Enrollment Submissions")
GOOGLE_SHEETS_SHEET_NAME=Enrollment Submissions
```

**Important:** The `GOOGLE_SHEETS_CREDENTIALS` must be the entire JSON content as a single line.

### 8. Restart Backend

```bash
cd backend
npm run dev
# or in production:
pm2 restart nanaska-backend
```

## Features

### Auto-Sync on Submission

When a user submits an enrollment form, the data is automatically appended to your Google Sheet in real-time.

### Manual Sync

Admins can manually sync all enrollment submissions:

1. Log in to the admin panel
2. Go to **Students** page
3. Click the **Unpaid Enrollments** tab
4. Click **📊 Sync to Google Sheets** button

This will:
- Clear the existing sheet data
- Write headers
- Sync all enrollment submissions

### Data Columns

The following columns are synced:

1. Submission Date
2. First Name
3. Last Name
4. Email
5. Phone
6. WhatsApp
7. CIMA ID
8. CIMA Stage
9. Date of Birth
10. Gender
11. Country
12. City
13. Postcode
14. Cart Items
15. Currency
16. Amount
17. Order ID
18. Notes

## Troubleshooting

### "Google Sheets API not configured" error

- Verify that `GOOGLE_SHEETS_CREDENTIALS` is set correctly in `.env`
- Ensure the JSON is valid and properly formatted as a single line
- Restart the backend after updating environment variables

### "Permission denied" error

- Ensure the service account email has been added as an editor to the Google Sheet
- Verify the spreadsheet ID is correct

### "Sheet not found" error

- Check that `GOOGLE_SHEETS_SHEET_NAME` matches the exact tab name in your spreadsheet (case-sensitive)
- The default is "Enrollment Submissions"

### Auto-sync not working

- Check the backend logs for errors
- Verify the service account has edit permissions on the sheet
- Ensure the Google Sheets API is enabled in your Google Cloud project

## Security Notes

- **Never commit the service account JSON key to version control**
- Keep the `.env` file secure and excluded from git (`.gitignore`)
- Limit service account permissions to only the necessary scopes
- Regularly rotate service account keys for production environments
- Only share the Google Sheet with necessary personnel

## API Endpoint

Manual sync endpoint (requires admin authentication):

```
POST /admin/enrollment-submissions/sync-google-sheets
Authorization: Bearer <admin_jwt_token>
```

Response:
```json
{
  "message": "Successfully synced 25 enrollment submissions to Google Sheets",
  "syncedCount": 25
}
```
