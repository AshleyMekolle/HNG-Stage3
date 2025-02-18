import { useState, useEffect, KeyboardEvent } from 'react';
import { Send, Languages, Sun, Moon, Trash2, Palette, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Language, Theme, LanguageDetector, Translator } from './types';

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' }
];

const themes: Theme[] = [
  {
    id: 'bubbles',
    name: 'Bubbles',
    elements: Array.from({ length: 8 }, (_, i) => ({
      size: Math.random() * 100 + 50,
      delay: i * -2,
      duration: Math.random() * 5 + 5
    }))
  },
  {
    id: 'geometric',
    name: 'Geometric',
    elements: Array.from({ length: 6 }, (_, i) => ({
      size: Math.random() * 80 + 40,
      delay: i * -1.5,
      duration: Math.random() * 4 + 6,
      shape: ['square', 'triangle', 'circle'][Math.floor(Math.random() * 3)]
    }))
  },
  {
    id: 'nature',
    name: 'Nature',
    elements: Array.from({ length: 7 }, (_, i) => ({
      size: Math.random() * 60 + 30,
      delay: i * -2,
      duration: Math.random() * 6 + 4,
      rotation: Math.random() * 360
    }))
  },
  {
    id: 'space',
    name: 'Space',
    elements: Array.from({ length: 10 }, (_, i) => ({
      size: Math.random() * 40 + 20,
      delay: i * -1,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.5 + 0.2
    }))
  },
  {
    id: 'minimal',
    name: 'Minimal',
    elements: Array.from({ length: 5 }, (_, i) => ({
      size: Math.random() * 120 + 60,
      delay: i * -3,
      duration: Math.random() * 7 + 7,
      opacity: 0.05
    }))
  }
];

const floatingVariants = {
  initial: { scale: 1, y: 0 },
  animate: {
    scale: [1, 1.1, 1],
    y: [0, -30, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

async function setupLanguageDetector(): Promise<LanguageDetector | null> {
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

    let detector: LanguageDetector;
    if (capabilities.capabilities === 'readily') {
      detector = await window.ai.languageDetector.create();
    } else {
      detector = await window.ai.languageDetector.create({
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });
      await detector.ready;
    }

    return detector;
  } catch (error) {
    console.error('Failed to setup language detector:', error);
    return null;
  }
}

async function setupTranslator(sourceLanguage: string, targetLanguage: string): Promise<Translator | null> {
  if (!window.ai?.translator) {
    console.error('Translator API not available');
    return null;
  }

  try {
    const capabilities = await window.ai.translator.capabilities();
    const availability = capabilities.languagePairAvailable(sourceLanguage, targetLanguage);

    if (availability === 'no') {
      console.error('Translation pair not available');
      return null;
    }

    const translator = await window.ai.translator.create({
      sourceLanguage,
      targetLanguage,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
        });
      },
    });

    if (availability === 'after-download') {
      await translator.ready;
    }

    return translator;
  } catch (error) {
    console.error('Failed to setup translator:', error);
    return null;
  }
}

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detector, setDetector] = useState<LanguageDetector | null>(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedVisualTheme = localStorage.getItem('visualTheme') || 'bubbles';
    return { mode: savedTheme, visual: savedVisualTheme };
  });

  useEffect(() => {
    setupLanguageDetector().then(setDetector);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
    document.documentElement.setAttribute('data-visual-theme', theme.visual);
    localStorage.setItem('theme', theme.mode);
    localStorage.setItem('visualTheme', theme.visual);
  }, [theme]);

  const handleSubmit = async () => {
    if (!inputText.trim() || !detector) return;
    setError(null);
    setIsProcessing(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        type: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');

      const results = await detector.detect(inputText);
      const detectedLanguage = results[0]?.detectedLanguage || 'unknown';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I detected that your message is in ${languages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}. Would you like me to translate it?`,
        type: 'bot',
        timestamp: new Date(),
        originalText: inputText,
        detectedLanguage
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process your message';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async (messageId: string, targetLanguage: string) => {
    setError(null);
    setIsProcessing(true);

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message || !message.originalText || !message.detectedLanguage) return;

      const userRequest: Message = {
        id: Date.now().toString(),
        text: `Translate this to ${languages.find(l => l.code === targetLanguage)?.name}`,
        type: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userRequest]);

      const translator = await setupTranslator(message.detectedLanguage, targetLanguage);
      if (!translator) {
        throw new Error('Translation service not available');
      }

      const translation = await translator.translate(message.originalText);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: translation,
        type: 'bot',
        timestamp: new Date(),
        isTranslation: true
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to translate text';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTheme = () => {
    setTheme(prev => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
  };

  const changeVisualTheme = (visualTheme: string) => {
    setTheme(prev => ({ ...prev, visual: visualTheme }));
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const renderThemeElements = () => {
    const currentTheme = themes.find(t => t.id === theme.visual);
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
    <div className="app">
      {renderThemeElements()}

      <main className="container">
        <div className="header">
          <h1 className="title">
            LanguageSync 🤖
            <div className="header-actions">
              <div className="theme-selector">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => changeVisualTheme(t.id)}
                    className={`theme-button ${theme.visual === t.id ? 'active' : ''}`}
                    title={t.name}
                  >
                    <Palette size={20} />
                  </button>
                ))}
              </div>
              <button onClick={clearChat} className="clear-button" aria-label="Clear chat">
                <Trash2 size={24} />
              </button>
              <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                {theme.mode === 'light' ? <Moon size={24} /> : <Sun size={24} />}
              </button>
            </div>
          </h1>
        </div>

        <div className="card">
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="chat-container">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="message-text">{message.text}</p>
                  {message.type === 'bot' && !message.isTranslation && (
                    <div className="translation-controls">
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="language-select-inline"
                        disabled={isProcessing}
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
                      >
                        <Languages size={16} />
                        Translate
                      </button>
                    </div>
                  )}
                  <span className="message-time">
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
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message and press Enter to send..."
                className="input-textarea"
                disabled={isProcessing}
                aria-label="Input text"
              />
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