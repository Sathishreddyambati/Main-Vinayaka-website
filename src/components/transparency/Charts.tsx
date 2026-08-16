import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
// Deliberately minimal, structural prop shapes — these charts are used on
// both the public Transparency page (PublicDonation/PublicExpense, which
// never carry donor names or admin uids) and the admin Dashboard (full
// Donation/Expense). Amount, date, and category are never private.
type ChartDonation = { date: string; amount: number };
type ChartExpense = { date: string; amount: number; category: string };

const PALETTE = ['#E08A2C', '#B9863F', '#8C2130', '#F4C77B', '#6B1420', '#D9AE71', '#4A0D16', '#F0A94E', '#7A5A2E', '#3E2A17'];

function formatINR(v: number) {
  return `\u20B9${v.toLocaleString('en-IN')}`;
}

function tooltipStyle() {
  return {
    background: '#211B15',
    border: '1px solid rgba(185,134,63,0.3)',
    borderRadius: 8,
    color: '#F7F1E4',
    fontSize: 13,
  };
}

export function DonationTrendChart({ donations }: { donations: ChartDonation[] }) {
  const byDate = new Map<string, number>();
  for (const d of donations) byDate.set(d.date, (byDate.get(d.date) ?? 0) + d.amount);
  const data = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<{ date: string; cumulative: number }[]>((acc, [date, amt]) => {
      const prev = acc[acc.length - 1]?.cumulative ?? 0;
      acc.push({ date, cumulative: prev + amt });
      return acc;
    }, []);

  if (data.length === 0) return <EmptyChart label="No donations recorded yet" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="donationFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E08A2C" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#E08A2C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(185,134,63,0.1)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#F7F1E4', fontSize: 11, opacity: 0.5 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#F7F1E4', fontSize: 11, opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20B9${v / 1000}k`} />
        <Tooltip contentStyle={tooltipStyle()} formatter={(v: number) => formatINR(v)} />
        <Area type="monotone" dataKey="cumulative" stroke="#E08A2C" strokeWidth={2} fill="url(#donationFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ExpenseCategoryChart({ expenses }: { expenses: ChartExpense[] }) {
  const byCategory = new Map<string, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  const data = Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return <EmptyChart label="No expenses recorded yet" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle()} formatter={(v: number) => formatINR(v)} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#F7F1E4' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CollectionVsExpenseChart({ totalCollected, totalExpenses }: { totalCollected: number; totalExpenses: number }) {
  const data = [{ name: 'Funds', Collected: totalCollected, Spent: totalExpenses }];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" barGap={8}>
        <CartesianGrid stroke="rgba(185,134,63,0.1)" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#F7F1E4', fontSize: 11, opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20B9${v / 1000}k`} />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip contentStyle={tooltipStyle()} formatter={(v: number) => formatINR(v)} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#F7F1E4' }} />
        <Bar dataKey="Collected" fill="#E08A2C" radius={[4, 4, 4, 4]} />
        <Bar dataKey="Spent" fill="#6B1420" radius={[4, 4, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-ivory/30 text-sm">
      {label}
    </div>
  );
}
