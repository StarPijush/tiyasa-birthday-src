import React, { useRef, useEffect, useCallback } from 'react';

function heartX(t) { return 16 * Math.pow(Math.sin(t), 3); }
function heartY(t) { return -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)); }
function lerp(a, b, t) { return a + (b - a) * t; }

export default function ParticleHeart({ onComplete, onHoldChange }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const stateRef = useRef({
    holding: false, progress: 0, formed: false,
    particles: [], ambient: [], ripples: [],
    time: 0, done: false, w: 0, h: 0
  });

  const init = useCallback((w, h) => {
    const s = stateRef.current;
    s.w = w; s.h = h;
    const cx = w / 2, cy = h * 0.4;
    const scale = Math.min(w, h) * 0.032;

    s.particles = [];
    for (let i = 0; i < 180; i++) {
      const t = (i / 180) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const fill = i < 100 ? 0.88 + Math.random() * 0.12 : 0.15 + Math.random() * 0.7;
      s.particles.push({
        x: Math.random() * w, y: Math.random() * h,
        scX: Math.random() * w, scY: Math.random() * h,
        hX: cx + heartX(t) * scale * fill,
        hY: cy + heartY(t) * scale * fill,
        sz: 1 + Math.random() * 2.5,
        op: 0.06 + Math.random() * 0.1,
        baseOp: 0.2 + Math.random() * 0.45,
        ph: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }
    s.ambient = [];
    for (let i = 0; i < 50; i++) {
      s.ambient.push({
        x: Math.random() * w, y: Math.random() * h,
        sz: 0.8 + Math.random() * 1.5, op: 0.04 + Math.random() * 0.1,
        vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.12,
        ph: Math.random() * Math.PI * 2
      });
    }
    s.ripples = [];
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const r = cvs.getBoundingClientRect();
      cvs.width = r.width * dpr;
      cvs.height = r.height * dpr;
      init(r.width, r.height);
    }
    resize();
    window.addEventListener('resize', resize);

    const ctx = cvs.getContext('2d');
    let last = performance.now();

    function draw(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = stateRef.current;
      s.time += dt;
      const { w, h } = s;
      const cx = w / 2, cy = h * 0.4;

      // Progress
      if (s.holding && !s.formed) {
        s.progress = Math.min(1, s.progress + dt * 0.26);
        if (s.progress >= 1 && !s.formed) {
          s.formed = true;
          if (!s.done) { s.done = true; setTimeout(() => onComplete?.(), 1500); }
        }
      } else if (!s.formed) {
        s.progress = Math.max(0, s.progress - dt * 0.12);
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Center glow
      const gs = 40 + s.progress * 100 + (s.formed ? 50 + Math.sin(s.time * 1.5) * 20 : 0);
      const go = 0.06 + s.progress * 0.12 + (s.formed ? 0.08 : 0);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gs);
      g.addColorStop(0, `rgba(245,198,214,${go})`);
      g.addColorStop(0.6, `rgba(180,100,140,${go * 0.3})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, gs, 0, Math.PI * 2);
      ctx.fill();

      // Ripples
      if (s.holding && !s.formed) {
        if (!s.ripples.length || s.time - s.ripples[s.ripples.length - 1].t > 0.65) {
          s.ripples.push({ t: s.time });
        }
      }
      s.ripples = s.ripples.filter(r => s.time - r.t < 2.8);
      for (const r of s.ripples) {
        const age = s.time - r.t;
        const rad = age * 55;
        const a = Math.max(0, 0.18 - age * 0.065);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,198,214,${a})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Heart particles
      const breath = s.formed ? 1 + Math.sin(s.time * 1.2) * 0.025 : 1;
      for (const p of s.particles) {
        if (s.formed) {
          const ox = Math.sin(s.time * 0.7 + p.ph) * 2.5;
          const oy = Math.cos(s.time * 0.5 + p.ph) * 2.5;
          const tx = cx + (p.hX - cx) * breath + ox;
          const ty = cy + (p.hY - cy) * breath + oy;
          p.x = lerp(p.x, tx, dt * 3);
          p.y = lerp(p.y, ty, dt * 3);
          p.op = lerp(p.op, p.baseOp + 0.25, dt * 2);
        } else if (s.progress > 0) {
          const ease = s.progress * s.progress;
          const tx = lerp(p.scX, p.hX, ease);
          const ty = lerp(p.scY, p.hY, ease);
          p.x = lerp(p.x, tx, dt * (1.5 + s.progress * 4));
          p.y = lerp(p.y, ty, dt * (1.5 + s.progress * 4));
          p.op = lerp(p.op, 0.1 + s.progress * 0.4, dt * 2);
        } else {
          p.x += p.vx + Math.sin(s.time * 0.3 + p.ph) * 0.08;
          p.y += p.vy + Math.cos(s.time * 0.25 + p.ph) * 0.08;
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
          p.vx += (cx - p.x) * 0.000025;
          p.vy += (cy - p.y) * 0.000025;
          p.op = 0.06 + Math.sin(s.time * 0.8 + p.ph) * 0.03;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,198,214,${p.op})`;
        ctx.shadowColor = `rgba(245,198,214,0.5)`;
        ctx.shadowBlur = p.sz * 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Ambient
      for (const a of s.ambient) {
        a.x += a.vx + Math.sin(s.time * 0.2 + a.ph) * 0.04;
        a.y += a.vy + Math.cos(s.time * 0.15 + a.ph) * 0.04;
        if (a.x < -30) a.x = w + 30;
        if (a.x > w + 30) a.x = -30;
        if (a.y < -30) a.y = h + 30;
        if (a.y > h + 30) a.y = -30;
        const al = a.op * (0.6 + Math.sin(s.time * 0.4 + a.ph) * 0.4);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,198,214,${al})`;
        ctx.shadowColor = 'rgba(245,198,214,0.3)';
        ctx.shadowBlur = a.sz * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      frameRef.current = requestAnimationFrame(draw);
    }
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [init, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        e.preventDefault();
        stateRef.current.holding = true;
        navigator.vibrate?.(15);
        onHoldChange?.(true);
      }}
      onPointerUp={() => {
        stateRef.current.holding = false;
        onHoldChange?.(false);
      }}
      onPointerCancel={() => {
        stateRef.current.holding = false;
        onHoldChange?.(false);
      }}
      onPointerLeave={() => {
        stateRef.current.holding = false;
        onHoldChange?.(false);
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
        cursor: 'pointer',
        zIndex: 5,
      }}
    />
  );
}
