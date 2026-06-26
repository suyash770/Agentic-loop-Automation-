import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Filter } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UpcomingSchedule({ heatmap }: { heatmap?: { date: string, count: number }[] }) {
  // Generate a mock github-style heatmap for the UI if no data provided
  const weeks = 20;
  const daysPerWeek = 7;
  const grid = [];

  // Flatten the heatmap data for easier lookups
  const dataMap = new Map();
  if (heatmap) {
    heatmap.forEach((item, idx) => {
      // For a 30 day history, let's map them to the last 30 cells of the grid
      dataMap.set(weeks * daysPerWeek - 30 + idx, item.count);
    });
  }

  let cellIndex = 0;
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < daysPerWeek; d++) {
      let colorClass = 'bg-[#1B2433]'; // Empty
      
      const count = dataMap.get(cellIndex);
      if (count !== undefined) {
        if (count > 0) colorClass = 'bg-[#14b8a6]/20';
        if (count > 2) colorClass = 'bg-[#14b8a6]/50';
        if (count > 5) colorClass = 'bg-[#14b8a6] shadow-[0_0_8px_rgba(20,184,166,0.5)]';
        if (count > 10) colorClass = 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]'; // Amber spike
      } else if (!heatmap || heatmap.length === 0) {
        // Fallback to random if no data at all
        const rand = Math.random();
        if (rand > 0.6) colorClass = 'bg-[#14b8a6]/20';
        if (rand > 0.8) colorClass = 'bg-[#14b8a6]/50';
        if (rand > 0.9) colorClass = 'bg-[#14b8a6] shadow-[0_0_8px_rgba(20,184,166,0.5)]';
        if (rand > 0.95) colorClass = 'bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.5)]'; // Amber spike
      }

      col.push(colorClass);
      cellIndex++;
    }
    grid.push(col);
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div className="bg-[#121821] border border-[#1F2937] rounded-xl p-4 flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Upcoming Schedule</h3>
        <button className="flex items-center gap-1.5 text-xs text-neutral-400 bg-[#1B2433] px-2 py-1 rounded border border-[#2D3748] hover:text-white transition-colors">
           <Filter size={12} /> Filters <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="flex text-[10px] text-neutral-500 mb-1 ml-6 space-x-6">
          {months.slice(0, 6).map((m, i) => <span key={i} className="w-8">{m}</span>)}
        </div>
        
        <div className="flex">
          <div className="flex flex-col text-[10px] text-neutral-500 justify-between mr-2 h-[100px]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
          
          <div className="flex gap-1 overflow-hidden h-[100px]">
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col justify-between h-full">
                {col.map((colorClass, dayIdx) => (
                  <div
                    key={`${colIdx}-${dayIdx}`}
                    className={cn('w-3 h-3 rounded-[2px] transition-all cursor-crosshair', colorClass)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
