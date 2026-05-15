import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants } from './variants';
import CakeCutGame from '../components/CakeCutGame';

export default function Cake() {
  const navigate = useNavigate();

  function handleDone() {
    navigate('/chocolate');
  }

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
          radial-gradient(ellipse 60% 55% at 50% 55%, rgba(42, 15, 31, 0.9) 0%, transparent 70%),
          radial-gradient(circle at center, #1a0a15 0%, #0b0613 100%)
        `,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grain */}
      <div className="grain-overlay" style={{ opacity: 0.025, position: 'fixed' }} />

      {/* Top heading */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9 }}
        style={{ textAlign: 'center', marginBottom: '1.5rem', zIndex: 5 }}
      >
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#f5c6d6',
          opacity: 0.5,
          marginBottom: '0.75rem',
        }}>
          birthday surprise
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: '400',
          fontSize: 'clamp(1.4rem, 5vw, 2rem)',
          color: '#f5c6d6',
          fontStyle: 'italic',
          textShadow: '0 0 20px rgba(245,198,214,0.2)',
        }}>
          I wish I was there…
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 1 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
            color: '#f5c6d6',
            marginTop: '0.4rem',
          }}
        >
          cut this for me ❤️
        </motion.p>
      </motion.div>

      {/* Game */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ zIndex: 5 }}
      >
        <CakeCutGame onDone={handleDone} />
      </motion.div>

      {/* Background ambient glow */}
      <motion.div
        animate={{ opacity: [0.08, 0.14, 0.08], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '80vw',
          maxWidth: '500px',
          maxHeight: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,198,214,1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
