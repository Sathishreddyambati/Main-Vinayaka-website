import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Hero from '@/components/home/Hero';
import Countdown from '@/components/home/Countdown';
import About from '@/components/home/About';
import Schedule from '@/components/home/Schedule';
import Announcements from '@/components/home/Announcements';
import GalleryPreview from '@/components/home/GalleryPreview';
import { CommunityMessage, Support } from '@/components/home/Support';
import { subscribeToSiteSettings, subscribeToPaymentSettings } from '@/services/settings';
import { subscribeToEvents, subscribeToAnnouncements, subscribeToGallery } from '@/services/content';
import type { SiteSettings, PaymentSettings, FestivalEvent, Announcement as AnnouncementT, GalleryImage } from '@/types';

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementT[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const unsubs = [
      subscribeToSiteSettings(setSettings),
      subscribeToPaymentSettings(setPayment),
      subscribeToEvents(setEvents),
      subscribeToAnnouncements(setAnnouncements),
      subscribeToGallery(setGallery),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero settings={settings} />
      {settings?.festivalStartDate && <Countdown startDate={settings.festivalStartDate} />}
      <About settings={settings} />
      <Schedule events={events} />
      <Announcements announcements={announcements} />
      <GalleryPreview images={gallery} />
      <CommunityMessage settings={settings} />
      <Support payment={payment} />
      <Footer settings={settings} />
    </div>
  );
}
