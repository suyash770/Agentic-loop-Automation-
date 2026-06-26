import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, Plus, Power, Edit2, Play, TerminalSquare, Copy, CheckCircle2 } from 'lucide-react';

interface Workflow {
  _id: string;
  name: string;
  isActive: boolean;
  nodes: any[];
  createdAt: string;
}

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/workflows');
      const data = await res.json();
      setWorkflows(data);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault(); // prevent navigation
    try {
      const res = await fetch(`http://localhost:5000/api/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setWorkflows(workflows.map(w => w._id === id ? { ...w, isActive: !currentStatus } : w));
      }
    } catch (error) {
      console.error("Failed to toggle status", error);
    }
  };

  const copyWebhook = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/webhooks/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerRun = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/api/webhooks/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'ManualRun' })
      });
      alert('Execution triggered successfully!');
    } catch (error) {
      console.error("Failed to trigger", error);
      alert('Failed to trigger execution');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-neutral-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitMerge className="text-teal-400" />
            Workflows
          </h1>
          <p className="text-neutral-400 mt-1">Manage, edit, and trigger your automation sequences.</p>
        </div>
        <Link 
          to="/workflows/new" 
          className="bg-teal-500 hover:bg-teal-400 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] flex items-center gap-2"
        >
          <Plus size={20} />
          Create Workflow
        </Link>
      </header>

      {loading ? (
        <div className="p-12 text-center text-neutral-500 font-mono animate-pulse">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="bg-[#121821] border border-neutral-800 rounded-2xl p-16 text-center shadow-xl">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitMerge size={32} className="text-neutral-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No workflows yet</h3>
          <p className="text-neutral-400 mb-6 max-w-md mx-auto">Create your first automated sequence to start handling webhooks, scraping data, or orchestrating APIs.</p>
          <Link to="/workflows/new" className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            <Plus size={18} /> Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Link 
              key={workflow._id}
              to={`/workflows/${workflow._id}`}
              className="bg-[#121821] border border-[#1F2937] rounded-2xl p-6 shadow-xl hover:border-teal-500/50 transition-colors group flex flex-col relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1 ${workflow.isActive ? 'bg-teal-500' : 'bg-neutral-700'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">{workflow.name}</h3>
                <button 
                  onClick={(e) => toggleStatus(workflow._id, workflow.isActive, e)}
                  className={`p-1.5 rounded-lg border transition-colors ${workflow.isActive ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20' : 'bg-neutral-800 border-neutral-700 text-neutral-500 hover:bg-neutral-700'}`}
                  title={workflow.isActive ? "Deactivate Workflow" : "Activate Workflow"}
                >
                  <Power size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-neutral-400 mb-6 font-medium">
                <div className="flex items-center gap-1.5">
                  <TerminalSquare size={16} className="text-neutral-500" />
                  {workflow.nodes.length} Nodes
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${workflow.isActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-neutral-600'}`}></div>
                  {workflow.isActive ? 'Active' : 'Paused'}
                </div>
              </div>

              <div className="mt-auto space-y-3 pt-4 border-t border-[#1F2937]">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="uppercase tracking-widest font-semibold">Webhook Trigger</span>
                  <button 
                    onClick={(e) => copyWebhook(workflow._id, e)}
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copiedId === workflow._id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedId === workflow._id ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-[#0D1117] px-3 py-2 rounded-lg border border-[#1F2937] text-xs font-mono text-neutral-400 truncate select-all">
                  POST /api/webhooks/{workflow._id}
                </div>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-10 pointer-events-none group-hover:pointer-events-auto">
                <Link 
                  to={`/workflows/${workflow._id}`}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-full transition-colors tooltip"
                  title="Edit Workflow"
                >
                  <Edit2 size={20} />
                </Link>
                <button 
                  onClick={(e) => triggerRun(workflow._id, e)}
                  disabled={!workflow.isActive}
                  className="bg-teal-500 hover:bg-teal-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-white p-3 rounded-full transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)] disabled:shadow-none"
                  title={workflow.isActive ? "Trigger Manual Run" : "Workflow is Paused"}
                >
                  <Play size={20} className={workflow.isActive ? "ml-1" : ""} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
