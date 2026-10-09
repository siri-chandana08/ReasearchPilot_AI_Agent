import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Modal } from '../components/Modal';
import { Plus, FolderPlus, FileText, Search, Trash2, ArrowUpRight } from 'lucide-react';

interface Workspace {
  id: number;
  name: string;
  description: string;
  created_at: string;
  paper_count: number;
}

export const Dashboard: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreating(true);
    try {
      await api.post('/workspaces', { name: newWsName, description: newWsDesc });
      setNewWsName('');
      setNewWsDesc('');
      setIsModalOpen(false);
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace?')) return;
    try {
      await api.delete(`/workspaces/${id}`);
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPapers = workspaces.reduce((acc, curr) => acc + curr.paper_count, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your research workspaces and track literature progress</p>
      </div>

      {/* Summary Cards Row (PDF Page 15) */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Workspaces</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{workspaces.length}</h3>
          </div>
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <FolderPlus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Papers Imported</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalPapers}</h3>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
            <button
              onClick={() => navigate('/search')}
              className="mt-2 text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center space-x-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Papers</span>
            </button>
          </div>
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
            <Search className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Create Button Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Your Workspaces</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md flex items-center space-x-2 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Workspace</span>
        </button>
      </div>

      {/* Workspace Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading workspaces...</div>
      ) : workspaces.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center space-y-4">
          <FolderPlus className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No Workspaces Found</h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            Create your first workspace to organize papers and interact with the Groq AI agent.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg text-xs hover:bg-purple-700 inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Workspace</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => navigate(`/workspace/${ws.id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">
                    {ws.name}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteWorkspace(e, ws.id)}
                    title="Delete Workspace"
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2">
                  {ws.description || 'No description provided'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                  {ws.paper_count} papers
                </span>
                <span className="text-gray-400 text-[11px]">
                  Created {ws.created_at}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Workspace"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Workspace Name</label>
            <input
              type="text"
              required
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. Deep Learning Research, Medical Imaging"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={newWsDesc}
              onChange={(e) => setNewWsDesc(e.target.value)}
              rows={3}
              placeholder="Brief description of this research project..."
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 font-medium text-xs hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-md"
            >
              {creating ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
