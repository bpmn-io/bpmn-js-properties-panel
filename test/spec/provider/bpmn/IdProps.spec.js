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

import diagramXML from './IdProps.bpmn';

describe('provider/bpmn - IdProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
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


  describe('bpmn:Task#id', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const idInput = domQuery('input[name=id]', container);

      // then
      expect(idInput.value).to.eql(getBusinessObject(task).get('id'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const idInput = domQuery('input[name=id]', container);
      changeInput(idInput, 'NewID');

      // then
      expect(getBusinessObject(task).get('id')).to.eql('NewID');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const task = elementRegistry.get('Task_1');
        const originalValue = getBusinessObject(task).get('id');

        await act(() => {
          selection.select(task);
        });
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, 'NewID');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(idInput.value).to.eql(originalValue);
      })
    );


    describe('validation', function() {

      it('should set invalid', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, '');
        await act(() => {});

        // then
        const error = domQuery('.bio-properties-panel-error', container);
        expect(error).to.exist;
      }));


      it('should NOT remove id', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, '');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));


      it('should NOT set existing id', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, 'Task_2');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));


      it('should NOT set with spaces', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, 'foo bar');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));


      it('should NOT set invalid QName', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, '::foo');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));


      it('should NOT set prefix', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, 'foo:Task_1');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));


      it('should NOT set invalid HTML characters', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, '<foo>');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));


      it('should NOT set expression', inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        await act(() => {
          selection.select(task);
        });

        // when
        const idInput = domQuery('input[name=id]', container);
        changeInput(idInput, '${foo}');

        // then
        expect(getBusinessObject(task).get('id')).to.eql('Task_1');
      }));

    });

  });

});