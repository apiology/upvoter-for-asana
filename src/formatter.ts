import * as Asana from 'asana';

export abstract class Formatter {
  abstract formatTask(task: Asana.resources.Tasks.Type): string;

  abstract escapeDescriptionPlainText(text: string): string;
}
