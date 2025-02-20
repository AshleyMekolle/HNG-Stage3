
export class ThemeManager {
  static initializeTheme(): { mode: string; visual: string } {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedVisualTheme = localStorage.getItem('visualTheme') || 'bubbles';
    return { mode: savedTheme, visual: savedVisualTheme };
  }

  static saveTheme(mode: string, visual: string): void {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-visual-theme', visual);
    localStorage.setItem('theme', mode);
    localStorage.setItem('visualTheme', visual);
  }
}
