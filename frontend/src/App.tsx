import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import jwtDecode from 'jwt-decode';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { useProfile } from '@/hooks/useAuth';
import { AdminRoute } from '@/components/navigation/AdminRoute';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { MembersPage } from '@/pages/admin/MembersPage';
import { CreditPacksPage } from '@/pages/admin/CreditPacksPage';
import { CoursesPage } from '@/pages/admin/CoursesPage';
import { ReportsPage } from '@/pages/admin/ReportsPage';

interface TokenPayload {
  exp: number;
}

const RestoreAuth = () => {
  const hydrateToken = useAuthStore((state) => state.hydrateToken);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearCredentials();
      return;
    }

    try {
      const { exp } = jwtDecode<TokenPayload>(token);
      if (exp * 1000 < Date.now()) {
        clearCredentials();
        return;
      }
      hydrateToken(token);
    } catch (error) {
      clearCredentials();
    }
  }, [clearCredentials, hydrateToken]);

  useProfile();

  return null;
};

export default function App() {
  return (
    <ToastProvider>
      <RestoreAuth />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="credit-packs" element={<CreditPacksPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
