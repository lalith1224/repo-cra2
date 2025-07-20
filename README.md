# Print Repository System

A full-stack web application for educational institutions to manage printing jobs efficiently. Built with React.js frontend and Node.js/Express backend, featuring secure file storage, payment processing, and automated reporting.

## Features

### Client-Side (React.js + Bootstrap)
- **Home Page**: Entry point with print job and tracking options
- **Print Job Page**: File upload, DOC to PDF conversion, preview/editing, pricing calculation
- **Thank You Page**: Order confirmation with auto-download and cancellation
- **Tracking Page**: Order status tracking without authentication
- **Admin Page**: JWT-secured admin interface with order management
- **File Selector**: Canva template design for file upload

### Server-Side (Node.js + Express)
- **Authentication**: JWT-based admin access with temporary user tokens
- **Database**: PostgreSQL for metadata storage with audit logs
- **File Storage**: Cloudflare R2 with auto-deletion after 1 hour
- **Payment Processing**: Paytm UPI integration with retry logic
- **Security**: ClamAV malware scanning, GDPR/PCI-DSS compliance
- **Reports**: Daily Excel reports with email delivery
- **Cron Jobs**: Automated cleanup and reporting

## Tech Stack

### Frontend
- React.js
- Bootstrap (responsive design)
- PDF.js (document conversion and editing)
- Axios (API communication)

### Backend
- Node.js/Express.js
- PostgreSQL (metadata storage)
- Cloudflare R2 (file storage)
- Paytm UPI (payments)
- ClamAV (security scanning)
- JWT (authentication)
- Node cron (scheduled tasks)
- ExcelJS (report generation)

### Infrastructure
- Direct Node.js execution
- Environment-based configuration

## Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (running locally or remotely)
- Cloudflare R2 account
- Paytm UPI credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd print-repository-system
   ```

2. **Quick Setup (Recommended)**
   ```bash
   # Run the setup script
   ./start.sh
   
   # Or use npm
   npm run setup
   ```

3. **Manual Setup**
   ```bash
   # Copy environment files
   cp env.example .env
   cp env.example server/.env
   echo "REACT_APP_API_URL=http://localhost:5000" > client/.env
   
   # Install all dependencies
   npm run install-all
   
   # Or install separately
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```

4. **Configure Environment**
   ```bash
   # Edit environment files with your configuration
   nano .env
   nano server/.env
   nano client/.env
   ```

5. **Start PostgreSQL Database**
   ```bash
   # Make sure PostgreSQL is running
   # Create database if needed
   createdb print_repository
   ```

6. **Start the Application**
   ```bash
   # Option 1: Start both server and client together
   npm run dev
   
   # Option 2: Start separately (in different terminals)
   npm run server  # Terminal 1
   npm run client  # Terminal 2
   
   # Option 3: Manual start
   cd server && npm run dev  # Terminal 1
   cd client && npm start    # Terminal 2
   ```

## Configuration

### Environment Variables

#### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PAYTM_MERCHANT_ID=your_merchant_id
REACT_APP_PAYTM_MERCHANT_KEY=your_merchant_key
```

#### Server (.env)
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=print_repository
DB_USER=postgres
DB_PASSWORD=password

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Paytm UPI
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_ENVIRONMENT=TEST

# JWT
JWT_SECRET=your_jwt_secret

# Email (for reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Usage

### For Users
1. Visit the home page
2. Click "Start New Print Job"
3. Upload files (PDF, DOC, images up to 25MB)
4. Preview and edit documents
5. Configure printing options (color/B&W, double-sided)
6. Complete payment via Paytm UPI
7. Track order status using token or roll number

### For Admins
1. Access admin page with JWT credentials
2. View and filter orders
3. Update order status
4. Generate reports
5. Monitor system health

## Security Features

- **File Scanning**: ClamAV malware detection
- **Data Privacy**: GDPR/PCI-DSS compliant audit logs
- **Temporary Storage**: Auto-deletion of files and metadata
- **Secure Payments**: Server-side validation with retries
- **Rate Limiting**: Protection against abuse
- **JWT Authentication**: Secure admin access

## API Endpoints

### Public Routes
- `GET /` - Home page
- `POST /api/print-job` - Create print job
- `GET /api/tracking/:token` - Track order
- `POST /api/payment` - Process payment

### Admin Routes (JWT Required)
- `GET /api/admin/orders` - List orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/reports` - Generate reports

## File Structure

```
print-repository-system/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── README.md              # This file
└── env.example            # Environment template
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository. 