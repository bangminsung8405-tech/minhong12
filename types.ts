export interface Quest {
  id: string;
  title: string;
  description?: string;
  xp: number;
  completed: boolean;
  isAiGenerated?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppTab {
  HOME = 'HOME',
  QUESTS = 'QUESTS',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export interface UserStats {
  level: number;
  currentXp: number;
  totalXp: number;
  streakDays: number;
  lastLoginDate: string;
}

export const LEVELS = [
  { level: 1, xpRequired: 0, name: "Seedling" },
  { level: 2, xpRequired: 100, name: "Sprout" },
  { level: 3, xpRequired: 250, name: "Bud" },
  { level: 4, xpRequired: 500, name: "Leaf" },
  { level: 5, xpRequired: 800, name: "Branch" },
  { level: 6, xpRequired: 1200, name: "Sapling" },
  { level: 7, xpRequired: 1700, name: "Young Tree" },
  { level: 8, xpRequired: 2300, name: "Blooming Tree" },
  { level: 9, xpRequired: 3000, name: "Wise Tree" },
  { level: 10, xpRequired: 4000, name: "Forest Guardian" },
];