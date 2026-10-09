import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, FileEdit, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-12 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 px-4 py-1.5 rounded-full text-xs font-medium text-purple-200">
            <span>Powered by Groq & Llama 3.3 70B</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Your AI-Powered <span className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">Research Assistant</span>
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Accelerate your research with intelligent paper discovery, AI-powered insights, and collaborative document editing – all in one platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all transform active:scale-95"
            >
              <span>Start Researching</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/docspace')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-xl text-sm transition-all"
            >
              Try DocSpace
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Powerful Features for Modern Research
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => navigate('/search')}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Smart Paper Search</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Find research papers across multiple databases with AI-powered search.
            </p>
          </div>

          <div
            onClick={() => navigate('/dashboard')}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">AI Chat Assistant</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Ask questions about your research papers and get intelligent responses.
            </p>
          </div>

          <div
            onClick={() => navigate('/docspace')}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileEdit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">DocSpace Editor</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Create and edit documents with rich text formatting like Google Docs.
            </p>
          </div>

          <div
            onClick={() => navigate('/ai-tools')}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Literature Review</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Generate comprehensive literature reviews from selected papers automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Section (PDF Page 15) */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-10 text-white shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose ResearchHub AI?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">Save 80% time on literature review</span>
          </div>
          <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">Access millions of research papers</span>
          </div>
          <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">AI-powered insights and summaries</span>
          </div>
          <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">Collaborative workspace features</span>
          </div>
          <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">Export to multiple formats</span>
          </div>
          <div className="flex items-start space-x-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle className="w-5 h-5 text-purple-300 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">Contextual multi-turn AI chatbot</span>
          </div>
        </div>
      </div>
    </div>
  );
};
