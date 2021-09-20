'use strict';

/* global bootstrapModeler, inject */

var TestHelper = require('../../../TestHelper');

var domQuery = require('min-dom').query;

var coreModule = require('bpmn-js/lib/core').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesPanelModule = require('lib'),
    propertiesProviderModule = require('lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection').default;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;


describe('form props', function() {

  var diagramXML = require('./FormProps.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: { camunda: camundaModdlePackage }
  }));


  describe('form type', function() {

    it('should display', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormKey');

      // when
      selection.select(task);

      // then
      var select = domQuery('select[name=formType]', propertiesPanel._container);

      expect(select.value).to.equal('formKey');
    }));


    describe('update', function() {

      describe('<none> to form key', function() {

        it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

          // given
          var task = elementRegistry.get('UserTask'),
              businessObject = getBusinessObject(task);

          // when
          selection.select(task);

          var select = domQuery('select[name=formType]', propertiesPanel._container);

          // when
          TestHelper.triggerValue(select, 'formKey', 'change');

          // then
          expect(select.value).to.equal('formKey');

          expect(businessObject.get('camunda:formKey')).to.equal('');
        }));


        it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

          // given
          var task = elementRegistry.get('UserTask'),
              businessObject = getBusinessObject(task);

          // when
          selection.select(task);

          var select = domQuery('select[name=formType]', propertiesPanel._container);

          TestHelper.triggerValue(select, 'formKey', 'change');

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('');

          expect(businessObject.get('camunda:formKey')).not.to.exist;
        }));

      });


      describe('<none> to form ref', function() {

        it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

          // given
          var task = elementRegistry.get('UserTask'),
              businessObject = getBusinessObject(task);

          // when
          selection.select(task);

          var select = domQuery('select[name=formType]', propertiesPanel._container);

          // when
          TestHelper.triggerValue(select, 'formRef', 'change');

          // then
          expect(select.value).to.equal('formRef');

          expect(businessObject.get('camunda:formRef')).to.equal('');
        }));


        it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

          // given
          var task = elementRegistry.get('UserTask'),
              businessObject = getBusinessObject(task);

          // when
          selection.select(task);

          var select = domQuery('select[name=formType]', propertiesPanel._container);

          TestHelper.triggerValue(select, 'formRef', 'change');

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('');

          expect(businessObject.get('camunda:formRef')).not.to.exist;
        }));

      });


      describe('form key to <none>', function() {

        it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

          // given
          var task = elementRegistry.get('UserTask_FormKey'),
              businessObject = getBusinessObject(task);

          // when
          selection.select(task);

          var select = domQuery('select[name=formType]', propertiesPanel._container);

          // when
          TestHelper.triggerValue(select, '', 'change');

          // then
          expect(select.value).to.equal('');

          expect(businessObject.get('camunda:formKey')).not.to.exist;
        }));


        it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

          // given
          var task = elementRegistry.get('UserTask_FormKey'),
              businessObject = getBusinessObject(task);

          // when
          selection.select(task);

          var select = domQuery('select[name=formType]', propertiesPanel._container);

          TestHelper.triggerValue(select, '', 'change');

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('formKey');

          expect(businessObject.get('camunda:formKey')).to.equal('embedded:deployment:FORM_NAME.html');
        }));

      });

    });

  });


  describe('camunda:formKey', function() {

    it('should display', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormKey'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      // then
      var input = domQuery('input[name=formKey]', propertiesPanel._container);

      expect(input.value).to.equal('embedded:deployment:FORM_NAME.html');

      expect(businessObject.get('camunda:formKey')).to.equal(input.value);
    }));


    it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormKey'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var input = domQuery('input[name=formKey]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(input, 'foo', 'change');

      // then
      expect(input.value).to.equal('foo');

      expect(businessObject.get('camunda:formKey')).to.equal(input.value);
    }));


    it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormKey'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var input = domQuery('input[name=formKey]', propertiesPanel._container);

      TestHelper.triggerValue(input, 'foo', 'change');

      // when
      commandStack.undo();

      // then
      expect(input.value).to.equal('embedded:deployment:FORM_NAME.html');

      expect(businessObject.get('camunda:formKey')).to.equal(input.value);
    }));

  });


  describe('camunda:formRef', function() {

    it('should display', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      // then
      var input = domQuery('input[name=formRef]', propertiesPanel._container);

      expect(input.value).to.equal('invoice.form');

      expect(businessObject.get('camunda:formRef')).to.equal(input.value);
    }));


    it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var input = domQuery('input[name=formRef]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(input, 'foo', 'change');

      // then
      expect(input.value).to.equal('foo');

      expect(businessObject.get('camunda:formRef')).to.equal(input.value);
    }));


    it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var input = domQuery('input[name=formRef]', propertiesPanel._container);

      TestHelper.triggerValue(input, 'foo', 'change');

      // when
      commandStack.undo();

      // then
      expect(input.value).to.equal('invoice.form');

      expect(businessObject.get('camunda:formRef')).to.equal(input.value);
    }));

  });


  describe('camunda:formRefBinding', function() {

    it('should display', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      // then
      var select = domQuery('select[name=formRefBinding]', propertiesPanel._container);

      expect(select.value).to.equal('version');

      expect(businessObject.get('camunda:formRefBinding')).to.equal(select.value);
    }));


    it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var select = domQuery('select[name=formRefBinding]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(select, 'deployment', 'change');

      // then
      expect(select.value).to.equal('deployment');

      expect(businessObject.get('camunda:formRefBinding')).to.equal(select.value);
    }));


    it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var select = domQuery('select[name=formRefBinding]', propertiesPanel._container);

      TestHelper.triggerValue(select, 'deployment', 'change');

      // when
      commandStack.undo();

      // then
      expect(select.value).to.equal('version');

      expect(businessObject.get('camunda:formRefBinding')).to.equal(select.value);
    }));

  });


  describe('camunda:formRefBinding', function() {

    it('should display', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      // then
      var input = domQuery('input[name=formRefVersion]', propertiesPanel._container);

      expect(input.value).to.equal('1');

      expect(businessObject.get('camunda:formRefVersion')).to.equal(input.value);
    }));


    it('should update', inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var input = domQuery('input[name=formRefVersion]', propertiesPanel._container);

      // when
      TestHelper.triggerValue(input, 'foo', 'change');

      // then
      expect(input.value).to.equal('foo');

      expect(businessObject.get('camunda:formRefVersion')).to.equal(input.value);
    }));


    it('should undo', inject(function(commandStack, elementRegistry, propertiesPanel, selection) {

      // given
      var task = elementRegistry.get('UserTask_FormRef'),
          businessObject = getBusinessObject(task);

      // when
      selection.select(task);

      var input = domQuery('input[name=formRefVersion]', propertiesPanel._container);

      TestHelper.triggerValue(input, 'foo', 'change');

      // when
      commandStack.undo();

      // then
      expect(input.value).to.equal('1');

      expect(businessObject.get('camunda:formRefVersion')).to.equal(input.value);
    }));

  });

});
