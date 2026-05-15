import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const PETAL_COUNT = 24;

const Petal = ({ layer, speedModifier = 1 }) => {
  const settings = useMemo(() => {
    switch (layer) {
      case 'background':
        return {
          size: Math.random() * 8 + 6,
          blur: Math.random() * 2 + 2,
          opacity: Math.random() * 0.1 + 0.1,
          duration: (Math.random() * 10 + 20) / speedModifier,
          delay: Math.random() * 20,
        };
      case 'mid':
        return {
          size: Math.random() * 12 + 12,
          blur: Math.random() * 1 + 1,
          opacity: Math.random() * 0.2 + 0.3,
          duration: (Math.random() * 6 + 12) / speedModifier,
          delay: Math.random() * 15,
        };
      case 'foreground':
        return {
          size: Math.random() * 15 + 25,
          blur: Math.random() * 0.5,
          opacity: Math.random() * 0.2 + 0.6,
          duration: (Math.random() * 4 + 8) / speedModifier,
          delay: Math.random() * 10,
        };
      default:
        return {};
    }
  }, [layer, speedModifier]);

  const startX = useMemo(() => Math.random() * 100, []);
  const driftX = useMemo(() => (Math.random() - 0.5) * 30, []);

  return (
    <motion.div
      initial={{ 
        top: '-15%', 
        left: `${startX}%`, 
        opacity: 0, 
        rotate: 0,
        scale: layer === 'foreground' ? 0.9 : 1
      }}
      animate={{ 
        top: '115%', 
        left: `${startX + driftX}%`, 
        opacity: [0, settings.opacity, settings.opacity, 0],
        rotate: 360,
        scale: layer === 'foreground' ? [0.9, 1.1, 0.9] : 1
      }}
      transition={{ 
        duration: settings.duration, 
        repeat: Infinity, 
        delay: settings.delay, 
        ease: "linear",
        scale: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      style={{
        position: 'absolute',
        width: `${settings.size}px`,
        height: `${settings.size}px`,
        backgroundColor: '#f3a6c0',
        borderRadius: '50% 0 50% 50%',
        filter: `blur(${settings.blur}px)`,
        zIndex: layer === 'background' ? 0 : layer === 'mid' ? 5 : 15,
        pointerEvents: 'none',
      }}
    />
  );
};

const FloatingPetals = ({ count = PETAL_COUNT, speedModifier = 1 }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 1,
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(42, 15, 31, 0.3) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      {[...Array(count)].map((_, i) => {
        let layer = 'mid';
        if (i < count * 0.4) layer = 'background';
        else if (i > count * 0.8) layer = 'foreground';
        return <Petal key={i} layer={layer} speedModifier={speedModifier} />;
      })}
    </div>
  );
};

export default FloatingPetals;
