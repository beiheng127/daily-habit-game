import React, { useEffect, useState } from 'react';
import { checkinApi } from '../services/api';
import { CheckinRecord } from '../types';
import Calendar from '../components/Calendar';

const CheckinPage: React.FC = () => {
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await checkinApi.getHistory();
      setHistory(res.data.checkins);
      const dates = [...new Set(res.data.checkins.map((c: CheckinRecord) => c.date))];
      setCheckinDates(dates);
    } catch (err) {
      console.error('获取历史失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const selectedRecords = selectedDate
    ? history.filter(r => r.date === selectedDate)
    : [];

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">打卡历史</h1>

      <Calendar checkinDates={checkinDates} onDateSelect={setSelectedDate} />

      {selectedDate && (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">{selectedDate} 打卡详情</h3>
          {selectedRecords.length === 0 ? (
            <p className="text-gray-400 text-sm">当天没有打卡记录</p>
          ) : (
            selectedRecords.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span>{r.habitIcon}</span>
                <span className="text-sm font-medium">{r.habitName}</span>
                {r.note && <span className="text-xs text-gray-400">- {r.note}</span>}
              </div>
            ))
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">最近打卡</h3>
          {history.slice(0, 10).map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0 text-sm">
              <span className="text-gray-400 w-24">{r.date}</span>
              <span>{r.habitIcon}</span>
              <span className="font-medium">{r.habitName}</span>
              {r.note && <span className="text-gray-400">- {r.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckinPage;
