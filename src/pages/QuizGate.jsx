import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants } from './variants';

const QUESTIONS = [
  {
    question: "What's our anniversary date?",
    placeholder: 'type carefully...',
    accepted: ['25th feb 2026', '25 feb 2026', 'february 25 2026', '25/02/2026'],
    correct: ['okayyyy correct 💖', 'you remembered 🥹'],
    wrong: ['WRONG 😭', 'ouch that hurt'],
  },
  {
    question: "What's my favourite color?",
    placeholder: 'this is important 😤',
    accepted: ['maroon'],
    correct: ['accepted ✨', 'good girl'],
    wrong: ['fake girlfriend detected', 'the cat is disappointed'],
  },
  {
    question: 'What do you call me?',
    placeholder: "don't fail this one",
    accepted: ['puchu'],
    correct: ['you remembered 🥹', 'okayyyy correct 💖'],
    wrong: ['try again pookie', 'WRONG 😭'],
  },
];

function normalizeAnswer(value) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

function playChime(type = 'correct') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = type === 'correct' ? [640, 820, 1040] : [280, 220];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'correct' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(type === 'correct' ? 0.08 : 0.055, ctx.currentTime + index * 0.08 + 0.03);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + index * 0.08 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.3);
    });
  } catch (_) {}
}

function QuizCat({ mood = 'sleepy' }) {
  const sad = mood === 'sad';
  const happy = mood === 'happy';
  const success = mood === 'success';

  return (
    <motion.div
      animate={{
        y: sad ? [0, 2, 0] : [0, success ? -9 : -4, 0],
        scale: success ? [1, 1.08, 1] : [1, happy ? 1.035 : 1.018, 1],
      }}
      transition={{ duration: sad ? 1.1 : success ? 1.25 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: success ? 168 : 132, height: success ? 168 : 132, position: 'relative', filter: `drop-shadow(0 0 ${success ? 42 : happy ? 34 : 26}px rgba(245,198,214,${success ? 0.42 : 0.26}))` }}
    >
      {(happy || success) && [0, 1, 2, 3].map(i => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.5, y: 8 }}
          animate={{ opacity: [0, 0.65, 0], scale: [0.5, 1, 0.8], y: [-2, -34 - i * 3] }}
          transition={{ duration: 2.7, repeat: Infinity, delay: i * 0.55, repeatDelay: 1.8 }}
          style={{ position: 'absolute', left: `${26 + i * 16}%`, top: `${18 + (i % 2) * 16}%`, fontSize: success ? '1rem' : '0.78rem' }}
        >
          💗
        </motion.span>
      ))}

      <svg viewBox="0 0 180 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`quizCat-${mood}`} cx="38%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fff7fa" />
            <stop offset="65%" stopColor="#f7c7d9" />
            <stop offset="100%" stopColor="#cf789b" />
          </radialGradient>
          <filter id={`quizGlow-${mood}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <motion.path d="M55 54 L38 20 L78 44 Z" fill="#f7c7d9" animate={{ rotate: sad ? -12 : success ? [0, 5, 0] : 0, y: sad ? 8 : 0 }} transition={{ duration: 2.8, repeat: Infinity }} style={{ transformOrigin: '58px 55px' }} />
        <motion.path d="M125 54 L142 20 L102 44 Z" fill="#f7c7d9" animate={{ rotate: sad ? 12 : success ? [0, -5, 0] : 0, y: sad ? 8 : 0 }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.1 }} style={{ transformOrigin: '122px 55px' }} />
        <path d="M55 47 L44 28 L69 45 Z" fill="#e895b4" opacity="0.7" />
        <path d="M125 47 L136 28 L111 45 Z" fill="#e895b4" opacity="0.7" />
        <ellipse cx="90" cy="92" rx="58" ry="52" fill={`url(#quizCat-${mood})`} filter={`url(#quizGlow-${mood})`} />
        <motion.ellipse cx="67" cy="101" rx="10" ry="6" fill="#ef8db0" animate={{ opacity: success ? [0.45, 0.78, 0.45] : 0.4 }} transition={{ duration: 1.8, repeat: Infinity }} />
        <motion.ellipse cx="113" cy="101" rx="10" ry="6" fill="#ef8db0" animate={{ opacity: success ? [0.45, 0.78, 0.45] : 0.4 }} transition={{ duration: 1.8, repeat: Infinity }} />
        <motion.g
          animate={sad ? { scaleY: [1, 0.16, 1] } : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: sad ? 4.8 : 4.2, repeat: Infinity, times: sad ? undefined : [0, 0.86, 0.9, 1] }}
          style={{ transformOrigin: '90px 82px' }}
        >
          <path d={sad ? 'M61 80 Q68 75 75 80' : 'M62 80 Q68 88 75 80'} stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d={sad ? 'M105 80 Q112 75 119 80' : 'M105 80 Q112 88 119 80'} stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
        </motion.g>
        <path d="M86 94 Q90 98 94 94" stroke="#9b4a65" strokeWidth="3" fill="none" strokeLinecap="round" />
        <motion.path d={sad ? 'M78 113 Q90 104 102 113' : 'M77 107 Q90 121 103 107'} stroke="#7b334e" strokeWidth="4" fill="none" strokeLinecap="round" animate={sad ? { y: [0, 1.4, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
        <line x1="45" y1="95" x2="24" y2="89" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        <line x1="45" y1="104" x2="24" y2="107" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        <line x1="135" y1="95" x2="156" y2="89" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        <line x1="135" y1="104" x2="156" y2="107" stroke="#9b4a65" strokeWidth="2" opacity="0.55" />
        {sad && (
          <>
            <motion.ellipse cx="119" cy="88" rx="8" ry="4" fill="#c8e8ff" animate={{ opacity: [0.15, 0.44, 0.15] }} transition={{ duration: 1.4, repeat: Infinity }} />
            <motion.ellipse cx="121" cy="94" rx="3" ry="6" fill="#c8e8ff" animate={{ opacity: [0, 1, 0], y: [0, 24, 36] }} transition={{ duration: 1.1, repeat: Infinity }} />
          </>
        )}
      </svg>
    </motion.div>
  );
}

function Particles({ type, burst }) {
  const items = useMemo(() => Array.from({ length: type === 'broken' ? 8 : 12 }, (_, i) => ({
    id: `${burst}-${i}`,
    x: 20 + Math.random() * 60,
    y: 38 + Math.random() * 22,
    delay: Math.random() * 0.16,
    icon: type === 'broken' ? '💔' : ['💗', '✨', '💖'][i % 3],
  })), [burst, type]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 75, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map(item => (
        <motion.span
          key={item.id}
          initial={{ opacity: 0, scale: 0.55, x: `${item.x}vw`, y: `${item.y}vh` }}
          animate={{ opacity: [0, 0.75, 0], scale: [0.55, 1, 0.82], y: `calc(${item.y}vh - ${type === 'broken' ? 70 : 95}px)` }}
          transition={{ duration: type === 'broken' ? 1.5 : 1.8, delay: item.delay, ease: 'easeOut' }}
          style={{ position: 'absolute', left: 0, top: 0, fontSize: type === 'broken' ? '1rem' : '1.1rem', filter: 'drop-shadow(0 0 10px rgba(245,198,214,0.35))' }}
        >
          {item.icon}
        </motion.span>
      ))}
    </div>
  );
}

export default function QuizGate() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [catMood, setCatMood] = useState('sleepy');
  const [wrongShake, setWrongShake] = useState(false);
  const [burst, setBurst] = useState(0);
  const [success, setSuccess] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const current = QUESTIONS[index];
  const progress = success ? QUESTIONS.length : index;

  function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim() || feedback?.type === 'correct') return;

    const normalized = normalizeAnswer(answer);
    const isCorrect = current.accepted.some(item => normalizeAnswer(item) === normalized);
    setBurst(prev => prev + 1);

    if (isCorrect) {
      playChime('correct');
      navigator.vibrate?.(22);
      const message = current.correct[index % current.correct.length];
      setFeedback({ type: 'correct', text: message });
      setCatMood('happy');

      window.setTimeout(() => {
        if (index === QUESTIONS.length - 1) {
          setSuccess(true);
          setCatMood('success');
          setFeedback(null);
        } else {
          setIndex(prev => prev + 1);
          setAnswer('');
          setFeedback(null);
          setCatMood('sleepy');
        }
      }, 1150);
      return;
    }

    playChime('wrong');
    navigator.vibrate?.(14);
    setFeedback({ type: 'wrong', text: current.wrong[Math.floor(Math.random() * current.wrong.length)] });
    setCatMood('sad');
    setWrongShake(true);
    window.setTimeout(() => setWrongShake(false), 520);
  }

  function enterChats() {
    setLeaving(true);
    playChime('correct');
    window.setTimeout(() => navigate('/chats'), 820);
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
        backgroundImage: 'radial-gradient(circle at 50% 24%, rgba(72,18,48,0.9) 0%, rgba(22,7,22,0.96) 52%, #0b0613 100%)',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '34px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="grain-overlay" style={{ opacity: 0.03, position: 'fixed' }} />
      <motion.div
        animate={{ opacity: success ? 0.34 : [0.12, 0.22, 0.12], scale: success ? [1.02, 1.16, 1.02] : [1, 1.06, 1] }}
        transition={{ duration: success ? 2.4 : 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'fixed', width: 'min(82vw, 560px)', height: 'min(82vw, 560px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.45), transparent 70%)', filter: 'blur(48px)', zIndex: 1, pointerEvents: 'none' }}
      />

      <AnimatePresence>
        {feedback?.type === 'correct' && <Particles key={`good-${burst}`} type="heart" burst={burst} />}
        {feedback?.type === 'wrong' && <Particles key={`bad-${burst}`} type="broken" burst={burst} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
      >
        <QuizCat mood={success ? 'success' : catMood} />

        <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 8 }}>
          {QUESTIONS.map((_, i) => (
            <motion.span
              key={i}
              animate={{ opacity: i < progress ? 1 : 0.35, scale: i < progress ? [1, 1.18, 1] : 1, textShadow: i < progress ? '0 0 14px rgba(245,198,214,0.7)' : 'none' }}
              transition={{ duration: 0.5 }}
              style={{ color: '#f5c6d6', fontSize: '1.05rem' }}
            >
              {i < progress ? '♥' : '♡'}
            </motion.span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(10px)' }} style={{ width: '100%' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 7vw, 3.35rem)', fontWeight: 400, color: '#f5c6d6', textShadow: '0 0 28px rgba(245,198,214,0.28)', margin: 0 }}>
                before you enter... 💗
              </h1>
              <p style={{ marginTop: 8, color: 'rgba(245,198,214,0.76)', fontSize: '0.98rem' }}>
                you must prove you know us properly
              </p>
              <p style={{ marginTop: 8, marginBottom: 22, color: 'rgba(245,198,214,0.42)', fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                very serious relationship examination
              </p>

              <motion.form
                onSubmit={handleSubmit}
                animate={{
                  x: wrongShake ? [0, -8, 8, -6, 6, 0] : 0,
                  boxShadow: feedback?.type === 'correct'
                    ? '0 0 52px rgba(245,198,214,0.34), inset 0 0 42px rgba(245,198,214,0.08)'
                    : feedback?.type === 'wrong'
                      ? '0 0 38px rgba(255,92,135,0.22), inset 0 0 28px rgba(255,92,135,0.06)'
                      : '0 18px 56px rgba(0,0,0,0.28), inset 0 0 34px rgba(245,198,214,0.04)',
                }}
                transition={{ duration: wrongShake ? 0.48 : 0.35 }}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: 26,
                  background: 'rgba(255,255,255,0.055)',
                  border: `1px solid ${feedback?.type === 'wrong' ? 'rgba(255,120,150,0.45)' : 'rgba(245,198,214,0.18)'}`,
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}>
                    <p style={{ color: 'rgba(245,198,214,0.5)', fontSize: '0.76rem', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
                      question {index + 1} / {QUESTIONS.length}
                    </p>
                    <h2 style={{ color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.35rem, 5vw, 2rem)', fontWeight: 400, lineHeight: 1.22, marginBottom: 18 }}>
                      {current.question}
                    </h2>
                    <motion.input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder={current.placeholder}
                      whileFocus={{ scale: 1.025 }}
                      style={{
                        width: '100%',
                        border: `1px solid ${feedback?.type === 'wrong' ? 'rgba(255,120,150,0.66)' : 'rgba(245,198,214,0.2)'}`,
                        borderRadius: 18,
                        background: 'rgba(11,6,19,0.45)',
                        color: '#fff4f8',
                        outline: 'none',
                        padding: '0.98rem 1rem',
                        fontSize: '1rem',
                        textAlign: 'center',
                        boxShadow: 'inset 0 0 24px rgba(0,0,0,0.22)',
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {feedback && (
                    <motion.p
                      key={feedback.text}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      style={{ minHeight: 24, marginTop: 14, color: feedback.type === 'wrong' ? '#ff9fba' : '#f5c6d6', fontSize: '0.92rem', fontStyle: 'italic' }}
                    >
                      {feedback.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button type="submit" className="glass-button" whileTap={{ scale: 0.96, y: 2 }} style={{ marginTop: feedback ? 10 : 18, padding: '0.92rem 2.2rem', color: '#fff4f8', background: 'rgba(245,198,214,0.12)', borderColor: 'rgba(245,198,214,0.28)' }}>
                  submit answer 💌
                </motion.button>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} style={{ width: '100%', position: 'relative' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.span key={i} animate={{ opacity: [0, 0.5, 0], y: [-4, -58], x: [0, i % 2 ? 18 : -18] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.55 }} style={{ position: 'absolute', left: `${18 + i * 16}%`, top: `${5 + (i % 2) * 18}%`, fontSize: '1rem' }}>
                  💗
                </motion.span>
              ))}
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 8vw, 3.7rem)', fontWeight: 400, color: '#f5c6d6', textShadow: '0 0 34px rgba(245,198,214,0.36)' }}>
                identity confirmed 💖
              </h1>
              <p style={{ marginTop: 12, color: 'rgba(245,198,214,0.72)', fontSize: '1rem' }}>
                okay you may enter now...
              </p>
              <motion.button onClick={enterChats} className="glass-button" whileTap={{ scale: 0.96, y: 2 }} animate={{ boxShadow: ['0 0 22px rgba(245,198,214,0.22)', '0 0 48px rgba(245,198,214,0.45)', '0 0 22px rgba(245,198,214,0.22)'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ marginTop: 28, padding: '1.05rem 2.35rem', color: '#fff4f8', background: 'rgba(245,198,214,0.15)', borderColor: 'rgba(245,198,214,0.36)' }}>
                open our little world 💌
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {leaving && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: [0, 1, 0], backdropFilter: ['blur(0px)', 'blur(12px)', 'blur(0px)'] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: 'easeInOut' }}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'radial-gradient(circle, rgba(245,198,214,0.34), rgba(11,6,19,0.76) 70%)', pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
