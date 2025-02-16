import React, { useState, useEffect } from 'react';
import { Send, Languages, FileText, Sun, Moon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
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

interface Message {
  id: string;
  text: string;
  type: 'input' | 'output';
  timestamp: Date;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    
    const newInputMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      type: 'input',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newInputMessage]);
    setIsProcessing(true);

    setTimeout(() => {
      const outputMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Processed text in ${languages.find(l => l.code === selectedLanguage)?.name}: ${inputText}`,
        type: 'output',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, outputMessage]);
      setInputText('');
      setIsProcessing(false);
    }, 1000);
  };

  const handleAction = (action: 'summarize' | 'translate') => {
    if (!inputText.trim()) return;

    const newInputMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      type: 'input',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newInputMessage]);
    setIsProcessing(true);

    setTimeout(() => {
      const outputMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: action === 'summarize'
          ? `Summary: ${inputText.slice(0, 50)}...`
          : `Translated to ${languages.find(l => l.code === selectedLanguage)?.name}: ${inputText}`,
        type: 'output',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, outputMessage]);
      setInputText('');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="app">
      <motion.div
        className="floating-circle"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          top: '-150px',
          left: '-150px',
          borderRadius: '50%',
          background: 'var(--primary)',
          opacity: 0.1,
        }}
      />
      <motion.div
        className="floating-circle"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          bottom: '-100px',
          right: '-100px',
          borderRadius: '50%',
          background: 'var(--primary)',
          opacity: 0.1,
          animationDelay: '-2s',
        }}
      />
      <motion.div
        className="floating-circle"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          top: '50%',
          right: '10%',
          borderRadius: '50%',
          background: 'var(--primary)',
          opacity: 0.1,
          animationDelay: '-4s',
        }}
      />

      <main className="container">
        <div className="header">
          <h1 className="title">
            Text Processor
            <div className="header-actions">
              <button onClick={clearChat} className="clear-button" aria-label="Clear chat">
                <Trash2 size={24} />
              </button>
              <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
              </button>
            </div>
          </h1>
        </div>

        <div className="card">
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
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="input-section">
            <div className="form-group">
              <label htmlFor="language" className="form-label">
                Select Language
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-select"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="textarea-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here..."
                className="input-textarea"
                disabled={isProcessing}
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

            <div className="action-buttons">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => handleAction('summarize')}
                className="action-button"
                disabled={isProcessing || !inputText.trim()}
              >
                <FileText size={20} />
                Summarize
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => handleAction('translate')}
                className="action-button"
                disabled={isProcessing || !inputText.trim()}
              >
                <Languages size={20} />
                Translate
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;