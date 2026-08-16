import {
  collection, doc, onSnapshot,
  orderBy, query, serverTimestamp, writeBatch, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Expense, PublicExpense } from '@/types';
import { writeAuditLog } from './auditLogs';

// PRIVATE collection — admin-only read/write. Holds description and the
// admin uid that recorded the expense.
const expensesRef = collection(db, 'expenses');

// PUBLIC collection — world-readable. Matches exactly the Date | Title |
// Category | Amount columns the public expense ledger shows.
const expensesPublicRef = collection(db, 'expensesPublic');

// ---------- Admin (private, full detail) ----------
export function subscribeToExpenses(cb: (expenses: Expense[]) => void): Unsubscribe {
  const q = query(expensesRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense)));
  });
}

// ---------- Public (privacy-safe, used by the Transparency page) ----------
export function subscribeToPublicExpenses(cb: (expenses: PublicExpense[]) => void): Unsubscribe {
  const q = query(expensesPublicRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PublicExpense)));
  });
}

export interface ExpenseInput {
  title: string;
  category: Expense['category'];
  amount: number;
  date: string;
  description?: string;
}

function assertPositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Expense amount must be a positive number.');
  }
}

function publicFields(input: Pick<ExpenseInput, 'title' | 'category' | 'amount' | 'date'>) {
  return { title: input.title, category: input.category, amount: input.amount, date: input.date };
}

export async function createExpense(input: ExpenseInput, adminUid: string, adminEmail: string) {
  assertPositiveAmount(input.amount);
  const privateDocRef = doc(expensesRef);
  const publicDocRef = doc(db, 'expensesPublic', privateDocRef.id);
  const batch = writeBatch(db);

  batch.set(privateDocRef, {
    ...input,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(publicDocRef, publicFields(input));

  await batch.commit();
  await writeAuditLog('expense_created', adminEmail, privateDocRef.id,
    `Added expense "${input.title}" for \u20B9${input.amount}`);
  return privateDocRef.id;
}

export async function updateExpense(
  id: string,
  input: Pick<ExpenseInput, 'title' | 'category' | 'amount' | 'date'> & Partial<ExpenseInput>,
  adminEmail: string
) {
  if (input.amount !== undefined) assertPositiveAmount(input.amount);
  const batch = writeBatch(db);

  batch.update(doc(db, 'expenses', id), { ...input, updatedAt: serverTimestamp() });
  batch.set(doc(db, 'expensesPublic', id), publicFields(input));

  await batch.commit();
  await writeAuditLog('expense_updated', adminEmail, id, 'Updated an expense record');
}

export async function deleteExpense(id: string, adminEmail: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'expenses', id));
  batch.delete(doc(db, 'expensesPublic', id));
  await batch.commit();
  await writeAuditLog('expense_deleted', adminEmail, id, 'Deleted an expense record');
}

export function expensesToCSV(expenses: Expense[]): string {
  const header = 'Date,Title,Category,Amount,Description\n';
  const rows = expenses.map((e) => {
    const title = e.title.replace(/,/g, ' ');
    const desc = (e.description ?? '').replace(/,/g, ' ').replace(/\n/g, ' ');
    return `${e.date},${title},${e.category},${e.amount},${desc}`;
  });
  return header + rows.join('\n');
}
