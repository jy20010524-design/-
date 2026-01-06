import React from 'react';
import { Check, Plus, Minus, Settings2 } from 'lucide-react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  isEditMode: boolean;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, isEditMode, onIncrement, onDecrement, onEdit }) => {
  const isCounter = task.type === 'counter';
  const isCompleted = task.currentCount >= task.targetCount;
  const isActive = task.currentCount > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      onEdit(task);
    } else {
      // Normal logic
      if (!isCounter && isCompleted) {
          onDecrement(task.id);
      } else {
          onIncrement(task.id);
      }
    }
  };

  return (
    <div 
      onClick={handleClick}
      style={{ backgroundColor: task.color || '#F9FAFB' }}
      className={`
        relative group flex flex-col items-center justify-between p-4 rounded-3xl cursor-pointer transition-all duration-200 border aspect-square select-none
        ${isEditMode 
          ? 'animate-pulse ring-2 ring-brand-500/50 ring-dashed border-brand-200' 
          : (isCompleted && !isCounter 
              ? 'border-transparent shadow-inner opacity-60 saturate-[0.7]' 
              : 'border-black/5 shadow-sm hover:shadow-md hover:-translate-y-1'
            )
        }
        ${!isEditMode && isCounter && isActive ? 'ring-2 ring-brand-200 ring-offset-2' : ''}
      `}
    >
      {/* Edit Overlay Icon */}
      {isEditMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-3xl z-20 backdrop-blur-[1px]">
           <div className="bg-white p-2 rounded-full shadow-sm text-brand-600">
             <Settings2 size={24} />
           </div>
        </div>
      )}

      {/* Decrement Button (Hidden in Edit Mode) */}
      {!isEditMode && isCounter && task.currentCount > 0 && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDecrement(task.id);
          }}
          className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
      )}

      {/* Status Indicator (Hidden in Edit Mode) */}
      {!isEditMode && (
        <div className={`
          absolute top-3 right-3 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm px-2 gap-1
          ${isActive 
            ? 'bg-gray-800 text-white scale-100' 
            : 'bg-white/60 text-transparent scale-0 group-hover:scale-100'
          }
        `}>
          {isCounter ? (
             <span className="text-xs font-bold font-mono leading-none pt-[1px]">
               {task.currentCount}<span className="opacity-50 text-[10px]">/{task.targetCount}</span>
             </span>
          ) : (
             <Check size={14} strokeWidth={3} />
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full gap-2 mt-2">
        <div className={`text-4xl transition-transform duration-300 ${!isEditMode && isCompleted && !isCounter ? 'scale-90 grayscale-[0.3]' : 'scale-100 drop-shadow-sm'}`}>
          {task.emoji || '📌'}
        </div>
        <span className={`
          text-sm font-bold text-center line-clamp-2 leading-tight px-1 transition-colors
          ${!isEditMode && isCompleted && !isCounter ? 'text-gray-500 line-through decoration-gray-400/50' : 'text-gray-700'}
        `}>
          {task.text}
        </span>
      </div>

      {/* Score Badge */}
      <div className={`
        mt-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide transition-colors flex items-center gap-1
        ${isActive && !isEditMode
          ? 'bg-black/5 text-gray-600' 
          : 'bg-white/70 text-gray-700 backdrop-blur-sm'
        }
      `}>
        <Plus size={10} strokeWidth={4} />
        {task.value}
      </div>
    </div>
  );
};