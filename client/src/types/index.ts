// 用户类型
export interface User {
  userId: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  level: number;
  exp: number;
  coins: number;
  streak: number;
  totalCheckins: number;
  createdAt?: string;
  inventory?: {
    skipCards: number;
    renameCards: number;
    avatarFrames: string[];
    themeColors: string[];
  };
  activeFrame?: string;
  activeTheme?: string;
}

// 登录/注册响应
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  userId: string;
  username: string;
  nickname: string;
  level: number;
  exp: number;
  coins: number;
}

// 习惯类型
export interface Habit {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  customDays?: number[];
  reminderTime?: string;
  isArchived: boolean;
  currentStreak: number;
  createdAt: string;
}

// 打卡状态
export interface CheckinStatus {
  habitId: string;
  habitName: string;
  icon: string;
  color: string;
  checkedIn: boolean;
  note: string | null;
  currentStreak: number;
}

export interface TodayStatus {
  date: string;
  checkins: CheckinStatus[];
}

// 打卡历史
export interface CheckinRecord {
  date: string;
  habitName: string;
  habitIcon: string;
  note: string;
}

export interface CheckinHistory {
  total: number;
  checkins: CheckinRecord[];
}

// 打卡响应
export interface CheckinResult {
  checkinId: string;
  date: string;
  streak: number;
  expGained: number;
  coinsGained: number;
  newExp: number;
  newLevel: number;
  newAchievements: any[];
}

// 成就类型
export interface Achievement {
  achievementId: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  target: number;
}

// 游戏状态
export interface GameStatus {
  level: number;
  exp: number;
  expToNext: number;
  expProgress: number;
  coins: number;
  streak: number;
  totalCheckins: number;
  unlockedCount: number;
  totalAchievements: number;
  recentAchievements: { name: string; icon: string; unlockedAt: string }[];
}

// 等级信息
export interface LevelInfo {
  userId: string;
  level: number;
  exp: number;
  expToNext: number;
  expProgress: number;
}

// API统一响应格式
export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}
