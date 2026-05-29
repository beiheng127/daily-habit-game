import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userApi } from '../services/api';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await userApi.register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
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
          <h1 className="text-2xl font-bold text-gray-800">注册</h1>
          <p className="text-gray-400 text-sm mt-1">创建你的DailyHabit账号</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-4">{error}</motion.div>
        )}

        <input name="username" placeholder="用户名（3-20位字母数字下划线）" value={form.username}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80" />
        <input name="password" type="password" placeholder="密码（8-30位，需含字母和数字）" value={form.password}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80" />
        <input name="email" type="email" placeholder="邮箱" value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80" />

        <button type="submit" disabled={loading}
          className="w-full bg-brand-500 text-white p-3 rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-soft">
          {loading ? '注册中...' : '注册'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          已有账号？<Link to="/login" className="text-brand-500 hover:underline">去登录</Link>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;
