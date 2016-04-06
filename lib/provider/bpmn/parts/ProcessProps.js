'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
    participantHelper = require('../../../helper/ParticipantHelper'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    nameEntryFactory = require('./implementation/Name');

module.exports = function(group, element) {
  var businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Process') || (is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {

    /**
     * processId
     */
    if(is(element, 'bpmn:Participant')) {
      var idEntry = entryFactory.textField({
        id: 'process-id',
        description: '',
        label: 'Process Id',
        modelProperty: 'processId'
      });

      // in participants we have to change the default behavior of set and get
      idEntry.get = function (element) {
        var properties = participantHelper.getProcessBusinessObject(element, 'id');
        return { processId: properties.id };
      };

      idEntry.set = function (element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'id', { id: values.processId });
      };

      group.entries.push(idEntry);


      /**
       * process name
       */
       var processNameEntry = nameEntryFactory(element, {
         id: 'process-name',
         label: 'Process Name'
       })[0];

      // in participants we have to change the default behavior of set and get
      processNameEntry.get = function (element) {
        return participantHelper.getProcessBusinessObject(element, 'name');
      };

      processNameEntry.set = function (element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'name', values);
      };

      group.entries.push(processNameEntry);
    }


    /**
     * isExecutable
     */
    var executableEntry = entryFactory.checkbox({
      id: 'process-is-executable',
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
