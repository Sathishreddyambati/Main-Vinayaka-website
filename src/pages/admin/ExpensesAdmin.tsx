import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { subscribeToExpenses, createExpense, updateExpense, deleteExpense, expensesToCSV } from '@/services/expenses';
import { EXPENSE_CATEGORIES } from '@/types';
import type { Expense } from '@/types';
import { useAuth } from '@/hooks/useAuth';

function formatINR(v: number) {
  return `\u20B9${v.toLocaleString('en-IN')}`;
}

type SortKey = 'date' | 'amount';

const emptyForm: {
  title: string;
  category: Expense['category'];
  amount: string;
  date: string;
  description: string;
} = {
  title: '',
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  description: '',
};

export default function ExpensesAdmin() {
  const { user, admin } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);

  useEffect(() => subscribeToExpenses(setExpenses), []);

  const filtered = useMemo(() => {
    let list = expenses.filter((e) =>
      (categoryFilter === 'All' || e.category === categoryFilter) &&
      (e.title.toLowerCase().includes(search.toLowerCase()) || (e.description ?? '').toLowerCase().includes(search.toLowerCase()))
    );
    list = [...list].sort((a, b) => {
      const cmp = sortKey === 'date' ? a.date.localeCompare(b.date) : a.amount - b.amount;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [expenses, search, categoryFilter, sortKey, sortDir]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setForm({ title: e.title, category: e.category, amount: String(e.amount), date: e.date, description: e.description ?? '' });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!user || !admin) return;
    const amount = Number(form.amount);
    if (!form.title.trim()) return toast.error('Title is required');
    if (!Number.isFinite(amount) || amount <= 0) return toast.error('Amount must be a positive number');

    setSaving(true);
    try {
      const input = {
        title: form.title.trim(), category: form.category, amount, date: form.date,
        description: form.description.trim() || undefined,
      };
      if (editing) {
        await updateExpense(editing.id, input, admin.email);
        toast.success('Expense updated');
      } else {
        await createExpense(input, user.uid, admin.email);
        toast.success('Expense added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete || !admin) return;
    try {
      await deleteExpense(confirmDelete.id, admin.email);
      toast.success('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setConfirmDelete(null);
    }
  }

  function exportCSV() {
    const csv = expensesToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
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
          <h1 className="font-display text-2xl text-ivory">Expenses</h1>
          <p className="text-ivory/45 text-sm mt-1">{expenses.length} total records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-copper/25 text-ivory/70 hover:text-ivory text-sm">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-charcoal font-semibold text-sm hover:bg-saffron-light">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full bg-charcoal-50 border border-copper/20 rounded-lg pl-9 pr-3 py-2 text-sm text-ivory focus:outline-none focus:border-saffron"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input sm:w-56">
          <option>All</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card-glass rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-ivory/40 text-xs uppercase tracking-wider">
              <th className="px-5 py-3 font-normal cursor-pointer" onClick={() => toggleSort('date')}>
                <span className="flex items-center gap-1">Date <ArrowUpDown size={11} /></span>
              </th>
              <th className="px-5 py-3 font-normal">Title</th>
              <th className="px-5 py-3 font-normal">Category</th>
              <th className="px-5 py-3 font-normal cursor-pointer" onClick={() => toggleSort('amount')}>
                <span className="flex items-center gap-1">Amount <ArrowUpDown size={11} /></span>
              </th>
              <th className="px-5 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-copper/10">
                <td className="px-5 py-3 text-ivory/60">{e.date}</td>
                <td className="px-5 py-3 text-ivory/85">{e.title}</td>
                <td className="px-5 py-3 text-ivory/50 text-xs">{e.category}</td>
                <td className="px-5 py-3 text-maroon-light tabular-nums">{formatINR(e.amount)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(e)} className="p-1.5 text-ivory/50 hover:text-saffron"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(e)} className="p-1.5 text-ivory/50 hover:text-maroon-light"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-ivory/40 text-sm py-10">No expenses match your filters.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-4">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Expense['category'] })} className="input">
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
          <Field label="Description (optional)">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} />
          </Field>
          <button onClick={handleSave} disabled={saving} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Expense"
        message={`Delete "${confirmDelete?.title}" (${confirmDelete ? formatINR(confirmDelete.amount) : ''})? This cannot be undone.`}
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
