import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import confetti from 'canvas-confetti';
import { playCutSound } from './soundManager';

// ─── Constants ────────────────────────────────────────────────────────────────
const CAKE_CX     = 160;
const CAKE_CY     = 160;
const CAKE_R      = 105;
const CUTS_NEEDED = 3;
const CUT_DELAY   = 180; // ms of "resistance" before cut finalizes

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
  const count = 14;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    speed: 18 + Math.random() * 40,
    size: 4 + Math.random() * 7,
    color: ['#f5c6d6','#f6d9c8','#ffffff','#e8a0b4','#d6a483','#fce4ec'][i % 6],
    gravity: 15 + Math.random() * 25,
    delay: Math.random() * 0.08,
  }));

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
              boxShadow: `0 2px ${p.size + 3}px rgba(0,0,0,0.28)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Soft piano tone on celebration ─────────────────────────────────────────
function playCelebrationTone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C E G C E
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CakeCutGame({ onDone }) {
  const svgRef         = useRef(null);
  const pendingCutRef  = useRef(null);
  const [cuts, setCuts]           = useState([]);
  const [particles, setParticles] = useState([]);
  const [drag, setDrag]           = useState({ active: false, start: null, current: null });
  const [cakeAnim, setCakeAnim]   = useState({ shake: false, pulse: false });
  const [celebrated, setCelebrated] = useState(false);
  const [msgStep, setMsgStep]     = useState(0); // 0=none 1=line1 2=line2 3=line3 4=button
  const [cakeFading, setCakeFading] = useState(false);
  const [cuttingNow, setCuttingNow] = useState(false);
  const [knifeShadow, setKnifeShadow] = useState(null);
  const [flameLean, setFlameLean] = useState(0);
  const particleIdRef = useRef(0);

  const cakeRotateXTarget = useMotionValue(10);
  const cakeRotateYTarget = useMotionValue(0);
  const cakeRotateX = useSpring(cakeRotateXTarget, { stiffness: 90, damping: 18, mass: 0.7 });
  const cakeRotateY = useSpring(cakeRotateYTarget, { stiffness: 90, damping: 18, mass: 0.7 });

  // Camera zoom spring
  const cameraScale = useSpring(1, { stiffness: 60, damping: 20 });
  useEffect(() => {
    // Subtle zoom-in as cuts accumulate
    cameraScale.set(1 + cuts.length * 0.016);
  }, [cuts.length, cameraScale]);

  // ── Coordinate mapping ──────────────────────────────────────────────────────
  const toSVG = useCallback((clientX, clientY) => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width)  * 320,
      y: ((clientY - rect.top)  / rect.height) * 320,
    };
  }, []);

  const onCakePointerMove = useCallback((e) => {
    if (!svgRef.current || celebrated) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width) - 0.5;
    const dy = ((e.clientY - rect.top) / rect.height) - 0.5;
    cakeRotateXTarget.set(10 - dy * 5);
    cakeRotateYTarget.set(dx * 6);
  }, [cakeRotateXTarget, cakeRotateYTarget, celebrated]);

  const onCakePointerLeave = useCallback(() => {
    cakeRotateXTarget.set(10);
    cakeRotateYTarget.set(0);
  }, [cakeRotateXTarget, cakeRotateYTarget]);

  // ── Cinematic Celebration Sequence ──────────────────────────────────────────
  const triggerCelebration = useCallback(() => {
    setCelebrated(true);

    // Let the cake settle first, then let the magic arrive.
    setTimeout(() => {
      playCelebrationTone();
      const el = svgRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = (rect.left + rect.width  / 2) / window.innerWidth;
        const cy = (rect.top  + rect.height / 2) / window.innerHeight;
        confetti({ particleCount: 34, spread: 64, origin: { x: cx, y: cy }, colors: ['#f5c6d6','#fff','#b47fa0'], scalar: 0.78, gravity: 0.55 });
        setTimeout(() => confetti({ particleCount: 22, spread: 72, origin: { x: cx, y: cy - 0.08 }, colors: ['#fff','#f5c6d6'], angle: 90, scalar: 0.62, gravity: 0.45 }), 620);
      }
    }, 1000);

    // Staggered emotional text lines
    setTimeout(() => setMsgStep(1), 1900); // "Happy Birthday ❤️"
    setTimeout(() => setMsgStep(2), 3300); // "I wish I was there with you…"
    setTimeout(() => setMsgStep(3), 4700); // "But this is my way of being there."
    setTimeout(() => setMsgStep(4), 6400); // Show CTA button

    // Cake gently fades after messages begin
    setTimeout(() => setCakeFading(true), 5000);
  }, []);

  // ── Finalize a cut (after resistance delay) ─────────────────────────────────
  const finalizeCut = useCallback((start, end) => {
    if (!start || !end || dist(start, end) < 40) return;
    if (!lineIntersectsCircle(start.x, start.y, end.x, end.y, CAKE_CX, CAKE_CY, CAKE_R)) return;

    playCutSound?.();
    navigator.vibrate?.(24);

    // Spark position in container px
    const el = svgRef.current;
    let px = 160, py = 160;
    if (el) {
      const rect = el.getBoundingClientRect();
      px = ((start.x + end.x) / 2 / 320) * rect.width;
      py = ((start.y + end.y) / 2 / 320) * rect.height;
    }
    const pid = particleIdRef.current++;
    setParticles(prev => [...prev, { id: pid, x: px, y: py }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 900);

    // Shake + pulse
    setCakeAnim({ shake: true, pulse: true });
    setTimeout(() => setCakeAnim({ shake: false, pulse: false }), 700);

    setCuts(prev => {
      const next = [...prev, { start, end }];
      if (next.length >= CUTS_NEEDED) {
        setTimeout(triggerCelebration, 250);
      }
      return next;
    });
  }, [triggerCelebration]);

  // ── Pointer handlers ────────────────────────────────────────────────────────
  const getCoords = (e) => {
    if (e.touches) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const onDown = useCallback((e) => {
    e.preventDefault();
    const { clientX, clientY } = getCoords(e);
    const pos = toSVG(clientX, clientY);
    setDrag({ active: true, start: pos, current: pos });
    setKnifeShadow({ start: pos, current: pos });
  }, [toSVG]);

  const onMove = useCallback((e) => {
    if (!drag.active) return;
    e.preventDefault();
    const { clientX, clientY } = getCoords(e);
    const pos = toSVG(clientX, clientY);
    setDrag(prev => ({ ...prev, current: pos }));
    setKnifeShadow(prev => prev ? { ...prev, current: pos } : null);
    if (drag.start) {
      const dx = pos.x - drag.start.x;
      setFlameLean(Math.max(-4, Math.min(4, dx / 18)));
    }
  }, [drag.active, drag.start, toSVG]);

  const onUp = useCallback((e) => {
    if (!drag.active) return;
    e.preventDefault();
    const { start, current } = drag;
    setDrag({ active: false, start: null, current: null });
    setTimeout(() => setKnifeShadow(null), 180);
    setTimeout(() => setFlameLean(0), 420);

    if (!start || !current || dist(start, current) < 40) return;
    if (!lineIntersectsCircle(start.x, start.y, current.x, current.y, CAKE_CX, CAKE_CY, CAKE_R)) return;

    // Resistance delay
    setCuttingNow(true);
    pendingCutRef.current = { start, end: current };
    setTimeout(() => {
      const cut = pendingCutRef.current;
      setCuttingNow(false);
      if (cut) finalizeCut(cut.start, cut.end);
      pendingCutRef.current = null;
    }, CUT_DELAY);
  }, [drag, finalizeCut]);

  // Touch listeners
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

  // ── Cake SVG animation props ────────────────────────────────────────────────
  const shakeVariants = {
    idle:   { x: 0, rotate: 0, scale: 1 },
    shake:  { x: [0,-5,5,-4,4,0], rotate: [0,-1.5,1.5,-1,1,0], scale: [1, 1.05, 1] },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>

      {/* Instruction */}
      <AnimatePresence mode="wait">
        {!celebrated ? (
          <motion.p
            key="inst"
            initial={{ opacity: 0 }}
            animate={{ opacity: cuttingNow ? 1 : 0.7 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.83rem',
              color: '#f5c6d6',
              letterSpacing: '0.15em',
              textAlign: 'center',
              transition: 'opacity 0.2s',
            }}
          >
            {cuttingNow
              ? '✂️ cutting…'
              : `swipe across the cake · ${remaining} slice${remaining !== 1 ? 's' : ''} to go`}
          </motion.p>
        ) : (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', color: '#f5c6d6', fontStyle: 'italic', textAlign: 'center' }}
          >
            ✨ perfectly sliced ✨
          </motion.p>
        )}
      </AnimatePresence>

      {/* Vignette on celebration */}
      <AnimatePresence>
        {celebrated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeIn' }}
            style={{
              position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
              background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.55) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Cake container with camera zoom */}
      <motion.div
        onPointerMove={onCakePointerMove}
        onPointerLeave={onCakePointerLeave}
        style={{
          position: 'relative',
          width: 320,
          height: 320,
          scale: cameraScale,
          perspective: 900,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Ambient glow — deepens with each cut */}
        <motion.div
          animate={{
            opacity: 0.3 + cuts.length * 0.18,
            scale: celebrated ? 1.4 : 1 + cuts.length * 0.03,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: -30,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,198,214,0.6) 0%, transparent 70%)',
            filter: 'blur(25px)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Soft surface shadow that makes the cake feel lifted */}
        <motion.div
          animate={{
            opacity: celebrated ? 0.46 : 0.28 + cuts.length * 0.05,
            scaleX: celebrated ? 1.06 : 1,
            y: celebrated ? 8 : 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 36,
            right: 36,
            bottom: 25,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            filter: 'blur(18px)',
            transform: 'translateZ(-70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Cake SVG */}
        <AnimatePresence>
          {knifeShadow?.start && knifeShadow?.current && (
            <motion.svg
              viewBox="0 0 320 320"
              width={320}
              height={320}
              initial={{ opacity: 0 }}
              animate={{ opacity: cuttingNow ? 0.46 : 0.24 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', filter: 'blur(1px)' }}
            >
              <defs>
                <linearGradient id="knifeShadowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="52%" stopColor="rgba(0,0,0,0.62)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>
              </defs>
              <line
                x1={knifeShadow.start.x + 8}
                y1={knifeShadow.start.y + 10}
                x2={knifeShadow.current.x + 8}
                y2={knifeShadow.current.y + 10}
                stroke="url(#knifeShadowGrad)"
                strokeWidth={8}
                strokeLinecap="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        <motion.svg
          ref={svgRef}
          viewBox="0 0 320 320"
          width={320}
          height={320}
          variants={shakeVariants}
          animate={cakeAnim.shake ? 'shake' : 'idle'}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            zIndex: 2,
            rotateX: cakeRotateX,
            rotateY: cakeRotateY,
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 58%',
            cursor: celebrated ? 'default' : 'crosshair',
            touchAction: 'none',
            userSelect: 'none',
            filter: `drop-shadow(0 10px 35px rgba(245,198,214,${0.12 + cuts.length * 0.09}))`,
            opacity: cakeFading ? 0 : 1,
            transition: 'opacity 2.5s ease',
          }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
        >
          <defs>
            <radialGradient id="cakeTop" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stopColor="#fff0f5" />
              <stop offset="38%"  stopColor="#f6bfd1" />
              <stop offset="72%"  stopColor="#dc7899" />
              <stop offset="100%" stopColor="#b95475" />
            </radialGradient>
            <linearGradient id="cakeSide" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c86483" />
              <stop offset="42%" stopColor="#9f435f" />
              <stop offset="100%" stopColor="#552039" />
            </linearGradient>
            <linearGradient id="cutInterior" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7a2d43" stopOpacity="0.08" />
              <stop offset="18%" stopColor="#7a2d43" stopOpacity="0.5" />
              <stop offset="34%" stopColor="#f1c1a9" stopOpacity="0.82" />
              <stop offset="50%" stopColor="#ffe0cf" stopOpacity="0.92" />
              <stop offset="66%" stopColor="#f0bad0" stopOpacity="0.86" />
              <stop offset="82%" stopColor="#7a2d43" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#7a2d43" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="frostingLayer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff4f7" stopOpacity="0" />
              <stop offset="35%" stopColor="#fff4f7" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#fff4f7" stopOpacity="0.72" />
              <stop offset="65%" stopColor="#fff4f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fff4f7" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="bladeTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="48%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(245,198,214,0)" />
            </linearGradient>
            <radialGradient id="cakeHighlight" cx="35%" cy="30%" r="40%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.45)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="cakeInnerShadow" cx="60%" cy="65%" r="55%">
              <stop offset="0%"   stopColor="rgba(80,20,50,0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="cakeCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fce4ec" />
              <stop offset="100%" stopColor="#c4687a" />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
              <feOffset dx="0" dy="8" result="offset" />
              <feMerge><feMergeNode in="offset" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glowF">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="particleGlow">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softSeamBlur">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id="frostingTexture" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.075" numOctaves="3" seed="7" />
              <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.78  0 0 0 0 0.86  0 0 0 0.18 0" />
            </filter>
            <clipPath id="cakeClip">
              <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R} />
            </clipPath>
          </defs>

          {/* Plate shadow */}
          <ellipse cx={CAKE_CX} cy={CAKE_CY + 31} rx={CAKE_R + 24} ry={24} fill="rgba(0,0,0,0.34)" />

          {/* Visible cake side wall / frosting thickness */}
          <g opacity={cakeFading ? 0 : 1}>
            <ellipse cx={CAKE_CX} cy={CAKE_CY + 22} rx={CAKE_R} ry={CAKE_R * 0.94} fill="url(#cakeSide)" />
            <ellipse cx={CAKE_CX} cy={CAKE_CY + 16} rx={CAKE_R - 2} ry={CAKE_R * 0.92} fill="rgba(132,52,78,0.62)" />
            <ellipse cx={CAKE_CX} cy={CAKE_CY + 7} rx={CAKE_R - 1} ry={CAKE_R * 0.9} fill="rgba(255,207,222,0.2)" />
            <path
              d={`M ${CAKE_CX - CAKE_R + 9} ${CAKE_CY + 28}
                C ${CAKE_CX - 58} ${CAKE_CY + 56}, ${CAKE_CX + 58} ${CAKE_CY + 56}, ${CAKE_CX + CAKE_R - 9} ${CAKE_CY + 28}`}
              fill="none"
              stroke="rgba(255,220,232,0.28)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d={`M ${CAKE_CX - CAKE_R + 18} ${CAKE_CY + 40}
                C ${CAKE_CX - 45} ${CAKE_CY + 64}, ${CAKE_CX + 45} ${CAKE_CY + 64}, ${CAKE_CX + CAKE_R - 18} ${CAKE_CY + 40}`}
              fill="none"
              stroke="rgba(60,18,36,0.22)"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>

          {/* Main cake */}
          <g filter="url(#softShadow)">
            <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R} fill="url(#cakeTop)" />
          </g>

          {/* Dense, creamy frosting texture clipped into the body */}
          <g clipPath="url(#cakeClip)" opacity={0.42}>
            <rect x={CAKE_CX - CAKE_R} y={CAKE_CY - CAKE_R} width={CAKE_R * 2} height={CAKE_R * 2} filter="url(#frostingTexture)" />
            {Array.from({ length: 34 }, (_, i) => {
              const angle = i * 137.5;
              const radius = 12 + (i * 23) % 92;
              const rad = angle * Math.PI / 180;
              return (
                <ellipse
                  key={i}
                  cx={CAKE_CX + Math.cos(rad) * radius}
                  cy={CAKE_CY + Math.sin(rad) * radius * 0.92}
                  rx={2.2 + (i % 4) * 0.7}
                  ry={1.1 + (i % 3) * 0.5}
                  fill={i % 2 ? 'rgba(255,245,248,0.22)' : 'rgba(148,54,83,0.13)'}
                  transform={`rotate(${angle % 40 - 20} ${CAKE_CX + Math.cos(rad) * radius} ${CAKE_CY + Math.sin(rad) * radius * 0.92})`}
                />
              );
            })}
          </g>

          {/* Moving frosting sheen */}
          <motion.ellipse
            cx={CAKE_CX - 34}
            cy={CAKE_CY - 42}
            rx={38}
            ry={13}
            fill="rgba(255,255,255,0.16)"
            filter="url(#glowF)"
            animate={{ opacity: [0.08, 0.22, 0.08], x: [-18, 22, -18], rotate: [-10, -4, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Highlight (light source top-left) */}
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R} fill="url(#cakeHighlight)" opacity={0.72} />

          {/* Inner shadow (depth) */}
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R} fill="url(#cakeInnerShadow)" opacity={0.82} />

          {/* Edge highlight ring */}
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R - 1} fill="none" stroke="rgba(255,235,242,0.32)" strokeWidth={3.5} />

          {/* Decorative rings */}
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R}        fill="none" stroke="rgba(244,143,177,0.3)" strokeWidth={2.2} />
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R * 0.73} fill="none" stroke="rgba(255,232,240,0.22)"  strokeWidth={2} />
          <circle cx={CAKE_CX} cy={CAKE_CY} r={CAKE_R * 0.45} fill="rgba(252,228,236,0.42)" stroke="rgba(244,143,177,0.18)" strokeWidth={1} />

          {/* Outer frosting dots */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (360 / 12) * i;
            const rad = (angle * Math.PI) / 180;
            return (
              <circle key={i}
                cx={CAKE_CX + Math.cos(rad) * CAKE_R * 0.84}
                cy={CAKE_CY + Math.sin(rad) * CAKE_R * 0.84}
                r={4.5} fill="rgba(255,255,255,0.55)"
              />
            );
          })}

          {/* Inner frosting dots */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (360 / 8) * i + 22.5;
            const rad = (angle * Math.PI) / 180;
            return (
              <circle key={i}
                cx={CAKE_CX + Math.cos(rad) * CAKE_R * 0.57}
                cy={CAKE_CY + Math.sin(rad) * CAKE_R * 0.57}
                r={5} fill="rgba(255,255,255,0.38)"
              />
            );
          })}

          {/* Center rosette */}
          <circle cx={CAKE_CX} cy={CAKE_CY} r={26} fill="url(#cakeCenter)" />
          <circle cx={CAKE_CX} cy={CAKE_CY} r={13} fill="rgba(255,255,255,0.45)" />
          <circle cx={CAKE_CX} cy={CAKE_CY} r={5}  fill="rgba(196,104,122,0.85)" />

          {/* Candles */}
          {[[-20,-22],[0,-28],[20,-22]].map(([ox, oy], i) => (
            <g key={i}>
              <rect
                x={CAKE_CX + ox - 3.5} y={CAKE_CY + oy}
                width={7} height={18} rx={2.5}
                fill={['#f5c6d6','#b47fa0','#e8a0b4'][i]}
                stroke="rgba(255,255,255,0.15)" strokeWidth={0.5}
              />
              <motion.g
                animate={{
                  scaleY: [1, 1.25, 0.8, 1.18, 0.92, 1],
                  scaleX: [1, 0.8, 1.15, 0.88, 1.1, 1],
                  opacity: [0.9, 1, 0.8, 1, 0.85, 0.9],
                  x: flameLean * (0.8 + i * 0.15),
                  rotate: flameLean * 0.8,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.9 + i * 0.22,
                  ease: 'easeInOut',
                  x: { duration: 0.24, repeat: 0 },
                  rotate: { duration: 0.24, repeat: 0 },
                }}
                style={{ transformOrigin: `${CAKE_CX + ox}px ${CAKE_CY + oy}px` }}
              >
                <ellipse cx={CAKE_CX + ox} cy={CAKE_CY + oy - 8} rx={4.5} ry={8} fill="#ffd54f" opacity={0.95} filter="url(#glowF)" />
                <ellipse cx={CAKE_CX + ox} cy={CAKE_CY + oy - 7} rx={2}   ry={4.5} fill="#fff9c4" />
              </motion.g>
              <motion.ellipse
                cx={CAKE_CX + ox}
                cy={CAKE_CY + oy + 10}
                rx={12}
                ry={7}
                fill="rgba(255,213,79,0.13)"
                animate={{ opacity: [0.08, 0.22, 0.08], scale: [0.85, 1.18, 0.85] }}
                transition={{ repeat: Infinity, duration: 1.4 + i * 0.17, ease: 'easeInOut' }}
              />
            </g>
          ))}

          {/* Slice separation layers (offset cut halves slightly) */}
          {cuts.map((cut, i) => {
            const dx = cut.end.x - cut.start.x;
            const dy = cut.end.y - cut.start.y;
            const len = Math.sqrt(dx*dx + dy*dy) || 1;
            const nx = -dy / len * (1.8 + i * 0.55);
            const ny =  dx / len * (1.8 + i * 0.55);
            const offset = i % 2 === 0 ? 1 : -1;
            return (
              <g key={i} clipPath="url(#cakeClip)">
                <motion.line
                  x1={cut.start.x} y1={cut.start.y}
                  x2={cut.end.x}   y2={cut.end.y}
                  stroke="rgba(63,19,34,0.2)"
                  strokeWidth={14}
                  strokeLinecap="round"
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: nx * offset, y: ny * offset, opacity: 0.34 }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                />
                <motion.line
                  x1={cut.start.x} y1={cut.start.y}
                  x2={cut.end.x}   y2={cut.end.y}
                  stroke="rgba(255,230,238,0.12)"
                  strokeWidth={6}
                  strokeLinecap="round"
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: -nx * offset, y: -ny * offset, opacity: 0.42 }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                />
              </g>
            );
          })}

          {/* Rendered cut lines (clipped to cake) */}
          <g clipPath="url(#cakeClip)">
            {cuts.map((cut, i) => (
              <g key={i}>
                <motion.line
                  x1={cut.start.x} y1={cut.start.y}
                  x2={cut.end.x}   y2={cut.end.y}
                  stroke="rgba(52,18,32,0.44)"
                  strokeWidth={15}
                  strokeLinecap="round"
                  filter="url(#softSeamBlur)"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: celebrated ? [0.48, 0.72, 0.48] : 0.52, pathLength: 1 }}
                  transition={{ duration: celebrated ? 2.4 : 0.42, repeat: celebrated ? Infinity : 0, ease: 'easeOut' }}
                />
                <motion.line
                  x1={cut.start.x} y1={cut.start.y}
                  x2={cut.end.x}   y2={cut.end.y}
                  stroke="url(#cutInterior)"
                  strokeWidth={9}
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: celebrated ? [0.62, 0.88, 0.62] : 0.68, pathLength: 1 }}
                  transition={{ duration: celebrated ? 2.4 : 0.42, repeat: celebrated ? Infinity : 0, ease: 'easeOut', delay: 0.03 }}
                />
                <motion.line
                  x1={cut.start.x - 1.8} y1={cut.start.y - 1.8}
                  x2={cut.end.x - 1.8}   y2={cut.end.y - 1.8}
                  stroke="url(#frostingLayer)"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 0.58, pathLength: 1 }}
                  transition={{ duration: 0.34, ease: 'easeOut', delay: 0.08 }}
                />
                <motion.line
                  x1={cut.start.x + 2.2} y1={cut.start.y + 2.2}
                  x2={cut.end.x + 2.2}   y2={cut.end.y + 2.2}
                  stroke="rgba(82,30,46,0.35)"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 0.5, pathLength: 1 }}
                  transition={{ duration: 0.32, ease: 'easeOut', delay: 0.1 }}
                />
                {Array.from({ length: 9 }, (_, c) => (
                  <motion.circle
                    key={c}
                    cx={cut.start.x + ((cut.end.x - cut.start.x) * (c + 1)) / 10 + (c % 2 ? 3.2 : -2.8)}
                    cy={cut.start.y + ((cut.end.y - cut.start.y) * (c + 1)) / 10 + (c % 2 ? -2.4 : 2.6)}
                    r={0.9 + (c % 3) * 0.55}
                    fill={c % 2 ? 'rgba(255,224,207,0.78)' : 'rgba(142,62,75,0.42)'}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.72, scale: 1 }}
                    transition={{ delay: 0.14 + c * 0.035, duration: 0.34 }}
                  />
                ))}
              </g>
            ))}
          </g>

          {/* Live drag preview — glowing soft line */}
          {drag.active && drag.start && drag.current && (
            <g>
              {/* Glow layer */}
              <line
                x1={drag.start.x}   y1={drag.start.y}
                x2={drag.current.x} y2={drag.current.y}
                stroke="rgba(245,198,214,0.46)"
                strokeWidth={15}
                strokeLinecap="round"
                style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
              />
              <line
                x1={drag.start.x}   y1={drag.start.y}
                x2={drag.current.x} y2={drag.current.y}
                stroke="url(#bladeTrail)"
                strokeWidth={7}
                strokeLinecap="round"
                style={{ filter: 'blur(1.2px)', pointerEvents: 'none' }}
              />
              {/* Core line */}
              <line
                x1={drag.start.x}   y1={drag.start.y}
                x2={drag.current.x} y2={drag.current.y}
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2}
                strokeLinecap="round"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )}

          {/* Celebration pulse ring */}
          {celebrated && (
            <motion.circle
              cx={CAKE_CX} cy={CAKE_CY}
              fill="none"
              stroke="rgba(245,198,214,0.7)"
              strokeWidth={4}
              initial={{ r: CAKE_R, opacity: 0.8 }}
              animate={{ r: CAKE_R + 35, opacity: 0 }}
              transition={{ duration: 1, repeat: 3, ease: 'easeOut' }}
            />
          )}
        </motion.svg>

        {/* DOM spark particles */}
        {particles.map(p => (
          <CutParticles key={p.id} x={p.x} y={p.y} />
        ))}
      </motion.div>

      {/* Emotional message sequence */}
      <div style={{ textAlign: 'center', minHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', zIndex: 10 }}>
        <AnimatePresence>
          {msgStep >= 1 && (
            <motion.p
              key="msg1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                color: '#f5c6d6',
                fontStyle: 'italic',
                textShadow: '0 0 28px rgba(245,198,214,0.5)',
                margin: 0,
              }}
            >
              Happy Birthday ❤️
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {msgStep >= 2 && (
            <motion.p
              key="msg2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.75, y: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.95rem',
                color: '#f5c6d6',
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              I wish I was there with you…
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {msgStep >= 3 && (
            <motion.p
              key="msg3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: '#f5c6d6',
                fontStyle: 'italic',
                letterSpacing: '0.04em',
                margin: 0,
              }}
            >
              But this is my way of being there.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {msgStep >= 4 && (
            <motion.button
              key="cta"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={onDone}
              className="glass-button"
              style={{
                marginTop: '0.75rem',
                padding: '0.85rem 2.5rem',
                fontSize: '0.9rem',
                letterSpacing: '0.2em',
                background: 'rgba(245,198,214,0.08)',
                border: '1px solid rgba(245,198,214,0.25)',
                color: '#f5c6d6',
                fontStyle: 'italic',
              }}
            >
              there's something more…
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {Array.from({ length: CUTS_NEEDED }, (_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i < cuts.length
                ? 'rgba(245,198,214,0.95)'
                : 'rgba(245,198,214,0.2)',
              scale: i === cuts.length - 1 && cuts.length > 0 ? [1, 1.6, 1] : 1,
              boxShadow: i < cuts.length
                ? '0 0 10px rgba(245,198,214,0.6)'
                : 'none',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              width: 9, height: 9,
              borderRadius: '50%',
              border: '1px solid rgba(245,198,214,0.35)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
