import TestContainer from 'mocha-test-container-support';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { find } from 'min-dash';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import { findExtension, findExtensions } from 'src/provider/cloud-element-templates/Helper';

import diagramXML from '../fixtures/simple.bpmn';

import templates from './TemplatesElementFactory.json';


describe('provider/cloud-element-templates - TemplateElementFactory', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules: [
      coreModule,
      elementTemplatesModule,
      modelingModule,
      {
        propertiesPanel: [ 'value', { registerProvider() {} } ]
      }
    ],
    moddleExtensions: {
      zeebe: zeebeModdlePackage
    }
  }));


  it('should create element', inject(function(templateElementFactory) {

    // given
    const elementTemplate = findTemplate('example.camunda.ServiceWorker');

    // when
    const element = templateElementFactory.create(elementTemplate);

    const extensionElements = getBusinessObject(element).get('extensionElements');

    // then
    expect(element).to.exist;
    expect(extensionElements).to.exist;
    expect(extensionElements.get('values')).to.have.length(3);
  }));


  it('should reject invalid template', inject(function(templateElementFactory) {

    // given
    const elementTemplate = findTemplate('example.camunda.Invalid');

    // then
    expect(function() {
      templateElementFactory.create(elementTemplate);
    }).to.throw(/template is invalid/);
  }));


  it('should set type (appliesTo)', inject(function(templateElementFactory) {

    // given
    const elementTemplate = findTemplate('example.camunda.MultipleTypes');

    // when
    const element = templateElementFactory.create(elementTemplate);

    // then
    expect(element.type).to.equal('bpmn:ServiceTask');
  }));


  it('should set type (elementType)', inject(function(templateElementFactory) {

    // given
    const elementTemplate = findTemplate('example.camunda.ElementType');

    // when
    const element = templateElementFactory.create(elementTemplate);

    // then
    expect(element.type).to.equal('bpmn:ServiceTask');
  }));


  it('should apply <modelerTemplate> and <modelerTemplateVersion>', inject(function(templateElementFactory) {

    // given
    const elementTemplate = findTemplate('example.camunda.ServiceWorker');

    // when
    const element = templateElementFactory.create(elementTemplate);

    const businessObject = getBusinessObject(element);

    // then
    expect(businessObject.get('zeebe:modelerTemplate')).to.equal('example.camunda.ServiceWorker');
    expect(businessObject.get('zeebe:modelerTemplateVersion')).to.equal(1);
  }));


  it('should apply <modelerTemplateIcon>', inject(function(templateElementFactory) {

    // given
    const elementTemplate = findTemplate('example.camunda.IconTemplate');

    // when
    const element = templateElementFactory.create(elementTemplate);

    const icons = findExtensions(element, [ 'zeebe:ModelerTemplateIcon' ]);
    const icon = icons[0];

    // then
    expect(icons.length).to.equal(1);
    expect(icon).to.exist;
    expect(icon).to.jsonEqual({
      $type: 'zeebe:ModelerTemplateIcon',
      body: "data:image/svg+xml,%3Csvg width='24' height='24'%3C/svg%3E"
    });
  }));


  describe('providers', function() {


    it('should NOT create extension elements - not needed', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.PropertyBinding');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const businessObject = getBusinessObject(element);

      // then
      expect(businessObject.get('extensionElements')).to.not.exist;
    }));


    it('should handle <property>', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.PropertyBinding');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const businessObject = getBusinessObject(element);

      // then
      expect(businessObject.get('name')).to.equal('name');
    }));


    it('should handle <zeebe:taskDefinition:type>', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.TaskDefinitionTypeBinding');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const taskDefinition = findExtension(element, 'zeebe:TaskDefinition');

      // then
      expect(taskDefinition).to.exist;
      expect(taskDefinition.get('type')).to.equal('job-type');
    }));


    it('should handle <zeebe:input>', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.InputBinding');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const ioMapping = findExtension(element, 'zeebe:IoMapping');
      const inputParameters = ioMapping.get('inputParameters');

      // then
      expect(inputParameters).to.exist;
      expect(inputParameters).to.jsonEqual([
        {
          $type: 'zeebe:Input',
          source: 'input-1-value',
          target: 'input-1'
        },
        {
          $type: 'zeebe:Input',
          source: 'input-2-value',
          target: 'input-2'
        },
        {
          $type: 'zeebe:Input',
          source: 'input-3-value',
          target: 'input-3'
        }
      ]);
    }));


    it('should handle <zeebe:output>', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.OutputBinding');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const ioMapping = findExtension(element, 'zeebe:IoMapping');
      const outputParameters = ioMapping.get('outputParameters');

      // then
      expect(outputParameters).to.exist;
      expect(outputParameters).to.jsonEqual([
        {
          $type: 'zeebe:Output',
          source: 'output-1',
          target: 'output-1-value'
        },
        {
          $type: 'zeebe:Output',
          source: 'output-2',
          target: 'output-2-value'
        },
        {
          $type: 'zeebe:Output',
          source: 'output-3',
          target: 'output-3-value'
        }
      ]);
    }));


    it('should NOT create optional inputs and outputs', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.OptionalInputOutput');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const ioMapping = findExtension(element, 'zeebe:IoMapping');
      const inputParameters = ioMapping.get('inputParameters');
      const outputParameters = ioMapping.get('outputParameters');

      // then
      expect(inputParameters).to.exist;
      expect(inputParameters).to.jsonEqual([
        {
          $type: 'zeebe:Input',
          source: 'input-2-value',
          target: 'input-2'
        }
      ]);

      expect(outputParameters).to.exist;
      expect(outputParameters).to.jsonEqual([
        {
          $type: 'zeebe:Output',
          source: 'output-1',
          target: 'output-1-value'
        }
      ]);
    }));



    it('should handle <zeebe:taskHeader>', inject(function(templateElementFactory) {

      // given
      const elementTemplate = findTemplate('example.camunda.TaskHeaderBinding');

      // when
      const element = templateElementFactory.create(elementTemplate);

      const taskHeaders = findExtension(element, 'zeebe:TaskHeaders');
      const headers = taskHeaders.get('values');

      // then
      expect(headers).to.exist;
      expect(headers).to.jsonEqual([
        {
          $type: 'zeebe:Header',
          key: 'header-1',
          value: 'header-1-value'
        },
        {
          $type: 'zeebe:Header',
          key: 'header-2',
          value: 'header-2-value'
        },
        {
          $type: 'zeebe:Header',
          key: 'header-3',
          value: 'header-3-value'
        }
      ]);
    }));

  });

});


// helper ////////////////

function findTemplate(id) {
  return find(templates, t => t.id === id);
}