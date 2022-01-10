import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { EMPTY_OPTION } from 'src/provider/camunda-platform/properties/BusinessKeyProps';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './BusinessKeyProps.bpmn';


describe('provider/camunda-platform - BusinessKeyProps', function() {

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


  it('should display', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('StartEvent_Id');

    await act(() => {
      selection.select(task);
    });

    // when
    const select = domQuery('select[name=businessKey]', container);

    // then
    expect(select).to.exist;
    expect(select.value).to.equal(EMPTY_OPTION);

    expect(asOptionNamesList(select)).to.eql([
      '<none>',
      'FormField_1'
    ]);
  }));


  it('should NOT display', inject(async function(elementRegistry, selection) {

    // given
    const task = elementRegistry.get('EndEvent');

    await act(() => {
      selection.select(task);
    });

    // when
    const select = domQuery('select[name=businessKey]', container);

    // then
    expect(select).to.not.exist;
  }));


  describe('update', function() {

    describe('<none> to business key', function() {

      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_Id'),
              formData = getFormData(startEvent);

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const select = domQuery('select[name=businessKey]', container);

        changeInput(select, 'FormField_1');

        // then
        expect(formData.get('camunda:businessKey')).to.equal('FormField_1');

        expect(select.value).to.equal('FormField_1');
      }));


      it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_Id'),
              formData = getFormData(startEvent);

        await act(() => {
          selection.select(startEvent);
        });

        const select = domQuery('select[name=businessKey]', container);

        changeInput(select, 'FormField_1');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(formData.get('camunda:businessKey')).not.to.exist;

        expect(select.value).to.equal(EMPTY_OPTION);
      }));

    });


    describe('business key to business key', function() {

      it('should update', inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_BusinessKey'),
              formData = getFormData(startEvent);

        await act(() => {
          selection.select(startEvent);
        });

        // when
        const select = domQuery('select[name=businessKey]', container);

        changeInput(select, 'FormField_2');

        // then
        expect(formData.get('camunda:businessKey')).to.equal('FormField_2');

        expect(select.value).to.equal('FormField_2');
      }));


      it('should update on external change', inject(async function(commandStack, elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_BusinessKey'),
              formData = getFormData(startEvent);

        const originalValue = formData.get('camunda:businessKey');

        await act(() => {
          selection.select(startEvent);
        });

        const select = domQuery('select[name=businessKey]', container);

        changeInput(select, 'FormField_2');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(formData.get('camunda:businessKey')).to.equal(originalValue);

        expect(select.value).to.equal(originalValue);
      }));

    });

  });

});

// helpers //////////

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}

function getFormData(element) {
  const businessObject = getBusinessObject(element);

  return getExtensionElementsList(businessObject, 'camunda:FormData')[ 0 ];
}