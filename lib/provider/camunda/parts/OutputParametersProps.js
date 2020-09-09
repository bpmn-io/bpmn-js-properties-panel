'use strict';

var outputParameters = require('./implementation/OutputParameters');

module.exports = function(group, element, bpmnFactory, translate) {

  var outputParametersEntry = outputParameters(element, bpmnFactory, {}, translate);

  group.entries = group.entries.concat(outputParametersEntry.entries);
};
