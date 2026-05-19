import React from 'react';
import { Habit } from '../types';

interface Props {
  habit: Habit;
  checkedIn: boolean;
  onCheckin: (habitId: string) => void;
}

const HabitCard: React.FC<Props> = ({ habit, checkedIn, onCheckin }) => {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
      style={{ borderLeftColor: habit.color, borderLeftWidth: 4 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{habit.icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800">{habit.name}</h3>
          <p className="text-xs text-gray-400">
            连续 {habit.currentStreak} 天
          </p>
        </div>
      </div>

      <button
        onClick={() => onCheckin(habit._id)}
        disabled={checkedIn}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          checkedIn
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {checkedIn ? '✓ 已打卡' : '打卡'}
      </button>
    </div>
  );
};

export default HabitCard;
