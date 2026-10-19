import React, { useState } from 'react';
import { CostumeItem } from '../types/game';
import { COSTUMES } from '../data/costumes';
import { AlchemistCharacter } from './AlchemistCharacter';
import { ShoppingBag, Coins, Check, Sparkles, X, ShieldCheck } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  unlockedCostumes: string[];
  equippedCostume: string;
  onBuyCostume: (costumeId: string, price: number) => void;
  onEquipCostume: (costumeId: string) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  unlockedCostumes,
  equippedCostume,
  onBuyCostume,
  onEquipCostume
}) => {
  const [selectedCostumeId, setSelectedCostumeId] = useState<string>(equippedCostume);

  if (!isOpen) return null;

  const currentPreviewCostume = COSTUMES.find(c => c.id === selectedCostumeId) || COSTUMES[0];
  const isUnlocked = unlockedCostumes.includes(selectedCostumeId);
  const isEquipped = equippedCostume === selectedCostumeId;
  const canAfford = coins >= currentPreviewCostume.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Alchemist Wardrobe & Atelier
              </span>
              <h2 className="text-2xl font-alchemy text-white mt-0.5">
                연금술사 의상 상점
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Coins Balance */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-950/80 border border-amber-500/50 shadow-inner">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-black font-mono text-amber-300">
                {coins.toLocaleString()}
              </span>
              <span className="text-xs text-amber-400/80 font-bold">코인</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: Preview Column + Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 overflow-y-auto flex-1 pr-1">
          {/* Left: Alchemist Avatar Live Fitting Room */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/80 to-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
            <div className="absolute top-3 left-3 text-[11px] font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 드레스룸 피팅 미리보기
            </div>

            <div className="my-4">
              <AlchemistCharacter
                mood={isEquipped ? 'happy' : 'thinking'}
                equippedCostumeId={selectedCostumeId}
                size="lg"
              />
            </div>

            <div className="text-center w-full mt-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentPreviewCostume.rarity === '전설'
                    ? 'bg-amber-950 text-amber-300 border-amber-500'
                    : currentPreviewCostume.rarity === '에픽'
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : currentPreviewCostume.rarity === '희귀'
                    ? 'bg-blue-950 text-blue-300 border-blue-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {currentPreviewCostume.rarity}
              </span>
              <h3 className="text-lg font-alchemy text-white mt-1">
                {currentPreviewCostume.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {currentPreviewCostume.description}
              </p>
            </div>

            {/* Action Button inside fitting room */}
            <div className="w-full mt-4">
              {isEquipped ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold text-sm text-center flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" /> 착용 중
                </div>
              ) : isUnlocked ? (
                <button
                  onClick={() => onEquipCostume(selectedCostumeId)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm text-center shadow-lg transition-transform hover:scale-[1.02]"
                >
                  지금 착용하기
                </button>
              ) : (
                <button
                  onClick={() => onBuyCostume(selectedCostumeId, currentPreviewCostume.price)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl font-black text-sm text-center shadow-lg transition-transform flex items-center justify-center gap-2 ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  {currentPreviewCostume.price} 코인으로 구매하기
                </button>
              )}
            </div>
          </div>

          {/* Right: Costumes Catalog Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COSTUMES.map(item => {
              const owned = unlockedCostumes.includes(item.id);
              const equipped = equippedCostume === item.id;
              const isSelected = selectedCostumeId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCostumeId(item.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{item.icon}</div>
                    <div>
                      {equipped ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-600">
                          착용 중
                        </span>
                      ) : owned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 border border-blue-600">
                          보유 중
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          {item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="my-2">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Swatch preview */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shadow-sm" style={{ backgroundColor: item.robeColor }} title="로브 색상" />
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shadow-sm" style={{ backgroundColor: item.hatColor }} title="모자 색상" />
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-500 shadow-sm" style={{ backgroundColor: item.trimColor }} title="장식 색상" />
                    <span className="text-[10px] text-slate-500 ml-auto font-bold">{item.rarity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>스테이지를 높은 완성도로 클리어하여 더 많은 코인을 모아보세요!</span>
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
