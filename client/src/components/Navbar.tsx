import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/habits', label: '习惯', icon: '📋' },
    { path: '/history', label: '历史', icon: '📅' },
    { path: '/achievements', label: '成就', icon: '🏆' },
    { path: '/profile', label: '我的', icon: '👤' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-green-600">DailyHabit</Link>

        <div className="flex gap-4">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
                location.pathname === link.path
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.nickname}</span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
            Lv.{user?.level} 💰{user?.coins}
          </span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">
            退出
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
