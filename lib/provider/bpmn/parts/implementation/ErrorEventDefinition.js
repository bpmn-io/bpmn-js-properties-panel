'use strict';

var eventDefinitionReference = require('./EventDefinitionReference'),
    elementReferenceProperty = require('./ElementReferenceProperty');


module.exports = function(group, element, bpmnFactory, errorEventDefinition, translate) {


  group.entries = group.entries.concat(eventDefinitionReference(element, errorEventDefinition, bpmnFactory, {
    label: translate('Global Error referenced'),
    elementName: 'error',
    elementType: 'bpmn:Error',
    referenceProperty: 'errorRef',
    newElementIdPrefix: 'Error_'
  }));


  group.entries = group.entries.concat(
    elementReferenceProperty(element, errorEventDefinition, bpmnFactory, translate, {
      id: 'error-element-name',
      label: translate('Name'),
      referenceProperty: 'errorRef',
      modelProperty: 'name',
      shouldValidate: true
    })
  );


  group.entries = group.entries.concat(
    elementReferenceProperty(element, errorEventDefinition, bpmnFactory, translate, {
      id: 'error-element-code',
      label: translate('Code'),
      referenceProperty: 'errorRef',
      modelProperty: 'errorCode'
    })
  );

};
