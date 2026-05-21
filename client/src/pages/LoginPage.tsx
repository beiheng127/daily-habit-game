import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await userApi.login({ username, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-400 via-brand-500 to-accent-500 p-4">
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="glass-card p-8 w-96"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">DailyHabit</h1>
          <p className="text-gray-400 text-sm mt-1">每日习惯打卡游戏</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-4">{error}</motion.div>
        )}

        <input type="text" placeholder="用户名" value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80" />
        <input type="password" placeholder="密码" value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80" />

        <button type="submit" disabled={loading}
          className="w-full bg-brand-500 text-white p-3 rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-soft">
          {loading ? '登录中...' : '登录'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          还没有账号？<Link to="/register" className="text-brand-500 hover:underline">立即注册</Link>
        </p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
