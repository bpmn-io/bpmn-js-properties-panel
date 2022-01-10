import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { getExtensionElementsList } from 'src/utils/ExtensionElementsUtil';

import {
  EMPTY_OPTION,
  CREATE_NEW_OPTION
} from 'src/provider/camunda-platform/properties/Error';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './ErrorsProps.bpmn';


describe('provider/camunda-platform - Error', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule
  ];

  const moddleExtensions = {
    camunda: camundaModdleExtensions
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


  describe('bpmn:ServiceTask#expression', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = getExpressionInput(container, 'Task');

      // then
      expect(input).to.not.exist;
    }));


    it('should NOT display - no errorRef', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_External');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getExpressionInput(container, 'ServiceTask_External');

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getExpressionInput(container, 'ServiceTask_ErrorEventDefinition');

      // then
      expect(input.value).to.eql(getErrorEventDefinition(serviceTask).get('camunda:expression'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getExpressionInput(container, 'ServiceTask_ErrorEventDefinition');

      changeInput(input, 'newValue');

      // then
      expect(getErrorEventDefinition(serviceTask).get('camunda:expression')).to.eql('newValue');

      expect(input.value).to.eql('newValue');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

      const originalValue = getErrorEventDefinition(serviceTask).get('camunda:expression');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = getExpressionInput(container, 'ServiceTask_ErrorEventDefinition');

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getErrorEventDefinition(serviceTask).get('camunda:expression')).to.eql(originalValue);

      expect(input.value).to.eql(originalValue);
    }));

  });


  describe('bpmn:ServiceTask#errorRef', function() {

    it('should NOT display',inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_External');

      // when
      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const select = getErrorRefSelect(container, 'ServiceTask_External');

      expect(select).to.be.null;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      // when
      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const select = getErrorRefSelect(container, 'ServiceTask_Error');

      // then
      expect(select.value).to.eql(getErrorEventDefinition(serviceTask).get('errorRef').get('id'));
    }));


    it('should display select options in correct order', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const select = getErrorRefSelect(container, 'ServiceTask_Error');

      // then
      expect(asOptionNamesList(select)).to.eql([
        '<none>',
        'Create new ...',
        'Error_3',
        'myBusinessException',
        'myOtherBusinessException'
      ]);
    }));


    describe('update', function() {

      describe('<none> to error', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = getErrorRefSelect(container, 'ServiceTask_ErrorEventDefinition');

          changeInput(select, 'Error_1');

          // then
          expect(getErrorEventDefinition(serviceTask).get('errorRef').get('id')).to.eql('Error_1');

          expect(select.value).to.eql('Error_1');
        }));


        it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

          await act(() => {
            selection.select(serviceTask);
          });

          const select = getErrorRefSelect(container, 'ServiceTask_ErrorEventDefinition');

          changeInput(select, 'Error_1');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getErrorEventDefinition(serviceTask).get('errorRef')).not.to.exist;

          expect(select.value).to.eql(EMPTY_OPTION);
        }));

      });


      describe('error to error', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_Error');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = getErrorRefSelect(container, 'ServiceTask_Error');

          changeInput(select, 'Error_2');

          // then
          expect(getErrorEventDefinition(serviceTask).get('errorRef').get('id')).to.eql('Error_2');

          expect(select.value).to.eql('Error_2');
        }));


        it('should update on external change', inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_Error');

          await act(() => {
            selection.select(serviceTask);
          });

          const select = getErrorRefSelect(container, 'ServiceTask_Error');

          changeInput(select, 'Error_2');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(getErrorEventDefinition(serviceTask).get('errorRef').get('id')).to.eql('Error_1');

          expect(select.value).to.eql('Error_1');
        }));

      });

    });


    it('should create new error', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorEventDefinition');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getErrorEventDefinition(serviceTask).get('errorRef')).not.to.exist;

      // when
      const select = getErrorRefSelect(container, 'ServiceTask_ErrorEventDefinition');

      changeInput(select, CREATE_NEW_OPTION);

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef')).to.exist;

      expect(select.value).to.eql(getErrorEventDefinition(serviceTask).get('errorRef').get('id'));
    }));


    it('should remove error reference', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      await act(() => {
        selection.select(serviceTask);
      });

      // assume
      expect(getErrorEventDefinition(serviceTask).get('errorRef')).to.exist;

      // when
      const select = getErrorRefSelect(container, 'ServiceTask_Error');

      changeInput(select, EMPTY_OPTION);

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef')).not.to.exist;

      expect(select.value).to.eql(EMPTY_OPTION);
    }));

  });


  describe('bpmn:ServiceTask#name', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = getErrorNameInput(container, 'Task');

      // then
      expect(input).to.not.exist;
    }));


    it('should NOT display - no errorRef', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_External');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorNameInput(container, 'ServiceTask_External');

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorNameInput(container, 'ServiceTask_Error');

      // then
      expect(input.value).to.eql(getErrorEventDefinition(serviceTask).get('errorRef').get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorNameInput(container, 'ServiceTask_Error');

      changeInput(input, 'newValue');

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef').get('name')).to.eql('newValue');

      expect(input.value).to.eql('newValue');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      const originalValue = getErrorEventDefinition(serviceTask).get('errorRef').get('name');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = getErrorNameInput(container, 'ServiceTask_Error');

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef').get('name')).to.eql(originalValue);

      expect(input.value).to.eql(originalValue);
    }));

  });


  describe('bpmn:ServiceTask#errorCode', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = getErrorCodeInput(container, 'Task');

      // then
      expect(input).to.not.exist;
    }));


    it('should NOT display - no errorRef', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_External');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorCodeInput(container, 'ServiceTask_External');

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorCode');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorCodeInput(container, 'ServiceTask_ErrorCode');

      // then
      expect(input.value).to.eql(getErrorEventDefinition(serviceTask).get('errorRef').get('errorCode'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorCode');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorCodeInput(container, 'ServiceTask_ErrorCode');

      changeInput(input, 'newValue');

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef').get('errorCode')).to.eql('newValue');

      expect(input.value).to.eql('newValue');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_ErrorCode');

      const originalValue = getErrorEventDefinition(serviceTask).get('errorRef').get('errorCode');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = getErrorCodeInput(container, 'ServiceTask_ErrorCode');

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef').get('errorCode')).to.eql(originalValue);

      expect(input.value).to.eql(originalValue);
    }));

  });


  describe('bpmn:ServiceTask#errorMessage', function() {

    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('Task');

      await act(() => {
        selection.select(task);
      });

      // when
      const input = getErrorMessageInput(container, 'Task');

      // then
      expect(input).to.not.exist;
    }));


    it('should NOT display - no errorRef', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_External');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorMessageInput(container, 'ServiceTask_External');

      // then
      expect(input).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorMessageInput(container, 'ServiceTask_Error');

      // then
      expect(input.value).to.eql(getErrorEventDefinition(serviceTask).get('errorRef').get('camunda:errorMessage'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const input = getErrorMessageInput(container, 'ServiceTask_Error');

      changeInput(input, 'newValue');

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef').get('camunda:errorMessage')).to.eql('newValue');

      expect(input.value).to.eql('newValue');
    }));


    it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_Error');

      const originalValue = getErrorEventDefinition(serviceTask).get('errorRef').get('camunda:errorMessage');

      await act(() => {
        selection.select(serviceTask);
      });

      const input = getErrorMessageInput(container, 'ServiceTask_Error');

      changeInput(input, 'newValue');

      // when
      await act(() => {
        commandStack.undo();
      });

      // then
      expect(getErrorEventDefinition(serviceTask).get('errorRef').get('camunda:errorMessage')).to.eql(originalValue);

      expect(input.value).to.eql(originalValue);
    }));

  });

});

// helpers //////////

function getErrorEventDefinition(element, index = 0) {
  const businessObject = getBusinessObject(element),
        errorEventDefinitions = getExtensionElementsList(businessObject, 'camunda:ErrorEventDefinition');

  const errorEventDefinition = errorEventDefinitions[ index ];

  return errorEventDefinition;
}

function getErrorRefSelect(container, elementId, index = 0) {
  return domQuery(`#bio-properties-panel-${ elementId }-error-${ index }-errorRef`, container);
}

function getErrorNameInput(container, elementId, index = 0) {
  return domQuery(`#bio-properties-panel-${ elementId }-error-${ index }-errorName`, container);
}

function getErrorCodeInput(container, elementId, index = 0) {
  return domQuery(`#bio-properties-panel-${ elementId }-error-${ index }-errorCode`, container);
}

function getErrorMessageInput(container, elementId, index = 0) {
  return domQuery(`#bio-properties-panel-${ elementId }-error-${ index }-errorMessage`, container);
}

function getExpressionInput(container, elementId, index = 0) {
  return domQuery(`#bio-properties-panel-${ elementId }-error-${ index }-expression`, container);
}

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}