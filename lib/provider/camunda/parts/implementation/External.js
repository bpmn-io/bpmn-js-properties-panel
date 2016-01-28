'use strict';

var domQuery = require('min-dom/lib/query'),
    utils = require('../../../../Utils');

module.exports = {

  template:
    '<label for="camunda-ext-topic" data-show="external.isExternal">Topic</label>' +
    '<div class="pp-field-wrapper" data-show="external.isExternal">' +
      '<input id="camunda-ext-topic" type="text" name="externalTopic" />' +
      '<button class="clear" data-action="external.clear" data-show="external.canClear">' +
        '<span>X</span>' +
      '</button>' +
    '</div>',

    get: function(implType, implValues, values, bo) {
      values.externalTopic = bo.get('camunda:topic');
    },
    setEmpty: function(update) {
      update['camunda:type'] = undefined;
      update['camunda:topic'] = undefined;
    },
    set: function(values, update) {
      update['camunda:' + values.implType] = 'external';
      update['camunda:topic'] = values.externalTopic || '';
    },
    validate: function(values, validationResult) {
      if(!values.externalTopic) {
        validationResult.externalTopic = "Must provide a value";
      }
    },
    clear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=externalTopic]', inputNode).value='';

      return true;
    },
    canClear: function(element, inputNode) {
      var input = domQuery('input[name=externalTopic]', inputNode);

      return input.value !== '';
    },
    isExternal: function(element, inputNode) {
      var type = utils.selectedType('select[name=implType]', inputNode);
      return type === 'type';
    }
};
