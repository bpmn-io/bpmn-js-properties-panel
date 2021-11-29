import {
  act
} from '@testing-library/preact';

import TestContainer from 'mocha-test-container-support';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import diagramXML from './DocumentationProps.bpmn';

describe('provider/bpmn - DocumentationProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));


  describe('bpmn:Task#documentation', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const documentationInput = domQuery('textarea[name=documentation]', container);

      const documentation = getDocumentation(task)[0];

      // then
      expect(documentationInput.value).to.eql(documentation.get('text'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const documentationInput = domQuery('textarea[name=documentation]', container);
      changeInput(documentationInput, 'newValue');

      const documentation = getDocumentation(task);

      // then
      expect(documentation).to.have.length(1);
      expect(documentation[0].get('text')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('Task_1');
        const originalValue = getDocumentation(task)[0].get('text');

        await act(() => {
          selection.select(task);
        });
        const documentationInput = domQuery('textarea[name=documentation]', container);
        changeInput(documentationInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(documentationInput.value).to.eql(originalValue);
      })
    );


    it('should create documentation', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_2');
      let documentation = getDocumentation(task);

      // assume
      expect(documentation).to.be.empty;

      await act(() => {
        selection.select(task);
      });

      // when
      const documentationInput = domQuery('textarea[name=documentation]', container);
      changeInput(documentationInput, 'newValue');

      documentation = getDocumentation(task);

      // then
      expect(documentation).to.have.length(1);
      expect(documentation[0].get('text')).to.eql('newValue');
    }));


    it('should remove on empty value', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const documentationInput = domQuery('textarea[name=documentation]', container);
      changeInput(documentationInput, '');

      const documentation = getDocumentation(task);

      // then
      expect(documentation).to.be.empty;
    }));


    it('should ignore typed documentation', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_Typed');
      const documentation = getDocumentation(task);

      // assume
      expect(documentation).to.have.length(1);

      await act(() => {
        selection.select(task);
      });

      // when
      const documentationInput = domQuery('textarea[name=documentation]', container);

      // then
      expect(documentationInput.value).to.eql('');
    }));


    it('should use first text plain', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_Multiple');
      const documentation = getDocumentation(task);

      // assume
      expect(documentation).to.have.length(2);

      await act(() => {
        selection.select(task);
      });

      // when
      const documentationInput = domQuery('textarea[name=documentation]', container);

      // then
      expect(documentationInput.value).to.eql(documentation[1].get('text'));
    }));

  });


  describe('bpmn:Participant#processRef.documentation', function() {

    it('should NOT be displayed for empty participant',
      inject(async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_Empty');

        // when
        await act(() => {
          selection.select(participant);
        });

        // then
        const processDocumentationInput = domQuery('textarea[name=processDocumentation]', container);

        expect(processDocumentationInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const processDocumentationInput = domQuery('textarea[name=processDocumentation]', container);

      const documentation = getDocumentation(getProcess(participant))[0];

      // then
      expect(processDocumentationInput.value).to.eql(documentation.get('text'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const processDocumentationInput = domQuery('textarea[name=processDocumentation]', container);
      changeInput(processDocumentationInput, 'newValue');

      const documentation = getDocumentation(getProcess(participant));

      // then
      expect(documentation).to.have.length(1);
      expect(documentation[0].get('text')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1');
        const originalValue = getDocumentation(getProcess(participant))[0].get('text');

        await act(() => {
          selection.select(participant);
        });
        const processDocumentationInput = domQuery('textarea[name=processDocumentation]', container);
        changeInput(processDocumentationInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(processDocumentationInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getDocumentation(element) {
  return getBusinessObject(element).get('documentation');
}

function getProcess(participant) {
  return getBusinessObject(participant).get('processRef');
}