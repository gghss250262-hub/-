import React, { useState } from 'react';
import { Lightbulb, Sparkles, X, ChevronRight, AlertCircle } from 'lucide-react';
import { Stage } from '../types/game';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: Stage;
}

export const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, stage }) => {
  const [unlockedHintIndex, setUnlockedHintIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Scientific Guidance
              </span>
              <h3 className="text-lg font-alchemy text-white mt-0.5">
                💡 연금술사 힌트: {stage.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hints sequence */}
        <div className="my-5 space-y-3">
          {stage.hints.map((hintText, idx) => {
            const isRevealed = idx <= unlockedHintIndex;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isRevealed
                    ? 'bg-slate-950/80 border-amber-500/50 text-slate-200 shadow-md'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-400">
                    힌트 {idx + 1}단계 {idx === 0 ? '(기초 개념)' : idx === 1 ? '(실험 기구)' : '(정답 가이드)'}
                  </span>
                  {!isRevealed && (
                    <button
                      onClick={() => setUnlockedHintIndex(idx)}
                      className="text-[11px] font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-600 hover:bg-amber-900 transition-colors"
                    >
                      힌트 열기
                    </button>
                  )}
                </div>
                {isRevealed ? (
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                    {hintText}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    생각이 잘 떠오르지 않는다면 '힌트 열기'를 눌러주세요.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>스스로 고민한 뒤 해결하면 연금술 점수가 더 높아집니다!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
