import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { playBgMusic } from '../components/soundManager';

export default function Landing() {
  const navigate = useNavigate();
  const [ripple, setRipple] = useState(null);

  function enter(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    playBgMusic();
    globalThis.setTimeout(() => navigate('/message'), 430);
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0b0613',
      backgroundImage: 'radial-gradient(circle at center, rgba(42,15,31,0.9) 0%, #0b0613 70%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <div className="grain-overlay" />

      <motion.div
        animate={{ opacity: [0.16, 0.28, 0.16], scale: [0.96, 1.08, 0.96] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 'min(70vw, 520px)',
          height: 'min(70vw, 520px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(243,166,192,0.42), transparent 68%)',
          filter: 'blur(34px)',
          zIndex: 1,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          zIndex: 2,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.45rem',
          transform: 'translate3d(calc(var(--tilt-x) * -0.5px), calc(var(--tilt-y) * -0.35px), 0)',
        }}
      >
        <motion.h1
          animate={{ textShadow: ['0 0 18px rgba(243,166,192,0.32)', '0 0 34px rgba(243,166,192,0.48)', '0 0 18px rgba(243,166,192,0.32)'] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 10vw, 6rem)',
            color: 'var(--rose)',
            margin: 0,
            fontWeight: 400,
          }}
        >
          Hey Tiyasa...
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.66, y: 0 }}
          transition={{ delay: 1.05, duration: 1.4 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.92rem, 2vw, 1.15rem)',
            color: '#fff',
            margin: 0,
            fontWeight: 200,
            letterSpacing: '0.18em',
          }}
        >
          wait here for a second
        </motion.p>

        <motion.button
          onClick={enter}
          className="glass-button"
          style={{ marginTop: '2rem' }}
          animate={{ y: [0, -5, 0] }}
          transition={{ y: { duration: 4.4, repeat: Infinity, ease: 'easeInOut' } }}
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.96, y: 2 }}
        >
          open it
          <AnimatePresence>
            {ripple && (
              <motion.span
                key={ripple.id}
                className="touch-ripple"
                style={{ left: ripple.x, top: ripple.y }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
}
