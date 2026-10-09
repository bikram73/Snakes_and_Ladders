import React, { useMemo } from 'react';
import { SnakeData, LadderData } from '../utils/boardPresets';
import { SharkThemeConfig } from '../utils/sharkThemes';
import { computeLadderGeometry, computeSnakeGeometry } from '../utils/geometry';

interface SharkSvgLayerProps {
  theme: SharkThemeConfig;
  snakes: SnakeData[];
  ladders: LadderData[];
  boardSize?: number;
  dimension?: number;
}

export const SharkSvgLayer: React.FC<SharkSvgLayerProps> = ({
  theme,
  snakes,
  ladders,
  boardSize = 10,
  dimension = 1000,
}) => {
  // Precompute geometries
  const ladderGeoms = useMemo(() => {
    return ladders.map((l) => ({
      ...l,
      geom: computeLadderGeometry(l.bottom, l.top, boardSize, dimension),
    }));
  }, [ladders, boardSize, dimension]);

  const snakeGeoms = useMemo(() => {
    return snakes.map((s) => ({
      ...s,
      geom: computeSnakeGeometry(s.head, s.tail, boardSize, dimension),
    }));
  }, [snakes, boardSize, dimension]);

  const isClassic = theme.id === 'classic-snake';

  return (
    <svg
      viewBox={`0 0 ${dimension} ${dimension}`}
      className="absolute inset-0 w-full h-full pointer-events-none p-1.5 sm:p-2.5"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Universal Shadow */}
        <filter id="sharkDropShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.75" />
        </filter>

        <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 1. GREAT WHITE GRADIENTS */}
        <linearGradient id="gwSharkBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
        <linearGradient id="gwSharkBelly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <linearGradient id="gwLadderRail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* 2. HAMMERHEAD GRADIENTS */}
        <linearGradient id="hhSharkBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="hhSharkBelly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id="hhLadderRail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* 3. MEGALODON GRADIENTS */}
        <linearGradient id="mgSharkBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="35%" stopColor="#dc2626" />
          <stop offset="80%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id="mgSharkBelly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="mgLadderRail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>

        {/* 4. CYBER SHARK GRADIENTS */}
        <linearGradient id="cySharkBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="45%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        <linearGradient id="cySharkBelly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
        <linearGradient id="cyLadderRail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>

        {/* 5. PIRATE SHARK GRADIENTS */}
        <linearGradient id="piSharkBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="35%" stopColor="#b45309" />
          <stop offset="80%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="piSharkBelly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="piLadderRail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* 6. CLASSIC SERPENT GRADIENTS */}
        <linearGradient id="clSnakeBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <linearGradient id="clSnakeBelly" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="clLadderRail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
      </defs>

      {/* 🪜 LADDERS GROUP */}
      <g filter="url(#sharkDropShadow)">
        {ladderGeoms.map((l) => {
          const railGrad = `url(#${theme.svgDefsId.ladderRailGrad})`;
          const rungColor = theme.svgDefsId.ladderRungColor;

          return (
            <g key={l.id} className="opacity-95 hover:opacity-100 transition-opacity">
              {/* Rail 1 */}
              <line
                x1={l.geom.rail1Start.x}
                y1={l.geom.rail1Start.y}
                x2={l.geom.rail1End.x}
                y2={l.geom.rail1End.y}
                stroke={railGrad}
                strokeWidth={theme.id === 'cyber-shark' ? '6' : '8'}
                strokeLinecap="round"
                filter={theme.id === 'cyber-shark' ? 'url(#neonGlow)' : undefined}
              />
              {/* Rail 2 */}
              <line
                x1={l.geom.rail2Start.x}
                y1={l.geom.rail2Start.y}
                x2={l.geom.rail2End.x}
                y2={l.geom.rail2End.y}
                stroke={railGrad}
                strokeWidth={theme.id === 'cyber-shark' ? '6' : '8'}
                strokeLinecap="round"
                filter={theme.id === 'cyber-shark' ? 'url(#neonGlow)' : undefined}
              />
              {/* Rungs */}
              {l.geom.rungs.map((rung, idx) => (
                <line
                  key={idx}
                  x1={rung.start.x}
                  y1={rung.start.y}
                  x2={rung.end.x}
                  y2={rung.end.y}
                  stroke={rungColor}
                  strokeWidth={theme.id === 'megalodon' ? '6' : '4.5'}
                  strokeLinecap="round"
                  strokeDasharray={theme.id === 'megalodon' ? '8 3' : undefined}
                />
              ))}

              {/* Theme Anchor / Top Ornament */}
              <circle
                cx={(l.geom.rail1End.x + l.geom.rail2End.x) / 2}
                cy={(l.geom.rail1End.y + l.geom.rail2End.y) / 2}
                r="6"
                fill={rungColor}
                stroke={railGrad}
                strokeWidth="2"
              />
            </g>
          );
        })}
      </g>

      {/* 🦈 SHARKS (OR CLASSIC SNAKES) GROUP */}
      <g filter="url(#sharkDropShadow)">
        {snakeGeoms.map((s, idx) => {
          const bodyGrad = `url(#${theme.svgDefsId.sharkBodyGrad})`;
          const bellyGrad = `url(#${theme.svgDefsId.sharkUnderbellyGrad})`;

          if (isClassic) {
            // CLASSIC SERPENT
            return (
              <g key={s.id} className="opacity-95 hover:opacity-100 transition-opacity">
                <path
                  d={s.geom.pathD}
                  fill="none"
                  stroke={bodyGrad}
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx={s.geom.head.x} cy={s.geom.head.y} r="13" fill="#b91c1c" stroke="#fef08a" strokeWidth="2" />
                <circle cx={s.geom.head.x - 3} cy={s.geom.head.y - 3} r="2.5" fill="#fef08a" />
                <circle cx={s.geom.head.x + 3} cy={s.geom.head.y - 3} r="2.5" fill="#fef08a" />
                <circle cx={s.geom.head.x - 3} cy={s.geom.head.y - 3} r="1" fill="#000" />
                <circle cx={s.geom.head.x + 3} cy={s.geom.head.y - 3} r="1" fill="#000" />
                <circle cx={s.geom.tail.x} cy={s.geom.tail.y} r="4.5" fill="#fbbf24" />
              </g>
            );
          }

          // SHARK RENDERING
          const headAngle = s.geom.headAngleDeg;
          const tailAngle = s.geom.tailAngleDeg;

          return (
            <g key={s.id} className="group cursor-pointer opacity-95 hover:opacity-100 transition-opacity">
              {/* 1. Water Wake / Bubble Trail */}
              <path
                d={s.geom.pathD}
                fill="none"
                stroke={theme.id === 'cyber-shark' ? '#a855f7' : theme.id === 'megalodon' ? '#ef4444' : '#38bdf8'}
                strokeWidth="28"
                strokeOpacity="0.25"
                strokeLinecap="round"
              />

              {/* 2. Main Hydrodynamic Shark Body */}
              <path
                d={s.geom.pathD}
                fill="none"
                stroke={bodyGrad}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Shark Counter-shaded Belly Stripe */}
              <path
                d={s.geom.pathD}
                fill="none"
                stroke={bellyGrad}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="40 15"
                strokeOpacity="0.85"
              />

              {/* 4. Shark Caudal Fin (Tail at s.geom.tail) */}
              <g
                transform={`translate(${s.geom.tail.x}, ${s.geom.tail.y}) rotate(${tailAngle})`}
              >
                {/* Upper Lobe */}
                <path
                  d="M 0 0 C 8 -12, 18 -20, 26 -22 C 22 -14, 15 -8, 6 -3 Z"
                  fill={bodyGrad}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                {/* Lower Lobe */}
                <path
                  d="M 0 0 C 6 8, 14 14, 20 16 C 16 10, 11 6, 4 2 Z"
                  fill={bodyGrad}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                {/* Tail Base dot */}
                <circle cx="0" cy="0" r="3.5" fill={bellyGrad} />
              </g>

              {/* 5. Shark Head at Attack Square (s.geom.head) */}
              <g
                transform={`translate(${s.geom.head.x}, ${s.geom.head.y}) rotate(${headAngle})`}
              >
                {theme.id === 'hammerhead' ? (
                  /* HAMMERHEAD SHARK HEAD (Wide Cephalofoil) */
                  <g>
                    {/* Neck Torso */}
                    <path
                      d="M -18 -8 L -4 -16 L 4 -16 L 18 -8 L 12 12 L -12 12 Z"
                      fill={bodyGrad}
                      stroke="#064e3b"
                      strokeWidth="1.5"
                    />
                    {/* T-bar Hammerhead Wing */}
                    <path
                      d="M -26 -14 C -28 -20, -18 -24, 0 -24 C 18 -24, 28 -20, 26 -14 C 24 -9, 18 -8, 0 -8 C -18 -8, -24 -9, -26 -14 Z"
                      fill={bodyGrad}
                      stroke="#a7f3d0"
                      strokeWidth="2"
                    />
                    {/* Sensory Eyes on Lateral Tips */}
                    <circle cx="-23" cy="-15" r="3.2" fill="#fef08a" stroke="#000" strokeWidth="1" />
                    <circle cx="-23" cy="-15" r="1.3" fill="#000" />
                    <circle cx="23" cy="-15" r="3.2" fill="#fef08a" stroke="#000" strokeWidth="1" />
                    <circle cx="23" cy="-15" r="1.3" fill="#000" />

                    {/* Central Serrated Jaw */}
                    <ellipse cx="0" cy="-6" rx="9" ry="6" fill="#022c22" stroke="#6ee7b7" strokeWidth="1" />
                    {/* Teeth rows */}
                    <polygon points="-7,-6 -5,-2 -3,-6 -1,-2 1,-6 3,-2 5,-6 7,-2 6,-6" fill="#ffffff" />

                    {/* Gill Slits */}
                    <line x1="-9" y1="4" x2="-3" y2="4" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-9" y1="7" x2="-3" y2="7" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="4" x2="9" y2="4" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="7" x2="9" y2="7" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                ) : theme.id === 'cyber-shark' ? (
                  /* CYBER MECHA-SHARK HEAD (High-tech Titanium & Neon) */
                  <g filter="url(#neonGlow)">
                    {/* Armored angular head */}
                    <polygon
                      points="0,-26 18,-6 14,14 -14,14 -18,-6"
                      fill={bodyGrad}
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                    />
                    {/* Glowing Cybernetic Visor / Scanner */}
                    <rect x="-12" y="-14" width="24" height="5" rx="2" fill="#e879f9" stroke="#fdf4ff" strokeWidth="1" />
                    {/* Circuit lines */}
                    <line x1="0" y1="-22" x2="0" y2="-14" stroke="#67e8f9" strokeWidth="2" />
                    <line x1="-12" y1="-5" x2="-12" y2="8" stroke="#67e8f9" strokeWidth="1.5" />
                    <line x1="12" y1="-5" x2="12" y2="8" stroke="#67e8f9" strokeWidth="1.5" />
                    {/* Titanium Chrome Jaw */}
                    <polygon points="-9,-4 -6,2 -3,-4 0,2 3,-4 6,2 9,-4" fill="#f8fafc" stroke="#000" strokeWidth="0.8" />
                    {/* Laser core emitter dot */}
                    <circle cx="0" cy="-24" r="2.5" fill="#f43f5e" />
                  </g>
                ) : theme.id === 'megalodon' ? (
                  /* MEGALODON PREHISTORIC LEVIATHAN HEAD (Colossal & Magma) */
                  <g>
                    {/* Massive Conical Basalt Skull */}
                    <path
                      d="M 0 -28 C 14 -24, 22 -6, 18 16 L -18 16 C -22 -6, -14 -24, 0 -28 Z"
                      fill={bodyGrad}
                      stroke="#ea580c"
                      strokeWidth="2.5"
                    />
                    {/* Spiked Dorsal Crown */}
                    <polygon points="0,-33 -4,-28 4,-28" fill="#f97316" stroke="#450a0a" strokeWidth="1" />
                    <polygon points="-8,-24 -14,-22 -7,-19" fill="#dc2626" />
                    <polygon points="8,-24 14,-22 7,-19" fill="#dc2626" />

                    {/* Massive Open Blood Jaws */}
                    <path d="M -13 -6 Q 0 8 13 -6 Q 0 -12 -13 -6 Z" fill="#1c1917" stroke="#ef4444" strokeWidth="1.5" />
                    {/* Colossal Serrated Razor Teeth */}
                    <polygon points="-12,-6 -10,0 -8,-6 -6,0 -4,-6 -2,0 0,-6 2,0 4,-6 6,0 8,-6 10,0 12,-6" fill="#fef08a" stroke="#7f1d1d" strokeWidth="0.8" />

                    {/* Burning Magma Eyes */}
                    <circle cx="-10" cy="-16" r="3.5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
                    <circle cx="-10" cy="-16" r="1.8" fill="#dc2626" />
                    <circle cx="10" cy="-16" r="3.5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
                    <circle cx="10" cy="-16" r="1.8" fill="#dc2626" />

                    {/* Gills */}
                    <line x1="-12" y1="6" x2="-5" y2="6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                    <line x1="-12" y1="10" x2="-5" y2="10" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="6" x2="12" y2="6" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="10" x2="12" y2="10" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                  </g>
                ) : theme.id === 'pirate-shark' ? (
                  /* PIRATE SHARK HEAD (Tricorn & Pirate Eye-Patch) */
                  <g>
                    {/* Snout Body */}
                    <path
                      d="M 0 -24 C 12 -20, 18 -4, 15 14 L -15 14 C -18 -4, -12 -20, 0 -24 Z"
                      fill={bodyGrad}
                      stroke="#d97706"
                      strokeWidth="2"
                    />
                    {/* Pirate Tricorn Bandana */}
                    <path
                      d="M -18 -12 Q 0 -26 18 -12 L 14 -18 Q 0 -30 -14 -18 Z"
                      fill="#7f1d1d"
                      stroke="#fef08a"
                      strokeWidth="1.5"
                    />
                    {/* Jolly Roger Skull Accent on Bandana */}
                    <circle cx="0" cy="-18" r="2.5" fill="#ffffff" />

                    {/* Ferocious Jaws with Gold Tooth */}
                    <ellipse cx="0" cy="-3" rx="10" ry="7" fill="#0f172a" stroke="#b45309" strokeWidth="1" />
                    {/* Teeth with 1 Gold Tooth! */}
                    <polygon points="-8,-3 -6,2 -4,-3 -2,2 0,-3 2,2 4,-3 6,2 8,-3" fill="#ffffff" />
                    <polygon points="0,-3 2,2 4,-3" fill="#fbbf24" stroke="#78350f" strokeWidth="0.8" />

                    {/* Pirate Eye-Patch over Left Eye */}
                    <circle cx="-8" cy="-12" r="3.2" fill="#0f172a" stroke="#451a03" strokeWidth="1" />
                    <line x1="-14" y1="-14" x2="-3" y2="-10" stroke="#0f172a" strokeWidth="1.5" />

                    {/* Fierce Right Eye with Golden Glare */}
                    <circle cx="8" cy="-12" r="3.2" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
                    <circle cx="8" cy="-12" r="1.4" fill="#000000" />

                    {/* Gold Earring on Fin */}
                    <circle cx="16" cy="4" r="2.8" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
                  </g>
                ) : (
                  /* GREAT WHITE APEX PREDATOR HEAD */
                  <g>
                    {/* Streamlined Hydrodynamic Head */}
                    <path
                      d="M 0 -26 C 11 -21, 16 -4, 14 14 L -14 14 C -16 -4, -11 -21, 0 -26 Z"
                      fill={bodyGrad}
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                    {/* Snout counter-shading */}
                    <path
                      d="M 0 -24 C 6 -19, 10 -4, 9 10 L -9 10 C -10 -4, -6 -19, 0 -24 Z"
                      fill={bellyGrad}
                      opacity="0.85"
                    />
                    {/* Triangular Dorsal Fin shadow projection */}
                    <polygon points="0,-16 -6,2 6,2" fill="#0369a1" opacity="0.6" />

                    {/* Open Jaws */}
                    <ellipse cx="0" cy="-4" rx="9" ry="6.5" fill="#082f49" stroke="#38bdf8" strokeWidth="1.2" />
                    {/* Serrated Razor White Teeth */}
                    <polygon
                      points="-8,-4 -6,1.5 -4,-4 -2,1.5 0,-4 2,1.5 4,-4 6,1.5 8,-4"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="0.6"
                    />

                    {/* Predatory Dark Eyes with Glint */}
                    <circle cx="-8" cy="-14" r="2.8" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
                    <circle cx="-8.8" cy="-14.8" r="0.9" fill="#ffffff" />
                    <circle cx="8" cy="-14" r="2.8" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
                    <circle cx="7.2" cy="-14.8" r="0.9" fill="#ffffff" />

                    {/* 4 Curved Gills */}
                    <line x1="-11" y1="2" x2="-6" y2="3" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-11" y1="5" x2="-6" y2="6" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="-11" y1="8" x2="-6" y2="9" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="3" x2="11" y2="2" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="6" x2="11" y2="5" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="9" x2="11" y2="8" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                )}
              </g>

              {/* 6. Ambient Bubbles near Shark Jaws */}
              {!isClassic && (
                <g>
                  <circle
                    cx={s.geom.head.x - 14}
                    cy={s.geom.head.y - 12}
                    r="2.5"
                    fill="none"
                    stroke={theme.id === 'megalodon' ? '#f97316' : '#bae6fd'}
                    strokeWidth="1"
                    opacity="0.8"
                  />
                  <circle
                    cx={s.geom.head.x + 16}
                    cy={s.geom.head.y - 8}
                    r="1.8"
                    fill="none"
                    stroke={theme.id === 'megalodon' ? '#f97316' : '#bae6fd'}
                    strokeWidth="1"
                    opacity="0.8"
                  />
                  <circle
                    cx={s.geom.head.x + 10}
                    cy={s.geom.head.y - 20}
                    r="3.2"
                    fill="none"
                    stroke={theme.id === 'megalodon' ? '#f97316' : '#bae6fd'}
                    strokeWidth="1"
                    opacity="0.6"
                  />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};
