'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var findExtension = require('lib/provider/camunda/element-templates/Helper').findExtension,
    findOutputParameter = require('lib/provider/camunda/element-templates/Helper').findOutputParameter;

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;


describe('element-templates/parts - Collapsible Output Parameters', function() {

  var diagramXML = require('./OutputParametersProps.bpmn'),
      elementTemplates = require('./OutputParametersProps.json');

  beforeEach(bootstrap(diagramXML, elementTemplates));

  it('should display label as title', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var collapsibleTitle = entrySelect(
      'template-outputs-my.domain.SimpleWorkerTask-0-collapsible',
      '.bpp-collapsible__title'
    );

    // then
    expect(collapsibleTitle).to.exist;
    expect(collapsibleTitle.innerText).to.equal('resultStatus');
  }));


  it('should display description', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var descriptionField = entrySelect(
      'template-outputs-my.domain.SimpleWorkerTask-1-description',
      '.description__text'
    );

    // then
    expect(descriptionField).to.exist;
    expect(descriptionField.innerText).to.equal('foo bar');
  }));


  it('should display value', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var parameterValueField = entrySelect(
      'template-outputs-my.domain.SimpleWorkerTask-0-variableName',
      'input'
    );

    // then
    expect(parameterValueField).to.exist;
    expect(parameterValueField.value).to.equal('resultStatus');
  }));



  describe('parameter toggle', function() {

    describe('toggle off', function() {

      var task;

      beforeEach(inject(function() {

        // given
        task = selectAndGet('SimpleTask');

        var toggle = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-0-assignment-toggle',
          'input'
        );

        var collapsibleTitle = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-0-collapsible',
          '.bpp-collapsible__title'
        );

        // assure item is collapsed
        TestHelper.triggerEvent(collapsibleTitle, 'click');

        // when
        TestHelper.triggerEvent(toggle, 'click');
      }));


      it('should remove - business object', function() {

        // then
        var outputParameter = getParameter(task, '${resultStatus}');

        expect(outputParameter).to.not.exist;
      });


      it('should undo - business object', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameter = getParameter(task, '${resultStatus}');

        expect(inputParameter).to.exist;
        expect(inputParameter.name).to.equal('resultStatus');
        expect(inputParameter.value).to.equal('${resultStatus}');
      }));


      it('should redo - business object', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var outputParameter = getParameter(task, '${resultStatus}');

        expect(outputParameter).to.not.exist;
      }));


      it('should remove - DOM', function() {

        // then
        var parameterValueField = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-0-variableName',
          'input'
        );

        expect(parameterValueField.value).to.be.empty;
      });


      it('should undo - DOM', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var parameterValueField = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-0-variableName',
          'input'
        );

        expect(parameterValueField.value).to.equal('resultStatus');
      }));


      it('should redo - DOM', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var parameterValueField = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-0-variableName',
          'input'
        );

        expect(parameterValueField.value).to.be.empty;
      }));

    });


    describe('toggle on', function() {

      var task;

      beforeEach(inject(function() {

        // given
        task = selectAndGet('SimpleTask');

        var toggle = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-4-assignment-toggle',
          'input'
        );

        var collapsibleTitle = entrySelect(
          'template-outputs-my.domain.SimpleWorkerTask-4-collapsible',
          '.bpp-collapsible__title'
        );

        // assure item is collapsed
        TestHelper.triggerEvent(collapsibleTitle, 'click');

        // when
        TestHelper.triggerEvent(toggle, 'click');
      }));


      it('should create', function() {

        // then
        var outputParameter = getParameter(task, 'notCreated');

        expect(outputParameter).to.exist;
        expect(outputParameter.value).to.equal('notCreated');
        expect(outputParameter.name).to.be.null;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var outputParameter = getParameter(task, 'notCreated');

        expect(outputParameter).to.not.exist;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var outputParameter = getParameter(task, 'notCreated');

        expect(outputParameter).to.exist;
        expect(outputParameter.value).to.equal('notCreated');
        expect(outputParameter.name).to.be.null;
      }));

    });

  });


  describe('should update parameter value', function() {
    var task;

    beforeEach(inject(function() {

      // given
      task = selectAndGet('SimpleTask');

      var collapsibleTitle = entrySelect(
            'template-outputs-my.domain.SimpleWorkerTask-0-collapsible',
            '.bpp-collapsible__title'
          ),
          parameterValueField = entrySelect(
            'template-outputs-my.domain.SimpleWorkerTask-0-variableName',
            'input'
          );

      // assure item is collapsed
      TestHelper.triggerEvent(collapsibleTitle, 'click');

      // when
      TestHelper.triggerValue(parameterValueField, 'bar', 'change');
    }));

    it('should execute', function() {

      // then
      var outputParameter = getParameter(task, '${resultStatus}');

      expect(outputParameter.name).to.equal('bar');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      var outputParameter = getParameter(task, '${resultStatus}');

      // then
      expect(outputParameter.name).to.equal('resultStatus');
    }));


    it('should redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      var outputParameter = getParameter(task, '${resultStatus}');

      // then
      expect(outputParameter.name).to.equal('bar');
    }));

  });


  describe('validation', function() {

    function expectError(entry, message) {
      var errorElement = entrySelect(entry, '.bpp-error-message');

      var error = errorElement && errorElement.textContent;

      expect(error).to.eql(message);
    }

    function expectValid(entry) {
      expectError(entry, null);
    }

    function changeInput(collapsible, variableName, newValue) {
      var collapsibleTitle = entrySelect(collapsible, '.bpp-collapsible__title'),
          input = entrySelect(variableName, 'input');

      // assure item is collapsed
      TestHelper.triggerEvent(collapsibleTitle, 'click');

      TestHelper.triggerValue(input, newValue, 'change');
    }

    it('should validate empty name', inject(function() {

      // given
      selectAndGet('SimpleTask');

      var collapsibleEntryId = 'template-outputs-my.domain.SimpleWorkerTask-2-collapsible',
          variableNameEntryId = 'template-outputs-my.domain.SimpleWorkerTask-2-variableName';

      // assume
      expectError(variableNameEntryId, 'Process Variable Name must not be empty.');

      // when
      changeInput(collapsibleEntryId, variableNameEntryId, 'foo');

      // then
      expectValid(variableNameEntryId);
    }));


    it('should validate spaces', inject(function() {

      // given
      selectAndGet('SimpleTask');

      var collapsibleEntryId = 'template-outputs-my.domain.SimpleWorkerTask-3-collapsible',
          variableNameEntryId = 'template-outputs-my.domain.SimpleWorkerTask-3-variableName';

      // assume
      expectError(variableNameEntryId, 'Process Variable Name must not contain spaces.');

      // when
      changeInput(collapsibleEntryId, variableNameEntryId, 'foo');

      // then
      expectValid(variableNameEntryId);
    }));

  });

});


// helper ////////////////////

function getParameter(task, source) {
  var inputOutput = findExtension(task, 'camunda:InputOutput');

  return findOutputParameter(inputOutput, { source: source });
}