'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  cmdHelper = require('../../../helper/CmdHelper'),
  forEach = require('lodash/collection/forEach');


module.exports = function(group) {

  // Documentation
  var entry = entryFactory.textArea({
    id: 'documentation',
    description: '',
    label: 'Documentation',
    modelProperty: 'documentation'
  });

  entry.set = function(element, values) {
    var businessObject = getBusinessObject(element),
        newObjectList = [];

    if(typeof values.documentation !== 'undefined' && values.documentation !== '') {
      newObjectList.push({
        type: 'bpmn:Documentation',
        text: values.documentation
      })
    }

    return cmdHelper.setList(element, businessObject, 'documentation', newObjectList);
  };

  entry.get = function(element) {
    var businessObject = getBusinessObject(element),
        documentations = businessObject.get('documentation'),
        text = (documentations.length > 0) ? documentations[0].text : '';

    return { documentation: text };
  };

  group.entries.push(entry);
};