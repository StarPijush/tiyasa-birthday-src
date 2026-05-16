import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './variants';
import ParticleHeart from '../components/ParticleHeart';

const REVEAL_TEXT = [
  { text: 'Tiyasa…', style: 'heading', delay: 0 },
  { text: 'some people feel like home.', style: 'body', delay: 2200 },
  { text: 'you do.', style: 'highlight', delay: 4500 },
];

function getFontSize(line) {
  if (line.style === 'heading') return 'clamp(2rem, 7vw, 2.8rem)';
  if (line.style === 'highlight') return 'clamp(1.1rem, 4vw, 1.4rem)';
  return 'clamp(0.95rem, 3.2vw, 1.15rem)';
}

export default function Lotus() {
  const navigate = useNavigate();
  const [isHolding, setIsHolding] = useState(false);
  const [heartFormed, setHeartFormed] = useState(false);
  const [shownLines, setShownLines] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);

  const triggerStaggeredReveals = useCallback(() => {
    REVEAL_TEXT.forEach((line, i) => {
      globalThis.setTimeout(() => {
        setShownLines(prev => [...prev, i]);
      }, line.delay);
    });
  }, []);

  const handleComplete = useCallback(() => {
    setHeartFormed(true);
    // Add small delay to let hint text fade out completely
    globalThis.setTimeout(() => {
      triggerStaggeredReveals();
    }, 1000);

    const lastDelay = REVEAL_TEXT.at(-1).delay;
    globalThis.setTimeout(() => setShowFloatingHearts(true), lastDelay + 3000);
    globalThis.setTimeout(() => setShowButton(true), lastDelay + 4500);
  }, [triggerStaggeredReveals]);

  const heartElements = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: `floating-heart-${i}`,
    left: `${30 + Math.random() * 40}%`,
    top: `${35 + Math.random() * 15}%`,
    fontSize: `${8 + Math.random() * 8}px`,
    yDist: -(80 + Math.random() * 200),
    xDist: (Math.random() - 0.5) * 100,
    duration: 4 + Math.random() * 3,
    delay: Math.random() * 4
  })), []);

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        backgroundColor: '#07030d',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(circle at 50% 40%, rgba(35,12,25,0.9) 0%, #07030d 100%)',
      }} />

      <div className="grain-overlay" style={{ opacity: 0.03, position: 'fixed' }} />

      <motion.div
        animate={{ opacity: isHolding ? 0.85 : 0.65 }}
        transition={{ duration: 1.5 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 40%, transparent 20%, rgba(0,0,0,0.85) 100%)',
        }}
      />

      <motion.div
        animate={{
          opacity: [0.04, 0.09, 0.04],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: '25%', left: '-25%',
          width: '150%', height: '80%',
          background: 'radial-gradient(ellipse, rgba(245,198,214,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
          zIndex: 1, pointerEvents: 'none',
        }}
      />

      <ParticleHeart
        onComplete={handleComplete}
        onHoldChange={setIsHolding}
      />

      <AnimatePresence mode="wait">
        {!heartFormed && (
          <motion.p
            key="hold-hint"
            variants={{
              initial: { opacity: 0, y: 10 },
              pulse: { 
                opacity: [0.3, 0.55, 0.3],
                transition: { opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }
              },
              hidden: { opacity: 0 },
              exit: { opacity: 0, y: -10, transition: { duration: 0.8 } }
            }}
            initial="initial"
            animate={isHolding ? "hidden" : "pulse"}
            exit="exit"
            style={{
              position: 'absolute',
              bottom: '23%',
              zIndex: 10,
              color: '#f5c6d6',
              fontFamily: "'Playfair Display', serif",
              fontSize: '0.85rem',
              fontStyle: 'italic',
              letterSpacing: '0.15em',
              textShadow: '0 0 20px rgba(245,198,214,0.3)',
              pointerEvents: 'none',
            }}
          >
            hold here for a second…
          </motion.p>
        )}
      </AnimatePresence>

      <div style={{
        position: 'absolute',
        bottom: '8%',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.8rem',
        pointerEvents: 'none',
        padding: '24px 32px',
        background: 'radial-gradient(circle, rgba(7,3,13,0.6) 0%, transparent 80%)',
        borderRadius: '40px',
      }}>
        <AnimatePresence>
          {shownLines.map((idx) => {
            const line = REVEAL_TEXT[idx];
            const isHeading = line.style === 'heading';
            const isHighlight = line.style === 'highlight';

            return (
              <motion.p
                key={`line-${idx}`}
                initial={{ opacity: 0, y: 15, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: isHeading || isHighlight
                    ? "'Playfair Display', serif"
                    : 'Inter, sans-serif',
                  fontSize: getFontSize(line),
                  fontStyle: 'italic',
                  fontWeight: isHeading ? '400' : '300',
                  color: '#f5c6d6',
                  textShadow: isHeading
                    ? '0 0 40px rgba(245,198,214,0.4)'
                    : '0 0 20px rgba(245,198,214,0.25)',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: isHeading ? 1.2 : 1.7,
                }}
              >
                {line.text}
              </motion.p>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showFloatingHearts && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 6, pointerEvents: 'none' }}>
            {heartElements.map((h) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ opacity: [0, 0.4, 0], y: h.yDist, x: h.xDist }}
                transition={{ duration: h.duration, repeat: Infinity, delay: h.delay, ease: 'easeOut' }}
                style={{ position: 'absolute', left: h.left, top: h.top, fontSize: h.fontSize, color: '#f5c6d6', textShadow: '0 0 8px rgba(245,198,214,0.5)' }}
              >
                ♥
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFloatingHearts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0.04] }}
            transition={{ duration: 3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 4, pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 40%, rgba(245,198,214,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'absolute', bottom: '2%', zIndex: 10 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/final')}
              className="glass-button"
              style={{ padding: '1.2rem 3.5rem', fontSize: '0.95rem', letterSpacing: '0.25em', background: 'rgba(245,198,214,0.06)', border: '1px solid rgba(245,198,214,0.25)', color: '#f5c6d6', fontStyle: 'italic', textShadow: '0 0 15px rgba(245,198,214,0.3)' }}
            >
              come closer… 💗
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
