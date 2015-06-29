'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  propertyEntryFactory = require('../../../PropertyEntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query');


module.exports = function(group, element) {
  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {

    var entry = propertyEntryFactory.checkbox({
      id: 'isExecutable',
      description: 'Defines if a process is executable by a process engine',
      label: 'Executable',
      modelProperty: 'isExecutable'
    });

    // in participants we have to change the default behavior of set and get
    if(is(element, 'bpmn:Participant')) {
      entry.get = function (element) {
        var bo = getBusinessObject(element).get('processRef');

        return {isExecutable: bo.get('isExecutable')};
      };

      entry.set = function (element, values) {
        var bo = getBusinessObject(element).get('processRef');
        bo.set('bpmn:isExecutable', values.isExecutable);

        return {processRef: bo};
      };
    }

    // isExecutable
    group.entries.push(entry);
  }
};