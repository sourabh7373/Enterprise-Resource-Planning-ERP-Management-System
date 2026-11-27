# Database Documentation – Enterprise Resource Planning (ERP) System

This document provides a comprehensive technical overview of all Mongoose models, schemas, data types, validation rules, timestamps, and relationships in the ERP Management System.

---

## 1. Mongoose Models Overview

### 1. User
- **Purpose:** Manages system authentication credentials, roles, and access control.
- **Fields:**
  - `fullName` (String, Required)
  - `email` (String, Required, Unique)
  - `password` (String, Required, Hashed via bcrypt)
  - `role` (Enum: `['SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'EMPLOYEE']`, Default: `'EMPLOYEE'`)
- **Timestamps:** Yes (`createdAt`, `updatedAt`)

### 2. Employee
- **Purpose:** Stores detailed personnel, employment, and HR records linked to a system User.
- **Fields:**
  - `user` (ObjectId, Ref: `User`, Required)
  - `employeeId` (String, Required, Unique)
  - `department` (ObjectId, Ref: `Department`, Required)
  - `designation` (String, Required)
  - `phone` (String)
  - `address` (String)
  - `dateOfJoining` (Date, Default: `Date.now`)
  - `salary` (Number, Required)
  - `employmentStatus` (Enum: `['ACTIVE', 'PROBATION', 'TERMINATED', 'RESIGNED']`, Default: `'ACTIVE'`)
  - `profileImage` (String)
  - `documents` (Array of Objects: `[{ title, path, uploadDate }]`)
- **Timestamps:** Yes

### 3. Department
- **Purpose:** Organizes employees into functional corporate divisions.
- **Fields:**
  - `name` (String, Required, Unique)
  - `code` (String, Required, Unique)
  - `description` (String)
  - `departmentHead` (ObjectId, Ref: `Employee`)
- **Timestamps:** Yes

### 4. Attendance
- **Purpose:** Tracks daily check-in, check-out, working hours, status, and correction requests.
- **Fields:**
  - `employee` (ObjectId, Ref: `Employee`, Required)
  - `date` (Date, Required)
  - `checkIn` (Date)
  - `checkOut` (Date)
  - `status` (Enum: `['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']`, Default: `'PRESENT'`)
  - `workingHours` (Number)
  - `correctionRequested` (Boolean, Default: `false`)
  - `correctionReason` (String)
  - `correctionStatus` (Enum: `['PENDING', 'APPROVED', 'REJECTED']`)
- **Timestamps:** Yes

### 5. Leave / LeaveRequest
- **Purpose:** Manages employee leave applications and manager approval workflows.
- **Fields:**
  - `employee` (ObjectId, Ref: `Employee`, Required)
  - `leaveType` (Enum: `['ANNUAL', 'SICK', 'CASUAL', 'UNPAID']`, Required)
  - `startDate` (Date, Required)
  - `endDate` (Date, Required)
  - `reason` (String, Required)
  - `status` (Enum: `['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']`, Default: `'PENDING'`)
  - `approvedBy` (ObjectId, Ref: `User`)
  - `remarks` (String)
- **Timestamps:** Yes

### 6. Project
- **Purpose:** Manages organizational projects and team assignments.
- **Fields:**
  - `name` (String, Required)
  - `description` (String)
  - `client` (ObjectId, Ref: `Customer`)
  - `startDate` (Date)
  - `endDate` (Date)
  - `budget` (Number)
  - `status` (Enum: `['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']`, Default: `'PLANNING'`)
  - `teamMembers` (Array of ObjectIds, Ref: `Employee`)
- **Timestamps:** Yes

### 7. Task
- **Purpose:** Tracks granular task execution within projects.
- **Fields:**
  - `title` (String, Required)
  - `description` (String)
  - `project` (ObjectId, Ref: `Project`, Required)
  - `assignedTo` (ObjectId, Ref: `Employee`, Required)
  - `priority` (Enum: `['LOW', 'MEDIUM', 'HIGH', 'URGENT']`, Default: `'MEDIUM'`)
  - `status` (Enum: `['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']`, Default: `'TODO'`)
  - `dueDate` (Date)
- **Timestamps:** Yes

### 8. Customer
- **Purpose:** Manages CRM customer accounts and contact information.
- **Fields:**
  - `name` (String, Required)
  - `companyName` (String)
  - `email` (String, Required, Unique)
  - `phone` (String)
  - `address` (String)
  - `status` (Enum: `['ACTIVE', 'INACTIVE', 'LEAD']`, Default: `'ACTIVE'`)
- **Timestamps:** Yes

### 9. Quotation
- **Purpose:** Tracks sales quotations issued to customers before order confirmation.
- **Fields:**
  - `quotationNumber` (String, Required, Unique)
  - `customer` (ObjectId, Ref: `Customer`, Required)
  - `items` (Array of Objects: `[{ product, quantity, unitPrice, total }]`)
  - `subtotal` (Number, Required)
  - `tax` (Number, Default: 0)
  - `totalAmount` (Number, Required)
  - `validUntil` (Date)
  - `status` (Enum: `['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED']`, Default: `'DRAFT'`)
- **Timestamps:** Yes

### 10. SalesOrder
- **Purpose:** Represents confirmed sales orders converted from quotations.
- **Fields:**
  - `orderNumber` (String, Required, Unique)
  - `quotation` (ObjectId, Ref: `Quotation`)
  - `customer` (ObjectId, Ref: `Customer`, Required)
  - `items` (Array of Objects: `[{ product, quantity, unitPrice, total }]`)
  - `totalAmount` (Number, Required)
  - `orderStatus` (Enum: `['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']`, Default: `'PENDING'`)
  - `paymentStatus` (Enum: `['PENDING', 'PARTIAL', 'PAID']`, Default: `'PENDING'`)
- **Timestamps:** Yes

### 11. Category
- **Purpose:** Categorizes inventory products.
- **Fields:**
  - `name` (String, Required, Unique)
  - `description` (String)
- **Timestamps:** Yes

### 12. Supplier
- **Purpose:** Manages product suppliers and vendors.
- **Fields:**
  - `name` (String, Required)
  - `contactPerson` (String)
  - `email` (String)
  - `phone` (String)
  - `address` (String)
- **Timestamps:** Yes

### 13. Product
- **Purpose:** Stores inventory product catalog details, pricing, and stock thresholds.
- **Fields:**
  - `name` (String, Required)
  - `sku` (String, Required, Unique)
  - `category` (ObjectId, Ref: `Category`, Required)
  - `supplier` (ObjectId, Ref: `Supplier`)
  - `costPrice` (Number, Required)
  - `sellingPrice` (Number, Required)
  - `stockQuantity` (Number, Default: 0)
  - `minStockLevel` (Number, Default: 5)
- **Timestamps:** Yes

### 14. StockMovement
- **Purpose:** Audits inventory stock adjustments (IN/OUT/ADJUSTMENT).
- **Fields:**
  - `product` (ObjectId, Ref: `Product`, Required)
  - `type` (Enum: `['IN', 'OUT', 'ADJUSTMENT']`, Required)
  - `quantity` (Number, Required)
  - `reference` (String)
  - `performedBy` (ObjectId, Ref: `User`)
  - `notes` (String)
- **Timestamps:** Yes

### 15. Transaction (Income / Expense)
- **Purpose:** Tracks financial income and expense ledger entries.
- **Fields:**
  - `type` (Enum: `['INCOME', 'EXPENSE']`, Required)
  - `category` (String, Required)
  - `amount` (Number, Required)
  - `paymentMethod` (Enum: `['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHEQUE']`, Default: `'BANK_TRANSFER'`)
  - `paymentDate` (Date, Default: `Date.now`)
  - `paymentStatus` (Enum: `['PENDING', 'PAID', 'CANCELLED']`, Default: `'PAID'`)
  - `description` (String)
  - `recordedBy` (ObjectId, Ref: `User`)
- **Timestamps:** Yes

### 16. Invoice
- **Purpose:** Manages customer billing and payment collection.
- **Fields:**
  - `invoiceNumber` (String, Required, Unique)
  - `salesOrder` (ObjectId, Ref: `SalesOrder`)
  - `customer` (ObjectId, Ref: `Customer`, Required)
  - `items` (Array of Objects)
  - `totalAmount` (Number, Required)
  - `paidAmount` (Number, Default: 0)
  - `status` (Enum: `['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE']`, Default: `'UNPAID'`)
  - `dueDate` (Date)
- **Timestamps:** Yes

### 17. Notification
- **Purpose:** Delivers real-time notifications to users.
- **Fields:**
  - `recipient` (ObjectId, Ref: `User`, Required)
  - `title` (String, Required)
  - `message` (String, Required)
  - `isRead` (Boolean, Default: `false`)
  - `link` (String)
- **Timestamps:** Yes

### 18. Announcement
- **Purpose:** Broadcasts organization-wide announcements.
- **Fields:**
  - `title` (String, Required)
  - `content` (String, Required)
  - `author` (ObjectId, Ref: `User`, Required)
- **Timestamps:** Yes

### 19. ActivityLog
- **Purpose:** Audit trail for security and administrative actions.
- **Fields:**
  - `user` (ObjectId, Ref: `User`)
  - `action` (String, Required)
  - `module` (String, Required)
  - `details` (String)
- **Timestamps:** Yes

---

## 2. Core Relational Mapping
- `User` (1) ── (1) `Employee`
- `Department` (1) ── (Many) `Employee`
- `Employee` (1) ── (Many) `Attendance`
- `Employee` (1) ── (Many) `Leave`
- `Customer` (1) ── (Many) `Project`
- `Project` (1) ── (Many) `Task`
- `Employee` (1) ── (Many) `Task` (Assigned)
- `Customer` (1) ── (Many) `Quotation`
- `Quotation` (1) ── (1) `SalesOrder`
- `Customer` (1) ── (Many) `SalesOrder`
- `Category` (1) ── (Many) `Product`
- `Supplier` (1) ── (Many) `Product`
- `Product` (1) ── (Many) `StockMovement`
- `SalesOrder` (1) ── (1) `Invoice`
- `User` (1) ── (Many) `Notification`
