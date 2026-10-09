import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { Plus, Save, Download, FileText, Bold, Italic, Underline, Strikethrough, List, AlignLeft, Trash2 } from 'lucide-react';

interface DocItem {
  id: number;
  title: string;
  content: string;
  updated_at: string;
}

export const DocSpace: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [title, setTitle] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/docs');
      setDocs(res.data);
      if (res.data.length > 0 && selectedDocId === null) {
        selectDoc(res.data[0]);
      } else if (res.data.length === 0) {
        // Create initial default document if empty
        handleNewDocument();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const selectDoc = (doc: DocItem) => {
    setSelectedDocId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setSavedStatus(null);
  };

  const handleNewDocument = async () => {
    try {
      const res = await api.post('/docs', {
        title: 'agentic ai',
        content: 'HELLO EVERYONE\n\nNotes and research findings on agentic AI frameworks, Groq API integration, and vector RAG pipelines.'
      });
      setDocs((prev) => [res.data, ...prev]);
      setSelectedDocId(res.data.id);
      setTitle(res.data.title);
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDocument = async () => {
    if (selectedDocId === null) return;
    setSaving(true);
    try {
      await api.put(`/docs/${selectedDocId}`, { title, content });
      setSavedStatus('Saved!');
      setTimeout(() => setSavedStatus(null), 2000);
      fetchDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/docs/${id}`);
      const remaining = docs.filter((d) => d.id !== id);
      setDocs(remaining);
      if (remaining.length > 0) {
        selectDoc(remaining[0]);
      } else {
        setSelectedDocId(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper formatting insert
  const formatText = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}\n${prefix}sample text${suffix}`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DocSpace</h1>
          <p className="text-gray-500 text-sm mt-1">Centralized research document editor and note keeper</p>
        </div>

        <button
          onClick={handleNewDocument}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-md flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Main Workspace Split View (PDF Page 21) */}
      <div className="grid md:grid-cols-4 gap-6 min-h-[550px]">
        {/* Left Sidebar Document List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2 flex flex-col justify-between">
          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Documents</p>
            {docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => selectDoc(doc)}
                className={`p-3 rounded-xl cursor-pointer text-xs transition-colors flex items-center justify-between group ${
                  selectedDocId === doc.id
                    ? 'bg-purple-100/80 text-purple-900 font-bold border border-purple-200'
                    : 'hover:bg-gray-100 text-gray-700 font-medium'
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <p className="truncate">{doc.title}</p>
                  <p className="text-[10px] text-gray-400 font-normal mt-0.5">{doc.updated_at}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteDocument(e, doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Note Canvas & Toolbar */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
          {/* Top Bar with Document Title & Save/Download */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              className="bg-transparent font-bold text-gray-900 text-lg focus:outline-none w-full max-w-md border-b border-transparent focus:border-purple-600"
            />

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleSaveDocument}
                disabled={saving}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savedStatus || (saving ? 'Saving...' : 'Save')}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Rich Editor Formatting Toolbar (PDF Page 21) */}
          <div className="px-6 py-2.5 bg-gray-100/70 border-b border-gray-200 flex flex-wrap items-center gap-2 text-gray-600">
            <span className="text-xs font-semibold text-gray-500 mr-2">Heading 1</span>
            <button
              onClick={() => formatText('**', '**')}
              title="Bold"
              className="p-1.5 hover:bg-gray-200 rounded-md font-bold text-xs"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('*', '*')}
              title="Italic"
              className="p-1.5 hover:bg-gray-200 rounded-md text-xs"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('<u>', '</u>')}
              title="Underline"
              className="p-1.5 hover:bg-gray-200 rounded-md text-xs"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('~~', '~~')}
              title="Strikethrough"
              className="p-1.5 hover:bg-gray-200 rounded-md text-xs"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <button
              onClick={() => formatText('* ')}
              title="Bullet List"
              className="p-1.5 hover:bg-gray-200 rounded-md text-xs"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('')}
              title="Align Left"
              className="p-1.5 hover:bg-gray-200 rounded-md text-xs"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Text Editing Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your notes here..."
            className="flex-1 p-6 text-sm text-gray-800 leading-relaxed font-sans focus:outline-none resize-none min-h-[400px]"
          />
        </div>
      </div>
    </div>
  );
};
