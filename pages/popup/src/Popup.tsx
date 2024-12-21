import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';

import { useEffect, useState } from 'react';

import { FaArrowLeft, FaCog } from 'react-icons/fa';

import Settings from './components/Settings';
import MainContent from './components/MainContent';
import { useUIStore } from './store/ui';

const Popup = () => {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { setTheme, isLightTheme: isLightMode, isSelectedByUser } = useUIStore();

  console.log('is selected by user', isSelectedByUser);
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
      <div className="absolute z-10 flex flex-col items-start space-y-1">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex size-7 items-center justify-center rounded p-1 ${isLightMode ? 'text-black hover:bg-gray-200' : 'text-white hover:bg-gray-600'} `}>
          {showSettings ? <FaArrowLeft size={16} /> : <FaCog size={16} />}
        </button>
      </div>

      {showSettings && <Settings isLightTheme={isLightMode} />}
      {!showSettings && <MainContent isLightTheme={isLightMode} />}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
