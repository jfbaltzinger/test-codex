import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:px-8">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus:outline-none md:hidden"
          onClick={onOpenSidebar}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">Tableau de bord administrateur</p>
          <p className="text-xs text-slate-500">Pilotage de StudioFit et suivi des performances.</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium text-slate-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600">
          {user?.firstName?.[0]}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>
    </header>
  );
};
