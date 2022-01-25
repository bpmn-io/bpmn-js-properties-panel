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

const INPUT_GROUP_ID = 'group-ElementTemplates__Input';


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
    const group = findInputGroup(container),
          button = domQuery('.bio-properties-panel-add-entry', group);

    expect(button).not.to.exist;
  });


  it('should not display remove button', async function() {

    // when
    await expectSelected('SimpleTask');

    // then
    const group = findInputGroup(container),
          button = domQuery('.bio-properties-panel-remove-entry', group);

    expect(button).not.to.exist;
  });


  it('should display even if all properties are toggled off', async function() {

    // when
    await expectSelected('SimpleTaskWithoutInputOutput');

    // then
    const group = findInputGroup(container);

    expect(group).to.exist;
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


    it('should render HTML description', async function() {

      // when
      await expectSelected('SimpleTask');

      // then
      const entry = findEntry('SimpleTask-inputParameter-5', container);

      expect(entry).to.exist;

      const description = findEntry('SimpleTask-inputParameter-5-description', entry);

      expect(description).to.exist;
      expect(description.innerHTML).to.eql(
        '<div class="bio-properties-panel-description">' +
          '<div class="markup">' +
            '<div xmlns="http://www.w3.org/1999/xhtml">' +
              'By the way, you can use ' +
              '<a href="https://freemarker.apache.org/" target="_blank" rel="noopener">freemarker templates</a> ' +
              'here' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    });

  });


  describe('local variable assignment entry', function() {

    describe('toggle on', function() {

      let input;

      async function setup(elementId, propertyIndex) {
        await expectSelected(elementId);

        expandGroup(INPUT_GROUP_ID, container);

        expandCollapsibleEntry(`${elementId}-inputParameter-${propertyIndex}`, container);

        const entry = findEntry(
          `${elementId}-inputParameter-${propertyIndex}-local-variable-assignment`, container);

        input = findInput('checkbox', entry);

        // assume
        expect(input.checked).to.be.false;
      }


      it('should <do>', inject(async function(elementRegistry) {

        // given
        await setup('SimpleTask', 4);
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


      it('should <undo>', inject(async function(commandStack, elementRegistry) {

        // given
        await setup('SimpleTask', 4);
        const task = elementRegistry.get('SimpleTask');

        input.click();

        // when
        commandStack.undo();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'notCreated' });

        expect(inputParameter).not.to.exist;
      }));


      it('should <redo>', inject(async function(commandStack, elementRegistry) {

        // given
        await setup('SimpleTask', 4);
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


      it('should work if inputOutput is missing', inject(async function(elementRegistry) {

        // given
        await setup('SimpleTaskWithoutInputOutput', 4);
        const task = elementRegistry.get('SimpleTaskWithoutInputOutput');

        // when
        input.click();

        // then
        const inputOutput = findExtension(task, 'camunda:InputOutput'),
              inputParameter = findInputParameter(inputOutput, { name: 'notCreated' });

        expect(inputParameter).to.exist;
        expect(inputParameter.get('camunda:name')).to.equal('notCreated');
        expect(inputParameter.get('camunda:value')).to.equal('${foo}');
      }));


      it('should work if extension elements are missing', inject(async function(elementRegistry) {

        // given
        await setup('SimpleTaskWithoutExtensionElements', 4);
        const task = elementRegistry.get('SimpleTaskWithoutExtensionElements');

        // when
        input.click();

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

        expandGroup(INPUT_GROUP_ID, container);

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

function findInputGroup(container) {
  return domQuery(`[data-group-id='${INPUT_GROUP_ID}']`, container);
}
