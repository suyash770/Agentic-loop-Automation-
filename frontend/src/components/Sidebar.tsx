import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitMerge, Activity, Settings, User, Network } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#0F1724] border-r border-[#1F2937] flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-6 relative overflow-hidden">
        {/* Subtle background glow/dots to mimic the constellation in the header */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
        <h1 className="text-xl tracking-widest font-bold text-white flex items-center gap-3 relative z-10">
          <Network className="text-teal-400" size={24} />
          <span className="opacity-90">NEXUS</span><span className="text-teal-500 opacity-80 font-medium text-sm mt-0.5 -ml-1">ENGINE</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-2">
        <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/workflows" icon={<GitMerge size={18} />} label="Workflows" />
        <NavItem to="/executions" icon={<Activity size={18} />} label="Executions" />
      </nav>

      {/* Footer / Settings */}
      <div className="px-4 pb-6 mt-auto space-y-1">
        <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
        <NavItem to="/user-settings" icon={<User size={18} />} label="User Settings" />
        
        <div className="pt-6 mt-4 border-t border-[#1F2937] flex items-center justify-between px-3">
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
            Custom Engine<br/>
            Version 1.12.15-350
          </div>
          <button className="text-teal-500 text-xs hover:text-teal-400 font-medium">Help</button>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        // Special case for dashboard to match screenshot if active
        // But the screenshot shows 'Workflows' as active. The styling is amber text, left border, dark bg, right amber dot
        if (isActive) {
          return "flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1B2433] text-amber-500 relative border-l-2 border-amber-500 shadow-lg";
        }
        return "flex items-center justify-between px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-neutral-200 transition-colors border-l-2 border-transparent";
      }}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-semibold tracking-wide">{label}</span>
          </div>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>}
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;
