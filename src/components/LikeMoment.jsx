import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import CuteCat from './CuteCat';

export default function LikeMoment({ item, index, onPop }) {
  const align = index % 4 === 0 ? 'flex-start' : (index % 4 === 1 ? 'flex-end' : 'center');
  const rotate = [-1.5, 1.2, -0.6, 1.8][index % 4];
  const width = `min(92vw, ${item.width}px)`;

  const shellStyle = {
    width,
    position: 'relative',
    color: '#f5c6d6',
    textShadow: '0 0 20px rgba(245,198,214,0.14)',
  };

  const marginStyle = index < 3 ? '-3px 0 8px' : (index % 3 === 0 ? '-6px 0 10px' : '-2px 0 9px');

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
        margin: marginStyle,
      }}
    >
      <motion.div
        animate={{ y: [0, -1.5, 0], boxShadow: ['0 10px 34px rgba(0,0,0,0.16)', '0 12px 42px rgba(245,198,214,0.1)', '0 10px 34px rgba(0,0,0,0.16)'] }}
        transition={{ duration: 4 + index * 0.12, repeat: Infinity, ease: 'easeInOut' }}
        style={shellStyle}
        className="gpu-layer"
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
            <CuteCat mood="excited" size={92} />
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

LikeMoment.propTypes = {
  item: PropTypes.shape({
    width: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    style: PropTypes.string.isRequired,
    sticker: PropTypes.string,
    sideNote: PropTypes.string,
    tag: PropTypes.string,
    time: PropTypes.string,
    sub: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onPop: PropTypes.func.isRequired
};
