import React, { useState } from 'react';

interface Props {
  checkinDates: string[];
  onDateSelect?: (date: string) => void;
}

const getCSTDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const cst = new Date(now.getTime() - offset + 8 * 3600000);
  return cst;
};

const Calendar: React.FC<Props> = ({ checkinDates, onDateSelect }) => {
  const cstNow = getCSTDate();
  const [year, setYear] = useState(cstNow.getFullYear());
  const [month, setMonth] = useState(cstNow.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayStr = cstNow.toISOString().split('T')[0];

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const formatDate = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDate(d);
    const isChecked = checkinDates.includes(dateStr);
    const isToday = dateStr === todayStr;

    days.push(
      <button
        key={d}
        onClick={() => onDateSelect?.(dateStr)}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm relative ${
          isToday ? 'ring-2 ring-green-400' : ''
        } ${isChecked ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        {d}
      </button>
    );
  }

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600">&lt;</button>
        <span className="font-semibold">{year}年 {monthNames[month]}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
        {['日','一','二','三','四','五','六'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {days}
      </div>
    </div>
  );
};

export default Calendar;
