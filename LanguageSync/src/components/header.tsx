// Header.tsx
import { Sun, Moon, Trash2, Palette } from 'lucide-react';
import { Theme } from '../types/types';

interface HeaderProps {
  theme: { mode: string; visual: string };
  themes: Theme[];
  toggleTheme: () => void;
  changeVisualTheme: (visualTheme: string) => void;
  clearChat: () => void;
}

export const Header = ({ theme, themes, toggleTheme, changeVisualTheme, clearChat }: HeaderProps) => {
  return (
    <div className="header">
      <div className="header-content">
        <h1 className="title">LanguageSync 🤖</h1>
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
                <Palette size={20} aria-hidden="true" />
              </button>
            ))}
          </div>
          <button onClick={clearChat} className="clear-button" aria-label="Clear chat history">
            <Trash2 size={24} aria-hidden="true" />
          </button>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={`Switch to ${theme.mode === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme.mode === 'light' ? <Moon size={24} aria-hidden="true" /> : <Sun size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
};