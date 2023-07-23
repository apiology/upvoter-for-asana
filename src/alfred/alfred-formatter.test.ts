import Asana from 'asana';
import { AlfredFormatter } from './alfred-formatter.js';

test('formatUpvotedTask', async () => {
  const formatter = new AlfredFormatter();
  const task = {
    gid: 'gid',
    name: 'task name',
  } as Asana.resources.Tasks.Type;
  expect(formatter.formatUpvotedTask(23, task)).toEqual('23: task name');
});
