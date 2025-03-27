import { DEFAULT_SELECTORS, type Selectors, withErrorBoundary, withSuspense } from '@extension/shared';
import { useSelectorsStore } from '@extension/storage';
import { useUIStore } from '@src/store/ui';
import { useState } from 'react';
import { FaEye } from 'react-icons/fa';

interface StorageData {
  key: string;
  value: any;
}

const formatStorageData = (data: Record<string, any>): StorageData[] => {
  return Object.entries(data).map(([key, value]) => {
    try {
      // Parse the stringified JSON
      const parsedValue = JSON.parse(value);
      // If it's a nested JSON string, parse it again
      if (typeof parsedValue === 'string') {
        return {
          key,
          value: JSON.stringify(JSON.parse(parsedValue), null, 2),
        };
      }
      return {
        key,
        value: JSON.stringify(parsedValue, null, 2),
      };
    } catch (e) {
      return {
        key,
        value: JSON.stringify(value, null, 2),
      };
    }
  });
};

const SelectorsSettings = () => {
  const { isLightTheme } = useUIStore();
  const [showStorageData, setShowStorageData] = useState(false);
  const [storageData, setStorageData] = useState<StorageData[]>([]);

  const { selectors, updateSelector, resetSelectors } = useSelectorsStore();

  const cleanStorage = () => {
    chrome.storage.local.clear();
  };

  const viewStorage = async () => {
    const data = await chrome.storage.local.get(null);
    const formattedData = formatStorageData(data);
    setStorageData(formattedData);
    setShowStorageData(true);
  };

  return (
    <div className="border-t pt-4">
      <h2 className="mb-4 text-lg font-bold">Drawing (Experimental feature) </h2>
      <h2 className="my-4 text-lg font-bold">Selectors Settings</h2>

      <div className="grid gap-4">
        {/* Add remaining selector inputs */}
        {Object.entries(DEFAULT_SELECTORS).map(([key, value]) => (
          <div key={key} className="flex flex-col space-y-2">
            <label className="text-sm font-medium">
              {key
                .split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ')}
            </label>
            <input
              type="text"
              value={selectors[key as keyof Selectors] as string}
              onChange={e => updateSelector(key as keyof Selectors, e.target.value)}
              placeholder={value as string}
              className={`rounded border p-2 ${isLightTheme ? 'border-gray-300' : 'border-gray-600 bg-gray-700'}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={resetSelectors} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          Reset to Defaults
        </button>
      </div>
      <div>
        <span>To apply changes in selectors you need to reload the page</span>
      </div>
      <div className="mt-4 flex space-x-3">
        <button onClick={cleanStorage} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          Clear Storage
        </button>

        <button
          onClick={viewStorage}
          className="flex items-center space-x-2 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600">
          <FaEye size={14} />
          <span>View Storage</span>
        </button>
      </div>

      {showStorageData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[80vh] w-[80vw] overflow-auto rounded bg-white p-4 dark:bg-gray-800">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Storage Data</h2>
              <button onClick={() => setShowStorageData(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <pre className="mt-4 overflow-auto">
              {storageData.map(({ key, value }) => (
                <div key={key} className="mb-4">
                  <strong>{key}:</strong>
                  <br />
                  <p className="text-left text-[8px]">{value}</p>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(SelectorsSettings, <div>Loading...</div>), <div>Error Occurred</div>);
