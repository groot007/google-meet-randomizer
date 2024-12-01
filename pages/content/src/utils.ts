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
