import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Waveform({ bars, active, progress, minimal = false }) {
  return (
    <div className="gpu-layer" style={{ display: 'flex', alignItems: 'center', gap: minimal ? 4 : 3, height: minimal ? 70 : 52, flex: 1 }}>
      {bars.map((height, index) => {
        const passed = index / bars.length <= progress;
        return (
          <motion.span
            key={`bar-${index}-${height.toFixed(2)}`}
            animate={{
              height: active ? [height * 0.55, height * (0.9 + (index % 4) * 0.1), height * 0.62] : height * 0.55,
              opacity: passed || active ? 0.95 : 0.3,
              backgroundColor: passed ? '#f5c6d6' : 'rgba(245,198,214,0.35)',
            }}
            transition={{ duration: 0.75 + (index % 5) * 0.05, repeat: active ? Infinity : 0, ease: 'easeInOut', delay: index * 0.01 }}
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

Waveform.propTypes = {
  bars: PropTypes.arrayOf(PropTypes.number).isRequired,
  active: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  minimal: PropTypes.bool
};
