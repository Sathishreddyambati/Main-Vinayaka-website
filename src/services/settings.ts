import { doc, onSnapshot, setDoc, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PaymentSettings, SiteSettings } from '@/types';
import { writeAuditLog } from './auditLogs';

const siteRef = doc(db, 'settings', 'site');
const paymentRef = doc(db, 'settings', 'payment');

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  festivalName: 'Vinayaka Chaturthi 2026',
  tagline: 'Our Faith. Our Festival. Our Community.',
  festivalStartDate: '2026-09-14',
  aboutText: 'Add your community\u2019s story from Admin \u2192 Website Settings.',
  communityMessage: 'Add a message to the community from Admin \u2192 Website Settings.',
  updatedAt: null,
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: '',
  instructions: 'Scan the QR code or use the UPI ID above. After sending your contribution, our team will verify and add it to the public ledger.',
  updatedAt: null,
};

export function subscribeToSiteSettings(cb: (settings: SiteSettings) => void): Unsubscribe {
  return onSnapshot(siteRef, (snap) => {
    cb(snap.exists() ? (snap.data() as SiteSettings) : DEFAULT_SITE_SETTINGS);
  });
}

export function subscribeToPaymentSettings(cb: (settings: PaymentSettings) => void): Unsubscribe {
  return onSnapshot(paymentRef, (snap) => {
    cb(snap.exists() ? (snap.data() as PaymentSettings) : DEFAULT_PAYMENT_SETTINGS);
  });
}

export async function saveSiteSettings(settings: Omit<SiteSettings, 'updatedAt'>, adminEmail: string) {
  await setDoc(siteRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
  await writeAuditLog('settings_updated', adminEmail, undefined, 'Updated website settings');
}

export async function savePaymentSettings(settings: Omit<PaymentSettings, 'updatedAt'>, adminEmail: string) {
  await setDoc(paymentRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
  await writeAuditLog('payment_settings_updated', adminEmail, undefined, 'Updated UPI payment settings');
}
