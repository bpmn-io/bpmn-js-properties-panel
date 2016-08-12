'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject */

var propertiesPanelModule = require('../../../../lib'),
    domQuery = require('min-dom/lib/query'),
    coreModule = require('bpmn-js/lib/core'),
    selectionModule = require('diagram-js/lib/features/selection'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesProviderModule = require('../../../../lib/provider/bpmn');


function getTextbox(container, selector) {
  return domQuery('div[data-entry='+ selector +'] div[name=documentation]', container);
}

function getDocumentation(bo) {
  var documentations = bo.get('documentation') || [];
  return documentations[0];
}


describe('documentation-participant-properties', function() {

  var diagramXML = require('./DocumentationParticipant.bpmn');

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
    modules: testModules
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


  describe('get', function() {

    var item, field, bo;

    it('documentation for a collaboration', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      item = elementRegistry.get('Collaboration_1');
      selection.select(item);

      field = getTextbox(propertiesPanel._container, 'documentation');
      bo = item.businessObject;

      // when selecting element

      // then
      expect(field.textContent).to.equal(getDocumentation(bo).get('text'));

    }));


    it('documentation for a participant', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      item = elementRegistry.get('Participant_Process');
      selection.select(item);

      field = getTextbox(propertiesPanel._container, 'documentation');
      bo = item.businessObject;

      // when selecting element

      // then
      expect(field.textContent).to.equal(getDocumentation(bo).get('text'));

    }));


    it('documentation for a collapsed participant', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      item = elementRegistry.get('Participant_Collapsed');
      selection.select(item);

      field = getTextbox(propertiesPanel._container, 'documentation');
      bo = item.businessObject;

      // when selecting element

      // then
      expect(field.textContent).to.equal('');
      expect(bo.get('documentation')).to.have.length(0);

    }));


    it('documentation for a process', inject(function(elementRegistry, selection, propertiesPanel) {

      // given
      item = elementRegistry.get('Participant_Process');
      selection.select(item);

      field = getTextbox(propertiesPanel._container, 'process-documentation');
      bo = item.businessObject.processRef;

      // when selecting element

      // then
      expect(field.textContent).to.equal(getDocumentation(bo).get('text'));

    }));


  });


  describe('set', function() {

    var item, bo, field;

    describe('should set the documentation for a collaboration', function() {

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        item = elementRegistry.get('Collaboration_1');
        selection.select(item);

        bo = item.businessObject;
        field = getTextbox(propertiesPanel._container, 'documentation');

        // when
        TestHelper.triggerValue(field, 'DOCS', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(field.textContent).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.textContent).to.equal('collaboration docu');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.textContent).to.equal('DOCS');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('collaboration docu');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        }));

      });

    });


    describe('should set the documentation for a participant', function() {

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        item = elementRegistry.get('Participant_Empty');
        selection.select(item);

        bo = item.businessObject;
        field = getTextbox(propertiesPanel._container, 'documentation');

        // when
        TestHelper.triggerValue(field, 'DOCS', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(field.textContent).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.textContent).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.textContent).to.equal('DOCS');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(bo.get('documentation')).to.have.length(1);
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.get('documentation')).to.have.length(0);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.get('documentation')).to.have.length(1);
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        }));

      });

    });


    describe('should set the documentation for a collapsed participant', function() {

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        item = elementRegistry.get('Participant_Collapsed');
        selection.select(item);

        bo = item.businessObject;
        field = getTextbox(propertiesPanel._container, 'documentation');

        // when
        TestHelper.triggerValue(field, 'DOCS', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(field.textContent).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.textContent).to.equal('');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.textContent).to.equal('DOCS');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(bo.get('documentation')).to.have.length(1);
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.get('documentation')).to.have.length(0);
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.get('documentation')).to.have.length(1);
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        }));

      });

    });


    describe('should set the documentation for a process', function() {

      beforeEach(inject(function(elementRegistry, selection, propertiesPanel) {

        // given
        item = elementRegistry.get('Participant_Process');
        selection.select(item);

        bo = item.businessObject.processRef;
        field = getTextbox(propertiesPanel._container, 'process-documentation');

        // when
        TestHelper.triggerValue(field, 'DOCS', 'change');

      }));

      describe('in the DOM', function() {

        it('should execute', function() {
          // then
          expect(field.textContent).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(field.textContent).to.equal('process docu');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(field.textContent).to.equal('DOCS');
        }));

      });

      describe('on the business object', function() {

        it('should execute', function() {
          // then
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        });

        it('should undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('process docu');
        }));


        it('should redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(bo.get('documentation')).to.include(getDocumentation(bo));
          expect(getDocumentation(bo).get('text')).to.equal('DOCS');
        }));

      });

    });
  });


  describe('control visibility', function() {

    function expectVisible(elementId, visible, selector, getter) {

      if (!getter) {
        getter = getTextbox;
      }

      return inject(function(propertiesPanel, selection, elementRegistry) {

        // given
        var element = elementRegistry.get(elementId);

        // assume
        expect(element).to.exist;

        // when
        selection.select(element);
        var field = getter(propertiesPanel._container, selector);

        // then
        if (visible) {
          expect(field).to.exist;
        } else {
          expect(field).not.to.exist;
        }
      });
    }


    describe('should show', function() {

      it('Collaboration', expectVisible('Collaboration_1', true, 'documentation'));

      it('Participant', expectVisible('Participant_Process', true, 'documentation'));
      it('Participant', expectVisible('Participant_Process', true, 'process-documentation'));

      it('Collapsed Participant', expectVisible('Participant_Collapsed', true, 'documentation'));
      it('Collapsed Participant', expectVisible('Participant_Collapsed', false, 'process-documentation'));

    });


    describe('should hide', function() {

      it('Collaboration', expectVisible('Collaboration_1', false, 'process-documentation'));

    });

  });

});
