'use strict';

var domQuery = require('min-dom/lib/query');
var domify = require('min-dom/lib/domify');

module.exports = function(identifier) {
  var lastIdx = 0;

  function createEntryTemplate(id) {
  return '<div class="djs-entry-area" data-scope>' +
            '<button data-action="' + identifier + '.removeEntry"><span>X</span></button>' +

            '<div class="pp-row">' +
              '<label for="camunda-entry-key-'+id+'">Key</label>' +
                '<div class="field-wrapper">' +
                  '<input id="camunda-entry-key-'+id+'" type="text" name="entryKey" />' +
                  '<button data-action="' + identifier +
                    '.clearEntryKey" data-show="' + identifier + '.canClearEntryKey">' +
                      '<span>X</span>' +
                  '</button>' +
                '</div>' +
            '</div>' +

            '<div class="pp-row">' +
                '<label for="camunda-entry-val-'+id+'">Value</label>' +
                '<div class="field-wrapper">' +
                  '<input id="camunda-entry-val-'+id+'" type="text" name="entryValue" />' +
                  '<button data-action="' + identifier +
                    '.clearEntryValue" data-show="' + identifier + '.canClearEntryValue">' +
                      '<span>X</span>' +
                  '</button>' +
                '</div>' +
            '</div>' +

          '</div>';
  }
  
  return {
    template:
      '<div data-scope>' +
        '<div class="cam-add-entry">' +
          '<label for="addEntry">Add Entry </label>' +
          '<button id="addEntry" data-action="' + identifier + '.addEntry"><span>+</span></button>' +
        '</div>' +
        '<div data-list-table-rows-sub-container></div>' +    
      '</div>',
    
    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createEntryTemplate(idx);
    },

    get: function (element, bo) {
      var values = {};      
      values.entryKey = bo.get('key');
      values.entryValue = bo.get('value'); 
      return values;
    },

    set: function(element, values, containerElement) {
      return {
        "key": values.entryKey,
        "value": values.entryValue
      };
    },

    validate: function(element, values) {
      var validationResult = {};
      if (!values.entryKey) {
        validationResult.entryKey = "Must provide a value";
      }      
      if (!values.entryValue) {
        validationResult.entryValue = "Must provide a value";
      }      
      return validationResult;
    },

    clearEntryKey: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=entryKey]', scopeNode).value='';

      return true;
    },

    canClearEntryKey: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=entryKey]', scopeNode);

      return input.value !== '';
    },

    clearEntryValue: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=entryValue]', scopeNode).value='';

      return true;
    },

    canClearEntryValue: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=entryValue]', scopeNode);

      return input.value !== '';
    },
    
    addEntry: function(element, inputNode, event, scopeNode) {
      var entryContainer = domQuery('[data-list-table-rows-sub-container]', scopeNode);
      lastIdx++;
      var template = domify(createEntryTemplate(lastIdx));
      entryContainer.appendChild(template);
      return true;
    },

    removeEntry: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    }

  };

};
