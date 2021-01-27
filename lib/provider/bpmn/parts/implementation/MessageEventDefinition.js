'use strict';

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, messageEventDefinition, translate) {

  group.entries = group.entries.concat(eventDefinitionReference(element, messageEventDefinition, bpmnFactory, {
    label: translate('Global Message referenced'),
    elementName: 'message',
    elementType: 'bpmn:Message',
    referenceProperty: 'messageRef',
    newElementIdPrefix: 'Message_'
  }));


  group.entries = group.entries.concat(
    elementReferenceProperty(element, messageEventDefinition, bpmnFactory, translate, {
      id: 'message-element-name',
      label: translate('Global Message Name'),
      referenceProperty: 'messageRef',
      modelProperty: 'name',
      shouldValidate: true
    })
  );

};
