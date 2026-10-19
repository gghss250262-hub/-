import React, { useState } from 'react';
import { BookOpen, Layers, Thermometer, Filter, Sparkles, X, ChevronRight } from 'lucide-react';

interface ScienceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScienceGuideModal: React.FC<ScienceGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'density' | 'boiling_point' | 'solubility' | 'quiz'>('density');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Middle School 2nd Grade Science Textbook
              </span>
              <h2 className="text-2xl font-alchemy text-white mt-0.5">
                📚 중2 과학: 물질의 특성을 이용한 혼합물의 분리
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('density')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'density'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> 1. 밀도 차를 이용한 분리
          </button>
          <button
            onClick={() => setActiveTab('boiling_point')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'boiling_point'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-4 h-4" /> 2. 끓는점 차를 이용한 분리
          </button>
          <button
            onClick={() => setActiveTab('solubility')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'solubility'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" /> 3. 용해도 차를 이용한 분리
          </button>
        </div>

        {/* Tab Body */}
        <div className="my-6 overflow-y-auto flex-1 pr-1 text-slate-300 space-y-4">
          {activeTab === 'density' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60">
                <h3 className="text-base font-bold text-purple-200 mb-2">
                  1) 고체 혼합물의 분리 (물 vs 소금물)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  두 고체 물질이 녹지 않으면서 두 물질의 중간 정도 밀도를 가진 액체에 넣으면,
                  <strong> 액체보다 밀도가 작은 물질은 뜨고, 밀도가 큰 물질은 가라앉아</strong> 쉽게 분리됩니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-purple-900">
                    <span className="font-bold text-emerald-400">플라스틱 조각 분리:</span>
                    <p className="mt-1 text-slate-400">
                      PP(0.90) &lt; 물(1.00) &lt; PS(1.05) &lt; 소금물(1.10). 물에 넣으면 PP만 뜨고, 소금물에 넣으면 PS도 뜹니다!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-purple-900">
                    <span className="font-bold text-amber-400">생활 속 예시:</span>
                    <p className="mt-1 text-slate-400">
                      벼씨 고르기 (소금물에 띄워 쭉정이 제거), 신선한 달걀 고르기, 사금 채취 (모래와 금의 밀도 차이).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-base font-bold text-purple-200 mb-2">
                  2) 서로 섞이지 않는 액체 혼합물의 분리 (분별 깔때기)
                </h3>
                <ul className="text-xs sm:text-sm space-y-2 list-disc list-inside text-slate-300">
                  <li>
                    <strong>핵심 조건:</strong> 서로 섞이지 않아야 하며, 밀도 차이가 있어야 합니다. (예: 물과 식용유, 물과 사염화탄소)
                  </li>
                  <li>
                    <strong>분별 깔때기 사용법:</strong>
                    밀도가 큰 액체(사염화탄소 1.59g/cm³)가 아래층에 위치하므로 꼭지를 돌려 아래쪽으로 먼저 받아냅니다.
                    위층 액체(식용유 0.92g/cm³)는 아래쪽 꼭지가 아니라 <strong>위쪽 입구로 따라내어야</strong> 순수하게 보존됩니다.
                  </li>
                  <li className="text-rose-400 font-bold">
                    ⚠️ 주의: 물과 에탄올은 서로 잘 섞이므로 분별 깔때기로 분리할 수 없습니다! (끓는점 차 증류 이용)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'boiling_point' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
                <h3 className="text-base font-bold text-emerald-200 mb-2">
                  끓는점 차를 이용한 분리 (증류 & 분별 증류)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  서로 잘 섞이는 액체 혼합물을 가열하면, <strong>끓는점이 낮은 물질이 먼저 끓어 나와 기화</strong>합니다.
                  이 증기를 냉각기로 식혀 액체로 모으면 순수한 물질을 얻을 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/80">
                  <span className="font-bold text-emerald-400 block mb-1">실험 장치의 핵심 포인트:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>• <strong>끓임쪽(비등석):</strong> 액체가 갑자기 끓어 넘치는 돌비 현상 방지</li>
                    <li>• <strong>온도계 구부 위치:</strong> 가지 달린 플라스크의 가지 입구 높이 (증기 온도 측정)</li>
                    <li>• <strong>냉각관의 냉각수:</strong> 아래쪽에서 들어가서 위쪽으로 나오도록 연결 (빈틈없이 가득 참)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-900/80">
                  <span className="font-bold text-amber-400 block mb-1">물과 에탄올의 분별 증류:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li>• 에탄올 끓는점: <strong>78.3℃</strong> (먼저 끓어 나옴)</li>
                    <li>• 물 끓는점: <strong>100℃</strong> (나중에 끓어 나옴)</li>
                    <li>• 가열 곡선에서 온도가 일정하게 유지되는 수평 구간이 나타남!</li>
                    <li>• 실생활 예: 탁주에서 맑은 소주 얻기, 원유의 분별 증류</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solubility' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60">
                <h3 className="text-base font-bold text-blue-200 mb-2">
                  1) 특정 용매에 대한 용해도 차이 (거름)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  어떤 용매에 잘 녹는 고체와 녹지 않는 고체의 혼합물에 용매를 넣고 저은 후, <strong>거름종이로 거르면</strong>
                  녹지 않는 고체는 거름종이 위에 남고, 녹아 있는 고체는 거른 액체(여액)를 가열 증발시켜 분리합니다.
                </p>
                <div className="mt-2 text-xs text-cyan-300 font-bold">
                  예: 모래와 소금 혼합물 → 물을 부어 소금만 녹인 뒤 거름종이로 모래를 걸러내고, 여액을 증발시켜 소금 결정 회수!
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <h3 className="text-base font-bold text-blue-200 mb-2">
                  2) 온도에 따른 용해도 차이 (재결정 & 분별 결정)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  온도에 따른 용해도 변화가 큰 물질(질산칼륨 KNO₃)과 용해도 변화가 거의 없는 물질(소금 NaCl)의 혼합물을
                  높은 온도(80℃)에서 모두 녹인 후 냉각(20℃)하면, <strong>용해도 감소량이 큰 물질만 많은 양의 결정으로 석출</strong>됩니다.
                </p>
                <div className="p-3 mt-3 rounded-xl bg-slate-950 border border-blue-900/80 font-mono text-xs text-blue-300">
                  • 질산칼륨: 80℃(169g) → 20℃(31.9g) [약 137g 석출!] <br/>
                  • 염화나트륨: 80℃(38g) → 20℃(36g) [용액에 그대로 녹아 있음]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>시험과 실험에 나오는 필수 과학 원리를 완벽하게 숙지해보세요!</span>
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
