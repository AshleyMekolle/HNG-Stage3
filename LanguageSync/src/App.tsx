import { useState, useEffect, KeyboardEvent } from 'react';
import { Send, Languages, Sun, Moon, Trash2, Palette, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message} from './types/types';
import { languages, themes } from './constants/constants';
import { floatingVariants } from './services/animations';
import { validateInput, meetsMinimumLength } from './utils/utils';
import { MessageHandler } from './services/MessageHandler';
import { ThemeManager } from './services/ThemeManager';


function App() {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [theme, setTheme] = useState(ThemeManager.initializeTheme());

  useEffect(() => {
    ThemeManager.saveTheme(theme.mode, theme.visual);
  }, [theme]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setError(null);

    const validation = validateInput(inputText);
    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }

    setIsProcessing(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        type: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');

      const detectionResult = await MessageHandler.detectLanguage(inputText);
      const languageName = languages.find((lang) => lang.code === detectionResult.detectedLanguage)?.name || detectionResult.detectedLanguage;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I detected that your message is in ${languageName}. Would you like me to translate it or Summarize it?`,
        type: 'bot',
        timestamp: new Date(),
        originalText: inputText,
        detectedLanguage: detectionResult.detectedLanguage,
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to process your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    setError(null);
    setIsProcessing(true);

    try {
      const message = messages.find((m) => m.id === messageId);
      if (!message || !message.originalText || !message.detectedLanguage) return;

      const userRequest: Message = {
        id: Date.now().toString(),
        text: `Translate this to ${languages.find((lang) => lang.code === targetLanguage)?.name}`,
        type: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userRequest]);

      const translatedText = await MessageHandler.translate(
        message.originalText,
        message.detectedLanguage,
        targetLanguage
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: translatedText,
        type: 'bot',
        timestamp: new Date(),
        isTranslation: true,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to translate text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSummarize = async (messageId: string) => {
    setError(null);
    setIsProcessing(true);

    try {
      const message = messages.find((m) => m.id === messageId);
      if (!message || !message.originalText || !message.detectedLanguage) {
        setError('No text available to summarize.');
        return;
      }

      if (message.detectedLanguage !== 'en') {
        setError('Summarization is only available for English texts.');
        return;
      }

      if (!meetsMinimumLength(message.originalText)) {
        setError('Text must be at least 150 characters long for summarization.');
        return;
      }

      const userRequest: Message = {
        id: Date.now().toString(),
        text: 'Summarize this text',
        type: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userRequest]);

      const summary = await MessageHandler.summarize(message.originalText);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: summary,
        type: 'bot',
        timestamp: new Date(),
        isSummary: true,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to summarize text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canBeSummarized = (message: Message): boolean => {
    if (!message.originalText || !message.detectedLanguage) return false;
    return message.detectedLanguage === 'en' && meetsMinimumLength(message.originalText);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  };

  const changeVisualTheme = (visualTheme: string) => {
    setTheme((prev) => ({ ...prev, visual: visualTheme }));
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const renderThemeElements = () => {
    const currentTheme = themes.find((t) => t.id === theme.visual);
    if (!currentTheme) return null;

    return currentTheme.elements.map((element, index) => (
      <motion.div
        key={index}
        className={`floating-element ${currentTheme.id} ${element.shape || ''}`}
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
    ));
  };

return (
<div className="app" role="application">
{renderThemeElements()}


  <main className="container">
    <div className="header">
      <h1 className="title">
        <div className="title-container">
        LanguageSync 🌍
        <div className="motto">
        Detect, Translate & Summarize
        </div>
        </div>
        <div className="header-actions">
          <div className="theme-selector" role="group" aria-label="Theme selection">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => changeVisualTheme(t.id)}
                className={`theme-button ${theme.visual === t.id ? 'active' : ''}`}
                title={t.name}
                aria-label={`${t.name} theme`}
                aria-pressed={theme.visual === t.id}
              >
                <Palette size={20} aria-hidden="true"/>
              </button>
            ))}
          </div>
          <button onClick={clearChat} className="clear-button" aria-label="Clear chat">
            <Trash2 size={24}  aria-hidden="true" />
          </button>
          <button onClick={toggleTheme} className="theme-toggle" 
          aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}>
            {theme.mode === 'light' ? <Moon size={24} aria-hidden="true" /> : <Sun size={24} aria-hidden="true" />}
          </button>
        </div>
      </h1>
    </div>

    <div className="card">
      {error && (
        <div className="error-message" role='alert'>
          <AlertCircle size={20}  aria-hidden="true"/>
          <span>{error}</span>
        </div>
      )}

      <div className="chat-container" role="log" aria-label="Chat messages">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.type}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              aria-label={`${message.type === 'user' ? 'Your message' : 'Response'}`}
            >
              <p className="message-text">{message.text}</p>
              {message.type === 'bot' && !message.isTranslation && !message.isSummary && (
                <div className="translation-controls">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-select-inline"
                    disabled={isProcessing}
                    aria-label="Select target language"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleTranslate(message.id, selectedLanguage)}
                    className="action-button-inline"
                    disabled={isProcessing || message.detectedLanguage === selectedLanguage}
                    aria-label={`Translate to ${languages.find(lang => lang.code === selectedLanguage)?.name}`}
                  >
                    <Languages size={16} aria-hidden="true" />
                    Translate
                  </button>
                  <button
                    onClick={() => handleSummarize(message.id)}
                    className={`action-button-inline ${!canBeSummarized(message) ? 'disabled' : ''}`}
                    disabled={isProcessing}
                    aria-label={
                      !message.detectedLanguage ? 'Language not detected' :
                      message.detectedLanguage !== 'en' ? 'Only English texts can be summarized' :
                      !meetsMinimumLength(message.originalText) ? 'Text too short for summary' :
                      'Summarize text'
                    }
                    title={
                      !message.detectedLanguage ? 'Language not detected' :
                      message.detectedLanguage !== 'en' ? 'Only English texts can be summarized' :
                      !meetsMinimumLength(message.originalText) ? 'Text must be at least 150 characters' :
                      'Summarize text'
                    }
                  >
                    Summarize
                  </button>
                </div>
              )}
              <span className="message-time" aria-label="Message time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="input-section">
        <div className="textarea-wrapper">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // Clear input error when user starts typing
              if (inputError) setInputError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message..."
            className="input-textarea"
            disabled={isProcessing}
            aria-label="Input text"
            aria-invalid={!!inputError}
          />
          {inputError && (
            <div className="input-error-message" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{inputError}</span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="send-button"
            disabled={isProcessing || !inputText.trim()}
            aria-label="Send"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  </main>
</div>
);
}

export default App;