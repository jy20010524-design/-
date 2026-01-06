import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Trash2, Check, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import { MORANDI_COLORS, PRESET_TASKS } from '../constants';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task, onSave, onDelete }) => {
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState('');
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  useEffect(() => {
    if (task) {
      setText(task.text);
      setEmoji(task.emoji || '📌');
      setColor(task.color || '#F9FAFB');
      setIsDeleteConfirming(false); // Reset delete state when opening new task
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    onSave(task.id, { text, emoji, color });
    onClose();
  };

  const handleReset = () => {
    // Find original preset
    const preset = PRESET_TASKS.find(p => p.id === task.id);
    if (preset) {
      setEmoji(preset.emoji || '📌');
      setColor(preset.color || '#F9FAFB');
      setText(preset.text);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-600/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up border-4 border-white">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">编辑卡片外观</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex justify-center">
            <div 
              style={{ backgroundColor: color }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-md border border-black/5 transition-colors duration-300"
            >
              {emoji}
            </div>
          </div>

          {/* Emoji Input */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">图标 (Emoji)</label>
            <input 
              type="text" 
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="mt-2 w-full px-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-brand-200 outline-none text-center text-xl"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block">背景颜色</label>
            <div className="grid grid-cols-5 gap-3">
              {MORANDI_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-90 ${color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {task.isCustom ? (
              isDeleteConfirming ? (
                <button 
                  onClick={() => {
                     onDelete(task.id);
                     onClose();
                  }}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/30"
                >
                  <AlertCircle size={18} /> 确认?
                </button>
              ) : (
                <button 
                  onClick={() => setIsDeleteConfirming(true)}
                  className="flex-1 py-3 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} /> 删除
                </button>
              )
            ) : (
              <button 
                onClick={handleReset}
                className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200"
              >
                <RotateCcw size={18} /> 恢复默认
              </button>
            )}
            <button 
              onClick={handleSave}
              className="flex-[2] py-3 bg-brand-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 hover:bg-brand-600"
            >
              <Check size={18} /> 保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};