import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts';

const barData = [
  { name: 'n1', nodes: 200, time: 50 },
  { name: 'n2', nodes: 350, time: 80 },
  { name: 'n3', nodes: 150, time: 30 },
  { name: 'n4', nodes: 300, time: 60 },
  { name: 'n5', nodes: 180, time: 40 },
  { name: 'n6', nodes: 320, time: 90 },
  { name: 'n7', nodes: 250, time: 70 },
  { name: 'n8', nodes: 190, time: 40 },
];

export default function NodalTraffic() {
  return (
    <div className="bg-[#121821] border border-[#1F2937] rounded-xl p-4 flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">Nodal Activity & Traffic</h3>
      
      {/* Simulated Network Graph */}
      <div className="flex-1 relative min-h-[160px] w-full flex items-center justify-center">
        {/* Draw a static SVG for the web to look like the image */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid meet">
          <line x1="50" y1="50" x2="100" y2="80" stroke="#374151" strokeWidth="1" />
          <line x1="100" y1="80" x2="150" y2="60" stroke="#374151" strokeWidth="1" />
          <line x1="100" y1="80" x2="80" y2="120" stroke="#374151" strokeWidth="1" />
          <line x1="80" y1="120" x2="130" y2="130" stroke="#374151" strokeWidth="1" />
          <line x1="150" y1="60" x2="160" y2="100" stroke="#374151" strokeWidth="1" />
          <line x1="160" y1="100" x2="130" y2="130" stroke="#374151" strokeWidth="1" />
          <line x1="50" y1="50" x2="70" y2="90" stroke="#374151" strokeWidth="1" />
          <line x1="70" y1="90" x2="80" y2="120" stroke="#374151" strokeWidth="1" />
          <line x1="150" y1="60" x2="120" y2="30" stroke="#374151" strokeWidth="1" />
          <line x1="100" y1="80" x2="120" y2="30" stroke="#374151" strokeWidth="1" />
          <line x1="120" y1="30" x2="80" y2="40" stroke="#374151" strokeWidth="1" />
          <line x1="80" y1="40" x2="50" y2="50" stroke="#374151" strokeWidth="1" />

          {/* Nodes */}
          <circle cx="50" cy="50" r="4" fill="#14b8a6" />
          <circle cx="100" cy="80" r="6" fill="#f59e0b" />
          <circle cx="150" cy="60" r="4" fill="#14b8a6" />
          <circle cx="80" cy="120" r="5" fill="#f59e0b" />
          <circle cx="130" cy="130" r="7" fill="#14b8a6" />
          <circle cx="160" cy="100" r="4" fill="#f59e0b" />
          <circle cx="70" cy="90" r="3" fill="#14b8a6" />
          <circle cx="120" cy="30" r="5" fill="#f59e0b" />
          <circle cx="80" cy="40" r="3" fill="#14b8a6" />
        </svg>
      </div>

      {/* Bar Chart Below */}
      <div className="h-[80px] w-full -ml-4 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2} barSize={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
            <XAxis dataKey="name" hide />
            <Tooltip 
              cursor={{fill: '#1F2937'}}
              contentStyle={{ backgroundColor: '#111827', borderColor: '#1F2937', color: '#fff', fontSize: '10px' }}
            />
            <Bar dataKey="nodes" fill="#14b8a6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="time" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-[10px] text-neutral-500 font-medium px-6 mt-1 uppercase tracking-wider">
          <span>Nodes per workflow</span>
          <span>Processing Time</span>
        </div>
      </div>
    </div>
  );
}
