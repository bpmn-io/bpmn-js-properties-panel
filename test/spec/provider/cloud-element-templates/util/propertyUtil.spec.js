import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler, inject } from 'test/TestHelper';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/cloud-element-templates';
import propertiesCommandsModule from 'src/cmd';
import modelingModule from 'bpmn-js/lib/features/modeling';

import zeebeModdlePackage from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './propertyUtil.bpmn';
import templates from './propertyUtil.json';

import {
  getPropertyValue,
  setPropertyValue } from 'src/provider/cloud-element-templates/util/propertyUtil';


describe('provider/cloud-element-template - propertyUtil', function() {

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
      propertiesCommandsModule,
      {
        propertiesPanel: [ 'value', { registerProvider() {} } ]
      }
    ],
    moddleExtensions: {
      zeebe: zeebeModdlePackage
    },
    elementTemplates: templates
  }));


  describe('#getPropertyValue', function() {

    const properties = templates[0].properties;

    it('property', inject(function(elementRegistry) {

      // given
      const element = elementRegistry.get('RestTask');
      const property = properties[0];

      // when
      const value = getPropertyValue(element, property);

      // then
      expect(value).to.equal('REST Task');
    }));


    it('zeebe:taskDefinition', inject(function(elementRegistry) {

      // given
      const element = elementRegistry.get('RestTask');
      const property = properties[1];

      // when
      const value = getPropertyValue(element, property);

      // then
      expect(value).to.equal('task-type');
    }));


    it('zeebe:taskHeader', inject(function(elementRegistry) {

      // given
      const element = elementRegistry.get('RestTask');
      const property = properties[2];

      // when
      const value = getPropertyValue(element, property);

      // then
      expect(value).to.equal('header-value');
    }));


    describe('zeebe:IOMappings',(function() {

      it('zeebe:input', inject(function(elementRegistry) {

        // given
        const element = elementRegistry.get('RestTask');
        const property = properties[3];

        // when
        const value = getPropertyValue(element, property);

        // then
        expect(value).to.equal('input-source');
      }));

      it('zeebe:ouput', inject(function(elementRegistry) {

        // given
        const element = elementRegistry.get('RestTask');
        const property = properties[4];

        // when
        const value = getPropertyValue(element, property);

        // then
        expect(value).to.equal('output-target');
      }));

    }));


    it('zeebe:property', inject(function(elementRegistry) {

      // given
      const element = elementRegistry.get('RestTask');
      const property = properties[5];

      // when
      const value = getPropertyValue(element, property);

      // then
      expect(value).to.equal('property-value');
    }));

  });


  describe('#setPropertyValue', function() {

    const properties = templates[0].properties;
    const newValue = 'new value';


    describe('property', function() {

      it('should set value', inject(function(elementRegistry, bpmnFactory, commandStack) {

        // given
        const element = elementRegistry.get('RestTask');
        const property = properties[0];

        // when
        setPropertyValue(bpmnFactory, commandStack, element, property, newValue);
        const setValue = getPropertyValue(element, property);

        // then
        expect(setValue).to.equal(newValue);
      }));

      it('should set undefined as empty String', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));

    });


    describe('zeebe:taskDefinition',(function() {

      it('should set value', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));

      it('should create zeebe:TaskDefinition if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));

    }));


    describe('zeebe:IOMappings',(function() {

      describe('zeebe:Input',(function() {

        it('should set value', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should create zeebe:Input if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should create zeebe:IOMappings if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should keep input if optional - empty string', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should not keep input if not optional - empty string', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));

      }));


      describe('zeebe:Ouput',(function() {

        it('should set value', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should create zeebe:Ouput if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should create zeebe:IOMappings if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should keep input if optional - empty string', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));


        it('should not keep input if not optional - empty string', inject(function(elementRegistry, bpmnFactory, commandStack) {
        }));

      }));

    }));


    describe('zeebe:taskHeader',(function() {

      it('should set value', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));


      it('should create zeebe:taskHeader if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));


      it('should remove if empty value', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));

    }));


    describe('zeebe:Property',(function() {

      it('should set value', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));


      it('should create zeebe:Property if non-existing', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));


      it('should keep property if optional - empty string', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));


      it('should not keep property if not optional - empty string', inject(function(elementRegistry, bpmnFactory, commandStack) {
      }));

    }));

  });


  describe('#unsetProperty', function() {

  });

});
