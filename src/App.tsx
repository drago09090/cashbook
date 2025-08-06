import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AdminAuthProvider } from './hooks/useAdminAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { WelcomePage } from './components/onboarding/WelcomePage';
import { CategorySelection } from './components/onboarding/CategorySelection';
import { TypeSelection } from './components/onboarding/TypeSelection';
import { Dashboard } from './components/dashboard/Dashboard';
import { BookDetail } from './components/books/BookDetail';
import { InvoicePage } from './components/invoices/InvoicePage';
import { TeamPage } from './components/team/TeamPage';
import { BusinessSettingsPage } from './components/business/BusinessSettingsPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UsersManagement } from './components/admin/UsersManagement';
import { BusinessesManagement } from './components/admin/BusinessesManagement';
import { CashbooksManagement } from './components/admin/CashbooksManagement';
import { InvoicesManagement } from './components/admin/InvoicesManagement';
import { AdminSettings } from './components/admin/AdminSettings';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    if (user) {
      // User is authenticated, redirect based on profile completion
      if (location.pathname === '/login' || location.pathname === '/signup') {
        // Redirect away from auth pages
        if (!user.full_name) {
          navigate('/welcome', { replace: true });
        } else if (!user.skip_business && !user.business_category) {
          navigate('/business/category', { replace: true });
        } else if (!user.skip_business && !user.business_type) {
          navigate('/business/type', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } else {
      // User is not authenticated, redirect to login if on protected routes
      const protectedRoutes = ['/welcome', '/business/category', '/business/type', '/dashboard', '/book'];
      if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">CB</span>
          </div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      
      <Route path="/welcome" element={
        <ProtectedRoute>
          <WelcomePage />
        </ProtectedRoute>
      } />
      
      <Route path="/business/category" element={
        <ProtectedRoute>
          <CategorySelection />
        </ProtectedRoute>
      } />
      
      <Route path="/business/type" element={
        <ProtectedRoute>
          <TypeSelection />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/book/:bookId" element={
        <ProtectedRoute>
          <BookDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/invoices" element={
        <ProtectedRoute>
          <InvoicePage />
        </ProtectedRoute>
      } />
      
      <Route path="/team" element={
        <ProtectedRoute>
          <TeamPage />
        </ProtectedRoute>
      } />
      
      <Route path="/business-settings" element={
        <ProtectedRoute>
          <BusinessSettingsPage />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="businesses" element={<BusinessesManagement />} />
        <Route path="cashbooks" element={<CashbooksManagement />} />
        <Route path="invoices" element={<InvoicesManagement />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </AdminAuthProvider>
  );
}