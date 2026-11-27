# Enterprise Resource Planning (ERP) Management System - ER Diagram

This Entity-Relationship (ER) diagram models the database schema of the MERN Stack ERP Management System using Mermaid.js. It represents all existing Mongoose models and their active relationships.

```mermaid
erDiagram
    User {
        ObjectId _id PK
        string email UK
        string password
        string role "SUPER_ADMIN | HR_MANAGER | FINANCE_MANAGER | SALES_MANAGER | INVENTORY_MANAGER | EMPLOYEE"
        boolean isActive
        ObjectId employee FK "Refers to Employee"
        timestamp createdAt
        timestamp updatedAt
    }

    Employee {
        ObjectId _id PK
        string employeeId UK
        string fullName
        string email UK
        string phone
        ObjectId department FK "Refers to Department"
        string designation
        date dateOfJoining
        number salary
        ObjectId reportingManager FK "Refers to Employee"
        ObjectId user FK "Refers to User"
        string employmentStatus "ACTIVE | ON_LEAVE | TERMINATED | RESIGNED"
        string profileImage
        array documents
    }

    Department {
        ObjectId _id PK
        string name UK
        string code UK
        string description
        ObjectId headOfDepartment FK "Refers to Employee"
    }

    Attendance {
        ObjectId _id PK
        ObjectId employee FK "Refers to Employee"
        date date
        timestamp checkInTime
        timestamp checkOutTime
        string status "PRESENT | ABSENT | HALF_DAY | LATE"
        number totalWorkingHours
        boolean isCorrected
        ObjectId correctedBy FK "Refers to User"
        string correctionReason
    }

    Leave {
        ObjectId _id PK
        ObjectId employee FK "Refers to Employee"
        string leaveType "ANNUAL | SICK | CASUAL | MATERNITY | PATERNITY | UNPAID"
        date startDate
        date endDate
        number totalDays
        string reason
        string status "PENDING | APPROVED | REJECTED | CANCELLED"
        ObjectId approvedBy FK "Refers to User"
        timestamp approvalDate
        string rejectionReason
    }

    Project {
        ObjectId _id PK
        string name
        string description
        date startDate
        date endDate
        string status "PLANNING | IN_PROGRESS | COMPLETED | ON_HOLD"
        string priority "LOW | MEDIUM | HIGH | URGENT"
        array assignedEmployees "Array of Employee FK"
        number progress
    }

    Task {
        ObjectId _id PK
        string title
        string description
        ObjectId project FK "Refers to Project"
        ObjectId assignedTo FK "Refers to Employee"
        ObjectId assignedBy FK "Refers to Employee"
        date dueDate
        string status "TODO | IN_PROGRESS | REVIEW | COMPLETED"
        string priority "LOW | MEDIUM | HIGH | URGENT"
        array comments
        array history
    }

    Customer {
        ObjectId _id PK
        string customerId UK
        string name
        string email UK
        string phone
        string company
        string address
        string taxNumber
    }

    Supplier {
        ObjectId _id PK
        string supplierId UK
        string name
        string email
        string phone
        string company
        string address
    }

    Product {
        ObjectId _id PK
        string sku UK
        string name
        ObjectId category FK "Refers to Category"
        ObjectId supplier FK "Refers to Supplier"
        number unitPrice
        number costPrice
        number currentStock
        number minimumStockLevel
        string unit
    }

    Category {
        ObjectId _id PK
        string name UK
        string description
    }

    StockMovement {
        ObjectId _id PK
        ObjectId product FK "Refers to Product"
        string movementType "IN | OUT | ADJUSTMENT"
        number quantity
        number previousStock
        number newStock
        ObjectId performedBy FK "Refers to User"
        string reference
        string notes
    }

    SalesOrder {
        ObjectId _id PK
        string orderNumber UK
        ObjectId customer FK "Refers to Customer"
        array items "Product references & quantities"
        number totalAmount
        string status "PENDING | PROCESSING | COMPLETED | CANCELLED"
        date orderDate
    }

    Quotation {
        ObjectId _id PK
        string quotationNumber UK
        ObjectId customer FK "Refers to Customer"
        array items
        number totalAmount
        string status "DRAFT | SENT | ACCEPTED | REJECTED"
        date validUntil
    }

    Invoice {
        ObjectId _id PK
        string invoiceNumber UK
        ObjectId customer FK "Refers to Customer"
        ObjectId salesOrder FK "Refers to SalesOrder"
        array items
        number totalAmount
        number paidAmount
        string status "UNPAID | PARTIAL | PAID | OVERDUE"
        date dueDate
    }

    Transaction {
        ObjectId _id PK
        string type "INCOME | EXPENSE"
        number amount
        string category
        string description
        date date
        ObjectId recordedBy FK "Refers to User"
        ObjectId referenceId
        string referenceModel
    }

    Notification {
        ObjectId _id PK
        ObjectId recipient FK "Refers to User"
        string title
        string message
        string type "INFO | WARNING | SUCCESS | ALERT"
        boolean isRead
        timestamp createdAt
    }

    ActivityLog {
        ObjectId _id PK
        ObjectId user FK "Refers to User"
        string action
        string module
        string description
        string ipAddress
        timestamp createdAt
    }

    Announcement {
        ObjectId _id PK
        string title
        string content
        ObjectId author FK "Refers to User"
        array targetRoles
        string status "DRAFT | PUBLISHED | ARCHIVED"
        date expiryDate
        timestamp createdAt
    }

    %% Relationships
    User ||--o| Employee : "links to"
    Employee }--o| Department : "belongs to"
    Department }--o| Employee : "head of department"
    Employee ||--o{ Attendance : "records"
    User ||--o| Attendance : "corrects"
    Employee ||--o{ Leave : "requests"
    User ||--o| Leave : "approves/rejects"
    Project ||--o{ Task : "contains"
    Employee ||--o{ Task : "assignedTo / assignedBy"
    Employee }--o{ Project : "assignedEmployees"
    Product }--o| Category : "belongs to"
    Product }--o| Supplier : "supplied by"
    Product ||--o{ StockMovement : "tracks"
    User ||--o| StockMovement : "performs"
    Customer ||--o{ SalesOrder : "places"
    SalesOrder ||--o{ Product : "contains items"
    Customer ||--o{ Quotation : "receives"
    Customer ||--o{ Invoice : "billed in"
    SalesOrder ||--o| Invoice : "generates"
    User ||--o| Transaction : "records"
    User ||--o{ Notification : "receives"
    User ||--o{ ActivityLog : "performs"
    User ||--o| Announcement : "authors"
```
