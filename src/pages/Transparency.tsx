import { useEffect, useState } from 'react';
import { Wallet, TrendingDown, PiggyBank, Receipt, ListChecks, Percent } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import LiveBadge from '@/components/shared/LiveBadge';
import StatCard from '@/components/transparency/StatCard';
import { DonationTrendChart, ExpenseCategoryChart, CollectionVsExpenseChart } from '@/components/transparency/Charts';
import { DonationLedger, ExpenseLedger } from '@/components/transparency/Ledgers';
import { usePublicFinancials } from '@/hooks/useFinancials';
import { subscribeToSiteSettings } from '@/services/settings';
import type { SiteSettings } from '@/types';

function formatINR(v: number) {
  return `\u20B9${v.toLocaleString('en-IN')}`;
}

export default function Transparency() {
  const { donations, expenses, totals, loading, lastUpdated } = usePublicFinancials();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => subscribeToSiteSettings(setSettings), []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="text-center mb-4">
          <LiveBadge />
        </div>
        <p className="eyebrow mb-4 text-center">Community Transparency</p>
        <h1 className="font-display text-3xl sm:text-5xl text-ivory text-center mb-4">Every Rupee, Accounted For</h1>
        <p className="text-ivory/55 text-center max-w-xl mx-auto text-sm sm:text-base">
          Balance = Total Donations − Total Expenses. Figures below update the instant our admin team records a transaction.
        </p>
        <p className="text-center text-[11px] text-ivory/30 mt-3">
          Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>

        {loading ? (
          <div className="grid sm:grid-cols-3 gap-5 mt-12 animate-pulse">
            {[0, 1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-charcoal-50" />)}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-5 mt-12">
              <StatCard label="Total Collection" value={formatINR(totals.totalCollected)} icon={<Wallet size={18} />} accent="saffron" />
              <StatCard label="Total Expenses" value={formatINR(totals.totalExpenses)} icon={<TrendingDown size={18} />} accent="maroon" />
              <StatCard label="Available Balance" value={formatINR(totals.balance)} icon={<PiggyBank size={18} />} accent="copper" />
            </div>

            <div className="grid sm:grid-cols-3 gap-5 mt-5">
              <StatCard label="Donations Received" value={String(totals.donationCount)} icon={<Receipt size={16} />} accent="copper" />
              <StatCard label="Expenses Logged" value={String(totals.expenseCount)} icon={<ListChecks size={16} />} accent="copper" />
              <StatCard label="Funds Utilized" value={`${totals.utilizedPercent.toFixed(1)}%`} icon={<Percent size={16} />} accent="copper" />
            </div>

            <div className="grid lg:grid-cols-2 gap-5 mt-12">
              <div className="card-glass rounded-2xl p-6">
                <h3 className="font-display text-lg text-ivory mb-4">Donation Trend (Cumulative)</h3>
                <DonationTrendChart donations={donations} />
              </div>
              <div className="card-glass rounded-2xl p-6">
                <h3 className="font-display text-lg text-ivory mb-4">Expense Breakdown</h3>
                <ExpenseCategoryChart expenses={expenses} />
              </div>
            </div>

            <div className="card-glass rounded-2xl p-6 mt-5">
              <h3 className="font-display text-lg text-ivory mb-4">Collection vs Expenses</h3>
              <CollectionVsExpenseChart totalCollected={totals.totalCollected} totalExpenses={totals.totalExpenses} />
            </div>

            <div className="grid lg:grid-cols-2 gap-5 mt-12">
              <DonationLedger donations={donations} />
              <ExpenseLedger expenses={expenses} />
            </div>
          </>
        )}
      </section>
      <Footer settings={settings} />
    </div>
  );
}
