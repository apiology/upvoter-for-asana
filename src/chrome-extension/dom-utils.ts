// https://2ality.com/2020/04/classes-as-values-typescript.html
/* eslint-disable @typescript-eslint/no-explicit-any */
type Class<T> = new (...args: any[]) => T;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const htmlElementById = <T extends HTMLElement>(id: string, clazz: Class<T>): T => {
  const element = document.getElementById(id);
  if (element == null) {
    throw new Error(`Couldn't find element with id ${id}`);
  }
  if (!(element instanceof clazz)) {
    throw new Error(`element with id ${id} not an ${clazz.name} as expected!`);
  }
  return element;
};

export const htmlElementByClass = <T extends HTMLElement>(className: string,
  clazz: Class<T>): T => {
  const elements = document.getElementsByClassName(className);
  if (elements.length === 0) {
    throw new Error(`Couldn't find element with class ${className}`);
  }
  if (elements.length > 1) {
    throw new Error(`More than one element found with class ${className}`);
  }
  const element = elements[0];
  if (!(element instanceof clazz)) {
    throw new Error(`element with class ${className} not an ${clazz.name} as expected!`);
  }
  return element;
};

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export function waitForElement(selector: string): Promise<Element> {
  return new Promise<Element>((resolve) => {
    const e = document.querySelector(selector);
    if (e) {
      resolve(e);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export const parent = (element: Element): Element => {
  const p = element.parentElement;
  if (p === null) {
    throw new Error('parent of element is unexpectedly null');
  }
  return p;
};
