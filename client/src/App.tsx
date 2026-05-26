import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import VerificationPrompt from './components/VerificationPrompt';
import DashboardPageNew from './pages/DashboardPageNew';
import LoansPage from './pages/LoansPage';
import ObligationsPage from './pages/ObligationsPage';
import LoanDetailPage from './pages/LoanDetailPageEnhanced';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, emailVerified } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '12px' }}>
      <span className="spinner spinner-dark" style={{ width: '32px', height: '32px' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Ładowanie...</p>
    </div>
  );
  // Allow both logged-in users AND guests (user is set for both)
  if (!user) return <Navigate to="/login" replace />;
  // Show verification prompt for unverified users
  if (!emailVerified) return <VerificationPrompt />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<DashboardPageNew />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="loans/:id" element={<LoanDetailPage />} />
        <Route path="obligations" element={<ObligationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<Navigate to="/profile" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
