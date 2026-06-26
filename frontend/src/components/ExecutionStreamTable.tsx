import { Search, MoreHorizontal, Filter, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const mockData = [
  { id: 'EXE-1011', status: 'Success', workflow: 'Order Sync Bot', node: 'Data Transform', time: '10:30 AM' },
  { id: 'EXE-1012', status: 'Running', workflow: 'Customer De-dupe', node: 'Merge Records', time: '10:31 AM' },
  { id: 'EXE-1013', status: 'Failed', workflow: 'Inventory Restock', node: 'Stock API Call', time: '10:32 AM' },
  { id: 'EXE-1014', status: 'Failed', workflow: 'Scheduled Report', node: 'Start Task', time: '10:33 AM' },
  { id: 'EXE-1015', status: 'Queued', workflow: 'Scheduled Report', node: 'Start Task', time: '10:33 AM' },
  { id: 'EXE-1016', status: 'Queued', workflow: 'Scheduled Reporting', node: 'Merge Records', time: '10:33 AM' },
  { id: 'EXE-1017', status: 'Running', workflow: 'Inventory Restock', node: 'Stock API Call', time: '10:32 AM' },
];

export default function ExecutionStreamTable({ executions = [] }: { executions?: any[] }) {
  // Use real executions if provided, otherwise mock data for visual demo
  const displayData = executions.length > 0 ? executions : mockData;

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'running': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'failed': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'queued': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'success': return 'bg-emerald-400';
      case 'running': return 'bg-indigo-400';
      case 'failed': return 'bg-rose-400';
      case 'queued': return 'bg-neutral-400';
      default: return 'bg-neutral-400';
    }
  };

  return (
    <div className="bg-[#121821] border border-[#1F2937] rounded-xl flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 border-b border-[#1F2937]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Recent Execution Stream</h3>
          <button className="flex items-center gap-1.5 text-xs text-neutral-400 bg-[#1B2433] px-2 py-1 rounded border border-[#2D3748] hover:text-white transition-colors">
            <Filter size={12} /> Filters <ChevronDown size={12} />
          </button>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1.5 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#161B22] border border-[#2D3748] rounded-md py-1 pl-8 pr-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="w-32 bg-[#161B22] border border-[#2D3748] rounded-md px-3 py-1 flex items-center justify-between text-xs text-neutral-400 cursor-pointer">
            Workflow Type <ChevronDown size={12} />
          </div>
          <div className="w-24 bg-[#161B22] border border-[#2D3748] rounded-md px-3 py-1 flex items-center justify-between text-xs text-neutral-400 cursor-pointer">
            Status <ChevronDown size={12} />
          </div>
          <div className="w-24 bg-[#161B22] border border-[#2D3748] rounded-md px-3 py-1 flex items-center justify-between text-xs text-neutral-400 cursor-pointer">
            Date <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left text-neutral-400">
          <thead className="bg-[#161B22] text-neutral-500 uppercase font-semibold sticky top-0 z-10 border-b border-[#1F2937]">
            <tr>
              <th className="px-4 py-2 font-medium tracking-wider">Execution ID</th>
              <th className="px-4 py-2 font-medium tracking-wider">Status</th>
              <th className="px-4 py-2 font-medium tracking-wider">Workflow</th>
              <th className="px-4 py-2 font-medium tracking-wider">Last Node</th>
              <th className="px-4 py-2 font-medium tracking-wider">Started</th>
              <th className="px-4 py-2 font-medium tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]">
            {displayData.map((exec, idx) => {
              const statusText = exec.status || 'Unknown';
              const dotColor = getStatusDotColor(statusText);
              
              return (
                <tr key={idx} className="hover:bg-[#1A222D] transition-colors cursor-pointer group">
                  <td className="px-4 py-2.5 font-mono text-neutral-300">
                    {exec.id || `EXE-${exec._id?.slice(-4).toUpperCase()}`}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5', getStatusColor(statusText))}>
                        {statusText === 'Success' && <span>✓</span>}
                        {statusText === 'Failed' && <span>×</span>}
                        {statusText === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                        {statusText}
                      </span>
                      <div className="flex gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <div className={cn("w-1 h-1 rounded-full", dotColor)}></div>
                        <div className={cn("w-1 h-1 rounded-full", dotColor)}></div>
                        <div className={cn("w-1 h-1 rounded-full", dotColor)}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-200">{exec.workflow || exec.workflowId?.name}</td>
                  <td className="px-4 py-2.5">{exec.node || 'Unknown'}</td>
                  <td className="px-4 py-2.5">{exec.time || new Date(exec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button className="text-neutral-500 hover:text-white px-2 py-0.5 border border-[#2D3748] rounded bg-[#161B22]">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
