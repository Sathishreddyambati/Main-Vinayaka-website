import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { subscribeToDonations, createDonation, updateDonation, deleteDonation, donationsToCSV, donationDisplayName } from '@/services/donations';
import type { Donation, DisplayPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';

function formatINR(v: number) {
  return `\u20B9${v.toLocaleString('en-IN')}`;
}

type SortKey = 'date' | 'amount';

const emptyForm = {
  donorName: '', displayPreference: 'full' as DisplayPreference, amount: '', date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'UPI' as Donation['paymentMethod'], note: '',
};

export default function DonationsAdmin() {
  const { user, admin } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Donation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Donation | null>(null);

  useEffect(() => subscribeToDonations(setDonations), []);

  const filtered = useMemo(() => {
    let list = donations.filter((d) =>
      d.donorName.toLowerCase().includes(search.toLowerCase()) || (d.note ?? '').toLowerCase().includes(search.toLowerCase())
    );
    list = [...list].sort((a, b) => {
      const cmp = sortKey === 'date' ? a.date.localeCompare(b.date) : a.amount - b.amount;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [donations, search, sortKey, sortDir]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(d: Donation) {
    setEditing(d);
    setForm({
      donorName: d.donorName, displayPreference: d.displayPreference, amount: String(d.amount),
      date: d.date, paymentMethod: d.paymentMethod, note: d.note ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!user || !admin) return;
    const amount = Number(form.amount);
    if (!form.donorName.trim()) return toast.error('Donor name is required');
    if (!Number.isFinite(amount) || amount <= 0) return toast.error('Amount must be a positive number');

    setSaving(true);
    try {
      const input = {
        donorName: form.donorName.trim(), displayPreference: form.displayPreference, amount,
        date: form.date, paymentMethod: form.paymentMethod, note: form.note.trim() || undefined,
      };
      if (editing) {
        await updateDonation(editing.id, input, admin.email);
        toast.success('Donation updated');
      } else {
        await createDonation(input, user.uid, admin.email);
        toast.success('Donation added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save donation');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete || !admin) return;
    try {
      await deleteDonation(confirmDelete.id, admin.email);
      toast.success('Donation deleted');
    } catch {
      toast.error('Failed to delete donation');
    } finally {
      setConfirmDelete(null);
    }
  }

  function exportCSV() {
    const csv = donationsToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl text-ivory">Donations</h1>
          <p className="text-ivory/45 text-sm mt-1">{donations.length} total records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-copper/25 text-ivory/70 hover:text-ivory text-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-charcoal font-semibold text-sm hover:bg-saffron-light">
            <Plus size={15} /> Add Donation
          </button>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or note..."
          className="w-full bg-charcoal-50 border border-copper/20 rounded-lg pl-9 pr-3 py-2 text-sm text-ivory focus:outline-none focus:border-saffron"
        />
      </div>

      <div className="card-glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-ivory/40 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 font-normal cursor-pointer" onClick={() => toggleSort('date')}>
                <span className="flex items-center gap-1">Date <ArrowUpDown size={11} /></span>
              </th>
              <th className="px-5 py-3 font-normal">Donor</th>
              <th className="px-5 py-3 font-normal">Display</th>
              <th className="px-5 py-3 font-normal cursor-pointer" onClick={() => toggleSort('amount')}>
                <span className="flex items-center gap-1">Amount <ArrowUpDown size={11} /></span>
              </th>
              <th className="px-5 py-3 font-normal">Method</th>
              <th className="px-5 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-copper/10">
                <td className="px-5 py-3 text-ivory/60">{d.date}</td>
                <td className="px-5 py-3 text-ivory/85">{d.donorName}</td>
                <td className="px-5 py-3 text-ivory/50 text-xs">{donationDisplayName(d.donorName, d.displayPreference)}</td>
                <td className="px-5 py-3 text-saffron-light tabular-nums">{formatINR(d.amount)}</td>
                <td className="px-5 py-3 text-ivory/50 text-xs">{d.paymentMethod}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="p-1.5 text-ivory/50 hover:text-saffron"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(d)} className="p-1.5 text-ivory/50 hover:text-maroon-light"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-ivory/40 text-sm py-10">No donations match your search.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Donation' : 'Add Donation'}>
        <div className="space-y-4">
          <Field label="Donor Name">
            <input value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} className="input" />
          </Field>
          <Field label="Display Preference">
            <select value={form.displayPreference} onChange={(e) => setForm({ ...form, displayPreference: e.target.value as DisplayPreference })} className="input">
              <option value="full">Full Name</option>
              <option value="initials">Initials</option>
              <option value="anonymous">Anonymous</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (₹)">
              <input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Payment Method">
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as Donation['paymentMethod'] })} className="input">
              <option>UPI</option>
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Note (optional)">
            <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input" rows={2} />
          </Field>
          <button onClick={handleSave} disabled={saving} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Donation'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Donation"
        message={`Delete the donation of ${confirmDelete ? formatINR(confirmDelete.amount) : ''} from ${confirmDelete?.donorName}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-ivory/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
