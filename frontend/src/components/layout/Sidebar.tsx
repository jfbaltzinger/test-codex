import { NavLink } from 'react-router-dom';
import {
  CalendarDaysIcon,
  CreditCardIcon,
  HomeIcon,
  UserCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Tableau de bord', to: '/', icon: HomeIcon },
  { name: 'Calendrier', to: '/calendar', icon: CalendarDaysIcon },
  { name: 'Réserver', to: '/booking', icon: ClockIcon },
  { name: 'Acheter des crédits', to: '/credits', icon: CreditCardIcon },
  { name: 'Historique', to: '/history', icon: ArrowTrendingUpIcon },
  { name: 'Profil', to: '/profile', icon: UserCircleIcon },
];

interface SidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobile = false, onNavigate }) => (
  <aside
    className={clsx(
      'h-full w-64 flex-shrink-0 border-r border-slate-200 bg-white px-4 py-6',
      mobile ? 'flex flex-col' : 'hidden md:flex md:flex-col'
    )}
  >
    {!mobile && <div className="mb-8 text-xl font-semibold text-primary-600">StudioFit</div>}
    <nav className="flex flex-1 flex-col space-y-1 text-sm">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex items-center rounded-lg px-3 py-2 font-medium transition hover:bg-primary-50 hover:text-primary-600',
              isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600'
            )
          }
          onClick={onNavigate}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  </aside>
);
