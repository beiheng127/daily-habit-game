import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkinApi, gameApi } from '../services/api';
import { TodayStatus, GameStatus } from '../types';
import HabitCard from '../components/HabitCard';
import LevelBadge from '../components/LevelBadge';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type: string = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast(`打卡成功！+${res.data.expGained}EXP +${res.data.coinsGained}💰`);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || '打卡失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  const checkedCount = todayStatus?.checkins.filter(c => c.checkedIn).length || 0;
  const totalCount = todayStatus?.checkins.length || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Toast 通知 */}
      {toast && (
        <div className={`fixed top-20 right-4 px-4 py-2 rounded-lg shadow-lg text-white z-50 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* 欢迎和等级 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          👋 你好，{user?.nickname}
        </h1>
        {gameStatus && (
          <LevelBadge
            level={gameStatus.level}
            exp={gameStatus.exp}
            expToNext={gameStatus.expToNext}
            expProgress={gameStatus.expProgress}
          />
        )}
      </div>

      {/* 今日进度 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">
            今日进度
          </span>
          <span className="text-sm text-gray-400">
            {checkedCount}/{totalCount} 已完成
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 今日习惯卡片列表 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">今日习惯</h2>
        {todayStatus?.checkins.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            还没有习惯，去<a href="/habits" className="text-green-500 hover:underline">创建习惯</a>吧！
          </div>
        ) : (
          todayStatus?.checkins.map(c => (
            <HabitCard
              key={c.habitId}
              habit={{
                _id: c.habitId,
                name: c.habitName,
                icon: c.icon,
                color: c.color,
                currentStreak: 0,
                userId: '',
                frequency: 'daily',
                isArchived: false,
                createdAt: '',
              } as any}
              checkedIn={c.checkedIn}
              onCheckin={handleCheckin}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
