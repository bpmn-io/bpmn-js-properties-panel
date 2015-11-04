'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


module.exports = function(group, element) {

  // Id
  group.entries.push(entryFactory.textField({
    id: 'id',
    description: '',
    label: 'Id',
    modelProperty: 'id',
    validate: function(element, values) {
      var idValue = values.id;

      var validationResult = {};

      var bo = getBusinessObject(element);
      var assigned = bo.$model.ids.assigned(idValue);

      var idExists = !!assigned && assigned !== bo;
      if (!idValue || idExists) {
        validationResult.id = "Element must have an unique id.";
      }

      return validationResult;

    }
  }));
};