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
  Tasks,
  Sales,
  Inventory
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
                <Route path="tasks" element={<Tasks />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['FINANCE_MANAGER', 'SALES_MANAGER', 'SUPER_ADMIN']} />}>
                <Route path="sales" element={<Sales />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['INVENTORY_MANAGER', 'SUPER_ADMIN']} />}>
                <Route path="inventory" element={<Inventory />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
