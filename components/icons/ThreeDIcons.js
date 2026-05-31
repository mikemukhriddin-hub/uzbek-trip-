import React from 'react';

export function ThreeDCar({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none" 
      className={className} 
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="carBody" x1="10" y1="20" x2="54" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="50%" stopColor="#0284c7"/>
          <stop offset="100%" stopColor="#0369a1"/>
        </linearGradient>
        <linearGradient id="carHighlight" x1="15" y1="15" x2="35" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="carGlass" x1="28" y1="15" x2="42" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3"/>
        </linearGradient>
        <radialGradient id="carWheel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#475569"/>
          <stop offset="70%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </radialGradient>
        <radialGradient id="carShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="48" rx="24" ry="6" fill="url(#carShadow)" />
      <circle cx="20" cy="44" r="8" fill="url(#carWheel)" />
      <circle cx="20" cy="44" r="4" fill="#64748b" />
      <circle cx="20" cy="44" r="2" fill="#cbd5e1" />
      <circle cx="44" cy="44" r="8" fill="url(#carWheel)" />
      <circle cx="44" cy="44" r="4" fill="#64748b" />
      <circle cx="44" cy="44" r="2" fill="#cbd5e1" />
      <path d="M6 35 C6 30, 10 26, 16 26 L22 26 L28 17 C30 14, 34 14, 38 14 L46 14 C50 14, 52 17, 54 21 L57 28 L59 30 C62 32, 62 36, 60 39 L57 43 C55 45, 52 45, 50 45 L14 45 C10 45, 7 42, 6 39 Z" fill="url(#carBody)" />
      <path d="M28 17 L36 17 L44 17 C46 17, 47 18, 48 20 L51 26 L29 26 Z" fill="url(#carGlass)" />
      <path d="M38 17 L38 26" stroke="#0284c7" strokeWidth="1.5" />
      <path d="M12 28 C12 28, 20 27, 28 27 C36 27, 45 28, 48 29 L51 32 L15 32 Z" fill="url(#carHighlight)" />
      <path d="M57 33 C58.5 33, 60 34.5, 60 36 C60 37.5, 58.5 39, 57 39 Z" fill="#fef08a" />
      <path d="M7 33 C6 33, 5 34, 5 35 C5 36, 6 37, 7 37 Z" fill="#ef4444" />
      <rect x="52" y="34" width="2" height="6" rx="1" fill="#475569" />
      <rect x="55" y="34" width="2" height="6" rx="1" fill="#475569" />
    </svg>
  );
}

export function ThreeDGuide({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none" 
      className={className} 
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="coinBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="avatarGrad" x1="16" y1="20" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0369a1"/>
        </linearGradient>
        <linearGradient id="shieldGrad" x1="38" y1="34" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="50%" stopColor="#d97706"/>
          <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodOpacity="0.5"/>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#coinBg)" stroke="#334155" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="32" cy="32" r="24" fill="#1e293b" fillOpacity="0.4" />
      <circle cx="32" cy="22" r="8" fill="url(#avatarGrad)" />
      <circle cx="32" cy="22" r="8" fill="rgba(255,255,255,0.15)" />
      <path d="M16 46 C16 38, 22 34, 32 34 C42 34, 48 38, 48 46 C48 48, 46 50, 44 50 L20 50 C18 50, 16 48, 16 46 Z" fill="url(#avatarGrad)" />
      <path d="M16 46 C16 38, 22 34, 32 34 C42 34, 48 38, 48 46" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
      <path d="M48 34 C41 34, 38 39, 38 45 C38 51, 48 56, 48 56 C48 56, 58 51, 58 45 C58 39, 55 34, 48 34 Z" fill="url(#shieldGrad)" filter="url(#dropShadow)" />
      <path d="M48 36 C43 36, 40 40, 40 45 C40 49, 48 53, 48 53 C48 53, 56 49, 56 45 C56 40, 53 36, 48 36 Z" stroke="#fef08a" strokeWidth="1" fill="none" />
      <path d="M44 45 L47 48 L52 42" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThreeDHistorical({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none" 
      className={className} 
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="domeGrad" x1="16" y1="12" x2="48" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f2fe"/>
          <stop offset="50%" stopColor="#009b9e"/>
          <stop offset="100%" stopColor="#004e50"/>
        </linearGradient>
        <linearGradient id="baseGrad" x1="12" y1="28" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffedd5"/>
          <stop offset="30%" stopColor="#fcd34d"/>
          <stop offset="100%" stopColor="#b45309"/>
        </linearGradient>
        <linearGradient id="archGrad" x1="26" y1="36" x2="38" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/>
          <stop offset="100%" stopColor="#030712"/>
        </linearGradient>
        <filter id="domeShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1" floodOpacity="0.3"/>
        </filter>
      </defs>
      <path d="M10 50 L54 50 L48 54 L16 54 Z" fill="#334155" />
      <path d="M10 50 L54 50" stroke="#475569" strokeWidth="1.5" />
      <path d="M14 30 L50 30 L50 50 L14 50 Z" fill="url(#baseGrad)" />
      <path d="M10 20 L14 20 L14 50 L10 50 Z" fill="url(#baseGrad)" />
      <path d="M9 18 L15 18 L15 20 L9 20 Z" fill="#b45309" />
      <path d="M50 20 L54 20 L54 50 L50 50 Z" fill="url(#baseGrad)" />
      <path d="M49 18 L55 18 L55 20 L49 20 Z" fill="#b45309" />
      <path d="M22 30 L42 30 L42 50 L22 50 Z" fill="#b45309" opacity="0.15" />
      <path d="M24 34 Q32 26 40 34 L40 50 L24 50 Z" fill="url(#archGrad)" />
      <path d="M24 50 L24 34 Q32 26 40 34 L40 50" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="22" y="24" width="20" height="6" fill="url(#baseGrad)" rx="1" filter="url(#domeShadow)" />
      <line x1="22" y1="27" x2="42" y2="27" stroke="#0070c0" strokeWidth="1" strokeDasharray="1 1" />
      <path d="M22 24 C22 17, 26 10, 32 6 C38 10, 42 17, 42 24 Z" fill="url(#domeGrad)" />
      <path d="M25 24 C25 18, 28 13, 32 6" stroke="#00f2fe" strokeWidth="0.8" opacity="0.7" fill="none" />
      <path d="M29 24 C29 18, 30.5 13, 32 6" stroke="#00f2fe" strokeWidth="0.8" opacity="0.7" fill="none" />
      <path d="M35 24 C35 18, 33.5 13, 32 6" stroke="#00f2fe" strokeWidth="0.8" opacity="0.7" fill="none" />
      <path d="M39 24 C39 18, 36 13, 32 6" stroke="#00f2fe" strokeWidth="0.8" opacity="0.7" fill="none" />
      <line x1="32" y1="6" x2="32" y2="2" stroke="#fcd34d" strokeWidth="1.5" />
      <circle cx="32" cy="2" r="1" fill="#fcd34d" />
    </svg>
  );
}

export function ThreeDNature({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none" 
      className={className} 
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mountLight" x1="16" y1="16" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf"/>
          <stop offset="100%" stopColor="#0d9488"/>
        </linearGradient>
        <linearGradient id="mountShadow" x1="32" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f766e"/>
          <stop offset="100%" stopColor="#115e59"/>
        </linearGradient>
        <linearGradient id="cloudGrad" x1="8" y1="24" x2="24" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.4"/>
        </linearGradient>
      </defs>
      <path d="M6 48 C20 45, 44 45, 58 48 C58 48, 50 54, 32 54 C14 54, 6 48, 6 48 Z" fill="#134e5e" />
      <path d="M6 48 C20 45, 44 45, 58 48" stroke="#0d9488" strokeWidth="1" />
      <path d="M40 26 L22 48 L40 48 Z" fill="#0284c7" />
      <path d="M40 26 L58 48 L40 48 Z" fill="#0369a1" />
      <path d="M40 26 L36 31 L40 33 L44 31 Z" fill="#f0f9ff" />
      <path d="M32 12 L10 48 L32 48 Z" fill="url(#mountLight)" />
      <path d="M32 12 L54 48 L32 48 Z" fill="url(#mountShadow)" />
      <path d="M32 12 L26 22 L32 25 L38 22 Z" fill="#ffffff" />
      <path d="M32 12 L29 17 L32 19 L35 17 Z" fill="#e0f2fe" />
      <path d="M16 48 L14 42 L18 42 Z" fill="#047857" />
      <path d="M16 43 L13 37 L19 37 Z" fill="#065f46" />
      <rect x="15.5" y="48" width="1" height="4" fill="#78350f" />
      <path d="M26 50 L22 42 L30 42 Z" fill="#059669" />
      <path d="M26 43 L23 35 L29 35 Z" fill="#047857" />
      <rect x="25" y="50" width="2" height="4" fill="#78350f" />
      <path d="M46 48 L43 40 L49 40 Z" fill="#047857" />
      <path d="M46 41 L44 35 L48 35 Z" fill="#065f46" />
      <rect x="45.5" y="48" width="1" height="4" fill="#78350f" />
      <path d="M8 32 C8 30, 10 28, 12 28 C13 28, 14 28.5, 15 29 C16 27, 19 26, 21 28 C23 28, 25 30, 24 32 C25 32, 26 33, 26 34 C26 36, 24 38, 22 38 L12 38 C9 38, 8 36, 8 32 Z" fill="url(#cloudGrad)" />
    </svg>
  );
}

export function ThreeDDining({ size = 24, className = '', style = {} }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      fill="none" 
      className={className} 
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="riceGrad" x1="18" y1="24" x2="46" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a"/>
          <stop offset="40%" stopColor="#fcd34d"/>
          <stop offset="85%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
        <linearGradient id="bowlGrad" x1="12" y1="36" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="20%" stopColor="#eff6ff"/>
          <stop offset="70%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
        <linearGradient id="meatGrad" x1="24" y1="26" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#92400e"/>
          <stop offset="100%" stopColor="#451a03"/>
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="50" rx="18" ry="4" fill="#000" opacity="0.3" />
      <ellipse cx="32" cy="48" rx="22" ry="5" fill="#f8fafc" stroke="#3b82f6" strokeWidth="1" />
      <ellipse cx="32" cy="48" rx="18" ry="3" fill="#eff6ff" stroke="#1d4ed8" strokeDasharray="1 2" />
      <path d="M16 38 C16 28, 22 20, 32 20 C42 20, 48 28, 48 38 Z" fill="url(#riceGrad)" />
      <path d="M30 18 Q33 13 36 17 C35 20, 31 20, 30 18 Z" fill="#ef4444" />
      <path d="M32 15 Q30 12 29 13 C29 13, 30 15, 30 15" stroke="#047857" strokeWidth="1" fill="none" />
      <path d="M22 30 L28 27 L30 31 L24 34 Z" fill="url(#meatGrad)" />
      <path d="M28 27 L32 29 L30 31 Z" fill="#78350f" />
      <path d="M36 28 L42 26 L44 30 L38 32 Z" fill="url(#meatGrad)" />
      <path d="M42 26 L45 28 L44 30 Z" fill="#78350f" />
      <path d="M30 29 C28 29, 28 33, 30 34 C32 35, 34 33, 34 31 C34 29, 32 29, 30 29 Z" fill="#f1f5f9" />
      <path d="M30 29 L30 27" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M24 16 Q26 10 23 6" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none" />
      <path d="M32 14 Q30 8 33 4" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
      <path d="M40 16 Q38 11 41 7" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none" />
      <path d="M14 36 C14 36, 12 44, 20 48 C28 51, 36 51, 44 48 C52 44, 50 36, 50 36 Z" fill="url(#bowlGrad)" />
      <path d="M20 43 C26 46, 38 46, 44 43" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="42" r="3" fill="#ffffff" />
      <path d="M32 39 C32 45, 32 45, 32 45" stroke="#1d4ed8" strokeWidth="1" />
      <path d="M29 42 C35 42, 35 42, 35 42" stroke="#1d4ed8" strokeWidth="1" />
    </svg>
  );
}
