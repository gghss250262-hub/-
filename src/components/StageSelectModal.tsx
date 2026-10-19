import React from 'react';
import { Stage } from '../types/game';
import { STAGES } from '../data/stages';
import { Star, Lock, HelpCircle, Trophy, ArrowRight, X } from 'lucide-react';

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage: (stage: Stage) => void;
  completedStages: string[];
  stageStars: Record<string, number>;
  stageBestTimes: Record<string, number>;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectStage,
  completedStages,
  stageStars,
  stageBestTimes
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Alchemist's Laboratory Stages
            </span>
            <h2 className="text-2xl font-alchemy text-white mt-1">
              🧪 혼합물 분리 실험실 스테이지
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6 overflow-y-auto pr-1">
          {STAGES.map((stage, index) => {
            // First stage is unlocked, subsequent stages unlock if previous is completed
            const isCompleted = completedStages.includes(stage.id);
            const isUnlocked = index === 0 || completedStages.includes(STAGES[index - 1].id) || isCompleted;
            const stars = stageStars[stage.id] || 0;
            const bestTime = stageBestTimes[stage.id];

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectStage(stage);
                    onClose();
                  }
                }}
                className={`relative rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                  !isUnlocked
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60 cursor-not-allowed'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer group'
                    : 'bg-slate-900/90 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer group'
                }`}
              >
                {/* Category & Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      stage.category === 'density'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : stage.category === 'boiling_point'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : stage.category === 'solubility'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {stage.categoryLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Stage {stage.stageNumber}
                  </span>
                </div>

                {/* Title & Story teaser */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Stars Rating or Locked Question Mark */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {isUnlocked ? (
                    <div>
                      {isCompleted ? (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map(st => (
                            <Star
                              key={st}
                              className={`w-4 h-4 ${
                                st <= stars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                          {bestTime && (
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              {bestTime}초
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                          도전 가능! <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Not yet played: show '?' as requested by user */
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span>? (이전 스테이지 완료 시 해금)</span>
                    </div>
                  )}

                  {!isUnlocked && <Lock className="w-4 h-4 text-slate-600" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>💡 각 스테이지를 별 3개로 클리어하면 더 많은 연금술 코인을 얻습니다.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
