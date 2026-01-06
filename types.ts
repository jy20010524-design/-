
export type TaskType = 'boolean' | 'counter';

export interface Task {
  id: string;
  text: string;
  emoji?: string;
  color?: string; // Hex code for background color
  value: number;
  
  // New fields for counters
  type: TaskType;
  currentCount: number;
  targetCount: number; // For boolean this is 1
  
  isCustom: boolean;
  // Deprecated but kept for migration if needed, though we will map to currentCount
  isCompleted?: boolean; 
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  pointsEarned: number;
  moneySpent: number;
}

export interface SpendingLog {
  id: string;
  date: string;
  timestamp: string;
  amount: number;
  reason: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalPointsEarned: number;
  totalMoneySpent: number;
  currentStreak: number;
  lastLoginDate: string;
  unlockedAchievements: string[]; // List of IDs
}

export interface StoredData {
  walletBalance: number;
  tasks: Task[];
  lastUpdated: string;
  history: DailyRecord[];
  stats: UserStats;
  spendingLogs?: SpendingLog[];
}
