/**
 * @jest-environment jsdom
 */

import Asana from 'asana';
import { fetchClient } from '../asana-base.js';
import { observeAndFixDependencyLinks } from './content-script.js';
import { setPlatform } from '../platform.js';
import { TestPlatform } from '../__mocks__/test-platform.js';

afterEach(() => {
  document.body.innerHTML = '';
});

jest.mock('../upvoter-for-asana');
jest.mock('../asana-base');

test('registerEventListeners', async () => {
  document.body.innerHTML = `
<div>
  <div id='foo'>1</div>
  <div id='bar'>2</div>
<div class="CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode">This task is still blocked by <a class="PrimaryNavigationLink CompleteTaskWithIncompletePrecedentTasksConfirmationModal-primaryNavigationLink BaseLink" href="https://foo">Task name</a>.</div>
</div>
`;
  const mockFetchClient = jest.mocked(fetchClient);

  const mockTask = {} as Asana.resources.Tasks.Type;
  const mockGetTask = async (): Promise<Asana.resources.Tasks.Type> => mockTask;
  const mockTasks = ({ getTask: mockGetTask } as unknown) as Asana.resources.Tasks;
  const mockClient = { tasks: mockTasks } as Asana.Client;
  mockFetchClient.mockResolvedValue(mockClient);

  setPlatform(new TestPlatform());

  observeAndFixDependencyLinks();

  const element = document.querySelector('.CompleteTaskWithIncompletePrecedentTasksConfirmationModal-bodyNode a');
  expect(element?.textContent).toEqual('Task name [...]');
});
