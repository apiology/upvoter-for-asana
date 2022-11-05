import Asana from 'asana';
import { omniboxInputEnteredListener } from './omnibox.js';
import { actOnInputData, logSuccess } from '../upvoter-for-asana.js';

jest.mock('../upvoter-for-asana');

test('omniboxInputEnteredListenerNonDefault', async () => {
  const mockActOnInputData = jest.mocked(actOnInputData);
  const mockLogSuccess = jest.mocked(logSuccess);
  const task = {} as Asana.resources.Tasks.Type;
  mockActOnInputData.mockResolvedValue(task);

  await omniboxInputEnteredListener('upvoter-for-asana:mumble');
  expect(mockActOnInputData).toHaveBeenCalledWith('upvoter-for-asana:mumble');
  expect(mockLogSuccess).toHaveBeenCalledWith(task);
});
