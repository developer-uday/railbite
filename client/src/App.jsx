import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import './index.css';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import VendorSetup from './pages/VendorSetup';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" />;

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/vendor-setup"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorSetup />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/vendor-dashboard"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <OrderDetailsPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </Router>
  );
}

export default App;
