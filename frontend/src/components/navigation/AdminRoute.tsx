import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const AdminRoute = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
