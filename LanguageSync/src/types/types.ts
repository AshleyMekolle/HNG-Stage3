// types.ts
export interface Message {
  id: string;
  text: string;
  type: 'user' | 'bot';
  timestamp: Date;
  originalText?: string;
  detectedLanguage?: string;
  isTranslation?: boolean;
  translatedText?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface Theme {
  id: string;
  name: string;
  elements: ThemeElement[];
}

export interface ThemeElement {
  size: number;
  delay: number;
  duration: number;
  shape?: string;
  rotation?: number;
  opacity?: number;
}

export interface LanguageDetector {
  detect(text: string): Promise<{ detectedLanguage: string }[]>;
}

export interface DownloadProgressEvent extends Event {
  loaded: number;
  total: number;
}
export interface LanguageDetectorResult {
  detectedLanguage: string;
}
