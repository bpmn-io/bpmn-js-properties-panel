'use strict';

var domQuery = require('min-dom/lib/query');
var domify = require('min-dom/lib/domify');

module.exports = function(identifier) {
  var lastIdx = 0;
  
  function createEntryTemplate(id) {
    return '<div class="djs-property-area" data-scope>' +
                '<button data-action="' + identifier + '.removeProperty"><span>X</span></button>' +

                '<div class="pp-row">' +
                  '<label for="camunda-property-id-'+id+'">ID</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="camunda-property-id-'+id+'" type="text" name="propertyID" />' +
                    '<button data-action="' + identifier + 
                      '.clearPropertyID" data-show="' + identifier + '.canClearPropertyID">' +
                        '<span>X</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +

                '<div class="pp-row">' +
                  '<label for="camunda-property-name-'+id+'">Name</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="camunda-property-name-'+id+'" type="text" name="propertyName" />' +
                    '<button data-action="' + identifier +
                      '.clearPropertyName" data-show="' + identifier + '.canClearPropertyName">' +
                        '<span>X</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +

                '<div class="pp-row">' +
                  '<label for="camunda-property-value-'+id+'">Value</label>' +
                  '<div class="field-wrapper">' +
                    '<input id="camunda-property-value-'+id+'" type="text" name="propertyValue" />' +
                    '<button data-action="' + identifier +
                      '.clearPropertyValue" data-show="' + identifier + '.canClearPropertyValue">' +
                        '<span>X</span>' +
                    '</button>' +
                  '</div>' +
                '</div>' +

           '</div>';
  }
  
  return {
    template:
      '<div data-scope>' +
        '<div class="cam-add-property">' +
          '<label for="addProperty">Add Property </label>' +
          '<button id="addProperty" data-action="' + identifier + '.addProperty"><span>+</span></button>' +
        '</div>' +
        '<div data-list-table-rows-sub-container></div>' +
      '</div>',
    
    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createEntryTemplate(idx);
    },

    get: function (element, bo) {
      var values = {};
      
      values.propertyID = bo.get('id'); 
      values.propertyName = bo.get('name'); 
      values.propertyValue = bo.get('value'); 
      
      return values;
    },

    set: function(element, values, containerElement) {
      return {
        "id": values.propertyID,
        "name": values.propertyName,
        "value": values.propertyValue
      };
    },

    validate: function(element, values) {
      var validationResult = {};
      
      if (!values.propertyID) {
        validationResult.propertyID = "Must provide a value";
      }

      return validationResult;
    },

    clearPropertyID: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=propertyID]', scopeNode).value='';

      return true;
    },

    canClearPropertyID: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=propertyID]', scopeNode);

      return input.value !== '';
    },
    
    clearPropertyName: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=propertyName]', scopeNode).value='';

      return true;
    },

    canClearPropertyName: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=propertyName]', scopeNode);

      return input.value !== '';
    },
    
    clearPropertyValue: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=propertyValue]', scopeNode).value='';

      return true;
    },

    canClearPropertyValue: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=propertyValue]', scopeNode);

      return input.value !== '';
    },
    
    addProperty: function(element, inputNode, event, scopeNode) {
      var propertyContainer = domQuery('[data-list-table-rows-sub-container]', scopeNode);
      lastIdx++;
      var template = domify(createEntryTemplate(lastIdx));
      propertyContainer.appendChild(template);
      return true;
    },

    removeProperty: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    }

  };

};
