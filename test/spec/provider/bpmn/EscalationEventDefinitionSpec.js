'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll,
    domClasses = require('min-dom').classes,
    coreModule = require('bpmn-js/lib/core').default,
    selectionModule = require('diagram-js/lib/features/selection').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/bpmn'),
    getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    find = require('lodash/find'),
    eventDefinitionHelper = require('lib/helper/EventDefinitionHelper'),
    camundaPackage = require('camunda-bpmn-moddle/resources/camunda.json');


function getGeneralTab(container) {
  return domQuery('div[data-tab="general"]', container);
}

function getDetailsGroup(container) {
  var tab = getGeneralTab(container);
  return domQuery('div[data-group="details"]', tab);
}

function getEntry(container, entryId) {
  return domQuery('div[data-entry="' + entryId + '"]', getDetailsGroup(container));
}

function getInputField(container, entryId, inputName) {
  var selector = 'input' + (inputName ? '[name="' + inputName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getSelectField(container, entryId, selectName) {
  var selector = 'select' + (selectName ? '[name="' + selectName + '"]' : '');
  return domQuery(selector, getEntry(container, entryId));
}

function getEscalationDefinitionsField(container) {
  return getSelectField(container, 'event-definitions-escalation', 'selectedElement');
}

function selectEscalationDefinition(id, container) {
  var selectBox = getEscalationDefinitionsField(container);
  var option = find(selectBox.options, function(o) {
    return o.value === id;
  });
  option.selected = 'selected';
  TestHelper.triggerEvent(selectBox, 'change');
}

function getEscalationNameField(container) {
  return getInputField(container, 'escalation-element-name', 'name');
}

function getEscalationCodeField(container) {
  return getInputField(container, 'escalation-element-code', 'escalationCode');
}

function isHidden(node) {
  return domClasses(node).has('bpp-hidden');
}

function isInputHidden(node) {
  return isHidden(node.parentNode);
}

function hasInvalidClass(node) {
  return domClasses(node).has('invalid');
}

describe('escalation-event-properties', function() {

  var diagramXML = require('./EscalationEventDefinition.bpmn');

  var testModules = [
    coreModule, selectionModule, modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    moddleExtensions: {
      camunda: camundaPackage
    }
  }));


  beforeEach(inject(function(commandStack, propertiesPanel) {

    var undoButton = document.createElement('button');
    undoButton.textContent = 'UNDO';

    undoButton.addEventListener('click', function() {
      commandStack.undo();
    });

    container.appendChild(undoButton);

    propertiesPanel.attachTo(container);
  }));


  describe('change escalation reference', function() {

    var container, escalationEventDefinition;

    beforeEach(inject(function(elementRegistry, propertiesPanel, selection) {

      // given
      container = propertiesPanel._container;

      var shape = elementRegistry.get('EscalationIntermediateThrowEvent');
      selection.select(shape);

      var bo = getBusinessObject(shape);
      escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(bo);
    }));

    describe('to another escalation element', function() {

      var select;

      beforeEach(function() {
        select = getEscalationDefinitionsField(container);

        // when
        selectEscalationDefinition('Escalation_2', container);
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(select.value).to.equal('Escalation_2');

          expect(isInputHidden(getEscalationNameField(container))).to.be.false;
          expect(isInputHidden(getEscalationCodeField(container))).to.be.false;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('Escalation_4');

          expect(isInputHidden(getEscalationNameField(container))).to.be.false;
          expect(isInputHidden(getEscalationCodeField(container))).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(select.value).to.equal('Escalation_2');

          expect(isInputHidden(getEscalationNameField(container))).to.be.false;
          expect(isInputHidden(getEscalationCodeField(container))).to.be.false;
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(escalationEventDefinition.escalationRef).to.be.ok;
          expect(escalationEventDefinition.escalationRef.id).to.equal('Escalation_2');
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(escalationEventDefinition.escalationRef).to.be.ok;
          expect(escalationEventDefinition.escalationRef.id).to.equal('Escalation_4');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(escalationEventDefinition.escalationRef).to.be.ok;
          expect(escalationEventDefinition.escalationRef.id).to.equal('Escalation_2');
        }));

      });

    });


    describe('to undefined', function() {

      var select;

      beforeEach(function() {
        select = getEscalationDefinitionsField(container);

        // when
        selectEscalationDefinition('', container);
      });

      describe('in the DOM', function() {

        it('should execute', function() {

          // then
          expect(select.value).to.equal('');

          expect(isInputHidden(getEscalationNameField(container))).to.be.true;
          expect(isInputHidden(getEscalationCodeField(container))).to.be.true;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(select.value).to.equal('Escalation_4');

          expect(isInputHidden(getEscalationNameField(container))).to.be.false;
          expect(isInputHidden(getEscalationCodeField(container))).to.be.false;
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(select.value).to.equal('');

          expect(isInputHidden(getEscalationNameField(container))).to.be.true;
          expect(isInputHidden(getEscalationCodeField(container))).to.be.true;
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {

          // then
          expect(escalationEventDefinition.escalationRef).not.to.be.ok;
        });


        it('should undo', inject(function(commandStack) {

          // when
          commandStack.undo();

          // then
          expect(escalationEventDefinition.escalationRef).to.be.ok;
          expect(escalationEventDefinition.escalationRef.id).to.equal('Escalation_4');
        }));


        it('should redo', inject(function(commandStack) {

          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(escalationEventDefinition.escalationRef).not.to.be.ok;
        }));

      });

    });

  });


  describe('boundary event', function() {

    it('should show escalation code variable input', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationBoundaryEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(escalationCodeVar).to.exist;
    }));


    it('should get escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationBoundaryEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
          escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

      // then
      expect(escalationCodeVar.value).to.equal('myEscalationCodeVariable');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

    }));


    it('should set escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationBoundaryEvent');
      selection.select(shape);

      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
          escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

      // assume
      expect(escalationCodeVar.value).to.equal('myEscalationCodeVariable');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

      // when
      TestHelper.triggerValue(escalationCodeVar, 'myNewEscalationCodeVar', 'change');

      // then
      expect(escalationCodeVar.value).to.equal('myNewEscalationCodeVar');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

    }));


    it('should validate escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationBoundaryEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(hasInvalidClass(escalationCodeVar)).to.be.false;

    }));


    it('should invalidate escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('InvalidEscalationBoundaryEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(hasInvalidClass(escalationCodeVar)).to.be.true;

    }));


    it('should clear escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationBoundaryEvent');
      selection.select(shape);

      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
          clearButton = domQuery(
            '[data-entry=escalationCodeVariable] button[data-action=clear]', propertiesPanel._container),
          escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

      // assume
      expect(escalationCodeVar.value).to.equal('myEscalationCodeVariable');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

      // when
      TestHelper.triggerEvent(clearButton, 'click');

      // then
      expect(escalationCodeVar.value).to.be.empty;
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.be.undefined;

    }));

  });


  describe('start event', function() {

    it('should show escalation code variable input', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationStartEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(escalationCodeVar).to.exist;
    }));


    it('should get escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationStartEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
          escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

      // then
      expect(escalationCodeVar.value).to.equal('myEscalationCodeVariable');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

    }));


    it('should set escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationStartEvent');
      selection.select(shape);

      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
          escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

      // assume
      expect(escalationCodeVar.value).to.equal('myEscalationCodeVariable');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

      // when
      TestHelper.triggerValue(escalationCodeVar, 'myNewEscalationCodeVar', 'change');

      // then
      expect(escalationCodeVar.value).to.equal('myNewEscalationCodeVar');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

    }));


    it('should validate escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationStartEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(hasInvalidClass(escalationCodeVar)).to.be.false;

    }));


    it('should invalidate escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('InvalidEscalationStartEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(hasInvalidClass(escalationCodeVar)).to.be.true;

    }));


    it('should clear escalation code variable', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationStartEvent');
      selection.select(shape);

      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container),
          clearButton = domQuery(
            '[data-entry=escalationCodeVariable] button[data-action=clear]', propertiesPanel._container),
          escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(shape);

      // assume
      expect(escalationCodeVar.value).to.equal('myEscalationCodeVariable');
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.equal(escalationCodeVar.value);

      // when
      TestHelper.triggerEvent(clearButton, 'click');

      // then
      expect(escalationCodeVar.value).to.be.empty;
      expect(escalationEventDefinition.get('camunda:escalationCodeVariable')).to.be.undefined;

    }));

  });


  describe('intermediate throw event', function() {

    it('should not show escalation code variable input', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationIntermediateThrowEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(escalationCodeVar).to.not.exist;
    }));

  });


  describe('end event', function() {

    it('should not show escalation code variable input', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('EscalationEndEvent');
      selection.select(shape);

      // when
      var escalationCodeVar = domQuery('input[name=escalationCodeVariable]', propertiesPanel._container);

      // then
      expect(escalationCodeVar).to.not.exist;
    }));

  });


  describe('dropdown options', function() {

    it('should display escalation code', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('DropdownEscalationBoundaryEvent');
      selection.select(shape);

      // when
      var options = domQueryAll('select[id=camunda-escalation][name=selectedElement] > option', propertiesPanel._container);
      var optionWithCode = options['1'];

      // then
      expect(optionWithCode.textContent.indexOf('(code=')).to.not.eql(-1);

    }));


    it('should not display escalation code', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('DropdownEscalationBoundaryEvent');
      selection.select(shape);

      // when
      var options = domQueryAll('select[id=camunda-escalation][name=selectedElement] > option', propertiesPanel._container);
      var optionWithoutCode = options['0'];

      // then
      expect(optionWithoutCode.textContent.indexOf('(code=')).to.eql(-1);

    }));

  });

});
