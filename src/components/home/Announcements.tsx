import { Megaphone } from 'lucide-react';
import type { Announcement } from '@/types';
import clsx from 'clsx';

const priorityStyles: Record<Announcement['priority'], string> = {
  urgent: 'border-maroon-light/50 bg-maroon/10',
  important: 'border-saffron/40 bg-saffron/5',
  normal: 'border-copper/15',
};

export default function Announcements({ announcements }: { announcements: Announcement[] }) {
  if (announcements.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-5 sm:px-8 py-24">
      <div className="text-center mb-14">
        <p className="eyebrow mb-4">Stay Informed</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ivory">Announcements</h2>
      </div>
      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className={clsx('rounded-xl border p-5', priorityStyles[a.priority])}>
            <div className="flex items-start gap-3">
              <Megaphone size={16} className="text-saffron mt-1 shrink-0" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-ivory">{a.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest text-ivory/40">
                    {new Date(`${a.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-ivory/65 text-sm leading-relaxed">{a.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
