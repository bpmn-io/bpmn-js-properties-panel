'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

module.exports = function(group, element) {

  var bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if( is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
    var semanticVersionEntry = entryFactory.textField({
      id: 'semanticVersion',
      description: 'Semantic Version of the process',
      label: 'Semantic Version',
      modelProperty: 'semanticVersion'
    });

    // in participants we have to change the default behavior of set and get
    if(is(element, 'bpmn:Participant')) {
      semanticVersionEntry.get = function (element) {
        var processBo = bo.get('processRef');
        return {
          semanticVersion: processBo.get('camunda:semanticVersion')
        };
      };

      semanticVersionEntry.set = function (element, values) {
        var processBo = bo.get('processRef');
        return cmdHelper.updateBusinessObject(element, processBo, {
          'camunda:semanticVersion': values.semanticVersion || undefined
        });
      };
    }

    group.entries.push(semanticVersionEntry);

  }
};