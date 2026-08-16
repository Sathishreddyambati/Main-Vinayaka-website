import { useEffect, useState } from 'react';

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  };
}

export default function Countdown({ startDate }: { startDate: string }) {
  const target = new Date(`${startDate}T00:00:00`);
  const [remaining, setRemaining] = useState(getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  const units = [
    { label: 'Days', value: remaining.days },
    { label: 'Hours', value: remaining.hours },
    { label: 'Minutes', value: remaining.minutes },
    { label: 'Seconds', value: remaining.seconds },
  ];

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 -mt-16 relative z-20">
      <div className="card-glass rounded-2xl px-6 py-8 sm:px-10 sm:py-10 grid grid-cols-4 gap-4 sm:gap-8">
        {units.map((u) => (
          <div key={u.label} className="text-center">
            <div className="font-display text-3xl sm:text-5xl text-gradient-gold tabular-nums">
              {String(u.value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-ivory/50">
              {u.label}
            </div>
          </div>
        ))}
      </div>
      {remaining.done && (
        <p className="text-center mt-4 text-saffron-light text-sm">The celebration has begun — Ganpati Bappa Morya!</p>
      )}
    </section>
  );
}
