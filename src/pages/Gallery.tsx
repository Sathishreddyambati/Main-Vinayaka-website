import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { subscribeToGallery } from '@/services/content';
import { subscribeToSiteSettings } from '@/services/settings';
import { GALLERY_CATEGORIES } from '@/types';
import type { GalleryImage, SiteSettings } from '@/types';
import clsx from 'clsx';

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    const u1 = subscribeToGallery(setImages);
    const u2 = subscribeToSiteSettings(setSettings);
    return () => { u1(); u2(); };
  }, []);

  const filtered = filter === 'All' ? images : images.filter((i) => i.category === filter);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (viewerIndex === null) return;
      if (e.key === 'Escape') setViewerIndex(null);
      if (e.key === 'ArrowRight') setViewerIndex((i) => (i === null ? null : Math.min(i + 1, filtered.length - 1)));
      if (e.key === 'ArrowLeft') setViewerIndex((i) => (i === null ? null : Math.max(i - 1, 0)));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerIndex, filtered.length]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <p className="eyebrow mb-4 text-center">Moments of Devotion</p>
        <h1 className="font-display text-3xl sm:text-4xl text-ivory text-center mb-10">Festival Gallery</h1>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['All', ...GALLERY_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs tracking-wide border transition-colors',
                filter === cat
                  ? 'bg-saffron text-charcoal border-saffron font-semibold'
                  : 'border-copper/25 text-ivory/60 hover:border-copper hover:text-ivory'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-ivory/40 text-sm py-20">No photos in this category yet.</p>
        ) : (
          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {filtered.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setViewerIndex(i)}
                className="block w-full break-inside-avoid rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron"
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption ?? 'Festival photo'}
                  loading="lazy"
                  className="w-full h-auto hover:scale-105 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        )}
      </section>
      <Footer settings={settings} />

      {viewerIndex !== null && filtered[viewerIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setViewerIndex(null)}
            className="absolute top-5 right-5 text-ivory/70 hover:text-ivory"
            aria-label="Close viewer"
          >
            <X size={28} />
          </button>
          {viewerIndex > 0 && (
            <button
              onClick={() => setViewerIndex((i) => (i === null ? null : i - 1))}
              className="absolute left-3 sm:left-8 text-ivory/60 hover:text-ivory"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          <figure className="max-w-4xl max-h-[85vh] px-4">
            <img
              src={filtered[viewerIndex].imageUrl}
              alt={filtered[viewerIndex].caption ?? 'Festival photo'}
              className="max-h-[75vh] w-auto mx-auto object-contain rounded"
            />
            {filtered[viewerIndex].caption && (
              <figcaption className="text-center text-ivory/60 text-sm mt-4">{filtered[viewerIndex].caption}</figcaption>
            )}
          </figure>
          {viewerIndex < filtered.length - 1 && (
            <button
              onClick={() => setViewerIndex((i) => (i === null ? null : i + 1))}
              className="absolute right-3 sm:right-8 text-ivory/60 hover:text-ivory"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
