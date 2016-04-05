'use strict';

var ChangeElementTemplateHandler = require('./ChangeElementTemplateHandler');

function registerHandlers(commandStack) {
  commandStack.registerHandler(
    'propertiesPanel.camunda.changeTemplate',
    ChangeElementTemplateHandler
  );
}

registerHandlers.$inject = [ 'commandStack' ];


module.exports = {
  __init__: [ registerHandlers ]
};