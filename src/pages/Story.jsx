import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageVariants } from './variants';

const MEMORIES = [
  {
    time: '11:24 PM',
    title: 'the conversation that forgot to end',
    fragment: 'okay but hear me out...',
    detail: 'first saved feeling',
    lines: ['It started small.', 'Then suddenly I was waiting for your name to light up.'],
  },
  {
    time: '2:14 AM',
    title: 'the night we should have slept',
    fragment: 'you should sleep',
    detail: 'screen brightness: too low',
    lines: ['We kept saying goodnight.', 'Neither of us meant it yet.'],
  },
  {
    time: '8:45 PM',
    title: 'your voice changed the whole day',
    fragment: 'call me when free',
    detail: 'missed you quietly',
    lines: ['Nothing dramatic.', 'Just you being there.', 'That was enough.'],
  },
  {
    time: 'always',
    title: 'what keeps staying',
    fragment: 'yeah... exactly that.',
    detail: 'still here',
    lines: ['Across all the quiet parts.', 'I would still choose this.'],
    final: true,
  },
];

function Memory({ memory, index }) {
  const align = index % 2 === 0 ? 'flex-start' : 'flex-end';
  const textAlign = index % 2 === 0 ? 'left' : 'right';

  return (
    <motion.section
      initial={{ opacity: 0, y: 42, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-18%' }}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: align,
        position: 'relative',
        padding: '2rem 0',
      }}
    >
      <motion.div
        animate={{ opacity: [0.12, 0.24, 0.12], scale: [0.9, 1.16, 0.9] }}
        transition={{ duration: 7 + index, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: index % 2 === 0 ? '4%' : 'auto',
          right: index % 2 === 0 ? 'auto' : '4%',
          top: '25%',
          width: 290,
          height: 205,
          background: 'radial-gradient(circle, rgba(245,198,214,0.18), transparent 68%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 520, textAlign, position: 'relative', padding: '0 4px' }}>
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 0.34, y: 0 }}
          transition={{ delay: 0.18, duration: 0.8 }}
          style={{
            position: 'absolute',
            top: -16,
            [index % 2 === 0 ? 'right' : 'left']: 8,
            color: '#f5c6d6',
            fontSize: '0.66rem',
            letterSpacing: '0.08em',
            fontStyle: 'italic',
          }}
        >
          {memory.detail}
        </motion.span>
        <p style={{
          fontSize: '0.7rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(245,198,214,0.42)',
          marginBottom: 10,
        }}>
          {memory.time}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(1.65rem, 6vw, 2.75rem)',
          color: '#f5c6d6',
          lineHeight: 1.15,
          marginBottom: 14,
          fontStyle: memory.final ? 'italic' : 'normal',
          textShadow: '0 0 22px rgba(245,198,214,0.16)',
        }}>
          {memory.title}
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 0.48, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          style={{
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: 18,
            background: 'rgba(245,198,214,0.07)',
            border: '1px solid rgba(245,198,214,0.08)',
            color: '#f5c6d6',
            fontSize: '0.82rem',
            marginBottom: 16,
          }}
        >
          {memory.fragment}
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: align }}>
          {memory.lines.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 0.82, y: 0 }}
              transition={{ delay: 0.35 + i * 0.14, duration: 0.8 }}
              style={{
                color: '#f5c6d6',
                fontSize: 'clamp(0.98rem, 3.3vw, 1.16rem)',
                lineHeight: 1.65,
                fontWeight: 300,
                maxWidth: 430,
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function Story() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        backgroundColor: '#0b0613',
        backgroundImage: 'radial-gradient(circle at top right, rgba(26,10,21,0.92) 0%, #0b0613 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 20px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div className="grain-overlay" style={{ opacity: 0.02, position: 'fixed' }} />

      <div style={{ maxWidth: 780, width: '100%', zIndex: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1 }}
          style={{ textAlign: 'center', marginBottom: '1.4rem' }}
        >
          <p style={{ color: 'rgba(245,198,214,0.46)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            saved in the dark
          </p>
          <h1 style={{ marginTop: 8, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(2rem, 7vw, 3.4rem)', lineHeight: 1.08 }}>
            little pieces of us
          </h1>
        </motion.div>

        {MEMORIES.map((memory, index) => (
          <Memory key={memory.time} memory={memory} index={index} />
        ))}

        <div className="silence-moment" style={{ minHeight: '14vh' }} />

        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ display: 'flex', justifyContent: 'center', paddingBottom: 80 }}>
          <button onClick={() => navigate('/cake')} className="glass-button" style={{ padding: '1rem 3rem', fontSize: '0.98rem', letterSpacing: '0.18em', color: '#f5c6d6' }}>
            celebrate quietly
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
