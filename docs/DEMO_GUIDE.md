# Enterprise Resource Planning (ERP) Management System - Demonstration Guide

This guide provides a structured 5–10 minute demonstration sequence for presenting the MERN Stack ERP Management System for academic or executive review.

---

## Prerequisites & Setup
1. Ensure MongoDB is running and connected.
2. Seed demo accounts using: `node backend/seedDemoAccounts.js`.
3. Start backend server: `cd backend && npm run dev` (Port 5000 / 3000).
4. Start frontend development server: `cd frontend && npm run dev` (Port 5173).

---

## 10-Step Demonstration Sequence

### Step 1: Super Admin Login & Dashboard Overview
- **User Role**: `SUPER_ADMIN` (`superadmin@erp.com`)
- **Page / Menu**: `/login` -> `/dashboard`
- **Action**: Login using demo credentials and view the main admin dashboard.
- **Expected Result**: Dashboard loads successfully with real-time analytics, statistics cards, and charts reflecting active database records.
- **Verification**: Verified (`PASS`).

### Step 2: Employee Creation
- **User Role**: `SUPER_ADMIN` or `HR_MANAGER` (`hr@erp.com`)
- **Page / Menu**: `/employees` -> Click "Add Employee"
- **Action**: Fill in employee details (Full Name, Email, Department, Designation, Salary, Date of Joining) and submit.
- **Expected Result**: Employee record is created in MongoDB and displayed in the employee directory table.
- **Verification**: Verified (`PASS`).

### Step 3: Department Management
- **User Role**: `HR_MANAGER` / `SUPER_ADMIN`
- **Page / Menu**: `/departments`
- **Action**: View existing departments or create a new department (e.g., "Research & Development", Code: "RND").
- **Expected Result**: Department is successfully registered and linked to organizational structures.
- **Verification**: Verified (`PASS`).

### Step 4: Attendance Tracking
- **User Role**: `EMPLOYEE` (`employee@erp.com`) or `HR_MANAGER`
- **Page / Menu**: `/attendance` -> "Check In"
- **Action**: Click "Check In" to record daily attendance. Try checking in a second time on the same day.
- **Expected Result**: First check-in succeeds with `PRESENT` status and timestamp recorded. Duplicate check-in is prevented.
- **Verification**: Verified (`PASS`).

### Step 5: Leave Request & Approval Workflow
- **User Role**: 
  1. `EMPLOYEE`: Go to `/leaves` -> "Apply Leave" (Submit Annual Leave).
  2. `HR_MANAGER`: Go to `/leaves` -> Review pending request -> Click "Approve".
- **Expected Result**: Leave request status changes from `PENDING` to `APPROVED`.
- **Verification**: Verified (`PASS`).

### Step 6: Projects and Task Assignment
- **User Role**: `HR_MANAGER` / `SUPER_ADMIN`
- **Page / Menu**: `/projects` -> Create Project -> `/tasks` -> Assign Task to Employee.
- **Expected Result**: Project is created, and task is successfully assigned with priority and due date.
- **Verification**: Verified (`PASS`).

### Step 7: Customer Management & Sales Orders
- **User Role**: `SALES_MANAGER` (`sales@erp.com`)
- **Page / Menu**: `/customers` -> Add Customer -> `/sales-orders` -> Create Order.
- **Expected Result**: Customer profile created, and sales order successfully links customer, items, and calculates total amount.
- **Verification**: Verified (`PASS`).

### Step 8: Inventory Management & Stock Updates
- **User Role**: `INVENTORY_MANAGER` (`inventory@erp.com`)
- **Page / Menu**: `/inventory` -> Products -> Stock-In / Stock-Out.
- **Expected Result**: Product stock levels update in real-time, and stock movements are audited in the database.
- **Verification**: Verified (`PASS`).

### Step 9: Finance Transactions & Invoicing
- **User Role**: `FINANCE_MANAGER` (`finance@erp.com`)
- **Page / Menu**: `/finance` -> Add Income / Expense -> `/invoices`.
- **Expected Result**: Transactions are recorded, financial summary balance calculates correctly, and invoices are generated.
- **Verification**: Verified (`PASS`).

### Step 10: Role-Based Access Control (RBAC) Restriction Demo
- **User Role**: `EMPLOYEE` (`employee@erp.com`)
- **Page / Menu**: Attempt to navigate directly to `/finance` or `/users` (Admin/Finance routes).
- **Expected Result**: Frontend ProtectedRoute or backend API middleware blocks access, redirecting to `/unauthorized` with 403 Forbidden.
- **Verification**: Verified (`PASS`).
