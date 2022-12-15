import TestContainer from 'mocha-test-container-support';

import {
  findExtension
} from 'src/provider/cloud-element-templates/Helper';

import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import elementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import zeebeElementTemplatesModule from 'src/provider/cloud-element-templates';
import zeebePropertiesProviderModule from 'src/provider/zeebe';

import bpmnPropertiesProviderModule from 'src/provider/bpmn';
import propertiesCommandsModule from 'src/cmd';
import propertiesRenderModule from 'src/render';

import zeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  setPropertyValue
} from 'src/provider/cloud-element-templates/util/propertyUtil';

import {
  findInputParameter,
  findOutputParameter,
  findTaskHeader,
  findZeebeProperty
} from 'src/provider/cloud-element-templates/Helper';


describe('provider/cloud-element-templates - property access', function() {

  let container, propertiesContainer, modelerContainer;

  beforeEach(function() {
    container = TestContainer.get(this);

    modelerContainer = document.createElement('div');
    modelerContainer.classList.add('modeler-container');

    propertiesContainer = document.createElement('div');
    propertiesContainer.classList.add('properties-container');

    container.appendChild(modelerContainer);
    container.appendChild(propertiesContainer);
  });


  describe('should preserve definition order on update', function() {

    const elementTemplates = require('./UpdateProperties.order.json');
    const diagramXML = require('./UpdateProperties.order.bpmn').default;

    beforeEach(() => bootstrapModeler(diagramXML, {
      container: modelerContainer,
      additionalModules: [
        bpmnPropertiesProviderModule,
        zeebePropertiesProviderModule,
        zeebeBehaviorsModule,
        zeebeElementTemplatesModule,
        propertiesRenderModule,
        propertiesCommandsModule,
        elementTemplateChooserModule
      ],
      moddleExtensions: {
        zeebe: zeebeModdlePackage
      },
      propertiesPanel: {
        parent: propertiesContainer
      },
      elementTemplates
    })());


    it('zeebe:input', inject(function(elementRegistry, bpmnjs) {

      // given
      const task = el('TASK');

      // when
      update(task, 'Input 1', 'foobar');

      // then
      const ioMapping = findExtension(task, 'zeebe:IoMapping');

      const expectedInputs = [
        findInputParameter(ioMapping, binding(task, 'Input 1')),
        findInputParameter(ioMapping, binding(task, 'Input 2'))
      ];

      expectOrder(ioMapping.inputParameters, expectedInputs);
    }));


    it('zeebe:output', inject(function(elementRegistry, bpmnjs) {

      // given
      const task = el('TASK');

      // when
      update(task, 'Output 1', 'foobar');

      // then
      const ioMapping = findExtension(task, 'zeebe:IoMapping');

      const expectedOutputs = [
        findOutputParameter(ioMapping, binding(task, 'Output 1')),
        findOutputParameter(ioMapping, binding(task, 'Output 2'))
      ];

      expectOrder(ioMapping.outputParameters, expectedOutputs);
    }));


    it('zeebe:property', inject(function(elementRegistry, bpmnjs) {

      // given
      const task = el('TASK');

      // when
      update(task, 'Property 1', 'foobar');

      // then
      const zeebeProperties = findExtension(task, 'zeebe:Properties');

      const expectedProperties = [
        findZeebeProperty(zeebeProperties, binding(task, 'Property 1')),
        findZeebeProperty(zeebeProperties, binding(task, 'Property 2'))
      ];

      expectOrder(zeebeProperties.properties, expectedProperties);
    }));


    it('zeebe:taskHeader', inject(function(elementRegistry, bpmnjs) {

      // given
      const task = el('TASK');

      // when
      update(task, 'Task Header 1', 'foobar');

      // then
      const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

      const expectedHeaders = [
        findTaskHeader(taskHeaders, binding(task, 'Task Header 1')),
        findTaskHeader(taskHeaders, binding(task, 'Task Header 2'))
      ];

      expectOrder(taskHeaders.values, expectedHeaders);
    }));

  });

});


// helpers /////////////

function el(id) {
  return getBpmnJS().invoke((elementRegistry) => {

    const element = elementRegistry.get(id);

    expect(element, `element <#${id}> exists`).to.exist;

    return element;
  });
}

function update(element, propertyLabel, value) {

  const property = prop(element, propertyLabel);

  return getBpmnJS().invoke((commandStack, bpmnFactory) => {
    return setPropertyValue(bpmnFactory, commandStack, element, property, value);
  });
}

function expectOrder(arrayLike, expectedValues) {

  for (let i = 0; i < expectedValues.length - 1; i++) {

    const a = expectedValues[0];
    const b = expectedValues[1];

    expect(arrayLike).to.include.ordered.members([ a, b ]);
  }

}

/**
 * @param {djs.model.Base} element
 * @param {string} label
 *
 * @return {object} property
 */
function prop(element, label) {

  return getBpmnJS().invoke((elementTemplates) => {

    const template = elementTemplates.get(element);

    expect(template, `element <#${element.id}> has template`).to.exist;

    const property = template.properties.find(property => {
      return property.label === label;
    });

    expect(property, `template <#${template.id}> to have property labeled <${ label }>`).to.exist;

    return property;
  });
}

function binding(element, label) {
  return prop(element, label).binding;
}