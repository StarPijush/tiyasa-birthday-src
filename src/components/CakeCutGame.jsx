import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playCutSound } from './soundManager';

// ─── Constants ────────────────────────────────────────────────────────────────
const CAKE_CX     = 160;
const CAKE_CY     = 160;
const CAKE_R      = 105;
const CUTS_NEEDED = 3;
const CUT_DELAY   = 160; // ms of "resistance" before cut finalizes

// ─── Math helpers ─────────────────────────────────────────────────────────────
function lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1, dy = y2 - y1;
  const fx = x1 - cx,  fy = y1 - cy;
  const a = dx*dx + dy*dy;
  const b = 2*(fx*dx + fy*dy);
  const c = fx*fx + fy*fy - r*r;
  let disc = b*b - 4*a*c;
  if (disc < 0) return false;
  disc = Math.sqrt(disc);
  const t1 = (-b - disc) / (2*a);
  const t2 = (-b + disc) / (2*a);
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

function dist(a, b) {
  return Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
}

// ─── Upgraded Particles ────────────────────────────────────────────────────────
function CutParticles({ x, y }) {
  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    speed: 18 + Math.random() * 40,
    size: 4 + Math.random() * 7,
    color: ['#f5c6d6','#f6d9c8','#ffffff','#e8a0b4','#d6a483','#fce4ec'][i % 6],
    gravity: 15 + Math.random() * 25,
    delay: Math.random() * 0.08,
  })), []);

  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 30 }}>
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.speed;
        const ty = Math.sin(rad) * p.speed;
        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty + p.gravity, opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.7 + Math.random() * 0.3, ease: [0.2, 0.8, 0.4, 1], delay: p.delay }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              transform: 'translate(-50%,-50%)',
              boxShadow: `0 2px ${p.size + 3}px rgba(0,0,0,0.18)`,
              willChange: 'transform, opacity'
            }}
          />
        );
      })}
    </div>
  );
}

CutParticles.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired
};

// ─── Soft piano tone on celebration ─────────────────────────────────────────
function playCelebrationTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.35);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.35 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.35 + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.35);
      osc.stop(ctx.currentTime + i * 0.35 + 2.5);
    });
  } catch (_) {}
}

export default function CakeCutGame({ onDone }) {
  const svgRef         = useRef(null);
  const pendingCutRef  = useRef(null);
  const [cuts, setCuts]           = useState([]);
  const [particles, setParticles] = useState([]);
  const [drag, setDrag]           = useState({ active: false, start: null, current: null });
  const [cakeAnim, setCakeAnim]   = useState({ shake: false, pulse: false });
  const [celebrated, setCelebrated] = useState(false);
  const [msgStep, setMsgStep]     = useState(0);
  const [cakeFading, setCakeFading] = useState(false);
  const [cuttingNow, setCuttingNow] = useState(false);
  const [knifeShadow, setKnifeShadow] = useState(null);
  const [flameLean, setFlameLean] = useState(0);
  const particleIdRef = useRef(0);

  const cakeRotateXTarget = useMotionValue(10);
  const cakeRotateYTarget = useMotionValue(0);
  const cakeRotateX = useSpring(cakeRotateXTarget, { stiffness: 120, damping: 22, mass: 0.8 });
  const cakeRotateY = useSpring(cakeRotateYTarget, { stiffness: 120, damping: 22, mass: 0.8 });

  const cameraScaleTarget = useMotionValue(1);
  const cameraScale = useSpring(cameraScaleTarget, { stiffness: 80, damping: 24 });

  useEffect(() => {
    cameraScaleTarget.set(1 + cuts.length * 0.015);
  }, [cuts.length, cameraScaleTarget]);

  const toSVG = useCallback((clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width)  * 320,
      y: ((clientY - rect.top)  / rect.height) * 320,
    };
  }, []);

  const rafCakePointerRef = useRef(null);
  const lastCakePointerRef = useRef(null);

  const onCakePointerMove = useCallback((e) => {
    if (!svgRef.current || celebrated) return;
    lastCakePointerRef.current = { clientX: e.clientX, clientY: e.clientY };

    if (!rafCakePointerRef.current) {
      rafCakePointerRef.current = requestAnimationFrame(() => {
        rafCakePointerRef.current = null;
        if (!lastCakePointerRef.current || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const dx = ((lastCakePointerRef.current.clientX - rect.left) / rect.width) - 0.5;
        const dy = ((lastCakePointerRef.current.clientY - rect.top) / rect.height) - 0.5;
        cakeRotateXTarget.set(10 - dy * 6);
        cakeRotateYTarget.set(dx * 7);
      });
    }
  }, [cakeRotateXTarget, cakeRotateYTarget, celebrated]);

  const onCakePointerLeave = useCallback(() => {
    cakeRotateXTarget.set(10);
    cakeRotateYTarget.set(0);
  }, [cakeRotateXTarget, cakeRotateYTarget]);

  const triggerCelebration = useCallback(() => {
    setCelebrated(true);
    setTimeout(() => {
      playCelebrationTone();
      const el = svgRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = (rect.left + rect.width  / 2) / window.innerWidth;
        const cy = (rect.top  + rect.height / 2) / window.innerHeight;
        confetti({ particleCount: 40, spread: 70, origin: { x: cx, y: cy }, colors: ['#f5c6d6','#fff','#b47fa0'], scalar: 0.8, gravity: 0.6 });
      }
    }, 1000);

    setTimeout(() => setMsgStep(1), 2000);
    setTimeout(() => setMsgStep(2), 3500);
    setTimeout(() => setMsgStep(3), 5000);
    setTimeout(() => setMsgStep(4), 6800);
    setTimeout(() => setCakeFading(true), 5500);
  }, []);

  const finalizeCut = useCallback((start, end) => {
    if (!start || !end || dist(start, end) < 40) return;
    if (!lineIntersectsCircle(start.x, start.y, end.x, end.y, CAKE_CX, CAKE_CY, CAKE_R)) return;

    playCutSound?.();
    navigator.vibrate?.(28);

    const el = svgRef.current;
    let px = 160, py = 160;
    if (el) {
      const rect = el.getBoundingClientRect();
      px = ((start.x + end.x) / 2 / 320) * rect.width;
      py = ((start.y + end.y) / 2 / 320) * rect.height;
    }
    const pid = particleIdRef.current++;
    setParticles(prev => [...prev, { id: pid, x: px, y: py }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 1000);

    setCakeAnim({ shake: true, pulse: true });
    setTimeout(() => setCakeAnim({ shake: false, pulse: false }), 800);

    setCuts(prev => {
      const next = [...prev, { id: pid, start, end }];
      if (next.length >= CUTS_NEEDED) {
        setTimeout(triggerCelebration, 300);
      }
      return next;
    });
  }, [triggerCelebration]);

  const onDown = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const pos = toSVG(touch.clientX, touch.clientY);
    setDrag({ active: true, start: pos, current: pos });
    setKnifeShadow({ start: pos, current: pos });
  }, [toSVG]);

  const rafMoveRef = useRef(null);
  const lastTouchRef = useRef(null);

  const onMove = useCallback((e) => {
    if (!drag.active) return;
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    lastTouchRef.current = { clientX: touch.clientX, clientY: touch.clientY };

    if (!rafMoveRef.current) {
      rafMoveRef.current = requestAnimationFrame(() => {
        rafMoveRef.current = null;
        if (!lastTouchRef.current) return;
        const pos = toSVG(lastTouchRef.current.clientX, lastTouchRef.current.clientY);
        setDrag(prev => {
          if (!prev.active) return prev;
          return { ...prev, current: pos };
        });
        setKnifeShadow(prev => prev ? { ...prev, current: pos } : null);
        if (drag.start) {
          const dx = pos.x - drag.start.x;
          setFlameLean(Math.max(-5, Math.min(5, dx / 15)));
        }
      });
    }
  }, [drag.active, drag.start, toSVG]);

  useEffect(() => {
    return () => {
      if (rafCakePointerRef.current) cancelAnimationFrame(rafCakePointerRef.current);
      if (rafMoveRef.current) cancelAnimationFrame(rafMoveRef.current);
    };
  }, []);

  const onUp = useCallback((e) => {
    if (!drag.active) return;
    e.preventDefault();
    const { start, current } = drag;
    setDrag({ active: false, start: null, current: null });
    setTimeout(() => setKnifeShadow(null), 200);
    setTimeout(() => setFlameLean(0), 450);

    if (!start || !current || dist(start, current) < 40) return;
    if (!lineIntersectsCircle(start.x, start.y, current.x, current.y, CAKE_CX, CAKE_CY, CAKE_R)) return;

    setCuttingNow(true);
    pendingCutRef.current = { start, end: current };
    setTimeout(() => {
      const cut = pendingCutRef.current;
      setCuttingNow(false);
      if (cut) finalizeCut(cut.start, cut.end);
      pendingCutRef.current = null;
    }, CUT_DELAY);
  }, [drag, finalizeCut]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('touchstart', onDown,  { passive: false });
    el.addEventListener('touchmove',  onMove,  { passive: false });
    el.addEventListener('touchend',   onUp,    { passive: false });
    return () => {
      el.removeEventListener('touchstart', onDown);
      el.removeEventListener('touchmove',  onMove);
      el.removeEventListener('touchend',   onUp);
    };
  }, [onDown, onMove, onUp]);

  const remaining = Math.max(0, CUTS_NEEDED - cuts.length);

  return (
    <div className="gpu-layer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      
      {/* Interaction Feedback */}
      <AnimatePresence mode="wait">
        {!celebrated ? (
          <motion.p
            key="inst"
            initial={{ opacity: 0 }}
            animate={{ opacity: cuttingNow ? 1 : 0.72 }}
            exit={{ opacity: 0 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#f5c6d6', letterSpacing: '0.15em', textAlign: 'center' }}
          >
            {cuttingNow ? '✂️ cutting…' : `swipe across the cake · ${remaining} slice${remaining !== 1 ? 's' : ''} to go`}
          </motion.p>
        ) : (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#f5c6d6', fontStyle: 'italic', textAlign: 'center' }}
          >
            ✨ perfectly sliced ✨
          </motion.p>
        )}
      </AnimatePresence>

      {/* Cake Container */}
      <motion.div
        onPointerMove={onCakePointerMove}
        onPointerLeave={onCakePointerLeave}
        style={{
          position: 'relative',
          width: 320,
          height: 320,
          scale: cameraScale,
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow */}
        <motion.div
          animate={{ opacity: 0.3 + cuts.length * 0.15, scale: celebrated ? 1.5 : 1 + cuts.length * 0.05 }}
          style={{ position: 'absolute', inset: -40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.5), transparent 70%)', filter: 'blur(30px)', zIndex: 0, pointerEvents: 'none' }}
        />

        {/* Cake SVG */}
        <motion.svg
          ref={svgRef}
          viewBox="0 0 320 320"
          width={320}
          height={320}
          animate={cakeAnim.shake ? { x: [0,-4,4,-3,3,0], rotate: [0,-1,1,-0.5,0.5,0] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'relative',
            zIndex: 2,
            rotateX: cakeRotateX,
            rotateY: cakeRotateY,
            transformStyle: 'preserve-3d',
            cursor: celebrated ? 'default' : 'crosshair',
            touchAction: 'none',
            filter: `drop-shadow(0 15px 40px rgba(0,0,0,0.3))`,
            opacity: cakeFading ? 0 : 1,
            transition: 'opacity 2s ease',
          }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
        >
          <defs>
            <radialGradient id="cakeTop" cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#fff0f5" />
              <stop offset="100%" stopColor="#b95475" />
            </radialGradient>
            <linearGradient id="cakeSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c86483" />
              <stop offset="100%" stopColor="#552039" />
            </linearGradient>
            <linearGradient id="cutInterior" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7a2d43" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#ffe0cf" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7a2d43" stopOpacity="0.1" />
            </linearGradient>
            <clipPath id="cakeClip">
              <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R} />
            </clipPath>
          </defs>

          {/* Simple optimized shadow */}
          <ellipse cx={CAKE_CX} cy={CAKE_CY + 32} rx={CAKE_R + 10} ry={20} fill="rgba(0,0,0,0.3)" />

          {/* Cake Body */}
          <ellipse cx={CAKE_CX} cy={CAKE_CY + 20} rx={CAKE_R} ry={CAKE_R * 0.95} fill="url(#cakeSide)" />
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R} fill="url(#cakeTop)" />

          {/* Frosting Accents (Optimized) */}
          {Array.from({ length: 12 }, (_, i) => {
            const rad = (i * 30 * Math.PI) / 180;
            return <circle key={i} cx={CAKE_CX + Math.cos(rad) * CAKE_R * 0.85} cy={CAKE_CY + Math.sin(rad) * CAKE_R * 0.85} r={4} fill="rgba(255,255,255,0.4)" />;
          })}

          {/* Candles */}
          {[[-18,-20],[0,-25],[18,-20]].map(([ox, oy], i) => (
            <g key={i}>
              <rect x={CAKE_CX + ox - 3} y={CAKE_CY + oy} width={6} height={18} rx={2} fill={['#f5c6d6','#b47fa0','#e8a0b4'][i]} />
              <motion.g
                animate={{ scale: [1, 1.1, 0.9, 1], x: flameLean * (0.7 + i * 0.1) }}
                transition={{ repeat: Infinity, duration: 0.8 + i * 0.1 }}
                style={{ transformOrigin: `${CAKE_CX + ox}px ${CAKE_CY + oy}px` }}
              >
                <ellipse cx={CAKE_CX + ox} cy={CAKE_CY + oy - 8} rx={4} ry={7} fill="#ffd54f" />
              </motion.g>
            </g>
          ))}

          {/* Rendered Cuts */}
          <g clipPath="url(#cakeClip)">
            {cuts.map((cut) => (
              <line
                key={cut.id}
                x1={cut.start.x} y1={cut.start.y}
                x2={cut.end.x}   y2={cut.end.y}
                stroke="url(#cutInterior)"
                strokeWidth={10}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Knife Shadow */}
          {knifeShadow && (
            <line
              x1={knifeShadow.start.x} y1={knifeShadow.start.y}
              x2={knifeShadow.current.x} y2={knifeShadow.current.y}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.4}
            />
          )}
        </motion.svg>

        {/* Particles Layer */}
        {particles.map(p => <CutParticles key={p.id} x={p.x} y={p.y} />)}
      </motion.div>

      {/* Messages */}
      <div style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence>
          {msgStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ textAlign: 'center', color: '#f5c6d6' }}
            >
              {msgStep === 1 && <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>Happy Birthday ❤️</h3>}
              {msgStep === 2 && <p style={{ fontStyle: 'italic' }}>I wish I was there with you…</p>}
              {msgStep === 3 && <p>But this is my way of being there.</p>}
              {msgStep === 4 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onDone}
                  className="glass-button"
                  style={{ marginTop: '0.5rem' }}
                >
                  Eat Chocolate 🍫
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

CakeCutGame.propTypes = {
  onDone: PropTypes.func.isRequired
};
