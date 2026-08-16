import { CalendarDays, Clock, MapPin } from 'lucide-react';
import type { FestivalEvent } from '@/types';

export default function Schedule({ events }: { events: FestivalEvent[] }) {
  return (
    <section id="schedule" className="max-w-5xl mx-auto px-5 sm:px-8 py-24">
      <div className="text-center mb-14">
        <p className="eyebrow mb-4">Ten Sacred Days</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ivory">Festival Schedule</h2>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-ivory/40 text-sm">Schedule will be published soon — check back closer to the festival.</p>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="hairline first:border-t-0 pt-6 first:pt-0 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
            >
              <div className="sm:w-40 shrink-0 flex items-center gap-2 text-copper-light text-sm">
                <CalendarDays size={15} />
                {new Date(`${e.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-ivory">{e.title}</h3>
                {e.description && <p className="text-ivory/60 text-sm mt-1">{e.description}</p>}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-ivory/50">
                  {e.time && <span className="flex items-center gap-1"><Clock size={12} /> {e.time}</span>}
                  {e.location && <span className="flex items-center gap-1"><MapPin size={12} /> {e.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
