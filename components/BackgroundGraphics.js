'use client';

import React from 'react';

export default function BackgroundGraphics() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '320px',
      pointerEvents: 'none',
      zIndex: -2,
      overflow: 'hidden',
      opacity: 0.15,
    }}>
      <svg 
        viewBox="0 0 1440 320" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="mountGrad1" x1="720" y1="100" x2="720" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#009b9e" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="var(--bg-dark)" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="mountGrad2" x1="720" y1="50" x2="720" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0070c0" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="var(--bg-dark)" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="archGrad" x1="1200" y1="120" x2="1200" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--primary-blue)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--bg-dark)" stopOpacity="0.8"/>
          </linearGradient>
        </defs>
 
        {/* 🏔 Far Mountain Range (Tian Shan / Urgut hills) */}
        <path 
          d="M0 180 L150 110 L380 170 L620 70 L880 150 L1120 95 L1300 150 L1440 100 L1440 320 L0 320 Z" 
          fill="url(#mountGrad2)" 
        />
        
        {/* 🏔 Near Mountain Range */}
        <path 
          d="M0 220 L240 150 L510 205 L720 120 L980 180 L1210 130 L1440 200 L1440 320 L0 320 Z" 
          fill="url(#mountGrad1)" 
        />
 
        {/* 🕌 Faint Samarqand Architecture Silhouettes */}
        <g fill="url(#archGrad)" stroke="rgba(255, 91, 0, 0.12)" strokeWidth="1">
          {/* Left minaret of assembly */}
          <path d="M1020 320 L1020 160 L1026 160 L1026 156 L1020 156 L1020 320 Z" />
          {/* Main Arched Portal (Iwan) */}
          <path d="M1040 320 L1040 170 L1150 170 L1150 320 Z" />
          <path d="M1060 320 L1060 195 Q1095 160 1130 195 L1130 320 Z" fill="var(--bg-dark)" opacity="0.4" />
          <path d="M1060 195 Q1095 160 1130 195" fill="none" stroke="var(--primary-blue)" strokeWidth="1" opacity="0.2" />
          
          {/* The Fluted Dome */}
          <rect x="1156" y="190" width="48" height="10" rx="2" />
          <path d="M1156 190 C1156 145, 1180 115, 1180 115 C1180 115, 1204 145, 1204 190 Z" fill="#009b9e" fillOpacity="0.25" stroke="#00f2fe" strokeWidth="1" />
          {/* Fluting lines */}
          <path d="M1164 190 C1168 162, 1180 115, 1180 115" stroke="#00f2fe" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M1172 190 C1174 162, 1180 115, 1180 115" stroke="#00f2fe" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M1188 190 C1186 162, 1180 115, 1180 115" stroke="#00f2fe" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M1196 190 C1192 162, 1180 115, 1180 115" stroke="#00f2fe" strokeWidth="0.5" fill="none" opacity="0.4" />
          {/* Spire */}
          <line x1="1180" y1="115" x2="1180" y2="95" stroke="var(--primary-blue)" strokeWidth="1.5" />
          <circle cx="1180" cy="95" r="2" fill="var(--primary-blue)" />

          {/* Right minaret of assembly */}
          <path d="M1214 320 L1214 160 L1220 160 L1220 156 L1214 156 L1214 320 Z" />
        </g>
      </svg>
    </div>
  );
}
