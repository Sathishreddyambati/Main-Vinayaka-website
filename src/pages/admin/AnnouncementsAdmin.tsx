import { ReactNode, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { subscribeToAnnouncements, saveAnnouncement, deleteAnnouncement } from '@/services/content';
import type { Announcement, AnnouncementPriority } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const emptyForm = { title: '', description: '', date: new Date().toISOString().slice(0, 10), priority: 'normal' as AnnouncementPriority, imageUrl: '' };

export default function AnnouncementsAdmin() {
  const { admin } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Announcement | null>(null);

  useEffect(() => subscribeToAnnouncements(setItems), []);

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(a: Announcement) {
    setEditing(a);
    setForm({ title: a.title, description: a.description, date: a.date, priority: a.priority, imageUrl: a.imageUrl ?? '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!admin) return;
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      await saveAnnouncement(editing?.id ?? null, {
        title: form.title.trim(), description: form.description.trim(), date: form.date,
        priority: form.priority, imageUrl: form.imageUrl.trim() || undefined,
      }, admin.email);
      toast.success(editing ? 'Announcement updated' : 'Announcement posted');
      setModalOpen(false);
    } catch {
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete || !admin) return;
    try {
      await deleteAnnouncement(confirmDelete.id, admin.email);
      toast.success('Announcement deleted');
    } catch {
      toast.error('Failed to delete announcement');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ivory">Announcements</h1>
          <p className="text-ivory/45 text-sm mt-1">{items.length} posted</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-charcoal font-semibold text-sm hover:bg-saffron-light">
          <Plus size={15} /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="card-glass rounded-xl p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-ivory font-medium">{a.title}</h3>
                <span className="text-[10px] uppercase tracking-wider text-copper-light">{a.priority}</span>
              </div>
              <p className="text-ivory/50 text-sm mt-1">{a.description}</p>
              <p className="text-ivory/30 text-xs mt-2">{a.date}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(a)} className="p-1.5 text-ivory/50 hover:text-saffron"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDelete(a)} className="p-1.5 text-ivory/50 hover:text-maroon-light"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-ivory/40 text-sm py-10">No announcements yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Announcement' : 'New Announcement'}>
        <div className="space-y-4">
          <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></Field>
          <Field label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></Field>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })} className="input">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </Field>
          </div>
          <Field label="Image URL (optional)"><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" /></Field>
          <button onClick={handleSave} disabled={saving} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Post Announcement'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Announcement"
        message={`Delete "${confirmDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="block text-xs text-ivory/50 mb-1.5">{label}</label>{children}</div>;
}
