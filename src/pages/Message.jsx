import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './variants';

const REACTIONS = ['🩷', '😭', '✨', '💖', '🌸'];

const LIKES = [
  { text: 'You laugh at the worst moments 😭', style: 'big', sticker: '✨', width: 420, sideNote: 'hm.' },
  { text: 'I love how you pretend to be mad for 3 minutes.', style: 'note', tag: 'tiny fact', width: 360, sideNote: 'idiot ❤️' },
  { text: "You say 'hm' like it's a full sentence.", style: 'bubble', time: '2:14 AM', width: 330 },
  { text: 'You care more than you admit.', style: 'small', sticker: '🩷', width: 310, sideNote: 'seen' },
  { text: 'You somehow became my favorite notification.', style: 'phone', time: 'now', width: 330 },
  { text: 'I still smile when your name pops up.', style: 'big', sticker: '😭', width: 390 },
  { text: "You're cute when you're sleepy.", style: 'cat', width: 340 },
  { text: '“did you eat?”', style: 'tiny', sub: 'and suddenly i feel very seen', width: 270, sideNote: '9:06 PM' },
  { text: 'You make silence feel comfortable.', style: 'soft', width: 430 },
  { text: 'soft, stubborn, annoying, mine. perfect combo.', style: 'note', tag: 'important research', width: 390 },
  { text: 'You type, stop, type again... and I wait like an idiot.', style: 'bubble', time: 'typing...', width: 350 },
  { text: 'You are very cute. unfortunately this is scientifically proven.', style: 'small', sticker: '💖', width: 360 },
];

function playPopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
  } catch (_) {}
}

function playSadMeow() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
  } catch (_) {}
}

function CuteCat({ mood = 'happy', small = false, cryingHard = false }) {
  const sad = mood === 'sad';
  const excited = mood === 'excited';
  const calm = mood === 'calm';
  const size = small ? 92 : 166;

  return (
    <motion.div
      animate={{
        y: small ? [0, -3, 0] : [0, calm ? -4 : -7, 0],
        scale: sad ? [0.98, 0.955, 0.98] : [1, excited ? 1.045 : 1.018, 1],
      }}
      transition={{ duration: sad ? 1.35 : calm ? 4.2 : 3.1, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: size,
        height: size,
        position: 'relative',
        filter: `drop-shadow(0 0 ${excited ? 38 : calm ? 24 : 28}px rgba(245,198,214,${excited ? 0.36 : calm ? 0.2 : 0.24}))`,
      }}
    >
      {excited && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.65 }}
              animate={{ opacity: [0, 0.55, 0], y: [-2, -28 - i * 7], scale: [0.65, 1, 0.8] }}
              transition={{ duration: 2.8, delay: i * 0.8, repeat: Infinity, repeatDelay: 2.4 }}
              style={{ position: 'absolute', left: `${58 + i * 10}%`, top: `${18 + i * 8}%`, fontSize: small ? '0.7rem' : '0.95rem' }}
            >
              🩷
            </motion.span>
          ))}
        </div>
      )}
      <svg viewBox="0 0 180 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`catFace-${mood}-${size}`} cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fff6f9" />
            <stop offset="64%" stopColor="#f6c9d8" />
            <stop offset="100%" stopColor="#d487a5" />
          </radialGradient>
          <filter id={`softCatGlow-${mood}-${size}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <motion.path d="M55 54 L38 20 L78 44 Z" fill="#f6c9d8" animate={{ rotate: sad ? -13 : excited ? [1, 5, 1] : calm ? [-1, 0, -1] : 0, y: sad ? 9 : 0 }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '58px 55px' }} />
        <motion.path d="M125 54 L142 20 L102 44 Z" fill="#f6c9d8" animate={{ rotate: sad ? 13 : excited ? [-1, -5, -1] : calm ? [1, 0, 1] : 0, y: sad ? 9 : 0 }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }} style={{ transformOrigin: '122px 55px' }} />
        <path d="M55 47 L44 28 L69 45 Z" fill="#e99ab7" opacity="0.72" />
        <path d="M125 47 L136 28 L111 45 Z" fill="#e99ab7" opacity="0.72" />

        <ellipse cx="90" cy="92" rx="58" ry="52" fill={`url(#catFace-${mood}-${size})`} filter={`url(#softCatGlow-${mood}-${size})`} />
        <motion.ellipse animate={{ opacity: excited ? [0.42, 0.72, 0.42] : calm ? [0.28, 0.42, 0.28] : 0.38 }} transition={{ duration: 2.2, repeat: Infinity }} cx="67" cy="101" rx="10" ry="6" fill="#ef8db0" />
        <motion.ellipse animate={{ opacity: excited ? [0.42, 0.72, 0.42] : calm ? [0.28, 0.42, 0.28] : 0.38 }} transition={{ duration: 2.2, repeat: Infinity }} cx="113" cy="101" rx="10" ry="6" fill="#ef8db0" />

        <motion.g
          animate={sad ? { scaleY: [1, 0.15, 1] } : excited ? { scaleY: [1, 1, 0.12, 1], y: [0, -1, 0] } : { scaleY: [1, 1, 0.08, 1] }}
          transition={{ duration: sad ? 5.4 : calm ? 5.8 : 4.4, repeat: Infinity, times: sad ? undefined : [0, 0.86, 0.9, 1] }}
          style={{ transformOrigin: '90px 82px' }}
        >
          <path d={sad ? 'M61 80 Q68 75 75 80' : excited ? 'M61 81 Q68 90 76 81' : 'M62 80 Q68 87 75 80'} stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d={sad ? 'M105 80 Q112 75 119 80' : excited ? 'M104 81 Q112 90 120 81' : 'M105 80 Q112 87 119 80'} stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
        </motion.g>

        <path d="M86 94 Q90 98 94 94" stroke="#9b4a65" strokeWidth="3" fill="none" strokeLinecap="round" />
        <motion.path
          d={sad ? 'M78 113 Q90 104 102 113' : calm ? 'M80 109 Q90 117 100 109' : 'M77 107 Q90 121 103 107'}
          stroke="#7b334e"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={sad ? { y: [0, 1.8, 0], scaleX: [1, 0.92, 1] } : {}}
          transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '90px 110px' }}
        />
        <line x1="45" y1="95" x2="24" y2="89" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        <line x1="45" y1="104" x2="24" y2="107" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        <line x1="135" y1="95" x2="156" y2="89" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        <line x1="135" y1="104" x2="156" y2="107" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />

        <AnimatePresence>
          {sad && (
            <>
              <motion.ellipse cx="61" cy="84" rx="9" ry="5" fill="#c8e8ff" initial={{ opacity: 0 }} animate={{ opacity: [0.15, 0.42, 0.15] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <motion.ellipse cx="119" cy="84" rx="9" ry="5" fill="#c8e8ff" initial={{ opacity: 0 }} animate={{ opacity: [0.15, 0.42, 0.15] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
              {[0, 1, 2].slice(0, cryingHard ? 3 : 1).map(i => (
                <motion.ellipse
                  key={i}
                  cx={i % 2 ? 61 : 121}
                  cy={92 + i * 3}
                  rx="3"
                  ry="6"
                  fill="#c8e8ff"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 22 + i * 8, 34 + i * 8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, repeat: Infinity, delay: i * 0.22 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </svg>
    </motion.div>
  );
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
          style={{ position: 'fixed', left: 0, top: 0, zIndex: 90, pointerEvents: 'none', fontSize: '1.22rem', filter: 'drop-shadow(0 0 10px rgba(245,198,214,0.35))' }}
        >
          {item.icon}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

function BrokenHearts({ active }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 3, overflow: 'hidden' }}>
      {active && Array.from({ length: 9 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, rotate: -8 }}
          animate={{ opacity: [0, 0.42, 0], y: [-10, -96 - i * 8], rotate: [-8, 10, -6] }}
          transition={{ duration: 4.4 + i * 0.2, delay: i * 0.65, repeat: Infinity, repeatDelay: 5, ease: 'easeOut' }}
          style={{ position: 'absolute', left: `${10 + (i * 10.5) % 82}%`, top: `${76 + (i % 3) * 6}%`, color: '#f5c6d6', fontSize: '1rem', opacity: 0.35 }}
        >
          💔
        </motion.span>
      ))}
    </div>
  );
}

function LikeMoment({ item, index, onPop }) {
  const align = index % 4 === 0 ? 'flex-start' : index % 4 === 1 ? 'flex-end' : 'center';
  const rotate = [-1.5, 1.2, -0.6, 1.8][index % 4];
  const width = `min(92vw, ${item.width}px)`;

  const shell = {
    width,
    position: 'relative',
    color: '#f5c6d6',
    textShadow: '0 0 20px rgba(245,198,214,0.14)',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, rotate: rotate * 1.8, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, rotate, filter: 'blur(0px)' }}
      whileTap={{ scale: 0.985 }}
      whileHover={{ y: -2 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      onClick={onPop}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: align,
        position: 'relative',
        cursor: 'pointer',
        margin: index < 3 ? '-3px 0 8px' : index % 3 === 0 ? '-6px 0 10px' : '-2px 0 9px',
      }}
    >
      <motion.div
        animate={{ y: [0, -1.5, 0], boxShadow: ['0 10px 34px rgba(0,0,0,0.16)', '0 12px 42px rgba(245,198,214,0.1)', '0 10px 34px rgba(0,0,0,0.16)'] }}
        transition={{ duration: 4 + index * 0.12, repeat: Infinity, ease: 'easeInOut' }}
        style={shell}
      >
        {item.sticker && (
          <span style={{ position: 'absolute', right: 10, top: -16, fontSize: '1.15rem', opacity: 0.75 }}>{item.sticker}</span>
        )}
        {item.sideNote && (
          <span style={{
            position: 'absolute',
            left: index % 2 ? 'auto' : -8,
            right: index % 2 ? -8 : 'auto',
            top: -10,
            padding: '3px 7px',
            borderRadius: 999,
            color: 'rgba(245,198,214,0.54)',
            background: 'rgba(11,6,19,0.58)',
            border: '1px solid rgba(245,198,214,0.08)',
            fontSize: '0.62rem',
            letterSpacing: '0.04em',
          }}>
            {item.sideNote}
          </span>
        )}

        {item.style === 'big' && (
          <div style={{ padding: '1.15rem 1.25rem', borderRadius: 22, background: 'rgba(245,198,214,0.08)', border: '1px solid rgba(245,198,214,0.12)', backdropFilter: 'blur(12px)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 5vw, 2.25rem)', lineHeight: 1.18, fontStyle: 'italic' }}>{item.text}</p>
          </div>
        )}

        {item.style === 'note' && (
          <div style={{ padding: '1rem 1.1rem', borderRadius: 18, background: 'linear-gradient(145deg, rgba(245,198,214,0.14), rgba(255,255,255,0.045))', border: '1px solid rgba(245,198,214,0.14)' }}>
            <span style={{ display: 'block', color: 'rgba(245,198,214,0.5)', fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 7 }}>{item.tag}</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.12rem, 4vw, 1.7rem)', lineHeight: 1.28, fontStyle: 'italic' }}>{item.text}</p>
          </div>
        )}

        {item.style === 'bubble' && (
          <div style={{ padding: '13px 15px 10px', borderRadius: '22px 22px 22px 7px', background: 'rgba(245,198,214,0.11)', border: '1px solid rgba(245,198,214,0.12)', backdropFilter: 'blur(10px)' }}>
            <span style={{ fontSize: 'clamp(0.96rem, 3.4vw, 1.16rem)', lineHeight: 1.45 }}>{item.text}</span>
            <span style={{ display: 'block', marginTop: 6, textAlign: 'right', color: 'rgba(245,198,214,0.45)', fontSize: '0.7rem' }}>{item.time} · seen</span>
          </div>
        )}

        {item.style === 'phone' && (
          <div style={{ padding: '0.9rem', borderRadius: 26, background: 'rgba(12,5,16,0.78)', border: '1px solid rgba(245,198,214,0.14)', boxShadow: 'inset 0 0 40px rgba(245,198,214,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(245,198,214,0.4)', fontSize: '0.68rem', marginBottom: 10 }}>
              <span>Tiyasa</span>
              <span>{item.time} · seen</span>
            </div>
            <p style={{ fontSize: '1.02rem', lineHeight: 1.45 }}>{item.text}</p>
          </div>
        )}

        {item.style === 'cat' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.8rem 1rem', borderRadius: 22, background: 'rgba(245,198,214,0.075)', border: '1px solid rgba(245,198,214,0.11)' }}>
            <CuteCat mood="excited" small />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 4vw, 1.6rem)', fontStyle: 'italic', lineHeight: 1.25 }}>{item.text}</p>
          </div>
        )}

        {item.style === 'tiny' && (
          <div style={{ padding: '0.72rem 0.9rem', borderRadius: 18, background: 'rgba(245,198,214,0.08)', border: '1px solid rgba(245,198,214,0.1)' }}>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>{item.text}</p>
            <span style={{ color: 'rgba(245,198,214,0.48)', fontSize: '0.76rem' }}>{item.sub}</span>
          </div>
        )}

        {item.style === 'soft' && (
          <div style={{ padding: '1.2rem 1.3rem', borderRadius: 24, background: 'radial-gradient(circle at 50% 30%, rgba(245,198,214,0.13), rgba(245,198,214,0.045))', border: '1px solid rgba(245,198,214,0.12)' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2.35rem)', lineHeight: 1.18, fontStyle: 'italic', textAlign: 'center' }}>{item.text}</p>
          </div>
        )}

        {item.style === 'small' && (
          <div style={{ padding: '0.92rem 1rem', borderRadius: 19, background: 'rgba(245,198,214,0.07)', border: '1px solid rgba(245,198,214,0.1)' }}>
            <p style={{ fontSize: '1rem', lineHeight: 1.45 }}>{item.text}</p>
          </div>
        )}
      </motion.div>
    </motion.section>
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
    if (mode === 'likes') window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 60);
  }, [mode]);

  function popReaction(e, icon = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]) {
    const id = Date.now() + Math.random();
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    setPop(prev => [...prev, { id, x, y, icon }]);
    playPopSound();
    window.setTimeout(() => setPop(prev => prev.filter(item => item.id !== id)), 1300);
  }

  function goCrying(e) {
    popReaction(e, '🥺');
    playSadMeow();
    setDim(true);
    setTransitioning(true);
    navigator.vibrate?.(18);
    window.setTimeout(() => setMode('crying'), 650);
    window.setTimeout(() => {
      setDim(false);
      setTransitioning(false);
    }, 1180);
  }

  function goLikes(e) {
    popReaction(e, '💖');
    setTransitioning(true);
    navigator.vibrate?.(28);
    window.setTimeout(() => setMode('likes'), 760);
    window.setTimeout(() => setTransitioning(false), 1250);
  }

  function moveNoButton(e, clicked = false) {
    const margin = 18;
    const buttonWidth = 142;
    const buttonHeight = 48;
    const pointerX = e?.clientX ?? window.innerWidth / 2;
    const pointerY = e?.clientY ?? window.innerHeight / 2;
    const maxX = Math.max(margin, window.innerWidth - buttonWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - buttonHeight - margin);

    let best = { x: margin, y: margin, distance: -1 };
    for (let i = 0; i < 9; i += 1) {
      const diagonalBias = i % 3 === 0 ? (pointerX < window.innerWidth / 2 ? 0.72 : 0.18) : Math.random();
      const x = margin + diagonalBias * (maxX - margin);
      const y = margin + Math.random() * (maxY - margin);
      const distance = Math.hypot(x - pointerX, y - pointerY);
      if (distance > best.distance) best = { x, y, distance };
    }

    setNoButton({
      floating: true,
      left: Math.max(margin, Math.min(maxX, best.x)),
      top: Math.max(margin, Math.min(maxY, best.y)),
      rotate: (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 8),
      scale: clicked ? 0.86 : 0.94,
    });
    window.setTimeout(() => {
      setNoButton(prev => ({ ...prev, scale: Math.max(0.76, 1 - cryNoCount * 0.06) }));
    }, 130);
  }

  function dodgeNo(e) {
    popReaction(e, cryNoCount > 0 ? '💔' : '🙄');
    playSadMeow();
    setCryNoCount(prev => prev + 1);
    moveNoButton(e, true);
    navigator.vibrate?.(12);
  }

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
                transition={{ type: 'spring', stiffness: 310, damping: 18 }}
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
              <CuteCat mood="excited" small />
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
                <LikeMoment key={item.text} item={item} index={index} onPop={(e) => popReaction(e, REACTIONS[index % REACTIONS.length])} />
              ))}
            </div>

            <div style={{ minHeight: '38vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '14px 0 10px', position: 'relative' }}>
              <motion.div animate={{ opacity: [0.18, 0.38, 0.18], scale: [0.9, 1.12, 0.9] }} transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', width: 290, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.22), transparent 68%)', filter: 'blur(30px)' }} />
              {[0, 1, 2, 3].map(i => (
                <motion.span key={i} animate={{ opacity: [0, 0.42, 0], y: [-4, -42], x: [0, i % 2 ? 12 : -12] }} transition={{ duration: 4.2, repeat: Infinity, delay: i * 0.9, repeatDelay: 2 }} style={{ position: 'absolute', left: `${30 + i * 13}%`, top: `${26 + (i % 2) * 16}%`, fontSize: '0.9rem' }}>🩷</motion.span>
              ))}
              <CuteCat mood="calm" />
              <p style={{ marginTop: 14, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 6vw, 2.7rem)', fontStyle: 'italic', lineHeight: 1.22 }}>
                okay maybe i like a lot about you...
              </p>
              <motion.button onClick={() => navigate('/quiz')} whileTap={{ scale: 0.96 }} animate={{ boxShadow: ['0 0 18px rgba(245,198,214,0.22)', '0 0 40px rgba(245,198,214,0.38)', '0 0 18px rgba(245,198,214,0.22)'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="glass-button" style={{ marginTop: 24, padding: '1rem 3rem', color: '#fff4f8', background: 'rgba(245,198,214,0.14)', borderColor: 'rgba(245,198,214,0.34)' }}>
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
