import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionTemplate, useScroll, useTransform } from 'framer-motion';
import { pageVariants } from './variants';

const NOTES = [
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
    id: 'properly',
    icon: '💗',
    title: 'something i never said properly',
    context: 'after missing you too much',
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
    id: 'hard',
    icon: '🥹',
    title: 'this one was hard to record',
    context: "couldn't say it normally",
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
];

const FINAL_NOTE = {
  id: 'birthday',
  icon: '❤️',
  title: 'happy birthday',
  context: 'just this',
  detail: 'the one i meant the most',
  duration: 32,
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
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
    const breathTimers = breathTimes.map((time, index) => setTimeout(() => {
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
      } catch (_) {}
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
        setTimeout(() => {
          oscillators.forEach(({ osc, lfo }) => {
            try { osc.stop(); lfo.stop(); } catch (_) {}
          });
          breathTimers.forEach(clearTimeout);
          try { hiss.stop(); ctx.close(); } catch (_) {}
        }, 420);
      },
    };
  } catch (_) {
    return { stop() {} };
  }
}

function startRoomAmbience() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
        setTimeout(() => {
          try { hum.stop(); hiss.stop(); ctx.close(); } catch (_) {}
        }, 700);
      },
    };
  } catch (_) {
    return { stop() {} };
  }
}

function HeadphoneCat() {
  return (
    <motion.div
      animate={{ y: [0, -5, 0], scale: [1, 1.018, 1] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: 140, height: 140, position: 'relative', filter: 'drop-shadow(0 0 30px rgba(245,198,214,0.28))' }}
    >
      <svg viewBox="0 0 180 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="voiceCatFace" cx="38%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#fff7fa" />
            <stop offset="65%" stopColor="#f6c9d8" />
            <stop offset="100%" stopColor="#d487a5" />
          </radialGradient>
        </defs>
        <motion.path d="M55 55 L39 22 L78 45 Z" fill="#f6c9d8" animate={{ rotate: [-1, 2, -1] }} transition={{ duration: 4, repeat: Infinity }} style={{ transformOrigin: '58px 55px' }} />
        <motion.path d="M125 55 L141 22 L102 45 Z" fill="#f6c9d8" animate={{ rotate: [1, -2, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 0.2 }} style={{ transformOrigin: '122px 55px' }} />
        <ellipse cx="90" cy="94" rx="58" ry="52" fill="url(#voiceCatFace)" />
        <path d="M48 70 Q90 26 132 70" stroke="#b96b91" strokeWidth="8" fill="none" strokeLinecap="round" />
        <rect x="36" y="74" width="18" height="36" rx="9" fill="#7e3157" opacity="0.92" />
        <rect x="126" y="74" width="18" height="36" rx="9" fill="#7e3157" opacity="0.92" />
        <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 4.8, repeat: Infinity, times: [0, 0.88, 0.91, 1] }} style={{ transformOrigin: '90px 84px' }}>
          <path d="M62 82 Q68 89 75 82" stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M105 82 Q112 89 119 82" stroke="#4b2136" strokeWidth="5" fill="none" strokeLinecap="round" />
        </motion.g>
        <ellipse cx="67" cy="102" rx="10" ry="6" fill="#ef8db0" opacity="0.42" />
        <ellipse cx="113" cy="102" rx="10" ry="6" fill="#ef8db0" opacity="0.42" />
        <path d="M86 95 Q90 99 94 95" stroke="#9b4a65" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M80 110 Q90 118 100 110" stroke="#7b334e" strokeWidth="4" fill="none" strokeLinecap="round" />
        <text x="118" y="50" fontSize="19">🎀</text>
      </svg>
    </motion.div>
  );
}

function TeddyBear({ hugging = false }) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        scale: hugging ? [1, 1.08, 0.98, 1] : [1, 1.018, 1],
      }}
      transition={{ duration: hugging ? 1 : 4.2, repeat: hugging ? 0 : Infinity, ease: 'easeInOut' }}
      style={{ width: 164, height: 164, position: 'relative', filter: 'drop-shadow(0 0 36px rgba(245,198,214,0.35))' }}
    >
      <svg viewBox="0 0 180 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="teddyFur" cx="38%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#f4c6cc" />
            <stop offset="60%" stopColor="#b96f7d" />
            <stop offset="100%" stopColor="#713848" />
          </radialGradient>
          <radialGradient id="heartGlow" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffe8ef" />
            <stop offset="65%" stopColor="#ef8db0" />
            <stop offset="100%" stopColor="#b94d74" />
          </radialGradient>
        </defs>
        <circle cx="53" cy="54" r="22" fill="#9b5868" />
        <circle cx="127" cy="54" r="22" fill="#9b5868" />
        <circle cx="53" cy="54" r="11" fill="#d894a1" opacity="0.65" />
        <circle cx="127" cy="54" r="11" fill="#d894a1" opacity="0.65" />
        <ellipse cx="90" cy="85" rx="53" ry="48" fill="url(#teddyFur)" />
        <ellipse cx="90" cy="103" rx="23" ry="18" fill="#efc3ca" opacity="0.72" />
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 5.8, repeat: Infinity, times: [0, 0.9, 0.93, 1] }}
          style={{ transformOrigin: '90px 78px' }}
        >
          <path d="M67 78 Q73 84 79 78" stroke="#3d1d25" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M101 78 Q107 84 113 78" stroke="#3d1d25" strokeWidth="4" fill="none" strokeLinecap="round" />
        </motion.g>
        <path d="M86 93 Q90 97 94 93" stroke="#5d2b37" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M78 106 Q90 114 102 106" stroke="#5d2b37" strokeWidth="4" fill="none" strokeLinecap="round" />
        <motion.path
          d="M90 136 C62 115 50 98 66 84 C78 73 89 84 90 94 C91 84 102 73 114 84 C130 98 118 115 90 136 Z"
          fill="url(#heartGlow)"
          animate={{ scale: hugging ? [1, 0.9, 1.04, 1] : [1, 1.035, 1] }}
          transition={{ duration: hugging ? 1 : 2.8, repeat: hugging ? 0 : Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '90px 104px' }}
        />
        <motion.path d="M47 108 Q65 120 78 111" stroke="#8c4e5d" strokeWidth="13" fill="none" strokeLinecap="round" animate={{ rotate: hugging ? [0, 8, 0] : 0 }} style={{ transformOrigin: '70px 110px' }} />
        <motion.path d="M133 108 Q115 120 102 111" stroke="#8c4e5d" strokeWidth="13" fill="none" strokeLinecap="round" animate={{ rotate: hugging ? [0, -8, 0] : 0 }} style={{ transformOrigin: '110px 110px' }} />
      </svg>
    </motion.div>
  );
}

function Waveform({ bars, active, progress, minimal = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: minimal ? 4 : 3, height: minimal ? 70 : 52, flex: 1 }}>
      {bars.map((height, index) => {
        const passed = index / bars.length <= progress;
        return (
          <motion.span
            key={index}
            animate={{
              height: active ? [height * 0.55, height * (0.9 + (index % 4) * 0.1), height * 0.62] : height * 0.55,
              opacity: passed || active ? 0.95 : 0.3,
              backgroundColor: passed ? 'rgba(255,225,236,0.92)' : 'rgba(245,198,214,0.35)',
              boxShadow: passed ? '0 0 10px rgba(245,198,214,0.34)' : 'none',
            }}
            transition={{ duration: 0.75 + (index % 5) * 0.05, repeat: active ? Infinity : 0, ease: 'easeInOut', delay: index * 0.012 }}
            style={{
              width: minimal ? 4 : 3,
              borderRadius: 999,
              minHeight: 5,
            }}
          />
        );
      })}
    </div>
  );
}

function VoiceNoteCard({
  note,
  index,
  active,
  progress,
  replayCount,
  finished,
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
    clearInterval(holdIntervalRef.current);
    clearTimeout(holdTimeoutRef.current);
  }, []);

  function startHold() {
    if (!note.hold || unlocked) return;
    setHolding(true);
    setHoldProgress(0);
    clearInterval(holdIntervalRef.current);
    clearTimeout(holdTimeoutRef.current);
    const started = Date.now();
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(Math.min(1, (Date.now() - started) / 850));
    }, 30);
    holdTimeoutRef.current = setTimeout(() => {
      clearInterval(holdIntervalRef.current);
      setHoldProgress(1);
      setHolding(false);
      onHoldUnlock(note.id);
    }, 850);
  }

  function stopHold() {
    if (!unlocked && holding) {
      clearInterval(holdIntervalRef.current);
      clearTimeout(holdTimeoutRef.current);
      setHoldProgress(0);
    }
    setHolding(false);
  }

  const locked = note.hold && !unlocked;
  const replayText = replayCount >= 3
    ? 'you really like this one huh'
    : replayCount >= 2
      ? 'again? 🥹'
      : replayCount >= 1 && note.id === 'hard'
        ? 'this one made me nervous'
        : '';
  const currentLine = active && note.script
    ? [...note.script].reverse().find(line => progress >= line.at)?.text
    : '';

  return (
    <motion.article
      initial={{ opacity: 0, y: 42, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-16%' }}
      whileHover={{ y: -4, rotate: index % 2 ? -0.5 : 0.5 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: note.tone === 'final' ? 520 : 620,
        margin: note.tone === 'final' ? '0 auto' : `${index === 0 ? 0 : -8}px auto 10px`,
        padding: note.tone === 'final' ? '1.4rem' : '1rem',
        borderRadius: note.tone === 'final' ? 28 : 24,
        background: note.tone === 'final'
          ? 'rgba(10,4,12,0.72)'
          : 'linear-gradient(145deg, rgba(75,22,48,0.32), rgba(255,255,255,0.045))',
        border: `1px solid ${active ? 'rgba(245,198,214,0.42)' : 'rgba(245,198,214,0.14)'}`,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: active
          ? '0 18px 70px rgba(0,0,0,0.38), 0 0 52px rgba(245,198,214,0.18), inset 0 0 44px rgba(245,198,214,0.06)'
          : '0 14px 46px rgba(0,0,0,0.28), inset 0 0 32px rgba(245,198,214,0.035)',
        overflow: 'hidden',
      }}
    >
      {active && (
        <motion.div
          layoutId="voice-note-bloom"
          animate={{ opacity: [0.18, 0.34, 0.18], scale: [0.88, 1.2, 0.88] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: -60, background: 'radial-gradient(circle, rgba(245,198,214,0.22), transparent 65%)', filter: 'blur(24px)', zIndex: 0 }}
        />
      )}

      {active && [0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ opacity: [0, 0.45, 0], y: [-2, -42], x: [0, i % 2 ? 14 : -14] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.7, repeatDelay: 1.8 }}
          style={{ position: 'absolute', right: `${18 + i * 12}%`, top: '18%', zIndex: 1, fontSize: '0.9rem' }}
        >
          💗
        </motion.span>
      ))}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {note.tone !== 'final' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <p style={{ color: 'rgba(245,198,214,0.46)', fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {note.context}
              </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'rgba(245,198,214,0.36)', fontSize: '0.64rem' }}>
                  <motion.span animate={{ opacity: active ? [0.35, 1, 0.35] : 0.35 }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#f5c6d6' : 'rgba(245,198,214,0.45)' }} />
                  unsent recording
                </span>
              </div>
              <h2 style={{ color: '#ffe4ed', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.28rem, 5vw, 2rem)', fontWeight: 400, lineHeight: 1.15, textShadow: '0 0 18px rgba(245,198,214,0.16)' }}>
                {note.icon} {note.title}
              </h2>
              <p style={{ marginTop: 6, color: 'rgba(255,224,236,0.66)', fontSize: '0.82rem' }}>
                {note.detail}
              </p>
            </div>
            <span style={{ color: 'rgba(245,198,214,0.48)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {formatTime(note.duration)}
            </span>
          </div>
        )}

        {locked ? (
          <div>
            <motion.button
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onPointerCancel={stopHold}
              className="glass-button"
              animate={{ scale: holding ? 0.98 : [1, 1.018, 1], boxShadow: holding ? '0 0 44px rgba(245,198,214,0.34)' : undefined }}
              transition={{ duration: 1.6, repeat: holding ? 0 : Infinity }}
              style={{ width: '100%', padding: '1rem', color: '#fff4f8', justifyContent: 'center' }}
            >
              hold to listen
            </motion.button>
            <div style={{ marginTop: 10, height: 3, width: '100%', borderRadius: 999, background: 'rgba(245,198,214,0.12)', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${holdProgress * 100}%` }} transition={{ duration: 0.08 }} style={{ height: '100%', background: 'linear-gradient(90deg, rgba(245,198,214,0.45), rgba(255,245,250,0.95))', boxShadow: '0 0 12px rgba(245,198,214,0.4)' }} />
            </div>
            <p style={{ marginTop: 8, color: 'rgba(245,198,214,0.45)', fontSize: '0.74rem', fontStyle: 'italic' }}>
              keep holding. this one is tucked away.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button
              onClick={() => onPlay(note)}
              whileTap={{ scale: 0.92 }}
              animate={{ boxShadow: active ? ['0 0 20px rgba(245,198,214,0.34)', '0 0 38px rgba(245,198,214,0.52)', '0 0 20px rgba(245,198,214,0.34)'] : '0 0 18px rgba(245,198,214,0.18)' }}
              transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
              style={{
                width: note.tone === 'final' ? 58 : 48,
                height: note.tone === 'final' ? 58 : 48,
                borderRadius: '50%',
                border: '1px solid rgba(245,198,214,0.28)',
                background: active ? 'rgba(245,198,214,0.2)' : 'rgba(245,198,214,0.1)',
                color: '#fff4f8',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: note.tone === 'final' ? '1.2rem' : '1rem',
              }}
              aria-label={active ? 'pause voice note' : 'play voice note'}
            >
              {active ? 'Ⅱ' : '▶'}
            </motion.button>
            <Waveform bars={bars} active={active} progress={progress} minimal={note.tone === 'final'} />
            <span style={{ minWidth: 42, color: 'rgba(245,198,214,0.5)', fontSize: '0.76rem', textAlign: 'right' }}>
              {formatTime(note.duration * progress)}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentLine && (
            <motion.div
              key={currentLine}
              initial={{ opacity: 0, y: 8, filter: 'blur(7px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -5, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{
                marginTop: 14,
                padding: note.tone === 'final' ? '0.75rem 1rem' : '0.62rem 0.8rem',
                borderRadius: 16,
                background: 'rgba(11,6,19,0.34)',
                border: '1px solid rgba(245,198,214,0.08)',
                color: 'rgba(255,238,245,0.78)',
                fontSize: note.tone === 'final' ? '0.95rem' : '0.84rem',
                fontStyle: 'italic',
                lineHeight: 1.55,
                textAlign: note.tone === 'final' ? 'center' : 'left',
              }}
            >
              “{currentLine}”
            </motion.div>
          )}
        </AnimatePresence>

        {note.tone === 'final' && (
          <p style={{ marginTop: 18, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.35rem, 6vw, 2.2rem)', fontStyle: 'italic', textAlign: 'center' }}>
            happy birthday, my love.
          </p>
        )}

        <AnimatePresence>
          {finished && note.reveal && (
            <motion.p
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 0.78, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{ marginTop: 14, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: note.tone === 'final' ? '1.05rem' : '0.98rem', textAlign: note.tone === 'final' ? 'center' : 'left' }}
            >
              {note.reveal}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {replayText && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 10, color: '#f5c6d6', fontSize: '0.78rem', fontStyle: 'italic' }}
            >
              {replayText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function FinalAudioPlayer({ note, active, progress, finished, replayCount, onPlay }) {
  const bars = useMemo(() => makeWave(19, 48), []);
  const currentLine = active && note.script
    ? [...note.script].reverse().find(line => progress >= line.at)?.text
    : '';
  const replayText = replayCount >= 2 ? 'you came back to this one 🥹' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-18%' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        maxWidth: 520,
        position: 'relative',
        padding: '1.3rem',
        borderRadius: 30,
        background: 'linear-gradient(145deg, rgba(70,18,48,0.34), rgba(255,255,255,0.05))',
        border: `1px solid ${active ? 'rgba(245,198,214,0.46)' : 'rgba(245,198,214,0.16)'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: active
          ? '0 22px 80px rgba(0,0,0,0.42), 0 0 70px rgba(245,198,214,0.22), inset 0 0 48px rgba(245,198,214,0.08)'
          : '0 18px 58px rgba(0,0,0,0.34), inset 0 0 36px rgba(245,198,214,0.045)',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ opacity: active ? [0.2, 0.42, 0.2] : [0.1, 0.2, 0.1], scale: active ? [0.9, 1.2, 0.9] : [1, 1.06, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: -70, background: 'radial-gradient(circle, rgba(245,198,214,0.22), transparent 64%)', filter: 'blur(28px)' }}
      />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <p style={{ color: 'rgba(245,198,214,0.5)', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
          this one matters most.
        </p>
        <h2 style={{ color: '#ffe4ed', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.65rem, 7vw, 2.7rem)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.12, textShadow: '0 0 28px rgba(245,198,214,0.22)', marginBottom: 18 }}>
          happy birthday, my love.
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.button
            onClick={() => onPlay(note)}
            whileTap={{ scale: 0.92 }}
            animate={{ boxShadow: active ? ['0 0 24px rgba(245,198,214,0.38)', '0 0 54px rgba(245,198,214,0.58)', '0 0 24px rgba(245,198,214,0.38)'] : ['0 0 18px rgba(245,198,214,0.18)', '0 0 30px rgba(245,198,214,0.28)', '0 0 18px rgba(245,198,214,0.18)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '1px solid rgba(245,198,214,0.32)',
              background: active ? 'rgba(245,198,214,0.22)' : 'rgba(245,198,214,0.12)',
              color: '#fff4f8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flex: '0 0 auto',
            }}
            aria-label={active ? 'pause final voice note' : 'play final voice note'}
          >
            {active ? 'Ⅱ' : '▶'}
          </motion.button>
          <Waveform bars={bars} active={active} progress={progress} minimal />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'rgba(245,198,214,0.48)', fontSize: '0.72rem' }}>
          <span>{formatTime(note.duration * progress)}</span>
          <span>{formatTime(note.duration)}</span>
        </div>
        <AnimatePresence mode="wait">
          {currentLine && (
            <motion.p
              key={currentLine}
              initial={{ opacity: 0, y: 8, filter: 'blur(7px)' }}
              animate={{ opacity: 0.82, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(6px)' }}
              transition={{ duration: 0.55 }}
              style={{ marginTop: 16, color: 'rgba(255,238,245,0.78)', fontSize: '0.94rem', fontStyle: 'italic', lineHeight: 1.6 }}
            >
              “{currentLine}”
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {finished && (
            <motion.p initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }} animate={{ opacity: 0.82, y: 0, filter: 'blur(0px)' }} style={{ marginTop: 16, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.05rem' }}>
              {note.reveal}
            </motion.p>
          )}
        </AnimatePresence>
        {replayText && <p style={{ marginTop: 10, color: 'rgba(245,198,214,0.5)', fontSize: '0.78rem', fontStyle: 'italic' }}>{replayText}</p>}
      </div>
    </motion.div>
  );
}

export default function Chats() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const warmth = useTransform(scrollYProgress, [0, 0.55, 1], [0.08, 0.18, 0.28]);
  const driftY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const glowBackground = useMotionTemplate`radial-gradient(circle at 50% 42%, rgba(245,198,214,${warmth}), transparent 58%)`;
  const [activeId, setActiveId] = useState(null);
  const [progress, setProgress] = useState({});
  const [finished, setFinished] = useState({});
  const [replays, setReplays] = useState({});
  const [unlocked, setUnlocked] = useState({});
  const [showFinalButton, setShowFinalButton] = useState(false);
  const [finalPulse, setFinalPulse] = useState(false);
  const audioRef = useRef(null);
  const ambienceRef = useRef(null);
  const timersRef = useRef({});

  useEffect(() => () => {
    audioRef.current?.stop();
    ambienceRef.current?.stop();
    Object.values(timersRef.current).forEach(clearInterval);
  }, []);

  function startAmbienceOnce() {
    if (ambienceRef.current) return;
    ambienceRef.current = startRoomAmbience();
  }

  useEffect(() => {
    const start = () => startAmbienceOnce();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  function stopCurrent() {
    audioRef.current?.stop();
    audioRef.current = null;
    if (activeId && timersRef.current[activeId]) {
      clearInterval(timersRef.current[activeId]);
      delete timersRef.current[activeId];
    }
    setActiveId(null);
  }

  function playNote(note) {
    if (activeId === note.id) {
      stopCurrent();
      return;
    }

    stopCurrent();
    startAmbienceOnce();
    setActiveId(note.id);
    setProgress(prev => ({ ...prev, [note.id]: 0 }));
    setReplays(prev => ({ ...prev, [note.id]: (prev[note.id] || 0) + 1 }));
    audioRef.current = startVoiceTexture(note);

    const started = Date.now();
    timersRef.current[note.id] = setInterval(() => {
      const next = Math.min(1, (Date.now() - started) / (note.duration * 1000));
      setProgress(prev => ({ ...prev, [note.id]: next }));
      window.dispatchEvent(new CustomEvent('ambient-pulse', { detail: { strength: 0.16 + next * 0.18 } }));

      if (next >= 1) {
        clearInterval(timersRef.current[note.id]);
        delete timersRef.current[note.id];
        audioRef.current?.stop();
        audioRef.current = null;
        setActiveId(null);
        setFinished(prev => ({ ...prev, [note.id]: true }));
        if (note.id === FINAL_NOTE.id) {
          setFinalPulse(true);
          setTimeout(() => setFinalPulse(false), 1100);
          setTimeout(() => setShowFinalButton(true), 900);
        }
      }
    }, 80);
  }

  function unlockNote(id) {
    startAmbienceOnce();
    navigator.vibrate?.(26);
    setUnlocked(prev => ({ ...prev, [id]: true }));
  }

  function handleFinalEnter() {
    startAmbienceOnce();
    setTimeout(() => setShowFinalButton(true), 5000);
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page"
      style={{
        backgroundColor: '#0b0613',
        backgroundImage: 'radial-gradient(circle at 50% 12%, rgba(58,16,43,0.94) 0%, rgba(19,6,19,0.98) 54%, #07030d 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '58px 20px 90px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div className="grain-overlay" style={{ opacity: 0.03, position: 'fixed' }} />
      <motion.div style={{ position: 'fixed', inset: 0, y: driftY, background: glowBackground, filter: 'blur(18px)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle, transparent 28%, rgba(0,0,0,0.58) 100%)', pointerEvents: 'none', zIndex: 2 }} />

      <motion.header
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: 680, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}
      >
        <HeadphoneCat />
        <h1 style={{ marginTop: 12, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(2.2rem, 8vw, 4.1rem)', lineHeight: 1.05, textShadow: '0 0 30px rgba(245,198,214,0.32)' }}>
          voice notes we never sent 🎧
        </h1>
        <p style={{ marginTop: 12, color: 'rgba(245,198,214,0.72)', fontSize: 'clamp(0.95rem, 3vw, 1.08rem)', lineHeight: 1.6 }}>
          things i wanted you to hear... even from far away
        </p>
        <motion.p
          animate={{ opacity: [0.38, 0.78, 0.38], textShadow: ['0 0 10px rgba(245,198,214,0.16)', '0 0 22px rgba(245,198,214,0.34)', '0 0 10px rgba(245,198,214,0.16)'] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ marginTop: 10, color: '#f5c6d6', fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase' }}
        >
          best listened to softly.
        </motion.p>
      </motion.header>

      <main style={{ position: 'relative', zIndex: 5, width: '100%', maxWidth: 680 }}>
        {NOTES.map((note, index) => (
          <VoiceNoteCard
            key={note.id}
            note={note}
            index={index}
            active={activeId === note.id}
            progress={progress[note.id] || 0}
            replayCount={replays[note.id] || 0}
            finished={finished[note.id]}
            unlocked={unlocked[note.id]}
            onPlay={playNote}
            onHoldUnlock={unlockNote}
          />
        ))}

        <motion.section
          onViewportEnter={handleFinalEnter}
          viewport={{ once: true, margin: '-25%' }}
          style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '12vh 0 max(8vh, 86px)' }}
        >
          <div style={{ position: 'absolute', inset: '-8vh -20px 0', background: 'radial-gradient(circle at 50% 36%, rgba(106,28,68,0.24), rgba(245,198,214,0.08) 34%, transparent 62%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.42) 52%, rgba(0,0,0,0.58) 100%)', pointerEvents: 'none' }} />
          <motion.div
            animate={{ opacity: finalPulse ? [0.25, 0.72, 0.24] : [0.18, 0.4, 0.18], scale: finalPulse ? [0.8, 1.36, 0.95] : [0.86, 1.16, 0.86] }}
            transition={{ duration: finalPulse ? 1.1 : 5.4, repeat: finalPulse ? 0 : Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', width: 'min(86vw, 430px)', height: 'min(64vw, 310px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,198,214,0.3), rgba(106,28,68,0.2) 38%, transparent 70%)', filter: 'blur(34px)' }}
          />
          {[0, 1, 2, 3, 4].map(i => (
            <motion.span
              key={i}
              animate={{ opacity: [0, 0.34, 0], y: [-4, -58], x: [0, i % 2 ? 16 : -16] }}
              transition={{ duration: 5.2, repeat: Infinity, delay: i * 0.9, repeatDelay: 2.4 }}
              style={{ position: 'absolute', left: `${18 + i * 15}%`, top: `${20 + (i % 3) * 18}%`, fontSize: i % 2 ? '0.8rem' : '0.95rem', zIndex: 4 }}
            >
              {i % 2 ? '✨' : '💗'}
            </motion.span>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}
          >
            <TeddyBear hugging={finalPulse} />
            <p style={{ marginTop: 18, maxWidth: 520, color: '#f5c6d6', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.55rem, 6vw, 2.6rem)', fontStyle: 'italic', lineHeight: 1.22, background: 'linear-gradient(180deg, #ffe3ed, #d88aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 28px rgba(245,198,214,0.18)' }}>
              if i were there,<br />
              i'd probably be hugging you right now.
            </p>
          </motion.div>
          <FinalAudioPlayer
            note={FINAL_NOTE}
            active={activeId === FINAL_NOTE.id}
            progress={progress[FINAL_NOTE.id] || 0}
            replayCount={replays[FINAL_NOTE.id] || 0}
            finished={finished[FINAL_NOTE.id]}
            unlocked
            onPlay={playNote}
          />
          <AnimatePresence>
            {finished[FINAL_NOTE.id] && [0, 1, 2, 3, 4, 5].map(i => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.7 }}
                animate={{ opacity: [0, 0.48, 0], y: [-8, -74], x: [0, i % 2 ? 16 : -16], scale: [0.7, 1, 0.85] }}
                transition={{ duration: 4.8, repeat: Infinity, delay: i * 0.75, repeatDelay: 2 }}
                style={{ position: 'absolute', left: `${22 + i * 10}%`, top: `${38 + (i % 2) * 10}%`, zIndex: 8, fontSize: '0.95rem' }}
              >
                💗
              </motion.span>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {showFinalButton && (
              <motion.button
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)', boxShadow: ['0 0 22px rgba(245,198,214,0.22)', '0 0 46px rgba(245,198,214,0.4)', '0 0 22px rgba(245,198,214,0.22)'] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                onClick={() => navigate('/cake')}
                className="glass-button"
                style={{ marginTop: 28, padding: '1rem 2.8rem', color: '#fff4f8', background: 'rgba(245,198,214,0.13)', borderColor: 'rgba(245,198,214,0.34)' }}
              >
                one last thing... 💌
              </motion.button>
            )}
          </AnimatePresence>
        </motion.section>
      </main>
    </motion.div>
  );
}
