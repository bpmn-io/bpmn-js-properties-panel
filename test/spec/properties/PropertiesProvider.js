'use strict';

var inherits = require('inherits');

var PropertiesActivator = require('../../../lib/PropertiesActivator');

var is = require('bpmn-js/lib/util/ModelUtil').is,
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


function createGroups(element, bpmnFactory) {
  if (is(element, 'bpmn:Event')) {
    return [
      {
        id: 'bar',
        entries: [
          {
            id: 'text-only',
            description: 'some auxilary text',
            html: 'this is just text, nothing special here!!!'
          },
          {
            id: 'documentation',
            description: 'element documentation',
            html: '<textarea name="documentation" cols="10" rows="10"></textarea>' +
                  '<span data-invalid></span>',
            get: function(element, propertyName) {

              var bo = getBusinessObject(element);

              var docs = bo.documentation && bo.documentation[0];

              return {
                documentation: docs && docs.text
              };
            },
            set: function(element, values) {

              var bo = getBusinessObject(element);

              var docs = bpmnFactory.create('bpmn:Documentation', { text: values.documentation });

              var newDocumentation = (bo.documentation || []).slice();

              if (newDocumentation.length) {
                newDocumentation[0] = docs;
              } else {
                newDocumentation = [ docs ];
              }

              return {
                documentation: newDocumentation
              };
            },
            validate: function(element, values) {

              return {
                documentation: !values.documentation && new Error('documentation must not be empty')
              };
            }
          },
          {
            id: 'radio',
            description: 'some radio buttons? awesome!',
            html: '<label><input type="radio" name="foo" value="FOO">FOO</label>' +
                  '<label><input type="radio" name="foo" value="BAR">BAR</label>' +
                  '<br/><span data-invalid></span>',
            get: function(element) {

              var bo = getBusinessObject(element);

              return {
                foo: bo.get('custom:foo')
              };
            },
            set: function(element, values) {
              return {
                'custom:foo': values.foo
              };
            },
            validate: function(element, values) {
              return {
                foo: values.foo === 'FOO' && new Error('must not be FOO')
              };
            }
          }
        ]
      }
    ];

  } else {
    return [
      {
        id: 'bar',
        entries: [
          {
            id: 'external-edit',
            description: 'think about opening a dialog to perform a complex edit...',
            html: '<span data-value="text"></span> <button data-action="edit">edit somewhere</button>',
            edit: function(event, element) {
              alert('edit me!');
            },
            get: function(element) {
              return {
                text: '!11111'
              };
            }
          }
        ]
      },
      {
        id: 'foo',
        entries: [
          {
            id: 'id',
            description: 'some auxilary text',
            html: 'element id <input type="text" name="id" /> <span data-invalid></span>',
            get: function(element) {
              return {
                id: element.id
              };
            },
            set: function(element, values) {
              return {
                id: values.id
              };
            },
            validate: function(element, values) {

              return {
                id: !values.id && new Error('id must not be empty')
              };
            }
          },
          {
            id: 'multiple',
            html: '<div>' +
                    '<label><input type="checkbox" name="a" /> A</label> or ' +
                    '<label><input type="checkbox" name="b" /> B</label>' +
                    '<span data-invalid="a"></span>' +
                    '<span data-invalid="b"></span>' +
                  '</div>',
            /**
             * Get display properties from the given element
             *
             * @param  {ModdleElement} element
             * @return {Object} display properties
             */
            get: function(element) {

              var bo = getBusinessObject(element);

              var someText = (bo.get('custom:enum') || 'A').split(',');

              return {
                a: someText.indexOf('A') !== -1,
                b: someText.indexOf('B') !== -1
              };
            },
            /**
             * Create changes based on the given properties update
             *
             * @param {ModdleElement} element
             * @param {Object} values
             */
            set: function(element, values) {

              var results = [];

              if (values.a) {
                results.push('A');
              }

              if (values.b) {
                results.push('B');
              }

              return {
                'custom:enum': results.join(',')
              };
            },
            /**
             * Validate the properties of the given element.
             *
             * @param  {ModdleElement} element
             * @param  {Object} values
             *
             * @throws {Error} if invalid input is encountered
             */
            validate: function(element, values) {
              return {
                a: !values.a && new Error('a must be checked')
              };
            }
          }
        ]
      }
    ];
  }
}

function PropertiesProvider(eventBus, bpmnFactory) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    if (is(element, 'bpmn:Event')) {

      return [
        {
          id: 'tab1',
          label: 'Tab 1',
          groups: createGroups(element, bpmnFactory)
        },
        {
          id: 'tab2',
          label: 'Tab 2',
          groups: createGroups(element, bpmnFactory)
        },
        {
          id: 'tab3',
          label: 'Tab 3'
        }
      ];

    } else {

      return [
        {
          id: 'tab1',
          label: 'Tab 1',
          groups: createGroups(element, bpmnFactory)
        },
        {
          id: 'tab2',
          label: 'Tab 2',
          groups: createGroups(element, bpmnFactory)
        },
        {
          id: 'tab3',
          label: 'Tab 3',
          groups: createGroups(element, bpmnFactory)
        }
      ];

    }

  };
}

inherits(PropertiesProvider, PropertiesActivator);

module.exports = PropertiesProvider;
