import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-2">注册</h1>
        <p className="text-gray-400 text-center text-sm mb-6">创建你的DailyHabit账号</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <input
          name="username" placeholder="用户名（3-20位字母数字下划线）" value={form.username}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          name="password" type="password" placeholder="密码（6-20位）" value={form.password}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <input
          name="email" type="email" placeholder="邮箱" value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          type="submit" disabled={loading}
          className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? '注册中...' : '注册'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          已有账号？<Link to="/login" className="text-green-500 hover:underline">去登录</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
