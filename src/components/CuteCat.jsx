import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Sub-Components for Cat Parts ──────────────────────────────────────────
const CatEars = ({ sad, excited, calm }) => (
  <>
    <motion.path 
      d="M55 54 L38 20 L78 44 Z" 
      fill="#f6c9d8" 
      animate={{ 
        rotate: sad ? -13 : (excited ? [1, 5, 1] : (calm ? [-1, 0, -1] : 0)), 
        y: sad ? 9 : 0 
      }} 
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }} 
      style={{ transformOrigin: '58px 55px' }} 
    />
    <motion.path 
      d="M125 54 L142 20 L102 44 Z" 
      fill="#f6c9d8" 
      animate={{ 
        rotate: sad ? 13 : (excited ? [-1, -5, -1] : (calm ? [1, 0, 1] : 0)), 
        y: sad ? 9 : 0 
      }} 
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} 
      style={{ transformOrigin: '122px 55px' }} 
    />
    <path d="M55 47 L44 28 L69 45 Z" fill="#e99ab7" opacity="0.72" />
    <path d="M125 47 L136 28 L111 45 Z" fill="#e99ab7" opacity="0.72" />
  </>
);

const CatEyes = ({ sad, excited, calm }) => {
  const eyeAnimate = sad 
    ? { scaleY: [1, 0.15, 1] } 
    : (excited ? { scaleY: [1, 1, 0.12, 1], y: [0, -1, 0] } : { scaleY: [1, 1, 0.08, 1] });

  const eyeTransition = { 
    duration: sad ? 5.4 : (calm ? 5.8 : 4.4), 
    repeat: Infinity, 
    times: sad ? undefined : [0, 0.86, 0.9, 1] 
  };

  return (
    <motion.g animate={eyeAnimate} transition={eyeTransition} style={{ transformOrigin: '90px 82px' }}>
      <path 
        d={sad ? 'M61 80 Q68 75 75 80' : (excited ? 'M61 81 Q68 90 76 81' : 'M62 80 Q68 87 75 80')} 
        stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" 
      />
      <path 
        d={sad ? 'M105 80 Q112 75 119 80' : (excited ? 'M104 81 Q112 90 120 81' : 'M105 80 Q112 87 119 80')} 
        stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" 
      />
    </motion.g>
  );
};

const CatMouth = ({ sad, calm }) => (
  <motion.path
    d={sad ? 'M78 113 Q90 104 102 113' : (calm ? 'M80 109 Q90 117 100 109' : 'M77 107 Q90 121 103 107')}
    stroke="#7b334e"
    strokeWidth="4"
    fill="none"
    strokeLinecap="round"
    animate={sad ? { y: [0, 1.8, 0], scaleX: [1, 0.92, 1] } : {}}
    transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
    style={{ transformOrigin: '90px 110px' }}
  />
);

const CatTears = ({ cryingHard }) => (
  <g>
    <motion.ellipse cx="61" cy="84" rx="9" ry="5" fill="#c8e8ff" initial={{ opacity: 0 }} animate={{ opacity: [0.15, 0.42, 0.15] }} transition={{ duration: 1.5, repeat: Infinity }} />
    <motion.ellipse cx="119" cy="84" rx="9" ry="5" fill="#c8e8ff" initial={{ opacity: 0 }} animate={{ opacity: [0.15, 0.42, 0.15] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
    {Array.from({ length: cryingHard ? 3 : 1 }).map((_, i) => (
      <motion.ellipse
        key={`tear-${i}`}
        cx={i % 2 === 1 ? 61 : 121}
        cy={92 + i * 3}
        rx="3"
        ry="6"
        fill="#c8e8ff"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: [0, 1, 0], y: [0, 22 + i * 8, 34 + i * 8] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.15, repeat: Infinity, delay: i * 0.22 }}
      />
    ))}
  </g>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CuteCat({ mood = 'happy', size = 166, cryingHard = false }) {
  const sad = mood === 'sad';
  const excited = mood === 'excited';
  const calm = mood === 'calm';

  const glowStrength = excited ? 0.36 : (calm ? 0.2 : 0.24);
  const glowRadius = excited ? 38 : (calm ? 24 : 28);

  return (
    <motion.div
      animate={{
        y: size < 100 ? [0, -3, 0] : [0, calm ? -4 : -7, 0],
        scale: sad ? [0.98, 0.955, 0.98] : [1, excited ? 1.045 : 1.018, 1],
      }}
      transition={{ duration: sad ? 1.35 : (calm ? 4.2 : 3.1), repeat: Infinity, ease: 'easeInOut' }}
      className="gpu-layer"
      style={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 0 ${glowRadius}px rgba(245,198,214,${glowStrength}))`,
      }}
    >
      {excited && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={`heart-${i}`}
              initial={{ opacity: 0, y: 12, scale: 0.65 }}
              animate={{ opacity: [0, 0.55, 0], y: [-2, -28 - i * 7], scale: [0.65, 1, 0.8] }}
              transition={{ duration: 2.8, delay: i * 0.8, repeat: Infinity, repeatDelay: 2.4 }}
              style={{ position: 'absolute', left: `${58 + i * 10}%`, top: `${18 + i * 8}%`, fontSize: size < 100 ? '0.7rem' : '0.95rem' }}
            >
              🩷
            </motion.span>
          ))}
        </div>
      )}
      <svg viewBox="0 0 180 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`catFace-${mood}-${size}`} cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fff6f9" />
            <stop offset="64%" stopColor="#f6c9d8" />
            <stop offset="100%" stopColor="#d487a5" />
          </radialGradient>
        </defs>

        <CatEars sad={sad} excited={excited} calm={calm} />
        
        <ellipse cx="90" cy="92" rx="58" ry="52" fill={`url(#catFace-${mood}-${size})`} />
        
        <motion.ellipse animate={{ opacity: excited ? [0.42, 0.72, 0.42] : (calm ? [0.28, 0.42, 0.28] : 0.38) }} transition={{ duration: 2.2, repeat: Infinity }} cx="67" cy="101" rx="10" ry="6" fill="#ef8db0" />
        <motion.ellipse animate={{ opacity: excited ? [0.42, 0.72, 0.42] : (calm ? [0.28, 0.42, 0.28] : 0.38) }} transition={{ duration: 2.2, repeat: Infinity }} cx="113" cy="101" rx="10" ry="6" fill="#ef8db0" />

        <CatEyes sad={sad} excited={excited} calm={calm} />

        <path d="M86 94 Q90 98 94 94" stroke="#9b4a65" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        <CatMouth sad={sad} calm={calm} />

        {/* Whiskers */}
        <g stroke="#9b4a65" strokeWidth="2" opacity="0.55">
          <line x1="45" y1="95" x2="24" y2="89" />
          <line x1="45" y1="104" x2="24" y2="107" />
          <line x1="135" y1="95" x2="156" y2="89" />
          <line x1="135" y1="104" x2="156" y2="107" />
        </g>

        <AnimatePresence>
          {sad && <CatTears cryingHard={cryingHard} />}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
}

CuteCat.propTypes = {
  mood: PropTypes.oneOf(['happy', 'sad', 'excited', 'calm']),
  size: PropTypes.number,
  cryingHard: PropTypes.bool
};

CatEars.propTypes = { sad: PropTypes.bool, excited: PropTypes.bool, calm: PropTypes.bool };
CatEyes.propTypes = { sad: PropTypes.bool, excited: PropTypes.bool, calm: PropTypes.bool };
CatMouth.propTypes = { sad: PropTypes.bool, calm: PropTypes.bool };
CatTears.propTypes = { cryingHard: PropTypes.bool };
