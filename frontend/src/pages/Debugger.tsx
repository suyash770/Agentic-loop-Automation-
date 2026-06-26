import { useEffect, useState } from 'react';
import { ArrowLeft, Terminal, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface ExecutionLog {
  _id: string;
  nodeId: string;
  status: string;
  inputData: any;
  outputData?: any;
  error?: string;
  startedAt: string;
  completedAt: string;
}

interface Execution {
  _id: string;
  workflowId: { _id: string; name: string };
  status: string;
  triggerData: any;
  createdAt: string;
  completedAt?: string;
}

export default function Debugger() {
  const { id } = useParams();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutionDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/executions/${id}`);
        if (!res.ok) throw new Error('Failed to fetch execution');
        const data = await res.json();
        setExecution(data.execution);
        setLogs(data.logs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutionDetails();
  }, [id]);

  const calculateDuration = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return ((e - s) / 1000).toFixed(1) + 's';
  };

  const formatJSON = (obj: any) => {
    if (!obj) return '';
    const jsonStr = JSON.stringify(obj, null, 2);
    // Basic syntax highlighting replacement
    return jsonStr
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-blue-400';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-indigo-300 font-semibold';
          } else {
            cls = 'text-emerald-300';
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-amber-400';
        } else if (/null/.test(match)) {
          cls = 'text-rose-400';
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  if (loading) {
    return <div className="p-8 text-neutral-400">Loading execution data...</div>;
  }

  if (!execution) {
    return <div className="p-8 text-red-400">Execution not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 border-b border-neutral-800 pb-6">
        <Link to="/executions" className="inline-flex items-center gap-2 text-neutral-400 hover:text-indigo-400 transition-colors mb-4 font-medium text-sm">
          <ArrowLeft size={16} />
          Back to Executions
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Terminal className="text-indigo-400" />
              Debugger View
            </h1>
            <p className="text-neutral-400 mt-1 font-mono text-sm">Execution {id}</p>
          </div>
          <span className={`px-4 py-1.5 text-sm font-medium rounded-full border flex items-center gap-2 ${
            execution.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            execution.status === 'Failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {execution.status === 'Failed' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            Execution {execution.status}
          </span>
        </div>
      </header>

      <div className="space-y-6 relative">
        {/* Timeline connector line */}
        {logs.length > 1 && (
          <div className="absolute top-12 bottom-12 left-[31px] w-0.5 bg-neutral-800/80 -z-10 rounded-full"></div>
        )}
        {logs.length === 0 ? (
          <p className="text-neutral-500">No logs found for this execution.</p>
        ) : (
          logs.map((log, i) => (
            <div key={log._id} className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/50 rounded-2xl shadow-xl overflow-hidden group hover:border-neutral-700 transition-colors ml-4 relative">
              <div className="bg-neutral-950/50 p-4 border-b border-neutral-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-inner z-10 -ml-8 border-4 border-[#0F172A] ${log.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10' : 'bg-red-500/20 text-red-400 border-red-500/10'}`}>
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-2">Node {log.nodeId}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1 text-neutral-500"><Clock size={14} /> {calculateDuration(log.startedAt, log.completedAt)}</span>
                  {log.status === 'Success' ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={16} /> Success</span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1"><AlertCircle size={16} /> Failed</span>
                  )}
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Input Payload</h4>
                  <div className="bg-[#0D1117] p-4 rounded-xl border border-neutral-800/80 h-full relative overflow-hidden group/code">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
                    <pre className="text-sm text-neutral-300 font-mono overflow-x-auto">
                      <code dangerouslySetInnerHTML={{ __html: formatJSON(log.inputData) }} />
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                    {log.status === 'Success' ? 'Output Result' : 'Error Trace'}
                  </h4>
                  <div className={`bg-[#0D1117] p-4 rounded-xl border h-full relative overflow-hidden ${log.status === 'Success' ? 'border-neutral-800/80' : 'border-red-500/30'}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${log.status === 'Success' ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}></div>
                    {log.status === 'Success' ? (
                      <pre className="text-sm text-neutral-300 font-mono overflow-x-auto">
                        <code dangerouslySetInnerHTML={{ __html: formatJSON(log.outputData) }} />
                      </pre>
                    ) : (
                      <div className="text-sm text-red-400 font-mono flex items-start gap-2 whitespace-pre-wrap">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        {log.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
