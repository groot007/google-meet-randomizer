export const waitForElement = (selector: string): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          console.log('element found');
          resolve(element);
          obs.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Timeout after 10 seconds if the element is not found
      //   setTimeout(() => {
      //     observer.disconnect();
      //     reject(new Error('Element not found within timeout period'));
      //   }, 2000);
    }
  });
};

export const triggerClick = (element: Element | null): Promise<void> => {
  return new Promise(resolve => {
    if (!element) {
      resolve();
      return;
    }

    try {
      console.debug('triggerClick: element', element);

      // Prefer the most interactive target: itself, a role=button ancestor, or an internal button
      let target: Element | null = element;
      if (!(element.getAttribute && element.getAttribute('role') === 'button') && element.tagName !== 'BUTTON') {
        target =
          element.closest('button, [role="button"], a, [tabindex]') ||
          element.querySelector('button, [role="button"], a, [tabindex]') ||
          element;
      }

      console.debug('triggerClick: target chosen', target);

      // Helper to dispatch an event
      const dispatch = (ev: Event) => target!.dispatchEvent(ev);

      // Focus first
      (target as HTMLElement)?.focus?.();

      dispatch(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      setTimeout(() => {
        dispatch(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        resolve();
      }, 50);
    } catch (e) {
      console.error('triggerClick error', e);
      resolve();
    }
  });
};

export function isElementVisible(el) {
  if (!el) {
    console.log('Element is null or undefined.');
    return false;
  }
  const rect = el.getBoundingClientRect(),
    vWidth = window.innerWidth || document.documentElement.clientWidth,
    vHeight = window.innerHeight || document.documentElement.clientHeight,
    efp = function (x, y) {
      return document.elementFromPoint(x, y);
    };

  // Return false if it's not in the viewport
  if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) return false;

  // Return true if any of its four corners are visible
  return (
    el.contains(efp(rect.left, rect.top)) ||
    el.contains(efp(rect.right, rect.top)) ||
    el.contains(efp(rect.right, rect.bottom)) ||
    el.contains(efp(rect.left, rect.bottom))
  );
}

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};
