import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';

import { useEffect, useState } from 'react';

import { FaArrowLeft, FaCog } from 'react-icons/fa';

import Settings from './components/Settings';
import MainContent from './components/MainContent';
import { exampleThemeStorage } from '@extension/storage';

const Popup = () => {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(true);

  const toggleTheme = () => {
    const newTheme = isLightMode ? 'light' : 'dark';
    setIsLightMode(!isLightMode);
    // Save the new theme to storage
    exampleThemeStorage.set(newTheme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    setIsLightMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsLightMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div
      className={`App ${isLightMode ? 'light-theme bg-slate-50 text-black' : 'dark-theme bg-gray-800 text-white'} p-4 transition-colors duration-300`}>
      <div className="absolute z-10 flex flex-col items-start space-y-1">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex h-7 w-7 items-center justify-center rounded p-1 ${isLightMode ? 'text-black hover:bg-gray-200' : 'text-white hover:bg-gray-600'} `}>
          {showSettings ? <FaArrowLeft size={16} /> : <FaCog size={16} />}
        </button>
      </div>

      {showSettings && <Settings onThemeToggle={toggleTheme} isLightTheme={isLightMode} />}
      {!showSettings && <MainContent isLightTheme={isLightMode} />}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
