// https://2ality.com/2020/04/classes-as-values-typescript.html
/* eslint-disable @typescript-eslint/no-explicit-any */
type Class<T> = new (...args: any[]) => T;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const ensureNotNull = <T>(value: T | null | undefined): T => {
  if (value == null) {
    throw new Error('value is null');
  }
  return value;
};

export function ensureArrayType(value: Array<unknown>, type: 'number'): Array<number>;

export function ensureArrayType(value: Array<unknown>, type: 'string'): Array<string>;

export function ensureArrayType(value: Array<unknown>, type: 'boolean'): Array<boolean>;

export function ensureArrayType<T extends object>(value: Array<unknown>, type: Class<T>): Array<T>;

export function ensureArrayType
<T extends object | StringConstructor | NumberConstructor | BooleanConstructor>(
  value: Array<unknown>,
  type: Class<T> | 'number' | 'string' | 'boolean'
): Array<T> {
  if (!Array.isArray(value)) {
    throw new Error(`value is not an array: ${value}`);
  }
  for (const element of value) {
    if (type === 'string') {
      if (typeof element !== 'string') {
        throw new Error(`element [${element}] is not a string`);
      }
    } else if (type === 'number') {
      if (typeof element !== 'number') {
        throw new Error(`element [${element}] is not a number`);
      }
    } else if (type === 'boolean') {
      if (typeof element !== 'boolean') {
        throw new Error(`element [${element}] is not a boolean`);
      }
    } else if (!(element instanceof type)) {
      throw new Error(`element [${element}] is not a ${type.name}`);
    }
  }
  return value as Array<T>;
}

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

export const htmlElementsBySelector = <T extends Element>(selector: string,
  clazz: Class<T>): T[] => {
  const elements = Array.from(document.querySelectorAll(selector));
  try {
    return ensureArrayType(elements, clazz);
  } catch {
    throw new Error(`element with selector ${selector} not an ${clazz.name} as expected!`);
  }
};

export const htmlElementByClass = <T extends Element>(className: string,
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

const lookForElements = <T extends Element>(
  resolve: (value: T[] | PromiseLike<T[]>) => void,
  reject: (reason?: any) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
  selector: string,
  clazz: Class<T>
): boolean => {
  try {
    const e = htmlElementsBySelector(selector, clazz);
    if (e.length > 0) {
      resolve(e);
      return true;
    }
  } catch (err) {
    reject(err);
  }
  return false;
};

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
export function waitForElements<T extends Element>(
  selector: string,
  clazz: Class<T> = Element as Class<T>
): Promise<T[]> {
  return new Promise<T[]>((resolve, reject) => {
    if (!lookForElements(resolve, reject, selector, clazz)) {
      const observer = new MutationObserver(() => {
        if (lookForElements(resolve, reject, selector, clazz)) {
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  });
}

export async function waitForElement<T extends Element>(
  selector: string,
  clazz: Class<T> = Element as Class<T>
): Promise<T> {
  const elements = await waitForElements(selector, clazz);
  return ensureNotNull(elements[0]);
}

export const parent = (element: Element): Element => {
  const p = element.parentElement;
  if (p === null) {
    throw new Error('parent of element is unexpectedly null');
  }
  return p;
};
