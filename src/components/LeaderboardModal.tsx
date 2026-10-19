import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/game';
import { getLeaderboard } from '../services/firebase';
import { Trophy, Medal, Star, RefreshCw, X, User } from 'lucide-react';
import { COSTUMES } from '../data/costumes';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudentCode?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentStudentCode
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard();
      setEntries(data);
    } catch (e) {
      console.error('Failed fetching leaderboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRankings();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Firebase Real-time Classroom Standings
              </span>
              <h2 className="text-2xl font-alchemy text-white mt-0.5">
                🏆 연금술 학회 실시간 랭킹보드
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRankings}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="my-6 overflow-y-auto flex-1 pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p>아직 등록된 랭킹 기록이 없습니다.</p>
              <p className="text-xs text-slate-600 mt-1">첫 번째로 스테이지를 클리어하여 명예의 전당에 이름을 올리세요!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isCurrent = currentStudentCode && entry.studentCode.toUpperCase() === currentStudentCode.toUpperCase();
                const costume = COSTUMES.find(c => c.id === entry.equippedCostume) || COSTUMES[0];

                return (
                  <div
                    key={entry.studentCode}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-950/60 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                        : rank === 1
                        ? 'bg-yellow-950/40 border-yellow-500/50'
                        : rank === 2
                        ? 'bg-slate-800/60 border-slate-400/40'
                        : rank === 3
                        ? 'bg-amber-950/30 border-amber-700/40'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Rank Badge & Alchemist Icon */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex items-center justify-center font-black font-mono text-lg">
                        {rank === 1 ? (
                          <span className="text-2xl" title="1위 금메달">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-2xl" title="2위 은메달">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-2xl" title="3위 동메달">🥉</span>
                        ) : (
                          <span className="text-slate-400">#{rank}</span>
                        )}
                      </div>

                      {/* Costume Avatar Icon */}
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                        {costume.icon}
                      </div>

                      {/* Student Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {entry.studentName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                              나 (YOU)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span>코드: {entry.studentCode}</span>
                          <span>•</span>
                          <span>{entry.stagesCleared} 스테이지 클리어</span>
                        </div>
                      </div>
                    </div>

                    {/* Score and Stars */}
                    <div className="flex items-center gap-4 text-right">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{entry.totalStars}</span>
                      </div>
                      <div className="min-w-[80px]">
                        <div className="text-lg font-black font-mono text-emerald-400">
                          {entry.totalScore.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">점수</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>인증번호로 접속하면 반 친구들과 실시간 점수 순위가 자동 연동됩니다.</span>
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
