import React from 'react';

interface PaisaPlanLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
}

export const PaisaPlanLogo: React.FC<PaisaPlanLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  textSize = 'text-xl',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative shrink-0 rounded-2xl bg-gradient-to-br from-[#0B3B24] via-[#072818] to-[#04150d] p-1.5 shadow-md shadow-emerald-950/60 ring-1 ring-emerald-500/30 flex items-center justify-center overflow-hidden"
      >
        {/* Ambient subtle glow */}
        <div className="absolute inset-0 bg-radial from-emerald-500/20 via-transparent to-transparent pointer-events-none" />

        {/* Vector representation of PaisaPlan Coin + Growth Chart */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Base Connected Chart Loop */}
          <path
            d="M 38 68 C 22 68 16 54 16 42 C 16 26 28 16 42 16 C 56 16 68 26 68 42 C 68 54 58 68 42 68 L 74 68 C 76 68 77 66 77 64 L 77 50"
            stroke="#F59E0B"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ascending Trend Line */}
          <path
            d="M 46 62 L 56 46 L 68 56 L 82 32"
            stroke="#F59E0B"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upward Growth Arrow Head */}
          <path
            d="M 68 31 L 83 31 L 83 46"
            stroke="#10B981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Bar Pillars in Background */}
          <rect x="55" y="58" width="5.5" height="10" rx="1.5" fill="#10B981" opacity="0.8" />
          <rect x="66" y="52" width="5.5" height="16" rx="1.5" fill="#10B981" opacity="0.8" />
          <rect x="74" y="44" width="5.5" height="24" rx="1.5" fill="#10B981" opacity="0.8" />

          {/* Indian Rupee Symbol (₹) inside coin */}
          {/* Top bar 1 */}
          <line x1="28" y1="31" x2="48" y2="31" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
          {/* Top bar 2 */}
          <line x1="28" y1="38" x2="45" y2="38" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
          {/* Semi curve */}
          <path
            d="M 36 31 L 36 44 C 44 44 44 50 36 50 L 30 50"
            stroke="#34D399"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Diagonal leg */}
          <line x1="34" y1="50" x2="46" y2="61" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-bold tracking-tight text-white flex items-center ${textSize}`}>
            <span>Paisa</span>
            <span className="text-emerald-400">Plan</span>
          </div>
          <span className="text-[10px] text-emerald-500/80 font-medium tracking-wider uppercase -mt-0.5">
            Smart Budget & Safe Spend
          </span>
        </div>
      )}
    </div>
  );
};
