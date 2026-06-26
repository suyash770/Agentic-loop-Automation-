import { Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const AgentRow = ({ title, percentage, color, data }: any) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-[#121821] border border-[#1F2937] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
    <div className="flex items-center gap-3">
      <div className={`p-1.5 rounded-md bg-[#1B2433] text-${color}-400`}>
        <Activity size={14} />
      </div>
      <span className="text-xs font-medium text-neutral-300">{title}</span>
    </div>
    
    <div className="w-16 h-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color === 'amber' ? '#f59e0b' : color === 'teal' ? '#14b8a6' : '#ec4899'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    
    <span className={`text-sm font-bold text-${color}-400 w-12 text-right`}>{percentage}</span>
  </div>
);

export default function AgentInsights() {
  const d1 = Array.from({ length: 10 }, () => ({ value: Math.random() * 100 }));
  const d2 = Array.from({ length: 10 }, () => ({ value: Math.random() * 100 }));
  const d3 = Array.from({ length: 10 }, () => ({ value: Math.random() * 100 }));

  return (
    <div className="flex flex-col gap-2 h-full justify-between">
      <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-1">AI Insights & Agent Logs</h3>
      <div className="flex flex-col gap-2 flex-1 justify-center">
        <AgentRow title="Agent Health" percentage="301%" color="amber" data={d1} />
        <AgentRow title="Agent Health" percentage="95%" color="teal" data={d2} />
        <AgentRow title="Agent Health" percentage="45%" color="amber" data={d3} />
      </div>
    </div>
  );
}
