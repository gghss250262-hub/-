import { CostumeItem } from '../types/game';

export const COSTUMES: CostumeItem[] = [
  {
    id: 'basic',
    name: '강철의 연금술사 붉은 코트 (에드워드 엘릭)',
    price: 0,
    rarity: '일반',
    description: '선명한 붉은색 롱코트와 검은 가죽 튜닉, 그리고 강철 오토메일 의수를 장착한 천재 연금술사의 상징입니다.',
    robeColor: '#dc2626', // Crimson Red
    hatColor: '#b91c1c',  // Deep Red hood/accent
    trimColor: '#1e293b', // Black inner tunic
    sparkleColor: '#38bdf8', // Blue Transmutation spark
    icon: '🦾'
  },
  {
    id: 'fma_alphonse',
    name: '거인의 강철 갑옷 (알폰스 엘릭)',
    price: 250,
    rarity: '희귀',
    description: '육중한 강철 판금 갑옷과 붉은 깃털 장식입니다. 방어력과 순수한 연금술 지식이 깃들어 있습니다.',
    robeColor: '#64748b', // Steel gray
    hatColor: '#475569',
    trimColor: '#e2e8f0',
    sparkleColor: '#fde047',
    icon: '🛡️'
  },
  {
    id: 'fma_mustang',
    name: '불꽃의 연금술사 군복 (로이 머스탱)',
    price: 500,
    rarity: '희귀',
    description: '연성진이 새겨진 발화포 장갑과 늠름한 군청색 국가 연금술사 정복입니다. 핑거스냅으로 온도를 조절합니다.',
    robeColor: '#1e3a8a', // Military Navy
    hatColor: '#172554',
    trimColor: '#fbbf24', // Gold shoulder ropes
    sparkleColor: '#f97316', // Orange Flame
    icon: '🔥'
  },
  {
    id: 'fma_winry',
    name: '오토메일 기계정비사 (윈리 록벨)',
    price: 800,
    rarity: '에픽',
    description: '두건과 몽키스패너를 든 기계갑옷 마스터의 복장입니다. 모든 실험 기구를 완벽하게 조율합니다.',
    robeColor: '#0284c7',
    hatColor: '#f59e0b', // Bandana
    trimColor: '#10b981',
    sparkleColor: '#a7f3d0',
    icon: '🔧'
  },
  {
    id: 'fma_state',
    name: '국가 공인 연금술사 은시계 정복',
    price: 1100,
    rarity: '에픽',
    description: '아메스트리스 군 본부에서 수여하는 은시계와 금빛 견장이 달린 최고 엘리트 연구원의 정복입니다.',
    robeColor: '#0f172a',
    hatColor: '#334155',
    trimColor: '#e2e8f0', // Silver
    sparkleColor: '#38bdf8',
    icon: '⏱️'
  },
  {
    id: 'fma_philosopher',
    name: '진리의 문 & 현자의 돌 오라 로브',
    price: 1600,
    rarity: '전설',
    description: '등가교환을 초월한 붉은 현자의 돌과 진리의 문 연성 번개가 온몸을 감싸는 전설의 예복입니다.',
    robeColor: '#7f1d1d',
    hatColor: '#991b1b',
    trimColor: '#fbbf24',
    sparkleColor: '#f43f5e',
    icon: '⚡'
  }
];
