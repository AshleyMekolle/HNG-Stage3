import { useState, useEffect, KeyboardEvent } from 'react';
import { Send, Languages, Sun, Moon, Trash2, Palette, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define types
type Message = {
id: string;
text: string;
type: 'user' | 'bot';
timestamp: Date;
originalText?: string;
detectedLanguage?: string;
isTranslation?: boolean;
isSummary?: boolean;
};

type Language = {
code: string;
name: string;
};

type Theme = {
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

// Supported languages
const languages: Language[] = [
{ code: 'en', name: 'English' },
{ code: 'es', name: 'Spanish' },
{ code: 'fr', name: 'French' },
{ code: 'pt', name: 'Portuguese' },
{ code: 'ru', name: 'Russian' },
{ code: 'tr', name: 'Turkish' },
];

// Themes for the UI
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


// Floating animation variants
const floatingVariants = {
initial: { scale: 1, y: 0 },
animate: {
scale: [1, 1.1, 1],
y: [0, -30, 0],
transition: {
duration: 6,
repeat: Infinity,
ease: 'easeInOut',
},
},
};

function App() {
const [inputText, setInputText] = useState('');
const [selectedLanguage, setSelectedLanguage] = useState('en');
const [messages, setMessages] = useState<Message[]>([]);
const [isProcessing, setIsProcessing] = useState(false);
const [error, setError] = useState<string | null>(null);
const [theme, setTheme] = useState(() => {
const savedTheme = localStorage.getItem('theme') || 'light';
const savedVisualTheme = localStorage.getItem('visualTheme') || 'bubbles';
return { mode: savedTheme, visual: savedVisualTheme };
});

// Save theme to localStorage
useEffect(() => {
document.documentElement.setAttribute('data-theme', theme.mode);
document.documentElement.setAttribute('data-visual-theme', theme.visual);
localStorage.setItem('theme', theme.mode);
localStorage.setItem('visualTheme', theme.visual);
}, [theme]);

// Handle text submission
const handleSubmit = async () => {
if (!inputText.trim()) return;
setError(null);
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



const detector = await window.ai.languageDetector.create();
const detectionResults = await detector.detect(inputText);

// Ensure detectionResults is an array and get the top detected language
const detectedLanguage = detectionResults?.[0]?.detectedLanguage || 'unknown';
const languageName = languages.find((lang) => lang.code === detectedLanguage)?.name || detectedLanguage;

const botMessage: Message = {
  id: (Date.now() + 1).toString(),
  text: `I detected that your message is in ${languageName}. Would you like me to translate it or Summarize it?`,
  type: 'bot',
  timestamp: new Date(),
  originalText: inputText,
  detectedLanguage,
};
setMessages((prev) => [...prev, botMessage]);

if (detectedLanguage === 'en') {
  const wordCount = inputText.split(/\s+/).length;
  if (wordCount >= 50 && wordCount <= 150) {
    await handleSummarize(botMessage.id);
  }
}
} catch (err) {
console.error('Error:', err);
setError('Failed to process your message. Please try again.');
} finally {
setIsProcessing(false);
}
};

// Handle translation
const handleTranslate = async (messageId: string, targetLanguage: string) => {
setError(null);
setIsProcessing(true);


try {
  const message = messages.find((m) => m.id === messageId);
  if (!message || !message.originalText || !message.detectedLanguage) return;

  // Add user request to the chat
  const userRequest: Message = {
    id: Date.now().toString(),
    text: `Translate this to ${languages.find((lang) => lang.code === targetLanguage)?.name}`,
    type: 'user',
    timestamp: new Date(),
  };
  setMessages((prev) => [...prev, userRequest]);

  // Translate the text
  const translator = await window.ai.translator.create({
    sourceLanguage: message.detectedLanguage,
    targetLanguage,
  });
  const translatedText = await translator.translate(message.originalText);

  // Add bot response to the chat
  const botResponse: Message = {
    id: (Date.now() + 1).toString(),
    text: translatedText,
    type: 'bot',
    timestamp: new Date(),
    isTranslation: true,
  };
  setMessages((prev) => [...prev, botResponse]);
} catch (err) {
  console.error('Error:', err); // Use the `err` variable
  setError('Failed to translate text. Please try again.');
} finally {
  setIsProcessing(false);
}
};

const meetsMinimumWordCount = (text: string | undefined): boolean => {
  if (!text) return false;
  const wordCount = text.split(/\s+/).length;
  return wordCount >= 150;
};


// Handle summarization
const handleSummarize = async (messageId: string) => {
  setError(null);
  setIsProcessing(true);

  try {
    const message = messages.find((m) => m.id === messageId);
    if (!message || !message.originalText) return;

    // Check word count before proceeding
    if (!meetsMinimumWordCount(message.originalText)) {
      setError('Text must be at least 150 words for summarization.');
      return;
    }

    // Add user request to the chat
    const userRequest: Message = {
      id: Date.now().toString(),
      text: 'Summarize this text',
      type: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userRequest]);

    // Summarize the text
    const summarizer = await window.ai.summarizer.create({
      type: 'key-points',
      format: 'markdown',
      length: 'medium',
    });
    const summary = await summarizer.summarize(message.originalText);

    // Add bot response to the chat
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

// Handle Enter key press
const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
if (e.key === 'Enter' && !e.shiftKey) {
e.preventDefault();
handleSubmit();
}
};

// Toggle theme (light/dark)
const toggleTheme = () => {
setTheme((prev) => ({ ...prev, mode: prev.mode === 'light' ? 'dark' : 'light' }));
};

// Change visual theme
const changeVisualTheme = (visualTheme: string) => {
setTheme((prev) => ({ ...prev, visual: visualTheme }));
};

// Clear chat
const clearChat = () => {
setMessages([]);
setError(null);
};

// Render floating theme elements
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
        LanguageSync 🤖
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
        <div className="error-message">
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
              className="action-button-inline"
              disabled={isProcessing || !message.originalText || !meetsMinimumWordCount(message.originalText)}
              aria-label="Summarize"
              title={!meetsMinimumWordCount(message.originalText) ? "Text must be at least 150 words for summarization" : ""}
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
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message..."
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