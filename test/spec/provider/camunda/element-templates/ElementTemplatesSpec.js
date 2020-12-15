'use strict';

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var coreModule = require('bpmn-js/lib/core').default,
    elementTemplatesModule = require('lib/provider/camunda/element-templates'),
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var diagramXML = require('./ElementTemplates.bpmn');

var templates = require('./fixtures/simple'),
    falsyVersionTemplate = require('./fixtures/falsy-version');


describe('element-templates - ElementTemplates', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules: [
      coreModule,
      elementTemplatesModule,
      modelingModule
    ],
    moddleExtensions: {
      camunda: camundaModdlePackage
    }
  }));

  beforeEach(inject(function(elementTemplates) {
    elementTemplates.set(templates);
  }));


  describe('get', function() {

    it('should get template by ID', inject(function(elementTemplates) {

      // when
      var template = elementTemplates.get('foo');

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).not.to.exist;
    }));


    it('should get template by ID and version', inject(function(elementTemplates) {

      // when
      var template = elementTemplates.get('foo', 1);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
    }));


    it('should get template by element (template ID)', inject(function(elementRegistry, elementTemplates) {

      // given
      var task = elementRegistry.get('Task_1');

      // when
      var template = elementTemplates.get(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).not.to.exist;
    }));


    it('should get template by element (template ID and version)', inject(function(elementRegistry, elementTemplates) {

      // given
      var task = elementRegistry.get('Task_2');

      // when
      var template = elementTemplates.get(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
    }));


    it('should not get template (no template with ID)', inject(function(elementTemplates) {

      // when
      var template = elementTemplates.get('oof');

      // then
      expect(template).to.be.null;
    }));


    it('should not get template (no template with ID)', inject(function(elementTemplates) {

      // when
      var template = elementTemplates.get('foo', 3);

      // then
      expect(template).to.be.null;
    }));


    it('should not get template (no template applied to element)', inject(function(elementRegistry, elementTemplates) {

      // given
      var task = elementRegistry.get('Task_3');

      // when
      var template = elementTemplates.get(task);

      // then
      expect(template).to.be.null;
    }));

  });


  describe('getDefault', function() {

    it('should get default template for element', inject(function(elementRegistry, elementTemplates) {

      // given
      var task = elementRegistry.get('Task_1');

      // when
      var template = elementTemplates.getDefault(task);

      // then
      expect(template.id).to.equal('foo');
      expect(template.version).to.equal(1);
      expect(template.isDefault).to.be.true;
    }));

  });


  describe('getAll', function() {

    it('should get all templates', inject(function(elementTemplates) {

      // when
      // then
      expect(elementTemplates.getAll()).to.have.length(6);
    }));


    it('should get all templates with ID', inject(function(elementTemplates) {

      // when
      var templates = elementTemplates.getAll('foo');

      // then
      expect(templates).to.have.length(3);
      expect(templates[ 0 ].id).to.equal('foo');
      expect(templates[ 1 ].id).to.equal('foo');
      expect(templates[ 2 ].id).to.equal('foo');
    }));

  });


  describe('set', function() {

    it('should set templates', inject(function(elementTemplates) {

      // when
      elementTemplates.set(templates.slice(0, 3));

      // then
      expect(elementTemplates.getAll()).to.have.length(3);
    }));


    it('should not ignore version set to 0', inject(function(elementTemplates) {

      // when
      elementTemplates.set(falsyVersionTemplate);

      // then
      expect(elementTemplates.get(falsyVersionTemplate[0].id, 0)).to.exist;
    }));

  });

});