import React from 'react';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message, Language } from '../types/types';

interface ChatMessageProps {
  message: Message;
  selectedLanguage: string;
  languages: Language[];
  isProcessing: boolean;
  onLanguageChange: (value: string) => void;
  onTranslate: (messageId: string, targetLanguage: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  selectedLanguage,
  languages,
  isProcessing,
  onLanguageChange,
  onTranslate
}) => (
  <motion.div
    className={`message ${message.type}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.3 }}
    role="article"
    aria-label={`${message.type === 'user' ? 'Your message' : 'Response'}`}
  >
    <p className="message-text">{message.text}</p>
    {message.type === 'bot' && !message.isTranslation && (
      <div className="translation-controls">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="language-select-inline"
          disabled={isProcessing}
          aria-label="Select target language"
        >
          {languages.map((lang: Language) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => onTranslate(message.id, selectedLanguage)}
          className="action-button-inline"
          disabled={isProcessing || message.detectedLanguage === selectedLanguage}
          aria-label={`Translate to ${languages.find((lang: Language) => lang.code === selectedLanguage)?.name}`}
        >
          <Languages size={16} aria-hidden="true" />
          Translate
        </button>
      </div>
    )}
    {message.translatedText && (
      <div className="message-translation" role="region" aria-label="Translation">
        <p>{message.translatedText}</p>
      </div>
    )}
    <span className="message-time" aria-label="Message time">
      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  </motion.div>
);