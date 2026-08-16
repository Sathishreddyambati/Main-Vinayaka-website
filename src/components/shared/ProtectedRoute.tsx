import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <Loader2 className="animate-spin text-copper" size={28} />
      </div>
    );
  }

  // Both an authenticated Firebase user AND a matching admins/{uid}
  // authorization document are required. Firestore/Storage rules enforce
  // this independently server-side — this check only controls UI routing.
  if (!user || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
