# Database Schema Design

## 1. Department
- name: String (Required, Unique)
- description: String
- manager: ObjectId (Reference to Employee)

## 2. Employee
- employeeId: String (Required, Unique)
- firstName: String (Required)
- lastName: String (Required)
- email: String (Required, Unique)
- department: ObjectId (Reference to Department)
- position: String
- hireDate: Date
- status: String (Active, Inactive)

## 3. User
- email: String (Required, Unique)
- password: String (Required, Hashed)
- role: Enum (SUPER_ADMIN, HR_MANAGER, FINANCE_MANAGER, SALES_MANAGER, INVENTORY_MANAGER, EMPLOYEE)
- employee: ObjectId (Reference to Employee)
- isActive: Boolean (Default: true)
- resetPasswordToken: String
- resetPasswordExpires: Date
