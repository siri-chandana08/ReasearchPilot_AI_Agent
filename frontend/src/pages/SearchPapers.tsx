import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Modal } from '../components/Modal';
import { Search, Filter, BookOpen, Check, ExternalLink, BookmarkPlus } from 'lucide-react';

interface PaperResult {
  title: string;
  authors: string;
  published_date: string;
  abstract: string;
  source: string;
  url: string;
  pdf_url?: string;
  citations_count?: number;
}

interface Workspace {
  id: number;
  name: string;
}

export const SearchPapers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('all');
  const [results, setResults] = useState<PaperResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  
  // Import Modal State
  const [selectedPaper, setSelectedPaper] = useState<PaperResult | null>(null);
  const [targetWsId, setTargetWsId] = useState<number | ''>('');
  const [importing, setImporting] = useState(false);
  const [importedStatus, setImportedStatus] = useState<string | null>(null);

  const fetchPapers = async (searchQuery: string, searchSource: string = source) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/papers/search?query=${encodeURIComponent(searchQuery)}&source=${searchSource}`);
      setResults(res.data.papers || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setTargetWsId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPapers(query, source);
    fetchWorkspaces();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPapers(query, source);
  };

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    fetchPapers(query, newSource);
  };

  const handleImportPaper = async () => {
    if (!selectedPaper || !targetWsId) return;
    setImporting(true);
    try {
      await api.post('/papers/import', {
        workspace_id: targetWsId,
        title: selectedPaper.title,
        authors: selectedPaper.authors,
        published_date: selectedPaper.published_date,
        abstract: selectedPaper.abstract,
        source: selectedPaper.source,
        url: selectedPaper.url
      });
      setImportedStatus(`Successfully imported to workspace!`);
      setTimeout(() => {
        setImportedStatus(null);
        setSelectedPaper(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Research Papers</h1>
        <p className="text-gray-500 text-sm mt-1">Search across millions of research papers and import them to your workspace</p>
      </div>

      {/* Search Input Bar (PDF Page 16) */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, keywords, authors..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span>Source:</span>
              <select
                value={source}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="arXiv">arXiv API</option>
                <option value="PubMed">PubMed</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all shrink-0"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Found {results.length} papers
        </p>
      </div>

      {/* Paper Results List (PDF Page 16) */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Querying academic databases...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No papers found. Try adjusting query terms.</div>
      ) : (
        <div className="space-y-4">
          {results.map((paper, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 text-base leading-snug hover:text-purple-700 cursor-pointer">
                    {paper.title}
                  </h3>
                </div>

                <p className="text-xs text-purple-700 font-medium">
                  {paper.authors}
                </p>

                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {paper.abstract}
                </p>

                <div className="flex items-center space-x-3 text-[11px] pt-1">
                  <span className="bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-md">
                    {paper.published_date}
                  </span>
                  <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-md">
                    {paper.source}
                  </span>
                  <span className="text-gray-500 font-medium">
                    {paper.citations_count || 12} citations
                  </span>
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <span>View Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => setSelectedPaper(paper)}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Import to Workspace</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import to Workspace Modal */}
      <Modal
        isOpen={!!selectedPaper}
        onClose={() => setSelectedPaper(null)}
        title="Import Paper to Workspace"
      >
        {selectedPaper && (
          <div className="space-y-4">
            <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-100">
              <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{selectedPaper.title}</h4>
              <p className="text-xs text-purple-700 mt-1">{selectedPaper.authors}</p>
            </div>

            {importedStatus ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl text-center flex items-center justify-center space-x-2">
                <Check className="w-4 h-4" />
                <span>{importedStatus}</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Target Workspace</label>
                  {workspaces.length === 0 ? (
                    <p className="text-xs text-red-500">No workspaces available. Please create a workspace in Dashboard first.</p>
                  ) : (
                    <select
                      value={targetWsId}
                      onChange={(e) => setTargetWsId(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-purple-600"
                    >
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setSelectedPaper(null)}
                    className="px-4 py-2 text-gray-600 font-medium text-xs hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportPaper}
                    disabled={importing || !targetWsId}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {importing ? 'Importing...' : 'Confirm Import'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
