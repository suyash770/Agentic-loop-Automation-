import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import WorkflowList from './pages/WorkflowList';
import ExecutionList from './pages/ExecutionList';
import Debugger from './pages/Debugger';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-[#0B131C] text-neutral-300 font-sans overflow-hidden selection:bg-indigo-500/30">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
          <div className="relative z-10 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workflows" element={<WorkflowList />} />
              <Route path="/workflows/new" element={<WorkflowEditor />} />
              <Route path="/workflows/:id" element={<WorkflowEditor />} />
              <Route path="/executions" element={<ExecutionList />} />
              <Route path="/executions/:id" element={<Debugger />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
