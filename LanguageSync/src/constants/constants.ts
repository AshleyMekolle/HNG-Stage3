
import { Language, Theme } from '../types/types';

export const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
];

export const themes: Theme[] = [
  {
    id: 'bubbles',
    name: 'Bubbles',
    elements: Array.from({ length: 8 }, (_, i) => ({
      size: Math.random() * 100 + 50,
      delay: i * -2,
      duration: Math.random() * 5 + 5,
    })),
  },
  {
    id: 'geometric',
    name: 'Geometric',
    elements: Array.from({ length: 6 }, (_, i) => ({
      size: Math.random() * 80 + 40,
      delay: i * -1.5,
      duration: Math.random() * 4 + 6,
      shape: ['square', 'triangle', 'circle'][Math.floor(Math.random() * 3)],
    })),
  },
  {
    id: 'nature',
    name: 'Nature',
    elements: Array.from({ length: 7 }, (_, i) => ({
      size: Math.random() * 60 + 30,
      delay: i * -2,
      duration: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
    })),
  },
  {
    id: 'space',
    name: 'Space',
    elements: Array.from({ length: 10 }, (_, i) => ({
      size: Math.random() * 40 + 20,
      delay: i * -1,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.5 + 0.2,
    })),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    elements: Array.from({ length: 5 }, (_, i) => ({
      size: Math.random() * 120 + 60,
      delay: i * -3,
      duration: Math.random() * 7 + 7,
      opacity: 0.05,
    })),
  },
];