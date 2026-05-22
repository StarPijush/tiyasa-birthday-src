import React, { useRef, useEffect, useMemo } from 'react';

const PETAL_COUNT = 24;

export default function FloatingPetals({ count = PETAL_COUNT, speedModifier = 1 }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Use a smaller count on low-power devices if needed, but for now we optimize the draw
  const petals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      let layer = 'mid';
      if (i < count * 0.4) layer = 'background';
      else if (i > count * 0.8) layer = 'foreground';

      let settings = {};
      switch (layer) {
        case 'background':
          settings = { size: Math.random() * 8 + 6, blur: 4, opacity: 0.15, speed: 0.8 };
          break;
        case 'mid':
          settings = { size: Math.random() * 12 + 12, blur: 2, opacity: 0.35, speed: 1.4 };
          break;
        case 'foreground':
          settings = { size: Math.random() * 15 + 25, blur: 0, opacity: 0.65, speed: 2.2 };
          break;
      }

      const s = settings.size;
      const b = settings.blur > 0 ? settings.blur * 2 : 0;
      const pad = b + 4;
      
      const cachedCanvas = document.createElement('canvas');
      cachedCanvas.width = s * 2 + pad * 2;
      cachedCanvas.height = s * 2 + pad * 2;
      const cCtx = cachedCanvas.getContext('2d');
      
      cCtx.translate(s + pad, s / 2 + pad);
      cCtx.beginPath();
      cCtx.moveTo(0, 0);
      cCtx.bezierCurveTo(s / 2, -s / 2, s, s / 4, 0, s);
      cCtx.bezierCurveTo(-s, s / 4, -s / 2, -s / 2, 0, 0);
      
      cCtx.fillStyle = `rgba(243, 166, 192, ${settings.opacity})`;
      if (settings.blur > 0) {
        cCtx.shadowColor = '#f3a6c0';
        cCtx.shadowBlur = b;
      }
      cCtx.fill();

      arr.push({
        x: Math.random() * 100, // percentage
        y: Math.random() * 120 - 10, // percentage
        rotation: Math.random() * 360,
        rotateSpeed: (Math.random() - 0.5) * 2,
        drift: (Math.random() - 0.5) * 0.05,
        ...settings,
        cachedCanvas,
        pad,
        s
      });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    let resizeRaf = null;
    let winW = window.innerWidth;
    let winH = window.innerHeight;

    const resize = () => {
      winW = window.innerWidth;
      winH = window.innerHeight;
      canvas.width = winW * dpr;
      canvas.height = winH * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleResize = () => {
      if (!resizeRaf) {
        resizeRaf = requestAnimationFrame(() => {
          resize();
          resizeRaf = null;
        });
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    resize();

    const drawPetal = (p, x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.drawImage(p.cachedCanvas, -(p.s + p.pad), -(p.s / 2 + p.pad));
      ctx.restore();
    };

    let lastTime = performance.now();

    const animate = (time) => {
      if (document.hidden) {
        lastTime = time;
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const dt = Math.min(time - lastTime, 50) / 16.666; // Normalize to ~60fps step
      lastTime = time;

      ctx.clearRect(0, 0, winW, winH);
      
      petals.forEach(p => {
        // Update physics
        p.y += (p.speed * speedModifier * 0.2) * dt;
        p.x += p.drift * speedModifier * dt;
        p.rotation += p.rotateSpeed * speedModifier * dt;

        // Reset if offscreen
        if (p.y > 115) {
          p.y = -15;
          p.x = Math.random() * 100;
        }
        if (p.x < -10) p.x = 110;
        if (p.x > 110) p.x = -10;

        const screenX = (p.x / 100) * winW;
        const screenY = (p.y / 100) * winH;
        
        drawPetal(p, screenX, screenY);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(requestRef.current);
    };
  }, [petals, speedModifier]);

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
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          willChange: 'transform'
        }}
      />
    </div>
  );
}
