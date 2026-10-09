import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Cpu, CheckSquare, Square, FileText, Sparkles, BookOpen, Download, RefreshCw } from 'lucide-react';

interface Workspace {
  id: number;
  name: string;
}

interface Paper {
  id: number;
  title: string;
  authors: string;
  abstract: string;
}

export const AITools: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWsId, setSelectedWsId] = useState<number | ''>('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<number[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<'summaries' | 'insights' | 'review' | null>(null);
  const [resultContent, setResultContent] = useState<string>('');

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
      if (res.data.length > 0) {
        setSelectedWsId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPapersForWorkspace = async (wsId: number) => {
    try {
      const res = await api.get(`/workspaces/${wsId}`);
      const fetchedPapers: Paper[] = res.data.papers || [];
      setPapers(fetchedPapers);
      setSelectedPaperIds(fetchedPapers.map((p) => p.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWsId) {
      fetchPapersForWorkspace(Number(selectedWsId));
    }
  }, [selectedWsId]);

  const togglePaperSelection = (id: number) => {
    if (selectedPaperIds.includes(id)) {
      setSelectedPaperIds(selectedPaperIds.filter((pId) => pId !== id));
    } else {
      setSelectedPaperIds([...selectedPaperIds, id]);
    }
  };

  const handleRunTool = async (tool: 'summaries' | 'insights' | 'review') => {
    if (selectedPaperIds.length === 0) {
      alert('Please select at least one paper.');
      return;
    }

    setActiveTool(tool);
    setLoading(true);
    setResultContent('');

    try {
      let endpoint = '/ai/summarize';
      if (tool === 'insights') endpoint = '/ai/insights';
      if (tool === 'review') endpoint = '/ai/literature-review';

      const res = await api.post(endpoint, { paper_ids: selectedPaperIds });

      if (tool === 'summaries') {
        const text = res.data.results
          .map((r: any) => `### ${r.title}\n*Authors: ${r.authors}*\n\n${r.summary}`)
          .join('\n\n---\n\n');
        setResultContent(text);
      } else if (tool === 'insights') {
        setResultContent(res.data.insights);
      } else if (tool === 'review') {
        setResultContent(res.data.literature_review);
      }
    } catch (err) {
      console.error(err);
      setResultContent('Failed to generate results from Groq model.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([resultContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTool || 'ai-results'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-gray-500 text-sm mt-1">
          AI-powered research analysis tools &bull; {papers.length} papers available &bull; {selectedPaperIds.length} selected
        </p>
      </div>

      {/* Select Workspace Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cpu className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-semibold text-gray-700">Select Workspace:</span>
          <select
            value={selectedWsId}
            onChange={(e) => setSelectedWsId(Number(e.target.value))}
            className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-600"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full">
          {selectedPaperIds.length} paper(s) selected
        </span>
      </div>

      {/* Select Papers Container (PDF Page 18) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <h3 className="font-bold text-gray-800 text-sm flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Select Papers for Analysis</span>
        </h3>

        {papers.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No papers in this workspace. Import papers first!</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {papers.map((paper) => {
              const isSelected = selectedPaperIds.includes(paper.id);
              return (
                <div
                  key={paper.id}
                  onClick={() => togglePaperSelection(paper.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center space-x-3 transition-colors ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-300 text-purple-900 font-medium'
                      : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="truncate flex-1">{paper.title}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{paper.authors}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3 AI Tool Cards (PDF Page 18) */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card 1: AI Summaries */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">AI Summaries</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Generate concise summaries of selected research papers automatically.
            </p>
          </div>
          <button
            onClick={() => handleRunTool('summaries')}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Summaries</span>
          </button>
        </div>

        {/* Card 2: Key Insights */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Key Insights</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Extract key insights, trends, and methodologies from research papers.
            </p>
          </div>
          <button
            onClick={() => handleRunTool('insights')}
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extract Insights</span>
          </button>
        </div>

        {/* Card 3: Literature Review */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Literature Review</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Generate comprehensive literature reviews across selected papers automatically.
            </p>
          </div>
          <button
            onClick={() => handleRunTool('review')}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Review</span>
          </button>
        </div>
      </div>

      {/* Results Container (PDF Page 18-19) */}
      {(loading || resultContent) && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="capitalize">{activeTool?.replace('-', ' ')} Results</span>
            </h3>

            {resultContent && (
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 space-y-3 text-purple-600">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-xs font-semibold">Groq Llama 3.3 70B synthesizing research insights...</p>
            </div>
          ) : (
            <div className="bg-gray-50/70 p-6 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
              {resultContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
