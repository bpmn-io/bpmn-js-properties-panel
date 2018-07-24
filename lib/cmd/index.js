'use strict';

var forEach = require('lodash/forEach');

var HANDLERS = {
  'properties-panel.update-businessobject': require('./UpdateBusinessObjectHandler'),
  'properties-panel.create-and-reference': require('./CreateAndReferenceHandler'),
  'properties-panel.create-businessobject-list': require('./CreateBusinessObjectListHandler'),
  'properties-panel.update-businessobject-list': require('./UpdateBusinessObjectListHandler'),
  'properties-panel.multi-command-executor': require('./MultiCommandHandler')
};


function CommandInitializer(eventBus, commandStack) {

  eventBus.on('diagram.init', function() {
    forEach(HANDLERS, function(handler, id) {
      commandStack.registerHandler(id, handler);
    });
  });
}

CommandInitializer.$inject = [ 'eventBus', 'commandStack' ];

module.exports = {
  __init__: [ CommandInitializer ]
};