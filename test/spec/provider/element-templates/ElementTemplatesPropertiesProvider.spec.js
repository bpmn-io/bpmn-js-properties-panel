import TestContainer from 'mocha-test-container-support';

import {
  act
} from '@testing-library/preact';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import coreModule from 'bpmn-js/lib/core';
import modelingModule from 'bpmn-js/lib/features/modeling';
import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import {
  bootstrapPropertiesPanel,
  clickInput as click,
  inject
} from 'test/TestHelper';

import BpmnPropertiesPanel from 'src/render';
import elementTemplatesModule from 'src/provider/element-templates';

import diagramXML from './ElementTemplates.bpmn';
import templates from './fixtures/simple.json';


describe('provider/element-templates - ElementTemplates', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    container,
    modules: [
      BpmnPropertiesPanel,
      coreModule,
      elementTemplatesModule,
      modelingModule
    ],
    moddleExtensions: {
      camunda: camundaModdlePackage
    },
    debounceInput: false,
    elementTemplates: templates
  }));


  describe('basics', function() {

    it('should display template group', inject(
      async function(elementRegistry, selection) {

        // given
        const element = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(element);
        });

        // then
        const group = domQuery('[data-group-id="group-template"]', container);

        expect(group).to.exist;
      })
    );
  });


  describe('template#select', function() {

    it('should fire `elementTemplates.select` when button is clicked template group', inject(
      async function(elementRegistry, selection, eventBus) {

        // given
        const spy = sinon.spy();
        const element = elementRegistry.get('Task_3');

        eventBus.on('elementTemplates.select', spy);

        await act(() => {
          selection.select(element);
        });
        const group = domQuery('[data-group-id="group-template"]', container);
        const selectButton = domQuery('.bio-properties-panel-select-template-button', group);

        // when
        await act(() => {
          selectButton.click();
        });

        // then
        expect(spy).to.have.been.calledOnce;
        expect(spy).to.have.been.calledWithMatch({ element });
      })
    );
  });


  describe('template#remove', function() {

    it('should remove applied template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('Task_1');
        await act(() => selection.select(task));

        // when
        await removeTemplate(container);

        // then
        task = elementRegistry.get('Task_1');
        const template = elementTemplates.get(task);

        expect(template).to.not.exist;
      })
    );


    it('should remove outdated template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('Task_2');
        await act(() => selection.select(task));

        // when
        await removeTemplate(container);

        // then
        task = elementRegistry.get('Task_2');
        const template = elementTemplates.get(task);

        expect(template).to.not.exist;
      })
    );


    it('should remove unknown template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('UnknownTemplateTask');
        await act(() => selection.select(task));

        // when
        await removeTemplate(container);

        // then
        task = elementRegistry.get('UnknownTemplateTask');
        const template = elementTemplates.get(task);

        expect(template).to.not.exist;
      })
    );

  });


  describe('template#unlink', function() {

    it('should unlink applied template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('Task_1');
        await act(() => selection.select(task));

        // when
        await unlinkTemplate(container);

        // then
        task = elementRegistry.get('Task_1');
        const template = elementTemplates.get(task);

        expect(template).to.not.exist;
      })
    );


    it('should unlink outdated template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('Task_2');
        await act(() => selection.select(task));

        // when
        await unlinkTemplate(container);

        // then
        task = elementRegistry.get('Task_2');
        const template = elementTemplates.get(task);

        expect(template).to.not.exist;
      })
    );


    it('should unlink unknown template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('UnknownTemplateTask');
        await act(() => selection.select(task));

        // when
        await unlinkTemplate(container);

        // then
        task = elementRegistry.get('UnknownTemplateTask');
        const template = elementTemplates.get(task);

        expect(template).to.not.exist;
      })
    );
  });


  describe('template#update', function() {

    it('should update template', inject(
      async function(elementRegistry, selection, elementTemplates) {

        // given
        let task = elementRegistry.get('Task_2');
        await act(() => selection.select(task));

        // when
        await updateTemplate(container);

        // then
        task = elementRegistry.get('Task_2');
        const template = elementTemplates.get(task);

        expect(template).to.have.property('id', 'foo');
        expect(template).to.have.property('version', 2);
      })
    );
  });
});



// helper ////

/**
 * Remove template via dropdown menu.
 *
 * @param {Element} container
 */
function removeTemplate(container) {
  return clickDropdownItemWhere(container,
    button => domQuery('.bio-properties-panel-remove-template', button));
}

/**
 * Unlink template via dropdown menu.
 *
 * @param {Element} container
 */
function unlinkTemplate(container) {
  return clickDropdownItemWhere(container, element => element.textContent === 'Unlink');
}

/**
 * Update template via dropdown menu.
 *
 * @param {Element} container
 */
function updateTemplate(container) {
  return clickDropdownItemWhere(container, element => element.textContent === 'Update');
}

/**
 * Click dropdown item matching the condition.
 *
 * @param {Element} container
 * @param {(button: Element) => boolean} predicate
 * @returns
 */
function clickDropdownItemWhere(container, predicate) {
  if (!container) {
    throw new Error('container is missing');
  }

  const buttons = domQueryAll('.bio-properties-panel-dropdown-button__menu-item', container);

  for (const button of buttons) {
    if (predicate(button)) {
      return click(button);
    }
  }

  throw new Error('button is missing');
}
