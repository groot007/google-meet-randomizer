import { DEFAULT_SELECTORS, type Selectors } from '@extension/shared';
import { useSelectorsStore } from '@extension/storage';

const STORAGE_KEY = 'MEET_SELECTORS';

export class SelectorService {
  private static defaultSelectors: Selectors = DEFAULT_SELECTORS;
  private static currentSelectors: Selectors = { ...this.defaultSelectors };

  static async init(): Promise<void> {
    try {
      const storedSelectors = useSelectorsStore.getState().selectors;

      console.log('HYDRRRR', useSelectorsStore.getState()._hasHydrated);

      if (storedSelectors) {
        this.currentSelectors = {
          ...this.defaultSelectors,
          ...storedSelectors,
        };
      }
    } catch (error) {
      console.error('Failed to load selectors:', error);
    }
  }

  static async updateSelector(key: keyof Selectors, value: string): Promise<void> {
    try {
      this.currentSelectors = {
        ...this.currentSelectors,
        [key]: value,
      };

      await chrome.storage.local.set({
        [STORAGE_KEY]: this.currentSelectors,
      });
    } catch (error) {
      console.error('Failed to update selector:', error);
    }
  }

  static getSelector<K extends keyof Selectors>(key: K): Selectors[K] {
    return this.currentSelectors[key];
  }

  static getAllSelectors(): Selectors {
    return { ...this.currentSelectors };
  }

  static async resetToDefault(): Promise<void> {
    try {
      this.currentSelectors = { ...this.defaultSelectors };
      await chrome.storage.local.set({
        [STORAGE_KEY]: this.defaultSelectors,
      });
    } catch (error) {
      console.error('Failed to reset selectors:', error);
    }
  }
}
