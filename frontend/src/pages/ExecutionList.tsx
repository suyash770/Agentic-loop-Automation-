import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Search, Filter } from 'lucide-react';

interface Execution {
  _id: string;
  workflowId: { _id: string; name: string };
  status: string;
  createdAt: string;
  completedAt?: string;
}

export default function ExecutionList() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/executions');
        const data = await res.json();
        setExecutions(data);
      } catch (error) {
        console.error("Failed to fetch executions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, []);

  const filteredExecutions = executions.filter(exec => 
    exec._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (exec.workflowId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    exec.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return '-';
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return ((e - s) / 1000).toFixed(1) + 's';
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-indigo-400" />
            Execution Monitor
          </h1>
          <p className="text-neutral-400 mt-1">Live updates of all workflow runs.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text" 
              placeholder="Search workflows, IDs, or status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </header>

      <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/50 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-950/80 border-b border-neutral-800 text-sm font-medium text-neutral-400">
              <th className="p-4">Execution ID</th>
              <th className="p-4">Workflow</th>
              <th className="p-4">Status</th>
              <th className="p-4">Time</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">Loading executions...</td>
              </tr>
            ) : filteredExecutions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">No executions found.</td>
              </tr>
            ) : (
              filteredExecutions.map((exec) => (
                <tr key={exec._id} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-4 font-mono text-sm text-neutral-300">{exec._id}</td>
                  <td className="p-4 font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {exec.workflowId?.name || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={exec.status} />
                  </td>
                  <td className="p-4 text-neutral-400 text-sm">{new Date(exec.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-neutral-400 text-sm">{calculateDuration(exec.createdAt, exec.completedAt)}</td>
                  <td className="p-4 text-right">
                    <Link 
                      to={`/executions/${exec._id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                    >
                      View Logs
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Success') return <span className="px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">Success</span>;
  if (status === 'Running') return <span className="px-3 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 animate-pulse">Running</span>;
  if (status === 'Pending') return <span className="px-3 py-1 text-xs font-medium bg-neutral-500/10 text-neutral-400 rounded-full border border-neutral-500/20">Pending</span>;
  if (status === 'Failed') return <span className="px-3 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full border border-red-500/20">Failed</span>;
  return null;
}
