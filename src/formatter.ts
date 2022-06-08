import * as Asana from 'asana';

export default abstract class Formatter {
  abstract formatTask(task: Asana.resources.Tasks.Type): string;
}
