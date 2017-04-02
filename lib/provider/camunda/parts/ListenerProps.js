'use strict';

var listener = require('./implementation/Listener');

module.exports = function(group, element, bpmnFactory, translate) {

  var listenerEntry = listener(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(listenerEntry.entries);

  return {
    getSelectedListener: listenerEntry.getSelectedListener
  };

};
