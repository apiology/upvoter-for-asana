import Asana from 'asana';
import { omniboxInputEnteredListener } from './omnibox.js';
import {
  actOnInputData, logSuccess, pullSuggestions, Suggestion,
} from '../upvoter-for-asana.js';

jest.mock('../upvoter-for-asana');

afterEach(() => {
  jest.clearAllMocks();
});

test('omniboxInputEnteredListenerNonDefault', async () => {
  const mockActOnInputData = jest.mocked(actOnInputData);
  const mockLogSuccess = jest.mocked(logSuccess);
  const task = {} as Asana.resources.Tasks.Type;
  mockActOnInputData.mockResolvedValue(task);

  await omniboxInputEnteredListener('upvoter-for-asana:mumble');
  expect(mockActOnInputData).toHaveBeenCalledWith('upvoter-for-asana:mumble');
  expect(mockLogSuccess).toHaveBeenCalledWith(task);
});

test('omniboxInputEnteredListenerException', async () => {
  const mockActOnInputData = jest.mocked(actOnInputData);
  const mockLogSuccess = jest.mocked(logSuccess);
  mockActOnInputData.mockRejectedValue('123');

  await expect(omniboxInputEnteredListener('upvoter-for-asana:mumble')).rejects.toMatch('123');
  expect(mockActOnInputData).toHaveBeenCalledWith('upvoter-for-asana:mumble');
  expect(mockLogSuccess).not.toHaveBeenCalled();
});

test('omniboxInputEnteredListenerExceptionWithAlertAvailable', async () => {
  const mockActOnInputData = jest.mocked(actOnInputData);
  const mockLogSuccess = jest.mocked(logSuccess);
  mockActOnInputData.mockRejectedValue('123');

  await expect(omniboxInputEnteredListener('upvoter-for-asana:mumble')).rejects.toMatch('123');
  expect(mockActOnInputData).toHaveBeenCalledWith('upvoter-for-asana:mumble');
  expect(mockLogSuccess).not.toHaveBeenCalled();
});

test('omniboxInputEnteredListenerDefaultEmptyList', async () => {
  const mockActOnInputData = jest.mocked(actOnInputData);
  const mockLogSuccess = jest.mocked(logSuccess);
  const mockPullSuggestions = jest.mocked(pullSuggestions);
  const task = {} as Asana.resources.Tasks.Type;
  mockActOnInputData.mockResolvedValue(task);
  mockPullSuggestions.mockResolvedValue([]);

  await expect(omniboxInputEnteredListener('blah')).rejects.toEqual(new Error('No results for "blah"'));
  expect(mockActOnInputData).not.toHaveBeenCalled();
  expect(mockLogSuccess).not.toHaveBeenCalled();
});

test('omniboxInputEnteredListenerDefaultMultipleItems', async () => {
  const mockActOnInputData = jest.mocked(actOnInputData);
  const mockLogSuccess = jest.mocked(logSuccess);
  const mockPullSuggestions = jest.mocked(pullSuggestions);
  const task = {} as Asana.resources.Tasks.Type;
  mockActOnInputData.mockResolvedValue(task);
  const item1: Suggestion = { url: 'upvoter-for-asana:foo', description: 'dfoo' };
  const item2: Suggestion = { url: 'upvoter-for-asana:bar', description: 'dbar' };
  const item3: Suggestion = { url: 'upvoter-for-asana:baz', description: 'dbaz' };
  mockPullSuggestions.mockResolvedValue([item1, item2, item3]);

  await omniboxInputEnteredListener('foo');
  expect(mockActOnInputData).toHaveBeenCalledWith('upvoter-for-asana:foo');
  expect(mockLogSuccess).toHaveBeenCalledWith(task);
});
