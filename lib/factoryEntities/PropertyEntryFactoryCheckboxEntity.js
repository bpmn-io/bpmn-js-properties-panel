'use strict';

var checkbox = function(options, defaultParameters) {
  var resource = defaultParameters,
    label = options.label || resource.id;


  resource.html =
    '<label for="camunda-' + resource.id + '">' + label + '</label>' +
    '<input id="camunda-' + resource.id + '" type="checkbox" name="' + options.modelProperty + '" />';

  return resource;
};

module.exports = checkbox;