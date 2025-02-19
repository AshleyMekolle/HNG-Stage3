import { LanguageDetector, DownloadProgressEvent, LanguageDetectorResult } from '../types/types';

export async function setupLanguageDetector(): Promise<LanguageDetector | null> {
  if (!window.ai?.languageDetector) {
    console.error('Language Detector API not available');
    return null;
  }

  try {
    const capabilities = await window.ai.languageDetector.capabilities();
    if (capabilities.capabilities === 'no') {
      console.error('Language detector is not usable');
      return null;
    }

    const detector = await window.ai.languageDetector.create({
      monitor(m) {
        // cspell:disable-next-line
        m.addEventListener('downloadprogress', (e: Event) => {
          const progressEvent = e as DownloadProgressEvent;
          if ('loaded' in progressEvent && 'total' in progressEvent) {
            console.log(`Downloaded ${progressEvent.loaded} of ${progressEvent.total} bytes.`);
          }
        });
      },
    });

    // Wrap the detector to match our expected interface
    return {
      detect: async (text: string): Promise<LanguageDetectorResult[]> => {
        const result = await detector.detect(text);
        // Assuming the API returns a string, convert it to our expected format
        return [{ detectedLanguage: result }];
      }
    };
  } catch (error) {
    console.error('Failed to setup language detector:', error);
    return null;
  }
}