'use strict';

var domQuery = require('min-dom/lib/query');

var Utils = {};
module.exports = Utils;

Utils.selectedOption = function(selectBox) {
  if(selectBox.selectedIndex >= 0) {
    return selectBox.options[selectBox.selectedIndex].value;
  }
};

Utils.selectedType = function(elementSyntax, inputNode) {
  var typeSelect = domQuery(elementSyntax, inputNode);
  return this.selectedOption(typeSelect);
};