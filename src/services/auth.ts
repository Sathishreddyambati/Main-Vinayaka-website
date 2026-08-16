import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged, User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AdminUser } from '@/types';
import { writeAuditLog } from './auditLogs';

export function watchAuthState(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

export async function signOutAdmin() {
  await signOut(auth);
}

// Authorization is data-driven: a signed-in Firebase Auth user is only
// treated as an admin of this app if a matching document exists at
// admins/{uid}. This document (not a client-side flag) is also what the
// Firestore/Storage security rules check before allowing any write — see
// firestore.rules. Passwords are never read, stored, or exposed here;
// Firebase Authentication owns credentials entirely.
export async function fetchAdminProfile(uid: string): Promise<AdminUser | null> {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists() ? (snap.data() as AdminUser) : null;
}

export function subscribeToAdmins(cb: (admins: AdminUser[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'admins'), (snap) => {
    cb(snap.docs.map((d) => d.data() as AdminUser));
  });
}

// Grants admin rights to an EXISTING Firebase Auth user by uid (the person
// must already have signed up / been created in Firebase Authentication —
// see README "Adding another admin"). This only writes the authorization
// document; it never touches credentials.
export async function grantAdminRole(uid: string, email: string, name: string, role: AdminUser['role'], grantedByEmail: string) {
  await setDoc(doc(db, 'admins', uid), {
    uid, email, name, role, createdAt: serverTimestamp(), createdBy: grantedByEmail,
  });
  await writeAuditLog('admin_invited', grantedByEmail, uid, `Granted admin access to ${email}`);
}

export async function revokeAdminRole(uid: string, email: string, revokedByEmail: string) {
  await deleteDoc(doc(db, 'admins', uid));
  await writeAuditLog('admin_removed', revokedByEmail, uid, `Revoked admin access for ${email}`);
}
