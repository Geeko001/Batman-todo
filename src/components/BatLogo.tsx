import React from 'react';

interface BatLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  color?: string;
}

/**
 * Original geometric tactical delta-wing bat insignia.
 * High-precision vector designed specifically for BATMAN PROTOCOL.
 */
export const BatLogo: React.FC<BatLogoProps> = ({
  className = '',
  size = 32,
  glow = true,
  color = '#E0B34C'
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-transform duration-300 ${glow ? 'drop-shadow-[0_0_8px_rgba(224,179,76,0.5)]' : ''}`}
      >
        {/* Subtle tactical alignment grid */}
        <path
          d="M50 0L50 60"
          stroke={color}
          strokeWidth="0.5"
          strokeDasharray="2 2"
          opacity="0.2"
        />
        {/* Geometric Angular Bat Silhouette */}
        <path
          d="M 50 12
             L 53 4
             L 57 12
             L 66 10
             L 78 18
             L 94 14
             L 86 34
             L 76 38
             L 68 48
             L 56 42
             L 50 56
             L 44 42
             L 32 48
             L 24 38
             L 14 34
             L 6 14
             L 22 18
             L 34 10
             L 43 12
             L 47 4
             Z"
          fill={color}
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Central Tactical Core Notch */}
        <polygon
          points="50,22 54,32 50,38 46,32"
          fill="#0B0D12"
          stroke={color}
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
};
