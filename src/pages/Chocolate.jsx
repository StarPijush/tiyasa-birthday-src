import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './variants';
import SingleChocolate from '../components/ChocolateItem';

export default function Chocolate() {
  const navigate = useNavigate();
  const [isOpened, setIsOpened] = useState(false);

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        backgroundColor: '#0b0613',
        backgroundImage: `
          radial-gradient(circle at 50% 40%, #1d0a14 0%, #0b0613 100%)
        `,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="grain-overlay" style={{ opacity: 0.04, position: 'fixed' }} />

      {/* Cinematic Spotlight */}
      <motion.div
        animate={{
          opacity: isOpened ? 0.15 : 0.08,
          scale: isOpened ? 1.2 : 1,
        }}
        transition={{ duration: 3 }}
        style={{
          position: 'fixed',
          top: '-10%',
          width: '100vw',
          height: '80vh',
          background: 'radial-gradient(ellipse at top, #f5c6d6 0%, transparent 70%)',
          filter: 'blur(100px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Dynamic Vignette */}
      <motion.div
        animate={{
          background: isOpened 
            ? 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.7) 100%)'
            : 'radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.5) 100%)'
        }}
        style={{
          position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        }}
      />

      {/* Background Sparkles */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 2,
              height: 2,
              background: '#f5c6d6',
              borderRadius: '50%',
              boxShadow: '0 0 10px #f5c6d6',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: '2rem', zIndex: 10, position: 'relative' }}
      >
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: '#f5c6d6',
          opacity: 0.3,
          marginBottom: '0.8rem',
        }}>
          a little something
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
          fontWeight: '400',
          color: '#f5c6d6',
          fontStyle: 'italic',
          textShadow: '0 0 30px rgba(245,198,214,0.2)',
        }}>
          for you 🍫
        </h1>
      </motion.div>

      {/* Single chocolate */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ zIndex: 10, position: 'relative' }}
      >
        <SingleChocolate onDone={() => navigate('/lotus')} onOpen={() => setIsOpened(true)} />
      </motion.div>

      {/* Ambient background glow (Warmth Pulse) */}
      <motion.div
        animate={{
          opacity: isOpened ? [0.1, 0.18, 0.1] : [0.06, 0.1, 0.06],
          scale: isOpened ? [1.1, 1.2, 1.1] : [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: '55%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw', height: '80vw',
          maxWidth: 600, maxHeight: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,40,20,1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 1, pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}

