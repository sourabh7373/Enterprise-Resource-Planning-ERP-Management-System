import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { Dashboard, Employees, Departments, Attendance, Leaves, Tasks, Sales, Inventory } from './pages';
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
              
              <Route element={<RoleBasedRoute allowedRoles={['HR_MANAGER']} />}>
                <Route path="employees" element={<Employees />} />
                <Route path="departments" element={<Departments />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['HR_MANAGER', 'EMPLOYEE']} />}>
                <Route path="attendance" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="tasks" element={<Tasks />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['FINANCE_MANAGER', 'SALES_MANAGER']} />}>
                <Route path="sales" element={<Sales />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['INVENTORY_MANAGER']} />}>
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
