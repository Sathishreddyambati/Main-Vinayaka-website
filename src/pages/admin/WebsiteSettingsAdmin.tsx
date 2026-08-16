import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeToSiteSettings, saveSiteSettings } from '@/services/settings';
import { uploadBrandingImage } from '@/services/content';
import type { SiteSettings } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function WebsiteSettingsAdmin() {
  const { admin } = useAuth();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToSiteSettings((s) => {
    setForm(s);
    setHeroPreview(s.heroImageUrl ?? '');
  }), []);

  function onHeroChange(f: File | null) {
    setHeroFile(f);
    if (f) setHeroPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!admin || !form) return;
    setSaving(true);
    try {
      let heroImageUrl = form.heroImageUrl;
      if (heroFile) {
        heroImageUrl = await uploadBrandingImage(heroFile, `branding/hero-${Date.now()}-${heroFile.name}`);
      }
      const { updatedAt: _omit, ...rest } = form;
      await saveSiteSettings({ ...rest, heroImageUrl }, admin.email);
      toast.success('Website settings saved');
      setHeroFile(null);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return null;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-ivory mb-1">Website Settings</h1>
      <p className="text-ivory/45 text-sm mb-8">Controls the homepage hero, countdown date, community text and contact footer.</p>

      <div className="card-glass rounded-2xl p-6 space-y-5">
        <Field label="Festival Name">
          <input value={form.festivalName} onChange={(e) => setForm({ ...form, festivalName: e.target.value })} className="input" />
        </Field>
        <Field label="Tagline">
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input" />
        </Field>
        <Field label="Festival Start Date (drives the countdown)">
          <input type="date" value={form.festivalStartDate} onChange={(e) => setForm({ ...form, festivalStartDate: e.target.value })} className="input" />
        </Field>
        <Field label="Hero Artwork (Ganesha image)">
          {heroPreview && <img src={heroPreview} alt="Hero preview" className="w-full h-32 object-cover rounded-lg mb-3" />}
          <input type="file" accept="image/*" onChange={(e) => onHeroChange(e.target.files?.[0] ?? null)} className="input" />
        </Field>
        <Field label="About / Community Story">
          <textarea rows={4} value={form.aboutText} onChange={(e) => setForm({ ...form, aboutText: e.target.value })} className="input" />
        </Field>
        <Field label="Community Message">
          <textarea rows={3} value={form.communityMessage} onChange={(e) => setForm({ ...form, communityMessage: e.target.value })} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Email">
            <input value={form.contactEmail ?? ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="input" />
          </Field>
          <Field label="Contact Phone">
            <input value={form.contactPhone ?? ''} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="input" />
          </Field>
        </div>
        <Field label="Address">
          <input value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
        </Field>

        <button onClick={handleSave} disabled={saving} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Website Settings'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="block text-xs text-ivory/50 mb-1.5">{label}</label>{children}</div>;
}
