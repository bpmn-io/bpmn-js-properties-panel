import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import {
  bootstrapPropertiesPanel,
  inject
} from 'test/TestHelper';

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

import collaborationDiagramXML from './ProcessVariablesProps-collaboration.bpmn';
import processDiagramXML from './ProcessVariablesProps-process.bpmn';


describe('provider/camunda-platform - ProcessVariableProps', function() {

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


  describe('bpmn:Process', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should display items', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);

      // then
      expect(items.length).to.equal(3);
    }));


    it('should display items alphanumeric', inject(
      async function(elementRegistry, selection) {

        // given
        const process = elementRegistry.get('Process_1');

        await act(() => {
          selection.select(process);
        });

        const group = findProcessVariablesGroup(container);

        // when
        const list = domQuery('.bio-properties-panel-list', group);
        const ordering = getListOrdering(list);

        // then
        expect(ordering).to.eql([
          'variable1',
          'variable2',
          'variable3'
        ]);
      }
    ));


    it('should display item title', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const headerTitle = domQuery('.bio-properties-panel-collapsible-entry-header-title', items[0]);

      // then
      expect(headerTitle.innerText).to.eql('variable1');
    }));


    it('should display createdIn (name)', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(process);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const createdIn = domQuery('#bio-properties-panel-Process_1-variable-0-createdIn', items[0]);

      // then
      expect(createdIn.innerText).to.eql(getBusinessObject(task).get('name'));
    }));


    it('should display createdIn (id)', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');
      const task = elementRegistry.get('Task_3');

      await act(() => {
        selection.select(process);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const createdIn = domQuery('#bio-properties-panel-Process_1-variable-2-createdIn', items[2]);

      // then
      expect(createdIn.innerText).to.equal(task.id);
    }));


    it('should NOT display scope', inject(async function(elementRegistry, selection) {

      // given
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(process);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const scope = domQuery('#bio-properties-panel-Process_1-variable-0-scope', items[0]);

      // then
      expect(scope).to.not.exist;
    }));

  });


  describe('bpmn:Participant', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(collaborationDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should display items', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);

      // then
      expect(items.length).to.equal(3);
    }));


    it('should display items alphanumeric', inject(
      async function(elementRegistry, selection) {

        // given
        const participant = elementRegistry.get('Participant_1');

        await act(() => {
          selection.select(participant);
        });

        const group = findProcessVariablesGroup(container);

        // when
        const list = domQuery('.bio-properties-panel-list', group);
        const ordering = getListOrdering(list);

        // then
        expect(ordering).to.eql([
          'variable1',
          'variable2',
          'variable3'
        ]);
      }
    ));


    it('should display item title', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const headerTitle = domQuery('.bio-properties-panel-collapsible-entry-header-title', items[0]);

      // then
      expect(headerTitle.innerText).to.eql('variable1');
    }));


    it('should display createdIn (name)', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');
      const task = elementRegistry.get('Task_1');

      await act(() => {
        selection.select(participant);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const createdIn = domQuery('#bio-properties-panel-Participant_1-variable-0-createdIn', items[0]);

      // then
      expect(createdIn.innerText).to.eql(getBusinessObject(task).get('name'));
    }));


    it('should display createdIn (id)', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');
      const task = elementRegistry.get('Task_3');

      await act(() => {
        selection.select(participant);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const createdIn = domQuery('#bio-properties-panel-Participant_1-variable-2-createdIn', items[2]);

      // then
      expect(createdIn.innerText).to.equal(task.id);
    }));


    it('should NOT display scope', inject(async function(elementRegistry, selection) {

      // given
      const participant = elementRegistry.get('Participant_1');

      await act(() => {
        selection.select(participant);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const scope = domQuery('#bio-properties-panel-Participant_1-variable-0-scope', items[0]);

      // then
      expect(scope).to.not.exist;
    }));

  });


  describe('bpmn:SubProcess - multiple scopes', function() {

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(bootstrapPropertiesPanel(processDiagramXML, {
      modules: testModules,
      moddleExtensions,
      debounceInput: false
    }));


    it('should display items', inject(async function(elementRegistry, selection) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);

      // then
      expect(items.length).to.equal(4);
    }));


    it('should display items for plane', inject(async function(elementRegistry, selection, canvas) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1_plane');
      canvas.setRootElement(subProcess);

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);

      // then
      expect(items.length).to.equal(4);
    }));


    it('should group by scope', inject(
      async function(elementRegistry, selection) {

        // given
        const subProcess = elementRegistry.get('SubProcess_1');

        await act(() => {
          selection.select(subProcess);
        });

        const group = findProcessVariablesGroup(container);

        // when
        const list = domQuery('.bio-properties-panel-list', group);
        const ordering = getListOrdering(list);

        // then
        expect(ordering).to.eql([
          'variable4',
          'variable1',
          'variable2',
          'variable3'
        ]);
      }
    ));


    it('should display item title', inject(async function(elementRegistry, selection) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const headerTitle = domQuery('.bio-properties-panel-collapsible-entry-header-title', items[0]);

      // then
      expect(headerTitle.innerText).to.eql('variable4');
    }));


    it('should display createdIn (name)', inject(async function(elementRegistry, selection) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');
      const task = elementRegistry.get('Task_2');

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const createdIn = domQuery('#bio-properties-panel-SubProcess_1-variable-0-createdIn', items[0]);

      // then
      expect(createdIn.innerText).to.equal(getBusinessObject(task).get('name'));
    }));


    it('should display createdIn (id)', inject(async function(elementRegistry, selection) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');
      const task = elementRegistry.get('Task_3');

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const createdIn = domQuery('#bio-properties-panel-SubProcess_1-variable-3-createdIn', items[3]);

      // then
      expect(createdIn.innerText).to.equal(task.id);
    }));


    it('should display scope (name)', inject(async function(elementRegistry, selection) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const scope = domQuery('#bio-properties-panel-SubProcess_1-variable-0-scope', items[0]);

      // then
      expect(scope.innerText).to.equal(getBusinessObject(subProcess).get('name'));
    }));


    it('should display scope (id)', inject(async function(elementRegistry, selection) {

      // given
      const subProcess = elementRegistry.get('SubProcess_1');
      const process = elementRegistry.get('Process_1');

      await act(() => {
        selection.select(subProcess);
      });

      const group = findProcessVariablesGroup(container);

      // when
      const items = getProcessVariablesItems(group);
      const scope = domQuery('#bio-properties-panel-SubProcess_1-variable-1-scope', items[1]);

      // then
      expect(scope.innerText).to.equal(process.id);
    }));

  });

});


// helper ////////////////////

function findProcessVariablesGroup(container) {
  return domQuery('[data-group-id="group-CamundaPlatform__ProcessVariables"', container);
}

function getProcessVariablesItems(container) {
  return domQueryAll('div[data-entry-id*="-variable-"].bio-properties-panel-collapsible-entry', container);
}

function getListOrdering(list) {
  let ordering = [];

  const items = domQueryAll('.bio-properties-panel-list-item', list);

  items.forEach(item => {
    const collapsible = domQuery('.bio-properties-panel-collapsible-entry', item);

    ordering.push(
      domQuery(
        '.bio-properties-panel-collapsible-entry-header-title',
        collapsible
      ).innerText
    );
  });

  return ordering;
}