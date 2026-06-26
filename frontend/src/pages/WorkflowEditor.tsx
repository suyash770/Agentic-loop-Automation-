import { useState, useEffect } from 'react';
import { Save, ArrowRight, Play, Server, FileText, Activity } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface WorkflowNode {
  id: string;
  type: string;
  config: Record<string, any>;
}

export default function WorkflowEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('My New Workflow');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'Scraper', config: { url: 'https://example.com' } }
  ]);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      setWorkflowId(id);
      fetch(`http://localhost:5000/api/workflows/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.name) setName(data.name);
          if (data.nodes) setNodes(data.nodes);
        })
        .catch(err => console.error("Failed to load workflow", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        isActive: true,
        nodes: nodes.map((n, i) => ({
          ...n,
          next: i < nodes.length - 1 ? [nodes[i + 1].id] : []
        }))
      };

      const url = workflowId 
        ? `http://localhost:5000/api/workflows/${workflowId}` 
        : 'http://localhost:5000/api/workflows';
      
      const res = await fetch(url, {
        method: workflowId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!workflowId) {
        setWorkflowId(data._id);
      }
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save workflow.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!workflowId) {
      alert('Please save the workflow first!');
      return;
    }
    setRunning(true);
    try {
      await fetch(`http://localhost:5000/api/webhooks/${workflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'TestRun' })
      });
      alert('Test run triggered! Check the Execution Monitor.');
      navigate('/executions');
    } catch (error) {
      console.error(error);
      alert('Failed to start test run.');
    } finally {
      setRunning(false);
    }
  };

  const addNode = (type: string) => {
    let config = {};
    if (type === 'HTTP') config = { url: 'https://api.github.com/users/octocat', method: 'GET' };
    if (type === 'Scraper') config = { url: 'https://news.ycombinator.com', selector: '.titleline > a' };
    if (type === 'Transformer') config = { extractKey: 'name' };

    setNodes([...nodes, { id: Date.now().toString(), type, config }]);
  };



  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  if (loading) {
    return <div className="p-12 text-center text-neutral-500 font-mono animate-pulse">Loading workflow...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-neutral-800 pb-6">
        <div className="w-full md:w-1/2">
          <input 
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="text-3xl font-bold text-white bg-transparent outline-none border-b border-transparent hover:border-neutral-700 focus:border-indigo-500 w-full transition-colors pb-1"
            placeholder="Workflow Name"
          />
          <p className="text-neutral-400 mt-1">Design your execution sequence</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleTestRun}
            disabled={running}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={18} />
            {running ? 'Starting...' : 'Test Run'}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {nodes.map((node, index) => (
          <div key={node.id} className="relative">
            <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 p-6 rounded-2xl shadow-xl hover:border-indigo-500/30 transition-colors group">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-neutral-950 border border-neutral-800 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-indigo-400 shadow-inner">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {node.type === 'HTTP' && <Server size={18} className="text-amber-400"/>}
                    {node.type === 'Scraper' && <Activity size={18} className="text-emerald-400"/>}
                    {node.type === 'Transformer' && <FileText size={18} className="text-indigo-400"/>}
                    {node.type} Node
                  </h3>
                </div>
                {nodes.length > 1 && (
                  <button onClick={() => removeNode(node.id)} className="text-neutral-500 hover:text-red-400 transition-colors text-sm">Remove</button>
                )}
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 space-y-4">
                {node.type === 'HTTP' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1">
                        <label className="text-xs text-neutral-500 uppercase tracking-wide font-semibold block mb-1.5">Method</label>
                        <select 
                          className="w-full bg-[#121821] border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                          value={node.config.method || 'GET'}
                          onChange={e => {
                            const newConfig = { ...node.config, method: e.target.value };
                            setNodes(nodes.map(n => n.id === node.id ? { ...n, config: newConfig } : n));
                          }}
                        >
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>DELETE</option>
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-xs text-neutral-500 uppercase tracking-wide font-semibold block mb-1.5">URL</label>
                        <input 
                          type="text"
                          className="w-full bg-[#121821] border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                          value={node.config.url || ''}
                          onChange={e => {
                            const newConfig = { ...node.config, url: e.target.value };
                            setNodes(nodes.map(n => n.id === node.id ? { ...n, config: newConfig } : n));
                          }}
                          placeholder="https://api.example.com/data"
                        />
                      </div>
                    </div>
                  </>
                )}

                {node.type === 'Scraper' && (
                  <>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wide font-semibold block mb-1.5">Target URL</label>
                      <input 
                        type="text"
                        className="w-full bg-[#121821] border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                        value={node.config.url || ''}
                        onChange={e => {
                          const newConfig = { ...node.config, url: e.target.value };
                          setNodes(nodes.map(n => n.id === node.id ? { ...n, config: newConfig } : n));
                        }}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wide font-semibold block mb-1.5">CSS Selector (Optional)</label>
                      <input 
                        type="text"
                        className="w-full bg-[#121821] border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                        value={node.config.selector || ''}
                        onChange={e => {
                          const newConfig = { ...node.config, selector: e.target.value };
                          setNodes(nodes.map(n => n.id === node.id ? { ...n, config: newConfig } : n));
                        }}
                        placeholder=".main-content h1"
                      />
                    </div>
                  </>
                )}

                {node.type === 'Transformer' && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wide font-semibold block mb-1.5">Extract JSON Key</label>
                    <input 
                      type="text"
                      className="w-full bg-[#121821] border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
                      value={node.config.extractKey || ''}
                      onChange={e => {
                        const newConfig = { ...node.config, extractKey: e.target.value };
                        setNodes(nodes.map(n => n.id === node.id ? { ...n, config: newConfig } : n));
                      }}
                      placeholder="e.g. data.users"
                    />
                  </div>
                )}
              </div>
            </div>
            {index < nodes.length - 1 && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10 text-neutral-600">
                <ArrowRight size={24} className="rotate-90" />
              </div>
            )}
          </div>
        ))}

        <div className="mt-8 p-6 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center bg-neutral-950/30">
          <h4 className="text-neutral-400 font-medium mb-4">Add next node</h4>
          <div className="flex gap-4">
            <button onClick={() => addNode('HTTP')} className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-white rounded-xl transition-colors flex items-center gap-2 text-sm">
              <Server size={16} className="text-amber-400" /> HTTP
            </button>
            <button onClick={() => addNode('Scraper')} className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white rounded-xl transition-colors flex items-center gap-2 text-sm">
              <Activity size={16} className="text-emerald-400" /> Scraper
            </button>
            <button onClick={() => addNode('Transformer')} className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-white rounded-xl transition-colors flex items-center gap-2 text-sm">
              <FileText size={16} className="text-indigo-400" /> Transformer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
