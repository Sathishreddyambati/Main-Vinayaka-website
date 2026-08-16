import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: ReactNode;
  accent?: 'saffron' | 'maroon' | 'copper';
}

const accentMap = {
  saffron: 'text-saffron-light',
  maroon: 'text-maroon-light',
  copper: 'text-copper-light',
};

export default function StatCard({ label, value, sublabel, icon, accent = 'copper' }: StatCardProps) {
  return (
    <div className="card-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow">{label}</span>
        <span className={accentMap[accent]}>{icon}</span>
      </div>
      <div className="font-display text-3xl sm:text-4xl text-ivory tabular-nums">{value}</div>
      {sublabel && <p className="mt-1 text-xs text-ivory/45">{sublabel}</p>}
    </div>
  );
}
