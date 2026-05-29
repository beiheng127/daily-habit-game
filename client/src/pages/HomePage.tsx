import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { checkinApi, gameApi } from '../services/api';
import { TodayStatus, GameStatus } from '../types';
import HabitCard from '../components/HabitCard';
import LevelBadge from '../components/LevelBadge';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [todayRes, gameRes] = await Promise.all([
        checkinApi.getTodayStatus(),
        gameApi.getStatus()
      ]);
      setTodayStatus(todayRes.data);
      setGameStatus(gameRes.data);
    } catch (err) {
      console.error('加载数据失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckin = async (habitId: string) => {
    try {
      const res = await checkinApi.checkin({ habitId });
      showToast('打卡成功！+' + res.data.expGained + 'EXP +' + res.data.coinsGained + '💰');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || '打卡失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <Skeleton type="card" count={1} className="h-24" />
        <Skeleton type="card" count={1} className="h-12" />
        <Skeleton type="list" count={4} />
      </div>
    );
  }

  const checkedCount = todayStatus?.checkins.filter(c => c.checkedIn).length || 0;
  const totalCount = todayStatus?.checkins.length || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Toast toast={toast} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">👋 你好，{user?.nickname}</h1>
        {gameStatus && (
          <LevelBadge level={gameStatus.level} exp={gameStatus.exp} expToNext={gameStatus.expToNext} expProgress={gameStatus.expProgress} />
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">今日进度</span>
          <span className="text-sm text-gray-400">{checkedCount}/{totalCount} 已完成</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: (totalCount > 0 ? (checkedCount / totalCount) * 100 : 0) + '%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-gradient-to-r from-brand-500 to-accent-500 h-2 rounded-full"
          />
        </div>
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">今日习惯</h2>
        {todayStatus?.checkins.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center text-gray-400">
            还没有习惯，去<a href="/habits" className="text-brand-500 hover:underline">创建习惯</a>吧！
          </motion.div>
        ) : (
          todayStatus?.checkins.map((c, i) => (
            <motion.div key={c.habitId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
              <HabitCard
                habit={{ _id: c.habitId, name: c.habitName, icon: c.icon, color: c.color, currentStreak: c.currentStreak, userId: '', frequency: 'daily', isArchived: false, createdAt: '' } as any}
                checkedIn={c.checkedIn}
                onCheckin={handleCheckin}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
