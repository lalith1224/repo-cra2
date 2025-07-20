# Print Repository System - Frontend

This is the frontend application for the Print Repository System, converted from Vite to Create React App.

## Features

- Modern React application with Create React App
- Responsive design with Bootstrap
- File upload and PDF preview
- Print job management
- Order tracking
- Admin dashboard
- Payment processing

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── pages/         # Page components
├── services/      # API services
└── utils/         # Utility functions
```

## Dependencies

- React 19.1.0
- React Router DOM 7.6.3
- Bootstrap 5.3.7
- React Bootstrap 2.10.10
- Axios for API calls
- React Toastify for notifications
- React PDF for PDF handling
- And more...

## Backend Integration

The frontend connects to the backend API running on `http://localhost:5001/api` by default. Make sure the backend server is running before using the application.

## Environment Variables

Create a `.env` file in the root directory to configure:

```
REACT_APP_API_URL=http://localhost:5001/api
```

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.
