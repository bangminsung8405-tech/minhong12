import React, { useState, useEffect } from 'react';
import { AppTab, Quest, UserStats, LEVELS } from './types';
import GrowthGarden from './components/GrowthGarden';
import QuestBoard from './components/QuestBoard';
import ChatCompanion from './components/ChatCompanion';
import { Sprout, ListTodo, MessageCircleHeart, User as UserIcon } from 'lucide-react';
import { generateDailyMotivation } from './services/geminiService';

const INITIAL_STATS: UserStats = {
  level: 1,
  currentXp: 0,
  totalXp: 0,
  streakDays: 1,
  lastLoginDate: new Date().toISOString().split('T')[0]
};

const INITIAL_QUESTS: Quest[] = [
  { id: '1', title: '기지개 켜기', description: '몸을 쭉 펴고 근육 깨우기', xp: 10, completed: false },
  { id: '2', title: '물 한 잔 마시기', description: '시원한 물로 하루 시작', xp: 10, completed: false },
  { id: '3', title: '창문 열고 환기하기', description: '신선한 공기 5분 마시기', xp: 15, completed: false },
];

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_STATS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [dailyQuote, setDailyQuote] = useState<string>('');
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);

  // Load data on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('userStats');
    const savedQuests = localStorage.getItem('quests');
    
    if (savedStats) setUserStats(JSON.parse(savedStats));
    if (savedQuests) setQuests(JSON.parse(savedQuests));

    generateDailyMotivation().then(setDailyQuote);
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('quests', JSON.stringify(quests));
  }, [quests]);

  const addXp = (amount: number) => {
    setUserStats(prev => {
      const newTotalXp = prev.totalXp + amount;
      const newCurrentXp = prev.currentXp + amount;
      
      // Check level up
      let newLevel = prev.level;
      const nextLevelInfo = LEVELS.find(l => l.level === prev.level + 1);
      
      if (nextLevelInfo && newTotalXp >= nextLevelInfo.xpRequired) {
        newLevel = prev.level + 1;
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      return {
        ...prev,
        totalXp: newTotalXp,
        currentXp: newCurrentXp,
        level: newLevel
      };
    });
  };

  const removeXp = (amount: number) => {
      setUserStats(prev => {
          const newTotalXp = Math.max(0, prev.totalXp - amount);
          const newCurrentXp = Math.max(0, prev.currentXp - amount);
          // Simple rollback logic, assuming level doesn't drop for motivation purposes usually, 
          // but for consistency let's keep level logic simple (no level down)
          return {
              ...prev,
              totalXp: newTotalXp,
              currentXp: newCurrentXp
          };
      });
  }

  const handleToggleQuest = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        if (!q.completed) addXp(q.xp);
        else removeXp(q.xp);
        return { ...q, completed: !q.completed };
      }
      return q;
    }));
  };

  const handleAddQuest = (newQuest: Omit<Quest, 'id' | 'completed'>) => {
    const quest: Quest = {
      ...newQuest,
      id: Date.now().toString(),
      completed: false
    };
    setQuests(prev => [quest, ...prev]);
  };

  const handleDeleteQuest = (id: string) => {
      setQuests(prev => prev.filter(q => q.id !== id));
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-stone-50 shadow-2xl relative overflow-hidden flex flex-col">
      {/* Level Up Overlay */}
      {showLevelUp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl text-center shadow-xl transform scale-110 transition-transform">
            <Sprout className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-sage-800">Level Up!</h2>
            <p className="text-sage-600">정원이 더 아름다워졌어요.</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
        {activeTab === AppTab.HOME && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 fade-in duration-500">
            <header>
              <h1 className="text-xl font-bold text-sage-900">반가워요.</h1>
              {dailyQuote ? (
                 <p className="text-sage-600 mt-2 text-sm leading-relaxed font-serif italic">"{dailyQuote}"</p>
              ) : (
                <div className="h-4 w-3/4 bg-sage-200 animate-pulse rounded mt-2"></div>
              )}
            </header>
            <GrowthGarden stats={userStats} />
            
            <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm">
                <h3 className="font-bold text-sage-800 mb-3">나의 여정</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-sage-50 p-3 rounded-xl">
                        <div className="text-xs text-sage-500 mb-1">총 경험치</div>
                        <div className="text-xl font-bold text-sage-700">{userStats.totalXp} XP</div>
                    </div>
                    <div className="bg-sage-50 p-3 rounded-xl">
                        <div className="text-xs text-sage-500 mb-1">완료한 일</div>
                        <div className="text-xl font-bold text-sage-700">{quests.filter(q => q.completed).length}</div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === AppTab.QUESTS && (
          <div className="animate-in slide-in-from-right-2 fade-in duration-300">
            <QuestBoard 
              quests={quests} 
              onToggleQuest={handleToggleQuest} 
              onAddQuest={handleAddQuest}
              onDeleteQuest={handleDeleteQuest}
            />
          </div>
        )}

        {activeTab === AppTab.CHAT && (
          <div className="animate-in slide-in-from-right-2 fade-in duration-300 h-full">
            <ChatCompanion />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-stone-200 px-6 py-4 pb-6 flex justify-between items-center z-10 sticky bottom-0">
        <button 
          onClick={() => setActiveTab(AppTab.HOME)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.HOME ? 'text-sage-600' : 'text-stone-400 hover:text-stone-500'}`}
        >
          <Sprout className={`w-6 h-6 ${activeTab === AppTab.HOME ? 'fill-sage-100' : ''}`} />
          <span className="text-[10px] font-medium">정원</span>
        </button>
        
        <button 
          onClick={() => setActiveTab(AppTab.QUESTS)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.QUESTS ? 'text-sage-600' : 'text-stone-400 hover:text-stone-500'}`}
        >
          <ListTodo className={`w-6 h-6 ${activeTab === AppTab.QUESTS ? 'fill-sage-100' : ''}`} />
          <span className="text-[10px] font-medium">할일</span>
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.CHAT)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.CHAT ? 'text-sage-600' : 'text-stone-400 hover:text-stone-500'}`}
        >
          <MessageCircleHeart className={`w-6 h-6 ${activeTab === AppTab.CHAT ? 'fill-sage-100' : ''}`} />
          <span className="text-[10px] font-medium">대화</span>
        </button>
      </nav>
    </div>
  );
}

export default App;