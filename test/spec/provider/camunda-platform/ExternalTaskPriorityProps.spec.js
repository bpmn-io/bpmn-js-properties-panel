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

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  getServiceTaskLikeBusinessObject
} from 'src/provider/camunda-platform/utils/ImplementationTypeUtils';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import processDiagramXML from './ExternalTaskPriority-Process.bpmn';
import collaborationDiagramXML from './ExternalTaskPriority-Collaboration.bpmn';


describe('provider/camunda-platform - ExternalTaskPriorityProps', function() {

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


  describe('bpmn:ServiceTask#taskPriority', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_2');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // then
      expect(externalTaskPriorityInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // then
      expect(externalTaskPriorityInput).to.exist;
      expect(externalTaskPriorityInput.value).to.equal(getTaskPriority(serviceTask));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      await act(() => {
        selection.select(serviceTask);
      });

      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // when
      changeInput(externalTaskPriorityInput, '99');

      // then
      expect(getTaskPriority(serviceTask)).to.equal('99');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1'),
              originalValue = getTaskPriority(serviceTask);

        await act(() => {
          selection.select(serviceTask);
        });

        const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);
        changeInput(externalTaskPriorityInput, '99');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(externalTaskPriorityInput.value).to.eql(originalValue);
      })
    );

  });


  describe('camunda:ServiceTaskLike#taskPriority', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const messageThrowEvent = elementRegistry.get('MessageThrowEvent_1');

      await act(() => {
        selection.select(messageThrowEvent);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // then
      expect(externalTaskPriorityInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

      await act(() => {
        selection.select(messageThrowEvent);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // then
      expect(externalTaskPriorityInput).to.exist;
      expect(externalTaskPriorityInput.value).to.equal(getTaskPriority(messageThrowEvent));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

      await act(() => {
        selection.select(messageThrowEvent);
      });

      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // when
      changeInput(externalTaskPriorityInput, '99');

      // then
      expect(getTaskPriority(messageThrowEvent)).to.equal('99');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2'),
              originalValue = getTaskPriority(messageThrowEvent);

        await act(() => {
          selection.select(messageThrowEvent);
        });

        const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);
        changeInput(externalTaskPriorityInput, '99');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(externalTaskPriorityInput.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:Participant#processRef.camunda:taskPriority', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(collaborationDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should NOT display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_2');

      await act(() => {
        selection.select(participant);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // then
      expect(externalTaskPriorityInput).to.not.exist;
    }));


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);

      // then
      expect(externalTaskPriorityInput.value).to.eql(getTaskPriority(participant));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      // when
      const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);
      changeInput(externalTaskPriorityInput, '22');

      // then
      expect(getTaskPriority(participant)).to.eql('22');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const participant = elementRegistry.get('Participant_1'),
              originalValue = getTaskPriority(participant);

        await act(() => {
          selection.select(participant);
        });

        const externalTaskPriorityInput = domQuery('input[name=externalTaskPriority]', container);
        changeInput(externalTaskPriorityInput, '22');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(externalTaskPriorityInput.value).to.eql(originalValue);
      })
    );

  });

});


// helper //////////////////

function getTaskPriority(element) {
  let businessObject;

  if (is(element, 'bpmn:Participant')) {
    businessObject = getBusinessObject(element).get('processRef');
  } else if (isExternalTaskLike(element)) {
    businessObject = getServiceTaskLikeBusinessObject(element);
  } else {
    businessObject = getBusinessObject(element);
  }

  return businessObject.get('camunda:taskPriority');
}

function isExternalTaskLike(element) {
  const bo = getServiceTaskLikeBusinessObject(element),
        type = bo && bo.get('camunda:type');

  return is(bo, 'camunda:ServiceTaskLike') && type && type === 'external';
}
