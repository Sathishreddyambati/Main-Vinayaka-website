import { ReactNode, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { subscribeToEvents, saveEvent, deleteEvent } from '@/services/content';
import type { FestivalEvent } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const emptyForm = { title: '', date: new Date().toISOString().slice(0, 10), time: '', location: '', description: '', imageUrl: '', order: 0 };

export default function ScheduleAdmin() {
  const { admin } = useAuth();
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FestivalEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<FestivalEvent | null>(null);

  useEffect(() => subscribeToEvents(setEvents), []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, order: events.length });
    setModalOpen(true);
  }

  function openEdit(e: FestivalEvent) {
    setEditing(e);
    setForm({ title: e.title, date: e.date, time: e.time, location: e.location, description: e.description, imageUrl: e.imageUrl ?? '', order: e.order });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!admin) return;
    if (!form.title.trim() || !form.date) return toast.error('Title and date are required');
    setSaving(true);
    try {
      await saveEvent(editing?.id ?? null, {
        title: form.title.trim(), date: form.date, time: form.time.trim(), location: form.location.trim(),
        description: form.description.trim(), imageUrl: form.imageUrl.trim() || undefined, order: form.order,
      }, admin.email);
      toast.success(editing ? 'Event updated' : 'Event added');
      setModalOpen(false);
    } catch {
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete || !admin) return;
    try {
      await deleteEvent(confirmDelete.id, admin.email);
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ivory">Festival Schedule</h1>
          <p className="text-ivory/45 text-sm mt-1">{events.length} events published</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-charcoal font-semibold text-sm hover:bg-saffron-light">
          <Plus size={15} /> Add Event
        </button>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="card-glass rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="text-copper-light flex items-center gap-1.5 text-xs shrink-0 mt-1">
                <CalendarDays size={13} /> {e.date}
              </div>
              <div>
                <h3 className="text-ivory font-medium">{e.title}</h3>
                <p className="text-ivory/45 text-xs mt-0.5">{e.time} {e.location && `· ${e.location}`}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(e)} className="p-1.5 text-ivory/50 hover:text-saffron"><Pencil size={14} /></button>
              <button onClick={() => setConfirmDelete(e)} className="p-1.5 text-ivory/50 hover:text-maroon-light"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-center text-ivory/40 text-sm py-10">No events yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'Add Event'}>
        <div className="space-y-4">
          <Field label="Title"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></Field>
            <Field label="Time"><input placeholder="6:30 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input" /></Field>
          </div>
          <Field label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" /></Field>
          <Field label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" /></Field>
          <Field label="Image URL (optional)"><input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" /></Field>
          <button onClick={handleSave} disabled={saving} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Event"
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
