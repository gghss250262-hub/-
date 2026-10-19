import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, Coins, RotateCcw, ArrowRight, Home, Sparkles } from 'lucide-react';
import { AlchemistCharacter } from './AlchemistCharacter';
import { Stage } from '../types/game';

interface ResultModalProps {
  isOpen: boolean;
  stage: Stage;
  clearTimeSeconds: number;
  stars: number;
  score: number;
  coinsEarned: number;
  equippedCostumeId: string;
  hasNextStage: boolean;
  onNextStage: () => void;
  onRetry: () => void;
  onGoLobby: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  stage,
  clearTimeSeconds,
  stars,
  score,
  coinsEarned,
  equippedCostumeId,
  hasNextStage,
  onNextStage,
  onRetry,
  onGoLobby
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          혼합물 분리 실험 성공!
        </div>

        <h2 className="text-2xl sm:text-3xl font-alchemy text-white mt-1">
          {stage.title} 클리어!
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          물질의 특성(밀도·끓는점·용해도)을 활용하여 모든 순물질을 분리했습니다.
        </p>

        {/* Cheering Alchemist */}
        <div className="my-3">
          <AlchemistCharacter
            mood="cheering"
            equippedCostumeId={equippedCostumeId}
            size="md"
          />
        </div>

        {/* Stars Display */}
        <div className="flex items-center justify-center gap-2 my-2">
          {[1, 2, 3].map(st => (
            <div
              key={st}
              className={`p-2 rounded-2xl border-2 transition-transform ${
                st <= stars
                  ? 'bg-amber-950/80 border-amber-400 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-950/40 border-slate-800 opacity-40'
              }`}
            >
              <Star
                className={`w-7 h-7 sm:w-8 sm:h-8 ${
                  st <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full my-4">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">소요 시간</div>
            <div className="text-lg font-mono font-black text-white mt-0.5">
              {clearTimeSeconds}초
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">획득 점수</div>
            <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
              +{score}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase">보상 코인</div>
            <div className="text-lg font-mono font-black text-amber-300 mt-0.5 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4 text-amber-400" />
              +{coinsEarned}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full mt-2">
          {hasNextStage && (
            <button
              onClick={onNextStage}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              다음 스테이지로 이동 <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRetry}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 다시 하기
          </button>

          <button
            onClick={onGoLobby}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" /> 로비로
          </button>
        </div>
      </div>
    </div>
  );
};
