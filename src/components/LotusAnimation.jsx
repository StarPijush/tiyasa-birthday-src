import React, { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Refined Petal path builder ──────────────────────────────────────────────
function petalPath(cx, cy, length, width) {
  return `M ${cx} ${cy}
    C ${cx - width * 1.2} ${cy - length * 0.3},
      ${cx - width * 0.8} ${cy - length * 0.8},
      ${cx} ${cy - length}
    C ${cx + width * 0.8} ${cy - length * 0.8},
      ${cx + width * 1.2} ${cy - length * 0.3},
      ${cx} ${cy} Z`;
}

const LAYERS = [
  {
    count: 6,
    length: 42,
    width: 10,
    rotationOffset: 0,
    startDelay: 0.4,
    stagger: 0.12,
    duration: 1.4,
    openAngle: 2,
    gradId: 'pg0',
    fromColor: '#c4687a',
    toColor: '#f5c6d6',
    opacity: 1,
  },
  {
    count: 8,
    length: 64,
    width: 15,
    rotationOffset: 22,
    startDelay: 1.2,
    stagger: 0.1,
    duration: 1.6,
    openAngle: 12,
    gradId: 'pg1',
    fromColor: '#b47fa0',
    toColor: '#fce4ec',
    opacity: 0.9,
  },
  {
    count: 10,
    length: 88,
    width: 22,
    rotationOffset: 8,
    startDelay: 2.1,
    stagger: 0.1,
    duration: 1.8,
    openAngle: 28,
    gradId: 'pg2',
    fromColor: '#8b4a70',
    toColor: '#f5c6d6',
    opacity: 0.8,
  },
  {
    count: 12,
    length: 115,
    width: 28,
    rotationOffset: 15,
    startDelay: 3.2,
    stagger: 0.08,
    duration: 2.2,
    openAngle: 45,
    gradId: 'pg3',
    fromColor: '#5c2a50',
    toColor: '#e8a0b4',
    opacity: 0.65,
  },
];

const CX = 160, CY = 160;

export default function LotusAnimation({ size = 320, onBloomComplete, onHoldingChange }) {
  const calledRef = useRef(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [blooming, setBlooming] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    onHoldingChange?.(holding);
  }, [holding, onHoldingChange]);

  // Energy ripples during hold
  useEffect(() => {
    if (!holding || blooming) return;
    const interval = setInterval(() => {
      setRipples(prev => [...prev.slice(-4), { id: Date.now(), scale: 0.5, opacity: 0.4 }]);
    }, 800);
    return () => clearInterval(interval);
  }, [holding, blooming]);

  useEffect(() => {
    if (!holding || blooming) return undefined;
    const timer = globalThis.setInterval(() => {
      setProgress(prev => {
        const next = Math.min(1, prev + 0.015);
        if (next >= 1) {
          setBlooming(true);
          setHolding(false);
        }
        return next;
      });
    }, 40);
    return () => globalThis.clearInterval(timer);
  }, [holding, blooming]);

  useEffect(() => {
    if (!blooming || calledRef.current) return undefined;
    const lastLayer = LAYERS.at(-1);
    const totalDelay = (lastLayer.startDelay + lastLayer.count * lastLayer.stagger + lastLayer.duration + 1.2) * 1000;
    const timer = globalThis.setTimeout(() => {
      calledRef.current = true;
      onBloomComplete?.();
    }, totalDelay);
    return () => globalThis.clearTimeout(timer);
  }, [blooming, onBloomComplete]);

  function release() {
    if (blooming) return;
    setHolding(false);
    setProgress(prev => Math.max(0, prev - 0.05));
  }

  const pollenDots = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const a = (360 / 12) * i;
    const r = 10;
    const rad = ((a - 90) * Math.PI) / 180;
    return {
      id: `pollen-${i}`,
      cx: CX + Math.cos(rad) * r,
      cy: CY + Math.sin(rad) * r,
      delay: i * 0.1
    };
  }), []);

  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        navigator.vibrate?.(15);
        setHolding(true);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        touchAction: 'none',
        cursor: blooming ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <AnimatePresence>
        {holding && !blooming && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.4) 0%, transparent 70%)', filter: 'blur(15px)', zIndex: 0 }}
          />
        )}
      </AnimatePresence>

      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0.5, opacity: 0.4 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(245,198,214,0.3)', zIndex: 0, pointerEvents: 'none' }}
        />
      ))}

      <motion.div
        animate={{
          opacity: blooming ? [0.4, 0.7, 0.4] : 0.15 + progress * 0.45,
          scale: blooming ? [1, 1.15, 1] : 0.8 + progress * 0.3,
        }}
        transition={{ duration: blooming ? 4 : 0.3, repeat: blooming ? Infinity : 0, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: '120%', height: '120%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.35) 0%, rgba(180,127,160,0.1) 60%, transparent 80%)', filter: 'blur(30px)', pointerEvents: 'none', zIndex: 1 }}
      />

      {!blooming && (
        <div style={{ position: 'absolute', zIndex: 10, pointerEvents: 'none' }}>
          <motion.div
            animate={{ 
              scale: holding ? 1.1 : 1,
              borderColor: holding ? 'rgba(245,198,214,0.6)' : 'rgba(245,198,214,0.2)',
              boxShadow: holding ? '0 0 40px rgba(245,198,214,0.4), inset 0 0 20px rgba(245,198,214,0.2)' : '0 0 15px rgba(245,198,214,0.1)'
            }}
            style={{ width: 100, height: 100, borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,198,214,0.03)', backdropFilter: 'blur(4px)' }}
          >
            <motion.p
              animate={{ opacity: holding ? 0 : [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ color: '#f5c6d6', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', padding: '0 10px' }}
            >
              Hold
            </motion.p>
          </motion.div>
        </div>
      )}

      <svg viewBox="0 0 320 320" width={size} height={size} style={{ position: 'relative', zIndex: 5, overflow: 'visible', filter: 'drop-shadow(0 0 15px rgba(245,198,214,0.2))' }}>
        <defs>
          {LAYERS.map(layer => (
            <radialGradient key={layer.gradId} id={layer.gradId} cx="50%" cy="80%" r="80%" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor={layer.fromColor} stopOpacity="1" />
              <stop offset="60%" stopColor={layer.toColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={layer.toColor} stopOpacity="0.4" />
            </radialGradient>
          ))}
          <radialGradient id="centerPollen" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="50%" stopColor="#f5c6d6" />
            <stop offset="100%" stopColor="#c4687a" />
          </radialGradient>
        </defs>

        {LAYERS.map((layer, layerIdx) =>
          Array.from({ length: layer.count }, (_, i) => {
            const angle = (360 / layer.count) * i + layer.rotationOffset;
            const path = petalPath(0, 0, layer.length, layer.width);
            const delay = layer.startDelay + i * layer.stagger;

            return (
              <motion.g
                key={`petal-${layerIdx}-${i}`}
                transform={`translate(${CX}, ${CY}) rotate(${angle})`}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
                initial={{ scaleY: 0, scaleX: 0.2, opacity: 0, rotateX: 85 }}
                animate={{
                  scaleY: blooming ? 1 : 0.05 + progress * 0.15,
                  scaleX: blooming ? 1 : 0.3 + progress * 0.2,
                  opacity: blooming ? layer.opacity : 0.1 + progress * 0.3,
                  rotateX: blooming ? layer.openAngle : 80 - progress * 20,
                }}
                transition={{ delay: blooming ? delay : 0, duration: blooming ? layer.duration : 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <path d={path} fill={`url(#${layer.gradId})`} style={{ transformOrigin: '0 0' }} />
                <line x1="0" y1="0" x2="0" y2={-(layer.length * 0.8)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" opacity={0.3} />
              </motion.g>
            );
          })
        )}

        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: blooming ? 1 : 0.1 + progress * 0.6, scale: blooming ? 1 : 0.5 + progress * 0.4 }}
          transition={{ delay: 4.5, duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <circle cx={CX} cy={CY} r={16} fill="url(#centerPollen)" filter="blur(2px)" />
          {pollenDots.map((dot) => (
            <motion.circle
              key={dot.id}
              cx={dot.cx}
              cy={dot.cy}
              r={1.8}
              fill="#fce4ec"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: dot.delay }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}

LotusAnimation.propTypes = {
  size: PropTypes.number,
  onBloomComplete: PropTypes.func,
  onHoldingChange: PropTypes.func
};
