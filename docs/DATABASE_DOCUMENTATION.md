# Enterprise Resource Planning (ERP) Management System - Database Documentation

This document outlines all Mongoose models, fields, data types, relationships, validation rules, and indexes present in the backend database architecture of the MERN Stack ERP Management System.

---

## 1. User Model (`User.js`)
Manages authentication credentials, system roles, and account status.
- **Fields**:
  - `email`: String (Required, Unique, Lowercase, Trimmed)
  - `password`: String (Required, Hashed with bcrypt)
  - `role`: String (Enum: `['SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'EMPLOYEE']`, Default: `EMPLOYEE`)
  - `isActive`: Boolean (Default: `true`)
  - `employee`: ObjectId (Ref: `Employee`, Optional link to employee profile)
- **Timestamps**: `createdAt`, `updatedAt`

## 2. Employee Model (`Employee.js`)
Manages comprehensive employee records and organizational metadata.
- **Fields**:
  - `employeeId`: String (Required, Unique, Trimmed)
  - `fullName`: String (Required, Trimmed)
  - `email`: String (Required, Unique, Lowercase)
  - `phone`: String (Required, Trimmed)
  - `department`: ObjectId (Ref: `Department`, Required)
  - `designation`: String (Required, Trimmed)
  - `dateOfJoining`: Date (Required, Default: `Date.now`)
  - `salary`: Number (Required, Min: `0`)
  - `reportingManager`: ObjectId (Ref: `Employee`, Optional)
  - `user`: ObjectId (Ref: `User`, Optional link to login account)
  - `employmentStatus`: String (Enum: `['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']`, Default: `ACTIVE`)
  - `profileImage`: String (URL or path)
  - `documents`: Array of Objects (Document metadata)
- **Timestamps**: `createdAt`, `updatedAt`

## 3. Department Model (`Department.js`)
Manages organizational departments.
- **Fields**:
  - `name`: String (Required, Unique, Trimmed)
  - `code`: String (Required, Unique, Uppercase, Trimmed)
  - `description`: String (Trimmed)
  - `headOfDepartment`: ObjectId (Ref: `Employee`, Optional)
- **Timestamps**: `createdAt`, `updatedAt`

## 4. Attendance Model (`Attendance.js`)
Manages employee daily check-ins, check-outs, and work hours.
- **Fields**:
  - `employee`: ObjectId (Ref: `Employee`, Required)
  - `date`: Date (Required)
  - `checkInTime`: Date (Required)
  - `checkOutTime`: Date (Optional)
  - `status`: String (Enum: `['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE']`, Default: `PRESENT`)
  - `totalWorkingHours`: Number (Default: `0`)
  - `isCorrected`: Boolean (Default: `false`)
  - `correctedBy`: ObjectId (Ref: `User`, Optional)
  - `correctionReason`: String (Optional)
- **Timestamps**: `createdAt`, `updatedAt`

## 5. Leave Model / LeaveRequest Model (`LeaveRequest.js`)
Manages employee leave requests and approvals.
- **Fields**:
  - `employee`: ObjectId (Ref: `Employee`, Required)
  - `leaveType`: String (Enum: `['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID']`, Required)
  - `startDate`: Date (Required)
  - `endDate`: Date (Required)
  - `totalDays`: Number (Required, Min: `1`)
  - `reason`: String (Required, Trimmed)
  - `status`: String (Enum: `['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']`, Default: `PENDING`)
  - `approvedBy`: ObjectId (Ref: `User`, Optional)
  - `approvalDate`: Date (Optional)
  - `rejectionReason`: String (Optional)
- **Timestamps**: `createdAt`, `updatedAt`

## 6. Project Model (`Project.js`)
Manages company projects and team allocations.
- **Fields**:
  - `name`: String (Required, Trimmed)
  - `description`: String (Trimmed)
  - `startDate`: Date (Required)
  - `endDate`: Date (Required)
  - `status`: String (Enum: `['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']`, Default: `PLANNING`)
  - `priority`: String (Enum: `['LOW', 'MEDIUM', 'HIGH', 'URGENT']`, Default: `MEDIUM`)
  - `assignedEmployees`: Array of ObjectIds (Ref: `Employee`)
  - `progress`: Number (Min: `0`, Max: `100`, Default: `0`)
- **Timestamps**: `createdAt`, `updatedAt`

## 7. Task Model (`Task.js`)
Manages tasks assigned within projects.
- **Fields**:
  - `title`: String (Required, Trimmed)
  - `description`: String (Trimmed)
  - `project`: ObjectId (Ref: `Project`, Required)
  - `assignedTo`: ObjectId (Ref: `Employee`, Required)
  - `assignedBy`: ObjectId (Ref: `Employee`, Required)
  - `dueDate`: Date (Required)
  - `status`: String (Enum: `['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']`, Default: `TODO`)
  - `priority`: String (Enum: `['LOW', 'MEDIUM', 'HIGH', 'URGENT']`, Default: `MEDIUM`)
  - `comments`: Array of Objects (`author`, `text`, `createdAt`)
  - `history`: Array of Objects
- **Timestamps**: `createdAt`, `updatedAt`

## 8. Customer Model (`Customer.js`)
Manages sales customer directory.
- **Fields**:
  - `customerId`: String (Required, Unique)
  - `name`: String (Required, Trimmed)
  - `email`: String (Required, Unique, Lowercase)
  - `phone`: String (Required)
  - `company`: String (Trimmed)
  - `address`: String
  - `taxNumber`: String
- **Timestamps**: `createdAt`, `updatedAt`

## 9. Supplier Model (`Supplier.js`)
Manages inventory suppliers.
- **Fields**:
  - `supplierId`: String (Required, Unique)
  - `name`: String (Required, Trimmed)
  - `email`: String (Required, Lowercase)
  - `phone`: String (Required)
  - `company`: String
  - `address`: String
- **Timestamps**: `createdAt`, `updatedAt`

## 10. Category Model (`Category.js`)
Manages product inventory categories.
- **Fields**:
  - `name`: String (Required, Unique, Trimmed)
  - `description`: String
- **Timestamps**: `createdAt`, `updatedAt`

## 11. Product Model (`Product.js`)
Manages inventory items and stock levels.
- **Fields**:
  - `sku`: String (Required, Unique, Uppercase)
  - `name`: String (Required, Trimmed)
  - `category`: ObjectId (Ref: `Category`, Required)
  - `supplier`: ObjectId (Ref: `Supplier`, Required)
  - `unitPrice`: Number (Required, Min: `0`)
  - `costPrice`: Number (Required, Min: `0`)
  - `currentStock`: Number (Required, Min: `0`, Default: `0`)
  - `minimumStockLevel`: Number (Required, Min: `0`, Default: `10`)
  - `unit`: String (Default: `pcs`)
- **Timestamps**: `createdAt`, `updatedAt`

## 12. StockMovement Model (`StockMovement.js`)
Audits all inventory stock ins, outs, and adjustments.
- **Fields**:
  - `product`: ObjectId (Ref: `Product`, Required)
  - `movementType`: String (Enum: `['IN', 'OUT', 'ADJUSTMENT']`, Required)
  - `quantity`: Number (Required, Min: `1`)
  - `previousStock`: Number (Required)
  - `newStock`: Number (Required)
  - `performedBy`: ObjectId (Ref: `User`, Required)
  - `reference`: String
  - `notes`: String
- **Timestamps**: `createdAt`, `updatedAt`

## 13. SalesOrder Model (`SalesOrder.js`)
Manages customer sales orders.
- **Fields**:
  - `orderNumber`: String (Required, Unique)
  - `customer`: ObjectId (Ref: `Customer`, Required)
  - `items`: Array of Objects (`product`: Ref `Product`, `quantity`: Number, `unitPrice`: Number)
  - `totalAmount`: Number (Required, Min: `0`)
  - `status`: String (Enum: `['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']`, Default: `PENDING`)
  - `orderDate`: Date (Default: `Date.now`)
- **Timestamps**: `createdAt`, `updatedAt`

## 14. Quotation Model (`Quotation.js`)
Manages customer sales quotations.
- **Fields**:
  - `quotationNumber`: String (Required, Unique)
  - `customer`: ObjectId (Ref: `Customer`, Required)
  - `items`: Array of Objects
  - `totalAmount`: Number (Required)
  - `status`: String (Enum: `['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']`, Default: `DRAFT`)
  - `validUntil`: Date (Required)
- **Timestamps**: `createdAt`, `updatedAt`

## 15. Invoice Model (`Invoice.js`)
Manages billing and invoices.
- **Fields**:
  - `invoiceNumber`: String (Required, Unique)
  - `customer`: ObjectId (Ref: `Customer`, Required)
  - `salesOrder`: ObjectId (Ref: `SalesOrder`, Optional)
  - `items`: Array of Objects
  - `totalAmount`: Number (Required)
  - `paidAmount`: Number (Default: `0`)
  - `status`: String (Enum: `['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE']`, Default: `UNPAID`)
  - `dueDate`: Date (Required)
- **Timestamps**: `createdAt`, `updatedAt`

## 16. Transaction Model (`Transaction.js`)
Manages financial income and expenses.
- **Fields**:
  - `type`: String (Enum: `['INCOME', 'EXPENSE']`, Required)
  - `amount`: Number (Required, Min: `0`)
  - `category`: String (Required)
  - `description`: String (Trimmed)
  - `date`: Date (Default: `Date.now`)
  - `recordedBy`: ObjectId (Ref: `User`, Required)
  - `referenceId`: ObjectId (Optional)
  - `referenceModel`: String (Optional)
- **Timestamps**: `createdAt`, `updatedAt`

## 17. Notification Model (`Notification.js`)
Manages user notification alerts.
- **Fields**:
  - `recipient`: ObjectId (Ref: `User`, Required)
  - `title`: String (Required)
  - `message`: String (Required)
  - `type`: String (Enum: `['INFO', 'WARNING', 'SUCCESS', 'ALERT']`, Default: `INFO`)
  - `isRead`: Boolean (Default: `false`)
- **Timestamps**: `createdAt`, `updatedAt`

## 18. ActivityLog Model (`ActivityLog.js`)
Audits system activity logs.
- **Fields**:
  - `user`: ObjectId (Ref: `User`, Required)
  - `action`: String (Required)
  - `module`: String (Required)
  - `description`: String
  - `ipAddress`: String
- **Timestamps**: `createdAt`, `updatedAt`

## 19. Announcement Model (`Announcement.js`)
Manages organization-wide announcements.
- **Fields**:
  - `title`: String (Required)
  - `content`: String (Required)
  - `author`: ObjectId (Ref: `User`, Required)
  - `targetRoles`: Array of Strings
  - `status`: String (Enum: `['DRAFT', 'PUBLISHED', 'ARCHIVED']`, Default: `DRAFT`)
  - `expiryDate`: Date (Required)
- **Timestamps**: `createdAt`, `updatedAt`
