import TestContainer from 'mocha-test-container-support';

import {
  bootstrapPropertiesPanel,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  act
} from '@testing-library/preact';

import { query as domQuery } from 'min-dom';

import {
  findExtension,
  findInputParameter
} from '../../../../../src/provider/element-templates/Helper';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import BpmnPropertiesPanel from 'src/render';
import elementTemplatesModule from 'src/provider/element-templates';

import diagramXML from './InputProperties.bpmn';
import elementTemplates from './InputProperties.json';


describe('provider/element-templates - InputProperties', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    container,
    debounceInput: false,
    elementTemplates,
    moddleExtensions: {
      camunda: camundaModdlePackage
    },
    modules: [
      BpmnPropertiesPanel,
      coreModule,
      elementTemplatesModule,
      modelingModule
    ]
  }));


  it('should not display add button', async function() {

    // when
    await expectSelected('SimpleTask');

    // then
    const group = domQuery('[data-group-id=\'group-CamundaPlatform__Input\']', container),
          button = domQuery('.bio-properties-panel-add-entry', group);

    expect(button).not.to.exist;
  });


  it('should not display remove button', async function() {

    // when
    await expectSelected('SimpleTask');

    // then
    const group = domQuery('[data-group-id=\'group-CamundaPlatform__Input\']', container),
          button = domQuery('.bio-properties-panel-remove-entry', group);

    expect(button).not.to.exist;
  });


  describe('label', function() {

    it('should display label as label', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-inputParameter-0', container);

      expect(entry).to.exist;

      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', entry);

      expect(label).to.exist;
      expect(label.innerText).to.equal('recipient');
    });


    it('should display binding name as label', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-inputParameter-1', container);

      expect(entry).to.exist;

      const label = domQuery('.bio-properties-panel-collapsible-entry-header-title', entry);

      expect(label).to.exist;
      expect(label.innerText).to.equal('noLabel');
    });

  });


  describe('name entry', function() {

    it('should not display name entry', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-inputParameter-1-name', container);

      expect(entry).not.to.exist;
    });

  });


  describe('description entry', function() {

    it('should display description entry', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-inputParameter-2', container);

      expect(entry).to.exist;

      const description = findEntry('SimpleTask-inputParameter-2-description', entry);

      expect(description).to.exist;
      expect(description.innerText).to.equal('foo bar');
    });

  });


  describe('local variable assignment entry', function() {

    describe('toggle on', function() {

      let input;

      beforeEach(async function() {
        await expectSelected('SimpleTask');

        expandGroup('group-CamundaPlatform__Input', container);

        expandCollapsibleEntry('SimpleTask-inputParameter-4', container);

        const entry = findEntry('SimpleTask-inputParameter-4-local-variable-assignment', container);

        input = findInput('checkbox', entry);

        // assume
        expect(input.checked).to.be.false;
      });


      it('should <do>', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'notCreated' });

        expect(inputParameter).to.exist;
        expect(inputParameter.get('camunda:name')).to.equal('notCreated');
        expect(inputParameter.get('camunda:value')).to.equal('${foo}');
      }));


      it('should <undo>', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'notCreated' });

        expect(inputParameter).not.to.exist;
      }));


      it('should <redo>', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'notCreated' });

        expect(inputParameter).to.exist;
        expect(inputParameter.get('camunda:name')).to.equal('notCreated');
        expect(inputParameter.get('camunda:value')).to.equal('${foo}');
      }));

    });


    describe('toggle off', function() {

      let input;

      beforeEach(async function() {
        await expectSelected('SimpleTask');

        expandGroup('group-CamundaPlatform__Input', container);

        expandCollapsibleEntry('SimpleTask-inputParameter-0', container);

        const entry = findEntry('SimpleTask-inputParameter-0-local-variable-assignment', container);

        input = findInput('checkbox', entry);

        // assume
        expect(input.checked).to.be.true;
      });


      it('should <do>', inject(function(elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'recipient' });

        expect(inputParameter).not.to.exist;
      }));


      it('should <undo>', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'recipient' });

        expect(inputParameter).to.exist;
        expect(inputParameter.get('camunda:name')).to.equal('recipient');
        expect(inputParameter.get('camunda:value')).to.equal('recipient');
      }));


      it('should <redo>', inject(function(commandStack, elementRegistry) {

        // given
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'recipient' });

        expect(inputParameter).not.to.exist;
      }));

    });

  });


  describe('entries', function() {

    it('should display other entries', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const typeEntry = findEntry('SimpleTask-inputParameter-0-type', container),
            stringOrExpressionEntry = findEntry('SimpleTask-inputParameter-0-stringOrExpression', container);

      expect(typeEntry).to.exist;
      expect(stringOrExpressionEntry).to.exist;
    });

  });

});


// helpers //////////

function expectSelected(id) {
  return getBpmnJS().invoke(async function(elementRegistry, selection) {
    const element = elementRegistry.get(id);

    await act(() => {
      selection.select(element);
    });

    return element;
  });
}

function expandGroup(id, container) {
  const header = domQuery(`[data-group-id='${ id }'] .bio-properties-panel-group-header`, container);

  header.click();
}

function expandCollapsibleEntry(id, container) {
  const header = domQuery(`[data-entry-id='${ id }'] .bio-properties-panel-collapsible-entry-header`, container);

  header.click();
}

function findEntry(id, container) {
  return domQuery(`[data-entry-id='${ id }']`, container);
}

function findInput(type, container) {
  return domQuery(`input[type='${ type }']`, container);
}