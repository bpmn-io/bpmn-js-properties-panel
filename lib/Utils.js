'use strict';

var domQuery = require('min-dom/lib/query');

var Utils = {};
module.exports = Utils;

Utils.selectedOption = function(selectBox) {
  if(selectBox.selectedIndex >= 0) {
    return selectBox.options[selectBox.selectedIndex].value;
  }
};

Utils.selectedType = function(inputNode) {
  var typeSelect = domQuery('select[name=implType]', inputNode);
  return this.selectedOption(typeSelect);
};