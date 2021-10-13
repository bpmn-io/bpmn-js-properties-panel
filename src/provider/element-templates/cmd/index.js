'use strict';

var ChangeElementTemplateHandler = require('./ChangeElementTemplateHandler');

function registerHandlers(commandStack, elementTemplates, eventBus) {
  commandStack.registerHandler(
    'propertiesPanel.camunda.changeTemplate',
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


module.exports = {
  __init__: [ registerHandlers ]
};


function applyDefaultTemplate(element, elementTemplates, commandStack) {

  if (!elementTemplates.get(element) && elementTemplates.getDefault(element)) {

    var command = 'propertiesPanel.camunda.changeTemplate';
    var commandContext = {
      element: element,
      newTemplate: elementTemplates.getDefault(element)
    };

    commandStack.execute(command, commandContext);
  }
}
