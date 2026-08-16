import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SiteSettings } from '@/types';

const EMBER_COUNT = 22;

export default function Hero({ settings }: { settings: SiteSettings | null }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function onScroll() {
      if (!heroRef.current) return;
      setOffset(window.scrollY * 0.35);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const embers = Array.from({ length: EMBER_COUNT }, (_, i) => ({
    left: `${(i * 97) % 100}%`,
    delay: `${(i * 0.6) % 5}s`,
    duration: `${4 + (i % 5)}s`,
  }));

  return (
    <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background layer: replaceable Ganesha artwork or atmospheric fallback */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${offset}px)` }}
      >
        {settings?.heroImageUrl ? (
          <img
            src={settings.heroImageUrl}
            alt="Lord Ganesha, Vinayaka Chaturthi 2026"
            className="w-full h-[120%] object-cover object-top opacity-70"
          />
        ) : (
          <div className="w-full h-[120%] bg-gradient-to-b from-maroon-dark via-charcoal to-charcoal" />
        )}
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute inset-0 bg-radial-glow" />
      </div>

      <div className="ember-field">
        {embers.map((e, i) => (
          <span
            key={i}
            className="ember-particle animate-ember"
            style={{ left: e.left, animationDelay: e.delay, animationDuration: e.duration }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full text-center">
        <p className="eyebrow mb-5 animate-rise">MMR Youth Force presents</p>
        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-ivory animate-rise" style={{ animationDelay: '0.1s' }}>
          <span className="block">Vinayaka</span>
          <span className="block text-gradient-gold italic">Chaturthi 2026</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-ivory/70 tracking-wide animate-rise" style={{ animationDelay: '0.2s' }}>
          {settings?.tagline ?? 'Our Faith. Our Festival. Our Community.'}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-rise" style={{ animationDelay: '0.3s' }}>
          <a
            href="#schedule"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-saffron text-charcoal font-semibold text-sm tracking-wide hover:bg-saffron-light transition-colors inline-flex items-center justify-center gap-2"
          >
            Explore Festival <ArrowRight size={16} />
          </a>
          <Link
            to="/transparency"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-copper/40 text-ivory text-sm tracking-wide hover:border-saffron hover:text-saffron transition-colors inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} /> View Transparency
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-14 bg-gradient-to-b from-copper/60 to-transparent" />
    </section>
  );
}
