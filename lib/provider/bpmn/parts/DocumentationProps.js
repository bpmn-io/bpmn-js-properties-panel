'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper');

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;


module.exports = function(group, element, bpmnFactory, translate) {

  var getValue = function(businessObject) {
    return function(element) {
      var documentations = businessObject && businessObject.get('documentation'),
          text = (documentations && documentations.length > 0) ? documentations[0].text : '';

      return { documentation: text };
    };
  };

  var setValue = function(businessObject) {
    return function(element, values) {
      var newObjectList = [];

      if (typeof values.documentation !== 'undefined' && values.documentation !== '') {
        newObjectList.push(bpmnFactory.create('bpmn:Documentation', {
          text: values.documentation
        }));
      }

      return cmdHelper.setList(element, businessObject, 'documentation', newObjectList);
    };
  };

  // Element Documentation
  var elementDocuEntry = entryFactory.textBox({
    id: 'documentation',
    label: translate('Element Documentation'),
    modelProperty: 'documentation'
  });

  elementDocuEntry.set = setValue(getBusinessObject(element));

  elementDocuEntry.get = getValue(getBusinessObject(element));

  group.entries.push(elementDocuEntry);


  var processRef;

  // Process Documentation when having a Collaboration Diagram
  if (is(element, 'bpmn:Participant')) {

    processRef = getBusinessObject(element).processRef;

    // do not show for collapsed Pools/Participants
    if (processRef) {
      var processDocuEntry = entryFactory.textBox({
        id: 'process-documentation',
        label: translate('Process Documentation'),
        modelProperty: 'documentation'
      });

      processDocuEntry.set = setValue(processRef);

      processDocuEntry.get = getValue(processRef);

      group.entries.push(processDocuEntry);
    }
  }

};
