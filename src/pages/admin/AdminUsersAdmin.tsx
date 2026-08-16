import { useEffect, useState } from 'react';
import { Info, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { subscribeToAdmins, grantAdminRole, revokeAdminRole } from '@/services/auth';
import type { AdminUser } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function AdminUsersAdmin() {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('admin');
  const [saving, setSaving] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<AdminUser | null>(null);

  useEffect(() => subscribeToAdmins(setAdmins), []);

  const isOwner = admin?.role === 'owner';

  async function handleGrant() {
    if (!admin) return;
    if (!uid.trim() || !email.trim()) return toast.error('UID and email are required');
    setSaving(true);
    try {
      await grantAdminRole(uid.trim(), email.trim(), name.trim() || email.trim(), role, admin.email);
      toast.success('Admin access granted');
      setUid(''); setEmail(''); setName('');
    } catch {
      toast.error('Failed to grant admin access. Only owners can add admins.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke() {
    if (!confirmRevoke || !admin) return;
    try {
      await revokeAdminRole(confirmRevoke.uid, confirmRevoke.email, admin.email);
      toast.success('Admin access revoked');
    } catch {
      toast.error('Failed to revoke access');
    } finally {
      setConfirmRevoke(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ivory mb-1">Admin Users</h1>
      <p className="text-ivory/45 text-sm mb-8">Only owners can grant or revoke admin access.</p>

      {isOwner && (
        <div className="card-glass rounded-2xl p-6 mb-8">
          <div className="flex gap-3 mb-5 text-xs text-ivory/50 bg-charcoal-50 rounded-lg p-3">
            <Info size={15} className="text-copper-light shrink-0 mt-0.5" />
            <p>
              First create the person's account in the Firebase Console → Authentication → Add user (email + a
              temporary password they'll change on first login). Then copy their User UID from that same screen and
              enter it below to grant them admin access to this dashboard. This never touches passwords.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-ivory/50 mb-1.5">Firebase User UID</label>
              <input value={uid} onChange={(e) => setUid(e.target.value)} className="input" placeholder="e.g. aB3x..." />
            </div>
            <div>
              <label className="block text-xs text-ivory/50 mb-1.5">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs text-ivory/50 mb-1.5">Display Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs text-ivory/50 mb-1.5">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as AdminUser['role'])} className="input">
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          <button onClick={handleGrant} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-saffron text-charcoal font-semibold text-sm hover:bg-saffron-light disabled:opacity-60">
            <UserPlus size={15} /> {saving ? 'Granting...' : 'Grant Admin Access'}
          </button>
        </div>
      )}

      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-copper/15">
          <h3 className="font-display text-lg text-ivory">Current Admins</h3>
        </div>
        <ul className="divide-y divide-copper/10">
          {admins.map((a) => (
            <li key={a.uid} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-ivory text-sm">{a.name}</p>
                <p className="text-ivory/45 text-xs">{a.email} · {a.role}</p>
              </div>
              {isOwner && a.uid !== admin?.uid && (
                <button onClick={() => setConfirmRevoke(a)} className="p-1.5 text-ivory/50 hover:text-maroon-light">
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={!!confirmRevoke}
        title="Revoke Admin Access"
        message={`Revoke admin access for ${confirmRevoke?.email}? They will immediately lose access to this dashboard.`}
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => setConfirmRevoke(null)}
      />
    </div>
  );
}
