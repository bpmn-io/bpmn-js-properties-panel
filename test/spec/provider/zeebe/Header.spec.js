import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import {
  getHeaders
} from 'src/provider/zeebe/utils/HeadersUtil';

import diagramXML from './Header.bpmn';


describe('provider/bpmn - Header', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    debounceInput: false
  }));


  describe('bpmn:ServiceTask#header.key', function() {

    it('should NOT display for empty taskHeaders',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const headerGroup = getGroup(container, 'headers');
        const keyInput = domQuery('input[name=ServiceTask_empty-header-0-key]', headerGroup);

        // then
        expect(keyInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const headerGroup = getGroup(container, 'header');
      const keyInput = domQuery('input[name=ServiceTask_1-header-0-key]', headerGroup);

      // then
      expect(keyInput.value).to.eql(getHeader(serviceTask, 0).get('key'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const headerGroup = getGroup(container, 'headers');
      const keyInput = domQuery('input[name=ServiceTask_1-header-0-key]', headerGroup);
      changeInput(keyInput, 'newValue');

      // then
      expect(getHeader(serviceTask, 0).get('key')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getHeader(serviceTask, 0).get('key');

        await act(() => {
          selection.select(serviceTask);
        });
        const headerGroup = getGroup(container, 'headers');
        const keyInput = domQuery('input[name=ServiceTask_1-header-0-key]', headerGroup);
        changeInput(keyInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(keyInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:ServiceTask#header.value', function() {

    it('should NOT display for empty taskHeaders',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const headerGroup = getGroup(container, 'headers');
        const valueInput = domQuery('input[name=ServiceTask_empty-header-0-value]', headerGroup);

        // then
        expect(valueInput).to.not.exist;
      })
    );

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const headerGroup = getGroup(container, 'headers');
      const valueInput = domQuery('input[name=ServiceTask_1-header-0-value]', headerGroup);

      // then
      expect(valueInput.value).to.eql(getHeader(serviceTask, 0).get('value'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const headerGroup = getGroup(container, 'headers');
      const valueInput = domQuery('input[name=ServiceTask_1-header-0-value]', headerGroup);
      changeInput(valueInput, 'newValue');

      // then
      expect(getHeader(serviceTask, 0).get('value')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getHeader(serviceTask, 0).get('value');

        await act(() => {
          selection.select(serviceTask);
        });
        const valueInput = domQuery('input[name=ServiceTask_1-header-0-value]', container);
        changeInput(valueInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(valueInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getGroup(container, id) {
  return domQuery(`[data-group-id="group-${id}"`, container);
}

function getHeader(element, idx) {
  return (getHeaders(element) || [])[idx];
}

