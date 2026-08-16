import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, HandCoins, Receipt, CalendarDays, Megaphone,
  Images, QrCode, Settings, Users, LogOut, Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { signOutAdmin } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/donations', label: 'Donations', icon: HandCoins },
  { to: '/admin/expenses', label: 'Expenses', icon: Receipt },
  { to: '/admin/schedule', label: 'Festival Schedule', icon: CalendarDays },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/payment-settings', label: 'Payment Settings', icon: QrCode },
  { to: '/admin/website-settings', label: 'Website Settings', icon: Settings },
  { to: '/admin/admins', label: 'Admin Users', icon: Users },
];

export default function AdminLayout() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await signOutAdmin();
    toast.success('Signed out');
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-charcoal-100 border-r border-copper/10 hidden md:flex flex-col">
        <div className="px-6 py-6 flex items-center gap-2 border-b border-copper/10">
          <Flame size={18} className="text-saffron" />
          <span className="font-display text-sm text-ivory">MMR Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-saffron/10 text-saffron-light' : 'text-ivory/60 hover:bg-white/5 hover:text-ivory'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-copper/10">
          <div className="px-3 mb-2 text-xs text-ivory/40 truncate">{admin?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ivory/60 hover:bg-maroon/20 hover:text-maroon-light transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-copper/10 bg-charcoal-100">
          <span className="font-display text-sm text-ivory">MMR Admin</span>
          <button onClick={handleLogout} className="text-ivory/60 text-sm flex items-center gap-1">
            <LogOut size={14} /> Logout
          </button>
        </div>
        <div className="md:hidden px-5 py-3 border-b border-copper/10 bg-charcoal">
          <select
            value={location.pathname}
            onChange={(e) => navigate(e.target.value)}
            className="w-full bg-charcoal-50 border border-copper/20 rounded-lg px-3 py-2 text-sm text-ivory"
          >
            {nav.map((item) => (
              <option key={item.to} value={item.to}>{item.label}</option>
            ))}
          </select>
        </div>
        <main className="p-5 sm:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
