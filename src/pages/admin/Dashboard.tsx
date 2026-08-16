import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, PiggyBank, HandCoins, Receipt } from 'lucide-react';
import StatCard from '@/components/transparency/StatCard';
import { CollectionVsExpenseChart } from '@/components/transparency/Charts';
import { useFinancials } from '@/hooks/useFinancials';
import { subscribeToRecentAuditLogs } from '@/services/auditLogs';
import type { AuditLog } from '@/types';

function formatINR(v: number) {
  return `\u20B9${v.toLocaleString('en-IN')}`;
}

const actionLabel: Record<string, string> = {
  donation_created: 'added a donation', donation_updated: 'updated a donation', donation_deleted: 'deleted a donation',
  expense_created: 'added an expense', expense_updated: 'updated an expense', expense_deleted: 'deleted an expense',
  settings_updated: 'updated website settings', payment_settings_updated: 'updated payment settings',
  event_created: 'created an event', event_updated: 'updated an event', event_deleted: 'deleted an event',
  announcement_created: 'posted an announcement', announcement_updated: 'updated an announcement', announcement_deleted: 'deleted an announcement',
  gallery_uploaded: 'uploaded a gallery photo', gallery_deleted: 'removed a gallery photo',
  admin_invited: 'granted admin access', admin_removed: 'revoked admin access',
};

export default function Dashboard() {
  const { totals, loading } = useFinancials();
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => subscribeToRecentAuditLogs(setLogs, 12), []);

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-1">Dashboard</h1>
      <p className="text-ivory/45 text-sm mb-8">Live overview of MMR Youth Force 2026 finances.</p>

      {loading ? (
        <div className="grid sm:grid-cols-3 gap-5 animate-pulse">
          {[0, 1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-charcoal-50" />)}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-5">
            <StatCard label="Total Collection" value={formatINR(totals.totalCollected)} icon={<Wallet size={18} />} accent="saffron" />
            <StatCard label="Total Expenses" value={formatINR(totals.totalExpenses)} icon={<TrendingDown size={18} />} accent="maroon" />
            <StatCard label="Available Balance" value={formatINR(totals.balance)} icon={<PiggyBank size={18} />} accent="copper" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5 mt-5">
            <StatCard label="Donations" value={String(totals.donationCount)} icon={<HandCoins size={16} />} accent="copper" />
            <StatCard label="Expenses" value={String(totals.expenseCount)} icon={<Receipt size={16} />} accent="copper" />
          </div>

          <div className="card-glass rounded-2xl p-6 mt-8">
            <h3 className="font-display text-lg text-ivory mb-4">Collection vs Expenses</h3>
            <CollectionVsExpenseChart totalCollected={totals.totalCollected} totalExpenses={totals.totalExpenses} />
          </div>
        </>
      )}

      <div className="card-glass rounded-2xl mt-8">
        <div className="px-6 py-4 border-b border-copper/15">
          <h3 className="font-display text-lg text-ivory">Recent Activity</h3>
        </div>
        {logs.length === 0 ? (
          <p className="text-center text-ivory/40 text-sm py-10">No admin activity yet.</p>
        ) : (
          <ul className="divide-y divide-copper/10">
            {logs.map((l) => (
              <li key={l.id} className="px-6 py-3 text-sm flex items-center justify-between gap-4">
                <span className="text-ivory/75">
                  <span className="text-copper-light">{l.performedBy}</span> {actionLabel[l.action] ?? l.action}
                </span>
                <span className="text-ivory/30 text-xs shrink-0">
                  {l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
