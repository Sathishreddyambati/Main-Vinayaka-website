import { collection, addDoc, onSnapshot, orderBy, query, limit, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AuditAction, AuditLog } from '@/types';

const auditRef = collection(db, 'auditLogs');

export async function writeAuditLog(action: AuditAction, performedBy: string, targetId: string | undefined, summary: string) {
  try {
    await addDoc(auditRef, { action, performedBy, targetId: targetId ?? null, summary, createdAt: serverTimestamp() });
  } catch (err) {
    // Audit logging must never block the primary admin action from succeeding.
    console.error('Failed to write audit log', err);
  }
}

export function subscribeToRecentAuditLogs(cb: (logs: AuditLog[]) => void, count = 25): Unsubscribe {
  const q = query(auditRef, orderBy('createdAt', 'desc'), limit(count));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog)));
  });
}
