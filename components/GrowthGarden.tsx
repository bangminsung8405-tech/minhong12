import React, { useMemo } from 'react';
import { UserStats, LEVELS } from '../types';
import { Leaf, Sprout, TreeDeciduous, Flower, CloudSun } from 'lucide-react';

interface GrowthGardenProps {
  stats: UserStats;
}

const GrowthGarden: React.FC<GrowthGardenProps> = ({ stats }) => {
  const currentLevelInfo = useMemo(() => {
    return LEVELS.find(l => l.level === stats.level) || LEVELS[0];
  }, [stats.level]);

  const nextLevelInfo = useMemo(() => {
    return LEVELS.find(l => l.level === stats.level + 1);
  }, [stats.level]);

  const progressPercent = useMemo(() => {
    if (!nextLevelInfo) return 100;
    const prevXp = currentLevelInfo.xpRequired;
    const nextXp = nextLevelInfo.xpRequired;
    const current = stats.totalXp;
    
    // Avoid division by zero
    if (nextXp === prevXp) return 100;
    
    const p = ((current - prevXp) / (nextXp - prevXp)) * 100;
    return Math.min(Math.max(p, 0), 100);
  }, [stats.totalXp, currentLevelInfo, nextLevelInfo]);

  const renderPlant = () => {
    const size = "w-32 h-32";
    const color = "text-sage-600";
    
    if (stats.level <= 2) return <Sprout className={`${size} ${color} animate-bounce duration-[3000ms]`} />;
    if (stats.level <= 4) return <Leaf className={`${size} ${color} animate-pulse duration-[4000ms]`} />;
    if (stats.level <= 7) return <Flower className={`${size} ${color} animate-spin-slow`} />;
    return <TreeDeciduous className={`${size} ${color}`} />;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sage-50 to-sage-100 rounded-3xl shadow-inner min-h-[400px]">
      <div className="absolute top-10 right-10 animate-pulse">
        <CloudSun className="w-12 h-12 text-amber-300" />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-sage-800 tracking-tight">{currentLevelInfo.name}</h2>
        <p className="text-sage-600 text-sm mt-1">Lv. {stats.level} Garden</p>
      </div>

      <div className="relative mb-12 transform transition-all duration-700 ease-in-out hover:scale-110">
        <div className="absolute -bottom-4 w-32 h-4 bg-sage-800/10 rounded-full blur-xl"></div>
        {renderPlant()}
      </div>

      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-sage-600 mb-2 font-medium">
          <span>XP {stats.currentXp}</span>
          <span>Next: {nextLevelInfo ? nextLevelInfo.xpRequired - stats.totalXp : 0} XP</span>
        </div>
        <div className="h-4 w-full bg-white rounded-full overflow-hidden shadow-sm border border-sage-200">
          <div 
            className="h-full bg-sage-500 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-shimmer"></div>
          </div>
        </div>
        <p className="text-center text-xs text-sage-500 mt-4 italic">
          "매일 조금씩 자라나고 있어요."
        </p>
      </div>
    </div>
  );
};

export default GrowthGarden;