import { useState } from 'react';
import type { PublicDonation, PublicExpense } from '@/types';

function formatINR(v: number) {
  return `\u20B9${v.toLocaleString('en-IN')}`;
}

const PAGE_SIZE = 10;

// These ledgers render PublicDonation/PublicExpense only — the pre-computed,
// privacy-safe shapes with no real donor name, note, or admin uid. Never
// pass the private Donation/Expense admin records into these components.

export function DonationLedger({ donations }: { donations: PublicDonation[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(donations.length / PAGE_SIZE));
  const rows = donations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-copper/15">
        <h3 className="font-display text-lg text-ivory">Donations</h3>
        <p className="text-xs text-ivory/40 mt-0.5">{donations.length} contributions recorded</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-ivory/40 text-sm py-12">No donations recorded yet.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ivory/40 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-normal">Date</th>
                <th className="px-6 py-3 font-normal">Name</th>
                <th className="px-6 py-3 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-t border-copper/10">
                  <td className="px-6 py-3 text-ivory/60">{new Date(`${d.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-3 text-ivory/85">{d.displayName}</td>
                  <td className="px-6 py-3 text-right text-saffron-light tabular-nums">{formatINR(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

export function ExpenseLedger({ expenses }: { expenses: PublicExpense[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));
  const rows = expenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-copper/15">
        <h3 className="font-display text-lg text-ivory">Expenses</h3>
        <p className="text-xs text-ivory/40 mt-0.5">{expenses.length} expenses recorded</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-center text-ivory/40 text-sm py-12">No expenses recorded yet.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ivory/40 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-normal">Date</th>
                <th className="px-6 py-3 font-normal">Title</th>
                <th className="px-6 py-3 font-normal hidden sm:table-cell">Category</th>
                <th className="px-6 py-3 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-copper/10">
                  <td className="px-6 py-3 text-ivory/60">{new Date(`${e.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-3 text-ivory/85">{e.title}</td>
                  <td className="px-6 py-3 text-ivory/50 hidden sm:table-cell">{e.category}</td>
                  <td className="px-6 py-3 text-right text-maroon-light tabular-nums">{formatINR(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-copper/10 text-xs text-ivory/40">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="disabled:opacity-30 hover:text-ivory transition-colors"
      >
        Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="disabled:opacity-30 hover:text-ivory transition-colors"
      >
        Next
      </button>
    </div>
  );
}
