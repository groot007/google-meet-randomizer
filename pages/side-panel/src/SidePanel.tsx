import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { useEffect, type ComponentPropsWithoutRef } from 'react';

const SidePanel = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = 'side-panel/logo.png';

  useEffect(() => {
    fetch('https://meme-api.com/gimme/1')
      .then(res => res.json())
      .then(res => console.log(res));
  }, []);

  return (
    <div className={`App ${isLight ? 'bg-slate-50' : 'bg-gray-800'}`}>
      <header className={`App-header ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
        <iframe
          src="https://html5.gamemonetize.co/inecaxtvaq78xspd55l0wxdb8ss4o56p/"
          width="360"
          title="game"
          height="554"></iframe>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <div> Loading ... </div>), <div> Error Occur </div>);
