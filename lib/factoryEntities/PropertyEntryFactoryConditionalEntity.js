'use strict';

var isConditional = function(element, options, condition) {
  var defaultConditionName = 'condition-' + element.id;

  if(!element) {
    throw new Error('Element must be set.');
  }

  if(typeof options === 'function') {
    condition = options;
    options = { name: defaultConditionName };
  }

  if(typeof options !== 'object') {
    throw new Error('options must be an object')
  }

  if(!condition || typeof condition !== 'function') {
    throw new Error('A condition of type function must be set.');
  }

  var showName = (options.conditionName) ? options.conditionName : defaultConditionName;

  var wrapperBegin = '<div id="condition-' + element.id + '" data-show="' + showName + '">',
      wrapperEnd = '</div>';

  element.html = wrapperBegin + element.html + wrapperEnd;
  element[showName] = condition;

  return element;

};

module.exports = isConditional;