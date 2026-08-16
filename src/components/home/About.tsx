import type { SiteSettings } from '@/types';

export default function About({ settings }: { settings: SiteSettings | null }) {
  return (
    <section className="max-w-4xl mx-auto px-5 sm:px-8 py-24 text-center">
      <p className="eyebrow mb-4">About Our Community</p>
      <h2 className="font-display text-3xl sm:text-4xl text-ivory mb-6">A festival built by hands, not budgets</h2>
      <p className="text-ivory/70 leading-relaxed text-base sm:text-lg whitespace-pre-line">
        {settings?.aboutText ?? 'Add your community\u2019s story from Admin \u2192 Website Settings.'}
      </p>
    </section>
  );
}
