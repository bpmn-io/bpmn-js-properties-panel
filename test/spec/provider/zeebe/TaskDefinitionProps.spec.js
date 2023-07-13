import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject,
  mouseEnter
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

import ZeebePropertiesProvider from 'src/provider/zeebe';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import diagramXML from './TaskDefinitionProps.bpmn';


describe('provider/zeebe - TaskDefinitionProps', function() {

  const testModules = [
    CoreModule, SelectionModule, ModelingModule,
    BpmnPropertiesPanel,
    ZeebePropertiesProvider
  ];

  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container, clock;

  beforeEach(function() {
    container = TestContainer.get(this);
    clock = sinon.useFakeTimers();
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));

  afterEach(function() {
    clock.restore();
  });

  function openTooltip() {
    return act(() => {
      const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
      mouseEnter(wrapper);
      clock.tick(200);
    });
  }


  describe('bpmn:ServiceTask#taskDefinition.type', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput).to.not.exist;
    }));


    it('should NOT display for businessRuleTask without taskDefinition', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('BusinessRuleTask_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput).to.not.exist;
    }));


    it('should display for businessRuleTask with taskDefinition', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('BusinessRuleTask_2');

      await act(() => {
        selection.select(task);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput).to.exist;
    }));


    it('should NOT display for scriptTask without taskDefinition', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('ScriptTask_1');

      await act(() => {
        selection.select(task);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput).to.not.exist;
    }));


    it('should display for scriptTask with taskDefinition', inject(async function(elementRegistry, selection) {

      // given
      const task = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(task);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput).to.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);

      // then
      expect(typeInput.value).to.eql(getTaskDefinition(serviceTask).get('type'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const typeInput = domQuery('input[name=taskDefinitionType]', container);
      changeInput(typeInput, 'newValue');

      // then
      expect(getTaskDefinition(serviceTask).get('type')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getTaskDefinition(serviceTask).get('type');

        await act(() => {
          selection.select(serviceTask);
        });
        const typeInput = domQuery('input[name=taskDefinitionType]', container);
        changeInput(typeInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(typeInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const typeInput = domQuery('input[name=taskDefinitionType]', container);
        changeInput(typeInput, 'newValue');

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing task definition',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noTaskDefinition');

        // assume
        expect(getTaskDefinition(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const typeInput = domQuery('input[name=taskDefinitionType]', container);
        changeInput(typeInput, 'newValue');

        // then
        expect(getTaskDefinition(serviceTask).get('type')).to.eql('newValue');
      })
    );


    it('should display correct documentation for ServiceTask', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      await openTooltip();

      const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);


      // then
      expect(documentationLinkGroup).to.exist;
      expect(documentationLinkGroup.title).to.equal('Service task documentation');
    }));


    it('should display correct documentation for BusinessRuleTask', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('BusinessRuleTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      await openTooltip();

      const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);

      // then
      expect(documentationLinkGroup).to.exist;
      expect(documentationLinkGroup.title).to.equal('Business rule task documentation');
    }));


    it('should display correct documentation for ScriptTask', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ScriptTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      await openTooltip();

      const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);

      // then
      expect(documentationLinkGroup).to.exist;
      expect(documentationLinkGroup.title).to.equal('Script task documentation');
    }));


    it('should display correct documentation for SendTask', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('SendTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      await openTooltip();

      const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);

      // then
      expect(documentationLinkGroup).to.exist;
      expect(documentationLinkGroup.title).to.equal('Send task documentation');
    }));

  });


  describe('bpmn:ServiceTask#taskDefinition.retries', function() {

    it('should NOT display for receive task', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);

      // then
      expect(retriesInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);

      // then
      expect(retriesInput.value).to.eql(getTaskDefinition(serviceTask).get('retries'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
      changeInput(retriesInput, 'newValue');

      // then
      expect(getTaskDefinition(serviceTask).get('retries')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');
        const originalValue = getTaskDefinition(serviceTask).get('retries');

        await act(() => {
          selection.select(serviceTask);
        });
        const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
        changeInput(retriesInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(retriesInput.value).to.eql(originalValue);
      })
    );


    it('should create non existing extension elements',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_empty');

        // assume
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.not.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
        changeInput(retriesInput, 'newValue');

        // then
        expect(getBusinessObject(serviceTask).get('extensionElements')).to.exist;
      })
    );


    it('should create non existing task definition',
      inject(async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_noTaskDefinition');

        // assume
        expect(getTaskDefinition(serviceTask)).not.to.exist;

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const retriesInput = domQuery('input[name=taskDefinitionRetries]', container);
        changeInput(retriesInput, 'newValue');

        // then
        expect(getTaskDefinition(serviceTask).get('retries')).to.eql('newValue');
      })
    );

  });

});


// helper //////////////////

function getTaskDefinition(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'zeebe:TaskDefinition')[0];
}
