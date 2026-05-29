import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userApi, gameApi } from '../services/api';
import { GameStatus } from '../types';
import LevelBadge from '../components/LevelBadge';
import Skeleton from '../components/Skeleton';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const AVATAR_FRAMES: Record<string, string> = {
  gold: 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]',
  default: ''
};

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [loading, setLoading] = useState(true);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const { toast, showToast } = useToast();

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
      const updatedUser = { ...user!, nickname };
      login(localStorage.getItem('token') || '', updatedUser);
      setEditing(false);
    } catch (err) {
      console.error('更新失败', err);
    }
  };

  // 使用改名卡
  const handleUseRenameCard = async () => {
    if (!newName.trim() || newName.length < 1 || newName.length > 16) {
      showToast('昵称需1-16个字符', 'error');
      return;
    }
    try {
      const res = await gameApi.useItem({ itemType: 'renameCard', itemValue: newName.trim() });
      const updatedUser = { ...user!, nickname: res.data.nickname, inventory: res.data.inventory };
      login(localStorage.getItem('token') || '', updatedUser);
      showToast(res.message || '改名成功！');
      setShowRenameModal(false);
      setNewName('');
    } catch (err: any) {
      showToast(err.response?.data?.message || '操作失败', 'error');
    }
  };

  // 切换头像框
  const handleToggleFrame = async (frameId: string) => {
    try {
      const res = await gameApi.useItem({ itemType: 'avatarFrame', itemValue: frameId });
      const updatedUser = { ...user!, activeFrame: res.data.activeFrame, inventory: res.data.inventory };
      login(localStorage.getItem('token') || '', updatedUser);
      showToast(res.message || '切换成功！');
    } catch (err: any) {
      showToast(err.response?.data?.message || '操作失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <Skeleton type="card" count={1} className="h-32" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton type="card" count={3} className="h-24" />
        </div>
      </div>
    );
  }

  const renameCardCount = user?.inventory?.renameCards || 0;
  const ownedFrames = user?.inventory?.avatarFrames || [];
  const activeFrame = user?.activeFrame || '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Toast toast={toast} />

      <h1 className="text-xl font-bold text-gray-800 mb-6">个人中心</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-2xl border-4 ${AVATAR_FRAMES[activeFrame] || 'border-white'}`}>
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="avatar" /> : '👤'}
          </div>
          <div>
            {editing ? (
              <div className="flex gap-2">
                <input value={nickname} onChange={e => setNickname(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <button onClick={handleUpdateProfile} className="text-sm bg-brand-500 text-white px-3 py-1.5 rounded-xl">保存</button>
                <button onClick={() => setEditing(false)} className="text-sm text-gray-400 px-2">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{user?.nickname}</h2>
                <button onClick={() => setEditing(true)} className="text-xs text-brand-500 hover:underline">修改</button>
              </div>
            )}
            <p className="text-sm text-gray-400">@{user?.username}</p>
          </div>
        </div>
        {gameStatus && (
          <LevelBadge level={gameStatus.level} exp={gameStatus.exp} expToNext={gameStatus.expToNext} expProgress={gameStatus.expProgress} />
        )}
      </motion.div>

      {/* 背包：改名卡 + 头像框 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="glass-card p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-3">我的背包</h3>

        {/* 改名卡 */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <span className="text-sm text-gray-700">改名卡</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">x{renameCardCount}</span>
            {renameCardCount > 0 && (
              <button onClick={() => setShowRenameModal(true)}
                className="text-xs bg-brand-500 text-white px-3 py-1 rounded-lg hover:bg-brand-600 transition-colors">
                使用
              </button>
            )}
          </div>
        </div>

        {/* 头像框 */}
        {ownedFrames.length > 0 && (
          <div className="py-2">
            <p className="text-sm text-gray-500 mb-2">头像框</p>
            <div className="flex gap-2">
              {ownedFrames.map(frameId => (
                <button key={frameId} onClick={() => handleToggleFrame(frameId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeFrame === frameId
                      ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {frameId === 'gold' ? '🖼️ 金色框' : frameId}
                  {activeFrame === frameId ? ' (已装备)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 改名弹窗 */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-80">
            <h3 className="font-bold text-gray-800 mb-4">使用改名卡</h3>
            <p className="text-xs text-gray-400 mb-3">剩余改名卡: {renameCardCount}</p>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="输入新昵称" maxLength={16}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowRenameModal(false); setNewName(''); }}
                className="text-sm text-gray-400 px-3 py-1.5">取消</button>
              <button onClick={handleUseRenameCard}
                className="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-xl hover:bg-brand-600">
                确认改名
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {gameStatus && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{gameStatus.coins}</p>
            <p className="text-xs text-gray-400">金币</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-accent-600">{gameStatus.streak}</p>
            <p className="text-xs text-gray-400">最长连续</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-brand-600">{gameStatus.totalCheckins}</p>
            <p className="text-xs text-gray-400">总打卡</p>
          </div>
        </motion.div>
      )}

      {gameStatus && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-4">
          <h3 className="font-semibold text-gray-700 mb-2">成就进度</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">已解锁 {gameStatus.unlockedCount}/{gameStatus.totalAchievements}</span>
            <a href="/achievements" className="text-sm text-brand-500 hover:underline">查看全部</a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
