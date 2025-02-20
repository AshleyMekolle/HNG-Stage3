
export const floatingVariants = {
  initial: { scale: 1, y: 0 },
  animate: {
    scale: [1, 1.1, 1],
    y: [0, -30, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

