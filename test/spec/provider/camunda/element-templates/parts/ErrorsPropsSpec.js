'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var findCamundaErrorEventDefinition = require('lib/provider/camunda/element-templates/Helper').findCamundaErrorEventDefinition;

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var domClasses = require('min-dom').classes,
    domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll,
    domAttr = require('min-dom').attr;

describe('element-templates/parts - Collapsible Errors', function() {

  var diagramXML = require('./ErrorsProps.bpmn'),
      elementTemplates = require('./ErrorsProps.json');

  beforeEach(bootstrap(diagramXML, elementTemplates));


  describe('display', function() {

    it('should display errors', inject(function(propertiesPanel) {

      // given
      var container = propertiesPanel._container;

      selectAndGet('ServiceTask_1');

      // when
      var errorsGroup = getTemplateErrorsGroup(container);

      // then
      expect(isHidden(errorsGroup)).to.be.false;
      expect(getTemplateErrors(container).length).to.equal(3);
    }));


    it('should NOT display errors - none defined', inject(function(propertiesPanel) {

      // given
      var container = propertiesPanel._container;

      selectAndGet('ServiceTask_empty');

      // when
      var errorsGroup = getTemplateErrorsGroup(container);

      // then
      expect(isHidden(errorsGroup)).to.be.true;
    }));


    it('should display title', inject(function() {

      // given
      selectAndGet('ServiceTask_1');

      // when
      var collapsibleTitle = entrySelect(
        'template-errors-com.example.ExternalTaskWorker-0-collapsible',
        '.bpp-collapsible__title'
      );

      // then
      expect(collapsibleTitle).to.exist;

      // "${errorRef.name} (code = ${errorRef.errorCode})"
      expect(collapsibleTitle.innerText).to.equal('error-name-1 (code = error-code-1)');
    }));


    it('should display error expression (disabled)', inject(function() {

      // given
      selectAndGet('ServiceTask_1');

      // when
      var expressionTextField = entrySelect(
        'template-errors-com.example.ExternalTaskWorker-0-error-expression',
        'input'
      );

      // then
      expect(expressionTextField).to.exist;
      expect(expressionTextField.value).to.equal('${error.expression1}');
      expect(isDisabled(expressionTextField)).to.be.true;
    }));


    it('should NOT display error reference select', inject(function() {

      // given
      selectAndGet('ServiceTask_1');

      // when
      var selectField = entrySelect(
        'template-errors-com.example.ExternalTaskWorker-0-error-reference',
        'select'
      );

      // then
      expect(selectField).not.to.exist;
    }));


    it('should display error name', inject(function() {

      // given
      selectAndGet('ServiceTask_1');

      // when
      var textField = entrySelect(
        'template-errors-com.example.ExternalTaskWorker-0-error-element-name',
        'input'
      );

      // then
      expect(textField).to.exist;
      expect(textField.value).to.equal('error-name-1');
    }));


    it('should display error code', inject(function() {

      // given
      selectAndGet('ServiceTask_1');

      // when
      var textField = entrySelect(
        'template-errors-com.example.ExternalTaskWorker-0-error-element-code',
        'input'
      );

      // then
      expect(textField).to.exist;
      expect(textField.value).to.equal('error-code-1');
    }));


    it('should display error message', inject(function() {

      // given
      selectAndGet('ServiceTask_1');

      // when
      var textField = entrySelect(
        'template-errors-com.example.ExternalTaskWorker-0-error-element-message',
        'input'
      );

      // then
      expect(textField).to.exist;
      expect(textField.value).to.equal('error-message-1');
    }));

  });


  describe('should update error name', function() {

    var task;

    beforeEach(inject(function() {

      // given
      task = selectAndGet('ServiceTask_1');

      var collapsibleTitle = entrySelect(
            'template-errors-com.example.ExternalTaskWorker-0-collapsible',
            '.bpp-collapsible__title'
          ),
          nameField = entrySelect(
            'template-errors-com.example.ExternalTaskWorker-0-error-element-name',
            'input'
          );

      // assure item is collapsed
      TestHelper.triggerEvent(collapsibleTitle, 'click');

      // when
      TestHelper.triggerValue(nameField, 'foo', 'change');
    }));

    it('should execute', function() {

      // then
      var error = getError(task, 'error-1');

      expect(error.name).to.equal('foo');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      var error = getError(task, 'error-1');

      // then
      expect(error.name).to.equal('error-name-1');
    }));


    it('should redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      var error = getError(task, 'error-1');

      // then
      expect(error.name).to.equal('foo');
    }));

  });


  describe('should update error code', function() {

    var task;

    beforeEach(inject(function() {

      // given
      task = selectAndGet('ServiceTask_1');

      var collapsibleTitle = entrySelect(
            'template-errors-com.example.ExternalTaskWorker-0-collapsible',
            '.bpp-collapsible__title'
          ),
          codeField = entrySelect(
            'template-errors-com.example.ExternalTaskWorker-0-error-element-code',
            'input'
          );

      // assure item is collapsed
      TestHelper.triggerEvent(collapsibleTitle, 'click');

      // when
      TestHelper.triggerValue(codeField, 'foo', 'change');
    }));

    it('should execute', function() {

      // then
      var error = getError(task, 'error-1');

      expect(error.errorCode).to.equal('foo');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      var error = getError(task, 'error-1');

      // then
      expect(error.errorCode).to.equal('error-code-1');
    }));


    it('should redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      var error = getError(task, 'error-1');

      // then
      expect(error.errorCode).to.equal('foo');
    }));
  });


  describe('should update error message', function() {

    var task;

    beforeEach(inject(function() {

      // given
      task = selectAndGet('ServiceTask_1');

      var collapsibleTitle = entrySelect(
            'template-errors-com.example.ExternalTaskWorker-0-collapsible',
            '.bpp-collapsible__title'
          ),
          messageField = entrySelect(
            'template-errors-com.example.ExternalTaskWorker-0-error-element-message',
            'input'
          );

      // assure item is collapsed
      TestHelper.triggerEvent(collapsibleTitle, 'click');

      // when
      TestHelper.triggerValue(messageField, 'foo', 'change');
    }));

    it('should execute', function() {

      // then
      var error = getError(task, 'error-1');

      expect(error.errorMessage).to.equal('foo');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      var error = getError(task, 'error-1');

      // then
      expect(error.errorMessage).to.equal('error-message-1');
    }));


    it('should redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      var error = getError(task, 'error-1');

      // then
      expect(error.errorMessage).to.equal('foo');
    }));
  });

});


// helpers ///////////////////////

function getTemplateErrorsGroup(container) {
  return domQuery('[data-group="template-errors"]', container);
}

function getTemplateErrors(container) {
  var group = getTemplateErrorsGroup(container);
  return domQueryAll('.bpp-collapsible-error', group);
}

function isHidden(entryNode) {
  return domClasses(entryNode).has('bpp-hidden');
}

function isDisabled(node) {
  return domAttr(node, 'disabled') !== null;
}

function getError(element, errorId) {
  var errorEventDefinition = findCamundaErrorEventDefinition(element, errorId);

  if (errorEventDefinition) {
    return errorEventDefinition.errorRef;
  }
}