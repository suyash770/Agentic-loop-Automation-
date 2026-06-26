import { useEffect, useState } from 'react';
import { Search, Plus, Activity, GitMerge, Server, Clock, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';

import PipelineVelocity from '../components/PipelineVelocity';
import NodalTraffic from '../components/NodalTraffic';
import AgentInsights from '../components/AgentInsights';
import ExecutionStreamTable from '../components/ExecutionStreamTable';
import LiveTerminal from '../components/LiveTerminal';
import WorkflowDistribution from '../components/WorkflowDistribution';
import UpcomingSchedule from '../components/ExecutionHeatmap'; // Renamed internally to UpcomingSchedule

export default function Dashboard() {
  const stats = { workflows: 16, executions: 8212 };
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [executionsRes, velocityRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/executions'),
          fetch('http://localhost:5000/api/executions/velocity'),
          fetch('http://localhost:5000/api/executions/stats')
        ]);
        const executions = await executionsRes.json();
        const velocity = await velocityRes.json();
        const statsDataResponse = await statsRes.json();
        
        setRecentExecutions(executions.slice(0, 10));
        setVelocityData(velocity);
        setStatsData(statsDataResponse);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const sparkline1 = statsData?.sparkline ? statsData.sparkline.map((s: any) => ({ value: s.count })) : Array.from({ length: 7 }, () => ({ value: 0 }));
  const barline1 = velocityData.length > 0 ? velocityData.map((v: any) => ({ value: v.executions })) : Array.from({ length: 24 }, () => ({ value: 0 }));

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center text-sm font-medium">
          <span className="text-neutral-400">Command Center</span>
          <ChevronRight size={16} className="text-neutral-600 mx-2" />
          <span className="text-neutral-200">Pipeline Status</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2 text-neutral-500" size={16} />
            <input 
              type="text" 
              placeholder="Search workflows, executions, nodes..." 
              className="w-64 bg-[#161B22] border border-[#2D3748] rounded-md py-1.5 pl-9 pr-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <button className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-1.5 rounded-md font-semibold text-sm flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(13,148,136,0.4)]">
            <Plus size={16} /> CREATE WORKFLOW
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-max">
        
        {/* ROW 1: Metric Cards */}
        <div className="col-span-3 bg-[#0c181f] border border-teal-900/50 rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start z-10 relative">
            <h3 className="text-xs font-semibold tracking-widest text-teal-500 uppercase">Active Workflows</h3>
            <GitMerge className="text-teal-600 opacity-50" size={24} />
          </div>
          <div className="flex justify-between items-end z-10 relative mt-2">
            <div>
              <span className="text-4xl font-bold text-white leading-none">{stats.workflows}</span>
              <p className="text-[10px] text-teal-400/70 mt-1">15 running, 2 queued</p>
            </div>
            <div className="w-24 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline1}>
                  <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-[#1f160a] border border-amber-900/50 rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start z-10 relative">
            <h3 className="text-xs font-semibold tracking-widest text-amber-500 uppercase">Total Executions (24h)</h3>
            <Activity className="text-amber-600 opacity-50" size={24} />
          </div>
          <div className="flex justify-between items-end z-10 relative mt-2">
            <div>
              <span className="text-4xl font-bold text-white leading-none">{stats.executions.toLocaleString()}</span>
              <p className="text-[10px] text-emerald-400 mt-1">+1.2% over previous 24h</p>
            </div>
            <div className="w-40 h-10 flex items-end">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barline1}>
                  <Bar dataKey="value" fill="#f59e0b" radius={[2, 2, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-3 bg-[#0c1a16] border border-emerald-900/50 rounded-xl p-4 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start z-10 relative">
            <h3 className="text-xs font-semibold tracking-widest text-emerald-500 uppercase">System Uptime</h3>
            <Server className="text-emerald-600 opacity-50" size={24} />
          </div>
          <div className="flex justify-between items-end z-10 relative mt-2">
            <div>
              <span className="text-4xl font-bold text-white leading-none">99.98%</span>
              <p className="text-[10px] text-emerald-400/70 mt-1">Healthy, 0 failed last hr</p>
            </div>
            <div className="w-12 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={4} data={[{ name: 'uptime', value: 99.98, fill: '#10b981' }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#064e3b' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-[#121821] border border-[#1F2937] rounded-xl p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">Scheduled Workflows</h3>
          <div className="space-y-2.5">
             <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5"><Clock size={12} className="text-teal-500"/> Execution Countdown</span>
                <span className="text-amber-500 font-mono">3h 33m 15s</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5"><Clock size={12} className="text-teal-500"/> Execution Workflow</span>
                <span className="text-amber-500 font-mono">1h 35m 14s</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5"><Clock size={12} className="text-teal-500"/> Scheduled Workflows</span>
                <span className="text-neutral-300 font-mono">1h 17m 05s</span>
             </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="col-span-6 h-[280px]">
          <PipelineVelocity data={velocityData} />
        </div>
        <div className="col-span-3 h-[280px]">
          <NodalTraffic />
        </div>
        <div className="col-span-3 h-[280px]">
          <AgentInsights />
        </div>

        {/* ROW 3 & 4 */}
        <div className="col-span-7 row-span-2 h-[450px]">
          <ExecutionStreamTable executions={recentExecutions} />
        </div>
        
        <div className="col-span-5 h-[220px]">
          <LiveTerminal />
        </div>

        {/* ROW 4 */}
        <div className="col-span-2 h-[214px]">
          <WorkflowDistribution />
        </div>
        <div className="col-span-3 h-[214px]">
          <UpcomingSchedule heatmap={statsData?.heatmap || []} />
        </div>

      </div>
    </div>
  );
}
