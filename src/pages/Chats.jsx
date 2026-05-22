import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { pageVariants } from './variants';
import Waveform from '../components/Waveform';
import CuteCat from '../components/CuteCat';
import SleepingCat from '../components/SleepingCat';
import { voiceNotes as NOTES, finalNote as FINAL_NOTE } from '../data/voiceNotes';
import { duckBg, unduckBg } from '../components/soundManager';





function formatTime(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '--:--';
  const minutes = Math.floor(value / 60);
  const seconds = Math.max(0, Math.floor(value % 60));
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const durationCache = new Map();

function makeWave(seed, count = 34) {
  return Array.from({ length: count }, (_, i) => {
    const pause = i % 11 === 0 ? 0.42 : 1;
    const base = Math.sin((i + seed) * 0.72) * 0.5 + Math.sin((i + seed) * 1.9) * 0.25;
    return (9 + Math.abs(base) * 28 + ((i + seed) % 5) * 2) * pause;
  });
}

const VoiceNoteCard = React.memo(function VoiceNoteCard({
  note,
  index,
  active,
  progress,
  unlocked,
  onPlay,
  onHoldUnlock,
}) {
  const bars = useMemo(() => makeWave(index + 3, note.tone === 'final' ? 44 : 32), [index, note.tone]);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [realDuration, setRealDuration] = useState(durationCache.get(note.id) || null);
  const holdIntervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);

  useEffect(() => {
    if (durationCache.has(note.id)) {
      setRealDuration(durationCache.get(note.id));
      return;
    }

    let isMounted = true;
    const audio = new Audio(note.audio);
    audio.preload = 'metadata';
    
    const onLoadedMetadata = () => {
      if (isMounted) {
        durationCache.set(note.id, audio.duration);
        setRealDuration(audio.duration);
      }
    };
    
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    
    return () => {
      isMounted = false;
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.src = '';
    };
  }, [note.id, note.audio]);

  useEffect(() => () => {
    globalThis.clearInterval(holdIntervalRef.current);
    globalThis.clearTimeout(holdTimeoutRef.current);
  }, []);

  const startHold = useCallback(() => {
    if (!note.hold || unlocked) return;
    setHolding(true);
    setHoldProgress(0);
    globalThis.clearInterval(holdIntervalRef.current);
    globalThis.clearTimeout(holdTimeoutRef.current);
    const started = Date.now();
    holdIntervalRef.current = globalThis.setInterval(() => {
      setHoldProgress(Math.min(1, (Date.now() - started) / 850));
    }, 16);
    holdTimeoutRef.current = globalThis.setTimeout(() => {
      globalThis.clearInterval(holdIntervalRef.current);
      setHoldProgress(1);
      setHolding(false);
      onHoldUnlock(note.id);
    }, 850);
  }, [note.hold, note.id, unlocked, onHoldUnlock]);

  const stopHold = useCallback(() => {
    if (!unlocked && holding) {
      globalThis.clearInterval(holdIntervalRef.current);
      globalThis.clearTimeout(holdTimeoutRef.current);
      setHoldProgress(0);
    }
    setHolding(false);
  }, [unlocked, holding]);

  const locked = note.hold && !unlocked;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-16%' }}
      whileHover={{ y: -4, rotate: index % 2 ? -0.5 : 0.5 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="gpu-layer"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 620,
        margin: `${index === 0 ? 0 : -8}px auto 10px`,
        padding: '1.1rem 1.1rem 1.4rem',
        borderRadius: 24,
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'rgba(245,198,214,0.42)' : 'rgba(245,198,214,0.14)'}`,
        backdropFilter: 'blur(18px)',
        boxShadow: active ? '0 15px 50px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
          <div>
            <p style={{ color: 'rgba(245,198,214,0.46)', fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
              {note.context}
            </p>
            <h2 style={{ color: '#ffe4ed', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.28rem, 5vw, 1.8rem)', fontWeight: 400, lineHeight: 1.15 }}>
              {note.icon} {note.title}
            </h2>
          </div>
          <span style={{ color: 'rgba(245,198,214,0.48)', fontSize: '0.8rem' }}>
            {realDuration ? formatTime(realDuration) : '--:--'}
          </span>
        </div>

        {locked ? (
          <div style={{ marginTop: 28, marginBottom: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Gentle Breathing Glow Behind Pill */}
            {!holding && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  width: '70%',
                  height: '40px',
                  x: '-50%',
                  y: '-50%',
                  background: 'rgba(245,198,214,0.25)',
                  filter: 'blur(20px)',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />
            )}
            
            <motion.button
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              animate={{
                scale: holding ? 0.96 : 1,
                boxShadow: holding 
                  ? '0 15px 40px rgba(245,198,214,0.25), inset 0 0 30px rgba(245,198,214,0.2)' 
                  : '0 12px 30px rgba(0,0,0,0.5), inset 0 2px 15px rgba(255,255,255,0.03)',
              }}
              transition={{ scale: { type: 'spring', bounce: 0.5 }, boxShadow: { duration: 0.4 } }}
              style={{
                position: 'relative',
                width: '85%', // iPhone SE friendly
                maxWidth: 280,
                padding: '1.15rem 1.4rem',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(20, 8, 14, 0.5)', // soft translucent dark rose glass
                border: '1px solid rgba(245,198,214,0.08)',
                borderTop: '1px solid rgba(245,198,214,0.25)', // brighter top edge reflection
                borderBottom: '1px solid rgba(0,0,0,0.4)',
                overflow: 'hidden',
                cursor: 'pointer',
                outline: 'none',
                zIndex: 1, // Above breathing glow
              }}
            >
              {/* Shimmer moving slowly across the pill */}
              <motion.div
                animate={{ x: ['-200%', '300%'] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                  transform: 'skewX(-20deg)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Progress fill while holding */}
              <motion.div
                animate={{ width: `${holdProgress * 100}%`, opacity: holding ? 1 : 0 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(245,198,214,0.15) 0%, rgba(245,198,214,0.4) 100%)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              
              <span style={{
                position: 'relative',
                zIndex: 2,
                color: holding ? '#fff' : 'rgba(245,198,214,0.85)',
                fontSize: '0.85rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
                lineHeight: 1,
                textShadow: holding ? '0 0 15px rgba(245,198,214,0.8)' : '0 2px 4px rgba(0,0,0,0.5)',
                transition: 'color 0.3s, text-shadow 0.3s',
              }}>
                hold to listen
              </span>
            </motion.button>

            {/* Soft Separator Line */}
            <div style={{ 
              marginTop: 26, 
              height: 1, 
              width: '35%', 
              background: 'linear-gradient(90deg, transparent, rgba(245,198,214,0.2), transparent)',
              opacity: 0.7 
            }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button
              onClick={() => onPlay(note)}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(245,198,214,0.25)',
                background: active ? 'rgba(245,198,214,0.15)' : 'rgba(245,198,214,0.05)',
                color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {active ? 'Ⅱ' : '▶'}
            </motion.button>
            <Waveform bars={bars} active={active} progress={progress} />
            <span style={{ minWidth: 40, color: 'rgba(245,198,214,0.5)', fontSize: '0.75rem', textAlign: 'right' }}>
              {realDuration ? formatTime(realDuration * progress) : '--:--'}
            </span>
          </div>
        )}

        {/* Reveal text removed to keep cards visually quiet */}
      </div>
    </motion.article>
  );
});

VoiceNoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string,
    context: PropTypes.string,
    duration: PropTypes.number,
    tone: PropTypes.string,
    hold: PropTypes.bool,
    script: PropTypes.arrayOf(PropTypes.shape({
      at: PropTypes.number,
      text: PropTypes.string
    }))
  }).isRequired,
  index: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  unlocked: PropTypes.bool,
  onPlay: PropTypes.func.isRequired,
  onHoldUnlock: PropTypes.func.isRequired
};

export default function Chats() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const warmth = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.2, 0.3]);
  const glowBackground = useMotionTemplate`radial-gradient(circle at 50% 40%, rgba(245,198,214,${warmth}), transparent 60%)`;
  
  // Show bottom CTA after scrolling 85% through the content
  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const ctaScale = useTransform(scrollYProgress, [0.85, 0.95], [0.92, 1]);

  const [activeId, setActiveId] = useState(null);
  const [progress, setProgress] = useState({});
  const [unlocked, setUnlocked] = useState({});
  const [showFinal, setShowFinal] = useState(false);

  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const abortControllerRef = useRef(null);

  const handleHoldUnlock = useCallback((id) => {
    setUnlocked(prev => ({ ...prev, [id]: true }));
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const playNote = useCallback((note) => {
    if (activeId === note.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      unduckBg();
      cancelAnimationFrame(rafRef.current);
      audioRef.current = null;
      setActiveId(null);
      return;
    }

    if (activeId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      unduckBg();
      cancelAnimationFrame(rafRef.current);
    }

    setActiveId(note.id);
    setProgress(prev => ({ ...prev, [note.id]: 0 }));
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    const audio = new Audio(note.audio);
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.addEventListener('error', () => {
      console.warn(`Audio missing or failed to load: ${note.audio}`);
      try { unduckBg(); } catch (e) { }
      setActiveId(null);
    }, { signal });

    audio.addEventListener('ended', () => {
      cancelAnimationFrame(rafRef.current);
      audioRef.current = null;
      try { unduckBg(); } catch (e) { }
      setActiveId(null);
      setUnlocked(prev => {
        const updated = { ...prev, [note.id]: true };
        const finishedCount = Object.keys(updated).length;
        if (note.id === 'hard_to_say' || finishedCount >= 3) setShowFinal(true);
        return updated;
      });
    }, { signal });

    audio.addEventListener('pause', () => {
      try { unduckBg(); } catch (e) { }
    }, { signal });

    // gently duck background while voice note is playing
    try { duckBg(); } catch (e) { /* ignore */ }

    audio.play().catch((e) => {
      console.warn(`Audio playback blocked or failed:`, e);
      setActiveId(null);
    });

    const updateProgress = () => {
      if (audioRef.current && !audioRef.current.paused) {
        const duration = audioRef.current.duration || note.duration;
        const current = audioRef.current.currentTime || 0;
        const next = Math.min(1, current / duration);
        setProgress(prev => ({ ...prev, [note.id]: next }));
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };
    
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [activeId]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page gpu-layer"
      style={{
        background: '#0b0613',
        backgroundImage: glowBackground,
        padding: '30px 18px 160px', // Increased bottom padding for CTA separation
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Top Animated Cat Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: 20, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -6, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          <motion.div
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: -20,
              background: 'radial-gradient(circle, rgba(245,198,214,0.4), transparent 70%)',
              filter: 'blur(15px)',
              zIndex: -1
            }}
          />
          <CuteCat mood="calm" size={64} />
        </motion.div>
        <header style={{ textAlign: 'center', marginTop: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.1rem, 7vw, 3.4rem)', color: '#f5c6d6', fontWeight: 400, margin: 0 }}>our little world.</h1>
          <p style={{ color: 'rgba(245,198,214,0.6)', letterSpacing: '0.1em', fontSize: '0.85rem', margin: 0 }}>tucked away in recordings</p>
        </header>
      </motion.div>

      <div style={{ width: '100%', maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 2 }}>
        {NOTES.map((note, i) => (
          <React.Fragment key={note.id}>
            <VoiceNoteCard
              note={note}
              index={i}
              active={activeId === note.id}
              progress={progress[note.id] || 0}
              unlocked={unlocked[note.id]}
              onPlay={playNote}
              onHoldUnlock={handleHoldUnlock}
            />
            {/* Interlude between 'hard_to_say' and 'more_than_say' */}
            {note.id === 'hard_to_say' && (
              <div style={{ margin: '48px 0' }}>
                <SleepingCat />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence>
        {showFinal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ marginTop: 40, width: '100%', maxWidth: 520, paddingBottom: 60 }}
          >
            <VoiceNoteCard
              note={FINAL_NOTE}
              index={99}
              active={activeId === FINAL_NOTE.id}
              progress={progress[FINAL_NOTE.id] || 0}
              unlocked={true}
              onPlay={playNote}
              onHoldUnlock={handleHoldUnlock}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Bottom Navigation CTA */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: 'max(32px, env(safe-area-inset-bottom))', // Lowered slightly
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 100,
          pointerEvents: 'none',
          opacity: ctaOpacity,
          scale: ctaScale
        }}
      >
        <motion.button
          onClick={() => navigate('/cake')}
          animate={{ 
            y: [0, -4, 0],
            boxShadow: [
              '0 10px 30px rgba(0,0,0,0.3)',
              '0 15px 40px rgba(245,198,214,0.2)',
              '0 10px 30px rgba(0,0,0,0.3)'
            ]
          }}
          transition={{ 
            y: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="glass-button"
          style={{ 
            pointerEvents: 'auto',
            padding: '1.2rem 3rem',
            background: 'rgba(245,198,214,0.14)',
            borderColor: 'rgba(245,198,214,0.4)',
            color: '#fff4f8',
            fontSize: '1.05rem',
            letterSpacing: '0.08em',
            backdropFilter: 'blur(20px)',
            textShadow: '0 0 12px rgba(245,198,214,0.5)'
          }}
        >
          NEXT LITTLE SURPRISE ✨
        </motion.button>
        <p style={{ 
          color: 'rgba(245,198,214,0.5)', 
          fontSize: '0.75rem', 
          fontStyle: 'italic', 
          margin: 0,
          letterSpacing: '0.05em'
        }}>
          something sweet is waiting ♡
        </p>
      </motion.div>
    </motion.div>
  );
}
