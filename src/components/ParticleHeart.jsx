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
    for (let i = 0; i < 160; i++) {
      const t = (i / 160) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const fill = i < 90 ? 0.88 + Math.random() * 0.12 : 0.15 + Math.random() * 0.7;
      s.particles.push({
        x: Math.random() * w, y: Math.random() * h,
        scX: Math.random() * w, scY: Math.random() * h,
        hX: cx + heartX(t) * scale * fill,
        hY: cy + heartY(t) * scale * fill,
        sz: 1.2 + Math.random() * 2.2,
        op: 0.1 + Math.random() * 0.1,
        baseOp: 0.25 + Math.random() * 0.4,
        ph: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
      });
    }
    s.ambient = [];
    for (let i = 0; i < 40; i++) {
      s.ambient.push({
        x: Math.random() * w, y: Math.random() * h,
        sz: 0.8 + Math.random() * 1.5, op: 0.06 + Math.random() * 0.1,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.15,
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

    const ctx = cvs.getContext('2d', { alpha: true });
    let last = performance.now();

    function draw(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = stateRef.current;
      s.time += dt;
      const { w, h } = s;
      const cx = w / 2, cy = h * 0.4;

      if (s.holding && !s.formed) {
        s.progress = Math.min(1, s.progress + dt * 0.28);
        if (s.progress >= 1 && !s.formed) {
          s.formed = true;
          if (!s.done) { s.done = true; setTimeout(() => onComplete?.(), 1600); }
        }
      } else if (!s.formed) {
        s.progress = Math.max(0, s.progress - dt * 0.15);
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Optimized Center Glow (single draw)
      const gs = 50 + s.progress * 110 + (s.formed ? 60 + Math.sin(s.time * 1.8) * 25 : 0);
      const go = 0.08 + s.progress * 0.15 + (s.formed ? 0.1 : 0);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, gs);
      grad.addColorStop(0, `rgba(245,198,214,${go})`);
      grad.addColorStop(0.5, `rgba(180,100,140,${go * 0.4})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - gs, cy - gs, gs * 2, gs * 2);

      // Optimized Ripples
      if (s.holding && !s.formed) {
        if (!s.ripples.length || s.time - s.ripples[s.ripples.length - 1].t > 0.6) {
          s.ripples.push({ t: s.time });
        }
      }
      s.ripples = s.ripples.filter(r => s.time - r.t < 3);
      ctx.lineWidth = 1;
      for (const r of s.ripples) {
        const age = s.time - r.t;
        const rad = age * 60;
        const a = Math.max(0, 0.22 - age * 0.075);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,198,214,${a})`;
        ctx.stroke();
      }

      // Heart Particles (Batched)
      const breath = s.formed ? 1 + Math.sin(s.time * 1.3) * 0.03 : 1;
      
      // We'll draw them without individual shadowBlur for speed
      // Instead, we use a glow brush or just additive blending
      ctx.globalCompositeOperation = 'lighter';
      
      for (const p of s.particles) {
        if (s.formed) {
          const ox = Math.sin(s.time * 0.8 + p.ph) * 3;
          const oy = Math.cos(s.time * 0.6 + p.ph) * 3;
          const tx = cx + (p.hX - cx) * breath + ox;
          const ty = cy + (p.hY - cy) * breath + oy;
          p.x = lerp(p.x, tx, dt * 4);
          p.y = lerp(p.y, ty, dt * 4);
          p.op = lerp(p.op, p.baseOp + 0.3, dt * 2.5);
        } else if (s.progress > 0) {
          const ease = s.progress * s.progress * (3 - 2 * s.progress);
          const tx = lerp(p.scX, p.hX, ease);
          const ty = lerp(p.scY, p.hY, ease);
          p.x = lerp(p.x, tx, dt * (2 + s.progress * 5));
          p.y = lerp(p.y, ty, dt * (2 + s.progress * 5));
          p.op = lerp(p.op, 0.12 + s.progress * 0.5, dt * 2.5);
        } else {
          p.x += p.vx + Math.sin(s.time * 0.4 + p.ph) * 0.1;
          p.y += p.vy + Math.cos(s.time * 0.3 + p.ph) * 0.1;
          if (p.x < -30) p.x = w + 30;
          if (p.x > w + 30) p.x = -30;
          if (p.y < -30) p.y = h + 30;
          if (p.y > h + 30) p.y = -30;
          p.vx += (cx - p.x) * 0.00003;
          p.vy += (cy - p.y) * 0.00003;
          p.op = 0.08 + Math.sin(s.time * 1 + p.ph) * 0.04;
        }

        ctx.fillStyle = `rgba(245,198,214,${p.op})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle micro-glow per particle (much cheaper than shadowBlur)
        if (p.op > 0.4) {
          ctx.fillStyle = `rgba(245,198,214,${p.op * 0.2})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ambient (Batched)
      ctx.globalCompositeOperation = 'source-over';
      for (const a of s.ambient) {
        a.x += a.vx + Math.sin(s.time * 0.25 + a.ph) * 0.05;
        a.y += a.vy + Math.cos(s.time * 0.2 + a.ph) * 0.05;
        if (a.x < -40) a.x = w + 40;
        if (a.x > w + 40) a.x = -40;
        if (a.y < -40) a.y = h + 40;
        if (a.y > h + 40) a.y = -40;
        const al = a.op * (0.7 + Math.sin(s.time * 0.5 + a.ph) * 0.3);
        ctx.fillStyle = `rgba(245,198,214,${al})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.sz, 0, Math.PI * 2);
        ctx.fill();
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
        navigator.vibrate?.(18);
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
        willChange: 'opacity'
      }}
    />
  );
}
