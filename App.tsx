import React, { useState, useEffect, useMemo } from 'react';
import { PRESET_TASKS, STORAGE_KEY, ACHIEVEMENTS, MORANDI_COLORS } from './constants';
import { Task, StoredData, DailyRecord, UserStats, SpendingLog } from './types';
import { StatCard } from './components/StatCard';
import { TaskItem } from './components/TaskItem';
import { SpendModal } from './components/SpendModal';
import { ChartsModal } from './components/ChartsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { EditTaskModal } from './components/EditTaskModal';
import { Plus, Wallet, RotateCw, Trophy, Sparkles, BarChart3, Award, Settings, Edit3, Calendar } from 'lucide-react';

const getTodayString = () => new Date().toLocaleDateString('en-CA');

const getNextDay = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  // Construct date using local time to avoid timezone shifts
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + 1);
  
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const INITIAL_STATS: UserStats = {
  totalPointsEarned: 0,
  totalMoneySpent: 0,
  currentStreak: 0,
  lastLoginDate: getTodayString(),
  unlockedAchievements: []
};

const App: React.FC = () => {
  // --- Core State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [spendingLogs, setSpendingLogs] = useState<SpendingLog[]>([]);
  
  // The date currently being recorded/viewed. Defaults to Today, but can be overridden by storage.
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());

  // --- UI State ---
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Modals
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // New Settlement Modal State
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [settleArchiveDate, setSettleArchiveDate] = useState('');
  const [settleNextDate, setSettleNextDate] = useState('');

  // Inputs
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskValue, setNewTaskValue] = useState('2');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    const OLD_KEY = '2026_RENEWAL_PLAN_DATA_V2';
    let saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved && localStorage.getItem(OLD_KEY)) {
        saved = localStorage.getItem(OLD_KEY);
    }

    if (saved) {
      try {
        const parsed: any = JSON.parse(saved);
        
        // 1. Recover Tasks
        let mergedTasks = (parsed.tasks || []).map((t: any) => {
            const presetMatch = PRESET_TASKS.find(p => p.id === t.id);
            let count = t.currentCount;
            if (count === undefined) {
                count = t.isCompleted ? (presetMatch?.targetCount || 1) : 0;
            }

            if (presetMatch) {
                return {
                    ...t,
                    text: presetMatch.text,
                    value: presetMatch.value,
                    type: presetMatch.type,
                    targetCount: presetMatch.targetCount,
                    currentCount: count,
                    isCustom: false,
                    color: t.color || presetMatch.color,
                    emoji: t.emoji || presetMatch.emoji,
                };
            }
            
            return {
                ...t,
                currentCount: count,
                type: t.type || 'boolean',
                targetCount: t.targetCount || 1,
                color: t.color || MORANDI_COLORS[Math.floor(Math.random() * MORANDI_COLORS.length)],
                isCustom: true 
            };
        });

        // 2. Add any new presets
        const existingIds = new Set(mergedTasks.map((t: Task) => t.id));
        const newPresets = PRESET_TASKS.filter(p => !existingIds.has(p.id)).map(p => ({ ...p, currentCount: 0 }));
        mergedTasks = [...mergedTasks, ...newPresets];

        // 3. REMOVED AUTOMATIC RESET LOGIC HERE
        // We now respect the stored date strictly.
        const storedDate = parsed.stats?.lastLoginDate || getTodayString();
        setCurrentDate(storedDate);

        setTasks(mergedTasks);
        setWalletBalance(parsed.walletBalance || 0);
        setHistory(parsed.history || []);
        setStats(parsed.stats || INITIAL_STATS);
        setSpendingLogs(parsed.spendingLogs || []);

      } catch (e) {
        initializeDefaults();
      }
    } else {
      initializeDefaults();
    }
  }, []);

  const initializeDefaults = () => {
    setTasks(PRESET_TASKS.map(t => ({ ...t, currentCount: 0 })));
    setWalletBalance(0);
    setHistory([]);
    setStats(INITIAL_STATS);
    setSpendingLogs([]);
    setCurrentDate(getTodayString());
  };

  useEffect(() => {
    if (tasks.length > 0) { 
      // Ensure stats has the correct current date
      const updatedStats = { ...stats, lastLoginDate: currentDate };
      const dataToSave: StoredData = { 
        tasks, 
        walletBalance, 
        lastUpdated: new Date().toISOString(), 
        history, 
        stats: updatedStats,
        spendingLogs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [tasks, walletBalance, history, stats, currentDate, spendingLogs]);

  // --- Achievements ---
  useEffect(() => {
    const newUnlocked: string[] = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!stats.unlockedAchievements.includes(ach.id) && ach.condition(stats)) {
        newUnlocked.push(ach.id);
        showToast(`解锁成就：${ach.title}`);
      }
    });

    if (newUnlocked.length > 0) {
      setStats(prev => ({ ...prev, unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocked] }));
    }
  }, [stats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to maintain History consistency
  // NOTE: This updates the history entry for `currentDate`
  const updateHistory = (pointsDelta: number, moneyDelta: number) => {
    setHistory(prev => {
      const idx = prev.findIndex(h => h.date === currentDate);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { 
          ...updated[idx], 
          pointsEarned: Math.max(0, updated[idx].pointsEarned + pointsDelta), 
          moneySpent: updated[idx].moneySpent + moneyDelta 
        };
        return updated;
      }
      return [...prev, { date: currentDate, pointsEarned: Math.max(0, pointsDelta), moneySpent: moneyDelta }];
    });
  };

  // --- Task Logic ---
  const handleIncrement = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;
      setWalletBalance(b => b + task.value);
      updateHistory(task.value, 0);
      setStats(s => ({ ...s, totalPointsEarned: s.totalPointsEarned + task.value }));
      return prev.map(t => t.id === id ? { ...t, currentCount: t.currentCount + 1 } : t);
    });
  };

  const handleDecrement = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task || task.currentCount <= 0) return prev;
      setWalletBalance(b => Math.max(0, b - task.value));
      updateHistory(-task.value, 0);
      setStats(s => ({ ...s, totalPointsEarned: Math.max(0, s.totalPointsEarned - task.value) }));
      return prev.map(t => t.id === id ? { ...t, currentCount: Math.max(0, t.currentCount - 1) } : t);
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // --- Settlement / New Day Logic ---
  const openSettlementModal = () => {
    setSettleArchiveDate(currentDate);
    setSettleNextDate(getNextDay(currentDate)); // Default to next day
    setIsSettlementOpen(true);
  };

  const handleSettlementConfirm = () => {
    const todayScore = tasks.reduce((sum, t) => sum + (t.currentCount * t.value), 0);
    
    setHistory(prev => {
      let newHistory = [...prev];
      
      // 1. Clean up "Current Date" history if we are moving it
      if (settleArchiveDate !== currentDate) {
         const currentIdx = newHistory.findIndex(h => h.date === currentDate);
         if (currentIdx >= 0) {
             newHistory[currentIdx].pointsEarned = Math.max(0, newHistory[currentIdx].pointsEarned - todayScore);
         }
      }

      // 2. Set/Overwrite the Archive Date entry with the final score
      const archiveIdx = newHistory.findIndex(h => h.date === settleArchiveDate);
      if (archiveIdx >= 0) {
        newHistory[archiveIdx].pointsEarned = todayScore;
      } else {
        newHistory.push({ date: settleArchiveDate, pointsEarned: todayScore, moneySpent: 0 });
      }
      
      return newHistory;
    });

    // Reset Tasks
    setTasks(prev => prev.map(t => ({ ...t, currentCount: 0 })));
    
    // Update Date
    setCurrentDate(settleNextDate);
    
    // Update Streak logic based on Archive Date
    const diffDays = Math.ceil(Math.abs(new Date(settleNextDate).getTime() - new Date(settleArchiveDate).getTime()) / (86400000));
    let newStreak = stats.currentStreak;
    if (diffDays === 1) {
       newStreak += 1;
    } else if (diffDays > 1) {
       newStreak = 1;
    }
    
    setStats(prev => ({ 
        ...prev, 
        lastLoginDate: settleNextDate,
        currentStreak: newStreak 
    }));

    setIsSettlementOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`📅 已归档至 ${settleArchiveDate}，开启新挑战！`);
  };

  const handleSpend = (amount: number, reason: string) => {
    setWalletBalance(prev => Math.max(0, prev - amount));
    updateHistory(0, amount); // Spending always logs to currentDate
    setStats(prev => ({ ...prev, totalMoneySpent: prev.totalMoneySpent + amount }));
    
    const newLog: SpendingLog = {
      id: Date.now().toString(),
      date: currentDate,
      timestamp: new Date().toISOString(),
      amount: amount,
      reason: reason || '奖励消费'
    };
    setSpendingLogs(prev => [newLog, ...prev]);
  };

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: `custom-${Date.now()}`,
      text: newTaskText,
      value: parseInt(newTaskValue) || 1,
      emoji: '🎯', 
      color: MORANDI_COLORS[Math.floor(Math.random() * MORANDI_COLORS.length)],
      type: 'boolean', 
      currentCount: 0,
      targetCount: 1,
      isCustom: true
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
    setNewTaskValue('2');
    showToast('添加成功！');
  };

  const todayScore = useMemo(() => tasks.reduce((sum, t) => sum + (t.currentCount * t.value), 0), [tasks]);

  return (
    <div className="min-h-screen pb-32 text-gray-800 font-sans selection:bg-brand-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[80] animate-fade-in px-6 py-3 bg-gray-800/90 backdrop-blur text-white text-sm font-bold rounded-full shadow-xl flex items-center gap-3 w-max max-w-[90%] justify-center">
           <Award size={18} className="text-yellow-400 shrink-0" />
           <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-gray-100/50 transition-all">
        {isEditMode ? (
          <div className="bg-brand-500 text-white p-3 text-center text-sm font-bold flex items-center justify-between px-6 animate-slide-up">
            <span>点击任意卡片修改图标和颜色</span>
            <button 
              onClick={() => setIsEditMode(false)}
              className="bg-white/20 px-3 py-1 rounded-full text-xs hover:bg-white/30"
            >
              完成
            </button>
          </div>
        ) : null}

        <div className="max-w-md mx-auto px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">玩家积分</h1>
              <p className="text-xs font-bold text-gray-400 mt-0.5 tracking-wide uppercase">Level Up Your Life</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditMode(!isEditMode)} className={`p-3 border rounded-2xl transition-all shadow-sm active:scale-95 ${isEditMode ? 'bg-brand-500 text-white border-brand-500' : 'bg-white border-gray-100 text-gray-400 hover:text-brand-500'}`}>
                <Settings size={20} />
              </button>
              <button onClick={() => setIsChartsOpen(true)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-brand-500 rounded-2xl transition-all shadow-sm active:scale-95">
                <BarChart3 size={20} />
              </button>
              <button onClick={() => setIsAchievementsOpen(true)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-brand-500 rounded-2xl transition-all shadow-sm active:scale-95">
                <Award size={20} />
              </button>
              <button onClick={() => setIsSpendModalOpen(true)} className="ml-1 text-xs font-bold px-4 py-3 bg-accent-50 text-accent-600 rounded-2xl border border-accent-100 active:scale-95 transition-all shadow-sm hover:bg-accent-100">
                消费奖励
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="今日积分" value={todayScore} icon={<Trophy size={20} />} isPrimary />
            <StatCard label="小金库 (元)" value={walletBalance} unit="CNY" icon={<Wallet size={20} />} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              <h2 className="font-bold text-lg text-gray-700">今日挑战</h2>
            </div>
            
            {/* Clickable Date Display */}
            <button 
              onClick={openSettlementModal}
              className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100 hover:bg-brand-100 transition-colors"
            >
               <Calendar size={14} />
               <span>{currentDate}</span>
               <Edit3 size={12} className="opacity-50" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                isEditMode={isEditMode}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onEdit={setEditingTask}
              />
            ))}
          </div>
        </div>

        {/* Add Custom Task */}
        {!isEditMode && (
          <div className="mt-10 bg-white p-6 rounded-3xl shadow-sm border border-gray-100/60">
            <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wide">添加自定义挑战</h3>
            <form onSubmit={handleAddCustomTask} className="flex gap-3">
              <input 
                type="text" 
                placeholder="任务名称" 
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                className="flex-1 px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-700 focus:bg-white focus:border-brand-200 outline-none transition-all placeholder:text-gray-300"
              />
              <div className="relative w-24">
                <input 
                  type="number" 
                  placeholder="分值" 
                  value={newTaskValue}
                  onChange={e => setNewTaskValue(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-700 focus:bg-white focus:border-brand-200 outline-none transition-all text-center placeholder:text-gray-300"
                />
              </div>
              <button 
                type="submit"
                disabled={!newTaskText.trim()}
                className="px-5 bg-gray-800 text-white rounded-2xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200 active:scale-95"
              >
                <Plus size={22} />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* New Day Button (Hidden in Edit Mode) */}
      {!isEditMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pointer-events-none z-40">
          <button 
            onClick={openSettlementModal}
            className="pointer-events-auto w-full bg-white/90 backdrop-blur-md border border-brand-100 text-brand-600 font-bold py-4 rounded-3xl shadow-xl shadow-brand-500/10 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-brand-50 hover:shadow-2xl hover:shadow-brand-500/15"
          >
            <RotateCw size={20} />
            结算 / 开启新的一天
          </button>
        </div>
      )}

      {/* Modals */}
      <SpendModal 
        isOpen={isSpendModalOpen} 
        onClose={() => setIsSpendModalOpen(false)} 
        onConfirm={handleSpend} 
        maxAmount={walletBalance} 
        spendingLogs={spendingLogs}
      />
      <ChartsModal isOpen={isChartsOpen} onClose={() => setIsChartsOpen(false)} history={history} />
      <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} stats={stats} />
      
      <EditTaskModal 
        isOpen={!!editingTask} 
        task={editingTask} 
        onClose={() => setEditingTask(null)} 
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      {/* Settlement Modal */}
      {isSettlementOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-gray-800/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-slide-up border-4 border-white">
            <div className="flex items-center justify-center mb-5 text-brand-500">
               <div className="bg-brand-50 p-4 rounded-full">
                  <RotateCw size={32} />
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">结算与归档</h3>
            <p className="text-gray-500 mb-6 text-sm text-center px-4">
              将当前的积分 ({todayScore}分) 保存到历史记录，并重置所有任务状态。
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">当前数据归档至 (日期)</label>
                 <input 
                   type="date" 
                   value={settleArchiveDate}
                   onChange={(e) => {
                     setSettleArchiveDate(e.target.value);
                     setSettleNextDate(getNextDay(e.target.value));
                   }}
                   className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-brand-200 rounded-2xl font-bold text-gray-700 outline-none"
                 />
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">开启新的一天 (日期)</label>
                 <input 
                   type="date" 
                   value={settleNextDate}
                   onChange={(e) => setSettleNextDate(e.target.value)}
                   className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-brand-200 rounded-2xl font-bold text-gray-700 outline-none"
                 />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsSettlementOpen(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSettlementConfirm}
                className="flex-[2] py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-95"
              >
                确认结算
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;