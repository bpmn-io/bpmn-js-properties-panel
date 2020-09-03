'use strict';

var nameEntryFactory = require('./implementation/Name'),
    createCategoryValue = require('../../../helper/CategoryHelper').createCategoryValue,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element, bpmnFactory, canvas, translate, options) {
  if (!options) {
    options = {};
  }

  function initializeCategory(semantic) {
    var rootElement = canvas.getRootElement(),
        definitions = getBusinessObject(rootElement).$parent,
        categoryValue = createCategoryValue(definitions, bpmnFactory);

    semantic.categoryValueRef = categoryValue;

  }

  function setGroupName(element, values) {
    var bo = getBusinessObject(element),
        categoryValueRef = bo.categoryValueRef;

    if (!categoryValueRef) {
      initializeCategory(bo);
    }

    // needs direct call to update categoryValue properly
    return {
      cmd: 'element.updateLabel',
      context: {
        element: element,
        newLabel: values.categoryValue
      }
    };
  }

  function getGroupName(element) {
    var bo = getBusinessObject(element),
        value = (bo.categoryValueRef || {}).value;

    return { categoryValue: value };
  }

  if (!is(element, 'bpmn:Collaboration')) {
    var nameOptions = {
      id: options.id
    };

    if (is(element, 'bpmn:TextAnnotation')) {
      nameOptions.modelProperty = 'text';
      nameOptions.label = translate('Text');
    } else if (is(element, 'bpmn:Group')) {
      nameOptions.modelProperty = 'categoryValue';
      nameOptions.label = translate('Category Value');
      nameOptions.get = getGroupName;
      nameOptions.set = setGroupName;
    }

    // name
    group.entries = group.entries.concat(nameEntryFactory(element, nameOptions, translate));
  }
};
