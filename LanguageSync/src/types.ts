export interface Message {
    id: string;
    text: string;
    type: 'user' | 'bot';
    timestamp: Date;
    detectedLanguage?: string;
    originalText?: string;
    isTranslation?: boolean;
  }
  
  export interface Language {
    code: string;
    name: string;
  }
  
  export interface Theme {
    id: string;
    name: string;
    elements: {
      size: number;
      delay: number;
      duration: number;
      shape?: string;
      opacity?: number;
      rotation?: number;
    }[];
  }
  
  // Chrome AI API Types
  export interface DownloadProgressEvent extends Event {
    loaded: number;
    total: number;
  }
  
  export interface Monitor {
    addEventListener(event: 'downloadprogress', listener: (e: DownloadProgressEvent) => void): void;
  }
  
  export interface TranslatorCapabilities {
    languagePairAvailable(source: string, target: string): 'readily' | 'after-download' | 'no';
  }
  
  export interface Translator {
    translate(text: string): Promise<string>;
    ready?: Promise<void>;
  }
  
  export interface LanguageDetectorCapabilities {
    languageAvailable(language: string): 'readily' | 'after-download' | 'no';
    capabilities: 'readily' | 'after-download' | 'no';
  }
  
  export interface LanguageDetectionResult {
    detectedLanguage: string;
    confidence: number;
  }
  
  export interface LanguageDetector {
    detect(text: string): Promise<LanguageDetectionResult[]>;
    ready?: Promise<void>;
  }
  
  export interface ChromeAI {
    translator: {
      capabilities(): Promise<TranslatorCapabilities>;
      create(options: {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: (m: Monitor) => void;
      }): Promise<Translator>;
    };
    languageDetector: {
      capabilities(): Promise<LanguageDetectorCapabilities>;
      create(options?: {
        monitor?: (m: Monitor) => void;
      }): Promise<LanguageDetector>;
    };
  }
  
  declare global {
    interface Window {
      ai?: ChromeAI;
    }
  }