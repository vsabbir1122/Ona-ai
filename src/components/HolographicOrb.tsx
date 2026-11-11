import React from 'react';
import { Mic, Volume2, Sparkles } from 'lucide-react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface HolographicOrbProps {
  state: OrbState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const HolographicOrb: React.FC<HolographicOrbProps> = ({
  state,
  onClick,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24',
  }[size];

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'ওনা শুনছে...';
      case 'thinking':
        return 'ওনা ভাবছে...';
      case 'speaking':
        return 'ওনা কথা বলছে...';
      case 'idle':
      default:
        return 'ওনা জাগ্রত • বন্ধু ও অটোমেশন';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        type="button"
        title="ওনা নিউরাল কোর (ট্যাপ করে সক্রিয় করুন)"
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 focus:outline-none group`}
      >
        {/* Outer Aura Wave */}
        <div
          className={`absolute inset-0 rounded-full blur-md opacity-75 transition-all duration-700 ${
            state === 'listening'
              ? 'bg-rose-500 animate-ping'
              : state === 'thinking'
              ? 'bg-indigo-500 animate-spin'
              : state === 'speaking'
              ? 'bg-cyan-400 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-emerald-400 group-hover:opacity-100'
          }`}
        />

        {/* Outer Rotating Ring */}
        <div
          className={`absolute -inset-1 rounded-full border border-dashed transition-all duration-1000 ${
            state === 'thinking'
              ? 'border-indigo-400 animate-spin'
              : state === 'listening'
              ? 'border-rose-400 animate-pulse'
              : 'border-cyan-400/50 group-hover:border-cyan-300'
          }`}
          style={{ animationDuration: state === 'thinking' ? '2s' : '8s' }}
        />

        {/* Middle Glowing Disc */}
        <div
          className={`absolute inset-0.5 rounded-full bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-600 opacity-90 shadow-lg ${
            state === 'listening'
              ? 'from-rose-600 via-pink-500 to-amber-500'
              : state === 'thinking'
              ? 'from-indigo-600 via-purple-600 to-cyan-500'
              : ''
          }`}
        />

        {/* Inner Glass Sphere */}
        <div className="relative w-full h-full rounded-full bg-slate-950/70 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner overflow-hidden">
          {/* Internal Shimmer */}
          <div className="absolute -top-1 -left-1 w-1/2 h-1/2 bg-white/40 rounded-full blur-sm pointer-events-none" />

          {/* Center Dynamic Icon */}
          <div className="text-white z-10 transition-transform duration-300 group-hover:scale-110">
            {state === 'listening' ? (
              <Mic className="w-5 h-5 text-rose-200 animate-bounce" />
            ) : state === 'speaking' ? (
              <Volume2 className="w-5 h-5 text-cyan-200 animate-pulse" />
            ) : state === 'thinking' ? (
              <Sparkles className="w-5 h-5 text-indigo-200 animate-spin" />
            ) : (
              <span className="text-base select-none">🌸</span>
            )}
          </div>
        </div>
      </button>

      {/* Status Label (Optional display) */}
      <div className="hidden sm:flex flex-col">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'listening'
                ? 'bg-rose-400 animate-ping'
                : state === 'thinking'
                ? 'bg-indigo-400 animate-pulse'
                : state === 'speaking'
                ? 'bg-cyan-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          {getStatusText()}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {state === 'listening'
            ? 'ভয়েস শুনছি...'
            : state === 'thinking'
            ? 'প্রসেসিং ইন্টেন্ট...'
            : 'Gemini 3.8 Flash • ফুল ডিভাইস ওএস'}
        </span>
      </div>
    </div>
  );
};
