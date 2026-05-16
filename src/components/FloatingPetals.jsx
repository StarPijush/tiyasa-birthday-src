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

      arr.push({
        x: Math.random() * 100, // percentage
        y: Math.random() * 120 - 10, // percentage
        rotation: Math.random() * 360,
        rotateSpeed: (Math.random() - 0.5) * 2,
        drift: (Math.random() - 0.5) * 0.05,
        ...settings
      });
    }
    return arr;
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    const drawPetal = (p, x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.beginPath();
      
      // Petal shape: a teardrop / heart half
      const s = p.size;
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s / 2, -s / 2, s, s / 4, 0, s);
      ctx.bezierCurveTo(-s, s / 4, -s / 2, -s / 2, 0, 0);
      
      ctx.fillStyle = `rgba(243, 166, 192, ${p.opacity})`;
      if (p.blur > 0) {
        ctx.shadowColor = '#f3a6c0';
        ctx.shadowBlur = p.blur * 2;
      }
      ctx.fill();
      ctx.restore();
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      petals.forEach(p => {
        // Update physics
        p.y += (p.speed * speedModifier * 0.2);
        p.x += p.drift * speedModifier;
        p.rotation += p.rotateSpeed * speedModifier;

        // Reset if offscreen
        if (p.y > 115) {
          p.y = -15;
          p.x = Math.random() * 100;
        }
        if (p.x < -10) p.x = 110;
        if (p.x > 110) p.x = -10;

        const screenX = (p.x / 100) * window.innerWidth;
        const screenY = (p.y / 100) * window.innerHeight;
        
        drawPetal(p, screenX, screenY);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
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
