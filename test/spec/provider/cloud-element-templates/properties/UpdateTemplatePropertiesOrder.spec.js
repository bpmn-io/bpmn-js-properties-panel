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


describe('provider/cloud-element-templates - UpdateTemplatePropertiesOrder', function() {

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

    const elementTemplates = require('./UpdateTemplatePropertiesOrder.json');
    const diagramXML = require('./UpdateTemplatePropertiesOrder.bpmn').default;

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


    describe('zeebe:input', function() {

      it('property set', inject(function(elementRegistry, bpmnjs) {

        // given
        const task = el('TASK');

        // when
        update(task, 'Input 1', 'foobar');

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 3'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      }));


      it('property not set - optional', inject(function(elementRegistry, bpmnjs) {

        // given
        const task = el('TASK');

        // when
        update(task, 'Input 2', 'foobar');

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 2')),
          findInputParameter(ioMapping, binding(task, 'Input 3'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      }));


      it('property not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        const expectedInputs = [
          findInputParameter(ioMapping, binding(task, 'Input 1')),
          findInputParameter(ioMapping, binding(task, 'Input 2')),
          findInputParameter(ioMapping, binding(task, 'Input 3'))
        ];

        expectOrder(ioMapping.inputParameters, expectedInputs);
      }));

    });


    describe('zeebe:output', function() {

      it('porperty set', inject(function(elementRegistry, bpmnjs) {

        // given
        const task = el('TASK');

        // when
        update(task, 'Output 1', 'foobar');

        // then
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 3'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      }));


      it('porperty not set - optional', inject(function(elementRegistry, bpmnjs) {

        // given
        const task = el('TASK');

        // when
        update(task, 'Output 2', 'foobar');

        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        // then
        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 2')),
          findOutputParameter(ioMapping, binding(task, 'Output 3'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      }));


      it('porperty not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });
        const ioMapping = findExtension(task, 'zeebe:IoMapping');

        // then
        const expectedOutputs = [
          findOutputParameter(ioMapping, binding(task, 'Output 1')),
          findOutputParameter(ioMapping, binding(task, 'Output 2')),
          findOutputParameter(ioMapping, binding(task, 'Output 3'))
        ];

        expectOrder(ioMapping.outputParameters, expectedOutputs);
      }));

    });


    describe('zeebe:property', function() {

      it('property set', inject(function(elementRegistry, bpmnjs) {

        // given
        const task = el('TASK');

        // when
        update(task, 'Property 1', 'foobar');

        // then
        const zeebeProperties = findExtension(task, 'zeebe:Properties');

        const expectedProperties = [
          findZeebeProperty(zeebeProperties, binding(task, 'Property 1')),
          findZeebeProperty(zeebeProperties, binding(task, 'Property 3'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      }));


      it('property not set - optional', inject(function(elementRegistry, bpmnjs) {

        // given
        const task = el('TASK');

        // when
        update(task, 'Property 2', 'foobar');

        // then
        const zeebeProperties = findExtension(task, 'zeebe:Properties');

        const expectedProperties = [
          findZeebeProperty(zeebeProperties, binding(task, 'Property 1')),
          findZeebeProperty(zeebeProperties, binding(task, 'Property 2')),
          findZeebeProperty(zeebeProperties, binding(task, 'Property 3'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      }));


      it('property not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });

        // then
        const zeebeProperties = findExtension(task, 'zeebe:Properties');

        const expectedProperties = [
          findZeebeProperty(zeebeProperties, binding(task, 'Property 1')),
          findZeebeProperty(zeebeProperties, binding(task, 'Property 2')),
          findZeebeProperty(zeebeProperties, binding(task, 'Property 3'))
        ];

        expectOrder(zeebeProperties.properties, expectedProperties);
      }));

    });


    describe('zeebe:taskHeader', function() {

      it('property set', inject(function(elementRegistry, bpmnjs) {

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


      it('property not set - conditional', inject(function(modeling) {

        // given
        const task = el('TASK_condition');

        // when
        modeling.updateProperties(task, {
          name: 'TASK'
        });

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


  describe('should correct definition order on update', function() {

    const elementTemplates = require('./UpdateTemplatePropertiesOrder.json');
    const diagramXML = require('./UpdateTemplatePropertiesOrder.wrong-order.bpmn').default;

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


    it('zeebe:input', function() {

      // given
      const task = el('TASK');
      const ioMapping = findExtension(task, 'zeebe:IoMapping');

      // assume
      const inputs = [
        findInputParameter(ioMapping, binding(task, 'Input 3')),
        findInputParameter(ioMapping, binding(task, 'Input 1'))
      ];

      expectOrder(ioMapping.inputParameters, inputs);

      // when
      update(task, 'Input 1', 'foobar');

      // then

      const expectedInputs = [
        findInputParameter(ioMapping, binding(task, 'Input 1')),
        findInputParameter(ioMapping, binding(task, 'Input 3'))
      ];

      expectOrder(ioMapping.inputParameters, expectedInputs);
    });


    it('zeebe:output', function() {

      // given
      const task = el('TASK');
      const ioMapping = findExtension(task, 'zeebe:IoMapping');

      // assume
      const outputs = [
        findOutputParameter(ioMapping, binding(task, 'Output 3')),
        findOutputParameter(ioMapping, binding(task, 'Output 1'))
      ];

      expectOrder(ioMapping.outputParameters, outputs);

      // when
      update(task, 'Output 1', 'foobar');

      // then
      const expectedOutputs = [
        findOutputParameter(ioMapping, binding(task, 'Output 1')),
        findOutputParameter(ioMapping, binding(task, 'Output 3'))
      ];

      expectOrder(ioMapping.outputParameters, expectedOutputs);
    });


    it('zeebe:property', function() {

      // given
      const task = el('TASK');

      const zeebeProperties = findExtension(task, 'zeebe:Properties');

      // assume
      const properties = [
        findZeebeProperty(zeebeProperties, binding(task, 'Property 3')),
        findZeebeProperty(zeebeProperties, binding(task, 'Property 1'))
      ];

      expectOrder(zeebeProperties.properties, properties);

      // when
      update(task, 'Property 1', 'foobar');

      // then
      const expectedProperties = [
        findZeebeProperty(zeebeProperties, binding(task, 'Property 1')),
        findZeebeProperty(zeebeProperties, binding(task, 'Property 3'))
      ];

      expectOrder(zeebeProperties.properties, expectedProperties);
    });


    it('zeebe:taskHeader', function() {

      // given
      const task = el('TASK');

      const taskHeaders = findExtension(task, 'zeebe:TaskHeaders');

      // assume
      const headers = [
        findTaskHeader(taskHeaders, binding(task, 'Task Header 2')),
        findTaskHeader(taskHeaders, binding(task, 'Task Header 1'))
      ];

      expectOrder(taskHeaders.values, headers);

      // when
      update(task, 'Task Header 1', 'foobar');

      // then
      const expectedHeaders = [
        findTaskHeader(taskHeaders, binding(task, 'Task Header 1')),
        findTaskHeader(taskHeaders, binding(task, 'Task Header 2'))
      ];

      expectOrder(taskHeaders.values, expectedHeaders);
    });

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
    expect(arrayLike[i]).to.eql(expectedValues[i]);
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