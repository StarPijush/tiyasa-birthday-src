// soundManager.js
// Lightweight audio manager tuned for a soft, late-night, romantic mood.

let ctx = null;
let masterGain = null;
let bgStarted = false;
let bgTimer = null;
let runningOscillators = [];
let duckCount = 0;
const DEFAULT_BG_VOLUME = 0.035; // very low, supportive only

function ensureContext() {
  if (ctx) return ctx;
  const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContextClass) return null;
  ctx = new AudioContextClass();
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(DEFAULT_BG_VOLUME, ctx.currentTime);
  masterGain.connect(ctx.destination);
  return ctx;
}

function emitAmbientPulse(strength = 0.12) {
  if (typeof globalThis.dispatchEvent === 'undefined') return;
  globalThis.dispatchEvent(new CustomEvent('ambient-pulse', { detail: { strength } }));
}

function scheduleSoftPluck(note, when = 0, amp = 0.06, length = 1.2) {
  const c = ensureContext();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(note, c.currentTime + when);
  g.gain.setValueAtTime(0, c.currentTime + when);
  g.gain.linearRampToValueAtTime(amp, c.currentTime + when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + length);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(c.currentTime + when);
  osc.stop(c.currentTime + when + length + 0.02);
  runningOscillators.push({ osc, g });
  // cleanup after
  setTimeout(() => {
    const idx = runningOscillators.findIndex(r => r.osc === osc);
    if (idx >= 0) runningOscillators.splice(idx, 1);
  }, (when + length + 0.1) * 1000);
}

export function playBgMusic() {
  if (bgStarted) return;
  const c = ensureContext();
  if (!c) return;
  bgStarted = true;
  // gentle, slow arpeggio pattern with soft dynamics
  const base = [220, 262, 196, 247]; // warm guitar/piano-ish notes
  let i = 0;
  emitAmbientPulse(0.08);
  bgTimer = globalThis.setInterval(() => {
    // schedule one or two soft plucks
    const note = base[i % base.length] * (Math.random() > 0.6 ? 1 : 0.5);
    scheduleSoftPluck(note, 0, 0.04 + Math.random() * 0.03, 1.2 + Math.random() * 0.8);
    if (Math.random() > 0.7) scheduleSoftPluck(note * 1.5, 0.18, 0.02, 1.6);
    i += 1;
    emitAmbientPulse(0.06 + Math.random() * 0.06);
  }, 2200);
}

export function stopBgMusic() {
  bgStarted = false;
  if (bgTimer) {
    globalThis.clearInterval(bgTimer);
    bgTimer = null;
  }
  // stop any running oscillators quickly
  if (ctx && runningOscillators.length) {
    runningOscillators.forEach(({ osc, g }) => {
      try {
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.02);
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) { /* ignore */ }
    });
    runningOscillators = [];
  }
}

export function duckBg() {
  const c = ensureContext();
  if (!c || !masterGain) return;
  duckCount += 1;
  const now = c.currentTime;
  // target lower volume (about 20% of default)
  const target = DEFAULT_BG_VOLUME * 0.18;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.linearRampToValueAtTime(target, now + 0.06);
}

export function unduckBg() {
  const c = ensureContext();
  if (!c || !masterGain) return;
  duckCount = Math.max(0, duckCount - 1);
  if (duckCount > 0) return; // still other ducks active
  const now = c.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.linearRampToValueAtTime(DEFAULT_BG_VOLUME, now + 0.45);
}

export function playCutSound() {
  emitAmbientPulse(0.26);
  // light transient click
  try {
    const c = ensureContext();
    if (!c) return;
    const ctxNow = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctxNow);
    g.gain.setValueAtTime(0.18, ctxNow);
    g.gain.exponentialRampToValueAtTime(0.0001, ctxNow + 0.18);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(ctxNow);
    osc.stop(ctxNow + 0.18);
  } catch (e) { console.warn(e); }
}

export function playGiftSound() {
  emitAmbientPulse(0.18);
  try {
    const c = ensureContext();
    if (!c) return;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      scheduleSoftPluck(freq, i * 0.12, 0.08, 0.9 + i * 0.2);
    });
  } catch (e) { console.warn(e); }
}

export function playAmbientChime() {
  emitAmbientPulse(0.12);
  try {
    const c = ensureContext();
    if (!c) return;
    const notes = [261.63, 329.63, 392.0];
    notes.forEach((freq, i) => {
      scheduleSoftPluck(freq, i * 0.32, 0.06, 2.4);
    });
  } catch (e) { console.warn(e); }
}

export function playTinyPurr() {
  try {
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(88 + Math.random() * 28, now);
    g.gain.setValueAtTime(0.008 + Math.random() * 0.006, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + Math.random() * 1.2);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.2 + Math.random() * 1.2);
  } catch (e) { /* silent fail */ }
}
