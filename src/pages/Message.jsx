import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, fastSpring } from './variants';
import CuteCat from '../components/CuteCat';
import LikeMoment from '../components/LikeMoment';

const REACTIONS = ['🩷', '😭', '✨', '💖', '🌸'];

const LIKES = [
  { id: 'laugh', text: 'You laugh at the worst moments 😭', style: 'big', sticker: '✨', width: 420, sideNote: 'hm.' },
  { id: 'mad', text: 'I love how you pretend to be mad for 3 minutes.', style: 'note', tag: 'tiny fact', width: 360, sideNote: 'idiot ❤️' },
  { id: 'hm', text: "You say 'hm' like it's a full sentence.", style: 'bubble', time: '2:14 AM', width: 330 },
  { id: 'care', text: 'You care more than you admit.', style: 'small', sticker: '🩷', width: 310, sideNote: 'seen' },
  { id: 'phone', text: 'You somehow became my favorite notification.', style: 'phone', time: 'now', width: 330 },
  { id: 'smile', text: 'I still smile when your name pops up.', style: 'big', sticker: '😭', width: 390 },
  { id: 'sleepy', text: "You're cute when you're sleepy.", style: 'cat', width: 340 },
  { id: 'eat', text: '“did you eat?”', style: 'tiny', sub: 'and suddenly i feel very seen', width: 270, sideNote: '9:06 PM' },
  { id: 'silence', text: 'You make silence feel comfortable.', style: 'soft', width: 430 },
  { id: 'combo', text: 'soft, stubborn, annoying, mine. perfect combo.', style: 'note', tag: 'important research', width: 390 },
  { id: 'type', text: 'You type, stop, type again... and I wait like an idiot.', style: 'bubble', time: 'typing...', width: 350 },
  { id: 'cute', text: 'You are very cute. unfortunately this is scientifically proven.', style: 'small', sticker: '💖', width: 360 },
];

function playPopSound() {
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(640, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

function playSadMeow() {
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(235, ctx.currentTime + 0.34);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.04);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

function FloatingReaction({ pop }) {
  return (
    <AnimatePresence>
      {pop.map(item => (
        <motion.span
          key={item.id}
          initial={{ opacity: 0, scale: 0.45, x: item.x, y: item.y }}
          animate={{ opacity: [0, 1, 0], scale: [0.55, 1.2, 0.9], y: item.y - 58 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.15, ease: 'easeOut' }}
          className="gpu-layer"
          style={{ position: 'fixed', left: 0, top: 0, zIndex: 90, pointerEvents: 'none', fontSize: '1.22rem', filter: 'drop-shadow(0 0 10px rgba(245,198,214,0.35))' }}
        >
          {item.icon}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

function BrokenHearts({ active }) {
  const hearts = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    id: `broken-${i}`,
    left: `${10 + (i * 10.5) % 82}%`,
    top: `${76 + (i % 3) * 6}%`,
    duration: 4.4 + i * 0.2,
    delay: i * 0.65
  })), []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3, overflow: 'hidden' }}>
      {active && hearts.map((h) => (
        <motion.span
          key={h.id}
          initial={{ opacity: 0, y: 20, rotate: -8 }}
          animate={{ opacity: [0, 0.42, 0], y: [-10, -96], rotate: [-8, 10, -6] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, repeatDelay: 5, ease: 'easeOut' }}
          style={{ position: 'absolute', left: h.left, top: h.top, color: '#f5c6d6', fontSize: '1rem', opacity: 0.35 }}
        >
          💔
        </motion.span>
      ))}
    </div>
  );
}

export default function Message() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('intro');
  const [transitioning, setTransitioning] = useState(false);
  const [dim, setDim] = useState(false);
  const [pop, setPop] = useState([]);
  const [cryNoCount, setCryNoCount] = useState(0);
  const [noButton, setNoButton] = useState({ floating: false, left: 0, top: 0, rotate: 0, scale: 1 });

  useEffect(() => {
    if (mode === 'likes') {
      const timer = setTimeout(() => globalThis.scrollTo?.({ top: 0, behavior: 'smooth' }), 60);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const popReaction = useCallback((e, icon = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]) => {
    const id = Date.now() + Math.random();
    const x = e?.clientX ?? globalThis.innerWidth / 2;
    const y = e?.clientY ?? globalThis.innerHeight / 2;
    setPop(prev => [...prev, { id, x, y, icon }]);
    playPopSound();
    setTimeout(() => setPop(prev => prev.filter(item => item.id !== id)), 1300);
  }, []);

  const goCrying = useCallback((e) => {
    popReaction(e, '🥺');
    playSadMeow();
    setDim(true);
    setTransitioning(true);
    navigator.vibrate?.(18);
    setTimeout(() => setMode('crying'), 650);
    setTimeout(() => {
      setDim(false);
      setTransitioning(false);
    }, 1180);
  }, [popReaction]);

  const goLikes = useCallback((e) => {
    popReaction(e, '💖');
    setTransitioning(true);
    navigator.vibrate?.(28);
    setTimeout(() => setMode('likes'), 760);
    setTimeout(() => setTransitioning(false), 1250);
  }, [popReaction]);

  const moveNoButton = useCallback((e, clicked = false) => {
    const margin = 20;
    const buttonWidth = 142;
    const buttonHeight = 48;
    const pointerX = e?.clientX ?? globalThis.innerWidth / 2;
    const pointerY = e?.clientY ?? globalThis.innerHeight / 2;
    
    const maxX = globalThis.innerWidth - buttonWidth - margin;
    const maxY = globalThis.innerHeight - buttonHeight - margin;

    let best = { x: margin, y: margin, dist: -1 };
    for (let i = 0; i < 12; i++) {
      const candidateX = margin + Math.random() * (maxX - margin);
      const candidateY = margin + Math.random() * (maxY - margin);
      const dist = Math.hypot(candidateX - pointerX, candidateY - pointerY);
      if (dist > best.dist) {
        best = { x: candidateX, y: candidateY, dist };
      }
    }

    setNoButton({
      floating: true,
      left: best.x,
      top: best.y,
      rotate: (Math.random() - 0.5) * 15,
      scale: clicked ? 0.85 : 0.95,
    });

    setTimeout(() => {
      setNoButton(prev => ({ ...prev, scale: Math.max(0.75, 1 - cryNoCount * 0.05) }));
    }, 150);
  }, [cryNoCount]);

  const dodgeNo = useCallback((e) => {
    popReaction(e, cryNoCount > 0 ? '💔' : '🙄');
    playSadMeow();
    setCryNoCount(prev => prev + 1);
    moveNoButton(e, true);
    navigator.vibrate?.(12);
  }, [cryNoCount, moveNoButton, popReaction]);

  const isCrying = mode === 'crying';
  const isLikes = mode === 'likes';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page"
      style={{
        backgroundColor: isCrying ? '#08040f' : '#0b0613',
        backgroundImage: isCrying
          ? 'radial-gradient(circle at 50% 34%, rgba(34,12,32,0.62) 0%, #08040f 74%)'
          : 'radial-gradient(circle at 50% 28%, rgba(45,15,36,0.94) 0%, #0b0613 72%)',
        minHeight: isLikes ? '100vh' : '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isLikes ? 'flex-start' : 'center',
        padding: isLikes ? '34px 18px 56px' : '32px 20px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <FloatingReaction pop={pop} />
      <BrokenHearts active={isCrying} />
      <div className="grain-overlay" style={{ opacity: isCrying ? 0.022 : 0.03, position: 'fixed' }} />
      <motion.div
        animate={{ opacity: dim ? 0.04 : isCrying ? [0.06, 0.12, 0.06] : [0.16, 0.3, 0.16], scale: dim ? 0.9 : [1, 1.08, 1] }}
        transition={{ duration: dim ? 0.35 : 6.8, repeat: dim ? 0 : Infinity, ease: 'easeInOut' }}
        style={{ position: 'fixed', width: 'min(82vw, 560px)', height: 'min(82vw, 560px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.42), transparent 68%)', filter: 'blur(48px)', zIndex: 1, pointerEvents: 'none' }}
      />

      <AnimatePresence mode="wait">
        {mode === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 18, filter: 'blur(9px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(14px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: 520 }}
          >
            <CuteCat mood="happy" />
            <h1 style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 10vw, 4.8rem)', color: '#f5c6d6', fontWeight: 400, textShadow: '0 0 28px rgba(245,198,214,0.35)' }}>
              hey you... 🩷
            </h1>
            <p style={{ marginTop: 4, color: 'rgba(245,198,214,0.72)', fontSize: 'clamp(1rem, 3.5vw, 1.18rem)', letterSpacing: '0.04em' }}>
              see what i made for you
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
              <motion.button onClick={goCrying} whileTap={{ scale: 0.95 }} className="glass-button" style={{ padding: '0.92rem 1.55rem', color: '#f5c6d6', letterSpacing: '0.05em', background: 'rgba(245,198,214,0.055)' }}>
                no 🙄
              </motion.button>
              <motion.button onClick={goLikes} animate={{ boxShadow: ['0 0 22px rgba(245,198,214,0.2)', '0 0 38px rgba(245,198,214,0.34)', '0 0 22px rgba(245,198,214,0.2)'] }} transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }} className="glass-button" style={{ padding: '0.98rem 1.9rem', color: '#fff4f8', background: 'rgba(245,198,214,0.14)', borderColor: 'rgba(245,198,214,0.36)', letterSpacing: '0.05em' }}>
                okayyy 💖
              </motion.button>
            </div>
          </motion.div>
        )}

        {mode === 'crying' && (
          <motion.div
            key="crying"
            initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ zIndex: 5, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <CuteCat mood="sad" cryingHard={cryNoCount >= 2} />
            <h1 style={{ marginTop: 8, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(2.25rem, 9vw, 4rem)', fontWeight: 400 }}>
              awh... :(
            </h1>
            <p style={{ marginTop: 8, color: 'rgba(245,198,214,0.74)', fontSize: '1rem', lineHeight: 1.65 }}>
              i made this with so much love
              <br />
              please check it out for me? 🥺
            </p>
            <AnimatePresence>
              {cryNoCount >= 2 && (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.72, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 14, color: '#f5c6d6', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  you're bullying the cat now.
                </motion.p>
              )}
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 13, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
              <motion.button onClick={goLikes} className="glass-button" animate={{ scale: [1, 1.035, 1], boxShadow: ['0 0 20px rgba(245,198,214,0.22)', '0 0 42px rgba(245,198,214,0.4)', '0 0 20px rgba(245,198,214,0.22)'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} style={{ padding: '0.95rem 1.55rem', color: '#fff4f8', background: 'rgba(245,198,214,0.14)', borderColor: 'rgba(245,198,214,0.34)' }}>
                okay okay 😭
              </motion.button>
              <motion.button
                onClick={dodgeNo}
                onHoverStart={(e) => moveNoButton(e)}
                onPointerEnter={(e) => moveNoButton(e)}
                animate={{
                  left: noButton.floating ? noButton.left : undefined,
                  top: noButton.floating ? noButton.top : undefined,
                  rotate: noButton.rotate,
                  scale: noButton.scale,
                  opacity: Math.max(0.52, 1 - cryNoCount * 0.1),
                }}
                transition={fastSpring}
                className="glass-button"
                style={{
                  position: noButton.floating ? 'fixed' : 'relative',
                  zIndex: 95,
                  padding: '0.9rem 1.3rem',
                  color: '#f5c6d6',
                  background: 'rgba(245,198,214,0.045)',
                }}
              >
                still no 🙄
              </motion.button>
            </div>
          </motion.div>
        )}

        {mode === 'likes' && (
          <motion.div key="likes" initial={{ opacity: 0, y: 22, filter: 'blur(12px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }} style={{ zIndex: 5, width: '100%', maxWidth: 760, position: 'relative' }}>
            <div style={{ minHeight: '34vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 2, paddingBottom: 12 }}>
              <motion.div animate={{ opacity: [0.35, 0.78, 0.35], scale: [0.9, 1.08, 0.9] }} transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: 14, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.2), transparent 68%)', filter: 'blur(24px)' }} />
              <CuteCat mood="excited" size={92} />
              <p style={{ marginTop: 8, color: 'rgba(245,198,214,0.5)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                what i like about you
              </p>
              <h2 style={{ marginTop: 6, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 7vw, 3.5rem)', fontWeight: 400, lineHeight: 1.08 }}>
                a very serious list
              </h2>
              <p style={{ marginTop: 8, color: 'rgba(245,198,214,0.58)', fontSize: '0.88rem' }}>
                tap any little thought
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', zIndex: 2 }}>
              {LIKES.map((item, index) => (
                <LikeMoment key={item.id} item={item} index={index} onPop={(e) => popReaction(e, REACTIONS[index % REACTIONS.length])} />
              ))}
            </div>

            <div style={{ minHeight: '38vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '14px 0 10px', position: 'relative' }}>
              <motion.div animate={{ opacity: [0.18, 0.38, 0.18], scale: [0.9, 1.12, 0.9] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', width: 290, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.22), transparent 68%)', filter: 'blur(30px)' }} />
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.span key={`bg-heart-${i}`} animate={{ opacity: [0, 0.42, 0], y: [-4, -42], x: [0, i % 2 ? 12 : -12] }} transition={{ duration: 4.2, repeat: Infinity, delay: i * 0.9, repeatDelay: 2 }} style={{ position: 'absolute', left: `${30 + i * 13}%`, top: `${26 + (i % 2) * 16}%`, fontSize: '0.9rem' }}>🩷</motion.span>
              ))}
              <CuteCat mood="calm" />
              <p style={{ marginTop: 14, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 6vw, 2.7rem)', fontStyle: 'italic', lineHeight: 1.22 }}>
                okay maybe i like a lot about you...
              </p>
              <motion.button onClick={() => navigate('/quiz')} whileTap={{ scale: 0.96 }} animate={{ boxShadow: ['0 0 22px rgba(245,198,214,0.2)', '0 0 38px rgba(245,198,214,0.34)', '0 0 22px rgba(245,198,214,0.2)'] }} transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }} className="glass-button" style={{ marginTop: 24, padding: '1rem 3rem', color: '#fff4f8', background: 'rgba(245,198,214,0.14)', borderColor: 'rgba(245,198,214,0.36)' }}>
                continue 💖
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)', scale: 1 }}
            animate={{ opacity: [0, 1, 0], backdropFilter: ['blur(0px)', 'blur(12px)', 'blur(0px)'], scale: [1, 1.04, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.15, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'radial-gradient(circle, rgba(245,198,214,0.35), rgba(11,6,19,0.7) 70%)', pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
