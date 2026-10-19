import { Stage } from '../types/game';

export const STAGES: Stage[] = [
  {
    id: 'stage_1',
    stageNumber: 1,
    title: '바다에 빠진 마법 플라스틱',
    subtitle: '밀도 차이를 이용한 고체 혼합물 분리',
    category: 'density',
    categoryLabel: '밀도 차 분리 (고체)',
    story: '연금술사의 조수가 플라스틱 조각 두 종류(PP와 PS)를 쏟아버렸어요! 물과 소금물을 이용해 밀도 차이로 각각을 떠오르게 하여 순수한 플라스틱을 분리하세요!',
    targetSubstances: [
      { substanceId: 'plastic_pp', targetPurity: 0.9, requiredAmount: 1 },
      { substanceId: 'plastic_ps', targetPurity: 0.9, requiredAmount: 1 }
    ],
    initialMixtureIds: ['plastic_pp', 'plastic_ps'],
    allowedApparatus: ['water_bath'],
    defaultTemp: 20,
    timeLimitSec: 90,
    hints: [
      '물질의 밀도가 액체보다 작으면 뜨고, 액체보다 크면 가라앉습니다.',
      '순수한 물(밀도 1.00g/cm³)을 부으면 PP(밀도 0.90g/cm³)가 먼저 떠오릅니다.',
      '남은 PS(밀도 1.05g/cm³)는 소금을 타서 액체의 밀도를 1.10g/cm³ 이상으로 높인 소금물에 띄울 수 있습니다.'
    ],
    scientificPrinciple: {
      title: '밀도 차를 이용한 고체 혼합물의 분리',
      explanation: '두 고체 물질이 녹지 않는 액체 중 두 물질의 중간 정도 밀도를 가진 액체를 넣으면, 밀도가 작은 물질은 위로 뜨고 밀도가 큰 물질은 바닥으로 가라앉아 쉽게 분리할 수 있습니다.',
      keyPoints: [
        'PP 플라스틱 (0.90g/cm³) < 물 (1.00g/cm³) : 물에 뜸',
        '물 (1.00g/cm³) < PS 플라스틱 (1.05g/cm³) : 순수한 물에는 가라앉음',
        'PS 플라스틱 (1.05g/cm³) < 소금물 (1.10g/cm³) : 소금물에 뜸',
        '일상 예시: 벼씨 고르기(소금물), 신선한 달걀 고르기, 사금 채취'
      ]
    }
  },
  {
    id: 'stage_2',
    stageNumber: 2,
    title: '연금술 비약의 세 층',
    subtitle: '서로 섞이지 않는 액체의 분별 깔때기 분리',
    category: 'density',
    categoryLabel: '밀도 차 분리 (액체)',
    story: '밀도가 서로 다른 액체들이 층을 이루고 있어요! 분별 깔때기(Separatory Funnel)를 사용해 밀도 차로 나뉜 층을 정확히 분리해내세요. ⚠️주의: 서로 섞이는 액체(에탄올+물)에는 분별 깔때기를 쓸 수 없습니다!',
    targetSubstances: [
      { substanceId: 'oil', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'water', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'ccl4', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['oil', 'water', 'ccl4'],
    allowedApparatus: ['separatory_funnel'],
    defaultTemp: 20,
    timeLimitSec: 100,
    hints: [
      '밀도가 가장 큰 액체가 맨 아래층에, 밀도가 가장 작은 액체가 맨 위층에 놓입니다.',
      '사염화탄소(1.59g/cm³) > 물(1.00g/cm³) > 식용유(0.92g/cm³) 순서로 층이 생깁니다.',
      '꼭지를 열어 아래층 액체(사염화탄소)를 먼저 비커로 받고, 경계면 액체는 버린 뒤, 위층 액체(식용유)는 위 주둥이로 따라냅니다.'
    ],
    scientificPrinciple: {
      title: '서로 섞이지 않는 액체 혼합물의 분리',
      explanation: '서로 섞이지 않고 밀도가 다른 액체 혼합물은 분별 깔때기나 스포이트를 이용하여 분리합니다. 밀도가 큰 액체가 아래층, 밀도가 작은 액체가 위층을 이룹니다.',
      keyPoints: [
        '서로 섞이지 않아야 밀도 차로 층이 분리됩니다.',
        '아래층 액체는 깔때기 아래쪽 꼭지를 돌려 받아냅니다.',
        '위층 액체는 아래쪽 꼭지가 아닌 위쪽 입구로 따라내어 순도를 보존합니다.',
        '섞이는 액체(물+에탄올)는 층이 생기지 않아 적용 불가!'
      ]
    }
  },
  {
    id: 'stage_3',
    stageNumber: 3,
    title: '비밀의 묘약 분별 증류',
    subtitle: '끓는점 차이를 이용한 섞이는 액체의 분별 증류',
    category: 'boiling_point',
    categoryLabel: '끓는점 차 분리',
    story: '물과 에탄올이 서로 완벽하게 섞여버렸어요! 밀도 차로는 분리할 수 없습니다. 가열 다이얼로 온도를 정밀하게 조절하여 에탄올의 끓는점(78.3℃)에 맞추고 순수한 에탄올 증기를 냉각관으로 액화시켜 모으세요!',
    targetSubstances: [
      { substanceId: 'ethanol', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'water', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['water', 'ethanol'],
    allowedApparatus: ['distillation'],
    defaultTemp: 20,
    timeLimitSec: 110,
    hints: [
      '에탄올의 끓는점은 78.3℃이고, 물의 끓는점은 100℃입니다.',
      '갑자기 끓어 넘치는 것을 막기 위해 반드시 플라스크에 끓임쪽을 넣어야 합니다.',
      '온도 다이얼을 돌려 78℃~82℃ 범위로 가열하면 에탄올이 먼저 기화하여 기포가 생기고 냉각기를 통해 흘러나옵니다!'
    ],
    scientificPrinciple: {
      title: '끓는점 차를 이용한 분별 증류',
      explanation: '서로 잘 섞이는 액체 혼합물을 가열하면 끓는점이 낮은 물질이 먼저 끓어 나와 기화하고, 이를 냉각기로 통과시켜 다시 액체로 모읍니다.',
      keyPoints: [
        '끓임쪽: 액체가 갑자기 끓어 넘치는 현상(돌비 현상)을 방지',
        '온도계 구부의 위치: 가지 달린 플라스크의 가지 입구 높이에 위치(증기의 온도를 정확히 측정)',
        '냉각기: 찬물은 아래쪽에서 흘려보내 위쪽으로 나오게 해야 빈 공간 없이 냉각수가 가득 찹니다.',
        '실생활 예: 탁주에서 맑은 소주 얻기, 원유의 분별 증류, 바닷물 담수화'
      ]
    }
  },
  {
    id: 'stage_4',
    stageNumber: 4,
    title: '사막의 보물 소금과 모래',
    subtitle: '용해도 차이를 이용한 거름과 증발',
    category: 'solubility',
    categoryLabel: '용해도 차 분리 (거름)',
    story: '마법의 소금과 모래가 뒤섞였습니다! 물을 부어 소금만 완전히 녹인 뒤, 혼합물을 거름종이에 드래그하여 부어 모래를 걸러내고, 거른 용액(여액)을 가열하여 순수한 소금 결정을 얻으세요!',
    targetSubstances: [
      { substanceId: 'sand', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'salt', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['sand', 'salt'],
    allowedApparatus: ['filtration', 'evaporating_dish'],
    defaultTemp: 25,
    timeLimitSec: 100,
    hints: [
      '소금은 물에 잘 녹지만, 모래는 물에 녹지 않습니다.',
      '물을 부어 소금을 모두 녹인 뒤, 비커를 거름종이 깔때기로 드래그하세요.',
      '거름종이 위에는 모래가 남고, 아래 비커에 모인 소금물(여액)을 증발 접시에서 가열하면 물이 날아가고 소금만 남습니다.'
    ],
    scientificPrinciple: {
      title: '특정 용매에 대한 용해도 차를 이용한 분리 (거름)',
      explanation: '어떤 용매에 잘 녹는 고체와 잘 녹지 않는 고체 혼합물에 용매를 넣으면, 녹지 않는 고체는 거름종이로 거르고, 녹아 있는 고체는 용매를 증발시켜 분리합니다.',
      keyPoints: [
        '거름종이: 용매에 녹지 않는 큰 입자(모래)를 걸러냄',
        '여액(거른 액체): 용매에 녹아 입자가 매우 작아진 소금 수용액',
        '증발 접시 가열: 물(용매)이 기화하여 날아가고 순수한 소금 결정이 남음'
      ]
    }
  },
  {
    id: 'stage_5',
    stageNumber: 5,
    title: '얼어붙은 수정의 결정화',
    subtitle: '온도에 따른 용해도 차이를 이용한 재결정',
    category: 'solubility',
    categoryLabel: '용해도 차 분리 (재결정)',
    story: '질산칼륨(KNO₃)과 소량의 염화나트륨(소금)이 섞여 있어요! 80℃의 온수로 가열하여 모두 녹인 후, 냉각 다이얼로 20℃까지 차갑게 식히면 용해도 차이가 큰 질산칼륨만 아름다운 결정으로 쏟아져 나옵니다. 거름종이에 드래그하여 순수 분리하세요!',
    targetSubstances: [
      { substanceId: 'kno3', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'salt', targetPurity: 0.9, requiredAmount: 1 }
    ],
    initialMixtureIds: ['kno3', 'salt'],
    allowedApparatus: ['water_bath', 'filtration'],
    defaultTemp: 80,
    timeLimitSec: 110,
    hints: [
      '질산칼륨은 온도에 따른 용해도 변화가 매우 크고, 소금은 온도가 변해도 용해도 변화가 거의 없습니다.',
      '80℃에서는 질산칼륨과 소금이 모두 물에 녹아 투명한 용액이 됩니다.',
      '냉각 다이얼을 20℃ 이하로 낮추면 질산칼륨의 용해도가 급격히 떨어져 결정(고체)으로 석출됩니다! 이 결정을 거름종이로 걸러냅니다.'
    ],
    scientificPrinciple: {
      title: '온도에 따른 용해도 차를 이용한 분리 (재결정 & 분별 결정)',
      explanation: '온도에 따른 용해도 변화가 큰 물질(질산칼륨)과 용해도 변화가 작은 물질(염화나트륨)의 혼합물을 높은 온도에서 모두 녹인 후 냉각하면, 용해도 감소량이 큰 물질만 많은 양의 결정으로 석출됩니다.',
      keyPoints: [
        '재결정(Recrystallization): 불순물이 섞인 고체를 높은 온도의 용매에 녹인 후 냉각하여 순수한 결정을 얻는 방법',
        '질산칼륨: 80℃ 용해도 169g → 20℃ 용해도 31.9g (약 137g 석출!)',
        '염화나트륨: 80℃ 용해도 38g → 20℃ 용해도 36g (석출량 거의 없음, 용액에 그대로 녹아 있음)',
        '석출된 고체 결정을 거름 장치로 걸러 순수한 질산칼륨을 회수합니다.'
      ]
    }
  },
  {
    id: 'stage_6',
    stageNumber: 6,
    title: '대연금술사의 궁극 시험',
    subtitle: '밀도, 끓는점, 용해도를 총동원한 종합 혼합물 분리',
    category: 'combined',
    categoryLabel: '종합 마스터 시험',
    story: '마스터의 실수로 모래, 소금, 에탄올, 물이 전부 섞인 혼돈의 비약이 탄생했습니다! 중학교 2학년 과학에서 배운 모든 물리적 특성(용해도 차 거름 → 끓는점 차 분별증류 → 증발)을 종합하여 모든 물질을 100% 분리해내세요!',
    targetSubstances: [
      { substanceId: 'sand', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'ethanol', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'salt', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'water', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['sand', 'salt', 'ethanol', 'water'],
    allowedApparatus: ['filtration', 'distillation', 'evaporating_dish'],
    defaultTemp: 25,
    timeLimitSec: 150,
    hints: [
      '1단계: 녹지 않는 모래를 먼저 거름종이로 걸러 분리합니다.',
      '2단계: 거른 용액(에탄올 + 물 + 소금)을 분별 증류 장치에 넣고 78℃로 가열하여 에탄올을 먼저 증류해냅니다.',
      '3단계: 증류를 계속하여 100℃에서 물을 모으거나, 남은 소금 수용액을 증발 접시에서 가열하여 소금 결정을 얻습니다.'
    ],
    scientificPrinciple: {
      title: '물질의 여러 특성을 종합한 혼합물의 체계적 분리',
      explanation: '여러 물질이 복합적으로 섞여 있을 때는 각 물질의 특성(용해도, 끓는점, 밀도, 자성 등) 차이를 체계적인 순서로 적용하여 하나씩 분리해냅니다.',
      keyPoints: [
        '1. 고체 용해도 차이로 거름(모래 분리)',
        '2. 액체의 끓는점 차이로 분별 증류(에탄올 분리)',
        '3. 용매 증발로 고체 석출(소금 분리)',
        '각 단계마다 원인과 도구의 올바른 선택이 중요합니다.'
      ]
    }
  },
  {
    id: 'stage_7',
    stageNumber: 7,
    title: '풍요의 볍씨와 소금물 선별',
    subtitle: '밀도 차이를 이용한 볍씨 고르기 탐구',
    category: 'density',
    categoryLabel: '밀도 차 (실생활 탐구)',
    story: '농가에 파종할 볍씨 속에 영양가가 없는 쭉정이가 섞여 있습니다! 순수한 물에서는 둘 다 가라앉지만, 소금을 타서 소금물의 밀도를 1.10g/cm³로 맞추면 쭉정이만 물 위로 둥둥 떠오릅니다. 가라앉은 좋은 볍씨와 뜬 쭉정이를 완벽히 분리하세요!',
    targetSubstances: [
      { substanceId: 'rice_good', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'rice_bad', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['rice_good', 'rice_bad'],
    allowedApparatus: ['water_bath'],
    defaultTemp: 20,
    timeLimitSec: 90,
    hints: [
      '순수한 물(1.00g/cm³)에서는 좋은 볍씨(1.13)와 쭉정이(1.02)가 모두 가라앉습니다.',
      '소금을 녹여 소금물의 밀도를 1.10g/cm³로 올리면 쭉정이(1.02)만 수면 위로 떠오릅니다!',
      '떠오른 쭉정이를 먼저 건져내고, 바닥에 가라앉은 실한 볍씨를 건져내면 분리 완료입니다.'
    ],
    scientificPrinciple: {
      title: '소금물을 이용한 볍씨 및 신선한 달걀 고르기',
      explanation: '고체 혼합물에서 두 물질이 모두 물보다 밀도가 클 때, 소금을 녹여 액체의 밀도를 두 고체의 중간값으로 높여주면 밀도가 작은 쪽만 떠올라 분리할 수 있습니다.',
      keyPoints: [
        '물 (1.00g/cm³) < 쭉정이 (1.02g/cm³) < 소금물 (1.10g/cm³) < 좋은 볍씨 (1.13g/cm³)',
        '신선한 달걀도 오래되면 수분이 증발하고 공기집이 커져 밀도가 작아져 소금물에 뜹니다.',
        '전통 농경 사회에서 조상들이 밀도 차이를 슬기롭게 활용한 대표적 사례입니다.'
      ]
    }
  },
  {
    id: 'stage_8',
    stageNumber: 8,
    title: '원유 증류탑의 검은 황금',
    subtitle: '끓는점 차이를 이용한 원유의 분별 증류',
    category: 'boiling_point',
    categoryLabel: '끓는점 차 (증류탑)',
    story: '검은 원유(Crude Oil)는 다양한 탄화수소가 섞인 대표적 혼합물입니다! 증류탑의 온도를 정밀하게 제어하여 70℃ 부근에서 자동차 연료인 휘발유(가솔린)를, 180℃ 부근에서 난방용 등유를 순차적으로 분별 증류하세요!',
    targetSubstances: [
      { substanceId: 'gasoline', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'kerosene', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['gasoline', 'kerosene'],
    allowedApparatus: ['distillation'],
    defaultTemp: 25,
    timeLimitSec: 120,
    hints: [
      '휘발유의 끓는점은 약 70℃이고, 등유의 끓는점은 약 180℃입니다.',
      '온도 다이얼을 70~80℃로 가열하여 끓는점이 낮은 휘발유를 먼저 증기화시켜 냉각기로 모으세요.',
      '휘발유 증류가 끝나면 온도를 180℃ 이상으로 올려 등유를 분리하세요.'
    ],
    scientificPrinciple: {
      title: '원유의 분별 증류와 증류탑의 원리',
      explanation: '원유를 높은 온도로 가열하여 증류탑으로 보내면, 끓는점이 낮은 물질일수록 증류탑의 높은 곳에서 먼저 냉각되어 분리되고, 끓는점이 높은 물질은 아래쪽에서 배출됩니다.',
      keyPoints: [
        '끓는점 순서: 석유가스(<20℃) < 휘발유(30~120℃) < 등유(150~280℃) < 경유(230~350℃) < 중유/아스팔트',
        '원유는 서로 섞이는 액체 혼합물이므로 밀도로 분리할 수 없고 끓는점 차를 이용합니다.',
        '중학교 2학년 과학 시험에 가장 빈번히 출제되는 산업적 분별 증류 예시입니다.'
      ]
    }
  },
  {
    id: 'stage_9',
    stageNumber: 9,
    title: '푸른 수정 황산구리의 재결정',
    subtitle: '온도별 용해도 곡선 차이를 이용한 결정 석출',
    category: 'solubility',
    categoryLabel: '용해도 차 (재결정)',
    story: '신비로운 푸른빛의 황산구리(CuSO₄)와 염화나트륨(소금)이 섞여 있습니다! 60℃의 따뜻한 물에서 모두 녹인 후, 다이얼을 10℃ 얼음물 온도로 급랭시키면 용해도 변화가 큰 아름다운 푸른색 황산구리 결정만 석출됩니다. 거름종이로 회수하세요!',
    targetSubstances: [
      { substanceId: 'copper_sulfate', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'salt', targetPurity: 0.9, requiredAmount: 1 }
    ],
    initialMixtureIds: ['copper_sulfate', 'salt'],
    allowedApparatus: ['water_bath', 'filtration'],
    defaultTemp: 60,
    timeLimitSec: 110,
    hints: [
      '황산구리는 온도에 따른 용해도 변화가 크며(60℃ 40g → 10℃ 17g), 소금은 온도가 내려가도 용해도가 거의 변하지 않습니다.',
      '온도 다이얼을 10℃로 내리면 푸른색 황산구리 결정이 비커 바닥에 쏟아져 나옵니다.',
      '석출된 고체 결정을 거름종이 깔때기로 걸러내어 순수한 황산구리를 회수하세요!'
    ],
    scientificPrinciple: {
      title: '용해도 곡선의 기울기 차이를 이용한 재결정',
      explanation: '용해도 곡선에서 기울기가 급격한 물질은 온도가 낮아질 때 석출되는 결정의 양이 매우 많아, 기울기가 완만한 물질로부터 쉽게 분리해낼 수 있습니다.',
      keyPoints: [
        '황산구리(CuSO₄): 온도 상승 시 용해도 급격히 증가 (60℃ 40.0g → 10℃ 약 17.5g, 약 22.5g 석출!)',
        '염화나트륨(NaCl): 온도에 따른 용해도 차이가 매우 작아 여전히 용액 속에 녹아 있음',
        '순수한 고체 물질을 얻는 데 가장 효과적인 화학 정제 방법입니다.'
      ]
    }
  },
  {
    id: 'stage_10',
    stageNumber: 10,
    title: '현자의 돌 최종 연금술 챔피언십',
    subtitle: '자성, 밀도, 거름, 증류, 증발의 궁극의 6종 분리',
    category: 'combined',
    categoryLabel: '최종 그랜드 마스터',
    story: '철가루, 사금(금가루), 모래, 소금, 에탄올, 물이 하나로 뒤엉킨 금단의 혼합물입니다! 자석으로 철가루를 제거하고, 밀도 차 패닝으로 무거운 사금을 건져내고, 거름으로 모래를, 78℃ 분별증류로 에탄올을, 마지막으로 증발로 소금을 얻는 5단계 대장정을 완수하세요!',
    targetSubstances: [
      { substanceId: 'iron_powder', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'gold_dust', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'sand', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'ethanol', targetPurity: 0.95, requiredAmount: 1 },
      { substanceId: 'salt', targetPurity: 0.95, requiredAmount: 1 }
    ],
    initialMixtureIds: ['iron_powder', 'gold_dust', 'sand', 'salt', 'ethanol', 'water'],
    allowedApparatus: ['filtration', 'distillation', 'evaporating_dish', 'water_bath'],
    defaultTemp: 25,
    timeLimitSec: 180,
    hints: [
      '1단계: 자석(🧲)을 대어 자성이 있는 철가루를 먼저 분리합니다.',
      '2단계: 물속에서 밀도가 매우 큰 사금(19.3g/cm³)을 바닥에서 건져냅니다.',
      '3단계: 거름종이로 녹지 않은 모래를 걸러냅니다.',
      '4단계: 78℃ 분별 증류로 에탄올을 분리하고, 5단계 증발 접시 가열로 소금을 얻습니다.'
    ],
    scientificPrinciple: {
      title: '물질의 고유한 물리적 특성 총정리',
      explanation: '밀도, 끓는점, 녹는점, 용해도, 자성은 물질의 양에 관계없이 물질의 종류에 따라 일정한 값을 갖는 고유한 물질의 특성입니다.',
      keyPoints: [
        '자성 차이: 자석에 붙는 철가루 분리',
        '밀도 차이: 사금(19.3)과 모래(2.6)의 침전 속도 차이 분리',
        '용해도 차이: 물에 녹는 소금과 녹지 않는 모래 거름 분리',
        '끓는점 차이: 에탄올(78.3℃)과 물(100℃) 분별 증류',
        '모든 분리 단계는 물질의 상태 변화와 분자 간 인력 차이에 기초합니다.'
      ]
    }
  }
];
