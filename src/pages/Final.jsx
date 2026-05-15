import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './variants';

export default function Final() {
  const [dimmed, setDimmed] = useState(false);
  const [finalText, setFinalText] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDimmed(true), 3600);
    const t2 = setTimeout(() => setFinalText(true), 6200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        background: '#07030d',
        minHeight: '100dvh',
        padding: '40px 24px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ opacity: dimmed ? 0.18 : [0.34, 0.48, 0.34], scale: dimmed ? 0.95 : [1, 1.05, 1] }}
        transition={{ duration: dimmed ? 3.2 : 8, repeat: dimmed ? 0 : Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 58% 48% at 50% 48%, rgba(180,80,128,0.34), transparent 72%)',
          filter: 'blur(16px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: dimmed ? 0.72 : 0 }}
        transition={{ duration: 3 }}
        style={{ position: 'absolute', inset: 0, background: '#030106', zIndex: 1 }}
      />

      <div className="grain-overlay" style={{ opacity: 0.018, position: 'fixed' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <motion.p
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: dimmed ? 0 : 0.72, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.9, duration: 1.6 }}
          style={{
            fontFamily: 'var(--font-display)',
            color: '#f5c6d6',
            fontSize: 'clamp(1.5rem, 6vw, 2.4rem)',
            fontStyle: 'italic',
            lineHeight: 1.45,
            textShadow: '0 0 26px rgba(245,198,214,0.28)',
          }}
        >
          stay a little.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: dimmed ? 0 : 1, opacity: dimmed ? 0 : 0.22 }}
          transition={{ delay: 1.8, duration: 1.4 }}
          style={{ width: 86, height: 1, background: 'linear-gradient(90deg, transparent, #f5c6d6, transparent)' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: dimmed ? 0 : 0.5 }}
          transition={{ delay: 2.4, duration: 1.4 }}
          style={{
            color: 'rgba(245,198,214,0.72)',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            fontWeight: 300,
          }}
        >
          no big ending.
          <br />
          just this quiet part.
        </motion.p>

        <AnimatePresence>
          {finalText && (
            <motion.p
              initial={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
              animate={{ opacity: 0.72, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: 24,
                right: 24,
                bottom: '18vh',
                color: '#f5c6d6',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.15rem, 5vw, 1.7rem)',
                fontStyle: 'italic',
                textShadow: '0 0 22px rgba(245,198,214,0.2)',
              }}
            >
              thank you for existing.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
