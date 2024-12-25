import { DEFAULT_SELECTORS, type Selectors, withErrorBoundary, withSuspense } from '@extension/shared';
import { useSelectorsStore } from '@extension/storage';
import { useUIStore } from '@src/store/ui';

const SelectorsSettings = () => {
  const { isLightTheme } = useUIStore();

  const { selectors, updateSelector, resetSelectors } = useSelectorsStore();

  return (
    <div className="border-t pt-4">
      <h2 className="mb-4 text-lg font-bold">Selectors Settings</h2>

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
      <span>To apply changes in selectors you need to reload the page</span>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SelectorsSettings, <div>Loading...</div>), <div>Error Occurred</div>);
