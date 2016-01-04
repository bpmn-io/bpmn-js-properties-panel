'use strict';

var domQuery = require('min-dom/lib/query');
var domify = require('min-dom/lib/domify');

module.exports = function(identifier) {
  var lastIdx = 0;
  
function createEntryTemplate(id) {
  return '<div class="djs-constraint-area" data-scope>' +
            '<button data-action="' + identifier + '.removeConstraint"><span>X</span></button>' +

            '<div class="pp-row">' +
              '<label for="camunda-constraint-name-'+id+'">Name</label>' +
              '<div class="field-wrapper">' +
                '<input id="camunda-constraint-name-'+id+'" type="text" name="constraintName" />' +
                '<button data-action="' + identifier + 
                  '.clearConstraintName" data-show="' + identifier + '.canClearConstraintName">' +
                    '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="pp-row">' +
              '<label for="camunda-constraint-config-'+id+'">Config</label>' +
              '<div class="field-wrapper">' +
                '<input id="camunda-constraint-config-'+id+'" type="text" name="constraintConfig" />' +
                '<button data-action="' + identifier + 
                  '.clearConstraintConfig" data-show="' + identifier + '.canClearConstraintConfig">' +
                    '<span>X</span>' +
                '</button>' +
              '</div>' +
            '</div>' +

         '</div>';
  }

  return {
    template:
    '<div data-scope>' +
      '<div class="cam-add-constraint">' +
        '<label for="addConstraint">Add Constraint </label>' +
        '<button id="addConstraint" data-action="' + identifier + '.addConstraint"><span>+</span></button>' +
      '</div>' +
      '<div data-list-table-rows-sub-container></div>' +
    '</div>',
    
    createListEntryTemplate: function(value, idx) {
      lastIdx = idx;
      return createEntryTemplate(idx);
    },

    get: function (element, bo) {
      var values = {};
      
      values.constraintName = bo.get('name'); 
      values.constraintConfig = bo.get('config'); 
      return values;
    },

    set: function(element, values, containerElement) {
      return {
        "name": values.constraintName,
        "config": values.constraintConfig
      };
    },

    validate: function(element, values) {
      var validationResult = {};
      
      if (!values.constraintName) {
        validationResult.constraintName = "Must provide a value";
      }
      if (!values.constraintConfig) {
        validationResult.constraintConfig = "Must provide a value";
      }
      
      return validationResult;
    },

    clearConstraintName: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=constraintName]', scopeNode).value='';

      return true;
    },

    canClearConstraintName: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=constraintName]', scopeNode);

      return input.value !== '';
    },
    
    clearConstraintConfig: function(element, inputNode, btnNode, scopeNode) {
      domQuery('input[name=constraintConfig]', scopeNode).value='';

      return true;
    },

    canClearConstraintConfig: function(element, inputNode, btnNode, scopeNode) {
      var input = domQuery('input[name=constraintConfig]', scopeNode);

      return input.value !== '';
    },
    
    addConstraint: function(element, inputNode, event, scopeNode) {
      var constraintContainer = domQuery('[data-list-table-rows-sub-container]', scopeNode);
      lastIdx++;
      var template = domify(createEntryTemplate(lastIdx));
      constraintContainer.appendChild(template);
      return true;
    },

    removeConstraint: function(element, entryNode, btnNode, scopeNode) {
      scopeNode.parentElement.removeChild(scopeNode);
      return true;
    }

  };

};