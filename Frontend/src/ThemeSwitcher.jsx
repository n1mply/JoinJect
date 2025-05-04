import { useState, useEffect } from "react";
import sun from './icons/light_mode.svg';
import moon from './icons/dark_mode.svg';
import './ThemeSwitcher.css';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="theme-buttons">
      <button 
        className={`theme-button ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
      >
        <img src={sun} alt="Light mode" className="theme-icon" />
      </button>
      <button 
        className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
      >
        <img src={moon} alt="Dark mode" className="theme-icon" />
      </button>
    </div>
  );
}