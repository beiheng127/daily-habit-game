import React from 'react';

interface Props {
  level: number;
  exp: number;
  expToNext: number;
  expProgress: number;
}

const LevelBadge: React.FC<Props> = ({ level, exp, expToNext, expProgress }) => {
  const percent = Math.min((expProgress / expToNext) * 100, 100);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">Lv.{level}</span>
        <span className="text-sm opacity-90">EXP {exp}/{expToNext}</span>
      </div>
      <div className="w-full bg-white/30 rounded-full h-2">
        <div
          className="bg-yellow-300 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default LevelBadge;
