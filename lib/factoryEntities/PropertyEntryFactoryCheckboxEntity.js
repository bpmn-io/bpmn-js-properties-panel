'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


var checkbox = function(options, defaultParameters) {
  var resource = defaultParameters,
    label = options.label || resource.id;


  resource.html =
    '<label for="camunda-' + resource.id + '">' + label + '</label>' +
    '<input id="camunda-' + resource.id + '" type="checkbox" name="' + options.modelProperty + '" />';

  resource.get = function(element) {
    var bo = getBusinessObject(element),
      res = {};

    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };
  resource.set = function(element, values) {
    var res = {};

    res[options.modelProperty] = !!values[options.modelProperty];

    return res
  };

  if(typeof options.set === 'function') {
    resource.set = options.set;
  }

  if(typeof options.get === 'function') {
    resource.get = options.get;
  }

  return resource;
};

module.exports = checkbox;