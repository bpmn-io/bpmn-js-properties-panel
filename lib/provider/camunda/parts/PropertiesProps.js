'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    properties = require('./implementation/Properties'),
    elementHelper = require('../../../helper/ElementHelper'),
    cmdHelper = require('../../../helper/CmdHelper');

module.exports = function(group, element, bpmnFactory) {

  group.entries.push(properties(element, bpmnFactory, {
    id: 'properties',
    modelProperties: [ 'name', 'value' ],
    labels: [ 'Name', 'Value' ],

    getParent: function(element, node) {
      var bo = getBusinessObject(element);
      return bo.extensionElements;
    },

    createParent: function(element) {
      var bo = getBusinessObject(element);
      var parent = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory);
      var cmd = cmdHelper.updateProperties(element, { extensionElements: parent });
      return {
        cmd: cmd,
        parent: parent
      };
    }
  }));
};