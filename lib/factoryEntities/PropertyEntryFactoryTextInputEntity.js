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
    buttonLabel = ( options.buttonLabel || 'X' ),
    actionName = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.name : 'clear',
    actionMethod = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.method : defaultButtonAction,
    showName = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.name : 'canClear',
    showMethod = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.method : defaultButtonShow;



  resource.html =
    '<label for="camunda-' + resource.id + '">'+ label +'</label>' +
    '<input id="camunda-' + resource.id + '" type="text" name="' + options.modelProperty+'" />' +
    '<button data-action="' + actionName + '" data-show="' + showName + '">' + buttonLabel + '</button>';

  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  resource.cssClasses = ['textfield'];

  return resource;
};

module.exports = textField;
