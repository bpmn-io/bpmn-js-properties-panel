'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


module.exports = function(group, element, translate) {

  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (is(element, 'camunda:Initiator') && !is(element.parent, 'bpmn:SubProcess')) {
    group.entries.push(entryFactory.textField({
      id: 'initiator',
      label: translate('Initiator'),
      modelProperty: 'initiator'
    }));
  }
};
