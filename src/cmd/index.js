import {
  forEach
} from 'min-dash';

import UpdateBusinessObjectHandler from './UpdateBusinessObjectHandler';
import UpdateBusinessObjectListHandler from './UpdateBusinessObjectListHandler';
import MultiCommandHandler from './MultiCommandHandler';

const HANDLERS = {
  'properties-panel.update-businessobject': UpdateBusinessObjectHandler,
  'properties-panel.update-businessobject-list': UpdateBusinessObjectListHandler,
  'properties-panel.multi-command-executor': MultiCommandHandler
};


function CommandInitializer(eventBus, commandStack) {

  eventBus.on('diagram.init', function() {
    forEach(HANDLERS, function(handler, id) {
      commandStack.registerHandler(id, handler);
    });
  });
}

CommandInitializer.$inject = [ 'eventBus', 'commandStack' ];

export default {
  __init__: [ CommandInitializer ]
};