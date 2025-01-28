import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { FaMoon, FaAdjust, FaChevronCircleDown } from 'react-icons/fa';
import { useSettingsStore } from '@src/store/settings';
import { useUIStore } from '@src/store/ui';
import { getExtensionVersion, isDevMode } from '@src/utils/other';
import SelectorsSettings from './SelectorsSettings';
import GroupSettings from './GroupSettings';
import { useState } from 'react';

const Settings = () => {
  const { isLightTheme, setTheme } = useUIStore();
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const isDev = isDevMode();
  const version = getExtensionVersion();

  const { listPrefix, listPostfix, listItemMarker, setListPrefix, setListPostfix, setListItemMarker } =
    useSettingsStore();

  return (
    <div className="relative flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold">Settings</h1>
      <button
        onClick={() => {
          setTheme(isLightTheme ? 'dark' : 'light', true);
        }}
        className={`absolute right-0 top-0 mt-0 flex size-7 items-center justify-center rounded ${isLightTheme ? 'text-black' : 'text-white'}`}>
        {isLightTheme ? <FaMoon size={16} /> : <FaAdjust size={16} />}
      </button>
      <div className="mt-4 space-y-4">
        <div className="flex flex-row items-start space-x-3">
          <GroupSettings />
        </div>
        <div className="flex flex-row items-start space-x-3">
          <div className="flex flex-col items-start space-y-2">
            <label htmlFor="listPrefix" className="text-sm font-medium">
              Text before the list
            </label>
            <input
              id="listPrefix"
              type="text"
              value={listPrefix}
              placeholder="ex. Order List"
              onChange={e => setListPrefix(e.target.value)}
              className={`w-full rounded border p-2 ${isLightTheme ? 'border-gray-300 text-black' : 'border-gray-600 bg-gray-700 text-white'}`}
            />
          </div>
          <div className="flex flex-col items-start space-y-2">
            <label htmlFor="listPostfix" className="text-sm font-medium">
              Text after the list
            </label>
            <input
              id="listPostfix"
              type="text"
              value={listPostfix}
              placeholder="ex. Have a great day!"
              onChange={e => setListPostfix(e.target.value)}
              className={`w-full rounded border p-2 ${isLightTheme ? 'border-gray-300 text-black' : 'border-gray-600 bg-gray-700 text-white'}`}
            />
          </div>
        </div>

        <div className="flex w-full flex-row items-start space-x-3">
          <div className="custom-width mr-4 flex flex-col items-start justify-start space-y-2">
            <label htmlFor="listItemMarker" className="text-sm font-medium">
              List item marker
            </label>
            <input
              id="listItemMarker"
              type="text"
              value={listItemMarker}
              onChange={e => setListItemMarker(e.target.value)}
              className={`w-full rounded border p-2 ${isLightTheme ? 'border-gray-300 text-black' : 'border-gray-600 bg-gray-700 text-white'}`}
              placeholder="# - ref for numbers"
            />
          </div>
        </div>

        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex items-center justify-center space-x-2">
          Advanced Settings
          <FaChevronCircleDown className="ml-3" />
        </button>

        {showAdvancedSettings && <SelectorsSettings />}

        <footer className="flex justify-end">
          <span>
            v{version} {isDev ? '(dev)' : ''}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Settings, <div>Loading...</div>), <div>Error Occurred</div>);
