# Enterprise Resource Planning (ERP) Management System - Test Cases

This document records the test cases covering authentication, RBAC, module-by-module CRUD operations, and data integrity for the MERN Stack ERP Management System.

| Test ID | Module | Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Authentication | Login with valid Super Admin credentials | Returns JWT token and role `SUPER_ADMIN` | Verified successfully | **PASS** |
| **TC-AUTH-02** | Authentication | Login with valid HR Manager credentials | Returns JWT token and role `HR_MANAGER` | Verified successfully | **PASS** |
| **TC-AUTH-03** | Authentication | Login with incorrect password | Returns 401 Unauthorized with error message | Verified successfully | **PASS** |
| **TC-AUTH-04** | RBAC | Employee attempts to access User Management API | Returns 403 Forbidden | Verified successfully | **PASS** |
| **TC-AUTH-05** | RBAC | Finance Manager attempts to create a Product in Inventory | Returns 403 Forbidden | Verified successfully | **PASS** |
| **TC-EMP-01** | Employee | Super Admin creates a new Employee profile | Returns 201 Created with employee record | Verified successfully | **PASS** |
| **TC-EMP-02** | Employee | Retrieve employee list | Returns array of employee records | Verified successfully | **PASS** |
| **TC-DEPT-01** | Department | Create a new department with unique code | Returns 201 Created | Verified successfully | **PASS** |
| **TC-ATT-01** | Attendance | Employee checks in for the day | Creates attendance record with `PRESENT` status | Verified successfully | **PASS** |
| **TC-ATT-02** | Attendance | Employee checks in twice on the same day | Prevents duplicate check-in or updates check-out | Verified successfully | **PASS** |
| **TC-LEAVE-01** | Leave | Employee submits a leave request | Creates leave request with `PENDING` status | Verified successfully | **PASS** |
| **TC-LEAVE-02** | Leave | HR Manager approves a leave request | Updates status to `APPROVED` and records approver | Verified successfully | **PASS** |
| **TC-PROJ-01** | Projects & Tasks | HR/Admin creates a project and assigns employees | Returns 201 Created with project details | Verified successfully | **PASS** |
| **TC-TASK-01** | Projects & Tasks | Create a task assigned to an employee within a project | Returns 201 Created | Verified successfully | **PASS** |
| **TC-CUST-01** | Sales & Customers | Create a customer record | Returns 201 Created | Verified successfully | **PASS** |
| **TC-SALES-01** | Sales & Orders | Create a sales order referencing a customer and products | Returns 201 Created and calculates total amount | Verified successfully | **PASS** |
| **TC-INV-01** | Inventory | Add a new product category and product | Returns 201 Created | Verified successfully | **PASS** |
| **TC-INV-02** | Inventory | Perform stock-in and stock-out operations | Updates current stock and records stock movement | Verified successfully | **PASS** |
| **TC-INV-03** | Inventory | Stock-out exceeding available stock | Returns 400 Bad Request (Insufficient stock) | Verified successfully | **PASS** |
| **TC-FIN-01** | Finance | Record income and expense transactions | Returns 201 Created and updates finance ledger | Verified successfully | **PASS** |
| **TC-FIN-02** | Finance | Retrieve financial summary and balance calculations | Returns total income, total expense, and net balance | Verified successfully | **PASS** |
| **TC-REP-01** | Reports | Generate attendance and finance reports | Returns aggregated JSON data and CSV export | Verified successfully | **PASS** |
| **TC-NOTIF-01** | Notifications | System generates notification on low stock or leave submission | Notification stored in database and retrieved by recipient | Verified successfully | **PASS** |
