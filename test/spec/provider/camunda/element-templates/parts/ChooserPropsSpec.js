'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var getOptions = require('lib/provider/camunda/element-templates/parts/Helper').getOptions;

var find = require('lodash/find');


describe('element-templates/parts - Chooser', function() {

  it('should boostrap with bpmn-js', function() {

    // given
    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    // then
    bootstrap(diagramXML, elementTemplates)();
  });


  describe('display', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should be hidden (no templates)', inject(function() {

      // given
      selectAndGet('ExclusiveGateway_1');

      // when
      var chooser = entrySelect('elementTemplate-chooser');

      // then
      expect(chooser).not.to.exist;
    }));


    it('should be hidden (template applied)', inject(function() {

      // given
      selectAndGet('Task_2');

      // when
      var chooser = entrySelect('elementTemplate-chooser');

      // then
      expect(chooser).not.to.exist;
    }));


    it('should be visible with options', inject(function() {

      // when
      selectAndGet('Task_1');

      // then
      expectOptions([{
        name: '',
        value: 'element-template-option-empty'
      }, {
        name: 'Task Template 1 v1 (v1)',
        value: 'element-template-option-0',
        id: 'task-template-1',
        version: 1
      }, {
        name: 'Task Template 2 v1 (v1)',
        value: 'element-template-option-1',
        id: 'task-template-2',
        version: 1
      }, {
        name: 'Task Template 2 v2 (v2)',
        value: 'element-template-option-2',
        id: 'task-template-2',
        version: 2
      }]);

      expectOptionSelected('element-template-option-empty');
    }));


    it('should be visible with options (default template)',
      inject(function() {

        // when
        selectAndGet('StartEvent_1');

        // then
        expectOptions([{
          name: '',
          value: 'element-template-option-empty'
        }, {
          name: 'Start Event Template 1',
          value: 'element-template-option-0',
          id: 'start-event-template-1',
        }]);

        expectOptionSelected('element-template-option-empty');
      }));

  });


  describe('change element template', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should do', inject(function() {

      // given
      var task = selectAndGet('Task_1');

      // when
      changeTemplate('task-template-1', 1);

      // then
      expect(task.get('camunda:modelerTemplate')).to.eql('task-template-1');
      expect(task.get('camunda:modelerTemplateVersion')).to.eql(1);
    }));


    it('should undo', inject(function(commandStack) {

      // given
      var task = selectAndGet('Task_1');

      changeTemplate('task-template-1', 1);

      // when
      commandStack.undo();

      // then
      expect(task.get('camunda:modelerTemplate')).not.to.exist;
      expect(task.get('camunda:modelerTemplateVersion')).not.to.exist;
    }));

  });

});


// helpers //////////

function expectOptions(expected) {
  TestHelper.getBpmnJS().invoke(function(elementTemplates, selection, translate) {
    var element = selection.get()[ 0 ];

    expect(element).to.exist;

    var options = getOptions(element, elementTemplates, translate);

    expect(options).to.eql(expected);
  });
}

function expectOptionSelected(expected) {
  TestHelper.getBpmnJS().invoke(function(elementTemplates, selection, translate) {
    var element = selection.get()[ 0 ];

    expect(element).to.exist;

    var select = entrySelect('elementTemplate-chooser', 'select');

    expect(select.value).to.equal(expected);
  });
}

function changeTemplate(id, version) {
  TestHelper.getBpmnJS().invoke(function(elementTemplates, selection, translate) {
    var element = selection.get()[ 0 ];

    expect(element).to.exist;

    var options = getOptions(element, elementTemplates, translate);

    var option = find(options, function(option) {
      return option.id = id && option.version === version;
    });

    var select = entrySelect('elementTemplate-chooser', 'select'),
        selectOption = entrySelect('elementTemplate-chooser', 'option[value="' + option.value + '"]');

    selectOption.selected = 'selected';

    TestHelper.triggerEvent(select, 'change');
  });
}