export type SeparationMethod = 'density' | 'boiling_point' | 'solubility' | 'combined';

export interface Substance {
  id: string;
  name: string;
  chemicalFormula?: string;
  state: 'liquid' | 'solid';
  density: number; // g/cm³
  boilingPoint: number; // °C
  waterSolubility: boolean; // whether it dissolves in water
  solubilityCurve?: Record<number, number>; // Temp (°C) -> g/100g H2O
  miscibleWithWater?: boolean; // whether liquid mixes with water
  color: string;
  particleIcon?: string;
  description: string;
}

export interface StageSubstanceRequirement {
  substanceId: string;
  targetPurity: number; // e.g. 0.95 (95%)
  requiredAmount: number;
}

export interface Stage {
  id: string;
  stageNumber: number;
  title: string;
  subtitle: string;
  category: SeparationMethod;
  categoryLabel: string;
  story: string;
  targetSubstances: StageSubstanceRequirement[];
  initialMixtureIds: string[];
  allowedApparatus: Array<'separatory_funnel' | 'distillation' | 'filtration' | 'water_bath' | 'evaporating_dish'>;
  defaultTemp: number;
  timeLimitSec: number;
  hints: string[];
  scientificPrinciple: {
    title: string;
    explanation: string;
    keyPoints: string[];
  };
}

export interface StudentProfile {
  studentCode: string;
  studentName: string;
  totalScore: number;
  totalCoins: number;
  equippedCostume: string;
  unlockedCostumes: string[];
  completedStages: string[];
  stageStars: Record<string, number>;
  stageBestTimes: Record<string, number>;
  updatedAt: string;
}

export interface LeaderboardEntry {
  studentCode: string;
  studentName: string;
  totalScore: number;
  totalStars: number;
  stagesCleared: number;
  equippedCostume: string;
  updatedAt: string;
}

export interface CostumeItem {
  id: string;
  name: string;
  price: number;
  rarity: '일반' | '희귀' | '에픽' | '전설';
  description: string;
  robeColor: string;
  hatColor: string;
  trimColor: string;
  sparkleColor: string;
  icon: string;
}

export type AlchemistMood = 'panicked' | 'thinking' | 'happy' | 'success' | 'cheering';
