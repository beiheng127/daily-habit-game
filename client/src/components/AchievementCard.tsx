import React from 'react';
import { Achievement } from '../types';

interface Props {
  achievement: Achievement;
}

const AchievementCard: React.FC<Props> = ({ achievement }) => {
  const progressPercent = achievement.target > 0
    ? Math.min((achievement.progress / achievement.target) * 100, 100)
    : 0;

  return (
    <div
      className={`rounded-xl p-4 border ${
        achievement.unlocked
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-gray-50 border-gray-200 opacity-70'
      }`}
    >
      <div className="text-center mb-2">
        <span className="text-3xl">{achievement.icon}</span>
      </div>
      <h3 className="font-semibold text-center text-sm">{achievement.name}</h3>
      <p className="text-xs text-gray-500 text-center mt-1">{achievement.description}</p>

      {achievement.unlocked ? (
        <p className="text-xs text-green-600 text-center mt-2">
          ✓ 已解锁
          {achievement.unlockedAt && ` · ${achievement.unlockedAt}`}
        </p>
      ) : (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gray-400 h-1.5 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            {achievement.progress}/{achievement.target}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementCard;
