import { Substance } from '../types/game';

export const SUBSTANCES: Record<string, Substance> = {
  water: {
    id: 'water',
    name: '물',
    chemicalFormula: 'H₂O',
    state: 'liquid',
    density: 1.00,
    boilingPoint: 100,
    waterSolubility: true,
    miscibleWithWater: true,
    color: '#38bdf8',
    particleIcon: '💧',
    description: '밀도 1.00g/cm³, 끓는점 100℃의 대표적인 용매입니다.'
  },
  ethanol: {
    id: 'ethanol',
    name: '에탄올',
    chemicalFormula: 'C₂H₅OH',
    state: 'liquid',
    density: 0.79,
    boilingPoint: 78.3,
    waterSolubility: true,
    miscibleWithWater: true, // 물과 섞임! (분별깔때기로 분리 불가, 끓는점 차 분별증류 사용)
    color: '#a7f3d0',
    particleIcon: '🧪',
    description: '밀도 0.79g/cm³, 끓는점 78.3℃로 물보다 끓는점이 낮으며, 물과 서로 잘 섞입니다.'
  },
  oil: {
    id: 'oil',
    name: '식용유',
    chemicalFormula: 'Triglyceride',
    state: 'liquid',
    density: 0.92,
    boilingPoint: 220,
    waterSolubility: false,
    miscibleWithWater: false, // 물과 섞이지 않음! 물 위에 뜸 (밀도 0.92 < 1.00)
    color: '#fbbf24',
    particleIcon: '🫒',
    description: '밀도 0.92g/cm³로 물보다 가벼워 위에 뜨며, 물과 서로 섞이지 않아 분별 깔때기로 분리합니다.'
  },
  ccl4: {
    id: 'ccl4',
    name: '사염화탄소',
    chemicalFormula: 'CCl₄',
    state: 'liquid',
    density: 1.59,
    boilingPoint: 76.8,
    waterSolubility: false,
    miscibleWithWater: false, // 물과 섞이지 않음! 물 아래로 가라앉음 (밀도 1.59 > 1.00)
    color: '#c084fc',
    particleIcon: '🟣',
    description: '밀도 1.59g/cm³로 물보다 무거워 아래로 가라앉으며, 물과 섞이지 않습니다.'
  },
  sand: {
    id: 'sand',
    name: '모래',
    chemicalFormula: 'SiO₂',
    state: 'solid',
    density: 2.60,
    boilingPoint: 2230,
    waterSolubility: false,
    color: '#d97706',
    particleIcon: '🏖️',
    description: '밀도 2.6g/cm³의 고체로 물에 녹지 않으며, 거름종이에 걸러집니다.'
  },
  salt: {
    id: 'salt',
    name: '염화나트륨(소금)',
    chemicalFormula: 'NaCl',
    state: 'solid',
    density: 2.16,
    boilingPoint: 1465,
    waterSolubility: true,
    solubilityCurve: {
      0: 35.7,
      20: 36.0,
      40: 36.6,
      60: 37.3,
      80: 38.0,
      100: 39.8
    },
    color: '#ffffff',
    particleIcon: '🧂',
    description: '물에 잘 녹으며, 온도에 따른 용해도 변화가 거의 없는 고체 물질입니다.'
  },
  kno3: {
    id: 'kno3',
    name: '질산칼륨',
    chemicalFormula: 'KNO₃',
    state: 'solid',
    density: 2.11,
    boilingPoint: 400,
    waterSolubility: true,
    solubilityCurve: {
      0: 13.3,
      20: 31.9,
      40: 63.9,
      60: 109.2,
      80: 169.0,
      100: 246.0
    },
    color: '#93c5fd',
    particleIcon: '💎',
    description: '온도가 높을수록 물에 매우 잘 녹으며, 냉각 시 온도에 따른 용해도 차이가 매우 커서 결정으로 석출(재결정)됩니다.'
  },
  plastic_pp: {
    id: 'plastic_pp',
    name: 'PP 플라스틱(폴리프로필렌)',
    chemicalFormula: '(C₃H₆)ₙ',
    state: 'solid',
    density: 0.90,
    boilingPoint: 300,
    waterSolubility: false,
    color: '#34d399',
    particleIcon: '🟩',
    description: '밀도 0.90g/cm³로 순수한 물(1.00g/cm³)에 뜹니다.'
  },
  plastic_ps: {
    id: 'plastic_ps',
    name: 'PS 플라스틱(폴리스티렌)',
    chemicalFormula: '(C₈H₈)ₙ',
    state: 'solid',
    density: 1.05,
    boilingPoint: 320,
    waterSolubility: false,
    color: '#f43f5e',
    particleIcon: '🟥',
    description: '밀도 1.05g/cm³로 순수한 물에서는 가라앉지만, 소금물(밀도 1.10g/cm³)에서는 뜹니다.'
  },
  iron_powder: {
    id: 'iron_powder',
    name: '철가루',
    chemicalFormula: 'Fe',
    state: 'solid',
    density: 7.87,
    boilingPoint: 2862,
    waterSolubility: false,
    color: '#64748b',
    particleIcon: '🧲',
    description: '밀도가 매우 높고 자석에 강하게 끌리는 금속 가루입니다.'
  },
  rice_good: {
    id: 'rice_good',
    name: '속이 찬 좋은 볍씨',
    state: 'solid',
    density: 1.13,
    boilingPoint: 300,
    waterSolubility: false,
    color: '#eab308',
    particleIcon: '🌾',
    description: '밀도가 1.13g/cm³로 소금물(1.10)보다 무거워 바닥에 가라앉는 건강한 볍씨입니다.'
  },
  rice_bad: {
    id: 'rice_bad',
    name: '가벼운 쭉정이 볍씨',
    state: 'solid',
    density: 1.02,
    boilingPoint: 300,
    waterSolubility: false,
    color: '#a1a1aa',
    particleIcon: '🍂',
    description: '밀도가 1.02g/cm³로 순수한 물(1.00)에는 가라앉지만, 소금물(1.10)에는 위로 떠오릅니다.'
  },
  gasoline: {
    id: 'gasoline',
    name: '휘발유(가솔린)',
    chemicalFormula: 'C₅~C₁₂',
    state: 'liquid',
    density: 0.72,
    boilingPoint: 70,
    waterSolubility: false,
    color: '#fef08a',
    particleIcon: '⛽',
    description: '원유를 분별 증류할 때 70℃ 부근에서 가장 먼저 끓어 나오는 자동차 연료입니다.'
  },
  kerosene: {
    id: 'kerosene',
    name: '등유(케로신)',
    chemicalFormula: 'C₁₀~C₁₆',
    state: 'liquid',
    density: 0.81,
    boilingPoint: 180,
    waterSolubility: false,
    color: '#fed7aa',
    particleIcon: '🏮',
    description: '원유에서 180℃ 부근에 증류되어 나오는 난방 및 항공유 성분입니다.'
  },
  copper_sulfate: {
    id: 'copper_sulfate',
    name: '황산구리(II)',
    chemicalFormula: 'CuSO₄',
    state: 'solid',
    density: 2.28,
    boilingPoint: 650,
    waterSolubility: true,
    solubilityCurve: {
      0: 14.3,
      20: 20.7,
      40: 28.5,
      60: 40.0,
      80: 55.0
    },
    color: '#0284c7',
    particleIcon: '🔷',
    description: '물에 녹으면 맑은 푸른색을 띠며, 고온 용해 후 냉각 시 아름다운 푸른색 결정으로 재결정됩니다.'
  },
  gold_dust: {
    id: 'gold_dust',
    name: '사금(순금 가루)',
    chemicalFormula: 'Au',
    state: 'solid',
    density: 19.3,
    boilingPoint: 2970,
    waterSolubility: false,
    color: '#facc15',
    particleIcon: '✨',
    description: '밀도가 무려 19.3g/cm³로 모래(2.6)보다 7배 이상 무거워 물속에서 빠르게 바닥에 가라앉습니다.'
  }
};
