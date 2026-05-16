export const pageVariants = {
  initial: {
    opacity: 0,
    scale: 1,
    filter: 'blur(12px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1], // Cinematic quintic ease
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(15px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const softSpring = {
  type: 'spring',
  stiffness: 120,
  damping: 24,
  mass: 1.2,
};

export const fastSpring = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
};
