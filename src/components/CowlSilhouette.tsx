import React from 'react';

interface CowlSilhouetteProps {
  variant: string;
  size?: number;
  color?: string;
  glow?: boolean;
  className?: string;
}

export const CowlSilhouette: React.FC<CowlSilhouetteProps> = ({
  variant,
  size = 64,
  color = '#E0B34C',
  glow = true,
  className = ''
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full transition-all duration-300 ${glow ? 'drop-shadow-[0_0_12px_rgba(224,179,76,0.4)]' : ''}`}
      >
        {/* Silhouette Base */}
        <defs>
          <linearGradient id={`grad-${variant}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E2638" />
            <stop offset="1" stopColor="#0E121A" />
          </linearGradient>
        </defs>

        {/* Head/Cowl Contour */}
        {variant === 'cowl-recruit' && (
          <g>
            {/* Recruit / Initiate Hood */}
            <path
              d="M 50 15 L 68 25 L 75 55 L 70 78 L 50 88 L 30 78 L 25 55 L 32 25 Z"
              fill={`url(#grad-${variant})`}
              stroke={color}
              strokeWidth="2"
            />
            {/* Subdued slit eyes */}
            <polygon points="40,50 46,52 41,54" fill={color} opacity="0.8" />
            <polygon points="60,50 54,52 59,54" fill={color} opacity="0.8" />
          </g>
        )}

        {variant === 'cowl-detective' && (
          <g>
            {/* Short sharp ears */}
            <polygon points="32,32 30,12 40,25" fill="#141924" stroke={color} strokeWidth="1.5" />
            <polygon points="68,32 70,12 60,25" fill="#141924" stroke={color} strokeWidth="1.5" />
            {/* Cowl plate */}
            <path
              d="M 40 25 L 60 25 L 74 38 L 74 65 L 64 82 L 50 90 L 36 82 L 26 65 L 26 38 Z"
              fill={`url(#grad-${variant})`}
              stroke={color}
              strokeWidth="2"
            />
            {/* Tactical Brow line */}
            <path d="M 32 46 L 50 52 L 68 46" stroke={color} strokeWidth="2" fill="none" />
            {/* Glowing Angled Lenses */}
            <polygon points="36,50 46,53 43,57 35,53" fill={color} />
            <polygon points="64,50 54,53 57,57 65,53" fill={color} />
          </g>
        )}

        {variant === 'cowl-vigilante' && (
          <g>
            {/* Aggressive angled ears */}
            <polygon points="28,34 22,8 38,24" fill="#141924" stroke={color} strokeWidth="2" />
            <polygon points="72,34 78,8 62,24" fill="#141924" stroke={color} strokeWidth="2" />
            {/* Reinforced jaw guard */}
            <path
              d="M 38 24 L 62 24 L 78 40 L 75 70 L 64 85 L 50 92 L 36 85 L 25 70 L 22 40 Z"
              fill={`url(#grad-${variant})`}
              stroke={color}
              strokeWidth="2.2"
            />
            {/* Forehead ballistic reinforcement plate */}
            <polygon points="40,28 60,28 56,38 44,38" fill="#242E42" stroke={color} strokeWidth="1" />
            {/* Lenses */}
            <polygon points="33,48 45,52 42,56 32,52" fill={color} />
            <polygon points="67,48 55,52 58,56 68,52" fill={color} />
          </g>
        )}

        {variant === 'cowl-guardian' && (
          <g>
            {/* Sonar Sensor Fins */}
            <polygon points="26,30 18,6 36,22" fill="#141924" stroke="#5BC69A" strokeWidth="2" />
            <polygon points="74,30 82,6 64,22" fill="#141924" stroke="#5BC69A" strokeWidth="2" />
            <path
              d="M 36 22 L 64 22 L 80 40 L 76 72 L 65 88 L 50 94 L 35 88 L 24 72 L 20 40 Z"
              fill={`url(#grad-${variant})`}
              stroke="#5BC69A"
              strokeWidth="2.2"
            />
            {/* Sonar mapping pulse rings */}
            <circle cx="50" cy="50" r="14" stroke="#5BC69A" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="50" cy="50" r="24" stroke="#5BC69A" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
            {/* Lenses */}
            <polygon points="34,48 46,52 43,56 33,52" fill="#5BC69A" />
            <polygon points="66,48 54,52 57,56 67,52" fill="#5BC69A" />
          </g>
        )}

        {variant === 'cowl-dark-knight' && (
          <g>
            {/* High-tension carbon titanium horns */}
            <polygon points="26,32 16,4 36,20" fill="#141924" stroke={color} strokeWidth="2.5" />
            <polygon points="74,32 84,4 64,20" fill="#141924" stroke={color} strokeWidth="2.5" />
            {/* Heavy multi-panel armor plates */}
            <path
              d="M 36 20 L 64 20 L 82 38 L 78 74 L 66 90 L 50 96 L 34 90 L 22 74 L 18 38 Z"
              fill={`url(#grad-${variant})`}
              stroke={color}
              strokeWidth="2.5"
            />
            {/* Nose bridge and cheek contours */}
            <path d="M 50 38 L 50 64 L 42 70" stroke={color} strokeWidth="1.8" />
            <path d="M 50 64 L 58 70" stroke={color} strokeWidth="1.8" />
            {/* Piercing tactical golden lenses */}
            <polygon points="32,48 45,53 41,58 30,53" fill={color} />
            <polygon points="68,48 55,53 59,58 70,53" fill={color} />
            {/* Chin strap clamp */}
            <rect x="46" y="86" width="8" height="4" fill={color} rx="1" />
          </g>
        )}

        {variant === 'cowl-legend' && (
          <g>
            {/* Mythic Paragon silhouette with crown-like titanium crest */}
            <polygon points="24,30 14,2 34,18" fill="#202A3C" stroke="#F3F5F7" strokeWidth="2.5" />
            <polygon points="76,30 86,2 66,18" fill="#202A3C" stroke="#F3F5F7" strokeWidth="2.5" />
            <polygon points="46,16 50,6 54,16" fill={color} stroke={color} strokeWidth="1.5" />
            <path
              d="M 34 18 L 66 18 L 84 36 L 80 74 L 66 92 L 50 98 L 34 92 L 20 74 L 16 36 Z"
              fill="#101520"
              stroke="#F3F5F7"
              strokeWidth="2.5"
            />
            {/* Radiant golden inner visor */}
            <polygon points="30,46 46,52 41,58 28,52" fill={color} />
            <polygon points="70,46 54,52 59,58 72,52" fill={color} />
            {/* Center crest glow */}
            <circle cx="50" cy="38" r="4" fill={color} />
          </g>
        )}

        {/* Fallback if unknown variant */}
        {!['cowl-recruit', 'cowl-detective', 'cowl-vigilante', 'cowl-guardian', 'cowl-dark-knight', 'cowl-legend'].includes(variant) && (
          <g>
            <polygon points="30,30 24,10 38,22" fill="#141924" stroke={color} strokeWidth="2" />
            <polygon points="70,30 76,10 62,22" fill="#141924" stroke={color} strokeWidth="2" />
            <path
              d="M 38 22 L 62 22 L 76 38 L 74 68 L 64 84 L 50 90 L 36 84 L 26 68 L 24 38 Z"
              fill={`url(#grad-${variant})`}
              stroke={color}
              strokeWidth="2"
            />
            <polygon points="34,48 44,52 41,56 33,52" fill={color} />
            <polygon points="66,48 56,52 59,56 67,52" fill={color} />
          </g>
        )}
      </svg>
    </div>
  );
};
