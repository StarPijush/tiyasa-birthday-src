import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

/**
 * CakeCut — a birthday cake SVG with drag-to-slice interaction.
 * Tracks pointer drag across the cake to simulate cutting.
 * onSlice fires once the cut is detected.
 */
export default function CakeCut({ onSlice, playCutSound }) {
  const [sliced, setSliced] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [cutLine, setCutLine] = useState(null)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const containerRef = useRef(null)

  function getRelativePos(e, el) {
    const rect = el.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: ((clientX - rect.left) / rect.width) * 280,
      y: ((clientY - rect.top) / rect.height) * 280,
    }
  }

  function handlePointerDown(e) {
    if (sliced) return
    e.preventDefault()
    const pos = getRelativePos(e, containerRef.current)
    setIsDragging(true)
    setDragStart(pos)
    setDragEnd(pos)
  }

  function handlePointerMove(e) {
    if (!isDragging || sliced) return
    e.preventDefault()
    const pos = getRelativePos(e, containerRef.current)
    setDragEnd(pos)
  }

  function handlePointerUp(e) {
    if (!isDragging || sliced) return
    e.preventDefault()
    setIsDragging(false)

    if (!dragStart || !dragEnd) return

    // Detect if the drag crossed the cake body (approx y 80–220, x 30–250)
    const dx = dragEnd.x - dragStart.x
    const dy = dragEnd.y - dragStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const midX = (dragStart.x + dragEnd.x) / 2
    const midY = (dragStart.y + dragEnd.y) / 2

    // If dragged across the cake area with enough movement
    if (distance > 60 && midX > 40 && midX < 240 && midY > 80 && midY < 230) {
      triggerSlice()
    }
  }

  function triggerSlice() {
    setSliced(true)
    setCutLine({ start: dragStart, end: dragEnd })
    playCutSound?.()

    // Confetti burst
    const el = containerRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const x = (rect.left + rect.width / 2) / window.innerWidth
      const y = (rect.top + rect.height / 2) / window.innerHeight
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x, y },
        colors: ['#e8a0b4', '#b47fa0', '#c4687a', '#f8d7e3', '#7a4f6d', '#fce4ec'],
        scalar: 1.1,
      })
      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 120,
          origin: { x, y: y - 0.1 },
          colors: ['#e8a0b4', '#fce4ec', '#b47fa0'],
          scalar: 0.9,
        })
      }, 300)
    }

    // Navigate after delay
    setTimeout(() => onSlice?.(), 2200)
  }

  // Touch passthrough
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('touchstart', handlePointerDown, { passive: false })
    el.addEventListener('touchmove', handlePointerMove, { passive: false })
    el.addEventListener('touchend', handlePointerUp, { passive: false })
    return () => {
      el.removeEventListener('touchstart', handlePointerDown)
      el.removeEventListener('touchmove', handlePointerMove)
      el.removeEventListener('touchend', handlePointerUp)
    }
  }, [isDragging, dragStart, dragEnd, sliced])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div
        ref={containerRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        style={{
          width: 280,
          height: 280,
          position: 'relative',
          cursor: sliced ? 'default' : 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <CakeSVG sliced={sliced} />

        {/* Drag cut line preview */}
        {isDragging && dragStart && dragEnd && (
          <svg
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
            viewBox="0 0 280 280"
          >
            <line
              x1={dragStart.x} y1={dragStart.y}
              x2={dragEnd.x} y2={dragEnd.y}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Final cut line */}
        {sliced && cutLine && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1.5 }}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
            viewBox="0 0 280 280"
          >
            <line
              x1={cutLine.start.x} y1={cutLine.start.y}
              x2={cutLine.end.x} y2={cutLine.end.y}
              stroke="rgba(255,240,240,0.9)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </motion.svg>
        )}

        {/* Sliced sparkles */}
        <AnimatePresence>
          {sliced && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                pointerEvents: 'none',
              }}
            >
              ✨
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instruction */}
      <AnimatePresence>
        {!sliced ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            style={{
              color: 'var(--rose)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              textAlign: 'center',
            }}
          >
            drag across the cake to cut ✨
          </motion.p>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: 'var(--rose)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              letterSpacing: '0.08em',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            I wish I could've been there… 🎂
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function CakeSVG({ sliced }) {
  return (
    <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cakeBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7a4f6d" />
          <stop offset="100%" stopColor="#3d2040" />
        </linearGradient>
        <linearGradient id="cakeFrost" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fce4ec" />
          <stop offset="100%" stopColor="#e8a0b4" />
        </linearGradient>
        <linearGradient id="cakeMid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b47fa0" />
          <stop offset="100%" stopColor="#6d3d5e" />
        </linearGradient>
        <filter id="cakeGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Plate shadow */}
      <ellipse cx="140" cy="242" rx="90" ry="10" fill="rgba(0,0,0,0.4)" />

      {/* === Bottom tier === */}
      {/* Sides */}
      <ellipse cx="140" cy="218" rx="80" ry="16" fill="#3d2040" />
      <rect x="60" y="165" width="160" height="53" fill="url(#cakeBase)" />
      {/* Top of bottom tier */}
      <ellipse cx="140" cy="165" rx="80" ry="16" fill="url(#cakeFrost)" />
      {/* Frosting drip */}
      {[80, 100, 115, 140, 165, 180, 200].map((x, i) => (
        <path
          key={i}
          d={`M${x} 168 Q${x + 4} ${178 + (i % 3) * 5} ${x + 2} ${185 + (i % 3) * 5}`}
          stroke="#fce4ec"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      ))}

      {/* === Middle tier === */}
      <ellipse cx="140" cy="162" rx="58" ry="11" fill="#3d2040" />
      <rect x="82" y="118" width="116" height="44" fill="url(#cakeMid)" />
      <ellipse cx="140" cy="118" rx="58" ry="11" fill="url(#cakeFrost)" />
      {/* Frosting drip */}
      {[96, 112, 130, 152, 168].map((x, i) => (
        <path
          key={i}
          d={`M${x} 121 Q${x + 3} ${129 + (i % 2) * 4} ${x + 2} ${135 + (i % 2) * 4}`}
          stroke="#fce4ec"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      ))}

      {/* === Top tier === */}
      <ellipse cx="140" cy="115" rx="38" ry="8" fill="#3d2040" />
      <rect x="102" y="82" width="76" height="33" fill="url(#cakeBase)" />
      <ellipse cx="140" cy="82" rx="38" ry="8" fill="url(#cakeFrost)" />

      {/* Decorative dots on middle tier */}
      {[105, 125, 145, 165].map((x, i) => (
        <circle key={i} cx={x} cy="140" r="4" fill="rgba(232,160,180,0.7)" />
      ))}
      {[98, 118, 140, 162, 182].map((x, i) => (
        <circle key={i} cx={x} cy="195" r="5" fill="rgba(232,160,180,0.5)" />
      ))}

      {/* === Candles === */}
      {[125, 140, 155].map((x, i) => (
        <g key={i}>
          <rect x={x - 3} y={55 + i % 2 * 3} width="6" height="25" rx="2"
            fill={['#e8a0b4', '#b47fa0', '#c4687a'][i]} />
          {/* Flame */}
          <motion.g
            animate={{ scaleY: [1, 1.15, 0.9, 1.1, 1], scaleX: [1, 0.9, 1.1, 0.95, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 + i * 0.3, ease: 'easeInOut' }}
            style={{ transformOrigin: `${x}px ${53 + i % 2 * 3}px` }}
          >
            <ellipse cx={x} cy={50 + i % 2 * 3} rx="4" ry="7" fill="#ffd54f" opacity="0.9" filter="url(#cakeGlow)" />
            <ellipse cx={x} cy={51 + i % 2 * 3} rx="2" ry="4" fill="#fff9c4" />
          </motion.g>
        </g>
      ))}

      {/* Cut slice effect */}
      {sliced && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <path
            d="M140 165 L120 218 L160 218 Z"
            fill="rgba(252,228,236,0.4)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
          <path
            d="M140 118 L125 165 L155 165 Z"
            fill="rgba(232,160,180,0.4)"
          />
          <path
            d="M140 82 L130 118 L150 118 Z"
            fill="rgba(196,104,122,0.4)"
          />
        </motion.g>
      )}
    </svg>
  )
}
