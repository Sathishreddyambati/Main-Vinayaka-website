import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  orderBy, query, serverTimestamp, Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Announcement, FestivalEvent, GalleryImage } from '@/types';
import { writeAuditLog } from './auditLogs';

// ---------- Events ----------
const eventsRef = collection(db, 'events');

export function subscribeToEvents(cb: (events: FestivalEvent[]) => void): Unsubscribe {
  const q = query(eventsRef, orderBy('date', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FestivalEvent))));
}

export async function saveEvent(id: string | null, input: Omit<FestivalEvent, 'id' | 'createdAt' | 'updatedAt'>, adminEmail: string) {
  if (id) {
    await updateDoc(doc(db, 'events', id), { ...input, updatedAt: serverTimestamp() });
    await writeAuditLog('event_updated', adminEmail, id, `Updated event "${input.title}"`);
  } else {
    const docRef = await addDoc(eventsRef, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    await writeAuditLog('event_created', adminEmail, docRef.id, `Created event "${input.title}"`);
  }
}

export async function deleteEvent(id: string, adminEmail: string) {
  await deleteDoc(doc(db, 'events', id));
  await writeAuditLog('event_deleted', adminEmail, id, 'Deleted a festival event');
}

// ---------- Announcements ----------
const announcementsRef = collection(db, 'announcements');

export function subscribeToAnnouncements(cb: (items: Announcement[]) => void): Unsubscribe {
  const q = query(announcementsRef, orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))));
}

export async function saveAnnouncement(id: string | null, input: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>, adminEmail: string) {
  if (id) {
    await updateDoc(doc(db, 'announcements', id), { ...input, updatedAt: serverTimestamp() });
    await writeAuditLog('announcement_updated', adminEmail, id, `Updated announcement "${input.title}"`);
  } else {
    const docRef = await addDoc(announcementsRef, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    await writeAuditLog('announcement_created', adminEmail, docRef.id, `Posted announcement "${input.title}"`);
  }
}

export async function deleteAnnouncement(id: string, adminEmail: string) {
  await deleteDoc(doc(db, 'announcements', id));
  await writeAuditLog('announcement_deleted', adminEmail, id, 'Deleted an announcement');
}

// ---------- Gallery ----------
const galleryRef = collection(db, 'gallery');

export function subscribeToGallery(cb: (images: GalleryImage[]) => void): Unsubscribe {
  const q = query(galleryRef, orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage))));
}

export async function uploadGalleryImage(
  file: File,
  category: GalleryImage['category'],
  caption: string,
  order: number,
  adminEmail: string
) {
  const storagePath = `gallery/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);
  const docRef = await addDoc(galleryRef, {
    imageUrl, storagePath, category, caption, order, createdAt: serverTimestamp(),
  });
  await writeAuditLog('gallery_uploaded', adminEmail, docRef.id, `Uploaded a gallery image (${category})`);
}

export async function deleteGalleryImage(image: GalleryImage, adminEmail: string) {
  await deleteDoc(doc(db, 'gallery', image.id));
  try {
    await deleteObject(ref(storage, image.storagePath));
  } catch (err) {
    console.error('Failed to delete storage object (Firestore doc already removed):', err);
  }
  await writeAuditLog('gallery_deleted', adminEmail, image.id, 'Deleted a gallery image');
}

// ---------- Generic image upload (hero art, branding, UPI QR) ----------
export async function uploadBrandingImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
