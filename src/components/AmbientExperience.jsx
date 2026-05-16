import React, { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const FRAGMENTS = [
  '2:14 AM',
  'sleep first',
  'dummy',
  'call me when free',
  'you there?',
  'yeah... exactly that.',
  'goodnight <3',
  'did you eat?',
  'typing...',
  'stay a little?',
];

function MemoryFragment({ text, index }) {
  const settings = useMemo(() => ({
    left: 8 + Math.random() * 84,
    top: 8 + Math.random() * 82,
    delay: 3 + index * 4 + Math.random() * 6,
    duration: 18 + Math.random() * 12,
    driftX: (Math.random() - 0.5) * 40,
    driftY: (Math.random() - 0.5) * 30,
    size: 0.7 + Math.random() * 0.2,
  }), [index]);

  return (
    <motion.span
      className="memory-fragment gpu-layer"
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 0, 0.12, 0.08, 0],
        x: settings.driftX,
        y: settings.driftY,
      }}
      transition={{
        duration: settings.duration,
        delay: settings.delay,
        repeat: Infinity,
        repeatDelay: 15 + Math.random() * 15,
        ease: 'easeInOut',
      }}
      style={{
        position: 'fixed',
        left: `${settings.left}%`,
        top: `${settings.top}%`,
        fontSize: `${settings.size}rem`,
        color: 'rgba(245,198,214,0.4)',
        pointerEvents: 'none',
        zIndex: 0,
        fontStyle: 'italic',
        letterSpacing: '0.05em',
        willChange: 'transform, opacity'
      }}
    >
      {text}
    </motion.span>
  );
}

export default function AmbientExperience() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 20, damping: 25, mass: 1.5 });
  const y = useSpring(rawY, { stiffness: 20, damping: 25, mass: 1.5 });

  useEffect(() => {
    const root = document.documentElement;
    const unsubscribeX = x.on('change', value => root.style.setProperty('--tilt-x', value.toFixed(2)));
    const unsubscribeY = y.on('change', value => root.style.setProperty('--tilt-y', value.toFixed(2)));

    function handlePointer(e) {
      rawX.set(((e.clientX / window.innerWidth) - 0.5) * 8);
      rawY.set(((e.clientY / window.innerHeight) - 0.5) * 8);
    }

    function handleOrientation(e) {
      if (typeof e.gamma === 'number') rawX.set(Math.max(-1, Math.min(1, e.gamma / 20)) * 8);
      if (typeof e.beta === 'number') rawY.set(Math.max(-1, Math.min(1, (e.beta - 45) / 30)) * 8);
    }

    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });

    return () => {
      unsubscribeX();
      unsubscribeY();
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [rawX, rawY, x, y]);

  return (
    <div className="ambient-experience gpu-layer" aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {FRAGMENTS.map((fragment, index) => (
        <MemoryFragment key={`${fragment}-${index}`} text={fragment} index={index} />
      ))}
    </div>
  );
}
