import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

function playUnwrapSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Create a crinkling sound
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.15;
      if (i % 100 < 5) data[i] *= 2.5; // Add some spikes for crinkles
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 1200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    src.start();
  } catch (_) {}
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export default function SingleChocolate({ onDone, onOpen }) {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  // Smooth springs for mouse movement
  const mouseX = useSpring(0, { stiffness: 150, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 25 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);

  function handleMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  async function openChocolate() {
    if (opened) return;
    navigator.vibrate?.([15, 30, 15]);
    playUnwrapSound();
    setOpened(true);
    onOpen?.(); // Notify parent that chocolate is being opened
    await delay(1800);
    setMessage(true);
  }

  const wrapperGradient = 'linear-gradient(135deg, #4a1005 0%, #7d2a12 35%, #9c3c1e 50%, #7d2a12 65%, #2a0802 100%)';
  const foilGradient = 'linear-gradient(135deg, #d4d4d4 0%, #ffffff 30%, #e8e8e8 50%, #b0b0b0 100%)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem', perspective: 1200 }}>
      {/* Cinematic Spotlight */}
      <div style={{
        position: 'absolute',
        top: -150,
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(255,180,150,0.08) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          mouseX.set(0);
          mouseY.set(0);
        }}
        onClick={openChocolate}
        style={{
          width: 320,
          height: 260,
          position: 'relative',
          cursor: opened ? 'default' : 'pointer',
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
        }}
      >
        {/* Deep Shadow */}
        <motion.div
          animate={{
            opacity: opened ? 0.4 : 0.6,
            scale: opened ? 1.1 : 0.95,
            y: opened ? 20 : 10,
            filter: opened ? 'blur(20px)' : 'blur(15px)'
          }}
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            bottom: -20,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 0
          }}
        />

        {/* The Main Container */}
        <motion.div
          animate={{ y: opened ? -10 : 0 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}
        >
          {/* INNER CHOCOLATE (The Core) */}
          <motion.div
            animate={{
              y: opened ? 0 : 25,
              opacity: opened ? 1 : 0.4,
              scale: opened ? 1 : 0.96,
            }}
            transition={{ duration: 1.8, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: 'absolute',
              left: 60,
              top: 50,
              width: 200,
              height: 140,
              zIndex: 3,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Chocolate Thickness (Side) */}
            <div style={{
              position: 'absolute',
              left: 0, top: 12, right: 0, bottom: -10,
              background: '#1a0904',
              borderRadius: '12px',
              transform: 'translateZ(-1px)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
            }} />

            {/* Main Bar Surface */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              background: 'linear-gradient(145deg, #4b2112, #2a0f08 60%, #1a0904)',
              boxShadow: `
                inset 0 1px 2px rgba(255,255,255,0.1),
                inset 0 -4px 10px rgba(0,0,0,0.5)
              `,
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '8px',
              padding: '12px',
            }}>
              {/* Cocoa Grain / Texture */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: 0.04,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
              }} />

              {/* Chocolate Squares */}
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #5c2918, #2a0f08)',
                  borderRadius: '6px',
                  boxShadow: `
                    2px 2px 4px rgba(0,0,0,0.4),
                    inset 1px 1px 2px rgba(255,255,255,0.05),
                    inset -2px -2px 5px rgba(0,0,0,0.4)
                  `,
                }}>
                  {/* Square Highlight */}
                  <div style={{
                    position: 'absolute', top: '10%', left: '10%', width: '40%', height: '1px',
                    background: 'rgba(255,255,255,0.05)', filter: 'blur(1px)'
                  }} />
                </div>
              ))}

              {/* Moving Surface Sheen */}
              <motion.div
                animate={{ x: [-200, 400] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', top: -50, bottom: -50, width: 60,
                  background: 'linear-gradient(90deg, transparent, rgba(255,220,180,0.03), transparent)',
                  transform: 'rotate(25deg)',
                }}
              />
            </div>

            {/* Micro Details: Cocoa Dust */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 0.4, 0],
                    y: [0, -10],
                    x: [0, (i % 2 === 0 ? 5 : -5)]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: 1.5, height: 1.5,
                    borderRadius: '50%',
                    background: '#8b4513',
                    filter: 'blur(0.5px)',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* INNER FOIL WRAPPER */}
          <motion.div
            animate={{
              opacity: opened ? 1 : 0,
              scale: opened ? 1.05 : 0.9,
              rotateX: opened ? -15 : 0,
            }}
            transition={{ duration: 1.5, delay: 0.3 }}
            style={{
              position: 'absolute',
              left: 45,
              top: 35,
              width: 230,
              height: 180,
              background: foilGradient,
              borderRadius: 16,
              zIndex: 2,
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.3)',
              clipPath: 'polygon(5% 5%, 95% 5%, 100% 50%, 95% 95%, 5% 95%, 0% 50%)',
            }}
          >
            {/* Crinkles on Foil */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.1,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='5'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)'/%3E%3C/svg%3E")`,
            }} />
          </motion.div>

          {/* OUTER WRAPPER - LEFT HALF */}
          <motion.div
            animate={{
              x: opened ? -140 : 0,
              rotateY: opened ? -110 : 0,
              z: opened ? 40 : 0,
            }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              left: 20,
              top: 20,
              width: 145,
              height: 220,
              background: wrapperGradient,
              borderRadius: '12px 2px 2px 12px',
              zIndex: 5,
              transformOrigin: 'left center',
              boxShadow: '10px 0 25px rgba(0,0,0,0.4), inset -5px 0 15px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Metallic Shine */}
            <motion.div
              animate={{ x: [-200, 300] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: 0, bottom: 0, width: 40,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                transform: 'skewX(-20deg)'
              }}
            />
            {/* Texture */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', background: 'url(https://www.transparenttextures.com/patterns/carbon-fibre.png)' }} />
          </motion.div>

          {/* OUTER WRAPPER - RIGHT HALF */}
          <motion.div
            animate={{
              x: opened ? 140 : 0,
              rotateY: opened ? 110 : 0,
              z: opened ? 40 : 0,
            }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              width: 145,
              height: 220,
              background: wrapperGradient,
              borderRadius: '2px 12px 12px 2px',
              zIndex: 5,
              transformOrigin: 'right center',
              boxShadow: '-10px 0 25px rgba(0,0,0,0.4), inset 5px 0 15px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
          >
            {/* Metallic Shine */}
            <motion.div
              animate={{ x: [-200, 300] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{
                position: 'absolute', top: 0, bottom: 0, width: 40,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                transform: 'skewX(-20deg)'
              }}
            />
            {/* Texture */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', background: 'url(https://www.transparenttextures.com/patterns/carbon-fibre.png)' }} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Reveal Effects */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', pointerEvents: 'none', zIndex: 1 }}
          >
            {/* Soft Pulse Glow */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                width: 400, height: 400,
                background: 'radial-gradient(circle, #7d2a12 0%, transparent 70%)',
                filter: 'blur(60px)',
                borderRadius: '50%'
              }}
            />
            {/* Sparkles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 4, height: 4,
                  background: '#f5c6d6',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #f5c6d6'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <AnimatePresence>
          {!opened && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              style={{
                color: '#f5c6d6',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              touch to unwrap
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ textAlign: 'center', maxWidth: 400, zIndex: 10 }}
            >
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                lineHeight: 1.8,
                fontStyle: 'italic',
                color: '#f5c6d6',
                textShadow: '0 0 15px rgba(245,198,214,0.3)',
                marginBottom: '2rem'
              }}>
                I wish I could hand this to you.
                <br />
                Slowly. For real.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDone}
                className="glass-button"
                style={{
                  color: '#f5c6d6',
                  fontSize: '0.8rem',
                  letterSpacing: '0.25em',
                  padding: '1.2rem 3rem',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(245,198,214,0.3)',
                }}
              >
                one last bloom
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  animation: 'shine 4s infinite'
                }} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

