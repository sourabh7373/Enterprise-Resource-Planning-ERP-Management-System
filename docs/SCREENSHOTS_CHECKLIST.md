# Enterprise Resource Planning (ERP) Management System - Screenshots Checklist

This checklist outlines the key pages and UI views required for capturing screenshots during the project demonstration and academic submission.

| # | View / Page | URL / Route | Target Role | Description | Status |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Login Page** | `/login` | All Roles | Clean login screen with email, password fields, and demo quick-login buttons. | Verified |
| 2 | **Admin Dashboard** | `/dashboard` | `SUPER_ADMIN` | Overview statistics, analytics charts, system health, and quick actions. | Verified |
| 3 | **Employee Management** | `/employees` | `HR_MANAGER`, `SUPER_ADMIN` | Comprehensive employee list, profile cards, and CRUD actions. | Verified |
| 4 | **Department Management** | `/departments` | `HR_MANAGER`, `SUPER_ADMIN` | Department directory, code, description, and head assignment. | Verified |
| 5 | **Attendance Management** | `/attendance` | `HR_MANAGER`, `SUPER_ADMIN` | Attendance records, check-in/out logs, and attendance correction. | Verified |
| 6 | **Leave Workflow** | `/leaves` | `HR_MANAGER`, `SUPER_ADMIN`, `EMPLOYEE` | Leave requests list, status badges, approve/reject buttons. | Verified |
| 7 | **Projects and Tasks** | `/projects`, `/tasks` | `HR_MANAGER`, `SUPER_ADMIN`, `EMPLOYEE` | Project tracking board, task lists, status updates, and assignments. | Verified |
| 8 | **Sales & Customers** | `/customers`, `/sales-orders` | `SALES_MANAGER`, `SUPER_ADMIN` | Customer directory, quotation forms, and sales order processing. | Verified |
| 9 | **Inventory Management** | `/inventory`, `/products` | `INVENTORY_MANAGER`, `SUPER_ADMIN` | Product catalogue, stock levels, low-stock alerts, and stock movements. | Verified |
| 10 | **Finance Management** | `/finance`, `/invoices` | `FINANCE_MANAGER`, `SUPER_ADMIN` | Income/expense transactions, ledger summary, balance calculation, and invoices. | Verified |
| 11 | **Notifications** | `/notifications` | All Roles | Notification drop-down and list with read/unread toggle. | Verified |
| 12 | **Reports & Analytics** | `/reports` | Managers & Admin | Statistical reports, date filters, and CSV export functionality. | Verified |
| 13 | **Restricted Access / Unauthorized** | `/unauthorized` | `EMPLOYEE` | Access denied view when employee attempts restricted admin/finance routes. | Verified |
