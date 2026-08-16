import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Announcements from '@/components/home/Announcements';
import { subscribeToAnnouncements } from '@/services/content';
import { subscribeToSiteSettings } from '@/services/settings';
import type { Announcement, SiteSettings } from '@/types';

export default function Updates() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const u1 = subscribeToAnnouncements(setAnnouncements);
    const u2 = subscribeToSiteSettings(setSettings);
    return () => { u1(); u2(); };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-8">
        {announcements.length === 0 ? (
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-24 text-center">
            <p className="eyebrow mb-4">Stay Informed</p>
            <h1 className="font-display text-3xl sm:text-4xl text-ivory mb-4">Updates</h1>
            <p className="text-ivory/40 text-sm">No updates posted yet — check back soon.</p>
          </div>
        ) : (
          <Announcements announcements={announcements} />
        )}
      </div>
      <Footer settings={settings} />
    </div>
  );
}
