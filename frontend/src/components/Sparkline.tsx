import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data, color = '#6366f1' }: { data: { date: string, count: number }[], color?: string }) {
  if (!data || data.length === 0) return <div className="h-full w-full bg-neutral-800/20 rounded animate-pulse"></div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`colorGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke={color} 
          fillOpacity={1} 
          fill={`url(#colorGradient-${color.replace('#', '')})`} 
          strokeWidth={2}
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
