import React from 'react';
import { AlchemistMood } from '../types/game';
import { COSTUMES } from '../data/costumes';

interface AlchemistProps {
  mood?: AlchemistMood;
  equippedCostumeId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDialogue?: boolean;
  dialogueText?: string;
  className?: string;
}

export const AlchemistCharacter: React.FC<AlchemistProps> = ({
  mood = 'panicked',
  equippedCostumeId = 'basic',
  size = 'md',
  showDialogue = false,
  dialogueText,
  className = ''
}) => {
  const costume = COSTUMES.find(c => c.id === equippedCostumeId) || COSTUMES[0];

  const sizeDimensions = {
    sm: { width: 95, height: 115, scale: 0.7 },
    md: { width: 150, height: 180, scale: 1 },
    lg: { width: 210, height: 250, scale: 1.4 },
    xl: { width: 280, height: 330, scale: 1.8 }
  }[size];

  // FMA inspired dialogue
  const defaultDialogue = {
    panicked: '누가 콩알만 하다는 거야?! 시약들이 몽땅 뒤섞여서 폭발 직전이라고!!',
    thinking: '화학은 등가교환의 법칙... 밀도와 끓는점의 차이를 계산해내자!',
    happy: '좋아! 물질의 특성을 정확히 파악했어!',
    success: '이것이 강철의 연금술이다! 완벽하게 순물질로 분리 완료!!',
    cheering: '보았느냐! 모든 물리적 특성을 정복한 국가 연금술사의 힘을!'
  }[mood];

  const isAlphonseArmor = costume.id === 'fma_alphonse';

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* SVG Character (Fullmetal Alchemist Edward Elric / Alphonse Armor) */}
      <svg
        width={sizeDimensions.width}
        height={sizeDimensions.height}
        viewBox="0 0 170 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-xl select-none transition-transform hover:scale-105 duration-300"
      >
        <defs>
          {/* Crimson Coat Gradient */}
          <linearGradient id={`coatGrad-${costume.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={costume.robeColor} />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>

          {/* Steel Automail Metallic Gradient */}
          <linearGradient id="automailSteel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Golden Blonde Hair Gradient */}
          <linearGradient id="edwardHair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Transmutation Lightning Glow */}
          <filter id="lightningGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Transmutation Blue Lightning Sparks (연성 번개) */}
        {(mood === 'success' || mood === 'cheering' || mood === 'thinking') && (
          <g filter="url(#lightningGlow)" className="animate-pulse">
            <path d="M20 70 L30 85 L22 95 L35 110" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M145 65 L135 80 L148 95 L132 115" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="85" cy="18" r="2.5" fill="#67e8f9" />
            <circle cx="140" cy="120" r="3" fill="#67e8f9" />
          </g>
        )}

        {/* Panic Anime Sweats & Wobbly marks */}
        {mood === 'panicked' && (
          <g>
            {/* Anime oversized sweat drop */}
            <path
              d="M136 50 C140 44, 146 44, 148 50 C150 56, 144 62, 136 50 Z"
              fill="#38bdf8"
              className="anim-bubble"
            />
            {/* Rage / Comedy veins */}
            <path d="M132 30 L138 36 M138 30 L132 36" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M142 33 L128 33" stroke="#ef4444" strokeWidth="2" />
          </g>
        )}

        {/* Long Red Hooded Coat (Edward Elric Red Cloak) */}
        <g>
          {/* Main Flowing Coat Body */}
          <path
            d="M44 95 C36 125, 25 170, 18 192 C55 198, 115 198, 152 192 C145 170, 134 125, 126 95 Z"
            fill={`url(#coatGrad-${costume.id})`}
            stroke="#450a0a"
            strokeWidth="2.5"
          />

          {/* Flamel Cross Symbol on Coat Back / Shoulder (뱀이 감긴 십자가 플라멜 문양) */}
          <g transform="translate(85, 145) scale(0.7)">
            {/* Cross */}
            <rect x="-2" y="-22" width="4" height="36" fill="#f8fafc" />
            <rect x="-14" y="-12" width="28" height="4" fill="#f8fafc" />
            {/* Crown on top */}
            <polygon points="-8,-26 0,-30 8,-26 6,-22 -6,-22" fill="#fbbf24" />
            {/* Coiled Serpent */}
            <path
              d="M-8 -6 C-14 -12, 14 -16, 0 -2 C-14 10, 12 12, 0 16"
              stroke="#fbbf24"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Inner Black Tunic / Leather Shirt */}
          <path
            d="M58 95 L85 130 L112 95 L108 175 L62 175 Z"
            fill={isAlphonseArmor ? '#475569' : '#09090b'}
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Silver Button Trim on Vest */}
          {!isAlphonseArmor && (
            <g>
              <circle cx="85" cy="115" r="2.5" fill="#e2e8f0" stroke="#475569" />
              <circle cx="85" cy="130" r="2.5" fill="#e2e8f0" stroke="#475569" />
              <circle cx="85" cy="145" r="2.5" fill="#e2e8f0" stroke="#475569" />
            </g>
          )}

          {/* Leather Belt & Silver State Pocket Watch Chain (은시계 줄) */}
          <rect x="52" y="158" width="66" height="8" rx="2" fill="#451a03" stroke="#78350f" strokeWidth="1.5" />
          <rect x="79" y="156" width="12" height="12" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          {/* Silver Pocket Watch Chain Draping */}
          <path d="M85 162 Q100 174 108 163" stroke="#e2e8f0" strokeWidth="2" fill="none" strokeDasharray="3 1" />
          <circle cx="109" cy="164" r="3.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
        </g>

        {/* Arms: Left Arm (Cloth) & Right Arm (STEEL AUTOMAIL) */}
        {/* LEFT ARM (Normal Cloth Sleeve + White Alchemy Glove) */}
        <g>
          {mood === 'panicked' ? (
            <path d="M48 105 C34 90, 20 70, 22 55" stroke={`url(#coatGrad-${costume.id})`} strokeWidth="12" strokeLinecap="round" />
          ) : mood === 'success' || mood === 'thinking' ? (
            <path d="M52 110 C40 120, 60 135, 78 128" stroke={`url(#coatGrad-${costume.id})`} strokeWidth="12" strokeLinecap="round" />
          ) : (
            <path d="M52 110 C38 125, 42 145, 48 155" stroke={`url(#coatGrad-${costume.id})`} strokeWidth="11" strokeLinecap="round" />
          )}

          {/* White Glove Hand */}
          {mood === 'panicked' ? (
            <circle cx="22" cy="52" r="7.5" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
          ) : mood === 'success' || mood === 'thinking' ? (
            <circle cx="78" cy="128" r="7" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
          ) : (
            <circle cx="48" cy="155" r="6.5" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
          )}
        </g>

        {/* RIGHT ARM: STEEL AUTOMAIL (강철 기계 갑옷 의수!) */}
        <g>
          {mood === 'panicked' ? (
            <g>
              {/* Flailing Automail Arm */}
              <path d="M122 105 C136 90, 150 70, 148 55" stroke="url(#automailSteel)" strokeWidth="12" strokeLinecap="round" />
              {/* Mechanical Elbow Joint and Rivets */}
              <circle cx="138" cy="85" r="4.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <rect x="144" y="50" width="8" height="12" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
            </g>
          ) : mood === 'success' || mood === 'thinking' ? (
            <g>
              {/* Clapping Hand into Transmutation pose */}
              <path d="M118 110 C130 120, 110 135, 92 128" stroke="url(#automailSteel)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="118" cy="120" r="4.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              {/* Automail Hand Clapped */}
              <circle cx="92" cy="128" r="7" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
            </g>
          ) : (
            <g>
              {/* Confident Automail Thumb Up / Holding Pure Crystal */}
              <path d="M118 110 C134 118, 144 135, 138 148" stroke="url(#automailSteel)" strokeWidth="11" strokeLinecap="round" />
              <circle cx="132" cy="128" r="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="138" cy="148" r="7" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" />
              {/* Pure Substance Flask held */}
              <path d="M135 140 L145 140 L148 152 C152 160, 130 160, 134 152 Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
            </g>
          )}
        </g>

        {/* Character Head */}
        {isAlphonseArmor ? (
          /* Alphonse Elric Fullmetal Armor Helmet */
          <g>
            <path d="M58 85 C58 55, 112 55, 112 85 L110 102 C110 110, 60 110, 60 102 Z" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
            {/* Helmet Visor Slots */}
            <rect x="68" y="78" width="12" height="4" rx="2" fill="#fde047" />
            <rect x="90" y="78" width="12" height="4" rx="2" fill="#fde047" />
            {/* Top Red Horn / Crest */}
            <polygon points="85,32 78,56 92,56" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="85" cy="56" r="4" fill="#cbd5e1" stroke="#334155" />
          </g>
        ) : (
          /* Edward Elric Face & Hair */
          <g>
            {/* Face base */}
            <ellipse cx="85" cy="74" rx="25" ry="23" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.8" />

            {/* Golden Amber Eyes */}
            {mood === 'panicked' ? (
              <g>
                {/* Anime Comic Exaggerated Screaming Eyes (흰자위 wobbly comic eyes) */}
                <ellipse cx="74" cy="70" rx="7" ry="8" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                <ellipse cx="96" cy="70" rx="7" ry="8" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                {/* Swirl pupils */}
                <circle cx="74" cy="70" r="2.5" fill="#b45309" />
                <circle cx="96" cy="70" r="2.5" fill="#b45309" />

                {/* Angled cartoon eyebrows */}
                <path d="M66 60 L78 65" stroke="#713f12" strokeWidth="3" strokeLinecap="round" />
                <path d="M104 60 L92 65" stroke="#713f12" strokeWidth="3" strokeLinecap="round" />

                {/* Wide screaming square/open mouth with sharp teeth */}
                <path d="M72 84 Q85 78 98 84 L96 98 Q85 104 74 98 Z" fill="#991b1b" stroke="#713f12" strokeWidth="2" />
                <polygon points="76,84 79,90 82,84 85,90 88,84 91,90 94,84" fill="#ffffff" />
              </g>
            ) : mood === 'thinking' ? (
              <g>
                {/* Sharp calculating golden eyes */}
                <ellipse cx="75" cy="72" rx="6" ry="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="77" cy="71" r="3.5" fill="#d97706" />
                <circle cx="78" cy="70" r="1.5" fill="#ffffff" />

                <ellipse cx="95" cy="72" rx="6" ry="6" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="93" cy="71" r="3.5" fill="#d97706" />
                <circle cx="94" cy="70" r="1.5" fill="#ffffff" />

                {/* Focused eyebrows */}
                <path d="M68 64 L79 67" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M102 64 L91 67" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />

                <ellipse cx="85" cy="85" rx="3" ry="2" fill="#713f12" />
              </g>
            ) : (
              <g>
                {/* Confident Smirking Golden Eyes */}
                <path d="M70 70 Q76 64 82 70" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="76" cy="72" r="3.5" fill="#d97706" />
                <circle cx="75" cy="70" r="1.2" fill="#ffffff" />

                <path d="M88 70 Q94 64 100 70" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="94" cy="72" r="3.5" fill="#d97706" />
                <circle cx="93" cy="70" r="1.2" fill="#ffffff" />

                <path d="M68 62 L80 64" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M102 62 L90 64" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" />

                {/* Confident grin */}
                <path d="M78 82 Q86 92 94 82" stroke="#713f12" strokeWidth="2.5" strokeLinecap="round" fill="#b91c1c" />
              </g>
            )}

            {/* Edward's Iconic Golden Hair & Braided Ponytail */}
            <g>
              {/* Back Hair & Braided Ponytail draped to the side */}
              <path
                d="M62 70 C52 90, 48 115, 52 135 C58 138, 65 125, 62 105 Z"
                fill="url(#edwardHair)"
                stroke="#a16207"
                strokeWidth="1.5"
              />

              {/* Front Bangs Split */}
              <path
                d="M58 64 C64 45, 80 40, 85 45 C90 40, 106 45, 112 64 C104 55, 96 52, 85 58 C74 52, 66 55, 58 64 Z"
                fill="url(#edwardHair)"
                stroke="#a16207"
                strokeWidth="1.8"
              />

              {/* Side Hair Strands framing face */}
              <path d="M60 62 L55 85 L65 78 Z" fill="url(#edwardHair)" />
              <path d="M110 62 L115 85 L105 78 Z" fill="url(#edwardHair)" />

              {/* The Famous Single Standing Antenna Hair (바보털 / Ahoge) that twitches! */}
              <path
                d="M85 42 Q86 20 95 12 Q90 10 82 25 Q82 35 84 42 Z"
                fill="url(#edwardHair)"
                stroke="#a16207"
                strokeWidth="2"
                className="transition-transform origin-bottom hover:rotate-12 duration-300"
              />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
