# MAA Travels Management Tool

MAA Travels is a full-stack travel and vehicle management application for running a vehicle hiring business from one place. It includes a public website for customers and a protected admin dashboard for fleet records, hired vehicle owner/client records, contract generation, payment ledger entries, financial reports, and customer inquiry follow-up.

The project is built with a React + Vite frontend, an Express.js backend, and Supabase as the production database. When Supabase credentials are not configured, the backend can run in a local JSON fallback mode for development.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Frontend Routes](#frontend-routes)
- [Backend API](#backend-api)
- [Admin Workflow](#admin-workflow)
- [Exports and Documents](#exports-and-documents)
- [Development Notes](#development-notes)
- [Deployment Notes](#deployment-notes)
- [Security Checklist](#security-checklist)

## Features

### Public Website

- Home page for MAA Travels brand and services
- About, Services, Fleet, and Contact pages
- Customer inquiry form connected to the backend
- Responsive layout with light/dark theme support

### Admin Dashboard

- JWT-protected admin login
- Dashboard overview with revenue, pending payments, active vehicle counts, client counts, and recent inquiries
- Inquiry management with status updates and email replies
- Vehicle management for owned fleet records
- Client management for hired vehicle owners and their vehicle/bank/KYC details
- Contract management with generated PDF and Word document exports
- Payment ledger management with monthly billing, commission, TDS, deductions, paid status, and notes
- Reports module with filtered ledger views and Excel/PDF exports

### Data and Document Handling

- Supabase database support
- Local JSON fallback database for development
- File uploads stored under the backend uploads folder
- Contract generation using `pdf-lib` and `docx`
- Excel report generation using `xlsx`
- Email replies using SMTP and `nodemailer`

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React icons
- Recharts

### Backend

- Node.js
- Express
- Supabase JavaScript client
- JSON Web Tokens
- Bcrypt
- Multer
- Nodemailer
- PDF/document generation libraries: `pdf-lib`, `docx`, `xlsx`
- Helmet and CORS middleware

## Project Structure

```text
maa travels/
+-- backend/
|   +-- controllers/          # API business logic
|   +-- middleware/           # Auth and upload middleware
|   +-- routes/               # Express route definitions
|   +-- services/             # Supabase/local DB abstraction
|   +-- uploads/              # Uploaded files and local JSON fallback DB
|   +-- schema.sql            # Supabase schema
|   +-- server.js             # Express app entry
|   +-- package.json
+-- frontend/
|   +-- public/               # Static frontend assets
|   +-- src/
|   |   +-- components/       # Shared UI components
|   |   +-- context/          # Auth and theme providers
|   |   +-- layouts/          # Public and admin layouts
|   |   +-- pages/            # Public and admin pages
|   |   +-- services/api.js   # Frontend API client
|   |   +-- main.jsx
|   +-- package.json
+-- package.json              # Root workspace scripts
+-- package-lock.json
```

## Getting Started

### Requirements

- Node.js 18 or newer
- npm
- Supabase project, if running with the production database
- SMTP account, if using email replies

### Install Dependencies

From the project root:

```bash
npm install
npm run install:all
```

You can also install each app separately:

```bash
npm install --prefix backend
npm install --prefix frontend
```

## Environment Variables

Create a backend environment file:

```bash
cp backend/.env.example backend/.env
```

Configure these values in `backend/.env`:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
JWT_SECRET=replace_with_a_long_random_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM="MAA Travels Support" your-email@example.com
```

Important: do not commit real passwords, Supabase keys, SMTP passwords, or production JWT secrets.

## Database Setup

The backend supports two modes.

### Supabase Mode

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the SQL from `backend/schema.sql`.
4. Add `SUPABASE_URL` and `SUPABASE_KEY` to `backend/.env`.
5. Start the backend. The server log should show that Supabase is active.

### Local Fallback Mode

If Supabase is not configured, the backend stores data in:

```text
backend/uploads/local_db.json
```

This is useful for development and demos. It is not intended for production.

## Running the App

### Start Frontend and Backend Together

From the project root:

```bash
npm run dev
```

This runs:

- Backend API on `http://localhost:5000`
- Frontend app on the Vite dev server, usually `http://localhost:5173`

### Start Separately

Backend:

```bash
npm run backend
```

Frontend:

```bash
npm run frontend
```

### Production Build

```bash
npm run build --prefix frontend
```

Preview the frontend build:

```bash
npm run preview --prefix frontend
```

## Frontend Routes

### Public Routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/fleet` | Fleet |
| `/contact` | Contact and inquiry form |

### Admin Routes

| Route | Page |
| --- | --- |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Dashboard overview |
| `/admin/dashboard/vehicles` | Vehicle management |
| `/admin/dashboard/clients` | Client management |
| `/admin/dashboard/contracts` | Contract management |
| `/admin/dashboard/payments` | Payment entries |
| `/admin/dashboard/reports` | Reports and financial exports |

## Backend API

Base URL:

```text
http://localhost:5000/api
```

The frontend API client is defined in `frontend/src/services/api.js`.

### Main API Groups

| API Group | Purpose |
| --- | --- |
| `/api/auth` | Admin login and current user session |
| `/api/vehicles` | Owned fleet CRUD and vehicle image upload |
| `/api/clients` | Hired vehicle owner/client CRUD and document upload |
| `/api/contracts` | Contract listing, template upload, latest terms, PDF/DOCX generation |
| `/api/payments` | Payment ledger CRUD and filtering |
| `/api/inquiries` | Contact form submissions, replies, and status updates |
| `/api/reports` | Dashboard analytics and Excel/PDF exports |
| `/api/cron/keep-alive` | Lightweight keep-alive endpoint for uptime or Supabase pings |

## Admin Workflow

1. Log in at `/admin/login`.
2. Add vehicles in Vehicle Management.
3. Add hired vehicle owner/client details in Client Management.
4. Generate contracts from Contract Management.
5. Add monthly payment entries in Payment Entries.
6. Track paid and pending amounts from the dashboard.
7. Use Reports to filter ledger records and download Excel or PDF files.
8. Review customer inquiries from the dashboard and send email replies.

## Exports and Documents

### Contracts

Contract Management can generate:

- PDF contracts
- Word `.docx` contracts

The backend can use the MAA Travels logo from the frontend public assets when generating letterhead-style documents.

### Reports

Reports can be filtered by:

- Search text
- Start date
- End date
- Paid/Pending status

Reports can be exported as:

- Excel `.xlsx`
- PDF `.pdf`

## Development Notes

- The frontend currently points to `http://localhost:5000/api` in `frontend/src/services/api.js`.
- Uploaded files are served by the backend from `/uploads`.
- JWT tokens and user details are stored in browser `localStorage`.
- Auth failures redirect protected admin pages back to `/admin/login`.
- The backend creates `backend/uploads` automatically on startup.
- Supabase keep-alive runs every 12 hours when Supabase is configured.

## Useful Commands

```bash
# Install everything
npm run install:all

# Run frontend and backend together
npm run dev

# Run backend only
npm run backend

# Run frontend only
npm run frontend

# Build frontend
npm run build --prefix frontend

# Lint frontend
npm run lint --prefix frontend
```

## Deployment Notes

### Backend

- Deploy the `backend` folder to a Node.js hosting provider.
- Set all backend environment variables on the hosting platform.
- Use a real `JWT_SECRET`.
- Use a Supabase service role key only on the backend, never in the browser.
- Configure CORS to allow only the deployed frontend domain.

### Frontend

- Build the frontend with `npm run build --prefix frontend`.
- Deploy `frontend/dist` to a static hosting provider.
- Update the API base URL in `frontend/src/services/api.js` or move it to a Vite environment variable before production deployment.

## Security Checklist

- Replace all default admin credentials.
- Rotate any credentials that were ever committed or shared.
- Keep `.env` files out of Git.
- Use a long random `JWT_SECRET`.
- Restrict CORS in production.
- Store SMTP passwords as app passwords or provider-managed secrets.
- Review Supabase Row Level Security before exposing any direct client access.
- Avoid committing uploaded documents, local databases, build outputs, or private customer data.

## License

No license file is currently included. Add one before distributing or open-sourcing the project.
