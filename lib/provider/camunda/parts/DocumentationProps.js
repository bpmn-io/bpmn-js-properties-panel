'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  propertyEntryFactory = require('../../../PropertyEntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


module.exports = function(group) {

  // Documentation
  var entry = propertyEntryFactory.textArea({
    id: 'documentation',
    description: '',
    label: 'Documentation',
    modelProperty: 'documentation'
  });

  entry.set = function(element, values) {
    var businessObject = getBusinessObject(element),
        property = { text: values.documentation},
        newObjectList = [];

    if(typeof values.documentation !== 'undefined' && values.documentation !== '') {
      newObjectList.push({
        type: 'bpmn:Documentation',
        properties: property
      })
    }

    return {
      cmd: 'properties-panel.create-businessobject-list',
      context: {
        element: element,
        currentObject: businessObject,
        propertyName: 'documentation',
        newObjects: newObjectList
      }
    };
  };

  entry.get = function(element) {
    var businessObject = getBusinessObject(element),
        documentations = businessObject.get('documentation'),
        text = (documentations.length > 0) ? documentations[0].text : '';

    return { documentation: text };
  };

  group.entries.push(entry);
};