'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;


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


    it('should hide with no templates', inject(function() {

      // given
      selectAndGet('Gateway');

      // when
      var chooser = entrySelect('elementTemplate-chooser');

      // then
      expect(chooser).not.to.exist;
    }));


    it('should show with existing templates', inject(function() {

      // given
      selectAndGet('Task_C');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: true },
        { value: 'user.task', selected: false },
        { value: 'other.user.task', selected: false }
      ]);
    }));


    it('should indicate choosen template', inject(function() {

      // given
      selectAndGet('Task_A');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: false },
        { value: 'a.task', selected: true },
        { value: 'other.task', selected: false }
      ]);
    }));


    it('should indicate <Unknown Template> option', inject(function() {

      // given
      selectAndGet('Task_B');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: false },
        { value: 'a.task', selected: false },
        { value: 'other.task', selected: false },
        { value: 'b.task', selected: true }
      ]);
    }));


    it('should indicate <Unknown Template> option / no templates', inject(function() {

      // given
      selectAndGet('Gateway_MissingTemplate');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: false },
        { value: 'some.gateway', selected: true }
      ]);
    }));


    it('should be disabled with applied default template', inject(function() {

      // given
      selectAndGet('StartEvent_DefaultTemplate');

      // when
      var options = getElementTemplates();

      // then
      expect(isChooserDisabled()).to.be.true;
      expect(options).to.eql([
        { value: 'start.event.default', selected: true }
      ]);
    }));

    it('should be enabled with no applied template and existing default template',
      inject(function() {

        // given
        selectAndGet('StartEvent_NoTemplate');

        // when
        var options = getElementTemplates();

        // then
        expect(isChooserDisabled()).to.be.false;
        expect(options).to.eql([
          { value: '', selected: true },
          { value: 'start.event.default', selected: false }
        ]);
      }));


    it('should be enabled with applied template and existing default template',
      inject(function() {

        // given
        selectAndGet('StartEvent_Template');

        // when
        var options = getElementTemplates();

        // then
        expect(isChooserDisabled()).to.be.false;
        expect(options).to.eql([
          { value: 'start.event.other', selected: true },
          { value: 'start.event.default', selected: false }
        ]);
      }));

  });


  describe('interaction', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should assign template', inject(function() {

      // given
      var task = selectAndGet('Task_C');

      // when
      switchTemplate('other.user.task');

      // then
      expect(task.get('camunda:modelerTemplate')).to.eql('other.user.task');
    }));


    it('should switch template', inject(function() {

      // given
      var task = selectAndGet('Task_A');

      // when
      switchTemplate('other.task');

      // then
      expect(task.get('camunda:modelerTemplate')).to.eql('other.task');
    }));


    it('should undo switch template', inject(function(commandStack) {

      // given
      var task = selectAndGet('Task_A');

      switchTemplate('other.task');

      // when
      commandStack.undo();

      // then
      expect(task.get('camunda:modelerTemplate')).to.eql('a.task');
    }));

  });

});


function isChooserDisabled() {
  var templateSelect = entrySelect('elementTemplate-chooser', 'select');

  return templateSelect.disabled;
}


function getElementTemplates() {
  var options = entrySelect.all('elementTemplate-chooser', 'select option');

  return options.map(function(o) {
    return {
      value: o.value,
      selected: o.selected
    };
  });
}


function switchTemplate(templateId) {

  var templateSelect = entrySelect('elementTemplate-chooser', 'select'),
      option = entrySelect('elementTemplate-chooser', 'option[value="' + templateId + '"]');

  option.selected = 'selected';

  TestHelper.triggerEvent(templateSelect, 'change');
}