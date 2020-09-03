'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('lib'),
    coreModule = require('bpmn-js/lib/core').default,
    modelingModule = require('bpmn-js/lib/features/modeling').default,
    propertiesProviderModule = require('lib/provider/camunda'),
    selectionModule = require('diagram-js/lib/features/selection').default;

var camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');

var domAttr = require('min-dom').attr,
    domClasses = require('min-dom').classes,
    domQuery = require('min-dom').query,
    domQueryAll = require('min-dom').queryAll;

var forEach = require('min-dash').forEach,
    reduce = require('min-dash').reduce;

var slice = Array.prototype.slice;


describe('camunda-properties', function() {

  var testModules = [
    coreModule,
    selectionModule,
    modelingModule,
    propertiesPanelModule,
    propertiesProviderModule
  ];

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('job configuration', function() {

    var diagramXML = require('./CamundaPropertiesProvider-JobConfiguration.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaModdlePackage
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


    it('should hide the job configuration group when all items are hidden or empty', inject(function(propertiesPanel, selection, elementRegistry) {

      // given
      var shape = elementRegistry.get('ServiceTask_1'),
          selector = '[data-group=jobConfiguration]';

      // when
      selection.select(shape);

      var group = domQuery(selector, propertiesPanel._container);

      // then
      expect(domClasses(group).has('bpp-hidden')).to.be.true;
    }));


    it('should show the job configuration group when there is a non hidden group element', inject(function(propertiesPanel, selection, elementRegistry) {

      var shape = elementRegistry.get('ServiceTask_1'),
          groupSelector = '[data-group=jobConfiguration]',
          inputSelector = 'div[data-entry=asyncBefore] input[name=asyncBefore]';

      // given
      selection.select(shape);

      var asyncBeforeCheckbox = domQuery(inputSelector, propertiesPanel._container);

      // when
      TestHelper.triggerEvent(asyncBeforeCheckbox, 'click');
      var group = domQuery(groupSelector, propertiesPanel._container);

      // then
      expect(domClasses(group).has('bpp-hidden')).to.be.false;
    }));

  });


  describe('external labels', function() {

    var diagramXML = require('./ExternalLabels.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules,
      moddleExtensions: {
        camunda: camundaModdlePackage
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


    it('should show properties of label target when selecting external label', inject(
      function(elementRegistry, propertiesPanel, selection) {
        var shape = elementRegistry.get('SequenceFlow_1_label'),
            groupSelector = '[data-group=details]';

        // given
        selection.select(shape);

        // then
        var group = domQuery(groupSelector, propertiesPanel._container);

        expect(domClasses(group).has('bpp-hidden')).to.be.false;
      })
    );

  });


  describe('integration', function() {

    describe('element templates', function() {

      var diagramXML = require('./ElementTemplates.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: testModules,
        moddleExtensions: {
          camunda: camundaModdlePackage
        },
        elementTemplates: function(done) {
          done(null, [{
            id: 'foo',
            name: 'Foo',
            appliesTo: [ 'bpmn:Task' ],
            properties: []
          }]);
        }
      }));


      it('should only show element template tab if applied', inject(
        function(elementRegistry, selection) {

          // given
          var task = elementRegistry.get('Task_1');

          // when
          selection.select(task);

          // then
          expectTabActive('element-template');
          expectTabsVisible([ 'element-template' ]);
        })
      );

    });

  });

});

// helpers //////////

function expectTabActive(activeTabId) {
  var tabs = getTabs();

  forEach(tabs, function(tab, tabId) {
    if (tabId === activeTabId) {
      expect(tab.active).to.be.true;
    } else {
      expect(tab.active).to.be.false;
    }
  });
}

function expectTabsVisible(visibleTabsIds) {
  var tabs = getTabs();

  forEach(tabs, function(tab, tabId) {
    if (visibleTabsIds.indexOf(tabId) !== -1) {
      expect(tab.hidden).to.be.false;
    } else {
      expect(tab.hidden).to.be.true;
    }
  });
}

function getTabs() {
  return TestHelper.getBpmnJS().invoke(function(propertiesPanel) {
    var tabLinks = domQueryAll('.bpp-properties-tab-link', propertiesPanel._container);

    return reduce(slice.call(tabLinks), function(tabs, tabLink) {
      var tabTarget = domAttr(domQuery('[data-tab-target]', tabLink), 'data-tab-target');

      tabs[ tabTarget ] = {
        active: domClasses(tabLink).contains('bpp-active'),
        hidden: domClasses(tabLink).contains('bpp-hidden')
      };

      return tabs;
    }, {});
  });
}