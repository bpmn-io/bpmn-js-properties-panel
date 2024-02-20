import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

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

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './UserTaskImplementationProps.bpmn';


describe('provider/zeebe - UserTaskImplementationProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    CoreModule,
    ModelingModule,
    SelectionModule,
    ZeebePropertiesProvider,
    BehaviorsModule
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


  describe('bpmn:UserTask#implementation', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('JobWorker');

      // when
      await act(() => {
        selection.select(userTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation).to.exist;
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask');

      // when
      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation).to.not.exist;
    }));


    it('should display zeebe user task', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('ZeebeUserTask');

      // when
      await act(() => {
        selection.select(userTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('zeebeUserTask');
    }));


    it('should display jobWorker', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('JobWorker');

      // when
      await act(() => {
        selection.select(userTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('jobWorker');
    }));


    it('should create zeebe:UserTask', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('JobWorker');

      await act(() => {
        selection.select(userTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'zeebeUserTask');

      // then
      const zeebeUserTask = getZeebeUserTask(userTask);
      expect(zeebeUserTask).to.exist;
    }));


    it('should remove zeebe:UserTask when set to jobWorker', inject(
      async function(elementRegistry, selection) {

        // given
        const userTask = elementRegistry.get('ZeebeUserTask');

        await act(() => {
          selection.select(userTask);
        });

        // when
        const implementationSelect = getImplementationSelect(container);
        changeInput(implementationSelect, 'jobWorker');

        // then
        const zeebeUserTask = getZeebeUserTask(userTask);
        expect(zeebeUserTask).to.not.exist;
      }
    ));


    it('should re-use extension elements', inject(async function(elementRegistry, selection) {

      // given
      const userTask = elementRegistry.get('JobWorkerWithFormDefinition');
      const businessObject = getBusinessObject(userTask);

      await act(() => {
        selection.select(userTask);
      });

      const implementation = getImplementationSelect(container);

      // assume
      expect(getExtensionElementsList(businessObject)).to.have.length(1);

      // when
      changeInput(implementation, 'zeebeUserTask');

      // then
      expect(getExtensionElementsList(businessObject)).to.have.length(2);
    }));


    it('should undo', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const userTask = elementRegistry.get('JobWorker');

      await act(() => {
        selection.select(userTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'zeebeUserTask');
      changeInput(implementation, 'jobWorker');

      await act(() => {
        commandStack.undo();
      });

      // then
      expect(implementation.value).to.eql('zeebeUserTask');
    }));
  });

});


// helper /////////////////

function getImplementationSelect(container) {
  return domQuery('select[name=userTaskImplementation]', container);
}

function getZeebeUserTask(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:UserTask')[0];
}
