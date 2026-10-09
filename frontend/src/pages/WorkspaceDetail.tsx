import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ArrowLeft, BookOpen, MessageSquare, Sparkles, Send, Trash2, ExternalLink, Bot, User as UserIcon } from 'lucide-react';

interface Paper {
  id: number;
  title: string;
  authors: string;
  published_date: string;
  abstract: string;
  source: string;
  url?: string;
  has_full_text?: boolean;
}

interface ChatMsg {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface WorkspaceData {
  id: number;
  name: string;
  description: string;
  created_at: string;
  papers: Paper[];
}

export const WorkspaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [activeTab, setActiveTab] = useState<'papers' | 'chat'>('papers');
  const [loading, setLoading] = useState(true);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchWorkspaceDetail = async () => {
    try {
      const res = await api.get(`/workspaces/${id}`);
      setWorkspace(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/chat/history/${id}`);
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetail();
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, sending]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || sending) return;

    const userMessage: ChatMsg = { role: 'user', content: textToSend };
    setChatMessages((prev) => [...prev, userMessage]);
    if (!customText) setChatInput('');
    setSending(true);

    try {
      const res = await api.post('/chat', {
        workspace_id: Number(id),
        content: textToSend,
      });

      const assistantMessage: ChatMsg = { role: 'assistant', content: res.data.response };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred while generating response from Groq client.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleDeletePaper = async (paperId: number) => {
    if (!window.confirm('Remove this paper from workspace?')) return;
    try {
      await api.delete(`/papers/${paperId}`);
      fetchWorkspaceDetail();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading workspace...</div>;
  }

  if (!workspace) {
    return <div className="p-8 text-center text-red-500">Workspace not found</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-700 hover:text-purple-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {workspace.papers.length} papers &bull; Created {workspace.created_at}
        </p>
      </div>

      {/* Navigation Tabs (PDF Page 17) */}
      <div className="flex border-b border-gray-200 space-x-6">
        <button
          onClick={() => setActiveTab('papers')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition-all border-b-2 ${
            activeTab === 'papers'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Papers ({workspace.papers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 transition-all border-b-2 ${
            activeTab === 'chat'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* TAB 1: PAPERS LIST */}
      {activeTab === 'papers' && (
        <div className="space-y-4">
          {workspace.papers.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No papers in this workspace yet</h3>
              <p className="text-xs text-gray-500">Go to Search Papers or Upload PDF to import research documents.</p>
              <button
                onClick={() => navigate('/search')}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-xl text-xs hover:bg-purple-700"
              >
                Search & Import Papers
              </button>
            </div>
          ) : (
            workspace.papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-purple-200 transition-all flex justify-between items-start"
              >
                <div className="space-y-2 flex-1 pr-4">
                  <h3 className="font-bold text-gray-900 text-base">{paper.title}</h3>
                  <p className="text-xs text-purple-700 font-semibold">{paper.authors}</p>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{paper.abstract}</p>

                  <div className="flex items-center space-x-3 text-[11px] pt-1">
                    <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-md">
                      {paper.source}
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

                <button
                  onClick={() => handleDeletePaper(paper.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                  title="Remove paper"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: AI CHAT (PDF Page 17) */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Chat Top Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-4 flex items-center space-x-3">
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 text-sm">AI Research Assistant</h3>
              <p className="text-[11px] text-purple-700">
                {workspace.papers.length} paper(s) selected - Ask anything!
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {chatMessages.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full inline-block">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Ask your research assistant</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Try asking questions like "What are key differences between transformer and CNN architectures?" or "Summarize main findings across papers".
                </p>

                {/* Sample Prompt Pills (PDF Page 17) */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => handleSendMessage('What are key differences between transformer and CNN architectures?')}
                    className="px-3.5 py-1.5 bg-purple-600 text-white rounded-full text-xs font-semibold hover:bg-purple-700 shadow-xs transition-colors"
                  >
                    what are key differences between transformer and CNN architectures?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Summarize main findings across imported papers')}
                    className="px-3.5 py-1.5 bg-white text-purple-700 border border-purple-200 rounded-full text-xs font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Summarize main findings across imported papers
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-xs whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      U
                    </div>
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl text-xs text-gray-500 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
                  <span>Reasoning over paper vector context...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-white border-t border-gray-200 flex items-center space-x-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about the selected papers..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
            <button
              type="submit"
              disabled={sending || !chatInput.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5 disabled:opacity-50 transition-all shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
