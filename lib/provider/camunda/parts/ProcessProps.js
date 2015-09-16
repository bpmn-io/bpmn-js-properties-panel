'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query'),
  elementHelper = require('../../../helper/ElementHelper'),
  cmdHelper = require('../../../helper/CmdHelper');


function modifyBusinessObject(element, property, values) {
  var businessObject = getBusinessObject(element).get('processRef');
  var newProperties = {};
  newProperties[property] = values[property];
  return cmdHelper.updateBusinessObject(element, businessObject, newProperties);
}

function getModifiedBusinessObject(element, property) {
  var bo = getBusinessObject(element).get('processRef'),
      res = {};

  res[property] = bo.get(property);

  return res;
}

module.exports = function(group, element) {
  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
    // name
    var label = (is(element, 'bpmn:Participant')) ? 'Process Name' : 'Name';

    var nameEntry = entryFactory.textField({
      id: 'name',
      description: '',
      label: label,
      modelProperty: 'name'
    });

    // in participants we have to change the default behavior of set and get
    if(is(element, 'bpmn:Participant')) {
      nameEntry.get = function (element) {
        return getModifiedBusinessObject(element, 'name');
      };

      nameEntry.set = function (element, values) {
        return modifyBusinessObject(element, 'name', values);
      };
    }

    group.entries.push(nameEntry);


    // isExecutable
    var executableEntry = entryFactory.checkbox({
      id: 'isExecutable',
      description: 'Defines if a process is executable by a process engine',
      label: 'Executable',
      modelProperty: 'isExecutable'
    });

    // in participants we have to change the default behavior of set and get
    if(is(element, 'bpmn:Participant')) {
      executableEntry.get = function (element) {
        return getModifiedBusinessObject(element, 'isExecutable');
      };

      executableEntry.set = function (element, values) {
        return modifyBusinessObject(element, 'isExecutable', values);
      };
    }

    group.entries.push(executableEntry);
  }
};