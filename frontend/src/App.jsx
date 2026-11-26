import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import {
  Dashboard,
  Employees,
  EmployeeForm,
  EmployeeDetails,
  Departments,
  DepartmentForm,
  Attendance,
  MyAttendance,
  AttendanceHistory,
  AttendanceManagement,
  AttendanceReport,
  Leaves,
  ApplyLeave,
  LeaveDetails,
  Tasks,
  TaskForm,
  ProjectList,
  ProjectForm,
  ProjectDetails,
  Sales,
  Inventory,
  ProductList,
  ProductForm,
  CategoryManagement,
  SupplierManagement,
  StockManagement,
  StockMovementHistory,
  LowStockAlerts,
  CustomerList,
  CustomerForm,
  CustomerDetails,
  QuotationList,
  QuotationForm,
  QuotationDetails,
  SalesOrderList,
  SalesOrderDetails,
  SalesOrderForm
} from './pages';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login & Register Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Main Layout Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />

              <Route element={<RoleBasedRoute allowedRoles={['HR_MANAGER', 'SUPER_ADMIN']} />}>
                <Route path="employees" element={<Employees />} />
                <Route path="employees/create" element={<EmployeeForm />} />
                <Route path="employees/edit/:id" element={<EmployeeForm />} />
                <Route path="employees/:id/edit" element={<EmployeeForm />} />
                <Route path="employees/:id" element={<EmployeeDetails />} />

                <Route path="departments" element={<Departments />} />
                <Route path="departments/create" element={<DepartmentForm />} />
                <Route path="departments/edit/:id" element={<DepartmentForm />} />
                <Route path="departments/:id/edit" element={<DepartmentForm />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['HR_MANAGER', 'EMPLOYEE', 'SUPER_ADMIN']} />}>
                <Route path="attendance" element={<Attendance />} />
                <Route path="attendance/history" element={<AttendanceHistory />} />
                <Route path="attendance/management" element={<AttendanceManagement />} />
                <Route path="attendance/report" element={<AttendanceReport />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="leaves/apply" element={<ApplyLeave />} />
                <Route path="leaves/:id" element={<LeaveDetails />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="tasks/create" element={<TaskForm />} />
                <Route path="projects" element={<ProjectList />} />
                <Route path="projects/create" element={<ProjectForm />} />
                <Route path="projects/edit/:id" element={<ProjectForm />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['FINANCE_MANAGER', 'SALES_MANAGER', 'SUPER_ADMIN']} />}>
                <Route path="sales" element={<Sales />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/create" element={<CustomerForm />} />
                <Route path="customers/edit/:id" element={<CustomerForm />} />
                <Route path="customers/:id/edit" element={<CustomerForm />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="quotations" element={<QuotationList />} />
                <Route path="quotations/create" element={<QuotationForm />} />
                <Route path="quotations/edit/:id" element={<QuotationForm />} />
                <Route path="quotations/:id" element={<QuotationDetails />} />
                <Route path="sales-orders" element={<SalesOrderList />} />
                <Route path="sales-orders/create" element={<SalesOrderForm />} />
                <Route path="sales-orders/:id" element={<SalesOrderDetails />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['INVENTORY_MANAGER', 'SUPER_ADMIN']} />}>
                <Route path="inventory" element={<Inventory />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/create" element={<ProductForm />} />
                <Route path="products/edit/:id" element={<ProductForm />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="suppliers" element={<SupplierManagement />} />
                <Route path="stock/manage" element={<StockManagement />} />
                <Route path="stock/history" element={<StockMovementHistory />} />
                <Route path="stock/alerts" element={<LowStockAlerts />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
