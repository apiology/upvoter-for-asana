import * as Asana from 'asana';

export default abstract class Formatter {
  abstract formatTask(task: Asana.resources.Tasks.Type): string;

  abstract formatUpvotedTask(upvotes: number, task: Asana.resources.Tasks.Type): string;
}
