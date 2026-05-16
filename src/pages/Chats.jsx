import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { pageVariants } from './variants';
import Waveform from '../components/Waveform';
import CuteCat from '../components/CuteCat';
import SleepingCat from '../components/SleepingCat';

const NOTES = [
  {
    id: 'annoying',
    icon: '😤',
    title: "you're annoying but i love you",
    context: 'this one took 8 tries',
    detail: 'teasing, but unfortunately true',
    duration: 16,
    tone: 'playful',
    reveal: 'i was smiling while recording this.',
    script: [
      { at: 0.12, text: 'first of all, you are very annoying.' },
      { at: 0.35, text: 'like genuinely. professionally annoying.' },
      { at: 0.62, text: 'but also... i love you.' },
      { at: 0.84, text: 'do not smile. i know you smiled.' },
    ],
    hold: false,
  },
  {
    id: 'missme',
    icon: '🎀',
    title: 'open when you miss me',
    context: 'hold to unlock',
    detail: 'kept somewhere soft',
    duration: 21,
    tone: 'soft',
    reveal: 'this was meant for the nights that feel too far.',
    script: [
      { at: 0.12, text: 'if you miss me, listen softly.' },
      { at: 0.38, text: 'i am probably missing you too.' },
      { at: 0.65, text: 'distance is stupid.' },
      { at: 0.88, text: 'come here. virtually, for now.' },
    ],
    hold: true,
  },
  {
    id: 'sleep',
    icon: '🌙',
    title: "couldn't sleep tonight",
    context: 'recorded at 2:14 AM',
    detail: 'small sleepy message',
    duration: 18,
    tone: 'sleepy',
    reveal: 'i almost sent this at 3am.',
    script: [
      { at: 0.08, text: 'hi... um. you are probably asleep.' },
      { at: 0.32, text: 'i could not sleep, obviously.' },
      { at: 0.58, text: 'i just missed you a little too loudly.' },
      { at: 0.82, text: 'okay bye before i get embarrassing.' },
    ],
    hold: false,
  },
  {
    id: 'hard_to_say',
    icon: '🥹',
    title: 'this one was hard to say',
    context: 'but i meant every word',
    detail: 'very honest, very quiet',
    duration: 28,
    tone: 'vulnerable',
    reveal: 'i had to restart because my voice got weird.',
    script: [
      { at: 0.1, text: 'this one is harder.' },
      { at: 0.36, text: 'because jokes are easier than honesty.' },
      { at: 0.62, text: 'but you make my life softer.' },
      { at: 0.86, text: 'and i am really grateful you exist.' },
    ],
    hold: false,
  },
  {
    id: 'more_than_say',
    icon: '💗',
    title: 'i love you more than i say',
    context: 'recorded quietly at night',
    detail: 'soft emotional confession',
    duration: 24,
    tone: 'warm',
    reveal: 'i paused here because i got shy.',
    script: [
      { at: 0.1, text: 'i keep trying to say this normally...' },
      { at: 0.34, text: 'and then i forget every word.' },
      { at: 0.61, text: 'you matter to me. a lot.' },
      { at: 0.86, text: 'more than i act like sometimes.' },
    ],
    hold: false,
  },
];

const FINAL_NOTE = {
  id: 'birthday_real',
  icon: '❤️',
  title: 'happy birthday, my love',
  context: 'the one i really wanted to send',
  detail: 'the one i meant the most',
  duration: 19,
  tone: 'final',
  reveal: 'happy birthday, my love.',
  script: [
    { at: 0.12, text: 'happy birthday, my love.' },
    { at: 0.38, text: 'i wish i could say this right next to you.' },
    { at: 0.64, text: 'but until then...' },
    { at: 0.86, text: 'this is my little voice reaching you.' },
  ],
};

function formatTime(value) {
  const seconds = Math.max(0, Math.floor(value));
  return `0:${String(seconds).padStart(2, '0')}`;
}

function makeWave(seed, count = 34) {
  return Array.from({ length: count }, (_, i) => {
    const pause = i % 11 === 0 ? 0.42 : 1;
    const base = Math.sin((i + seed) * 0.72) * 0.5 + Math.sin((i + seed) * 1.9) * 0.25;
    return (9 + Math.abs(base) * 28 + ((i + seed) % 5) * 2) * pause;
  });
}

function startVoiceTexture(note) {
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return { stop() {} };
    
    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(note.tone === 'final' ? 0.085 : 0.065, ctx.currentTime + 0.5);
    master.connect(ctx.destination);

    const freqs = {
      sleepy: [185, 246, 329],
      warm: [210, 280, 420],
      playful: [240, 320, 480],
      soft: [196, 262, 392],
      vulnerable: [174, 233, 349],
      final: [164, 220, 330, 440],
    }[note.tone] || [210, 280, 420];

    const oscillators = freqs.map((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = index % 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      lfo.frequency.value = 0.18 + index * 0.06;
      lfoGain.gain.value = 2.4 + index;
      gain.gain.setValueAtTime(0.012 + index * 0.004, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      lfo.start();
      return { osc, lfo, gain };
    });

    const breathTimes = [0.18, 0.42, 0.71];
    const breathTimers = breathTimes.map((time, index) => globalThis.setTimeout(() => {
      try {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
        const breath = buffer.getChannelData(0);
        for (let i = 0; i < breath.length; i += 1) {
          breath[i] = (Math.random() * 2 - 1) * 0.045 * (1 - i / breath.length);
        }
        const source = ctx.createBufferSource();
        const breathFilter = ctx.createBiquadFilter();
        const breathGain = ctx.createGain();
        source.buffer = buffer;
        breathFilter.type = 'lowpass';
        breathFilter.frequency.value = 900 + index * 180;
        breathGain.gain.value = note.tone === 'final' ? 0.035 : 0.025;
        source.connect(breathFilter);
        breathFilter.connect(breathGain);
        breathGain.connect(master);
        source.start();
      } catch (err) { console.warn('Breath audio failed:', err); }
    }, Math.max(180, note.duration * 1000 * time)));

    const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate);
    const data = hissBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.035;
    }
    const hiss = ctx.createBufferSource();
    hiss.buffer = hissBuffer;
    hiss.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    const hissGain = ctx.createGain();
    hissGain.gain.value = note.tone === 'final' ? 0.025 : 0.018;
    hiss.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(master);
    hiss.start();

    return {
      stop() {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
        globalThis.setTimeout(() => {
          oscillators.forEach(({ osc, lfo }) => {
            try { osc.stop(); lfo.stop(); } catch (err) { console.warn('Osc stop failed:', err); }
          });
          breathTimers.forEach(clearTimeout);
          try { hiss.stop(); ctx.close(); } catch (err) { console.warn('Hiss stop failed:', err); }
        }, 420);
      },
    };
  } catch (e) {
    console.warn('Voice texture failed:', e);
    return { stop() {} };
  }
}

function startRoomAmbience() {
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return { stop() {} };
    
    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 1.2);
    master.connect(ctx.destination);

    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'sine';
    hum.frequency.value = 92;
    humGain.gain.value = 0.018;
    hum.connect(humGain);
    humGain.connect(master);
    hum.start();

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 1.4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.018;
    }
    const hiss = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const hissGain = ctx.createGain();
    hiss.buffer = buffer;
    hiss.loop = true;
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.5;
    hissGain.gain.value = 0.016;
    hiss.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(master);
    hiss.start();

    return {
      stop() {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        globalThis.setTimeout(() => {
          try { hum.stop(); hiss.stop(); ctx.close(); } catch (err) { console.warn('Ambience stop failed:', err); }
        }, 700);
      },
    };
  } catch (e) {
    console.warn('Room ambience failed:', e);
    return { stop() {} };
  }
}

function VoiceNoteCard({
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
  const holdIntervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);

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
  const currentLine = active && note.script
    ? [...note.script].reverse().find(line => progress >= line.at)?.text
    : '';

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
        padding: '1rem',
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
            {formatTime(note.duration)}
          </span>
        </div>

        {locked ? (
          <div>
            <motion.button
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="glass-button"
              animate={holding ? { scale: 0.97, boxShadow: '0 0 30px rgba(245,198,214,0.3)' } : {}}
              style={{ width: '100%', padding: '0.8rem', justifyContent: 'center' }}
            >
              hold to listen
            </motion.button>
            <div style={{ marginTop: 10, height: 3, width: '100%', borderRadius: 999, background: 'rgba(245,198,214,0.1)', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${holdProgress * 100}%` }} style={{ height: '100%', background: '#f5c6d6' }} />
            </div>
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
              {formatTime(note.duration * progress)}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentLine && (
            <motion.p
              key={currentLine}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 12, color: 'rgba(255,238,245,0.7)', fontSize: '0.85rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.8rem', borderRadius: 12 }}
            >
              “{currentLine}”
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

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
  const ambienceRef = useRef(null);
  const timersRef = useRef({});

  useEffect(() => () => {
    audioRef.current?.stop();
    ambienceRef.current?.stop();
    Object.values(timersRef.current).forEach(globalThis.clearInterval);
  }, []);

  const playNote = useCallback((note) => {
    if (activeId === note.id) {
      audioRef.current?.stop();
      audioRef.current = null;
      globalThis.clearInterval(timersRef.current[note.id]);
      setActiveId(null);
      return;
    }

    if (activeId) {
      audioRef.current?.stop();
      globalThis.clearInterval(timersRef.current[activeId]);
    }

    if (!ambienceRef.current) ambienceRef.current = startRoomAmbience();

    setActiveId(note.id);
    setProgress(prev => ({ ...prev, [note.id]: 0 }));
    audioRef.current = startVoiceTexture(note);

    const started = Date.now();
    timersRef.current[note.id] = globalThis.setInterval(() => {
      const next = Math.min(1, (Date.now() - started) / (note.duration * 1000));
      setProgress(prev => ({ ...prev, [note.id]: next }));
      if (next >= 1) {
        globalThis.clearInterval(timersRef.current[note.id]);
        audioRef.current?.stop();
        setActiveId(null);
        setUnlocked(prev => {
          const updated = { ...prev, [note.id]: true };
          const finishedCount = Object.keys(updated).length;
          if (note.id === 'hard_to_say' || finishedCount >= 3) setShowFinal(true);
          return updated;
        });
      }
    }, 32);
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
              onHoldUnlock={(id) => setUnlocked(prev => ({ ...prev, [id]: true }))}
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
              onHoldUnlock={() => {}}
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
