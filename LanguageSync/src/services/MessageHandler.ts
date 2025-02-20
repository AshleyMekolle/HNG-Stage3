
import { DetectionResult } from '../types/types';

export class MessageHandler {
  static async detectLanguage(text: string): Promise<DetectionResult> {
    const detector = await window.ai.languageDetector.create();
    const detectionResults = await detector.detect(text) as unknown as DetectionResult[];
    return detectionResults[0] || { detectedLanguage: 'unknown' };
  }

  static async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
    const translator = await window.ai.translator.create({
      sourceLanguage,
      targetLanguage,
    });
    return await translator.translate(text);
  }

  static async summarize(text: string): Promise<string> {
    const summarizer = await window.ai.summarizer.create({
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
    });
    return await summarizer.summarize(text);
  }
}

