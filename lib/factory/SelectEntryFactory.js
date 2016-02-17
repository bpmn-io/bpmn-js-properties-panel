'use strict';

var forEach = require('lodash/collection/forEach');

var isList = function(list) {
  return !(!list || Object.prototype.toString.call(list) !== '[object Array]');
};

var addEmptyParameter = function(list) {
  return list.concat([ { name: '', value: '' } ]);
};

/**
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {string} [options.label]
 * @param  {Array<Object>} options.selectOptions
 * @param  {string} options.modelProperty
 * @param  {boolean} options.emptyParameter
 * @param  {function} options.disabled
 * @param  {Object} defaultParameters
 *
 * @return {Object}
 */
var selectbox = function(options, defaultParameters) {
  var resource = defaultParameters,
      label = options.label || resource.id,
      selectOptions = options.selectOptions,
      modelProperty = options.modelProperty,
      emptyParameter = options.emptyParameter,
      canBeDisabled = !!options.disabled && typeof options.disabled === 'function';

  if (isList(selectOptions)) {
    if (emptyParameter) {
      selectOptions = addEmptyParameter(selectOptions);
    }
  } else {
    selectOptions = [ { name: '', value: '' } ];
  }

  resource.html =
    '<label for="camunda-' + resource.id + '"' +
    (canBeDisabled ? 'data-show="isDisabled" ' : '') + '>' + label + '</label>' +
    '<select id="camunda-' + resource.id + '-select" name="' + modelProperty + '"' +
    (canBeDisabled ? 'data-show="isDisabled" ' : '') + ' data-value>';

  forEach(selectOptions, function(option){
    resource.html += '<option value="' + option.value + '">' + (option.name || '') + '</option>';
  });

  resource.html += '</select>';

  if(canBeDisabled) {
    resource.isDisabled = function() {
      return !options.disabled.apply(resource, arguments);
    };
  }

  resource.cssClasses = ['dropdown'];

  return resource;
};

module.exports = selectbox;
