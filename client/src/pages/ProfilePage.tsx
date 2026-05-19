import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi, gameApi } from '../services/api';
import { GameStatus } from '../types';
import LevelBadge from '../components/LevelBadge';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await gameApi.getStatus();
      setGameStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateProfile = async () => {
    try {
      const res = await userApi.updateProfile({ nickname });
      login(localStorage.getItem('token') || '', res.data);
      setEditing(false);
    } catch (err) {
      console.error('更新失败', err);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">个人中心</h1>

      {/* 用户信息卡片 */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="avatar" /> : '👤'}
          </div>
          <div>
            {editing ? (
              <div className="flex gap-2">
                <input value={nickname} onChange={e => setNickname(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1 text-sm" />
                <button onClick={handleUpdateProfile} className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg">保存</button>
                <button onClick={() => setEditing(false)} className="text-sm text-gray-400 px-2">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{user?.nickname}</h2>
                <button onClick={() => setEditing(true)} className="text-xs text-blue-500">修改</button>
              </div>
            )}
            <p className="text-sm text-gray-400">@{user?.username}</p>
          </div>
        </div>

        {gameStatus && (
          <LevelBadge
            level={gameStatus.level}
            exp={gameStatus.exp}
            expToNext={gameStatus.expToNext}
            expProgress={gameStatus.expProgress}
          />
        )}
      </div>

      {/* 统计卡片 */}
      {gameStatus && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">{gameStatus.coins}</p>
            <p className="text-xs text-gray-400">金币</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{gameStatus.streak}</p>
            <p className="text-xs text-gray-400">最长连续</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{gameStatus.totalCheckins}</p>
            <p className="text-xs text-gray-400">总打卡</p>
          </div>
        </div>
      )}

      {/* 成就概览 */}
      {gameStatus && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2">成就进度</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              已解锁 {gameStatus.unlockedCount}/{gameStatus.totalAchievements}
            </span>
            <a href="/achievements" className="text-sm text-green-500 hover:underline">查看全部</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
