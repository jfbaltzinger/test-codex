import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/navigation/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CalendarPage } from '@/pages/calendar/CalendarPage';
import { BookingPage } from '@/pages/booking/BookingPage';
import { CreditsPage } from '@/pages/credits/CreditsPage';
import { HistoryPage } from '@/pages/history/HistoryPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import jwtDecode from 'jwt-decode';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { useProfile } from '@/hooks/useAuth';

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
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="credits" element={<CreditsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
