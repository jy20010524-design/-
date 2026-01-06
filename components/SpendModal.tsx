import React, { useState } from 'react';
import { X, ShoppingBag, History, Coins } from 'lucide-react';
import { SpendingLog } from '../types';

interface SpendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
  maxAmount: number;
  spendingLogs?: SpendingLog[];
}

export const SpendModal: React.FC<SpendModalProps> = ({ isOpen, onClose, onConfirm, maxAmount, spendingLogs = [] }) => {
  const [activeTab, setActiveTab] = useState<'spend' | 'history'>('spend');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    onConfirm(val, reason);
    setAmount('');
    setReason('');
    // Optionally stay open or show success, currently we close
    onClose();
  };

  const totalSpentAllTime = spendingLogs.reduce((acc, log) => acc + log.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up border-4 border-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-accent-50/50">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('spend')}
              className={`text-sm font-bold transition-colors ${activeTab === 'spend' ? 'text-accent-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              我要消费
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`text-sm font-bold transition-colors ${activeTab === 'history' ? 'text-accent-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              消费记录
            </button>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'spend' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
             <div className="flex items-center gap-2 mb-2 text-gray-800">
                <ShoppingBag size={24} className="text-accent-500" />
                <h3 className="text-xl font-bold">奖励消费</h3>
             </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">消费金额 (￥)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  max={maxAmount}
                  autoFocus
                  className="w-full px-5 py-4 text-3xl font-bold text-gray-700 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-accent-500/50 outline-none transition-all placeholder:text-gray-300"
                />
              </div>
              <p className="text-xs font-bold text-brand-500 mt-2 text-right px-1">可用余额: {maxAmount}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2 ml-1">消费内容 (可选)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例如：买杯奶茶、看电影"
                className="w-full px-5 py-3 text-sm text-gray-700 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-accent-500/50 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) > maxAmount || parseFloat(amount) <= 0}
              className="w-full py-4 bg-accent-500 hover:bg-accent-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-accent-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 active:scale-95"
            >
              确认消费
            </button>
          </form>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
             {/* Stats Header in History */}
             <div className="p-5 bg-accent-50/30 flex items-center justify-between border-b border-gray-50">
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">累计消费总额</p>
                   <p className="text-2xl font-bold text-accent-600 mt-1">￥{totalSpentAllTime}</p>
                </div>
                <div className="bg-white p-3 rounded-2xl text-accent-400 shadow-sm">
                   <History size={24} />
                </div>
             </div>

             {/* Scrollable List */}
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {spendingLogs.length === 0 ? (
                   <div className="text-center py-10 text-gray-300 flex flex-col items-center gap-2">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="text-sm font-bold">暂无消费记录</p>
                   </div>
                ) : (
                   spendingLogs.map(log => (
                      <div key={log.id} className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                         <div>
                            <p className="font-bold text-gray-700 text-sm">{log.reason || '未备注消费'}</p>
                            <p className="text-xs text-gray-400 mt-1">{log.date} · {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         </div>
                         <div className="text-accent-600 font-bold font-mono">
                            -{log.amount}
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};