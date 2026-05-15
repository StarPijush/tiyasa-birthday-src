import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * GiftBox — tap to open the gift box with animated lid.
 * onOpen fires after the lid animation completes.
 */
export default function GiftBox({ onOpen, size = 180 }) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  function handleTap() {
    if (hasOpened) return
    setIsOpen(true)
    setTimeout(() => {
      setHasOpened(true)
      onOpen?.()
    }, 800)
  }

  const s = size

  return (
    <div
      onClick={handleTap}
      style={{
        width: s,
        height: s,
        cursor: hasOpened ? 'default' : 'pointer',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <svg
        width={s}
        height={s}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a4f6d" />
            <stop offset="100%" stopColor="#2d1b2e" />
          </linearGradient>
          <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b47fa0" />
            <stop offset="100%" stopColor="#7a4f6d" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8a0b4" />
            <stop offset="100%" stopColor="#c4687a" />
          </linearGradient>
        </defs>

        {/* Box body */}
        <rect x="20" y="85" width="140" height="80" rx="4" fill="url(#boxGrad)" />
        {/* Box ribbon vertical */}
        <rect x="82" y="85" width="16" height="80" fill="url(#ribbonGrad)" opacity="0.7" />
        {/* Box ribbon horizontal */}
        <rect x="20" y="115" width="140" height="16" fill="url(#ribbonGrad)" opacity="0.7" />

        {/* Glow effect at bottom of lid */}
        {isOpen && (
          <ellipse
            cx="90"
            cy="90"
            rx="55"
            ry="12"
            fill="rgba(232,160,180,0.3)"
            filter="blur(6px)"
          />
        )}
      </svg>

      {/* Lid — animated separately so it can rotate/fly up */}
      <motion.div
        animate={isOpen ? { y: -70, rotateX: -60, opacity: 0.7 } : { y: 0, rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transformOrigin: 'top center',
          perspective: 600,
        }}
      >
        <svg
          width={s}
          height={s * 0.5}
          viewBox="0 0 180 90"
          fill="none"
        >
          <defs>
            <linearGradient id="lidGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b47fa0" />
              <stop offset="100%" stopColor="#7a4f6d" />
            </linearGradient>
          </defs>

          {/* Lid body */}
          <rect x="15" y="55" width="150" height="30" rx="4" fill="url(#lidGrad2)" />

          {/* Ribbon on lid */}
          <rect x="82" y="55" width="16" height="30" fill="rgba(232,160,180,0.7)" />

          {/* Bow */}
          {/* Left loop */}
          <ellipse cx="72" cy="50" rx="22" ry="13" fill="rgba(232,160,180,0.9)" transform="rotate(-20, 72, 50)" />
          {/* Right loop */}
          <ellipse cx="108" cy="50" rx="22" ry="13" fill="rgba(232,160,180,0.9)" transform="rotate(20, 108, 50)" />
          {/* Center knot */}
          <ellipse cx="90" cy="55" rx="10" ry="8" fill="#e8a0b4" />

          {/* Ribbon tails */}
          <path d="M80 63 Q65 75 60 85" stroke="rgba(232,160,180,0.8)" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <path d="M100 63 Q115 75 120 85" stroke="rgba(232,160,180,0.8)" strokeWidth="6" strokeLinecap="round" fill="none"/>
        </svg>
      </motion.div>

      {/* Tap hint */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute',
              bottom: -32,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--rose)',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
            }}
          >
            tap to open
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
