import Asana from 'asana';
import { pullResult } from './asana-typeahead.js';
import { fetchClient } from './asana-base.js';
import { setPlatform } from './platform.js';
import { TestPlatform } from './__mocks__/test-platform.js';

jest.mock('./asana-base');

test('pullResult', async () => {
  const mockFetchClient = jest.mocked(fetchClient);

  const mockTask = {} as Asana.resources.Tasks.Type;
  const mockGetTask = async (): Promise<Asana.resources.Tasks.Type> => mockTask;
  const mockTasks = ({ getTask: mockGetTask } as unknown) as Asana.resources.Tasks;

  const mockTypeaheadResult = {} as Asana.resources.ResourceList<Asana.resources.Tasks.Type>;
  const mockTypeaheadForWorkspace = async ():
    Promise<Asana.resources.ResourceList<Asana.resources.Tasks.Type>> => mockTypeaheadResult;
  const mockTypeahead = (
    ({ typeaheadForWorkspace: mockTypeaheadForWorkspace } as unknown) as Asana.resources.Typeahead
  );
  const mockClient = { tasks: mockTasks, typeahead: mockTypeahead } as Asana.Client;
  mockFetchClient.mockResolvedValue(mockClient);

  setPlatform(new TestPlatform());

  const result = await pullResult('foo', 'task', 'bar,baz');

  expect(result).toEqual(mockTypeaheadResult);
});
