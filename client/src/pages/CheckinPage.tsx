import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { checkinApi } from '../services/api';
import { CheckinHistory } from '../types';
import Calendar from '../components/Calendar';
import StatsChart from '../components/StatsChart';
import Skeleton from '../components/Skeleton';

const CheckinPage: React.FC = () => {
  const [history, setHistory] = useState<CheckinHistory | null>(null);
  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([]);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [chartDays, setChartDays] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);

  const getCSTDateStr = (date?: Date) => {
    const d = date || new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const cst = new Date(d.getTime() - offset + 8 * 3600000);
    return cst.toISOString().split('T')[0];
  };

  const fetchHistory = useCallback(async () => {
    try {
      const endDate = getCSTDateStr();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (chartDays - 1));
      const startStr = getCSTDateStr(startDate);

      const res = await checkinApi.getHistory({ startDate: startStr, endDate });
      setHistory(res.data);

      const data: { date: string; count: number }[] = [];
      const countMap: Record<string, number> = {};
      res.data.checkins.forEach(c => {
        countMap[c.date] = (countMap[c.date] || 0) + 1;
      });

      const current = new Date(startStr + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      while (current <= end) {
        const dateStr = getCSTDateStr(current);
        data.push({ date: dateStr, count: countMap[dateStr] || 0 });
        current.setDate(current.getDate() + 1);
      }
      setChartData(data);
      setCheckinDates([...new Set(res.data.checkins.map(c => c.date))]);
    } catch (err) {
      console.error('加载打卡历史失败', err);
    } finally {
      setLoading(false);
    }
  }, [chartDays]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <Skeleton type="card" count={1} className="h-48" />
        <Skeleton type="list" count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">打卡历史</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div />
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => { setChartDays(7); setLoading(true); }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                chartDays === 7 ? 'bg-white shadow-sm text-brand-600 font-medium' : 'text-gray-500'
              }`}
            >
              7天
            </button>
            <button
              onClick={() => { setChartDays(30); setLoading(true); }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                chartDays === 30 ? 'bg-white shadow-sm text-brand-600 font-medium' : 'text-gray-500'
              }`}
            >
              30天
            </button>
          </div>
        </div>
        <StatsChart data={chartData} days={chartDays} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <Calendar checkinDates={checkinDates} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-semibold text-gray-700 mb-3">最近记录 ({history?.total || 0})</h2>
        {!history || history.checkins.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-400">
            暂无打卡记录，从首页开始打卡吧！
          </div>
        ) : (
          <div className="space-y-2">
            {history.checkins.slice(0, 20).map((record, i) => (
              <motion.div
                key={`${record.date}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.02 }}
                className="glass-card p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{record.habitIcon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{record.habitName}</p>
                    {record.note && <p className="text-xs text-gray-400">{record.note}</p>}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{record.date}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckinPage;
