import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userEmail }) => {
  const navigate = useNavigate();
  const email = userEmail || localStorage.getItem('userEmail') || 'user@example.com';
  const initial = email.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-gray-800 text-sm">ResearchHub AI</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
          <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {initial}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-700 leading-tight">{initial}K</p>
            <p className="text-[11px] text-gray-400 leading-tight">{email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
