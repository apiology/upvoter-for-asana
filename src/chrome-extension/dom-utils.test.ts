/**
 * @jest-environment jsdom
 */

import {
  ensureArrayType, htmlElementByClass, htmlElementById, waitForElement, parent, ensureNotNull,
  ensureHtmlElement, htmlElementBySelector, htmlElementsBySelector,
} from './dom-utils.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('ensureNotNull - null', async () => {
  expect(() => ensureNotNull(null)).toThrowError('value is null');
});

test('ensureArrayType - not array', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect(() => ensureArrayType('abc' as any, 'string')).toThrowError('value is not an array: abc');
});

test('ensureArrayType - 123', async () => {
  expect(ensureArrayType([123], 'number')).toEqual([123]);
});

test('ensureArrayType - right type - string', async () => {
  expect(ensureArrayType(['abc'] as Array<unknown>, 'string')).toEqual(['abc']);
});

test('ensureArrayType - wrong type - number vs string', async () => {
  expect(() => ensureArrayType([123] as Array<unknown>, 'string')).toThrowError('element [123] is not a string');
});

test('ensureArrayType - right type - number', async () => {
  expect(ensureArrayType([123] as Array<unknown>, 'number')).toEqual([123]);
});

test('ensureArrayType - wrong type - number', async () => {
  expect(() => ensureArrayType(['abc'] as Array<unknown>, 'number')).toThrowError('element [abc] is not a number');
});

test('ensureArrayType - right type - boolean', async () => {
  expect(ensureArrayType([true] as Array<unknown>, 'boolean')).toEqual([true]);
});

test('ensureArrayType - wrong type - boolean', async () => {
  expect(() => ensureArrayType([123] as Array<unknown>, 'boolean')).toThrowError('element [123] is not a boolean');
});

test('ensureArrayType - empty', async () => {
  expect(ensureArrayType([], Date)).toEqual([]);
});

test('ensureArrayType - string', async () => {
  expect(ensureArrayType(['abc'], 'string')).toEqual(['abc']);
});

test('ensureArrayType - HTMLDivElement', async () => {
  expect(ensureArrayType([], HTMLDivElement)).toEqual([]);
});

test('ensureArrayType - wrong type - HTMLDivElement', async () => {
  expect(() => ensureArrayType(['foo'], HTMLDivElement)).toThrowError('element [foo] is not a HTMLDivElement');
});

test('ensureNotNull - not null', async () => {
  expect(ensureNotNull(123)).toBe(123);
});

test('ensureHtmlElement', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  const bar: HTMLDivElement = htmlElementById('bar', HTMLDivElement);

  expect(ensureHtmlElement(bar, HTMLDivElement)).toBe(bar);
});

test('ensureHtmlElement - null', async () => {
  expect(() => ensureHtmlElement(null, HTMLDivElement)).toThrowError("Couldn't find element");
});

test('ensureHtmlElement - unexpected type', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  const bar: HTMLDivElement = htmlElementById('bar', HTMLDivElement);
  expect(() => ensureHtmlElement(bar, HTMLAnchorElement)).toThrowError('Is not a HTMLAnchorElement as expected: [object HTMLDivElement]');
});

test('htmlElementBySelector', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  const bar: HTMLDivElement = htmlElementById('bar', HTMLDivElement);

  expect(htmlElementBySelector('#bar', HTMLDivElement)).toBe(bar);
});

test('htmlElementBySelector', async () => {
  document.body.innerHTML = `
<p>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</p>
`;

  expect(htmlElementsBySelector('div', HTMLDivElement).map((e) => e.textContent)).toStrictEqual(['1', '2', '3']);
});

test('htmlElementBySelector - wrong element', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  expect(() => htmlElementBySelector('div#bar', HTMLAnchorElement)).toThrowError('element with selector div#bar not an HTMLAnchorElement as expected!');
});

test('htmlElementBySelector - not found', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>Is not a HTMLAnchorElement as expected: [object HTMLDivElement]
</div>
`;

  expect(() => htmlElementBySelector('.bing', HTMLDivElement)).toThrowError("Couldn't find element");
});

test('htmlElementById', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  const bar: HTMLDivElement = htmlElementById('bar', HTMLDivElement);
  expect(bar.textContent).toBe('2');
});

test('htmlElementByIdBadHtmlWrongId', async () => {
  // look for an ID which doesn't exist...

  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  expect(() => htmlElementById('bing', HTMLDivElement)).toThrowError("Couldn't find element with id bing");
});

test('htmlElementByIdBadHtmlWrongElement', async () => {
  // code is expecting this to be an a element, not a div - verify
  // we throw a useful error
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;
  expect(() => htmlElementById('foo', HTMLAnchorElement)).toThrowError('element with id foo not an HTMLAnchorElement as expected');
});

test('htmlElementByClass', async () => {
  document.body.innerHTML = `
<div>
  <div class='foo'>1</div>
  <div class='bar'>2</div>
  <div class='baz'>3</div>
</div>
`;

  const bar: HTMLDivElement = htmlElementByClass('bar', HTMLDivElement);
  expect(bar.textContent).toBe('2');
});

test('htmlElementByClassBadHtmlWrongClass', async () => {
  // look for an ID which doesn't exist...

  document.body.innerHTML = `
<div>
  <div class='foo'>1</div>
  <div class='bar'>2</div>
  <div class='baz'>3</div>
</div>
`;
  expect(() => htmlElementByClass('bing', HTMLDivElement)).toThrowError("Couldn't find element with class bing");
});

test('htmlElementByClassBadHtmlTooMany', async () => {
  document.body.innerHTML = `
<div>
  <div class='foo'>1</div>
  <div class='foo'>2</div>
  <div class='baz'>3</div>
</div>
`;
  expect(() => htmlElementByClass('foo', HTMLDivElement)).toThrowError('More than one element found with class foo');
});

test('htmlElementByClassBadHtmlWrongElement', async () => {
  // code is expecting this to be an a element, not a div - verify
  // we throw a useful error

  document.body.innerHTML = `
<div>
  <div class='foo'>1</div>
  <div class='bar'>2</div>
  <div class='baz'>3</div>
</div>
`;
  expect(() => htmlElementByClass('foo', HTMLAnchorElement)).toThrowError('element with class foo not an HTMLAnchorElement as expected');
});

test('waitForElementAlreadyExists', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;
  const element = await waitForElement('#bar', HTMLDivElement);
  expect(element.textContent).toEqual('2');
});

test('waitForElementDefaultType', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;
  const element = await waitForElement('#bar');
  expect(element.textContent).toEqual('2');
});

test('waitForElementWrongType', () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;

  expect(async () => waitForElement('#bar', HTMLAnchorElement)).rejects.toEqual(new Error('element with selector #bar not an HTMLAnchorElement as expected!'));
});

test('waitForElementAppearsLater', async () => {
  document.body.innerHTML = '';
  const elementPromise = waitForElement('#bar', HTMLDivElement);
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;
  expect((await elementPromise).textContent).toEqual('2');
});

test('parent', async () => {
  document.body.innerHTML = `
<div id='parent'>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>
</div>
`;
  const bar = await waitForElement('#bar', HTMLDivElement);
  expect(parent(bar).id).toEqual('parent');
});

test('parent not found', async () => {
  expect(() => parent(parent(document.body))).toThrow('parent of element is unexpectedly null');
});
