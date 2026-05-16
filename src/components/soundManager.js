// soundManager.js
// We generate simple tones using Web Audio API for performance and size efficiency.

let bgStarted = false;
let pulseTimer = null;

function emitAmbientPulse(strength = 0.35) {
  if (typeof globalThis.dispatchEvent === 'undefined') return;
  globalThis.dispatchEvent(new CustomEvent('ambient-pulse', { detail: { strength } }));
}

/**
 * Creates a gentle ambient tone using Web Audio API.
 */
function createWebAudioTone(frequencies, duration, volume = 0.08) {
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return null;
    
    const ctx = new AudioContextClass();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
    gainNode.connect(ctx.destination);

    frequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      if (duration > 0) {
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - 0.3);
        osc.stop(ctx.currentTime + duration);
      }
    });
    return { ctx, gainNode };
  } catch (e) {
    console.warn('Audio Context creation failed:', e);
    return null;
  }
}

export function playBgMusic() {
  if (bgStarted) return;
  bgStarted = true;
  createWebAudioTone([220, 330, 440], 0);
  pulseTimer = globalThis.setInterval(() => {
    emitAmbientPulse(0.18 + Math.random() * 0.18);
  }, 1700);
}

export function stopBgMusic() {
  bgStarted = false;
  if (pulseTimer) {
    globalThis.clearInterval(pulseTimer);
    pulseTimer = null;
  }
}

export function playCutSound() {
  emitAmbientPulse(0.65);
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    setTimeout(() => {
      try {
        const chimeCtx = new AudioContextClass();
        const osc = chimeCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, chimeCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, chimeCtx.currentTime + 0.2);
        const g = chimeCtx.createGain();
        g.gain.setValueAtTime(0.3, chimeCtx.currentTime);
        g.gain.linearRampToValueAtTime(0, chimeCtx.currentTime + 0.8);
        osc.connect(g);
        g.connect(chimeCtx.destination);
        osc.start();
        osc.stop(chimeCtx.currentTime + 0.8);
      } catch (err) { console.warn(err); }
    }, 100);
  } catch (e) { console.warn(e); }
}

export function playGiftSound() {
  emitAmbientPulse(0.45);
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const chimes = [523.25, 659.25, 783.99, 1046.5];

    chimes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 1.2);
    });
  } catch (e) { console.warn(e); }
}

export function playAmbientChime() {
  emitAmbientPulse(0.38);
  try {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [261.63, 329.63, 392.0, 523.25];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 3);
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.3);
      osc.stop(ctx.currentTime + i * 0.3 + 3);
    });
  } catch (e) { console.warn(e); }
}
