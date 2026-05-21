import React from 'react';
import { motion } from 'framer-motion';
import { Habit } from '../types';

interface Props {
  habit: Habit;
  checkedIn: boolean;
  onCheckin: (habitId: string) => void;
}

const HabitCard: React.FC<Props> = ({ habit, checkedIn, onCheckin }) => {
  return (
    <div
      className="glass-card p-4 flex items-center justify-between"
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

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onCheckin(habit._id)}
        disabled={checkedIn}
        className={'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' + (checkedIn ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-500 text-white hover:bg-brand-600 shadow-soft')}
      >
        {checkedIn ? '✓ 已打卡' : '打卡'}
      </motion.button>
    </div>
  );
};

export default HabitCard;
