import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password });
        // Automatically login after registration
      }
      
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('userEmail', res.data.user_email);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md cosmic-card rounded-3xl p-8 shadow-2xl z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30 text-purple-400 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? 'Create an account to start using ResearchHub AI' : 'Sign in to continue to ResearchHub AI'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-900/80 border border-slate-700/80 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-gray-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700/80 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-gray-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-gray-400 hover:text-purple-300 transition-colors font-medium"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
