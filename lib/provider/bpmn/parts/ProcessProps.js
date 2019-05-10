'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
    participantHelper = require('../../../helper/ParticipantHelper'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    nameEntryFactory = require('./implementation/Name'),
    utils = require('../../../Utils');

module.exports = function(group, element, translate, options) {
  var businessObject = getBusinessObject(element);

  var processIdDescription = options && options.processIdDescription;

  if (is(element, 'bpmn:Process') || (is(element, 'bpmn:Participant') && businessObject.get('processRef'))) {

    /**
     * processId
     */
    if (is(element, 'bpmn:Participant')) {
      var idEntry = entryFactory.validationAwareTextField({
        id: 'process-id',
        label: translate('Process Id'),
        description: processIdDescription && translate(processIdDescription),
        modelProperty: 'processId'
      });

      // in participants we have to change the default behavior of set and get
      idEntry.get = function(element) {
        var properties = participantHelper.getProcessBusinessObject(element, 'id');
        return { processId: properties.id };
      };

      idEntry.set = function(element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'id', { id: values.processId });
      };

      idEntry.validate = function(element, values) {
        var idValue = values.processId;

        var bo = getBusinessObject(element);

        var processIdError = utils.isIdValid(bo.processRef, idValue, translate);

        return processIdError ? { processId: processIdError } : {};
      };

      group.entries.push(idEntry);


      /**
       * process name
       */
      var processNameEntry = nameEntryFactory(element, {
        id: 'process-name',
        label: translate('Process Name')
      })[0];

      // in participants we have to change the default behavior of set and get
      processNameEntry.get = function(element) {
        return participantHelper.getProcessBusinessObject(element, 'name');
      };

      processNameEntry.set = function(element, values) {
        return participantHelper.modifyProcessBusinessObject(element, 'name', values);
      };

      group.entries.push(processNameEntry);
    }
  }
};
