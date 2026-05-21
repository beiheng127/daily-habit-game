import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { gameApi } from "../services/api";
import Skeleton from "../components/Skeleton";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  nickname: string;
  level: number;
  totalCheckins: number;
  periodCheckins?: number;
}

const PERIODS = [
  { key: 'all', label: '总榜' },
  { key: 'monthly', label: '月榜' },
  { key: 'weekly', label: '周榜' },
];

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await gameApi.getLeaderboard(period);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">排行榜</h1>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p.key
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton type="list" count={8} />
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const isMe = user?.userId === entry.userId;
            const rankColors = entry.rank <= 3
              ? entry.rank === 1 ? 'bg-yellow-400 text-white' : entry.rank === 2 ? 'bg-gray-300 text-white' : 'bg-orange-400 text-white'
              : 'bg-gray-100 text-gray-500';

            return (
              <motion.div
                key={entry.userId + (entry.rank)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={"p-4 rounded-xl flex items-center gap-4 " + (isMe ? "glass-card ring-2 ring-brand-400 shadow-glow" : "glass-card")}
              >
                <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm " + rankColors}>
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">
                    {entry.nickname}
                    {isMe && <span className="text-xs text-brand-500 ml-2">(我)</span>}
                  </p>
                  <p className="text-xs text-gray-400">@{entry.username}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-brand-600">Lv.{entry.level}</p>
                  <p className="text-xs text-gray-400">
                    {period !== 'all' && entry.periodCheckins != null
                      ? `${entry.periodCheckins}次打卡`
                      : `${entry.totalCheckins}次打卡`
                    }
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="glass-card p-10 text-center text-gray-400">
          暂无排行数据
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
