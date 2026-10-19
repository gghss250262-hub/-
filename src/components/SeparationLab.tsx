import React, { useState, useEffect, useRef } from 'react';
import { Stage, Substance, AlchemistMood } from '../types/game';
import { SUBSTANCES } from '../data/substances';
import { ApparatusDial } from './ApparatusDial';
import { VirtualLab3D } from './VirtualLab3D';
import {
  Sparkles,
  Droplets,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Flame,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  Thermometer,
  Filter,
  Rotate3d,
  Cpu
} from 'lucide-react';

interface SeparationLabProps {
  stage: Stage;
  onSubstanceSeparated: (substanceId: string, purity: number) => void;
  separatedSubstances: Record<string, { purity: number; collected: boolean }>;
  onMoodChange: (mood: AlchemistMood, dialogue?: string) => void;
}

export const SeparationLab: React.FC<SeparationLabProps> = ({
  stage,
  onSubstanceSeparated,
  separatedSubstances,
  onMoodChange
}) => {
  // Common Temperature State
  const [currentTemp, setCurrentTemp] = useState<number>(stage.defaultTemp);
  const [targetTemp, setTargetTemp] = useState<number>(stage.defaultTemp);

  // Stage 1: Density - Solid (PP & PS)
  const [stage1Liquid, setStage1Liquid] = useState<'none' | 'water' | 'salt_water'>('none');
  const [stage1ScoopedPP, setStage1ScoopedPP] = useState(false);
  const [stage1ScoopedPS, setStage1ScoopedPS] = useState(false);

  // Stage 2: Density - Liquid Separatory Funnel (Oil, Water, CCl4)
  const [valveOpen, setValveOpen] = useState(false);
  const [funnelLevels, setFunnelLevels] = useState({
    oil: 40,   // top layer (density 0.92)
    water: 40, // middle layer (density 1.00)
    ccl4: 40   // bottom layer (density 1.59)
  });
  const [beakerCollected, setBeakerCollected] = useState<{ [id: string]: number }>({
    oil: 0,
    water: 0,
    ccl4: 0
  });
  const [currentCatchBeaker, setCurrentCatchBeaker] = useState<'A' | 'B' | 'waste'>('A');

  // Stage 3: Boiling Point - Distillation (Ethanol + Water)
  const [hasBoilingChips, setHasBoilingChips] = useState(false);
  const [coolingWaterOn, setCoolingWaterOn] = useState(false);
  const [distilledEthanol, setDistilledEthanol] = useState(0); // 0 to 100%
  const [distilledWater, setDistilledWater] = useState(0);
  const [isVaporizing, setIsVaporizing] = useState(false);

  // Stage 4: Solubility - Filtration (Sand + Salt)
  const [sandSaltStep, setSandSaltStep] = useState<'initial' | 'dissolved' | 'filtering' | 'filtered' | 'evaporating' | 'completed'>('initial');
  const [dragOverFunnel, setDragOverFunnel] = useState(false);
  const [evaporationProgress, setEvaporationProgress] = useState(0);

  // Stage 5: Recrystallization (KNO3 + Salt)
  const [kno3Step, setKno3Step] = useState<'hot_dissolved' | 'cooled_crystals' | 'filtered'>('hot_dissolved');
  const [precipitatedGrams, setPrecipitatedGrams] = useState(0);

  // Stage 6: Combined master challenge steps
  const [masterStep, setMasterStep] = useState<1 | 2 | 3 | 4>(1);

  // 3D vs 2D Diagram mode switcher (default to 3D virtual simulation)
  const [labViewMode, setLabViewMode] = useState<'3d' | 'diagram'>('3d');

  // Reset local stage state when stage changes
  useEffect(() => {
    setCurrentTemp(stage.defaultTemp);
    setTargetTemp(stage.defaultTemp);
    setStage1Liquid('none');
    setStage1ScoopedPP(false);
    setStage1ScoopedPS(false);
    setValveOpen(false);
    setFunnelLevels({ oil: 40, water: 40, ccl4: 40 });
    setBeakerCollected({ oil: 0, water: 0, ccl4: 0 });
    setHasBoilingChips(false);
    setCoolingWaterOn(false);
    setDistilledEthanol(0);
    setDistilledWater(0);
    setSandSaltStep('initial');
    setEvaporationProgress(0);
    setKno3Step('hot_dissolved');
    setPrecipitatedGrams(0);
    setMasterStep(1);
    onMoodChange('panicked', `${stage.title}! 물질들이 뒤섞여있어, 서둘러 분리하자!`);
  }, [stage.id]);

  // Realistic Temperature Simulation ticker towards target
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTemp(prev => {
        if (Math.abs(prev - targetTemp) < 0.2) return targetTemp;
        const speed = targetTemp > prev ? 0.8 : 0.6; // Heating vs Cooling rate
        return prev + (targetTemp > prev ? speed : -speed);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [targetTemp]);

  // Stage 2: Funnel draining physics
  useEffect(() => {
    if (!valveOpen || stage.category !== 'density' || stage.id !== 'stage_2') return;

    const interval = setInterval(() => {
      setFunnelLevels(prev => {
        if (prev.ccl4 > 0) {
          const delta = 2;
          const newCcl4 = Math.max(0, prev.ccl4 - delta);
          setBeakerCollected(b => ({ ...b, ccl4: b.ccl4 + delta }));
          if (newCcl4 === 0) {
            onMoodChange('thinking', '사염화탄소가 다 빠져나왔어! 밸브를 닫고 비커를 교체해!');
          }
          return { ...prev, ccl4: newCcl4 };
        } else if (prev.water > 0) {
          const delta = 2;
          const newWater = Math.max(0, prev.water - delta);
          setBeakerCollected(b => ({ ...b, water: b.water + delta }));
          if (newWater === 0) {
            onMoodChange('happy', '물도 다 모았어! 이제 위쪽 입구로 식용유를 따라내면 끝!');
          }
          return { ...prev, water: newWater };
        } else {
          setValveOpen(false);
          return prev;
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, [valveOpen, stage.id]);

  // Stage 3 & Stage 6 Distillation simulation
  useEffect(() => {
    if (stage.category !== 'boiling_point' && stage.id !== 'stage_6') return;

    // Distillation requires boiling chips and cooling water for high purity
    const inEthanolRange = currentTemp >= 76 && currentTemp <= 85;
    const inWaterRange = currentTemp >= 98 && currentTemp <= 105;

    setIsVaporizing(inEthanolRange || inWaterRange);

    if (inEthanolRange) {
      if (!hasBoilingChips) {
        onMoodChange('panicked', '으악! 끓임쪽이 없어서 액체가 갑자기 튀어 넘쳐(돌비 현상)! 끓임쪽을 꼭 넣어줘!');
        return;
      }
      if (!coolingWaterOn) {
        onMoodChange('thinking', '냉각수를 켜야 증기가 식어서 액체로 모여!');
        return;
      }

      const timer = setInterval(() => {
        setDistilledEthanol(prev => {
          const next = Math.min(100, prev + 3);
          if (next >= 100 && !separatedSubstances['ethanol']?.collected) {
            onSubstanceSeparated('ethanol', 0.98);
            onMoodChange('success', '에탄올 끓는점 78℃에서 순수한 에탄올 증류 성공!');
          }
          return next;
        });
      }, 150);
      return () => clearInterval(timer);
    } else if (inWaterRange && distilledEthanol >= 90) {
      const timer = setInterval(() => {
        setDistilledWater(prev => {
          const next = Math.min(100, prev + 3);
          if (next >= 100 && !separatedSubstances['water']?.collected) {
            onSubstanceSeparated('water', 0.99);
            onMoodChange('success', '100℃에서 순수한 물 증류 완료!');
          }
          return next;
        });
      }, 150);
      return () => clearInterval(timer);
    }
  }, [currentTemp, hasBoilingChips, coolingWaterOn, stage.id, distilledEthanol]);

  // Stage 4: Evaporating Dish heating
  useEffect(() => {
    if (sandSaltStep === 'evaporating' && currentTemp >= 95) {
      const interval = setInterval(() => {
        setEvaporationProgress(prev => {
          const next = prev + 5;
          if (next >= 100) {
            setSandSaltStep('completed');
            onSubstanceSeparated('salt', 0.98);
            onMoodChange('success', '물이 모두 증발하고 하얀 소금 결정만 남았어! 분리 대성공!');
            return 100;
          }
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [sandSaltStep, currentTemp]);

  // Stage 5: Solubility Recrystallization cooling
  useEffect(() => {
    if (stage.id !== 'stage_5') return;

    if (currentTemp <= 25 && kno3Step === 'hot_dissolved') {
      // 80°C solubility 169g -> 20°C solubility 31.9g -> ~137g precipitate!
      setKno3Step('cooled_crystals');
      setPrecipitatedGrams(137);
      onMoodChange('happy', '온도가 20℃로 내려가면서 용해도가 급감한 질산칼륨 결정이 잔뜩 석출되었어! 거름종이로 걸러내자!');
    }
  }, [currentTemp, kno3Step, stage.id]);

  return (
    <div className="relative w-full bg-slate-950/70 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col min-h-[520px]">
      {/* Target Progress Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            분리 미션 목표 (중2 과학 핵심 개념)
          </span>
          <h2 className="text-lg sm:text-xl font-alchemy text-white mt-0.5">{stage.title}</h2>
        </div>

        {/* Separated Targets Checklist */}
        <div className="flex flex-wrap items-center gap-2">
          {stage.targetSubstances.map(req => {
            const sub = SUBSTANCES[req.substanceId];
            const isDone = separatedSubstances[req.substanceId]?.collected;
            return (
              <div
                key={req.substanceId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <span>{sub.particleIcon}</span>
                <span>{sub.name}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-amber-400/80">미분리</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* Lab Graphic Workspace */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          {/* Subtle Lab Grid Background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* 3D vs 2D Mode Switcher Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLabViewMode('3d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  labViewMode === '3d'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-4 h-4" /> 3D 가상 실험실 시뮬레이션
              </button>
              <button
                onClick={() => setLabViewMode('diagram')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  labViewMode === 'diagram'
                    ? 'bg-cyan-600 text-white shadow-md ring-1 ring-cyan-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" /> 2D 도식 뷰
              </button>
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              {labViewMode === '3d' ? '마우스 드래그로 360° 회전 및 줌 가능' : '실험 기구 도식'}
            </span>
          </div>

          {/* ======================= 3D VIRTUAL LAB MODE ======================= */}
          {labViewMode === '3d' ? (
            <div className="flex flex-col flex-1 justify-between gap-3">
              {/* 3D Viewport */}
              <VirtualLab3D
                stage={stage}
                currentTemp={currentTemp}
                targetTemp={targetTemp}
                valveOpen={valveOpen}
                onToggleValve={() => setValveOpen(!valveOpen)}
                stage1Liquid={stage1Liquid}
                stage1ScoopedPP={stage1ScoopedPP}
                stage1ScoopedPS={stage1ScoopedPS}
                onScoopPP={() => {
                  if (stage1Liquid === 'water' || stage1Liquid === 'salt_water') {
                    setStage1ScoopedPP(true);
                    onSubstanceSeparated('plastic_pp', 1.0);
                    onMoodChange('happy', '물(1.00)보다 가벼워서 떠오른 PP 플라스틱(0.90)을 건져냈어!');
                  }
                }}
                onScoopPS={() => {
                  if (stage1Liquid === 'salt_water') {
                    setStage1ScoopedPS(true);
                    onSubstanceSeparated('plastic_ps', 1.0);
                    onMoodChange('success', '소금물(1.10)보다 가벼워 떠오른 PS 플라스틱(1.05)까지 모두 분리 성공!');
                  } else {
                    onMoodChange('thinking', 'PS는 물(1.00)보다 무거워! 소금을 타서 액체 밀도를 1.10으로 높여야 떠올라!');
                  }
                }}
                funnelLevels={funnelLevels}
                hasBoilingChips={hasBoilingChips}
                coolingWaterOn={coolingWaterOn}
                distilledEthanol={distilledEthanol}
                onAddBoilingChips={() => {
                  setHasBoilingChips(true);
                  onMoodChange('happy', '끓임쪽을 넣었어! 액체가 갑자기 끓어 넘치는 돌비 현상을 방지할 수 있어!');
                }}
                sandSaltStep={sandSaltStep}
                kno3Step={kno3Step}
                precipitatedGrams={precipitatedGrams}
                masterStep={masterStep}
              />

              {/* 3D Procedure Action Dock */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400">실험 절차:</span>

                  {/* Stage 1 Actions */}
                  {stage.id === 'stage_1' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setStage1Liquid('water');
                          onMoodChange('thinking', '물(밀도 1.00)을 부었어! 밀도가 작은 PP(0.90)가 위로 뜰 거야!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          stage1Liquid === 'water'
                            ? 'bg-cyan-600 text-white shadow ring-1 ring-cyan-300'
                            : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                        }`}
                      >
                        1. 물 붓기 (1.00)
                      </button>
                      <button
                        onClick={() => {
                          if (!stage1ScoopedPP) {
                            onMoodChange('panicked', '먼저 물에 뜬 PP를 건져내야 소금물에서 둘이 다시 섞이지 않아!');
                            return;
                          }
                          setStage1Liquid('salt_water');
                          onMoodChange('happy', '소금을 녹여 소금물(밀도 1.10)을 만들었어! 이제 PS(1.05)도 떠오른다!');
                        }}
                        disabled={!stage1ScoopedPP}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                          stage1Liquid === 'salt_water'
                            ? 'bg-teal-600 text-white shadow ring-1 ring-teal-300'
                            : 'bg-slate-800 text-teal-300 hover:bg-slate-700'
                        }`}
                      >
                        2. 소금 녹이기 (1.10)
                      </button>
                      {!stage1ScoopedPP && (
                        <button
                          onClick={() => {
                            if (stage1Liquid === 'water' || stage1Liquid === 'salt_water') {
                              setStage1ScoopedPP(true);
                              onSubstanceSeparated('plastic_pp', 1.0);
                              onMoodChange('happy', 'PP 플라스틱(0.90) 수거 완료!');
                            }
                          }}
                          disabled={stage1Liquid === 'none'}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
                        >
                          🟩 PP 건지기
                        </button>
                      )}
                      {!stage1ScoopedPS && (
                        <button
                          onClick={() => {
                            if (stage1Liquid === 'salt_water') {
                              setStage1ScoopedPS(true);
                              onSubstanceSeparated('plastic_ps', 1.0);
                              onMoodChange('success', 'PS 플라스틱(1.05) 수거 완료!');
                            }
                          }}
                          disabled={stage1Liquid !== 'salt_water'}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40"
                        >
                          🟥 PS 건지기
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stage 2 Actions */}
                  {stage.id === 'stage_2' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setValveOpen(!valveOpen)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all ${
                          valveOpen
                            ? 'bg-rose-600 text-white ring-2 ring-rose-300 animate-pulse'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        }`}
                      >
                        꼭지 밸브 {valveOpen ? '닫기' : '열기 (배출)'}
                      </button>
                      <button
                        onClick={() => {
                          if (beakerCollected.ccl4 > 0 && funnelLevels.ccl4 === 0 && !separatedSubstances['ccl4']?.collected) {
                            onSubstanceSeparated('ccl4', 0.98);
                            onMoodChange('happy', '아래층 사염화탄소(1.59) 수집 완료! 새 비커로 물을 받자!');
                          } else if (beakerCollected.water > 0 && funnelLevels.water === 0 && !separatedSubstances['water']?.collected) {
                            onSubstanceSeparated('water', 0.98);
                            onMoodChange('happy', '물(1.00)도 비커에 완벽하게 수집했어!');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white shadow"
                      >
                        📥 비커 순물질 보관
                      </button>
                      {funnelLevels.ccl4 === 0 && funnelLevels.water === 0 && funnelLevels.oil > 0 && (
                        <button
                          onClick={() => {
                            setFunnelLevels(p => ({ ...p, oil: 0 }));
                            onSubstanceSeparated('oil', 0.98);
                            onMoodChange('success', '위쪽 주둥이로 식용유를 따라내어 모든 액체 분리 완료!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow"
                        >
                          🫒 위쪽 주둥이로 식용유 따라내기
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stage 3 Actions */}
                  {stage.id === 'stage_3' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setHasBoilingChips(true);
                          onMoodChange('happy', '끓임쪽을 넣었어! 액체가 갑자기 튀어 넘치는 돌비 현상을 방지할 수 있어!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          hasBoilingChips
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {hasBoilingChips ? '✅ 끓임쪽 투입됨' : '➕ 끓임쪽 넣기'}
                      </button>
                      <button
                        onClick={() => {
                          setCoolingWaterOn(!coolingWaterOn);
                          onMoodChange('happy', coolingWaterOn ? '냉각수를 껐어.' : '냉각관에 찬물을 아래에서 위로 주입 시작!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          coolingWaterOn
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {coolingWaterOn ? '❄️ 냉각관 작동 중' : '❄️ 냉각수 켜기'}
                      </button>
                      <span className="text-xs font-mono font-bold text-emerald-400 self-center">
                        에탄올: {distilledEthanol.toFixed(0)}%
                      </span>
                    </div>
                  )}

                  {/* Stage 4 Actions */}
                  {stage.id === 'stage_4' && (
                    <div className="flex flex-wrap gap-2">
                      {sandSaltStep === 'initial' && (
                        <button
                          onClick={() => {
                            setSandSaltStep('dissolved');
                            onMoodChange('happy', '물을 붓고 유리막대로 저었어! 소금은 물에 완전히 녹고, 모래는 가라앉았어!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                        >
                          1. 물에 녹이기
                        </button>
                      )}
                      {sandSaltStep === 'dissolved' && (
                        <button
                          onClick={() => {
                            setSandSaltStep('filtered');
                            onSubstanceSeparated('sand', 0.99);
                            onMoodChange('success', '거름종이 위에 녹지 않는 모래가 걸러졌어! 거른 소금물(여액)을 증발 접시에서 가열하자!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow animate-pulse"
                        >
                          2. 거름종이에 붓기 (모래 걸러내기)
                        </button>
                      )}
                      {sandSaltStep === 'filtered' && (
                        <button
                          onClick={() => {
                            setSandSaltStep('evaporating');
                            setTargetTemp(100);
                            onMoodChange('happy', '증발 접시를 100℃로 가열하여 물을 증발시킵니다!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow"
                        >
                          3. 증발 접시 100℃ 가열 (소금 결정)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stage 5 Actions */}
                  {stage.id === 'stage_5' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setTargetTemp(20);
                          onMoodChange('thinking', '다이얼을 20℃로 냉각하면 용해도 차이로 질산칼륨 결정이 석출됩니다!');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                      >
                        1. 20℃ 냉각 (용해도 급감)
                      </button>
                      <button
                        onClick={() => {
                          if (kno3Step === 'cooled_crystals') {
                            setKno3Step('filtered');
                            onSubstanceSeparated('kno3', 0.98);
                            onSubstanceSeparated('salt', 0.90);
                            onMoodChange('success', '석출된 순수한 질산칼륨(KNO₃) 결정을 거름종이로 완벽하게 회수했어!');
                          } else {
                            onMoodChange('thinking', '아직 온도가 높아! 다이얼을 20℃로 내려서 질산칼륨 결정을 먼저 석출시켜줘!');
                          }
                        }}
                        disabled={kno3Step !== 'cooled_crystals'}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow disabled:opacity-40"
                      >
                        2. 거름종이로 결정 회수
                      </button>
                    </div>
                  )}

                  {/* Stage 6 Actions */}
                  {stage.id === 'stage_6' && (
                    <div className="flex flex-wrap gap-2">
                      {masterStep === 1 && (
                        <button
                          onClick={() => {
                            setMasterStep(2);
                            onSubstanceSeparated('sand', 0.99);
                            onMoodChange('happy', '모래 거름 성공! 이제 남은 용액(에탄올+물+소금)을 분별 증류기에 넣자!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 shadow"
                        >
                          1. 모래 거름
                        </button>
                      )}
                      {masterStep === 2 && (
                        <button
                          onClick={() => {
                            setMasterStep(3);
                            onSubstanceSeparated('ethanol', 0.98);
                            onMoodChange('success', '에탄올 분별 증류 완료! 이제 100℃로 올려 물과 소금을 분리하자!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                        >
                          2. 78℃ 에탄올 증류
                        </button>
                      )}
                      {masterStep === 3 && (
                        <button
                          onClick={() => {
                            onSubstanceSeparated('water', 0.99);
                            onSubstanceSeparated('salt', 0.99);
                            onMoodChange('cheering', '대성공이야! 모든 혼합물을 100% 분리해내어 대연금술사로 등극했어!');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                        >
                          3. 물 증류 & 소금 석출
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stage 7: Rice Seed Density */}
                  {stage.id === 'stage_7' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setStage1Liquid('water');
                          onMoodChange('thinking', '물(1.00)을 부었어! 밀도가 둘 다 물보다 커서 바닥에 가라앉아 있어!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          stage1Liquid === 'water' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-800 text-cyan-300'
                        }`}
                      >
                        1. 물 붓기 (1.00)
                      </button>
                      <button
                        onClick={() => {
                          setStage1Liquid('salt_water');
                          onMoodChange('happy', '소금을 타서 소금물(1.10)을 만들었어! 가벼운 쭉정이(1.02)가 위로 떠오른다!');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          stage1Liquid === 'salt_water' ? 'bg-teal-600 text-white shadow ring-1 ring-teal-300' : 'bg-slate-800 text-teal-300'
                        }`}
                      >
                        2. 소금 녹이기 (1.10)
                      </button>
                      <button
                        onClick={() => {
                          if (stage1Liquid === 'salt_water') {
                            onSubstanceSeparated('rice_bad', 0.98);
                            onMoodChange('happy', '물 위로 떠오른 쭉정이 볍씨를 모두 건져냈어!');
                          } else {
                            onMoodChange('thinking', '소금을 넣어 소금물을 만들어야 쭉정이가 떠올라!');
                          }
                        }}
                        disabled={stage1Liquid !== 'salt_water'}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40"
                      >
                        🍂 뜬 쭉정이(1.02) 건지기
                      </button>
                      <button
                        onClick={() => {
                          if (separatedSubstances['rice_bad']?.collected) {
                            onSubstanceSeparated('rice_good', 0.99);
                            onMoodChange('success', '바닥에 가라앉은 튼실하고 좋은 볍씨(1.13) 수거 완료!');
                          } else {
                            onMoodChange('thinking', '먼저 물에 뜬 쭉정이를 걷어내야 해!');
                          }
                        }}
                        disabled={!separatedSubstances['rice_bad']?.collected}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
                      >
                        🌾 좋은 볍씨(1.13) 건지기
                      </button>
                    </div>
                  )}

                  {/* Stage 8: Crude Oil Fractional Distillation */}
                  {stage.id === 'stage_8' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setHasBoilingChips(true);
                          setCoolingWaterOn(true);
                          onMoodChange('happy', '증류탑에 끓임쪽을 넣고 냉각수를 작동시켰어!');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800"
                      >
                        {hasBoilingChips ? '✅ 끓임쪽/냉각관 가동 중' : '⚙️ 끓임쪽 & 냉각수 가동'}
                      </button>
                      <button
                        onClick={() => {
                          if (currentTemp >= 68 && currentTemp <= 85) {
                            onSubstanceSeparated('gasoline', 0.98);
                            onMoodChange('happy', '70℃에서 휘발유(가솔린) 분별 증류 성공! 온도를 180℃로 올려 등유를 받자!');
                          } else {
                            onMoodChange('thinking', '온도 다이얼을 휘발유 끓는점인 70℃ 부근으로 조절해야 해!');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-slate-950 shadow"
                      >
                        ⛽ 70℃ 휘발유 증류 수집
                      </button>
                      <button
                        onClick={() => {
                          if (currentTemp >= 170 && currentTemp <= 195) {
                            onSubstanceSeparated('kerosene', 0.98);
                            onMoodChange('success', '180℃에서 난방용 등유(케로신) 증류 완료!');
                          } else {
                            onMoodChange('thinking', '온도 다이얼을 등유 끓는점인 180℃로 올려줘!');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow"
                      >
                        🏮 180℃ 등유 증류 수집
                      </button>
                    </div>
                  )}

                  {/* Stage 9: Copper Sulfate Recrystallization */}
                  {stage.id === 'stage_9' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setTargetTemp(10);
                          onMoodChange('thinking', '얼음물 수조를 가동하여 10℃로 급랭합니다!');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow"
                      >
                        1. 10℃ 얼음물 급랭 다이얼
                      </button>
                      <button
                        onClick={() => {
                          if (currentTemp <= 20) {
                            onSubstanceSeparated('copper_sulfate', 0.99);
                            onSubstanceSeparated('salt', 0.92);
                            onMoodChange('success', '눈부신 푸른색 황산구리 결정을 거름종이로 완벽 분리했어!');
                          } else {
                            onMoodChange('thinking', '수온이 20℃ 이하로 더 내려가야 황산구리 결정이 충분히 석출돼!');
                          }
                        }}
                        disabled={currentTemp > 20}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow disabled:opacity-40 animate-pulse"
                      >
                        2. 🔷 석출된 황산구리 결정 거름 회수
                      </button>
                    </div>
                  )}

                  {/* Stage 10: Grand Master Final Championship */}
                  {stage.id === 'stage_10' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          onSubstanceSeparated('iron_powder', 0.99);
                          onMoodChange('happy', '자석을 대어 자성이 있는 철가루(Fe)를 순식간에 끌어당겨 분리했어!');
                        }}
                        disabled={separatedSubstances['iron_powder']?.collected}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-40"
                      >
                        🧲 1. 자석 (철가루)
                      </button>
                      <button
                        onClick={() => {
                          onSubstanceSeparated('gold_dust', 0.99);
                          onMoodChange('happy', '밀도가 압도적으로 큰 사금(19.3)을 바닥에서 침전시켜 건져냈어!');
                        }}
                        disabled={separatedSubstances['gold_dust']?.collected}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black disabled:opacity-40"
                      >
                        ✨ 2. 밀도 패닝 (사금)
                      </button>
                      <button
                        onClick={() => {
                          onSubstanceSeparated('sand', 0.99);
                          onMoodChange('happy', '거름종이에 물에 녹지 않는 모래를 걸러냈어!');
                        }}
                        disabled={separatedSubstances['sand']?.collected}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40"
                      >
                        🏖️ 3. 거름종이 (모래)
                      </button>
                      <button
                        onClick={() => {
                          if (currentTemp >= 76 && currentTemp <= 85) {
                            onSubstanceSeparated('ethanol', 0.98);
                            onMoodChange('happy', '78℃ 분별 증류로 순수한 에탄올 수집 성공!');
                          } else {
                            onMoodChange('thinking', '온도 다이얼을 에탄올 끓는점 78℃로 조절해줘!');
                          }
                        }}
                        disabled={separatedSubstances['ethanol']?.collected}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40"
                      >
                        🧪 4. 78℃ 증류 (에탄올)
                      </button>
                      <button
                        onClick={() => {
                          onSubstanceSeparated('salt', 0.99);
                          onMoodChange('cheering', '현자의 돌 연금술 완성! 모든 6종 물질을 100% 분리해냈어!');
                        }}
                        disabled={separatedSubstances['salt']?.collected}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40"
                      >
                        🧂 5. 증발 (소금)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ======================= 2D SCHEMATIC MODE ======================= */
            <div className="flex flex-col flex-1 justify-between">
          {/* Interactive Simulation Switch by Stage */}
          {/* ===================== STAGE 1: DENSITY (SOLID PP & PS) ===================== */}
          {stage.id === 'stage_1' && (
            <div className="flex flex-col items-center justify-between flex-1 py-4">
              <div className="text-center mb-2">
                <span className="text-xs bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full font-bold">
                  밀도: PP (0.90g/cm³) vs 물 (1.00g/cm³) vs PS (1.05g/cm³) vs 소금물 (1.10g/cm³)
                </span>
              </div>

              {/* Water Bath Tank */}
              <div className="relative w-72 h-56 border-4 border-slate-600 rounded-b-3xl bg-slate-900/60 shadow-2xl flex flex-col justify-end p-2 overflow-hidden backdrop-blur-sm">
                {/* Liquid in Tank */}
                <div
                  className={`w-full transition-all duration-700 rounded-b-2xl relative ${
                    stage1Liquid === 'none'
                      ? 'h-0'
                      : stage1Liquid === 'water'
                      ? 'h-36 bg-cyan-500/30 border-t-2 border-cyan-400/60'
                      : 'h-40 bg-teal-400/40 border-t-2 border-teal-300/80'
                  }`}
                >
                  {stage1Liquid !== 'none' && (
                    <div className="absolute top-1 left-2 text-[10px] text-cyan-200 font-bold">
                      {stage1Liquid === 'water' ? '순수한 물 (밀도 1.00g/cm³)' : '소금물 (밀도 1.10g/cm³)'}
                    </div>
                  )}

                  {/* PP Chips (Density 0.90) */}
                  {!stage1ScoopedPP && (
                    <div
                      onClick={() => {
                        if (stage1Liquid === 'water' || stage1Liquid === 'salt_water') {
                          setStage1ScoopedPP(true);
                          onSubstanceSeparated('plastic_pp', 1.0);
                          onMoodChange('happy', '물(1.00)보다 가벼워서 떠오른 PP 플라스틱(0.90)을 건져냈어!');
                        }
                      }}
                      className={`absolute left-8 transition-all duration-700 flex flex-col items-center cursor-pointer group ${
                        stage1Liquid === 'none' ? 'bottom-2' : 'top-3'
                      }`}
                    >
                      <div className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-lg shadow-lg group-hover:scale-110 transition-transform flex items-center gap-1 border-2 border-emerald-300 animate-bounce">
                        <span>🟩</span> PP (0.90)
                      </div>
                      <span className="text-[10px] text-emerald-300 mt-1 font-bold">
                        {stage1Liquid === 'none' ? '바닥' : '👉 클릭하여 건지기'}
                      </span>
                    </div>
                  )}

                  {/* PS Chips (Density 1.05) */}
                  {!stage1ScoopedPS && (
                    <div
                      onClick={() => {
                        if (stage1Liquid === 'salt_water') {
                          setStage1ScoopedPS(true);
                          onSubstanceSeparated('plastic_ps', 1.0);
                          onMoodChange('success', '소금물(1.10)보다 가벼워 떠오른 PS 플라스틱(1.05)까지 모두 분리 성공!');
                        } else if (stage1Liquid === 'water') {
                          onMoodChange('thinking', 'PS 플라스틱은 물(1.00)보다 무거워서(1.05) 바닥에 가라앉아 있어! 소금을 넣어 밀도를 높여봐!');
                        }
                      }}
                      className={`absolute right-8 transition-all duration-700 flex flex-col items-center cursor-pointer group ${
                        stage1Liquid === 'salt_water' ? 'top-3' : 'bottom-2'
                      }`}
                    >
                      <div className="px-3 py-1 bg-rose-500 text-white font-black text-xs rounded-lg shadow-lg group-hover:scale-110 transition-transform flex items-center gap-1 border-2 border-rose-300">
                        <span>🟥</span> PS (1.05)
                      </div>
                      <span className="text-[10px] text-rose-300 mt-1 font-bold">
                        {stage1Liquid === 'salt_water' ? '👉 클릭하여 건지기' : '바닥에 침전 (물보다 무거움)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setStage1Liquid('water');
                    onMoodChange('thinking', '물(밀도 1.00g/cm³)을 부었어! 밀도가 작은 PP(0.90)가 위로 뜰 거야!');
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                    stage1Liquid === 'water'
                      ? 'bg-cyan-600 text-white ring-2 ring-cyan-300 shadow-lg'
                      : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-cyan-800'
                  }`}
                >
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  1단계: 순수한 물 붓기 (밀도 1.00)
                </button>

                <button
                  onClick={() => {
                    if (!stage1ScoopedPP) {
                      onMoodChange('panicked', '먼저 물에 뜬 PP를 건져내야 소금물에서 둘이 다시 섞이지 않아!');
                      return;
                    }
                    setStage1Liquid('salt_water');
                    onMoodChange('happy', '소금을 녹여 소금물(밀도 1.10g/cm³)을 만들었어! 이제 PS(1.05)도 떠오른다!');
                  }}
                  disabled={!stage1ScoopedPP}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-40 ${
                    stage1Liquid === 'salt_water'
                      ? 'bg-teal-600 text-white ring-2 ring-teal-300 shadow-lg'
                      : 'bg-slate-800 text-teal-300 hover:bg-slate-700 border border-teal-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  2단계: 소금 녹이기 (밀도 1.10)
                </button>
              </div>
            </div>
          )}

          {/* ===================== STAGE 2: SEPARATORY FUNNEL (LIQUID DENSITY) ===================== */}
          {stage.id === 'stage_2' && (
            <div className="flex flex-col items-center justify-between flex-1 py-2">
              <div className="text-center mb-1">
                <span className="text-xs bg-purple-950/90 text-purple-300 border border-purple-800 px-3 py-1 rounded-full font-bold">
                  밀도: 식용유 (0.92) &lt; 물 (1.00) &lt; 사염화탄소 (1.59 g/cm³)
                </span>
              </div>

              {/* Separatory Funnel SVG & Layer Animation */}
              <div className="relative flex flex-col items-center">
                {/* Top Cap */}
                <button
                  onClick={() => {
                    if (funnelLevels.ccl4 === 0 && funnelLevels.water === 0 && funnelLevels.oil > 0) {
                      setFunnelLevels(p => ({ ...p, oil: 0 }));
                      setBeakerCollected(b => ({ ...b, oil: 40 }));
                      onSubstanceSeparated('oil', 0.98);
                      onMoodChange('success', '위쪽 주둥이로 식용유를 따라내어 모든 액체 분리 완료!');
                    } else {
                      onMoodChange('thinking', '아래층 액체들을 꼭지로 먼저 다 뺀 뒤에 위쪽 주둥이를 열어야 해!');
                    }
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-t-lg border border-amber-400 shadow cursor-pointer transition-transform hover:scale-105"
                >
                  위쪽 주둥이 마개 {funnelLevels.ccl4 === 0 && funnelLevels.water === 0 && '👉 (따라내기)'}
                </button>

                {/* Glass Pear-shaped Funnel Body */}
                <div className="w-44 h-52 border-2 border-slate-500 rounded-b-[4rem] rounded-t-2xl bg-slate-900/40 relative overflow-hidden flex flex-col justify-end shadow-2xl backdrop-blur-md">
                  {/* Top Layer: Oil */}
                  {funnelLevels.oil > 0 && (
                    <div
                      style={{ height: `${funnelLevels.oil}%` }}
                      className="w-full bg-amber-400/60 border-b border-amber-300/40 flex items-center justify-center text-slate-950 font-bold text-xs transition-all duration-300"
                    >
                      식용유 (밀도 0.92)
                    </div>
                  )}

                  {/* Middle Layer: Water */}
                  {funnelLevels.water > 0 && (
                    <div
                      style={{ height: `${funnelLevels.water}%` }}
                      className="w-full bg-cyan-400/50 border-b border-cyan-300/40 flex items-center justify-center text-slate-950 font-bold text-xs transition-all duration-300"
                    >
                      물 (밀도 1.00)
                    </div>
                  )}

                  {/* Bottom Layer: CCl4 */}
                  {funnelLevels.ccl4 > 0 && (
                    <div
                      style={{ height: `${funnelLevels.ccl4}%` }}
                      className="w-full bg-purple-500/60 flex items-center justify-center text-white font-bold text-xs transition-all duration-300"
                    >
                      사염화탄소 (밀도 1.59)
                    </div>
                  )}
                </div>

                {/* Stopcock Valve */}
                <div className="w-4 h-8 bg-slate-700 border-x border-slate-500 flex items-center justify-center relative">
                  <button
                    onClick={() => setValveOpen(!valveOpen)}
                    className={`absolute -left-6 px-2.5 py-1 rounded-md text-xs font-black shadow-lg transition-transform ${
                      valveOpen
                        ? 'bg-red-500 text-white rotate-90 ring-2 ring-red-300'
                        : 'bg-emerald-500 text-slate-950 hover:scale-110'
                    }`}
                  >
                    꼭지 {valveOpen ? '열림' : '닫힘'}
                  </button>
                </div>

                {/* Glass Stem */}
                <div className="w-3 h-10 bg-slate-800/80 border-x border-slate-600 relative">
                  {valveOpen && (
                    <div className="w-1.5 h-full bg-cyan-400 mx-auto animate-pulse rounded-full" />
                  )}
                </div>

                {/* Catching Beaker below */}
                <div className="w-32 h-20 border-2 border-slate-500 rounded-b-xl bg-slate-900/70 p-1 flex flex-col justify-end items-center mt-1 relative">
                  <span className="text-[10px] text-slate-400 absolute top-1 font-bold">수집 비커</span>
                  <div className="text-xs font-bold text-slate-200">
                    {beakerCollected.ccl4 > 0 && beakerCollected.water === 0 && (
                      <span className="text-purple-400">사염화탄소 분리 중 ({beakerCollected.ccl4}ml)</span>
                    )}
                    {beakerCollected.water > 0 && (
                      <span className="text-cyan-400">물 분리 중 ({beakerCollected.water}ml)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Beaker Action Controls */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => {
                    if (beakerCollected.ccl4 > 0 && funnelLevels.ccl4 === 0 && !separatedSubstances['ccl4']?.collected) {
                      onSubstanceSeparated('ccl4', 0.98);
                      onMoodChange('happy', '아래층의 사염화탄소(1.59)를 순수하게 받아냈어! 새 비커로 물을 받자!');
                    } else if (beakerCollected.water > 0 && funnelLevels.water === 0 && !separatedSubstances['water']?.collected) {
                      onSubstanceSeparated('water', 0.98);
                      onMoodChange('happy', '물(1.00)도 비커에 완벽하게 수집했어!');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-lg border border-purple-400"
                >
                  📥 현재 비커의 순물질 보관 및 교체
                </button>
              </div>
            </div>
          )}

          {/* ===================== STAGE 3: DISTILLATION (BOILING POINT) ===================== */}
          {stage.id === 'stage_3' && (
            <div className="flex flex-col items-center justify-between flex-1 py-2">
              <div className="text-center mb-1">
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                  끓는점: 에탄올 (78.3℃) vs 물 (100℃) - 섞이는 액체의 분별 증류
                </span>
              </div>

              {/* Distillation Apparatus Illustration */}
              <div className="relative w-full max-w-lg h-60 border border-slate-800/80 rounded-2xl bg-slate-900/50 p-3 flex items-center justify-between">
                {/* Round-bottom Flask on Heating Plate */}
                <div className="flex flex-col items-center">
                  {/* Thermometer Stem */}
                  <div className="w-2.5 h-16 bg-slate-800 border border-red-500/70 rounded-t relative flex flex-col justify-end">
                    <div
                      className="w-full bg-red-500 transition-all duration-300"
                      style={{ height: `${Math.min(100, (currentTemp / 120) * 100)}%` }}
                    />
                    <span className="absolute -left-12 top-0 text-[10px] font-mono font-bold text-red-400">
                      {currentTemp.toFixed(1)}℃
                    </span>
                  </div>

                  {/* Flask Body */}
                  <div className="w-28 h-28 rounded-full border-2 border-slate-400 bg-slate-900/80 relative overflow-hidden flex flex-col justify-end p-2 shadow-2xl">
                    {/* Liquid Mixture in Flask */}
                    <div className="w-full h-16 bg-emerald-500/30 rounded-b-full border-t border-emerald-400/60 relative">
                      {isVaporizing && (
                        <div className="absolute inset-0 flex justify-around items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-300 anim-bubble" />
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 anim-bubble" style={{ animationDelay: '0.4s' }} />
                          <div className="w-2 h-2 rounded-full bg-emerald-200 anim-bubble" style={{ animationDelay: '0.8s' }} />
                        </div>
                      )}

                      {/* Boiling Chips at bottom */}
                      {hasBoilingChips ? (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-sm shadow" />
                          <div className="w-2.5 h-2 bg-slate-400 rounded-sm shadow" />
                          <div className="w-2 h-2.5 bg-slate-200 rounded-sm shadow" />
                        </div>
                      ) : (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-rose-400 font-bold animate-pulse whitespace-nowrap">
                          끓임쪽 없음!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hot Plate base */}
                  <div className={`w-32 h-6 rounded-b-xl border-t-2 border-slate-600 flex items-center justify-center ${
                    currentTemp > 60 ? 'bg-orange-700/60 shadow-[0_0_15px_#ea580c]' : 'bg-slate-800'
                  }`}>
                    <Flame className={`w-3.5 h-3.5 ${currentTemp > 60 ? 'text-amber-300 animate-pulse' : 'text-slate-500'}`} />
                  </div>
                </div>

                {/* Condenser Tube (Liebig Condenser) */}
                <div className="relative flex-1 h-12 mx-2 bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-slate-600 rounded-xl flex items-center justify-center">
                  <div className={`text-[10px] font-bold ${coolingWaterOn ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {coolingWaterOn ? '❄️ 리비히 냉각관 (찬물 순환 중)' : '⚠️ 냉각수 꺼짐'}
                  </div>
                  {isVaporizing && coolingWaterOn && (
                    <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <div className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" style={{ animationDelay: '0.5s' }} />
                    </div>
                  )}
                </div>

                {/* Receiving Test Tube / Flask */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-28 border-2 border-slate-400 rounded-b-2xl bg-slate-900/80 p-1 flex flex-col justify-end relative shadow-xl">
                    <span className="text-[9px] text-slate-400 absolute top-1 left-1 font-bold">수집 시험관</span>
                    {distilledEthanol > 0 && (
                      <div
                        style={{ height: `${distilledEthanol}%` }}
                        className="w-full bg-emerald-400/70 rounded-b-xl border-t border-emerald-200 transition-all duration-300 flex items-center justify-center text-[10px] font-bold text-slate-950"
                      >
                        {distilledEthanol.toFixed(0)}%
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-400 mt-1">에탄올</span>
                </div>
              </div>

              {/* Lab Tool Controls for Distillation */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => {
                    setHasBoilingChips(true);
                    onMoodChange('happy', '끓임쪽을 넣었어! 액체가 갑자기 튀어 넘치는 돌비 현상을 방지할 수 있어!');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    hasBoilingChips
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {hasBoilingChips ? '✅ 끓임쪽 투입 완료' : '➕ 끓임쪽(비등석) 넣기'}
                </button>

                <button
                  onClick={() => {
                    setCoolingWaterOn(!coolingWaterOn);
                    onMoodChange('happy', coolingWaterOn ? '냉각수를 껐어.' : '냉각관에 찬물을 아래에서 위로 주입 시작!');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    coolingWaterOn
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {coolingWaterOn ? '✅ 냉각관 작동 중' : '❄️ 냉각수 펌프 켜기'}
                </button>
              </div>
            </div>
          )}

          {/* ===================== STAGE 4: FILTRATION (SOLUBILITY) ===================== */}
          {stage.id === 'stage_4' && (
            <div className="flex flex-col items-center justify-between flex-1 py-2">
              <div className="text-center mb-1">
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-full font-bold">
                  용해도 차이: 물에 녹는 소금(NaCl) vs 녹지 않는 모래(SiO₂)
                </span>
              </div>

              {/* Filtration & Evaporation Interactive Apparatus */}
              <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
                {/* Beaker with Solid Mixture */}
                <div
                  draggable={sandSaltStep === 'dissolved'}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', 'beaker');
                    onMoodChange('thinking', '거름종이 깔때기로 드래그해서 천천히 붓자!');
                  }}
                  onClick={() => {
                    if (sandSaltStep === 'initial') {
                      setSandSaltStep('dissolved');
                      onMoodChange('happy', '물을 붓고 유리막대로 저었어! 소금은 물에 완전히 녹고, 모래는 가라앉았어!');
                    }
                  }}
                  className={`w-32 h-36 border-2 border-slate-400 rounded-b-2xl bg-slate-900/80 p-2 flex flex-col justify-end relative shadow-xl transition-all cursor-pointer ${
                    sandSaltStep === 'dissolved' ? 'ring-2 ring-amber-400 hover:scale-105' : ''
                  }`}
                >
                  <span className="text-[10px] text-slate-400 absolute top-1 left-2 font-bold">비커 (클릭/드래그)</span>
                  {sandSaltStep === 'initial' ? (
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-400">모래 + 소금 고체</div>
                      <span className="text-[9px] text-cyan-300 animate-pulse">👉 클릭하여 물 녹이기</span>
                    </div>
                  ) : sandSaltStep === 'dissolved' ? (
                    <div className="w-full h-24 bg-cyan-500/30 rounded-b-xl border-t border-cyan-400/50 p-1 flex flex-col justify-end">
                      <div className="w-full h-3 bg-amber-700 rounded-b-xl" title="가라앉은 모래" />
                      <span className="text-[9px] text-amber-200 font-bold text-center">👉 거름종이로 드래그!</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 text-center">비커 비움</span>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-6 h-6 text-slate-600 hidden sm:block" />

                {/* Filter Funnel Apparatus */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFunnel(true);
                  }}
                  onDragLeave={() => setDragOverFunnel(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverFunnel(false);
                    if (sandSaltStep === 'dissolved') {
                      setSandSaltStep('filtered');
                      onSubstanceSeparated('sand', 0.99);
                      onMoodChange('success', '거름종이 위에 녹지 않는 모래가 걸러졌어! 거른 소금물(여액)을 증발 접시에서 가열하자!');
                    }
                  }}
                  className={`relative flex flex-col items-center transition-all p-2 rounded-2xl ${
                    dragOverFunnel ? 'bg-amber-500/20 ring-2 ring-amber-400' : ''
                  }`}
                >
                  {/* Glass Funnel Top Cone */}
                  <div className="w-28 h-20 border-t-2 border-x-2 border-slate-500 bg-slate-900/80 rounded-t-lg relative flex items-center justify-center overflow-hidden">
                    {/* Folded Filter Paper inside */}
                    <div className="w-24 h-16 bg-slate-100 rounded-b-full border border-slate-300 flex items-center justify-center shadow-inner">
                      {sandSaltStep === 'filtered' || sandSaltStep === 'evaporating' || sandSaltStep === 'completed' ? (
                        <div className="text-center">
                          <span className="text-xs font-black text-amber-800">모래 걸러짐!</span>
                          <div className="text-[9px] text-amber-700">SiO₂ (걸쭉한 모래)</div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-bold">거름종이 깔때기</span>
                      )}
                    </div>
                  </div>

                  {/* Funnel Stem */}
                  <div className="w-2 h-8 bg-slate-600" />

                  {/* Erlenmeyer Flask receiving filtrate (여액) */}
                  <div className="w-28 h-20 border-2 border-slate-400 rounded-b-2xl bg-slate-900/80 p-1 flex flex-col justify-end items-center relative">
                    <span className="text-[9px] text-slate-400 absolute top-1 font-bold">삼각 플라스크 (여액)</span>
                    {(sandSaltStep === 'filtered' || sandSaltStep === 'evaporating' || sandSaltStep === 'completed') && (
                      <div className="w-full h-8 bg-cyan-400/30 rounded-b-xl flex items-center justify-center text-[10px] font-bold text-cyan-200">
                        소금 수용액
                      </div>
                    )}
                  </div>
                </div>

                {/* Evaporating Dish Step */}
                {(sandSaltStep === 'filtered' || sandSaltStep === 'evaporating' || sandSaltStep === 'completed') && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-24 h-12 border-2 border-slate-300 rounded-b-full bg-slate-200 p-1 flex flex-col justify-end items-center shadow-lg relative">
                      {sandSaltStep === 'completed' ? (
                        <span className="text-xs font-black text-slate-900">🧂 소금 결정!</span>
                      ) : (
                        <div className="w-16 h-4 bg-cyan-300/60 rounded-b-full animate-pulse" />
                      )}
                    </div>
                    {/* Heating Flame below */}
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-400">
                      <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                      증발 접시
                    </div>
                    {sandSaltStep === 'filtered' && (
                      <button
                        onClick={() => {
                          setSandSaltStep('evaporating');
                          setTargetTemp(100);
                          onMoodChange('happy', '증발 접시를 100℃로 가열하여 물을 증발시킵니다!');
                        }}
                        className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow"
                      >
                        🔥 가열 증발 시작
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== STAGE 5: RECRYSTALLIZATION (KNO3 + NaCl) ===================== */}
          {stage.id === 'stage_5' && (
            <div className="flex flex-col items-center justify-between flex-1 py-2">
              <div className="text-center mb-1">
                <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-full font-bold">
                  재결정: 80℃ 용해도 169g → 20℃ 용해도 31.9g (KNO₃ 약 137g 석출!)
                </span>
              </div>

              {/* Recrystallization Visual Tank */}
              <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
                {/* Hot Solution Beaker */}
                <div className="w-40 h-44 border-2 border-slate-400 rounded-b-2xl bg-slate-900/80 p-2 flex flex-col justify-end relative shadow-2xl">
                  <span className="text-[10px] text-slate-400 absolute top-1 left-2 font-bold">수용액 비커</span>
                  <div
                    className={`w-full transition-all duration-700 rounded-b-xl p-2 relative flex flex-col justify-end ${
                      currentTemp > 60 ? 'h-32 bg-cyan-500/20' : 'h-32 bg-cyan-600/30'
                    }`}
                  >
                    {/* Crystals Precipitating */}
                    {kno3Step === 'cooled_crystals' && (
                      <div className="grid grid-cols-4 gap-1 p-1 bg-blue-900/50 rounded-lg border border-blue-400/50 animate-bounce">
                        {[...Array(12)].map((_, i) => (
                          <span key={i} className="text-sm">💎</span>
                        ))}
                      </div>
                    )}
                    <div className="text-[11px] font-bold text-center mt-1 text-slate-200">
                      {currentTemp > 60 ? '80℃: 모두 투명하게 용해됨' : '20℃: 질산칼륨 결정 대량 석출!'}
                    </div>
                  </div>
                </div>

                {/* Filtration Funnel */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (kno3Step === 'cooled_crystals') {
                        setKno3Step('filtered');
                        onSubstanceSeparated('kno3', 0.98);
                        onSubstanceSeparated('salt', 0.90);
                        onMoodChange('success', '석출된 순수한 질산칼륨(KNO₃) 결정을 거름종이로 완벽하게 회수했어!');
                      } else {
                        onMoodChange('thinking', '아직 온도가 높아! 다이얼을 20℃로 내려서 질산칼륨 결정을 먼저 석출시켜줘!');
                      }
                    }}
                    disabled={kno3Step !== 'cooled_crystals'}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl ${
                      kno3Step === 'cooled_crystals'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-300 animate-pulse'
                        : 'bg-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    거름종이로 결정 걸러내기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STAGE 6: MASTER ALCHEMIST CHALLENGE ===================== */}
          {stage.id === 'stage_6' && (
            <div className="flex flex-col items-center justify-between flex-1 py-2">
              <div className="text-center mb-1">
                <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-3 py-1 rounded-full font-bold">
                  종합 챌린지: 모래 + 소금 + 에탄올 + 물 연속 분리
                </span>
              </div>

              {/* Multi-step pipeline tracker */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-md my-2">
                <div className={`p-2 rounded-xl text-center border text-xs font-bold ${
                  masterStep === 1 ? 'bg-amber-950/80 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  1. 거름 (모래)
                </div>
                <div className={`p-2 rounded-xl text-center border text-xs font-bold ${
                  masterStep === 2 ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  2. 증류 (에탄올)
                </div>
                <div className={`p-2 rounded-xl text-center border text-xs font-bold ${
                  masterStep === 3 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  3. 증류/증발 (물/소금)
                </div>
              </div>

              {/* Interactive pipeline */}
              <div className="flex flex-col items-center my-3">
                {masterStep === 1 && (
                  <button
                    onClick={() => {
                      setMasterStep(2);
                      onSubstanceSeparated('sand', 0.99);
                      onMoodChange('happy', '모래 거름 성공! 이제 남은 용액(에탄올+물+소금)을 분별 증류기에 넣자!');
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-lg flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    1단계: 거름종이로 모래 걸러내기
                  </button>
                )}

                {masterStep === 2 && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-300">온도 다이얼을 78℃로 조절하여 에탄올을 분별 증류하세요!</span>
                    <button
                      onClick={() => {
                        if (currentTemp >= 76 && currentTemp <= 85) {
                          setMasterStep(3);
                          onSubstanceSeparated('ethanol', 0.98);
                          onMoodChange('success', '에탄올 분별 증류 완료! 이제 100℃로 올려 물과 소금을 분리하자!');
                        } else {
                          onMoodChange('thinking', '온도 다이얼을 에탄올 끓는점인 78℃ 근처로 맞춰야 해!');
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg"
                    >
                      🧪 78℃ 에탄올 증류 수집
                    </button>
                  </div>
                )}

                {masterStep === 3 && (
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => {
                        onSubstanceSeparated('water', 0.99);
                        onSubstanceSeparated('salt', 0.99);
                        onMoodChange('cheering', '대성공이야! 모든 혼합물을 100% 분리해내어 대연금술사로 등극했어!');
                      }}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm shadow-lg"
                    >
                      ✨ 100℃ 물 증류 & 소금 결정 석출
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
          )}

          {/* Bottom Principle Badge */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              💡 {stage.scientificPrinciple.title}
            </span>
            <span className="hidden sm:inline text-slate-500">중학교 2학년 과학 물질의 특성</span>
          </div>
        </div>

        {/* Right Side Control Panel: Thermal Dial & Lab Actions */}
        <div className="lg:col-span-4 flex flex-col items-center justify-between gap-4">
          {/* Temperature Dial */}
          <ApparatusDial
            currentTemp={currentTemp}
            targetTemp={targetTemp}
            onTargetTempChange={setTargetTemp}
            minTemp={stage.category === 'density' ? 10 : 0}
            maxTemp={stage.id === 'stage_8' ? 220 : stage.category === 'density' ? 40 : 120}
            highlightTemp={
              stage.id === 'stage_3' || stage.id === 'stage_10'
                ? 78
                : stage.id === 'stage_5'
                ? 20
                : stage.id === 'stage_4'
                ? 100
                : stage.id === 'stage_8'
                ? (currentTemp < 100 ? 70 : 180)
                : stage.id === 'stage_9'
                ? 10
                : undefined
            }
            highlightLabel={
              stage.id === 'stage_3' || stage.id === 'stage_10'
                ? '에탄올 78℃'
                : stage.id === 'stage_5'
                ? '재결정 20℃'
                : stage.id === 'stage_4'
                ? '증발 100℃'
                : stage.id === 'stage_8'
                ? (currentTemp < 100 ? '휘발유 70℃' : '등유 180℃')
                : stage.id === 'stage_9'
                ? '급랭 10℃'
                : undefined
            }
            label={stage.id === 'stage_5' || stage.id === 'stage_9' ? '냉각/가열 다이얼' : '가열 장치 다이얼'}
          />

          {/* Educational Quick Card */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 shadow-lg">
            <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              핵심 과학 원리
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              {stage.scientificPrinciple.explanation}
            </p>
            <div className="space-y-1">
              {stage.scientificPrinciple.keyPoints.slice(0, 2).map((pt, idx) => (
                <div key={idx} className="text-[10px] text-emerald-300/90 flex items-start gap-1">
                  <span>•</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
