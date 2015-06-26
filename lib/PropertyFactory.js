'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  domQuery = require('min-dom/lib/query');

function PropertyFactory() {

}

PropertyFactory.textInput = function(options) {
  return {
    'id': options.id,
    'description': options.description,
    'html': '<label for="camunda-'+options.id+'">'+ (options.label || options.id) +':</label>'+
            '<input id="camunda-'+options.id+'" type="text" name="'+options.modelProperty+'" />'+
            '<button data-action="clear" data-show="canClear">X</button>',
    'get': function (element, propertyName) {

      var bo = getBusinessObject(element);
      var res = {};
      res[options.modelProperty] = bo.get(options.modelProperty);
      return res;
    },
    'set': function (element, values) {
      var res = {};
      res[options.modelProperty] = values[options.modelProperty];
      return res;
    },
    'clear': function(element, inputNode) {
      var input = domQuery('input[name='+options.modelProperty+']', inputNode);
      input.value = '';
      return true;
    },
    'canClear': function(element, inputNode) {
      var input = domQuery('input[name='+options.modelProperty+']', inputNode);
      return input.value !== '';
    },
    validate: function() {
      return {};
    }
  };
};

module.exports = PropertyFactory;
