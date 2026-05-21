import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkinApi } from '../services/api';
import { Habit } from '../types';
import Skeleton from '../components/Skeleton';

const ICONS = ['🏃', '📚', '💧', '🧘', '🎵', '✍️', '💤', '🍎', '🏋️', '📝'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const HabitListPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const [form, setForm] = useState<{ name: string; icon: string; color: string; frequency: string; reminderTime: string }>({
    name: '', icon: '🏃', color: '#6366f1', frequency: 'daily', reminderTime: ''
  });

  const showToast = (message: string, type: string = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchHabits = useCallback(async () => {
    try {
      const res = await checkinApi.getHabits();
      setHabits(res.data);
    } catch (err) {
      console.error('加载习惯列表失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const resetForm = () => {
    setForm({ name: '', icon: '🏃', color: '#6366f1', frequency: 'daily', reminderTime: '' });
    setEditingHabit(null);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setForm({
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      reminderTime: habit.reminderTime || ''
    });
    setShowCreate(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('请输入习惯名称', 'error');
      return;
    }
    try {
      if (editingHabit) {
        await checkinApi.updateHabit(editingHabit._id, form);
        showToast('习惯已更新');
      } else {
        await checkinApi.createHabit(form);
        showToast('习惯创建成功');
      }
      setShowCreate(false);
      resetForm();
      fetchHabits();
    } catch (err: any) {
      showToast(err.response?.data?.message || '操作失败', 'error');
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!window.confirm('确定要删除这个习惯吗？')) return;
    try {
      await checkinApi.archiveHabit(habitId);
      showToast('习惯已删除');
      fetchHabits();
    } catch (err: any) {
      showToast(err.response?.data?.message || '删除失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <Skeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl shadow-lg text-white z-50 text-sm font-medium ${
              toast.type === 'success' ? 'bg-accent-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">我的习惯</h1>
        <button
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors shadow-soft"
        >
          + 新建习惯
        </button>
      </div>

      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 text-center"
        >
          <p className="text-gray-400 mb-4">还没有习惯，创建第一个吧！</p>
          <button
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="bg-brand-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            + 新建习惯
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit, i) => (
            <motion.div
              key={habit._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-center justify-between"
              style={{ borderLeft: `4px solid ${habit.color}` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{habit.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                  <p className="text-xs text-gray-400">
                    {habit.frequency === 'daily' ? '每日' : habit.frequency === 'weekdays' ? '工作日' : '自定义'} · 连续 {habit.currentStreak} 天
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(habit)}
                  className="text-xs text-brand-500 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(habit._id)}
                  className="text-xs text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  删除
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowCreate(false); resetForm(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editingHabit ? '编辑习惯' : '新建习惯'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="习惯名称"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white/80"
                  autoFocus
                />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">图标</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setForm({ ...form, icon })}
                        className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                          form.icon === icon
                            ? 'bg-brand-100 ring-2 ring-brand-400 scale-110'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">颜色</label>
                  <div className="flex gap-2">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, color })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          form.color === color ? 'ring-2 ring-offset-2 ring-brand-400 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">频率</label>
                  <select
                    value={form.frequency}
                    onChange={e => setForm({ ...form, frequency: e.target.value as any })}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="daily">每日</option>
                    <option value="weekdays">工作日</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); resetForm(); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                  >
                    {editingHabit ? '保存' : '创建'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitListPage;
