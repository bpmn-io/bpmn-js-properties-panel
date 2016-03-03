'use strict';

var nameEntryFactory = require('./implementation/Name'),
    is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function(group, element) {

  if (!is(element, 'bpmn:Collaboration')) {

    // name
    group.entries = group.entries.concat(nameEntryFactory(element));

  }

};
