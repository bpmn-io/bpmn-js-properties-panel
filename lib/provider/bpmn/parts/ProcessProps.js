'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory'),
  participantHelper = require('../../../helper/ParticipantHelper');

module.exports = function(group, element) {
  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {

    /**
     * processId
     */
    if(is(element, 'bpmn:Participant')) {
      var idEntry = entryFactory.textField({
        id: 'processId',
        description: '',
        label: 'Process ID',
        modelProperty: 'processId'
      });

      // in participants we have to change the default behavior of set and get
      idEntry.get = function (element) {
        var properties = participantHelper.getProcessBusinessObject(element, 'id');
        return { processId: properties.id };
      };

      idEntry.set = function (element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'id', {id: values.processId});
      };

      group.entries.push(idEntry);
    }

    /**
     * name
     */
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
        return participantHelper.getProcessBusinessObject(element, 'name');
      };

      nameEntry.set = function (element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'name', values);
      };
    }

    group.entries.push(nameEntry);


    /**
     * isExecutable
     */
    var executableEntry = entryFactory.checkbox({
      id: 'isExecutable',
      description: 'Defines if a process is executable by a process engine',
      label: 'Executable',
      modelProperty: 'isExecutable'
    });

    // in participants we have to change the default behavior of set and get
    if(is(element, 'bpmn:Participant')) {
      executableEntry.get = function (element) {
        return participantHelper.getProcessBusinessObject(element, 'isExecutable');
      };

      executableEntry.set = function (element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'isExecutable', values);
      };
    }

    group.entries.push(executableEntry);
  }
};