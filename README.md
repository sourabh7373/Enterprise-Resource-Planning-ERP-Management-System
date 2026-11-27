# Enterprise Resource Planning (ERP) Management System – MERN Stack

An enterprise-grade, comprehensive Enterprise Resource Planning (ERP) Management System built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This system is designed to streamline organizational workflows, manage human resources, financial transactions, supply chain inventory, sales pipelines, project management, and reporting with robust Role-Based Access Control (RBAC).

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Key Features & Modules](#key-features--modules)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup Instructions](#installation--setup-instructions)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
    - [MongoDB Local Setup](#mongodb-local-setup)
    - [MongoDB Atlas Setup](#mongodb-atlas-setup)
7. [Environment Variables](#environment_variables)
8. [Demo Account Setup](#demo-account-setup)
9. [Project Folder Structure](#project-folder-structure)
10. [File Upload Information](#file-upload-information)
11. [Running Automated Tests](#running-automated-tests)
12. [Production Build & Deployment](#production-build--deployment)
13. [Security Considerations](#security-considerations)
14. [Troubleshooting](#troubleshooting)

---

## 1. Project Overview
The ERP Management System provides a unified platform for modern businesses to manage daily operations securely and efficiently. It features granular RBAC supporting multiple specialized manager roles (Super Admin, HR Manager, Finance Manager, Sales Manager, Inventory Manager, and Employee), real-time notifications, automated attendance tracking, leave workflows, inventory control, and advanced reporting dashboards.

---

## 2. Technology Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Lucide React, Axios, React Router.
- **Backend:** Node.js, Express.js, Helmet, CORS, Multer (file uploads).
- **Database:** MongoDB, Mongoose ODM.
- **Authentication:** JSON Web Tokens (JWT), bcrypt password hashing.
- **Testing:** Jest, Supertest.

---

## 3. Key Features & Modules
- **Authentication & Authorization:** Secure JWT login, registration, password hashing, and role-based route protection.
- **User & Employee Management:** Complete employee lifecycle management, department assignments, profile attachments, and status tracking.
- **Department Management:** Organizational unit structuring and department head assignments.
- **Attendance & Leave Management:** Daily check-in/check-out, attendance correction requests, leave application workflows (Annual, Sick, Casual), approval/rejection pipelines, and history tracking.
- **Project & Task Management:** Project milestones, task boards (Kanban-style), assignments, status tracking, and priority levels.
- **Sales & Customer Relationship Management (CRM):** Customer directory, quotations, conversion to sales orders, and sales tracking.
- **Supply Chain & Inventory Management:** Product catalogs, categories, supplier management, stock levels, stock movement history, and low-stock alerts.
- **Finance & Invoicing:** Income tracking, expense management, transaction logs, financial summaries, and invoice generation/payment processing.
- **Notifications & Announcements:** Real-time bell notifications, unread counters, broadcast announcements, and activity logging.
- **Reporting & Dashboards:** Role-specific analytics dashboards, summary reports, and CSV export capabilities.

---

## 4. User Roles & Permissions
1. **SUPER_ADMIN:** Full system access, user management, global configuration, and oversight of all modules.
2. **HR_MANAGER:** Full access to employee records, department structures, attendance management, and leave approvals.
3. **FINANCE_MANAGER:** Access to finance dashboards, income/expense management, invoicing, and transaction histories.
4. **SALES_MANAGER:** Access to customer management, quotations, sales orders, and sales analytics.
5. **INVENTORY_MANAGER:** Access to product catalogs, categories, suppliers, stock movements, and low-stock alerts.
6. **EMPLOYEE:** Access to personal dashboard, own attendance check-in/check-out, leave applications, task boards, and announcements.

---

## 5. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MongoDB (Local instance or MongoDB Atlas cluster)

---

## 6. Installation & Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in `backend/.env`.
5. Seed demo accounts (optional):
   ```bash
   node seedDemoAccounts.js
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
   *(For production mode: `npm start`)*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```

### MongoDB Local Setup
1. Ensure MongoDB service is running locally (`mongod`).
2. Set `MONGO_URI=mongodb://127.0.0.1:27017/erp_db` in `backend/.env`.

### MongoDB Atlas Setup
1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (Free tier available).
3. Create a database user with read/write privileges.
4. Configure Network Access to allow your server's IP address (or `0.0.0.0/0` for testing).
5. Obtain the SRV connection string and update `MONGO_URI` in `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
   ```

---

## 7. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
JWT_SECRET=supersecretproductionjwtkey
JWT_EXPIRES_IN=1d
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 8. Demo Account Setup
Run the automated seed script to provision demo accounts across all roles:
```bash
cd backend
node seedDemoAccounts.js
```
*(Refer to console output for demo emails and roles).*

---

## 9. Project Folder Structure
```text
Enterprise-Resource-Planning-ERP-Management-System/
├── backend/
│   ├── config/          # Database and environment configurations
│   ├── controllers/     # Business logic controllers
│   ├── middleware/      # Authentication and role authorization middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API route handlers
│   ├── testing/         # Verification reports and testing artifacts
│   ├── tests/           # Jest automated test suites
│   ├── uploads/         # Uploaded profile images and documents
│   └── server.js        # Express application entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components & navigation
│   │   ├── constants/   # Navigation and configuration constants
│   │   ├── context/     # React Context (AuthContext)
│   │   ├── layouts/     # Page layouts
│   │   ├── pages/       # Module views and dashboards
│   │   ├── App.jsx      # Root component and router configuration
│   │   ├── index.css    # Tailwind CSS styles
│   │   └── main.jsx     # React entry point
│   ├── vite.config.js   # Vite configuration
│   └── package.json     # Frontend dependencies
└── docs/                # Database documentation & ER diagrams
```

---

## 10. File Upload Information
- Uploads are handled via `multer` and stored in `backend/uploads/`.
- **Production Note:** Ephemeral container storage (like standard Heroku or Render instances) will wipe local uploads on restart. For production cloud deployments, configure cloud object storage (e.g., AWS S3, Cloudinary) to persist profile pictures and document attachments.

---

## 11. Running Automated Tests
Run backend Jest test suites:
```bash
cd backend
npm test
```
*Note: Tests utilize an isolated test database configuration to protect development and production data.*

---

## 12. Production Build & Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Serve the backend in production mode:
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```
3. For full-stack hosting, deploy the backend to a Node.js hosting provider (Render, Railway, AWS EC2) and the frontend build (`frontend/dist`) to a static hosting provider (Vercel, Netlify, AWS S3).

---

## 13. Security Considerations
- Helmet.js is used to secure HTTP headers.
- CORS is configured to restrict unauthorized cross-origin requests.
- Passwords are securely hashed using `bcrypt`.
- JWT tokens expire based on configured environment settings.
- Environment secrets are kept out of version control via `.gitignore`.

---

## 14. Troubleshooting
- **Database Connection Error:** Verify that MongoDB is running locally or that your MongoDB Atlas IP whitelist includes your current network IP.
- **CORS Errors:** Ensure `CLIENT_URL` or frontend proxy settings match your deployed frontend origin.
- **Build Failures:** Run `npm install` in both `backend` and `frontend` directories to ensure all dependency versions are synchronized.
