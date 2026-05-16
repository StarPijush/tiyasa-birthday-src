import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Uses the EXACT same design language as CuteCat.jsx:
// - ViewBox 0 0 180 180
// - Same face ellipse (cx=90 cy=92 rx=58 ry=52)
// - Same gradient: #fff6f9 → #f6c9d8 → #d487a5
// - Same ear paths, inner ear color, blush positions
// - Same nose, whiskers, mouth curve radius & stroke colors
// - Same glow drop-shadow treatment
// Only difference: sleeping eyes, tiny smile, headphones, pillow

export default function SleepingCat() {
  const particles = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: 18 + Math.random() * 64, // percent
    top:  15 + Math.random() * 55,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    dur:   3.5 + Math.random() * 3.5,
    dx:    (Math.random() - 0.5) * 44,
  })), []);

  const hearts = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
    id: i,
    delay: i * 1.4 + 1,
    dx: (i - 1.5) * 22,
    size: 0.55 + Math.random() * 0.3,
  })), []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 280,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    }}>

      {/* ── Deep ambient aura ── */}
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08], scale: [0.85, 1.1, 0.85] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 320, height: 200,
          background: 'radial-gradient(ellipse at center, rgba(245,198,214,0.45) 0%, transparent 70%)',
          filter: 'blur(48px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── Floating dust particles ── */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ opacity: [0, 0.55, 0], y: [0, -90], x: [0, p.dx] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top:  `${p.top}%`,
            width: p.size, height: p.size,
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '50%',
            filter: 'blur(0.8px)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Tiny drifting hearts ── */}
      {hearts.map(h => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, -110],
            x: [0, h.dx],
            scale: [0.4, h.size, 0.4],
          }}
          transition={{ duration: 5.5, repeat: Infinity, delay: h.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            fontSize: '0.8rem',
            color: 'rgba(245,198,214,0.8)',
            textShadow: '0 0 6px rgba(245,198,214,0.4)',
            zIndex: 6,
            pointerEvents: 'none',
          }}
        >
          ♥
        </motion.div>
      ))}

      {/* ── Soft pillow / cloud ── */}
      <motion.div
        animate={{ scaleX: [1, 1.025, 1], scaleY: [1, 0.97, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 50,
          width: 200,
          height: 52,
          background: 'linear-gradient(180deg, rgba(245,198,214,0.18) 0%, rgba(245,198,214,0.06) 100%)',
          borderRadius: '100px',
          border: '1px solid rgba(245,198,214,0.22)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2), inset 0 0 16px rgba(245,198,214,0.08)',
          backdropFilter: 'blur(8px)',
          zIndex: 2,
        }}
      />

      {/* ── Pillow inner glow ── */}
      <div style={{
        position: 'absolute',
        bottom: 58,
        width: 180, height: 30,
        background: 'radial-gradient(ellipse, rgba(245,198,214,0.25) 0%, transparent 70%)',
        filter: 'blur(12px)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* ══ THE CAT — same DNA as CuteCat.jsx ══ */}
      <motion.div
        animate={{ y: [0, -5, 0], scale: [1, 1.018, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="gpu-layer"
        style={{
          position: 'relative',
          zIndex: 5,
          width: 172, height: 172,
          filter: 'drop-shadow(0 0 22px rgba(245,198,214,0.28))',
        }}
      >
        {/* One-time kiss heart floats up */}
        <motion.div
          animate={{
            opacity: [0, 0, 0.9, 0.9, 0],
            y:     [0, 0, -30, -70, -120],
            x:     [0, 0,  16,  36,  60],
            scale: [0, 0, 1.3, 1.6, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            times: [0, 0.72, 0.77, 0.88, 1],
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            top: 70, left: 92,
            fontSize: '1.3rem',
            zIndex: 20,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 8px rgba(245,198,214,0.7))',
          }}
        >
          🩷
        </motion.div>

        <svg
          viewBox="0 0 180 180"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* ── Identical gradient to CuteCat ── */}
            <radialGradient id="sleepCatFace" cx="38%" cy="30%" r="72%">
              <stop offset="0%"   stopColor="#fff6f9" />
              <stop offset="64%"  stopColor="#f6c9d8" />
              <stop offset="100%" stopColor="#d487a5" />
            </radialGradient>
          </defs>

          {/* ── Ears — identical paths to CuteCat ── */}
          {/* Left ear — twitches occasionally while asleep */}
          <motion.path
            d="M55 54 L38 20 L78 44 Z"
            fill="#f6c9d8"
            animate={{ rotate: [0, 0, -6, 0, 0, 0] }}
            transition={{ duration: 7, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 0.6, 1] }}
            style={{ transformOrigin: '58px 55px' }}
          />
          {/* Right ear */}
          <motion.path
            d="M125 54 L142 20 L102 44 Z"
            fill="#f6c9d8"
            animate={{ rotate: [0, 0, 0, 0, 5, 0] }}
            transition={{ duration: 9, repeat: Infinity, times: [0, 0.5, 0.6, 0.65, 0.7, 1] }}
            style={{ transformOrigin: '122px 55px' }}
          />
          {/* Inner ear highlights — identical fill to CuteCat */}
          <path d="M55 47 L44 28 L69 45 Z" fill="#e99ab7" opacity="0.72" />
          <path d="M125 47 L136 28 L111 45 Z" fill="#e99ab7" opacity="0.72" />

          {/* ── Headphones ── */}
          {/* Band arcing over top — sits in front of ears */}
          <path
            d="M36 84 Q36 22 144 84"
            fill="none"
            stroke="#3a1528"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Left cup */}
          <rect x="25" y="76" width="18" height="28" rx="9" fill="#4b2136" />
          <rect x="28" y="80" width="12" height="20" rx="6" fill="#7b3055" opacity="0.5" />
          {/* Right cup */}
          <rect x="137" y="76" width="18" height="28" rx="9" fill="#4b2136" />
          <rect x="140" y="80" width="12" height="20" rx="6" fill="#7b3055" opacity="0.5" />

          {/* ── Face — IDENTICAL ellipse to CuteCat ── */}
          <ellipse cx="90" cy="92" rx="58" ry="52" fill="url(#sleepCatFace)" />

          {/* ── Blush cheeks — same coords as CuteCat calm mode ── */}
          <motion.ellipse
            cx="67" cy="101" rx="10" ry="6"
            fill="#ef8db0"
            animate={{ opacity: [0.28, 0.42, 0.28] }}
            transition={{ duration: 4.2, repeat: Infinity }}
          />
          <motion.ellipse
            cx="113" cy="101" rx="10" ry="6"
            fill="#ef8db0"
            animate={{ opacity: [0.28, 0.42, 0.28] }}
            transition={{ duration: 4.2, repeat: Infinity, delay: 0.3 }}
          />

          {/* ── Sleeping eyes — same arc style as CuteCat calm eyes, but lid drooped ── */}
          {/* Left eye: closed crescent */}
          <path d="M62 80 Q68 87 75 80" stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Eyelid shadow above */}
          <path d="M60 79 Q68 73 76 79" stroke="rgba(74,33,54,0.22)" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right eye */}
          <path d="M105 80 Q112 87 119 80" stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M103 79 Q112 73 121 79" stroke="rgba(74,33,54,0.22)" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* ── Nose — identical to CuteCat ── */}
          <path d="M86 94 Q90 98 94 94" stroke="#9b4a65" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* ── Tiny sleepy smile — same style as CuteCat calm mouth, smaller ── */}
          <motion.path
            d="M80 109 Q90 117 100 109"
            stroke="#7b334e"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            animate={{ d: ['M80 109 Q90 117 100 109', 'M81 110 Q90 118 99 110', 'M80 109 Q90 117 100 109'] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── Whiskers — identical coords to CuteCat ── */}
          <g stroke="#9b4a65" strokeWidth="2" opacity="0.45">
            <line x1="45" y1="95" x2="24" y2="89" />
            <line x1="45" y1="104" x2="24" y2="107" />
            <line x1="135" y1="95" x2="156" y2="89" />
            <line x1="135" y1="104" x2="156" y2="107" />
          </g>

          {/* ── Tiny 'zzz' sleep bubbles ── */}
          <motion.text
            x="118" y="58"
            fontSize="12"
            fill="#f5c6d6"
            opacity="0"
            animate={{ opacity: [0, 0.6, 0], y: [58, 40, 25], x: [118, 124, 130] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1.5, ease: 'easeOut' }}
            fontStyle="italic"
          >
            z
          </motion.text>
          <motion.text
            x="128" y="44"
            fontSize="9"
            fill="#f5c6d6"
            opacity="0"
            animate={{ opacity: [0, 0.45, 0], y: [44, 28, 14], x: [128, 136, 144] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2.2, ease: 'easeOut' }}
            fontStyle="italic"
          >
            z
          </motion.text>
        </svg>
      </motion.div>
    </div>
  );
}
