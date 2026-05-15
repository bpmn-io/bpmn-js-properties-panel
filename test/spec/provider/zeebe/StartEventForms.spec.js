import { expect } from 'chai';
import TestContainer from 'mocha-test-container-support';

import * as sinon from 'sinon';

import {
  act
} from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject,
  mouseEnter,
  TOOLTIP_OPEN_DELAY
} from 'test/TestHelper';

import {
  query as domQuery,
} from 'min-dom';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil.js';

import {
  FORM_TYPES,
  getFormDefinition,
  getRootElement,
  getUserTaskForm
} from 'src/provider/zeebe/utils/FormUtil.js';

import BpmnPropertiesPanel from 'src/render';
import CoreModule from 'bpmn-js/lib/core';
import ModelingModule from 'bpmn-js/lib/features/modeling';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZeebePropertiesProvider from 'src/provider/zeebe';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import TooltipProvider from 'src/contextProvider/zeebe/TooltipProvider';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import diagramXML from './StartEventForms.bpmn';


describe('provider/zeebe - StartEventForms', function() {

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

  let container, clock;

  beforeEach(function() {
    container = TestContainer.get(this);
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    clock.restore();
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    moddleExtensions,
    propertiesPanel: {
      tooltip: TooltipProvider
    },
    debounceInput: false
  }));


  describe('form group visibility', function() {

    it('should show for none start event at process level', inject(
      async function(elementRegistry, selection) {

        // when
        await act(() => selection.select(elementRegistry.get('START_EVENT_NO_FORM')));

        // then
        expect(getFormTypeSelect(container)).to.exist;
      }
    ));


    [
      [ 'message start event', 'START_EVENT_MESSAGE' ],
      [ 'timer start event', 'START_EVENT_TIMER' ],
      [ 'start event in subprocess', 'START_EVENT_IN_SUBPROCESS' ]
    ].forEach(([ title, id ]) => {

      it(`should NOT show for ${ title }`, inject(
        async function(elementRegistry, selection) {

          // when
          await act(() => selection.select(elementRegistry.get(id)));

          // then
          expect(getFormTypeSelect(container)).to.not.exist;
        }
      ));

    });

  });

  describe('form type options', function() {

    it('should offer <none>, linked and embedded', inject(
      async function(elementRegistry, selection) {

        // when
        await act(() => selection.select(elementRegistry.get('START_EVENT_NO_FORM')));

        // then
        const values = Array.from(getFormTypeSelect(container).options).map(o => o.value);

        expect(values).to.have.lengthOf(3);
        expect(values).to.eql([ 'none', FORM_TYPES.CAMUNDA_FORM_LINKED, FORM_TYPES.CAMUNDA_FORM_EMBEDDED ]);
      }
    ));

  });


  describe('select linked form', function() {

    it('should show form id input and set formId in XML', inject(
      async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_NO_FORM');
        await act(() => selection.select(startEvent));

        // when
        changeInput(getFormTypeSelect(container), FORM_TYPES.CAMUNDA_FORM_LINKED);

        // then
        const formIdInput = getFormIdInput(container);
        expect(formIdInput).to.exist;

        const formDefinition = getFormDefinition(startEvent);
        expect(formDefinition).to.exist;
        expect(formDefinition.get('formId')).to.equal('');
      }
    ));


    it('should update form id', inject(
      async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_LINKED');
        await act(() => selection.select(startEvent));

        // when
        changeInput(getFormIdInput(container), 'newFormId');

        // then
        expect(getFormDefinition(startEvent).get('formId')).to.equal('newFormId');
      }
    ));


    it('should NOT show binding type or version tag', inject(
      async function(elementRegistry, selection) {

        // when
        await act(() => selection.select(elementRegistry.get('START_EVENT_LINKED')));

        // then
        expect(getBindingTypeSelect(container)).to.not.exist;
        expect(getVersionTagInput(container)).to.not.exist;
      }
    ));


    it('should undo', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_NO_FORM');
        await act(() => selection.select(startEvent));
        changeInput(getFormTypeSelect(container), FORM_TYPES.CAMUNDA_FORM_LINKED);

        // when
        await act(() => commandStack.undo());

        // then
        expect(getFormDefinition(startEvent)).to.not.exist;
      }
    ));

  });


  describe('select embedded form', function() {

    it('should show form configuration and create user task form in XML', inject(
      async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_NO_FORM');
        await act(() => selection.select(startEvent));

        // when
        changeInput(getFormTypeSelect(container), FORM_TYPES.CAMUNDA_FORM_EMBEDDED);

        // then
        const formConfigTextarea = getFormConfigurationTextarea(container);
        expect(formConfigTextarea).to.exist;

        const userTaskForm = getUserTaskForm(startEvent);
        expect(userTaskForm).to.exist;
      }
    ));

  });


  describe('migrate from embedded to linked', function() {

    it('should switch to linked form and clean up embedded form', inject(
      async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_EMBEDDED');
        await act(() => selection.select(startEvent));

        // when
        changeInput(getFormTypeSelect(container), FORM_TYPES.CAMUNDA_FORM_LINKED);

        // then
        const formDefinition = getFormDefinition(startEvent);
        expect(formDefinition.get('formId')).to.equal('');
        expect(formDefinition.get('formKey')).to.not.exist;

        const userTaskForms = getExtensionElementsList(getRootElement(startEvent), 'zeebe:UserTaskForm');
        expect(userTaskForms).to.have.lengthOf(0);
      }
    ));


    it('should undo', inject(
      async function(elementRegistry, selection, commandStack) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_EMBEDDED');
        await act(() => selection.select(startEvent));
        changeInput(getFormTypeSelect(container), FORM_TYPES.CAMUNDA_FORM_LINKED);

        // when
        await act(() => commandStack.undo());

        // then
        expect(getFormDefinition(startEvent).get('formKey')).to.exist;
        expect(getUserTaskForm(startEvent)).to.exist;
      }
    ));

  });


  describe('remove form', function() {

    it('should remove form definition when set to none', inject(
      async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_LINKED');
        await act(() => selection.select(startEvent));

        // when
        changeInput(getFormTypeSelect(container), 'none');

        // then
        expect(getFormDefinition(startEvent)).to.not.exist;
      }
    ));

  });


  describe('tooltip', function() {

    function openTooltip() {
      return act(() => {
        const wrapper = domQuery('.bio-properties-panel-tooltip-wrapper', container);
        mouseEnter(wrapper);
        clock.tick(TOOLTIP_OPEN_DELAY);
      });
    }

    it('should display correct documentation', inject(
      async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('START_EVENT_NO_FORM');

        await act(() => {
          selection.select(startEvent);
        });

        // when
        await openTooltip();

        const documentationLinkGroup = domQuery('.bio-properties-panel-tooltip-content a', container);

        // then
        expect(documentationLinkGroup).to.exist;
        expect(documentationLinkGroup.title).to.equal('Start event form documentation');
      }
    ));

  });

});


// helpers //////////

function getFormTypeSelect(container) {
  return domQuery('select[name=formType]', container);
}

function getFormIdInput(container) {
  return domQuery('input[name=formId]', container);
}

function getFormConfigurationTextarea(container) {
  return domQuery('textarea[name=formConfiguration]', container);
}

function getBindingTypeSelect(container) {
  return domQuery('select[name=bindingType]', container);
}

function getVersionTagInput(container) {
  return domQuery('input[name=versionTag]', container);
}
