'use strict';

var inputOutputParameter = require('./implementation/InputOutputParameter');

var assign = require('lodash/object/assign');

module.exports = function(group, element, bpmnFactory, options, translate) {

  group.entries = group.entries.concat(inputOutputParameter(element, bpmnFactory, assign({}, options), translate));

};
