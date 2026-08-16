import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Transparency from '@/pages/Transparency';
import Gallery from '@/pages/Gallery';
import Updates from '@/pages/Updates';
import AdminLogin from '@/pages/admin/Login';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import DonationsAdmin from '@/pages/admin/DonationsAdmin';
import ExpensesAdmin from '@/pages/admin/ExpensesAdmin';
import ScheduleAdmin from '@/pages/admin/ScheduleAdmin';
import AnnouncementsAdmin from '@/pages/admin/AnnouncementsAdmin';
import GalleryAdmin from '@/pages/admin/GalleryAdmin';
import PaymentSettingsAdmin from '@/pages/admin/PaymentSettingsAdmin';
import WebsiteSettingsAdmin from '@/pages/admin/WebsiteSettingsAdmin';
import AdminUsersAdmin from '@/pages/admin/AdminUsersAdmin';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/transparency" element={<Transparency />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/updates" element={<Updates />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="donations" element={<DonationsAdmin />} />
        <Route path="expenses" element={<ExpensesAdmin />} />
        <Route path="schedule" element={<ScheduleAdmin />} />
        <Route path="announcements" element={<AnnouncementsAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="payment-settings" element={<PaymentSettingsAdmin />} />
        <Route path="website-settings" element={<WebsiteSettingsAdmin />} />
        <Route path="admins" element={<AdminUsersAdmin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
