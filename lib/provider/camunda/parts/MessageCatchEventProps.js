'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  propertyEntryFactory = require('../../../PropertyEntryFactory');

var forEach = require('lodash/collection/forEach');

function getMessageEventDefinition(element) {

  var bo = getBusinessObject(element);

  var messageEventDefinition = null;
  if(!!bo.eventDefinitions) {
    forEach(bo.eventDefinitions, function(eventDefinition) {
      if(is(eventDefinition, 'bpmn:MessageEventDefinition')) {
        messageEventDefinition = eventDefinition;
        return;
      }
    });
  }

  return messageEventDefinition;
}

module.exports = function(group, element) {
  if(is(element, 'bpmn:IntermediateCatchEvent')) {

    var messageEventDefinition = getMessageEventDefinition(element);

    if(!!messageEventDefinition) {
      group.entries.push(propertyEntryFactory.selectReferenceComboBox({
        id: 'selectMessage',
        description: '',
        label: 'Message Definition',
        businessObject: messageEventDefinition,
        referencedType: 'bpmn:Message',
        referenceProperty: 'messageRef'
      }));
    }
  }
};

