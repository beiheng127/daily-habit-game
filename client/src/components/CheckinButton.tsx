import React from 'react';

interface Props {
  loading: boolean;
  checkedIn: boolean;
  onClick: () => void;
}

const CheckinButton: React.FC<Props> = ({ loading, checkedIn, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={checkedIn || loading}
      className={`w-full py-3 rounded-xl text-lg font-bold transition-all ${
        checkedIn
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : loading
            ? 'bg-yellow-300 text-yellow-700 cursor-wait'
            : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 active:scale-95'
      }`}
    >
      {loading ? '打卡中...' : checkedIn ? '✓ 今日已打卡' : '☀️ 点击打卡'}
    </button>
  );
};

export default CheckinButton;
