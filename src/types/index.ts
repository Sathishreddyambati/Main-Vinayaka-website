import type { Timestamp } from 'firebase/firestore';

export type DisplayPreference = 'full' | 'initials' | 'anonymous';

// PRIVATE record — lives in the "donations" collection, admin-only read
// (see firestore.rules). Contains the real donor name, any private note,
// and the admin's uid — none of this is ever exposed to public users.
export interface Donation {
  id: string;
  donorName: string;
  displayPreference: DisplayPreference;
  amount: number;
  date: string; // ISO date (yyyy-mm-dd), the date the donation was received
  paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer' | 'Other';
  note?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  createdBy: string; // admin uid — PRIVATE, never surfaced publicly
}

// PUBLIC record — lives in the "donationsPublic" collection, world-readable.
// displayName is pre-computed at write time from donorName + displayPreference
// so the real name never has to leave the private collection. This is the
// only donation shape the public Transparency page and its totals ever read.
export interface PublicDonation {
  id: string;
  displayName: string;
  amount: number;
  date: string;
}

export const EXPENSE_CATEGORIES = [
  'Pooja & Decorations',
  'Annadanam',
  'Electrical & Lighting',
  'Stage & Tent',
  'Cultural Programs',
  'Flowers',
  'Transportation',
  'Cleaning',
  'Printing',
  'Miscellaneous',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// PRIVATE record — "expenses" collection, admin-only read. Description and
// createdBy (admin uid) are internal detail, not part of the public ledger.
export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date
  description?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  createdBy: string; // admin uid — PRIVATE, never surfaced publicly
}

// PUBLIC record — "expensesPublic" collection, world-readable. Matches
// exactly the Date | Title | Category | Amount columns the public ledger
// shows; no description, no admin identity.
export interface PublicExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
}

export interface FestivalEvent {
  id: string;
  title: string;
  date: string; // ISO date
  time: string; // e.g. "6:30 PM"
  location: string;
  description: string;
  imageUrl?: string;
  order: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date
  priority: AnnouncementPriority;
  imageUrl?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export const GALLERY_CATEGORIES = [
  'Pooja',
  'Decorations',
  'Cultural Events',
  'Community',
  'Annadanam',
  'Visarjan',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryImage {
  id: string;
  imageUrl: string;
  storagePath: string;
  category: GalleryCategory;
  caption?: string;
  order: number;
  createdAt: Timestamp | null;
}

export interface SiteSettings {
  festivalName: string;
  tagline: string;
  festivalStartDate: string; // ISO date, drives the countdown
  heroImageUrl?: string;
  aboutText: string;
  communityMessage: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: { label: string; url: string }[];
  updatedAt: Timestamp | null;
}

export interface PaymentSettings {
  upiId: string;
  upiQrImageUrl?: string;
  instructions: string;
  updatedAt: Timestamp | null;
}

export type AdminRole = 'owner' | 'admin';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: Timestamp | null;
  createdBy: string;
}

export type AuditAction =
  | 'donation_created' | 'donation_updated' | 'donation_deleted'
  | 'expense_created' | 'expense_updated' | 'expense_deleted'
  | 'settings_updated' | 'payment_settings_updated'
  | 'event_created' | 'event_updated' | 'event_deleted'
  | 'announcement_created' | 'announcement_updated' | 'announcement_deleted'
  | 'gallery_uploaded' | 'gallery_deleted'
  | 'admin_invited' | 'admin_removed';

export interface AuditLog {
  id: string;
  action: AuditAction;
  performedBy: string; // admin email
  targetId?: string;
  summary: string;
  createdAt: Timestamp | null;
}

export interface FinancialTotals {
  totalCollected: number;
  totalExpenses: number;
  balance: number;
  donationCount: number;
  expenseCount: number;
  utilizedPercent: number;
}
