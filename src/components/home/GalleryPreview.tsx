import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { GalleryImage } from '@/types';

export default function GalleryPreview({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;
  const preview = images.slice(0, 6);

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="eyebrow mb-4">Moments of Devotion</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ivory">Gallery</h2>
        </div>
        <Link to="/gallery" className="hidden sm:flex items-center gap-1 text-sm text-copper-light hover:text-saffron transition-colors">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {preview.map((img, i) => (
          <div
            key={img.id}
            className={`overflow-hidden rounded-lg ${i === 0 ? 'col-span-2 row-span-2 aspect-square sm:aspect-auto sm:h-full' : 'aspect-square'}`}
          >
            <img
              src={img.imageUrl}
              alt={img.caption ?? 'Festival photo'}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
      <Link to="/gallery" className="sm:hidden mt-6 flex items-center justify-center gap-1 text-sm text-copper-light">
        View all <ArrowUpRight size={14} />
      </Link>
    </section>
  );
}
