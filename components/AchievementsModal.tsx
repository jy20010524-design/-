import React from 'react';
import { X, Award, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants';
import { UserStats } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[80vh] border-4 border-white">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-50/50 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Award size={24} className="text-brand-500" />
              成就勋章
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-bold">
              已解锁 {stats.unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.unlockedAchievements.includes(ach.id);
            return (
              <div 
                key={ach.id}
                className={`
                  relative p-5 rounded-2xl border-2 flex flex-col items-center text-center gap-3 transition-all duration-300
                  ${isUnlocked 
                    ? 'bg-gradient-to-br from-brand-50 to-white border-brand-100 shadow-sm scale-100' 
                    : 'bg-gray-50 border-transparent opacity-60 grayscale scale-95'
                  }
                `}
              >
                <div className={`text-5xl ${isUnlocked ? 'animate-bounce-short drop-shadow-sm' : ''}`}>
                  {isUnlocked ? ach.icon : <div className="bg-gray-200 rounded-full p-2"><Lock size={24} className="text-gray-400" /></div>}
                </div>
                <div>
                  <h4 className={`font-bold text-base ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
                {isUnlocked && (
                  <div className="absolute top-3 right-3 text-brand-500">
                    <Award size={16} fill="currentColor" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-100 text-xs text-center text-gray-400 shrink-0">
          当前连续打卡：<span className="font-bold text-brand-500 text-base">{stats.currentStreak}</span> 天
        </div>
      </div>
    </div>
  );
};