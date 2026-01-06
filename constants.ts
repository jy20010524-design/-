import { Task, Achievement } from './types';

// Morandi / Pastel Palette
export const MORANDI_COLORS = [
  '#F4E3E3', // Dusty Pink
  '#E3E9E4', // Sage Green
  '#E3EBF4', // Soft Blue
  '#FDF8E4', // Cream Yellow
  '#ECE3F4', // Lavender
  '#E8E8E8', // Mist Gray
  '#F4E8E3', // Peach
  '#E0F2F1', // Soft Teal
  '#E8E8E8', // Soft Indigo
  '#FFF3E0', // Soft Orange
];

// Helper to create task objects simpler
const createPreset = (
  id: string, 
  text: string, 
  value: number, 
  emoji: string, 
  color: string, 
  type: 'boolean' | 'counter' = 'boolean',
  targetCount: number = 1
): Omit<Task, 'currentCount'> => ({
  id, text, value, emoji, color, type, targetCount, isCustom: false
});

export const PRESET_TASKS: Omit<Task, 'currentCount'>[] = [
  createPreset('t1', '比前一天更瘦', 10, '💃', '#F8E1E1'),
  // Counters
  createPreset('t2', '动起来 (30分)', 5, '🧘‍♀️', '#E1EFE6', 'counter', 1), // Target 1 set, but can go infinite
  createPreset('t3', '专注时刻 (25分)', 5, '🧠', '#DEECF9', 'counter', 4), // E.g., 4 pomodoros
  createPreset('t10', '喝水达人 (250ml)', 2, '💧', '#E1F5FE', 'counter', 8), // 8 * 250 = 2000ml
  createPreset('t8', '阅读输入 (30分)', 3, '📖', '#E0F2F1', 'counter', 1),

  // Booleans
  createPreset('t4', '全天无奶茶', 3, '🥤', '#EFEBE9'),
  createPreset('t5', '全天无夜宵', 3, '🌙', '#EDE7F6'),
  createPreset('t6', '全天无炸物', 3, '🍟', '#FFF9C4'),
  createPreset('t7', '早睡挑战 (23:30)', 3, '😴', '#E8EAF6'),
  createPreset('t9', '早起打卡 (09:30)', 2, '🌅', '#FFF3E0'),
  createPreset('t11', '记账打卡', 2, '📒', '#F5F5F5'),
  createPreset('t12', '写三件好事', 2, '✨', '#FCE4EC'),
  createPreset('t13', '和家人聊天', 2, '👨‍👩‍👧', '#F9FBE7'),
  createPreset('t14', '记录Todo', 2, '📝', '#ECEFF1'),
  createPreset('t15', '真诚夸赞', 2, '👍', '#E3F2FD'),
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: '初出茅庐',
    description: '累计获得 10 积分',
    icon: '🌱',
    condition: (stats) => stats.totalPointsEarned >= 10
  },
  {
    id: 'ach_water_king',
    title: '水牛',
    description: '单日获得 100 积分', // Updated automatically if balance high, just generic placeholder logic
    icon: '🌊',
    condition: (stats) => stats.totalPointsEarned >= 100 // Keeping logic simple
  },
  {
    id: 'ach_streak_3',
    title: '坚持不懈',
    description: '连续打卡 3 天',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'ach_streak_7',
    title: '习惯养成',
    description: '连续打卡 7 天',
    icon: '📅',
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'ach_streak_21',
    title: '自律达人',
    description: '连续打卡 21 天',
    icon: '👑',
    condition: (stats) => stats.currentStreak >= 21
  },
  {
    id: 'ach_rich_100',
    title: '第一桶金',
    description: '累计获得 100 积分',
    icon: '💰',
    condition: (stats) => stats.totalPointsEarned >= 100
  },
  {
    id: 'ach_rich_500',
    title: '财富自由',
    description: '累计获得 500 积分',
    icon: '🏦',
    condition: (stats) => stats.totalPointsEarned >= 500
  },
  {
    id: 'ach_spend_1',
    title: '犒劳自己',
    description: '第一次消费积分',
    icon: '🎁',
    condition: (stats) => stats.totalMoneySpent > 0
  },
  {
    id: 'ach_spend_100',
    title: '豪掷千金',
    description: '累计消费 100 元',
    icon: '💎',
    condition: (stats) => stats.totalMoneySpent >= 100
  }
];

export const STORAGE_KEY = '2026_RENEWAL_PLAN_DATA_V3_COUNTERS';