'use strict';

var ChangeElementTemplateHandler = require('./ChangeElementTemplateHandler');

var getTemplate = require('../Helper').getTemplate,
    getDefaultTemplate = require('../Helper').getDefaultTemplate;

function registerHandlers(commandStack, elementTemplates, eventBus, elementRegistry) {
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

registerHandlers.$inject = [ 'commandStack', 'elementTemplates', 'eventBus', 'elementRegistry' ];


module.exports = {
  __init__: [ registerHandlers ]
};


function applyDefaultTemplate(element, elementTemplates, commandStack) {

  if (!getTemplate(element, elementTemplates)
      && getDefaultTemplate(element, elementTemplates)) {

    var command = 'propertiesPanel.camunda.changeTemplate';
    var commandContext = {
      element: element,
      newTemplate: getDefaultTemplate(element, elementTemplates)
    };

    commandStack.execute(command, commandContext);
  }
}
