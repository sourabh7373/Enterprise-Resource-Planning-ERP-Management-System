# Entity Relationship (ER) Diagram – ERP Management System

This document illustrates the entity relationships across the Mongoose models in the ERP system using Mermaid.

---

## Mermaid ER Diagram

```mermaid
erDiagram
    User ||--o{ Employee : "has profile"
    User ||--o{ Notification : receives
    User ||--o{ Announcement : authors
    User ||--o{ ActivityLog : generates
    
    Department ||--o{ Employee : contains
    Employee ||--o{ Attendance : logs
    Employee ||--o{ Leave : applies
    Employee ||--o{ Task : assigned
    
    Customer ||--o{ Project : commissions
    Customer ||--o{ Quotation : receives
    Customer ||--o{ SalesOrder : places
    Customer ||--o{ Invoice : billed
    
    Project ||--o{ Task : contains
    Project }o--o{ Employee : "team members"
    
    Category ||--o{ Product : categorizes
    Supplier ||--o{ Product : supplies
    Product ||--o{ StockMovement : tracks
    Product ||--o{ Quotation : "itemized in"
    Product ||--o{ SalesOrder : "itemized in"
    
    Quotation ||--o| SalesOrder : converts
    SalesOrder ||--o| Invoice : generates
```
