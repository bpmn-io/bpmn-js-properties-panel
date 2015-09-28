'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  entryFactory = require('../../../factory/EntryFactory');


module.exports = function(group, element) {
  if (is(element, 'camunda:Calling')) {
    // called element
    group.entries.push(entryFactory.textField({
      id: 'calledElement',
      description: '',
      label: 'Called Element',
      modelProperty: 'calledElement'
    }));

    // called element binding
    group.entries.push(entryFactory.selectBox({
      id: 'calledElementBinding',
      description: '',
      label: 'Called Element Binding',
      modelProperty: 'calledElementBinding',
      selectOptions: [
        { name: 'latest', value: 'latest' },
        { name: 'deployment', value: 'deployment' },
        { name: 'version', value: 'version' }
      ],
      set: function(element, values) {
        var res = {};
        res.calledElementBinding = values.calledElementBinding;

        if(res.calledElementBinding !== 'version') {
          res.calledElementVersion = undefined;
        }

        return res;
      }
    }));

    group.entries.push(entryFactory.textField({
        id: 'calledElementVersion',
        description: '',
        label: 'Called Element Version',
        modelProperty: 'calledElementVersion',
        disabled: function(element, node) {
          var elementBinding = domQuery('select > option:checked', node.parentElement);

          if(elementBinding === null) {
            elementBinding = domQuery('select > option[selected=selected]', node.parentElement);
          }

          return elementBinding.value !== 'version';
      }      
    }));
  }
};