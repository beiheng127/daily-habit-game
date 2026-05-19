import React, { useEffect, useState } from 'react';
import { gameApi } from '../services/api';
import { Achievement } from '../types';
import AchievementCard from '../components/AchievementCard';

const AchievementPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await gameApi.getAchievements();
        setAchievements(res.data);
      } catch (err) {
        console.error('获取成就失败', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-2">成就墙</h1>
      <p className="text-sm text-gray-400 mb-6">已解锁 {unlocked.length}/{achievements.length}</p>

      {unlocked.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">已解锁</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {unlocked.map(a => (
              <AchievementCard key={a.achievementId} achievement={a} />
            ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">未解锁</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locked.map(a => (
              <AchievementCard key={a.achievementId} achievement={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AchievementPage;
