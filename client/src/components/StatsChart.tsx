import React from 'react';

interface StatsChartProps {
  data: { date: string; count: number }[];
  days?: 7 | 30;
}

const StatsChart: React.FC<StatsChartProps> = ({ data, days = 7 }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = days === 30 ? 10 : 32;
  const chartHeight = 160;
  const gap = days === 30 ? 3 : 8;

  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-gray-700 mb-4">
        {days === 30 ? '近30天' : '近7天'}打卡趋势
      </h3>
      <div className="flex items-end justify-center" style={{ height: chartHeight, gap }}>
        {data.map((item, i) => {
          const height = (item.count / maxCount) * chartHeight;
          const isToday = i === data.length - 1;
          return (
            <div key={i} className="flex flex-col items-center" style={{ width: barWidth }}>
              <span className="text-xs text-gray-500 mb-1">{item.count}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  isToday
                    ? 'bg-gradient-to-t from-brand-500 to-brand-400'
                    : item.count > 0
                    ? 'bg-gradient-to-t from-accent-500 to-accent-400'
                    : 'bg-gray-200'
                }`}
                style={{ height: Math.max(height, 4) }}
                title={`${item.date}: ${item.count}次打卡`}
              />
              <span className={`text-xs mt-1 ${isToday ? 'text-brand-600 font-semibold' : 'text-gray-400'}`}>
                {isToday ? '今天' : formatLabel(item.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsChart;
