'use strict';

var inputParameters = require('./implementation/InputParameters');

module.exports = function(group, element, bpmnFactory, translate) {

  var inputParametersEntry = inputParameters(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(inputParametersEntry.entries);
};
