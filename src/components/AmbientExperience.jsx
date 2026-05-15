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
    delay: 3 + index * 4.8 + Math.random() * 8,
    duration: 16 + Math.random() * 10,
    driftX: (Math.random() - 0.5) * 52,
    driftY: (Math.random() - 0.5) * 36,
    size: 0.68 + Math.random() * 0.28,
  }), [index]);

  return (
    <motion.span
      className="memory-fragment"
      initial={{ opacity: 0, x: 0, y: 0, filter: 'blur(8px)' }}
      animate={{
        opacity: [0, 0, 0.16, 0.09, 0],
        x: settings.driftX,
        y: settings.driftY,
        filter: ['blur(8px)', 'blur(5px)', 'blur(3px)', 'blur(7px)'],
      }}
      transition={{
        duration: settings.duration,
        delay: settings.delay,
        repeat: Infinity,
        repeatDelay: 18 + Math.random() * 20,
        ease: 'easeInOut',
      }}
      style={{
        left: `${settings.left}%`,
        top: `${settings.top}%`,
        fontSize: `${settings.size}rem`,
      }}
    >
      {text}
    </motion.span>
  );
}

export default function AmbientExperience() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 28, damping: 18, mass: 1.2 });
  const y = useSpring(rawY, { stiffness: 28, damping: 18, mass: 1.2 });

  useEffect(() => {
    const root = document.documentElement;
    const unsubscribeX = x.on('change', value => root.style.setProperty('--tilt-x', value.toFixed(2)));
    const unsubscribeY = y.on('change', value => root.style.setProperty('--tilt-y', value.toFixed(2)));

    function handlePointer(e) {
      rawX.set(((e.clientX / window.innerWidth) - 0.5) * 10);
      rawY.set(((e.clientY / window.innerHeight) - 0.5) * 10);
    }

    function handleOrientation(e) {
      if (typeof e.gamma === 'number') rawX.set(Math.max(-1, Math.min(1, e.gamma / 24)) * 10);
      if (typeof e.beta === 'number') rawY.set(Math.max(-1, Math.min(1, (e.beta - 45) / 32)) * 10);
    }

    function handlePulse(event) {
      const strength = event.detail?.strength ?? 0.45;
      root.style.setProperty('--music-pulse', strength.toFixed(2));
      window.setTimeout(() => root.style.setProperty('--music-pulse', '0'), 420);
    }

    window.addEventListener('pointermove', handlePointer);
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('ambient-pulse', handlePulse);

    return () => {
      unsubscribeX();
      unsubscribeY();
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('ambient-pulse', handlePulse);
    };
  }, [rawX, rawY, x, y]);

  return (
    <div className="ambient-experience" aria-hidden="true">
      <div className="cinematic-drift">
        <div className="ambient-light ambient-light-one" />
        <div className="ambient-light ambient-light-two" />
        <div className="dust-field dust-field-a" />
        <div className="dust-field dust-field-b" />
        <div className="light-rays" />
        {FRAGMENTS.map((fragment, index) => (
          <MemoryFragment key={`${fragment}-${index}`} text={fragment} index={index} />
        ))}
      </div>
    </div>
  );
}
