import { Howl } from 'howler'

// We generate simple tones using Web Audio API since we can't ship audio files
// In production, replace these with actual audio file paths

let bgMusic = null
let bgStarted = false
let pulseTimer = null

function emitAmbientPulse(strength = 0.35) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('ambient-pulse', { detail: { strength } }))
}

/**
 * Creates a gentle ambient tone using Web Audio API.
 * In a real project, replace with: new Howl({ src: ['/assets/music/ambient.mp3'], loop: true, volume: 0.25 })
 */
function createWebAudioTone(frequencies, duration, volume = 0.08) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5)
    gainNode.connect(ctx.destination)

    frequencies.forEach(freq => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      osc.connect(gainNode)
      osc.start()
      if (duration > 0) {
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - 0.3)
        osc.stop(ctx.currentTime + duration)
      }
    })
    return { ctx, gainNode }
  } catch (e) {
    return null
  }
}

export function playBgMusic() {
  if (bgStarted) return
  bgStarted = true
  // Gentle ambient loop — low hum at 220Hz + 330Hz (A3 + E4)
  createWebAudioTone([220, 330, 440], 0) // 0 = no stop (looping via regen)
  pulseTimer = window.setInterval(() => {
    emitAmbientPulse(0.18 + Math.random() * 0.18)
  }, 1700)
}

export function stopBgMusic() {
  bgStarted = false
  if (pulseTimer) {
    window.clearInterval(pulseTimer)
    pulseTimer = null
  }
  if (bgMusic) {
    bgMusic.stop?.()
    bgMusic = null
  }
}

export function playCutSound() {
  emitAmbientPulse(0.65)
  // Simulate a soft "swoosh" + chime
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Swoosh — filtered noise burst
    const bufferSize = ctx.sampleRate * 0.3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    filter.Q.value = 0.5

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    // Chime after
    setTimeout(() => {
      const chimeCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = chimeCtx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, chimeCtx.currentTime)
      osc.frequency.linearRampToValueAtTime(1200, chimeCtx.currentTime + 0.2)
      const g = chimeCtx.createGain()
      g.gain.setValueAtTime(0.3, chimeCtx.currentTime)
      g.gain.linearRampToValueAtTime(0, chimeCtx.currentTime + 0.8)
      osc.connect(g)
      g.connect(chimeCtx.destination)
      osc.start()
      osc.stop(chimeCtx.currentTime + 0.8)
    }, 100)
  } catch (e) {}
}

export function playGiftSound() {
  emitAmbientPulse(0.45)
  // Soft "shimmer" chime
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const chimes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

    chimes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.12)
      osc.stop(ctx.currentTime + i * 0.12 + 1.2)
    })
  } catch (e) {}
}

export function playAmbientChime() {
  emitAmbientPulse(0.38)
  // Single soft chime for lotus page
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [261.63, 329.63, 392.0, 523.25] // C4 chord

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.3)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 3)
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.3)
      osc.stop(ctx.currentTime + i * 0.3 + 3)
    })
  } catch (e) {}
}
