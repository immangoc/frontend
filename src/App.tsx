import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { WarehouseAuthProvider } from './contexts/WarehouseAuthContext';
import WarehouseLogin from './pages/warehouse/WarehouseLogin';
import WarehouseRegister from './pages/warehouse/WarehouseRegister';
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import WarehouseContainerManagement from './pages/warehouse/ContainerManagement';
import UserManagement from './pages/warehouse/UserManagement';
import AdminWarehouseDashboard from './pages/warehouse/role/AdminDashboard';
import PlannerDashboard from './pages/warehouse/role/PlannerDashboard';
import OperatorDashboard from './pages/warehouse/role/OperatorDashboard';
import CustomerDashboard from './pages/warehouse/role/CustomerDashboard';
import ProtectedRoute from './components/warehouse/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NewsPage from './pages/NewsPage';
import ManagementSystemPage from './pages/ManagementSystemPage';

export default function App() {
  return (
    <WarehouseAuthProvider>
      <Router>
        <Routes>
          {/* Public Website Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/tin-tuc" element={<NewsPage />} />
          <Route path="/he-thong-quan-ly" element={<ManagementSystemPage />} />

          {/* Auth Routes */}
          <Route path="/warehouse/login" element={<WarehouseLogin />} />
          <Route path="/warehouse/register" element={<WarehouseRegister />} />

          {/* Protected Routes */}
          <Route
            path="/warehouse"
            element={
              <ProtectedRoute>
                <WarehouseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/containers"
            element={
              <ProtectedRoute allowedRoles={['admin', 'planner', 'operator']}>
                <WarehouseContainerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Role-based Dashboards */}
          <Route
            path="/warehouse/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminWarehouseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/planner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['planner']}>
                <PlannerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/operator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['operator']}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </WarehouseAuthProvider>
  );
}
