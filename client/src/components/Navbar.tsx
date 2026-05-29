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
    { path: '/shop', label: '商店', icon: '🛒' },
    { path: '/leaderboard', label: '排行', icon: '📊' },
    { path: '/profile', label: '我的', icon: '👤' }
  ];

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-soft z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between w-full">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">DailyHabit</Link>

          <div className="flex gap-1">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={'flex items-center gap-1 px-2.5 py-2 rounded-xl text-sm transition-all ' + (location.pathname === link.path ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-500 hover:bg-gray-100')}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.nickname}</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-lg text-xs font-medium">
              Lv.{user?.level} 💰{user?.coins}
            </span>
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 transition-colors">
              退出
            </button>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 shadow-soft z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-14">
          {links.slice(0, 5).map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs transition-all ' + (location.pathname === link.path ? 'text-brand-600 font-medium' : 'text-gray-400')}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="mt-0.5">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
