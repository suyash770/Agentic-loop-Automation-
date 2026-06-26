import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';

interface LogEntry {
  _id: string;
  nodeId: string;
  workflowId?: { name: string };
  status: string;
  error?: string;
  startedAt: string;
}

export default function LiveTerminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/executions/recent-logs');
        if (!res.ok) return;
        const data = await res.json();
        setLogs(data.reverse());
      } catch (err) {
        console.error("Terminal fetch error", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Agent name generator for visual effect
  const getAgentName = (id: string) => {
    const char = id.charCodeAt(id.length - 1);
    if (char % 3 === 0) return { name: 'Agent Alpha', color: 'text-amber-400' };
    if (char % 3 === 1) return { name: 'Agent Beta', color: 'text-amber-400' };
    return { name: 'Agent Gamma', color: 'text-amber-400' };
  };

  return (
    <div className="bg-[#121821] border border-[#1F2937] rounded-xl flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1F2937] flex items-center justify-between bg-[#161B22]">
        <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Autonomous Decision Log</h3>
        <div className="flex gap-2 text-neutral-500">
          <button className="hover:text-white transition-colors"><Terminal size={14} /></button>
          <button className="hover:text-white transition-colors"><Terminal size={14} /></button>
          <button className="hover:text-white transition-colors"><Terminal size={14} /></button>
        </div>
      </div>
      
      <div ref={scrollRef} className="p-4 overflow-y-auto font-sans text-xs space-y-2 scroll-smooth flex-1 bg-[#0F1724]">
        {logs.length === 0 ? (
          <div className="text-neutral-600 animate-pulse font-mono">Waiting for autonomous decisions...</div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              const agent = getAgentName(log._id);
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="leading-relaxed"
                >
                  <span className="text-neutral-500 mr-2">[{formatTime(log.startedAt)}]</span>
                  <span className={`font-semibold ${agent.color} mr-1`}>{agent.name}:</span>
                  
                  {log.status === 'Success' ? (
                    <span className="text-neutral-300">
                      Analyzed <span className="text-white font-medium">{log.workflowId?.name || 'Workflow'}</span>... executed <span className="text-white font-medium">{log.nodeId}</span>... <span className="text-emerald-400">task completed successfully</span>.
                    </span>
                  ) : (
                    <span className="text-neutral-300">
                      Attempted <span className="text-white font-medium">{log.workflowId?.name || 'Workflow'}</span>... <span className="text-rose-400 font-medium">encountered error</span> in {log.nodeId}: {log.error || 'Unknown error'}.
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div className="flex items-center gap-2 text-neutral-500 mt-2 font-mono">
          <span>&gt;</span>
          <motion.div 
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-1.5 h-3 bg-neutral-500"
          />
        </div>
      </div>
    </div>
  );
}
