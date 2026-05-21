import React from 'react';

interface SkeletonProps {
  type?: 'text' | 'card' | 'circle' | 'list';
  count?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', count = 1, className = '' }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = (key: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={key} className={`skeleton rounded-xl p-4 ${className}`}>
            <div className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          </div>
        );
      case 'circle':
        return <div key={key} className={`skeleton rounded-full ${className}`} />;
      case 'list':
        return (
          <div key={key} className={`skeleton rounded-xl p-4 flex items-center justify-between ${className}`}>
            <div className="flex items-center gap-3">
              <div className="skeleton w-8 h-8 rounded-full" />
              <div className="space-y-1">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            </div>
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        );
      case 'text':
      default:
        return <div key={key} className={`skeleton h-4 rounded ${className}`} />;
    }
  };

  return <>{items.map(renderSkeleton)}</>;
};

export default Skeleton;
