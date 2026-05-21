import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { gameApi } from '../services/api';
import { Achievement } from '../types';
import AchievementCard from '../components/AchievementCard';
import Skeleton from '../components/Skeleton';

const AchievementPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const res = await gameApi.getAchievements();
      setAchievements(res.data);
    } catch (err) {
      console.error('加载成就失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Skeleton type="text" count={1} className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">成就</h1>
        <span className="text-sm text-gray-400">
          {unlockedCount}/{totalCount} 已解锁
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-r from-brand-500 to-accent-500 h-2.5 rounded-full"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.achievementId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <AchievementCard achievement={ach} />
          </motion.div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="glass-card p-10 text-center text-gray-400">
          暂无成就数据
        </div>
      )}
    </div>
  );
};

export default AchievementPage;
