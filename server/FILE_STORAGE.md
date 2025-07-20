# File Storage System

This document describes the file storage system used in the Print Repository application.

## Overview
The system stores uploaded files on the local filesystem and keeps metadata in the PostgreSQL database. This approach provides better performance and scalability than storing files directly in the database.

## Directory Structure

```
server/
├── uploads/               # Directory where uploaded files are stored
│   ├── 1234567890-abc123.pdf
│   └── ...
├── scripts/
│   ├── cleanupFiles.js    # Script to clean up old files
│   └── scheduleCleanup.js # Scheduler for automatic cleanup
└── ...
```

## Database Schema

The `orders` table stores file metadata with these relevant columns:

| Column Name     | Type         | Description                                      |
|-----------------|--------------|--------------------------------------------------|
| id             | SERIAL       | Primary key                                      |
| token          | VARCHAR(255) | Unique token for the order                       |
| roll_number    | VARCHAR(50)  | Student roll number                              |
| original_filename | VARCHAR(255) | Original filename provided by the user           |
| stored_filename | VARCHAR(255) | Generated filename on the server                 |
| file_path      | VARCHAR(500) | Full path to the stored file                     |
| file_size      | INTEGER      | File size in bytes                               |
| file_mimetype  | VARCHAR(100) | MIME type of the file                            |
| total_pages    | INTEGER      | Total number of pages in the document            |
| created_at     | TIMESTAMP    | When the record was created                      |
| updated_at     | TIMESTAMP    | When the record was last updated                 |
| expires_at     | TIMESTAMP    | When the order expires (default: 12 hours)       |

## API Endpoints

### Upload a File

```
POST /api/print-jobs
Content-Type: multipart/form-data

Form Data:
- file: The file to upload (required)
- rollNumber: Student roll number (required)
- totalPages: Total number of pages (required)
- colorPages: Number of color pages (default: 0)
- bwPages: Number of black & white pages (default: totalPages)
- price: Total price for printing (required)
- printOptions: JSON string with print options (required)
```

### Download a File

```
GET /api/print-jobs/download/:token
```

### Get File Preview URL

```
GET /api/print-jobs/preview/:token
```

## File Cleanup

### Automatic Cleanup

A scheduled job runs daily at 2 AM to clean up:
1. Completed orders older than 7 days
2. Expired orders (older than 12 hours)

### Manual Cleanup

To manually clean up files:

```bash
# Clean up files older than 7 days (default)
node scripts/cleanupFiles.js [days]

# Example: Clean up files older than 3 days
node scripts/cleanupFiles.js 3
```

## Environment Variables

| Variable          | Default Value | Description                                      |
|-------------------|---------------|--------------------------------------------------|
| UPLOAD_DIR       | ./uploads     | Directory to store uploaded files                |
| MAX_FILE_SIZE    | 10485760      | Maximum file size in bytes (10MB)                |
| ALLOWED_FILE_TYPES | pdf         | Comma-separated list of allowed file extensions  |
| BASE_URL         | http://localhost:5000 | Base URL for generating file download URLs    |

## Testing

To test the file upload and download functionality:

```bash
node scripts/testFileUpload.js
```

This will:
1. Create a test PDF file
2. Upload it to the server
3. Download it back
4. Save it as `downloaded_test.pdf` in the scripts directory

## Security Considerations

1. **File Validation**:
   - Only allowed file types are accepted (default: PDF only)
   - File size is limited to prevent denial of service attacks

2. **File Naming**:
   - Original filenames are not used for storage
   - Files are stored with generated unique names
   - Original filenames are stored in the database for reference

3. **Access Control**:
   - Files are served through the application, not directly
   - Authentication is required for all file operations
   - Download links include a secure token

4. **Cleanup**:
   - Old files are automatically cleaned up
   - Failed uploads are cleaned up immediately
   - Expired orders are removed

## Troubleshooting

### File Upload Fails
1. Check file size is within limits
2. Verify file type is allowed
3. Check server logs for errors
4. Ensure upload directory has write permissions

### File Download Fails
1. Verify the token is valid and not expired
2. Check if the file exists on disk
3. Verify file permissions
4. Check server logs for errors

### Cleanup Not Working
1. Check if the cleanup job is running
2. Verify the cleanup script has permissions to delete files
3. Check server logs for errors
4. Manually run the cleanup script with debug output

## Future Improvements

1. Implement virus scanning for uploaded files
2. Add support for cloud storage (S3, Google Cloud Storage, etc.)
3. Implement file chunking for large files
4. Add file integrity checks (checksums)
5. Implement file versioning
6. Add support for file previews (thumbnails for images, first page for PDFs)
