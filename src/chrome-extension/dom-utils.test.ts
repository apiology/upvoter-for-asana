/**
 * @jest-environment jsdom
 */

import {
  htmlElementByClass, htmlElementById, waitForElement, parent, ensureNotNull,
  ensureHtmlElement, htmlElementBySelector,
} from './dom-utils.js';

afterEach(() => {
  document.body.innerHTML = '';
});

test('ensureNotNull - null', async () => {
  expect(() => ensureNotNull(null)).toThrowError('value is null');
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

test('htmlElementBySelector - wrong element', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
  <div id='baz'>3</div>Is not a HTMLAnchorElement as expected: [object HTMLDivElement]
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
  const element = await waitForElement('#bar');
  expect(element.textContent).toEqual('2');
});

test('waitForElementAppearsLater', async () => {
  document.body.innerHTML = '';
  const elementPromise = waitForElement('#bar');
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
  const bar = await waitForElement('#bar');
  expect(parent(bar).id).toEqual('parent');
});

test('parent not found', async () => {
  expect(() => parent(parent(document.body))).toThrow('parent of element is unexpectedly null');
});
