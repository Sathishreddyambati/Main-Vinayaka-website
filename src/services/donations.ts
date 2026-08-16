import {
  collection, doc, onSnapshot,
  orderBy, query, serverTimestamp, writeBatch, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Donation, PublicDonation } from '@/types';
import { writeAuditLog } from './auditLogs';

// PRIVATE collection — admin-only read/write (see firestore.rules). Holds
// the real donor name, note, and the admin uid that recorded it.
const donationsRef = collection(db, 'donations');

// PUBLIC collection — world-readable. Holds only what the public
// Transparency ledger is allowed to show: date, a pre-computed display
// name, and amount. Every write below keeps both collections in sync.
const donationsPublicRef = collection(db, 'donationsPublic');

export function donationDisplayName(donorName: string, displayPreference: Donation['displayPreference']): string {
  if (displayPreference === 'anonymous') return 'Anonymous';
  if (displayPreference === 'initials') {
    return donorName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .join('.') + '.';
  }
  return donorName;
}

// ---------- Admin (private, full detail) ----------
export function subscribeToDonations(cb: (donations: Donation[]) => void): Unsubscribe {
  const q = query(donationsRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation)));
  });
}

// ---------- Public (privacy-safe, used by the Transparency page) ----------
export function subscribeToPublicDonations(cb: (donations: PublicDonation[]) => void): Unsubscribe {
  const q = query(donationsPublicRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PublicDonation)));
  });
}

export interface DonationInput {
  donorName: string;
  displayPreference: Donation['displayPreference'];
  amount: number;
  date: string;
  paymentMethod: Donation['paymentMethod'];
  note?: string;
}

function assertPositiveAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Donation amount must be a positive number.');
  }
}

export async function createDonation(input: DonationInput, adminUid: string, adminEmail: string) {
  assertPositiveAmount(input.amount);
  const privateDocRef = doc(donationsRef);
  const publicDocRef = doc(db, 'donationsPublic', privateDocRef.id);
  const batch = writeBatch(db);

  batch.set(privateDocRef, {
    ...input,
    createdBy: adminUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(publicDocRef, {
    displayName: donationDisplayName(input.donorName, input.displayPreference),
    amount: input.amount,
    date: input.date,
  });

  await batch.commit();
  await writeAuditLog('donation_created', adminEmail, privateDocRef.id,
    `Added donation of \u20B9${input.amount} from ${input.donorName}`);
  return privateDocRef.id;
}

export async function updateDonation(
  id: string,
  input: Pick<DonationInput, 'donorName' | 'displayPreference' | 'amount' | 'date'> & Partial<DonationInput>,
  adminEmail: string
) {
  if (input.amount !== undefined) assertPositiveAmount(input.amount);
  const batch = writeBatch(db);

  batch.update(doc(db, 'donations', id), { ...input, updatedAt: serverTimestamp() });
  batch.set(doc(db, 'donationsPublic', id), {
    displayName: donationDisplayName(input.donorName, input.displayPreference),
    amount: input.amount,
    date: input.date,
  });

  await batch.commit();
  await writeAuditLog('donation_updated', adminEmail, id, 'Updated a donation record');
}

export async function deleteDonation(id: string, adminEmail: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'donations', id));
  batch.delete(doc(db, 'donationsPublic', id));
  await batch.commit();
  await writeAuditLog('donation_deleted', adminEmail, id, 'Deleted a donation record');
}

export function donationsToCSV(donations: Donation[]): string {
  const header = 'Date,Donor Name,Display Preference,Amount,Payment Method,Note\n';
  const rows = donations.map((d) => {
    const name = d.donorName.replace(/,/g, ' ');
    const note = (d.note ?? '').replace(/,/g, ' ').replace(/\n/g, ' ');
    return `${d.date},${name},${d.displayPreference},${d.amount},${d.paymentMethod},${note}`;
  });
  return header + rows.join('\n');
}
