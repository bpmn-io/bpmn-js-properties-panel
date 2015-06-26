'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  propertyEntryFactory = require('../../../PropertyEntryFactory');


module.exports = function(group, element) {
  if (is(element, 'camunda:AsyncCapable')) {

    // AsyncBefore
    group.entries.push(propertyEntryFactory.checkbox({
      id: 'asyncBefore',
      description: '',
      label: 'Asynchronous Before',
      modelProperty: 'asyncBefore'
    }));

    // AsyncAfter
    group.entries.push(propertyEntryFactory.checkbox({
      id: 'asyncAfter',
      description: '',
      label: 'Asynchronous After',
      modelProperty: 'asyncAfter'
    }));
  }
};