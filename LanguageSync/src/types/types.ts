export type Message = {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
  originalText?: string;
  detectedLanguage?: string;
  isTranslation?: boolean;
  isSummary?: boolean;
};

export type Language = {
  code: string;
  name: string;
};

export type Theme = {
  id: string;
  name: string;
  elements: {
    size: number;
    delay: number;
    duration: number;
    shape?: string;
    rotation?: number;
    opacity?: number;
  }[];
};

export type DetectionResult = {
  detectedLanguage: string;
  confidence?: number;
};

