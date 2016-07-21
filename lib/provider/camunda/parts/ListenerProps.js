'use strict';

var listener = require('./implementation/Listener');

module.exports = function(group, element, bpmnFactory) {

  var listenerEntry = listener(element, bpmnFactory);

  group.entries = group.entries.concat(listenerEntry.entries);

  return {
    getSelectedListener: listenerEntry.getSelectedListener
  };

};
