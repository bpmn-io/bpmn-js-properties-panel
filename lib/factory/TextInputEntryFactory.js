'use strict';

var domQuery = require('min-dom/lib/query');

var textField = function(options, defaultParameters) {

  // Default action for the button next to the input-field
  var defaultButtonAction = function (element, inputNode) {
    var input = domQuery('input[name='+options.modelProperty+']', inputNode);
    input.value = '';

    return true;
  };

  // default method to determine if the button should be visible
  var defaultButtonShow = function (element, inputNode) {
    var input = domQuery('input[name='+options.modelProperty+']', inputNode);

    return input.value !== '';
  };

  var resource = defaultParameters,
    label = options.label || resource.id,
    dataValueLabel = options.dataValueLabel,
    buttonLabel = ( options.buttonLabel || 'X' ),
    actionName = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.name : 'clear',
    actionMethod = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.method : defaultButtonAction,
    showName = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.name : 'canClear',
    showMethod = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.method : defaultButtonShow,
    canBeDisabled = !!options.disabled && typeof options.disabled === 'function';

  resource.html =
    '<label for="camunda-' + resource.id + '" ' +
      (canBeDisabled ? 'data-show="isDisabled" ' : '') +
      (dataValueLabel ? 'data-value="' + dataValueLabel + '"' : '') + '>'+ label +'</label>' +
    '<div class="pp-field-wrapper" ' +
      (canBeDisabled ? 'data-show="isDisabled"' : '') +
      '>' +
      '<input id="camunda-' + resource.id + '" type="text" name="' + options.modelProperty+'" ' +
        ' />' +
      '<button class="' + actionName + '" data-action="' + actionName + '" data-show="' + showName + '" ' +
        (canBeDisabled ? 'data-disabled="isDisabled"' : '') + '>' +
        '<span>' + buttonLabel + '</span>' +
      '</button>' +
    '</div>';

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  if(canBeDisabled) {
    resource.isDisabled = function() {
      return !options.disabled.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['pp-textfield'];

  return resource;
};

module.exports = textField;
