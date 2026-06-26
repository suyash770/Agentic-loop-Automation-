import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Rocket } from 'lucide-react';

const data = [
  { name: 'RPA', value: 45, color: '#14b8a6' },
  { name: 'ETL', value: 30, color: '#f59e0b' },
  { name: 'AI Agents', value: 25, color: '#8b5cf6' },
];

export default function WorkflowDistribution() {
  return (
    <div className="bg-[#121821] border border-[#1F2937] rounded-xl p-4 flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-2">Workflow Distribution</h3>
      
      <div className="flex-1 flex items-center justify-between">
        <div className="relative w-28 h-28 flex items-center justify-center ml-2">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-teal-500/5 rounded-full blur-xl"></div>
          
          {/* Center Icon */}
          <div className="absolute z-10 flex items-center justify-center">
             <Rocket className="text-teal-500/50" size={24} />
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5 w-1/2">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1">Workflow Types</div>
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: item.color }}></div>
              <span className="text-xs font-medium text-neutral-300">{item.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
             <div className="w-3 h-3 rounded-[3px] bg-teal-500/30 border border-teal-500/50"></div>
             <span className="text-xs font-medium text-neutral-400">AI Agents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
