import ChangeElementTemplateHandler from './ChangeElementTemplateHandler';

function registerHandlers(commandStack, elementTemplates, eventBus) {
  commandStack.registerHandler(
    'propertiesPanel.zeebe.changeTemplate',
    ChangeElementTemplateHandler
  );

  // apply default element templates on shape creation
  eventBus.on([ 'commandStack.shape.create.postExecuted' ], function(context) {
    applyDefaultTemplate(context.context.shape, elementTemplates, commandStack);
  });

  // apply default element templates on connection creation
  eventBus.on([ 'commandStack.connection.create.postExecuted' ], function(context) {
    applyDefaultTemplate(context.context.connection, elementTemplates, commandStack);
  });
}

registerHandlers.$inject = [ 'commandStack', 'elementTemplates', 'eventBus' ];


export default {
  __init__: [ registerHandlers ]
};


function applyDefaultTemplate(element, elementTemplates, commandStack) {

  if (!elementTemplates.get(element) && elementTemplates.getDefault(element)) {

    const command = 'propertiesPanel.zeebe.changeTemplate';
    const commandContext = {
      element: element,
      newTemplate: elementTemplates.getDefault(element)
    };

    commandStack.execute(command, commandContext);
  }
}
