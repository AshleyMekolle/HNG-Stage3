// ThemeElements.tsx
import { motion } from 'framer-motion';
import { Theme } from '../types/types';

const floatingVariants = {
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

interface ThemeElementsProps {
  theme: Theme;
}

export const ThemeElements = ({ theme }: ThemeElementsProps) => {
  return (
    <>
      {theme.elements.map((element, index) => (
        <motion.div
          key={index}
          className={`floating-element ${theme.id} ${element.shape || ''}`}
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          style={{
            position: 'absolute',
            width: `${element.size}px`,
            height: `${element.size}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: element.opacity || 0.1,
            transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`,
          }}
        />
      ))}
    </>
  );
};