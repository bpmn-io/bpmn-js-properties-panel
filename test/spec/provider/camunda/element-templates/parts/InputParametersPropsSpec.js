'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var findExtension = require('lib/provider/camunda/element-templates/Helper').findExtension,
    findInputParameter = require('lib/provider/camunda/element-templates/Helper').findInputParameter;

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;


describe('element-templates/parts - Collapsible Input Parameters', function() {

  var diagramXML = require('./InputParametersProps.bpmn'),
      elementTemplates = require('./InputParametersProps.json');

  beforeEach(bootstrap(diagramXML, elementTemplates));

  it('should display label as title', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var collapsibleTitle = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-0-collapsible',
      '.bpp-collapsible__title'
    );

    // then
    expect(collapsibleTitle).to.exist;
    expect(collapsibleTitle.innerText).to.equal('recipient');
  }));


  it('should display binding name as title', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var collapsibleTitle = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-1-collapsible',
      '.bpp-collapsible__title'
    );

    // then
    expect(collapsibleTitle).to.exist;
    expect(collapsibleTitle.innerText).to.equal('noLabel');
  }));


  it('should display description', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var descriptionField = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-2-description',
      '.description__text'
    );

    // then
    expect(descriptionField).to.exist;
    expect(descriptionField.innerText).to.equal('foo bar');
  }));


  it('should display value - text', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var parameterType = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-parameterType',
          'select'
        ),
        parameterValueField = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-parameterType-text',
          'div[contenteditable]'
        );

    // then
    expect(parameterType).to.exist;
    expect(parameterType.value).to.equal('text');

    expect(parameterValueField).to.exist;
    expect(parameterValueField.innerText).to.equal('recipient');
  }));


  it('should display value - script', inject(function() {

    // given
    selectAndGet('SimpleTask');

    // when
    var collapsibleTitle = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-3-collapsible',
          '.bpp-collapsible__title'
        ),
        parameterType = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-3-parameterType',
          'select'
        ),
        scriptFormatField = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-3-parameterType-script',
          'input'
        );

    // then
    expect(collapsibleTitle).to.exist;

    expect(parameterType).to.exist;
    expect(parameterType.value).to.equal('script');

    expect(scriptFormatField).to.exist;
  }));


  it('should change parameter type - text', function() {

    // given
    var task = selectAndGet('SimpleTask');

    var parameterType = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-0-parameterType',
      'select'
    );

    // when
    parameterType.options[1].selected = 'selected';
    TestHelper.triggerEvent(parameterType, 'change');

    var inputOutput = findExtension(task, 'camunda:InputOutput'),
        recipientMapping = findInputParameter(inputOutput, { name: 'recipient' });

    // then
    expect(recipientMapping.definition).to.exist;
    expect(recipientMapping.definition.$type).to.equal('camunda:Script');
  });


  it('should change parameter type - script', function() {

    // given
    var task = selectAndGet('SimpleTask');

    var parameterType = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-0-parameterType',
      'select'
    );

    // when
    parameterType.options[1].selected = 'selected';
    TestHelper.triggerEvent(parameterType, 'change');

    var inputOutput = findExtension(task, 'camunda:InputOutput'),
        recipientMapping = findInputParameter(inputOutput, { name: 'recipient' });

    // then
    expect(recipientMapping.definition).to.exist;
    expect(recipientMapping.definition.$type).to.equal('camunda:Script');
  });


  it('should change parameter type - list', function() {

    // given
    var task = selectAndGet('SimpleTask');

    var parameterType = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-0-parameterType',
      'select'
    );

    // when
    parameterType.options[2].selected = 'selected';
    TestHelper.triggerEvent(parameterType, 'change');

    var inputOutput = findExtension(task, 'camunda:InputOutput'),
        recipientMapping = findInputParameter(inputOutput, { name: 'recipient' });

    // then
    expect(recipientMapping.definition).to.exist;
    expect(recipientMapping.definition.$type).to.equal('camunda:List');
  });


  it('should change parameter type - map', function() {

    // given
    var task = selectAndGet('SimpleTask');

    var parameterType = entrySelect(
      'template-inputs-my.domain.SimpleWorkerTask-0-parameterType',
      'select'
    );

    // when
    parameterType.options[3].selected = 'selected';
    TestHelper.triggerEvent(parameterType, 'change');

    var inputOutput = findExtension(task, 'camunda:InputOutput'),
        recipientMapping = findInputParameter(inputOutput, { name: 'recipient' });

    // then
    expect(recipientMapping.definition).to.exist;
    expect(recipientMapping.definition.$type).to.equal('camunda:Map');
  });


  describe('parameter toggle', function() {

    describe('toggle off', function() {

      var task;

      beforeEach(inject(function() {

        // given
        task = selectAndGet('SimpleTask');

        var toggle = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-assignment-toggle',
          'input'
        );

        var collapsibleTitle = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-collapsible',
          '.bpp-collapsible__title'
        );

        // assure item is collapsed
        TestHelper.triggerEvent(collapsibleTitle, 'click');

        // when
        TestHelper.triggerEvent(toggle, 'click');
      }));


      it('should remove - business object', function() {

        // then
        var inputParameter = getParameter(task, 'recipient');

        expect(inputParameter).to.not.exist;
      });


      it('should undo - business object', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameter = getParameter(task, 'recipient');

        expect(inputParameter).to.exist;
        expect(inputParameter.name).to.equal('recipient');
        expect(inputParameter.value).to.equal('recipient');
      }));


      it('should redo - business object', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var inputParameter = getParameter(task, 'recipient');

        expect(inputParameter).to.not.exist;
      }));


      it('should remove - DOM', function() {

        // then
        var parameterValueField = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-parameterType-text',
          'div[contenteditable]'
        );

        expect(parameterValueField.innerText).to.be.empty;
      });


      it('should undo - DOM', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var parameterValueField = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-parameterType-text',
          'div[contenteditable]'
        );

        expect(parameterValueField.innerText).to.equal('recipient');
      }));


      it('should redo - DOM', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var parameterValueField = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-0-parameterType-text',
          'div[contenteditable]'
        );

        expect(parameterValueField.innerText).to.be.empty;
      }));

    });


    describe('toggle on', function() {

      var task;

      beforeEach(inject(function() {

        // given
        task = selectAndGet('SimpleTask');

        var toggle = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-4-assignment-toggle',
          'input'
        );

        var collapsibleTitle = entrySelect(
          'template-inputs-my.domain.SimpleWorkerTask-4-collapsible',
          '.bpp-collapsible__title'
        );

        // assure item is collapsed
        TestHelper.triggerEvent(collapsibleTitle, 'click');

        // when
        TestHelper.triggerEvent(toggle, 'click');
      }));


      it('should create', function() {

        // then
        var inputParameter = getParameter(task, 'notCreated');

        expect(inputParameter).to.exist;
        expect(inputParameter.name).to.equal('notCreated');
        expect(inputParameter.value).to.be.null;
      });


      it('should undo', inject(function(commandStack) {

        // when
        commandStack.undo();

        // then
        var inputParameter = getParameter(task, 'notCreated');

        expect(inputParameter).to.not.exist;
      }));


      it('should redo', inject(function(commandStack) {

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var inputParameter = getParameter(task, 'notCreated');

        expect(inputParameter).to.exist;
        expect(inputParameter.name).to.equal('notCreated');
        expect(inputParameter.value).to.be.null;
      }));

    });

  });


  describe('should update parameter value', function() {
    var task;

    beforeEach(inject(function() {

      // given
      task = selectAndGet('SimpleTask');

      var collapsibleTitle = entrySelect(
            'template-inputs-my.domain.SimpleWorkerTask-0-collapsible',
            '.bpp-collapsible__title'
          ),
          parameterValueField = entrySelect(
            'template-inputs-my.domain.SimpleWorkerTask-0-parameterType-text',
            'div[contenteditable]'
          );

      // assure item is collapsed
      TestHelper.triggerEvent(collapsibleTitle, 'click');

      // when
      TestHelper.triggerValue(parameterValueField, 'bar', 'change');
    }));

    it('should execute', function() {

      // then
      var inputParameter = getParameter(task, 'recipient');

      expect(inputParameter.value).to.equal('bar');
    });


    it('should undo', inject(function(commandStack) {

      // when
      commandStack.undo();

      var inputParameter = getParameter(task, 'recipient');

      // then
      expect(inputParameter.value).to.equal('recipient');
    }));


    it('should redo', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      var inputParameter = getParameter(task, 'recipient');

      // then
      expect(inputParameter.value).to.equal('bar');
    }));

  });

});


// helper ////////////////////

function getParameter(task, parameterName) {
  var inputOutput = findExtension(task, 'camunda:InputOutput');

  return findInputParameter(inputOutput, { name: parameterName });
}
