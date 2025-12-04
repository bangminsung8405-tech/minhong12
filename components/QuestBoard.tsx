import React, { useState } from 'react';
import { Quest } from '../types';
import { CheckCircle2, Circle, Sparkles, Plus, Trash2 } from 'lucide-react';
import { generateMicroQuests } from '../services/geminiService';

interface QuestBoardProps {
  quests: Quest[];
  onToggleQuest: (id: string) => void;
  onAddQuest: (quest: Omit<Quest, 'id' | 'completed'>) => void;
  onDeleteQuest: (id: string) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onToggleQuest, onAddQuest, onDeleteQuest }) => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestTitle, setCustomQuestTitle] = useState('');

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsLoading(true);
    const newQuests = await generateMicroQuests(aiPrompt);
    newQuests.forEach(q => {
      if (q.title && q.xp) {
        onAddQuest({
          title: q.title,
          description: q.description || '',
          xp: q.xp,
          isAiGenerated: true
        });
      }
    });
    setIsLoading(false);
    setIsAiModalOpen(false);
    setAiPrompt('');
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestTitle.trim()) return;
    onAddQuest({
      title: customQuestTitle,
      xp: 15,
      isAiGenerated: false
    });
    setCustomQuestTitle('');
  };

  const activeQuests = quests.filter(q => !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-sage-900">오늘의 할 일</h2>
          <p className="text-sage-600 text-sm">작은 성공들이 모여 숲이 됩니다.</p>
        </div>
      </div>

      {/* Magic Button */}
      <button
        onClick={() => setIsAiModalOpen(!isAiModalOpen)}
        className="w-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 p-4 rounded-xl flex items-center justify-center gap-2 text-indigo-700 font-medium hover:shadow-md transition-all active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
        <span>너무 막막해요! AI 쪼개기 도움받기</span>
      </button>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">무엇이 가장 하기 힘든가요?</label>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="예: 방 청소하기, 코딩 공부 시작하기..."
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none mb-3"
            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsAiModalOpen(false)}
              className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm"
            >
              취소
            </button>
            <button 
              onClick={handleAiGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? '생성 중...' : '작게 쪼개줘!'}
            </button>
          </div>
        </div>
      )}

      {/* Custom Add */}
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <input
          type="text"
          value={customQuestTitle}
          onChange={(e) => setCustomQuestTitle(e.target.value)}
          placeholder="직접 할 일 추가하기 (예: 물 한 잔 마시기)"
          className="flex-1 p-3 bg-white border border-sage-200 rounded-xl focus:outline-none focus:border-sage-400"
        />
        <button type="submit" className="p-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Quest List */}
      <div className="space-y-3">
        {activeQuests.length === 0 && completedQuests.length === 0 && (
          <div className="text-center py-10 text-sage-400">
            <p>아직 할 일이 없어요.</p>
            <p className="text-sm mt-1">아주 사소한 것이라도 추가해보세요!</p>
          </div>
        )}

        {activeQuests.map(quest => (
          <div key={quest.id} className="group bg-white p-4 rounded-xl border border-sage-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3">
            <button onClick={() => onToggleQuest(quest.id)} className="text-sage-300 hover:text-sage-500 transition-colors">
              <Circle className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h3 className="text-sage-800 font-medium">{quest.title}</h3>
              {quest.description && <p className="text-xs text-sage-500 mt-0.5">{quest.description}</p>}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">+{quest.xp} XP</span>
                <button onClick={() => onDeleteQuest(quest.id)} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}

        {completedQuests.length > 0 && (
            <div className="pt-4">
                <h3 className="text-sm font-bold text-sage-400 mb-3 px-1">완료한 일</h3>
                <div className="space-y-2 opacity-60">
                    {completedQuests.map(quest => (
                    <div key={quest.id} className="bg-sage-50 p-3 rounded-lg flex items-center gap-3">
                        <button onClick={() => onToggleQuest(quest.id)} className="text-sage-500">
                        <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <span className="text-sage-500 line-through text-sm flex-1">{quest.title}</span>
                    </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default QuestBoard;