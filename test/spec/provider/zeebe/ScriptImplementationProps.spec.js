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

import diagramXML from './ScriptImplementationProps.bpmn';


const GROUP_SELECTOR = '[data-group-id="group-scriptImplementation"]';
const IMPLEMENTATION_SELECTOR = 'select[name=scriptImplementation]';


describe('provider/zeebe - ScriptImplementationProps', function() {

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


  describe('bpmn:ScriptTask#implementation', function() {

    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation).to.exist;
    }));


    it('should not display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      // when
      await act(() => {
        selection.select(serviceTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation).to.not.exist;
    }));


    it('should display default', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('');

      // and also
      return expectEdited(container, false);
    }));


    it('should display script', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_2');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('script');

      // and also
      return expectEdited(container, true);
    }));


    it('should display jobWorker', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_3');

      // when
      await act(() => {
        selection.select(scriptTask);
      });

      // then
      const implementation = getImplementationSelect(container);
      expect(implementation.value).to.equal('jobWorker');

      // and also
      return expectEdited(container, true);
    }));


    it('should not have taskDefinition or script', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      // when
      const implementation = getImplementationSelect(container);

      // then
      expect(implementation.value).to.eql('');

      const taskDefinition = getTaskDefinition(scriptTask);
      expect(taskDefinition).to.not.exist;

      const script = getScript(scriptTask);
      expect(script).to.not.exist;
    }));


    it('should create taskDefinition', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'jobWorker');

      // then
      const taskDefinition = getTaskDefinition(scriptTask);
      expect(taskDefinition).to.exist;
    }));


    it('should create script', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(scriptTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'script');

      // then
      const script = getScript(scriptTask);
      expect(script).to.exist;
    }));


    it('should re-use extension elements', inject(async function(elementRegistry, selection) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_3');
      const businessObject = getBusinessObject(scriptTask);

      await act(() => {
        selection.select(scriptTask);
      });

      const implementation = getImplementationSelect(container);

      // assume
      expect(getExtensionElementsList(businessObject)).to.have.length(2);

      // when
      changeInput(implementation, 'script');

      // then
      expect(getExtensionElementsList(businessObject)).to.have.length(1);
    }));


    it('should undo', inject(async function(elementRegistry, selection, commandStack) {

      // given
      const scriptTask = elementRegistry.get('ScriptTask_3');

      await act(() => {
        selection.select(scriptTask);
      });

      const implementation = getImplementationSelect(container);

      // when
      changeInput(implementation, 'script');
      changeInput(implementation, 'jobWorker');

      await act(() => {
        commandStack.undo();
      });

      // then
      expect(implementation.value).to.eql('script');
    }));


    describe('integration', function() {

      it('should remove task definition and task headers when adding script', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_3');

        await act(() => selection.select(scriptTask));

        // assume
        expect(getTaskDefinition(scriptTask)).to.exist;
        expect(getTaskHeaders(scriptTask)).to.exist;

        // when
        const implementationSelect = getImplementationSelect(container);

        changeInput(implementationSelect, 'script');

        // then
        expect(getTaskDefinition(scriptTask)).not.to.exist;
        expect(getTaskHeaders(scriptTask)).not.to.exist;

        expect(getScript(scriptTask)).to.exist;
      }));


      it('should remove script when adding task definition', inject(async function(elementRegistry, selection) {

        // given
        const scriptTask = elementRegistry.get('ScriptTask_2');

        await act(() => selection.select(scriptTask));

        // assume
        expect(getScript(scriptTask)).to.exist;

        // when
        const implementationSelect = getImplementationSelect(container);

        changeInput(implementationSelect, 'jobWorker');

        // then
        expect(getScript(scriptTask)).not.to.exist;

        expect(getTaskDefinition(scriptTask)).to.exist;
      }));

    });

  });

});


// helper /////////////////

async function expectEdited(container, exists) {
  await new Promise(resolve => {
    setTimeout(resolve, 0);
  });

  const indicator = domQuery(`${GROUP_SELECTOR} .bio-properties-panel-dot`, container);

  if (exists) {
    expect(indicator).to.exist;
  } else {
    expect(indicator).not.to.exist;
  }
}

function getImplementationSelect(container) {
  return domQuery(IMPLEMENTATION_SELECTOR, container);
}

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}

function getScript(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:Script')[0];
}

function getTaskHeaders(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskHeaders')[ 0 ];
}
