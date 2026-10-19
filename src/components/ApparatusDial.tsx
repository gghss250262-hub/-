import React, { useState, useRef, useEffect } from 'react';
import { Flame, Snowflake, RotateCcw, Plus, Minus } from 'lucide-react';

interface DialProps {
  currentTemp: number; // actual simulated temperature (°C)
  targetTemp: number;  // dial set temperature (°C)
  onTargetTempChange: (temp: number) => void;
  minTemp?: number;
  maxTemp?: number;
  highlightTemp?: number; // target point (e.g. 78.3°C or 20°C)
  highlightLabel?: string;
  label?: string;
  disabled?: boolean;
}

export const ApparatusDial: React.FC<DialProps> = ({
  currentTemp,
  targetTemp,
  onTargetTempChange,
  minTemp = 0,
  maxTemp = 120,
  highlightTemp,
  highlightLabel,
  label = '가열/냉각 다이얼',
  disabled = false
}) => {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert temp to dial angle (-135deg to +135deg, span 270deg)
  const tempToAngle = (temp: number) => {
    const fraction = (temp - minTemp) / (maxTemp - minTemp);
    return -135 + fraction * 270;
  };

  const angleToTemp = (angle: number) => {
    // clamp angle between -135 and +135
    const clamped = Math.max(-135, Math.min(135, angle));
    const fraction = (clamped + 135) / 270;
    const calculated = minTemp + fraction * (maxTemp - minTemp);
    return Math.round(calculated * 10) / 10;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || !dialRef.current || disabled) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let deg = (rad * 180) / Math.PI + 90; // 0 deg is at top
    if (deg > 180) deg -= 360;
    onTargetTempChange(angleToTemp(deg));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging]);

  const targetAngle = tempToAngle(targetTemp);
  const currentAngle = tempToAngle(currentTemp);

  // Flame / Frost color based on current temp
  const getGlowColor = () => {
    if (currentTemp <= 25) return 'from-blue-500/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400';
    if (currentTemp < 70) return 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400';
    return 'from-red-600/30 to-orange-500/20 border-red-500/40 text-red-400';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col items-center select-none w-full max-w-[280px]">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          {currentTemp > 40 ? <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> : <Snowflake className="w-4 h-4 text-cyan-400" />}
          {label}
        </span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          범위: {minTemp}~{maxTemp}℃
        </span>
      </div>

      {/* Main Dial Graphic */}
      <div className="relative my-2 flex items-center justify-center">
        {/* Outer Ring with Ticks */}
        <div
          ref={dialRef}
          onPointerDown={() => !disabled && setIsDragging(true)}
          className={`relative w-40 h-40 rounded-full border-4 border-slate-700 bg-gradient-to-b from-slate-800 to-slate-950 shadow-inner flex items-center justify-center cursor-pointer transition-shadow ${
            isDragging ? 'ring-2 ring-amber-400 shadow-amber-500/30' : 'hover:border-slate-500'
          }`}
        >
          {/* Degree Ticks */}
          {[0, 20, 40, 60, 78, 100, 120].map(deg => {
            const angle = tempToAngle(deg);
            const isTarget = highlightTemp && Math.abs(deg - highlightTemp) < 2;
            return (
              <div
                key={deg}
                className="absolute w-full h-full pointer-events-none flex justify-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className={`w-1 rounded-full ${
                    isTarget ? 'h-3 bg-emerald-400 shadow-[0_0_8px_#34d399]' : deg >= 100 ? 'h-2.5 bg-red-400' : 'h-2 bg-slate-500'
                  }`}
                />
              </div>
            );
          })}

          {/* Inner Rotating Knob */}
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-700 border-2 border-slate-600 shadow-2xl flex flex-col items-center justify-center relative transition-transform duration-75"
            style={{ transform: `rotate(${targetAngle}deg)` }}
          >
            {/* Knob Pointer Indicator */}
            <div className="absolute top-2 w-2 h-4 bg-amber-400 rounded-full shadow-[0_0_8px_#fbbf24]" />
            {/* Grip Grooves */}
            <div className="w-16 h-16 rounded-full border border-slate-600/60 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-950/80 border border-amber-500/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Highlight Target Badge if available */}
          {highlightTemp !== undefined && (
            <div
              className="absolute pointer-events-none text-[9px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/60 px-1.5 py-0.5 rounded shadow-lg"
              style={{
                transform: `rotate(${tempToAngle(highlightTemp)}deg) translateY(-85px) rotate(-${tempToAngle(highlightTemp)}deg)`
              }}
            >
              {highlightLabel || `${highlightTemp}℃`}
            </div>
          )}
        </div>
      </div>

      {/* Temperature Readout Displays */}
      <div className="grid grid-cols-2 gap-2 w-full mt-2">
        <div className={`p-2 rounded-xl bg-gradient-to-b border ${getGlowColor()} text-center`}>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">현재 수온/온도</div>
          <div className="text-xl font-black font-mono tracking-tight mt-0.5">
            {currentTemp.toFixed(1)} <span className="text-xs">℃</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 border border-amber-500/40 text-center">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-300">다이얼 설정값</div>
          <div className="text-xl font-black font-mono text-amber-400 tracking-tight mt-0.5">
            {targetTemp.toFixed(0)} <span className="text-xs">℃</span>
          </div>
        </div>
      </div>

      {/* Quick Buttons for fine-tuning & presets */}
      <div className="flex items-center justify-between w-full mt-3 gap-1">
        <button
          onClick={() => onTargetTempChange(Math.max(minTemp, targetTemp - 5))}
          disabled={disabled || targetTemp <= minTemp}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
          title="-5℃"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Handy Presets */}
        <button
          onClick={() => onTargetTempChange(20)}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
            Math.abs(targetTemp - 20) < 1 ? 'bg-cyan-600 text-white ring-1 ring-cyan-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          20℃ (냉각)
        </button>
        {highlightTemp !== undefined && (
          <button
            onClick={() => onTargetTempChange(highlightTemp)}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              Math.abs(targetTemp - highlightTemp) < 1
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900'
            }`}
          >
            {highlightTemp}℃ (목표)
          </button>
        )}
        <button
          onClick={() => onTargetTempChange(100)}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
            Math.abs(targetTemp - 100) < 1 ? 'bg-red-600 text-white ring-1 ring-red-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          100℃
        </button>

        <button
          onClick={() => onTargetTempChange(Math.min(maxTemp, targetTemp + 5))}
          disabled={disabled || targetTemp >= maxTemp}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
          title="+5℃"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
