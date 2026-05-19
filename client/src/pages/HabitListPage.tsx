import React, { useEffect, useState } from 'react';
import { checkinApi } from '../services/api';
import { Habit } from '../types';

const ICON_OPTIONS = ['⭐', '☀️', '🏃', '📖', '💪', '🧘', '🎵', '✍️', '💧', '🥗'];
const COLOR_OPTIONS = ['#4CAF50', '#FF5722', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63', '#607D8B'];

const HabitListPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '⭐', color: '#4CAF50', frequency: 'daily', reminderTime: '' });

  const fetchHabits = async () => {
    try {
      const res = await checkinApi.getHabits();
      setHabits(res.data);
    } catch (err) {
      console.error('获取习惯失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHabits(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await checkinApi.createHabit(form);
      setShowModal(false);
      setForm({ name: '', icon: '⭐', color: '#4CAF50', frequency: 'daily', reminderTime: '' });
      fetchHabits();
    } catch (err) {
      console.error('创建习惯失败', err);
    }
  };

  const handleArchive = async (habitId: string) => {
    try {
      await checkinApi.archiveHabit(habitId);
      fetchHabits();
    } catch (err) {
      console.error('归档失败', err);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">我的习惯</h1>
        <button onClick={() => setShowModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">
          + 新建习惯
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <p>还没有习惯，点击右上角创建第一个习惯吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {habits.map(habit => (
            <div key={habit._id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between" style={{ borderLeft: `4px solid ${habit.color}` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                  <p className="text-xs text-gray-400">连续 {habit.currentStreak} 天</p>
                </div>
              </div>
              <button onClick={() => handleArchive(habit._id)} className="text-xs text-red-400 hover:text-red-600">
                归档
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 创建习惯弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">新建习惯</h2>

            <label className="text-sm text-gray-600 mb-1 block">习惯名称</label>
            <input
              required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="如：早起、跑步"
            />

            <label className="text-sm text-gray-600 mb-1 block">选择图标</label>
            <div className="flex gap-2 mb-4 flex-wrap">
              {ICON_OPTIONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-lg text-xl ${form.icon === icon ? 'bg-green-100 ring-2 ring-green-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {icon}
                </button>
              ))}
            </div>

            <label className="text-sm text-gray-600 mb-1 block">主题色</label>
            <div className="flex gap-2 mb-4">
              {COLOR_OPTIONS.map(color => (
                <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }} />
              ))}
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button type="submit" className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600">
                创建
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HabitListPage;
