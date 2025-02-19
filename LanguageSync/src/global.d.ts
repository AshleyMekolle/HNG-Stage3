// global.d.ts
interface Window {
    ai: {
      languageDetector: {
        detect(text: string): Promise<string>;
        capabilities():  Promise<LanguageDetectorCapabilities>;
        create(options?: { monitor?: (m: Monitor) => void }): Promise<LanguageDetector>;
      };
      translator: {
        create(options: { sourceLanguage: string; targetLanguage: string; monitor?: (m: Monitor) => void }): Promise<Translator>;
        capabilities(): Promise<{ languagePairAvailable(source: string, target: string): string }>;
      };
      summarizer: {
        create(options: { type: string; format: string; length: string }): Promise<Summarizer>;
      };
    };
  }
  
  interface Monitor {
    addEventListener(event: string, listener: (e: Event) => void): void;
  }
  
  interface LanguageDetector {
    detect(text: string): Promise<string>;
  }
  
  interface Translator {
    translate(text: string): Promise<string>;
  }
  
  interface Summarizer {
    summarize(text: string): Promise<string>;
  }

  interface DownloadProgressEvent extends Event {
    loaded: number;
    total: number;
  }