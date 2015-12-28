'use strict';

var domQuery = require('min-dom/lib/query');
var domify = require('min-dom/lib/domify');

module.exports = function(identifier) {
  var lastIdx = 0;

  function createEntryTemplate(id) {
    return '<div class="djs-item-area" data-scope>' +
                '<button data-action="' + identifier + '.removeItem"><span>X</span></button>' +

                '<div class="pp-row">' +
                  '<label for="camunda-list-val-'+id+'">Value</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="camunda-list-val-'+id+'" type="text" name="itemValue" />' +
                    '<button data-action="' + identifier + '.clearItemValue" data-show="' +
                      identifier + '.canClearItemValue">' +
                        '<span>X</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +

           '</div>';
  }
  
  return {
    template:
      '<div data-scope>' +
        '<div class="cam-add-item">' +
          '<label for="addItem">Add List Item </label>' +
          '<button id="addItem" data-action="' + identifier + '.addItem"><span>+</span></button>' +
        '</div>' +
        '<div data-list-table-rows-sub-container></div>' +
      '</div>',
    
    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createEntryTemplate(idx);
    },

    get: function (element, bo) {
      var values = {};
      
      values.itemValue = bo.get('value'); 
      return values;
    },

    set: function(element, values, containerElement) {
      return {
        "value": values.itemValue
      };
    },

    validate: function(element, values) {
      var validationResult = {};
      
      if (!values.itemValue) {
        validationResult.itemValue = "Must provide a value";
      }
      
      return validationResult;
    },

    clearItemValue: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=itemValue]', scopeNode).value='';

      return true;
    },

    canClearItemValue: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=itemValue]', scopeNode);

      return input.value !== '';
    },
    
    addItem: function(element, inputNode, event, scopeNode) {
      var itemContainer = domQuery('[data-list-table-rows-sub-container]', scopeNode);
      lastIdx++;
      var template = domify(createEntryTemplate(lastIdx));
      itemContainer.appendChild(template);
      return true;
    },

    removeItem: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    }

  };

};
