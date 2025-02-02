import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';

import { useEffect, useState } from 'react';

import { FaArrowLeft, FaCog, FaQuestion } from 'react-icons/fa';

import SettingsScreen from './screens/SettingsScreen';
import MainScreen from './screens/MainScreen';
import { useUIStore } from './store/ui';

const Popup = () => {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { setTheme, isLightTheme: isLightMode, isSelectedByUser } = useUIStore();

  useEffect(() => {
    if (isSelectedByUser) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    setTheme(mediaQuery.matches ? 'light' : 'dark');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'light' : 'dark');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [isSelectedByUser, setTheme]);

  return (
    <div
      className={`App ${isLightMode ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white'} p-4 transition-colors duration-300`}>
      <div className="absolute z-10 flex flex-row items-center space-x-1">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex size-7 items-center justify-center rounded p-1 ${isLightMode ? 'text-black hover:bg-gray-200' : 'text-white hover:bg-gray-600'} `}>
          {showSettings ? <FaArrowLeft size={16} /> : <FaCog size={16} />}
        </button>
        <a
          href="help.html"
          className="flex size-7 items-center justify-center rounded p-1 hover:bg-gray-600"
          target="_blank">
          <FaQuestion color={isLightMode ? 'black' : 'white'} />
        </a>
      </div>

      {showSettings && <SettingsScreen isLightTheme={isLightMode} />}
      {!showSettings && <MainScreen isLightTheme={isLightMode} />}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
