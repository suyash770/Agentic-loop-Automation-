import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PipelineVelocity({ data }: { data?: { time: string, executions: number, errors: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#121821] border border-[#1F2937] rounded-xl p-4 flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] items-center justify-center">
        <div className="text-neutral-500 animate-pulse">Loading Velocity Data...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#121821] border border-[#1F2937] rounded-xl p-4 flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Pipeline Velocity & Health</h3>
        <div className="flex items-center gap-4 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-teal-500 rounded-sm"></div> Executions
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-500 rounded-sm"></div> Errors
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px] -ml-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dx={-10} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dx={10} tickFormatter={(v) => `${v}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="executions" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorExecutions)" />
            <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
