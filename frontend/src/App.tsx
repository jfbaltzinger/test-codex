import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { jwtDecode } from 'jwt-decode';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { useProfile } from '@/hooks/useAuth';
import { refreshSession } from '@/api/auth';
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
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          const { exp } = jwtDecode<TokenPayload>(storedToken);
          if (exp * 1000 > Date.now()) {
            hydrateToken(storedToken);
            markHydrated();
            return;
          }
        } catch (error) {
          // ignore and attempt refresh
        }
        localStorage.removeItem('token');
      }

      try {
        const session = await refreshSession();
        setCredentials({ user: session.user, token: session.accessToken });
        localStorage.setItem('token', session.accessToken);
      } catch (error) {
        clearCredentials();
        localStorage.removeItem('token');
      } finally {
        markHydrated();
      }
    };

    bootstrap();
  }, [clearCredentials, hydrateToken, markHydrated, setCredentials]);

  useProfile();

  return null;
};

export default function App() {
  return (
    <ToastProvider>
      <RestoreAuth />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
