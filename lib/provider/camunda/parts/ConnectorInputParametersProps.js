'use strict';

var inputParameters = require('./implementation/InputParameters');

module.exports = function(group, element, bpmnFactory, translate) {

  var inputParametersEntry = inputParameters(element, bpmnFactory, {
    idPrefix: 'connector-',
    insideConnector: true
  }, translate);

  group.entries = group.entries.concat(inputParametersEntry.entries);
};
