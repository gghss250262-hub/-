import React, { useState, useEffect, useRef } from 'react';
import {
  Stage,
  StudentProfile,
  AlchemistMood
} from './types/game';
import { STAGES } from './data/stages';
import { COSTUMES } from './data/costumes';
import {
  testFirestoreConnection,
  getStudentProfile,
  saveStudentProfile
} from './services/firebase';
import { AlchemistCharacter } from './components/AlchemistCharacter';
import { SeparationLab } from './components/SeparationLab';
import { StageSelectModal } from './components/StageSelectModal';
import { ShopModal } from './components/ShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ScienceGuideModal } from './components/ScienceGuideModal';
import { HintModal } from './components/HintModal';
import { ResultModal } from './components/ResultModal';
import { LoginModal } from './components/LoginModal';
import {
  Play,
  BookOpen,
  ShoppingBag,
  Trophy,
  HelpCircle,
  Clock,
  Star,
  Coins,
  Sparkles,
  KeyRound,
  RotateCcw,
  ArrowRight,
  FlaskConical,
  Flame,
  Layers,
  Thermometer,
  Filter
} from 'lucide-react';

const DEFAULT_PROFILE: StudentProfile = {
  studentCode: 'EDWARD01',
  studentName: '에드워드 엘릭',
  totalScore: 0,
  totalCoins: 300,
  equippedCostume: 'basic',
  unlockedCostumes: ['basic'],
  completedStages: [],
  stageStars: {},
  stageBestTimes: {},
  updatedAt: new Date().toISOString()
};

export default function App() {
  // Navigation & Game State
  const [currentView, setCurrentView] = useState<'lobby' | 'playing'>('lobby');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const activeStage = STAGES[currentStageIndex];

  // In-Game Separation Tracking
  const [separatedSubstances, setSeparatedSubstances] = useState<
    Record<string, { purity: number; collected: boolean }>
  >({});
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Alchemist Character Emotion in Game
  const [alchemistMood, setAlchemistMood] = useState<AlchemistMood>('panicked');
  const [alchemistDialogue, setAlchemistDialogue] = useState<string>('');

  // Modals
  const [showStageSelect, setShowStageSelect] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Completed Stage Result details
  const [lastClearResult, setLastClearResult] = useState<{
    stars: number;
    score: number;
    coinsEarned: number;
    time: number;
  }>({ stars: 0, score: 0, coinsEarned: 0, time: 0 });

  // Student Profile (Firebase / Local Storage sync)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);

  // Initialize and load saved profile
  useEffect(() => {
    async function init() {
      await testFirestoreConnection();
      const lastCode = localStorage.getItem('alchemist_last_student_code') || 'GUEST201';
      const loaded = await getStudentProfile(lastCode);
      if (loaded) {
        setProfile(loaded);
      } else {
        await saveStudentProfile(DEFAULT_PROFILE);
        setProfile(DEFAULT_PROFILE);
      }
    }
    init();
  }, []);

  // Timer loop when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentView === 'playing' && !showResult) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentView, showResult]);

  // Start Playing a Stage
  const handleStartStage = (stage: Stage) => {
    const idx = STAGES.findIndex(s => s.id === stage.id);
    setCurrentStageIndex(idx >= 0 ? idx : 0);
    setSeparatedSubstances({});
    setTimeElapsed(0);
    setIsTimerRunning(true);
    setAlchemistMood('panicked');
    setAlchemistDialogue(`${stage.title}! 물질들이 뒤섞여있어, 서둘러 분리하자!`);
    setCurrentView('playing');
  };

  // Called when a substance is successfully purified in the lab
  const handleSubstanceSeparated = (substanceId: string, purity: number) => {
    setSeparatedSubstances(prev => {
      const updated = {
        ...prev,
        [substanceId]: { purity, collected: true }
      };

      // Check if all target substances for this stage are collected
      const allDone = activeStage.targetSubstances.every(
        req => updated[req.substanceId]?.collected
      );

      if (allDone) {
        // Complete stage
        handleStageCleared(timeElapsed);
      }

      return updated;
    });
  };

  // Calculate stars and score on stage clear
  const handleStageCleared = (clearTime: number) => {
    setIsTimerRunning(false);

    // Compute star rating:
    // 3 Stars: clearTime <= 50% limit
    // 2 Stars: clearTime <= 80% limit
    // 1 Star: clearTime > 80%
    const limit = activeStage.timeLimitSec;
    let stars = 1;
    if (clearTime <= limit * 0.55) {
      stars = 3;
    } else if (clearTime <= limit * 0.85) {
      stars = 2;
    }

    const timeBonus = Math.max(0, (limit - clearTime) * 10);
    const stageBaseScore = 500;
    const stageScore = stageBaseScore + stars * 200 + timeBonus;
    const coinsEarned = stars * 60 + Math.floor(timeBonus / 5);

    setLastClearResult({
      stars,
      score: stageScore,
      coinsEarned,
      time: clearTime
    });

    // Update Student Profile
    setProfile(prev => {
      const isNewClear = !prev.completedStages.includes(activeStage.id);
      const newCompleted = isNewClear
        ? [...prev.completedStages, activeStage.id]
        : prev.completedStages;

      const prevStars = prev.stageStars[activeStage.id] || 0;
      const newStars = {
        ...prev.stageStars,
        [activeStage.id]: Math.max(prevStars, stars)
      };

      const prevBest = prev.stageBestTimes[activeStage.id];
      const newBestTimes = {
        ...prev.stageBestTimes,
        [activeStage.id]: prevBest ? Math.min(prevBest, clearTime) : clearTime
      };

      const updatedProfile: StudentProfile = {
        ...prev,
        totalScore: prev.totalScore + stageScore,
        totalCoins: prev.totalCoins + coinsEarned,
        completedStages: newCompleted,
        stageStars: newStars,
        stageBestTimes: newBestTimes,
        updatedAt: new Date().toISOString()
      };

      // Asynchronously sync to Firebase and localStorage
      saveStudentProfile(updatedProfile);
      return updatedProfile;
    });

    setShowResult(true);
  };

  // Costume purchase & equip
  const handleBuyCostume = async (costumeId: string, price: number) => {
    if (profile.totalCoins < price) return;
    const updated: StudentProfile = {
      ...profile,
      totalCoins: profile.totalCoins - price,
      unlockedCostumes: [...profile.unlockedCostumes, costumeId],
      equippedCostume: costumeId,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    await saveStudentProfile(updated);
  };

  const handleEquipCostume = async (costumeId: string) => {
    const updated: StudentProfile = {
      ...profile,
      equippedCostume: costumeId,
      updatedAt: new Date().toISOString()
    };
    setProfile(updated);
    await saveStudentProfile(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Universal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Stage Name */}
          <div
            onClick={() => setCurrentView('lobby')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🧪
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-alchemy tracking-wide text-white group-hover:text-amber-300 transition-colors">
                  연금술사의 물질 분리 연구소
                </h1>
                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/60 px-2 py-0.5 rounded-full font-bold hidden sm:inline">
                  중2 과학 시뮬레이션
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                밀도 • 끓는점 • 용해도를 이용한 혼합물의 분리
              </p>
            </div>
          </div>

          {/* User Bar & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student Code Badge (Click to open login/sync modal) */}
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs text-slate-200 transition-colors"
              title="클릭하여 학생 인증번호 변경 및 데이터 동기화"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400 font-bold leading-none">인증번호</div>
                <div className="text-xs font-mono font-bold text-amber-300 leading-tight">
                  {profile.studentCode} ({profile.studentName})
                </div>
              </div>
              <span className="sm:hidden font-mono font-bold text-amber-300">{profile.studentCode}</span>
            </button>

            {/* Coins Balance */}
            <button
              onClick={() => setShowShop(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900/80 border border-amber-500/50 text-xs font-bold text-amber-300 transition-colors shadow-sm"
              title="상점 열기"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-mono">{profile.totalCoins.toLocaleString()}</span>
            </button>

            {/* Shop Button */}
            <button
              onClick={() => setShowShop(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="연금술사 의상 상점"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="실시간 랭킹보드"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>

            {/* Science Guide Book */}
            <button
              onClick={() => setShowGuide(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="중2 과학 핵심 개념 가이드북"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* ======================= LOBBY VIEW ======================= */}
        {currentView === 'lobby' && (
          <div className="flex flex-col items-center justify-center my-auto py-8">
            {/* Title & Story Intro */}
            <div className="text-center max-w-2xl mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                중학교 2학년 과학 물리적 특성 시뮬레이션
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-cyan-300 font-mono">3D 가상 실험실 PBR</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-alchemy text-white tracking-wide">
                연금술사의 물질 분리 연구소
              </h2>

              <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                마스터 연금술사의 시약들이 몽땅 뒤섞여버렸습니다!<br className="hidden sm:inline" />
                <strong>밀도, 끓는점, 용해도</strong>의 차이를 정밀 3D 가상 실험실에서 직접 조작하여 순물질을 분리하고 연구소를 구해주세요!
              </p>
            </div>

            {/* Interactive Panicked Alchemist in Center Lobby */}
            <div className="my-4 relative">
              <AlchemistCharacter
                mood="panicked"
                equippedCostumeId={profile.equippedCostume}
                size="lg"
              />
            </div>

            {/* Lobby Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              {/* Game Play Button */}
              <button
                onClick={() => setShowStageSelect(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 fill-slate-950" />
                게임 플레이 (스테이지 선택)
              </button>

              {/* Game Explanation / Science Guide Button */}
              <button
                onClick={() => setShowGuide(true)}
                className="px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-base shadow-xl flex items-center gap-2.5 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-cyan-400" />
                게임 설명 & 과학 원리
              </button>

              {/* Costume Shop Button */}
              <button
                onClick={() => setShowShop(true)}
                className="px-6 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-base shadow-xl flex items-center gap-2.5 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                연금술사 꾸미기 상점
              </button>
            </div>

            {/* Stages Progress Teaser Preview Cards */}
            <div className="w-full max-w-4xl mt-12 pt-8 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  실험실 스테이지 진행도 ({profile.completedStages.length}/{STAGES.length} 완료)
                </span>
                <button
                  onClick={() => setShowStageSelect(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  전체 보기 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {STAGES.map((st, i) => {
                  const completed = profile.completedStages.includes(st.id);
                  const stars = profile.stageStars[st.id] || 0;
                  const unlocked = i === 0 || profile.completedStages.includes(STAGES[i - 1].id) || completed;

                  return (
                    <div
                      key={st.id}
                      onClick={() => unlocked && handleStartStage(st)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        !unlocked
                          ? 'bg-slate-950/40 border-slate-900 opacity-50 cursor-not-allowed'
                          : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 cursor-pointer hover:scale-105'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400">Stage {st.stageNumber}</div>
                      <div className="text-xs font-bold text-white truncate mt-0.5">{st.title}</div>
                      <div className="mt-2 flex items-center justify-center gap-0.5">
                        {unlocked ? (
                          completed ? (
                            [1, 2, 3].map(s => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                }`}
                              />
                            ))
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold">도전</span>
                          )
                        ) : (
                          <span className="text-xs font-bold text-slate-600">?</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================= PLAYING LAB VIEW ======================= */}
        {currentView === 'playing' && (
          <div className="flex flex-col gap-4">
            {/* Top Lab Status Bar: Stage Info, Timer, Hint, Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 shadow-lg">
              {/* Stage Identity */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('lobby')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors"
                >
                  ← 로비로
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded-full">
                      Stage {activeStage.stageNumber}
                    </span>
                    <h3 className="text-sm sm:text-base font-alchemy text-white">
                      {activeStage.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {activeStage.subtitle}
                  </p>
                </div>
              </div>

              {/* Timer, Hint, Reset buttons */}
              <div className="flex items-center gap-3">
                {/* Timer Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-mono font-black tracking-wider">
                    {Math.floor(timeElapsed / 60)
                      .toString()
                      .padStart(2, '0')}
                    :{(timeElapsed % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    / {activeStage.timeLimitSec}초
                  </span>
                </div>

                {/* Hint Button */}
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>힌트 보기</span>
                </button>

                {/* Restart Stage Button */}
                <button
                  onClick={() => handleStartStage(activeStage)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="스테이지 재시작"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Interactive Lab Workspace with Alchemist in the corner */}
            <div className="relative">
              {/* Alchemist Character Reaction in corner */}
              <div className="absolute top-4 right-4 z-20 pointer-events-none hidden md:block">
                <AlchemistCharacter
                  mood={alchemistMood}
                  equippedCostumeId={profile.equippedCostume}
                  size="sm"
                />
              </div>

              {/* Core Science Simulation Lab */}
              <SeparationLab
                stage={activeStage}
                onSubstanceSeparated={handleSubstanceSeparated}
                separatedSubstances={separatedSubstances}
                onMoodChange={(mood, dialogue) => {
                  setAlchemistMood(mood);
                  if (dialogue) setAlchemistDialogue(dialogue);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Universal Modals */}
      <StageSelectModal
        isOpen={showStageSelect}
        onClose={() => setShowStageSelect(false)}
        onSelectStage={handleStartStage}
        completedStages={profile.completedStages}
        stageStars={profile.stageStars}
        stageBestTimes={profile.stageBestTimes}
      />

      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        coins={profile.totalCoins}
        unlockedCostumes={profile.unlockedCostumes}
        equippedCostume={profile.equippedCostume}
        onBuyCostume={handleBuyCostume}
        onEquipCostume={handleEquipCostume}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentStudentCode={profile.studentCode}
      />

      <ScienceGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      <HintModal
        isOpen={showHint}
        onClose={() => setShowHint(false)}
        stage={activeStage}
      />

      <ResultModal
        isOpen={showResult}
        stage={activeStage}
        clearTimeSeconds={lastClearResult.time}
        stars={lastClearResult.stars}
        score={lastClearResult.score}
        coinsEarned={lastClearResult.coinsEarned}
        equippedCostumeId={profile.equippedCostume}
        hasNextStage={currentStageIndex < STAGES.length - 1}
        onNextStage={() => {
          setShowResult(false);
          if (currentStageIndex < STAGES.length - 1) {
            handleStartStage(STAGES[currentStageIndex + 1]);
          }
        }}
        onRetry={() => {
          setShowResult(false);
          handleStartStage(activeStage);
        }}
        onGoLobby={() => {
          setShowResult(false);
          setCurrentView('lobby');
        }}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        currentProfile={profile}
        onLoginSuccess={(newProfile) => {
          setProfile(newProfile);
        }}
      />
    </div>
  );
}
