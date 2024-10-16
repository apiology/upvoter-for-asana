import { platform } from '../platform.js';

// https://2ality.com/2020/04/classes-as-values-typescript.html
/* eslint-disable @typescript-eslint/no-explicit-any */
type Class<T> = new (...args: any[]) => T;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const ensureNotNull = <T>(value: T | null): T => {
  if (value == null) {
    throw new Error('value is null');
  }
  return value;
};

export const ensureHtmlElement = <T extends HTMLElement>(element: object | null,
  clazz: Class<T>): T => {
  if (element == null) {
    throw new Error("Couldn't find element");
  }
  if (!(element instanceof clazz)) {
    throw new Error(`Is not a ${clazz.name} as expected: ${element}`);
  }

  return element;
};

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

export const htmlElementBySelector = <T extends HTMLElement>(selector: string,
  clazz: Class<T>): T => {
  const element = document.querySelector(selector);
  if (element == null) {
    throw new Error(`Couldn't find element with selector ${selector}`);
  }
  if (!(element instanceof clazz)) {
    throw new Error(`element with selector ${selector} not an ${clazz.name} as expected!`);
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

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export function waitForPopulatedAttr(e: HTMLElement, attributeName: string): Promise<Attr> {
  const logger = platform().logger();

  return new Promise<Attr>((resolve) => {
    let attr = e.getAttributeNode(attributeName);
    if (attr && attr.value && attr.value.length > 0) {
      resolve(attr);
    } else {
      logger.debug('initial look for changes on', attributeName, 'on', e.outerHTML, 'found no value');
    }

    const observer = new MutationObserver(() => {
      attr = e.getAttributeNode(attributeName);
      if (attr && attr.value && attr.value.length > 0) {
        resolve(attr);
        observer.disconnect();
      } else {
        logger.debug('incremental look for changes on', attributeName, 'on', e.outerHTML, 'found no value');
      }
    });

    observer.observe(e, {
      attributes: true,
    });
    logger.debug('Created observer for', attributeName, 'on', e.outerHTML);
  });
}

export const parent = (element: Element): Element => {
  const p = element.parentElement;
  if (p === null) {
    throw new Error('parent of element is unexpectedly null');
  }
  return p;
};
