# Authentication and Database Documentation

## User and Employee Relationship
- The `User` model handles authentication credentials (email, password, role, status).
- The `Employee` model stores personal and professional information (employeeId, name, department, position, hireDate).
- A `User` document has an optional `employee` field that references an `Employee` document via `ObjectId`. This allows separating login credentials from employee records.

## Department Relationship
- The `Department` model stores department details.
- The `Employee` model has a `department` field that references a `Department` document via `ObjectId`.
- The `Department` model has a `manager` field that references an `Employee` document, establishing a link between departments and their managers.

## Authentication Workflow
1. **Login**: User provides email and password. The system verifies credentials, checks if the account is active, and returns a JWT token.
2. **Protected Routes**: Middleware `protect` verifies the JWT token in the `Authorization` header. It fetches the user and checks if the account is still active.
3. **Password Change**: Authenticated users can change their password by providing the current and new password.
4. **Forgot Password**: User provides an email. If the user exists, a secure, hashed reset token is generated and stored with an expiration time.
5. **Reset Password**: User provides the reset token and a new password. The system verifies the token's validity and expiration before updating the password.

## Database Indexes
- `User`: `email` (unique, lowercase, trimmed).
- `Employee`: `employeeId` (unique, trimmed), `email` (unique, lowercase, trimmed).
- `Department`: `name` (unique, trimmed).
- Timestamps are enabled on all models for tracking creation and updates.
