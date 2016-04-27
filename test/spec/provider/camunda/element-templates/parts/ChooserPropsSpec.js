'use strict';

var TestHelper = require('../../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../../../lib'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../../../lib/provider/camunda'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet;

var testModules = [
  coreModule,
  selectionModule,
  modelingModule,
  propertiesPanelModule,
  propertiesProviderModule
];


function bootstrap(diagramXML, elementTemplates) {

  return function(done) {
    bootstrapModeler(diagramXML, {
      modules: testModules,
      elementTemplates: elementTemplates,
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      propertiesPanel: {
        parent: document.querySelector('body')
      }
    })(done);
  };
}


describe('element-templates/parts - Chooser', function() {

  describe('activation', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    beforeEach(bootstrap(diagramXML, elementTemplates));

    it('should boostrap with bpmn-js', inject(function() {}));

  });


  describe('display', function() {

    var diagramXML = require('./ChooserProps.bpmn'),
        elementTemplates = require('./ChooserProps.json');

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should hide with no templates', inject(function() {

      // given
      var task = selectAndGet('Gateway');

      // when
      var chooser = entrySelect('element-template-chooser');

      // then
      expect(chooser).not.to.exist;
    }));


    it('should show with existing templates', inject(function() {

      // given
      var task = selectAndGet('Task_C');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: true },
        { value: 'user.task', selected: false },
        { value: 'other.user.task', selected: false }
      ])
    }));


    it('should indicate choosen template', inject(function() {

      // given
      var task = selectAndGet('Task_A');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: false },
        { value: 'a.task', selected: true },
        { value: 'other.task', selected: false }
      ])
    }));


    it('should indicate <Unknown Template> option', inject(function() {

      // given
      var task = selectAndGet('Task_B');

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
      var task = selectAndGet('Gateway_MissingTemplate');

      // when
      var options = getElementTemplates();

      // then
      expect(options).to.eql([
        { value: '', selected: false },
        { value: 'some.gateway', selected: true }
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


var domQuery = require('min-dom/lib/query');


function getElementTemplates() {
  var options = entrySelect.all('element-template-chooser', 'select option');

  return options.map(function(o) {
    return {
      value: o.value,
      selected: o.selected
    };
  });
}


function switchTemplate(templateId) {

  var templateSelect = entrySelect('element-template-chooser', 'select'),
      option = entrySelect('element-template-chooser', 'option[value="' + templateId + '"]');

  option.selected = 'selected';

  TestHelper.triggerEvent(templateSelect, 'change');
}