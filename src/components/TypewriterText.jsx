import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Cinematic Typewriter - Reveals line by line with emotional pauses
 */
const TypewriterText = ({ 
  text, 
  onComplete, 
  speed = 40, 
  lineDelay = 800 
}) => {
  const lines = Array.isArray(text) ? text : [text];
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    const currentLine = lines[currentLineIndex];
    
    // Handle empty lines (paragraphs)
    if (currentLine.length === 0) {
      setVisibleLines(prev => [...prev, ""]);
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }

    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setCurrentCharIndex(prev => prev + 1);
        setVisibleLines(prev => {
          const newLines = [...prev];
          if (currentCharIndex === 0) {
            newLines.push(currentLine[0]);
          } else {
            newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          }
          return newLines;
        });
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Line finished, wait before next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }
  }, [currentLineIndex, currentCharIndex, lines, speed, lineDelay, onComplete]);

  return (
    <div style={{ position: 'relative' }}>
      {visibleLines.map((line, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 4vw, 1.2rem)',
            lineHeight: 1.8,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: line === "" ? "1.5rem" : "0.5rem",
            minHeight: line === "" ? "1rem" : "auto",
            fontWeight: 300,
          }}
        >
          {line}
          {index === currentLineIndex && !isDone && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1.2em',
                backgroundColor: 'var(--rose)',
                marginLeft: '4px',
                verticalAlign: 'middle',
              }}
            />
          )}
        </motion.p>
      ))}
    </div>
  );
};

export default TypewriterText;
