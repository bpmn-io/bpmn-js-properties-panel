'use strict';

var domQuery = require('min-dom/lib/query'),

  utils = require('../../../../Utils');


var delegateImplTypes = [
  'class',
  'expression',
  'delegateExpression'
];

module.exports = {

  delegateImplTypes : delegateImplTypes,

  template:
    // java class, expression, delegate expression
    '<div class="pp-row">' +
      '<label for="cam-impl-delegate" data-show="delegate.isDelegate">' +
        '<span data-show="delegate.isJavaClass">Java Class</span>' +
        '<span data-show="delegate.isExpression">Expression</span>' +
        '<span data-show="delegate.isDelegateExpression">Delegate Expression</span>' +
      '</label>' +
      '<div class="pp-field-wrapper" data-show="delegate.isDelegate">' +
        '<input id="cam-impl-delegate" type="text" name="delegate" />' +
        '<button class="clear" data-action="delegate.clear" data-show="delegate.canClear">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    //  result variable
    '<div class="pp-row">' +
      '<label for="cam-result-variable" data-show="delegate.isExpression">Result Variable</label>' +
      '<div class="pp-field-wrapper" data-show="delegate.isExpression">' +
        '<input id="cam-result-variable" type="text" name="resultVariable" />' +
        '<button class="clear" data-action="delegate.clearResVar" data-show="delegate.canClearResVar">' +
          '<span>X</span>' +
        '</button>' +
      '</div>' +
    '</div>',

    get: function(implType, implValue, values, bo) {
      values.delegate = implValue;

      var resultVariable = bo.get('camunda:resultVariable');
      if(resultVariable && implType === 'expression') {
        values.resultVariable = resultVariable;
      }
    },

    setEmpty: function(update) {
      update['camunda:class'] = undefined;
      update['camunda:expression'] = undefined;
      update['camunda:delegateExpression'] = undefined;
      update['camunda:resultVariable'] = undefined;
    },

    set: function(values, update) {
      // if delegate is undefined, set its value to an empty string
      update['camunda:'+ values.implType] = values.delegate || '';

      var resultVariableValue = values.resultVariable;
      if (!!resultVariableValue && values.implType === 'expression') {
        update['camunda:resultVariable'] = resultVariableValue;
      }
    },

    validate: function(values, validationResult) {
      if(!values.delegate) {
        validationResult.delegate = "Must provide a value";
      }
    },

    clear: function(element, inputNode) {
      // clear text input
      domQuery('input[name=delegate]', inputNode).value='';

      return true;
    },

    canClear: function(element, inputNode) {
      var input = domQuery('input[name=delegate]', inputNode);

      return input.value !== '';
    },

    isDelegate: function(element, inputNode) {
      var type = utils.selectedType('select[name=implType]', inputNode);
      return delegateImplTypes.indexOf(type) >= 0;
    },

    isExpression: function(element, inputNode) {
      var type = utils.selectedType('select[name=implType]', inputNode);
      return type === 'expression';
    },

    isJavaClass: function(element, inputNode) {
      var type = utils.selectedType('select[name=implType]', inputNode);
      return type === 'class';
    },

    isDelegateExpression: function(element, inputNode) {
      var type = utils.selectedType('select[name=implType]', inputNode);
      return type === 'delegateExpression';
    },

    clearResVar: function(element, inputNode) {
      // clear text input
      domQuery('input[name=resultVariable]', inputNode).value='';

      return true;
    },

    canClearResVar: function(element, inputNode) {
      var input = domQuery('input[name=resultVariable]', inputNode);

      return input.value !== '';
    }

};
