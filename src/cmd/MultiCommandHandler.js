import {
  forEach
} from 'min-dash';

/**
 * A handler that combines and executes multiple commands.
 *
 * All updates are bundled on the command stack and executed in one step.
 * This also makes it possible to revert the changes in one step.
 *
 * Example use case: remove the camunda:formKey attribute and in addition
 * add all form fields needed for the camunda:formData property.
 */
export default class MultiCommandHandler {
  constructor(commandStack) {
    this._commandStack = commandStack;
  }

  preExecute(context) {
    const commandStack = this._commandStack;

    forEach(context, function(command) {
      commandStack.execute(command.cmd, command.context);
    });
  }
}

MultiCommandHandler.$inject = [ 'commandStack' ];