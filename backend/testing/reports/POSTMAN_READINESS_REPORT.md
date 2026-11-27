# Postman Collection & Environment Readiness Report (Day 13)

## Executive Summary
This report provides a comprehensive inspection and readiness assessment of the Day 13 Postman Collection (`backend/testing/postman/ERP_Postman_Collection.json`) and Environment (`backend/testing/postman/ERP_Postman_Environment.json`) for the Enterprise Resource Planning (ERP) Management System.

---

## 1. Collection & Environment Validity
- **JSON Validity**: Both `ERP_Postman_Collection.json` and `ERP_Postman_Environment.json` are fully valid JSON documents conforming to Postman Collection v2.1.0 schema standards.
- **Import Readiness**: **YES**, the collection and environment are **ready to import** directly into Postman.

---

## 2. API Endpoints & Coverage Analysis
The collection covers core ERP modules including Authentication, User Management, Employees, Departments, Attendance, Leaves, Projects, Tasks, Customers, Sales, Inventory, Finance, Invoices, Notifications, Announcements, Reports, and Security Tests.

### Missing/Note on Automatic JWT Token Storage
- Currently, individual requests manually reference `Bearer {{accessToken}}` in headers. 
- **Recommendation**: To enable automatic JWT token storage upon login, add a **Tests script** to the **Login** request:
  ```javascript
  var jsonData = pm.response.json();
  if (jsonData.token) {
      pm.environment.set("accessToken", jsonData.token);
  }
  ```

---

## 3. Six User Roles & Test Accounts
The environment configures demo accounts for all six ERP roles:
1. **Admin**: `admin@erp.com` (`{{testAdminEmail}}`) / `admin123`
2. **HR Manager**: `hr@erp.com` (`{{testHREmail}}`) / `hr123`
3. **Employee**: `employee@erp.com` (`{{testEmployeeEmail}}`) / `employee123`
4. **Finance Manager**: `finance@erp.com` (`{{testFinanceEmail}}`) / `finance123`
5. **Sales Representative**: `sales@erp.com` (`{{testSalesEmail}}`) / `sales123`
6. **Inventory Manager**: `inventory@erp.com` (`{{testInventoryEmail}}`) / `inventory123`

---

## 4. Execution Guidelines

### Which Requests to Run First
1. **Import** both `ERP_Postman_Collection.json` and `ERP_Postman_Environment.json` into Postman.
2. Select the **ERP Environment (Day 13)** in the Postman environment dropdown.
3. Run **1. Authentication > Login** using Admin credentials to populate `{{accessToken}}`.
4. Run **1. Authentication > Get Current User** (`GET /api/auth/me`) to verify token validity.

### Which Requests Require a Different User Account
- **HR-specific endpoints** (Leave approvals, employee management) require switching the environment variables `{{testAdminEmail}}` / `{{testAdminPassword}}` to HR credentials (`hr@erp.com` / `hr123`) and re-running **Login**.
- **Finance-specific endpoints** (`/api/finance/*`, `/api/invoices`) require Finance credentials (`finance@erp.com` / `finance123`).
- **Sales-specific endpoints** (`/api/sales-orders`, `/api/customers`) require Sales credentials (`sales@erp.com` / `sales123`).
- **Inventory-specific endpoints** (`/api/products`) require Inventory credentials (`inventory@erp.com` / `inventory123`).
- **Self-service endpoints** (`/api/attendance/check-in`, `/api/leaves` submission) can be tested with Employee credentials (`employee@erp.com` / `employee123`).

### Which Requests Should Be Skipped (During Initial Smoke Testing)
- **Destructive/State-Modifying Requests** (e.g., `DELETE` requests or record creation without test isolation) should be skipped unless testing write operations specifically against an isolated database.
- **Advanced Security Negative Tests** involving missing tokens or unauthorized roles if running live smoke tests on production-like environments (though safe on test databases).

---

## 5. State-Modifying & Destructive Requests Identification
- **State-Modifying (Create/Update)**:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `POST /api/attendance/check-in`
  - `POST /api/attendance/check-out`
- **Destructive / Unsafe to Execute without Isolation**:
  - Any future `DELETE /api/*` or bulk seed/reset endpoints.
  - *Marked as unsafe*: Execution will mutate database records and should **only** be run against `erp_test_db`.

---

## 6. Environment Variables & Security Verification
- **Hardcoded Secrets**: Verified. No real production tokens, API keys, or live credentials exist in the environment file. Placeholders (`YOUR_JWT_TOKEN_HERE`) and standard local test credentials are used.
- **Base URL**: Set to `http://localhost:5000` (`{{baseUrl}}`).

---

## 7. How to Run the Collection Safely Against `erp_test_db`
To ensure zero impact on production data (`erp_db`):
1. Ensure your backend `.env` or test configuration points the database URI to `erp_test_db` (e.g., `MONGO_URI=mongodb://localhost:27017/erp_test_db` or equivalent test environment config).
2. Start the backend server in test mode:
   ```bash
   NODE_ENV=test npm run start
   ```
   *(Or run integration/unit test suites via `npm test`)*
3. Execute read-only requests (`GET /api/*`) first.
4. Execute state-modifying requests (`POST /api/attendance/check-in`) only after verifying the test database is active and isolated.
5. **Do not connect to or execute destructive requests against development database `erp_db`.**

---
*Report generated successfully for Day 13 Postman verification.*
