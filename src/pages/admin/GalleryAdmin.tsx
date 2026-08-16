import { ReactNode, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/shared/Modal';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { subscribeToGallery, uploadGalleryImage, deleteGalleryImage } from '@/services/content';
import { GALLERY_CATEGORIES } from '@/types';
import type { GalleryImage, GalleryCategory } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function GalleryAdmin() {
  const { admin } = useAuth();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<GalleryCategory>(GALLERY_CATEGORIES[0]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<GalleryImage | null>(null);

  useEffect(() => subscribeToGallery(setImages), []);

  async function handleUpload() {
    if (!admin || !file) return toast.error('Choose a photo to upload');
    setUploading(true);
    try {
      await uploadGalleryImage(file, category, caption.trim(), images.length, admin.email);
      toast.success('Photo uploaded');
      setModalOpen(false);
      setFile(null);
      setCaption('');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete || !admin) return;
    try {
      await deleteGalleryImage(confirmDelete, admin.email);
      toast.success('Photo removed');
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setConfirmDelete(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ivory">Gallery</h1>
          <p className="text-ivory/45 text-sm mt-1">{images.length} photos</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron text-charcoal font-semibold text-sm hover:bg-saffron-light">
          <Plus size={15} /> Upload Photo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square">
            <img src={img.imageUrl} alt={img.caption ?? ''} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <span className="text-[10px] text-ivory/80">{img.category}</span>
              <button
                onClick={() => setConfirmDelete(img)}
                className="self-end p-1.5 rounded-full bg-maroon/80 text-ivory hover:bg-maroon-light"
                aria-label="Delete photo"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {images.length === 0 && <p className="col-span-full text-center text-ivory/40 text-sm py-10">No photos uploaded yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload Photo">
        <div className="space-y-4">
          <Field label="Photo">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="input" />
          </Field>
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)} className="input">
              {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Caption (optional)">
            <input value={caption} onChange={(e) => setCaption(e.target.value)} className="input" />
          </Field>
          <button onClick={handleUpload} disabled={uploading} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Photo"
        message="Remove this photo from the gallery? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="block text-xs text-ivory/50 mb-1.5">{label}</label>{children}</div>;
}
