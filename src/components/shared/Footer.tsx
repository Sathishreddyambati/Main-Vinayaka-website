import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { SiteSettings } from '@/types';

export default function Footer({ settings }: { settings: SiteSettings | null }) {
  return (
    <footer id="contact" className="hairline mt-24 bg-charcoal-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid gap-10 sm:grid-cols-3">
        <div>
          <h4 className="font-display text-lg text-ivory mb-2">MMR Youth Force</h4>
          <p className="text-ivory/60 text-sm leading-relaxed">
            {settings?.tagline ?? 'Our Faith. Our Festival. Our Community.'}
          </p>
        </div>
        <div>
          <h5 className="eyebrow mb-3">Contact</h5>
          <ul className="space-y-2 text-sm text-ivory/70">
            {settings?.contactEmail && (
              <li className="flex items-center gap-2"><Mail size={14} className="text-copper" /> {settings.contactEmail}</li>
            )}
            {settings?.contactPhone && (
              <li className="flex items-center gap-2"><Phone size={14} className="text-copper" /> {settings.contactPhone}</li>
            )}
            {settings?.address && (
              <li className="flex items-center gap-2"><MapPin size={14} className="text-copper" /> {settings.address}</li>
            )}
            {!settings?.contactEmail && !settings?.contactPhone && !settings?.address && (
              <li className="text-ivory/40 italic">Set from Admin \u2192 Website Settings</li>
            )}
          </ul>
        </div>
        <div>
          <h5 className="eyebrow mb-3">Explore</h5>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link to="/transparency" className="hover:text-saffron">Financial Transparency</Link></li>
            <li><Link to="/gallery" className="hover:text-saffron">Festival Gallery</Link></li>
            <li><Link to="/admin/login" className="hover:text-saffron">Admin Login</Link></li>
          </ul>
        </div>
      </div>
      <div className="hairline text-center text-xs text-ivory/30 py-5">
        © {new Date().getFullYear()} MMR Youth Force. Built with devotion for the community.
      </div>
    </footer>
  );
}
