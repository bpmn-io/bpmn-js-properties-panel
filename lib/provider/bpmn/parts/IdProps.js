'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,

    utils = require('../../../Utils');


module.exports = function(group, element) {

  // Id
  group.entries.push(entryFactory.textField({
    id: 'id',
    description: '',
    label: 'Id',
    modelProperty: 'id',
    get: function(element) {
      var id = this.__lastInvalidId;

      delete this.__lastInvalidId;

      return {
        id: id !== undefined ? id : element.id
      };
    },
    set: function(element, values) {

      var validationErrors = this.validate(element, values),
          id = values.id;

      // make sure we do not update the id
      if (validationErrors.id) {
        this.__lastInvalidId = id;
        return {};
      } else {
        return { id: id };
      }
    },
    validate: function(element, values) {
      var idValue = values.id || this.__lastInvalidId;

      var bo = getBusinessObject(element);

      var idError = utils.isIdValid(bo, idValue);

      return idError ? { id: idError } : {};
    }
  }));

};
