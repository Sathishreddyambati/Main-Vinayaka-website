import { useEffect, useMemo, useState } from 'react';
import type { Donation, Expense, PublicDonation, PublicExpense, FinancialTotals } from '@/types';
import { subscribeToDonations, subscribeToPublicDonations } from '@/services/donations';
import { subscribeToExpenses, subscribeToPublicExpenses } from '@/services/expenses';

function computeTotals(donationAmounts: number[], expenseAmounts: number[]): FinancialTotals {
  const totalCollected = donationAmounts.reduce((sum, a) => sum + a, 0);
  const totalExpenses = expenseAmounts.reduce((sum, a) => sum + a, 0);
  const balance = totalCollected - totalExpenses;
  const utilizedPercent = totalCollected > 0 ? Math.min(100, (totalExpenses / totalCollected) * 100) : 0;
  return {
    totalCollected,
    totalExpenses,
    balance,
    donationCount: donationAmounts.length,
    expenseCount: expenseAmounts.length,
    utilizedPercent,
  };
}

// ADMIN version — reads the private "donations"/"expenses" collections
// (full detail, admin-only per firestore.rules). Use only inside the admin
// dashboard, never on a public-facing page.
export function useFinancials() {
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const unsub1 = subscribeToDonations((d) => { setDonations(d); setLastUpdated(new Date()); });
    const unsub2 = subscribeToExpenses((e) => { setExpenses(e); setLastUpdated(new Date()); });
    return () => { unsub1(); unsub2(); };
  }, []);

  const totals = useMemo(
    () => computeTotals((donations ?? []).map((d) => d.amount), (expenses ?? []).map((e) => e.amount)),
    [donations, expenses]
  );

  const loading = donations === null || expenses === null;

  return { donations: donations ?? [], expenses: expenses ?? [], totals, loading, lastUpdated };
}

// PUBLIC version — reads only the "donationsPublic"/"expensesPublic"
// collections, which never contain real donor names, notes, or admin uids.
// This is what the public Transparency page must use.
export function usePublicFinancials() {
  const [donations, setDonations] = useState<PublicDonation[] | null>(null);
  const [expenses, setExpenses] = useState<PublicExpense[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const unsub1 = subscribeToPublicDonations((d) => { setDonations(d); setLastUpdated(new Date()); });
    const unsub2 = subscribeToPublicExpenses((e) => { setExpenses(e); setLastUpdated(new Date()); });
    return () => { unsub1(); unsub2(); };
  }, []);

  const totals = useMemo(
    () => computeTotals((donations ?? []).map((d) => d.amount), (expenses ?? []).map((e) => e.amount)),
    [donations, expenses]
  );

  const loading = donations === null || expenses === null;

  return { donations: donations ?? [], expenses: expenses ?? [], totals, loading, lastUpdated };
}
