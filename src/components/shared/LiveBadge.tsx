export default function LiveBadge({ label = 'Live' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-saffron-light font-semibold">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-saffron animate-pulse-live" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
      </span>
      {label}
    </span>
  );
}
