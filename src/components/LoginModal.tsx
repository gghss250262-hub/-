import React, { useState } from 'react';
import { KeyRound, User, Sparkles, Check, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { StudentProfile } from '../types/game';
import { getStudentProfile, saveStudentProfile } from '../services/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile;
  onLoginSuccess: (profile: StudentProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onLoginSuccess
}) => {
  const [studentCode, setStudentCode] = useState(currentProfile.studentCode || '');
  const [studentName, setStudentName] = useState(currentProfile.studentName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = studentCode.trim().toUpperCase();
    const cleanName = studentName.trim();

    if (!cleanCode || cleanCode.length < 2) {
      setErrorMsg('인증번호(학번 또는 고유코드)를 2자리 이상 입력해주세요.');
      return;
    }
    if (!cleanName) {
      setErrorMsg('학생 이름이나 별명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Check if profile exists in Firestore / Local
      const existing = await getStudentProfile(cleanCode);
      if (existing) {
        // Log in to existing profile
        onLoginSuccess(existing);
        onClose();
      } else {
        // Create new profile with cleanCode
        const newProfile: StudentProfile = {
          studentCode: cleanCode,
          studentName: cleanName,
          totalScore: 0,
          totalCoins: 100, // Starter bonus coins!
          equippedCostume: 'basic',
          unlockedCostumes: ['basic'],
          completedStages: [],
          stageStars: {},
          stageBestTimes: {},
          updatedAt: new Date().toISOString()
        };
        await saveStudentProfile(newProfile);
        onLoginSuccess(newProfile);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Student Account & Cloud Sync
              </span>
              <h3 className="text-xl font-alchemy text-white mt-0.5">
                학생 인증번호 로그인
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              학생 인증번호 (학번 또는 나만의 고유 코드)
            </label>
            <input
              type="text"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              placeholder="예: 20101, ALCHEMIST, CHEM7"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:outline-none text-white font-mono text-base uppercase tracking-wider transition-colors"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              * 영문 대소문자, 숫자, 대시(-) 가능 (공백 제외)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              학생 이름 또는 별명
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="예: 홍길동, 과학탐구왕"
              maxLength={15}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:outline-none text-white text-base transition-colors"
              required
            />
          </div>

          {/* Quick preset codes for easy classroom testing */}
          <div className="pt-1">
            <span className="text-[10px] text-slate-400 font-bold block mb-1.5">
              💡 빠른 체험 번호 선택:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['20101', '20102', 'CHEMIST', 'ALCH07'].map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setStudentCode(preset);
                    if (!studentName) setStudentName(`${preset} 학생`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 border border-slate-700 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-300 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Cloud explanation */}
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              앱을 껐다 켜거나 기기를 바꾸어도 <strong>같은 인증번호</strong>를 입력하면 스테이지 별점과 구매한 옷이 그대로 이어집니다!
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {isLoading ? '동기화 중...' : '접속 및 게임 데이터 불러오기'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
