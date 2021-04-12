'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper');

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;

var DOCUMENTATION_TEXT_FORMAT = 'text/plain';


module.exports = function(group, element, bpmnFactory, translate) {

  var findDocumentation = function(docs) {
    return docs.find(function(d) {
      return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT;
    });
  };

  var getValue = function(businessObject) {
    return function(element) {
      var documentation = findDocumentation(
        businessObject && businessObject.get('documentation')
      );

      var text = documentation && documentation.text || '';

      return { documentation: text };
    };
  };

  var setValue = function(businessObject) {
    return function(element, values) {
      var text = values.documentation;

      var documentation = findDocumentation(
        businessObject && businessObject.get('documentation')
      );

      // update or removing existing documentation
      if (documentation) {

        if (text) {
          return cmdHelper.updateBusinessObject(element, documentation, { text: values.documentation });
        } else {
          return cmdHelper.removeElementsFromList(element, businessObject, 'documentation', null, [ documentation ]);
        }
      }

      if (text) {

        // create new documentation entry
        return cmdHelper.addElementsTolist(element, businessObject, 'documentation', [
          bpmnFactory.create('bpmn:Documentation', {
            text: values.documentation
          })
        ]);
      }

      // no text and nothing removed -> we are good
    };
  };

  // Element Documentation
  var elementDocuEntry = entryFactory.textBox(translate, {
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
      var processDocuEntry = entryFactory.textBox(translate, {
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
