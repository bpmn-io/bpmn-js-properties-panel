import TestContainer from 'mocha-test-container-support';
import { act } from '@testing-library/preact';

import {
  getServiceTaskLikeBusinessObject
} from 'src/provider/camunda-platform/utils/ImplementationTypeUtils';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import {
  bootstrapPropertiesPanel,
  changeInput,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from './FieldInjectonProps.bpmn';


describe('provider/bpmn - FieldInjection', function() {

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


  describe('bpmn:ServiceTask', function() {

    describe('#field.name', function() {

      it('should not display if no injection',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const nameInput = getNameInput(container, serviceTask.id, 0);

          // then
          expect(nameInput).to.not.exist;
        })
      );


      it('should display',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const nameInput = getNameInput(container, serviceTask.id, 0);

          // then
          expect(nameInput).to.exist;
          expect(nameInput.value).to.equal('some');
        })
      );


      it('should update',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          const nameInput = getNameInput(container, serviceTask.id, 0);

          // when
          changeInput(nameInput, 'newValue');

          // then
          const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
          expect(fieldInjection[0].name).to.equal('newValue');
        })
      );


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field'),
                originalValue = fieldInjection[0].name;

          const nameInput = getNameInput(container, serviceTask.id, 0);
          changeInput(nameInput, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(nameInput.value).to.equal(originalValue);
        })
      );

    });


    describe('field.type', function() {

      it('should not display if no injection',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const typeSelect = getTypeSelect(container, serviceTask.id, 0);

          // then
          expect(typeSelect).to.not.exist;
        })
      );


      it('should display',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const typeSelect = getTypeSelect(container, serviceTask.id, 0);

          // then
          expect(typeSelect).to.exist;
          expect(typeSelect.value).to.equal('string');
        })
      );


      it('should update',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          const typeSelect = getTypeSelect(container, serviceTask.id, 0);

          // when
          changeInput(typeSelect, 'expression');

          // then
          const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
          expect(fieldInjection[0].expression).to.equal('');
          expect(fieldInjection[0].string).to.be.undefined;
          expect(fieldInjection[0].stringVavlue).to.be.undefined;
        })
      );


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          const typeSelect = getTypeSelect(container, serviceTask.id, 0);
          changeInput(typeSelect, 'expression');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(typeSelect.value).to.equal('string');
        })
      );


      it('should support stringValue',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_5');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const typeSelect = getTypeSelect(container, serviceTask.id, 0);

          // then
          expect(typeSelect.value).to.equal('string');
        })
      );

    });


    describe('#field.value', function() {

      it('should not display if no injection',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const valueInput = getValueInput(container, serviceTask.id, 0);

          // then
          expect(valueInput).to.not.exist;
        })
      );


      it('should display',
        inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_2');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const valueInput = getValueInput(container, serviceTask.id, 0);

          // then
          expect(valueInput).to.exist;
          expect(valueInput.value).to.equal('fieldInjection');
        })
      );


      describe('type string', function() {

        it('should update',
          inject(async function(elementRegistry, selection) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_2');

            await act(() => {
              selection.select(serviceTask);
            });

            const valueInput = getValueInput(container, serviceTask.id, 0);

            // when
            changeInput(valueInput, 'newValue');

            // then
            const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].string).to.equal('newValue');
          })
        );


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_2');

            await act(() => {
              selection.select(serviceTask);
            });

            const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field'),
                  originalValue = fieldInjection[0].string;

            const valueInput = getValueInput(container, serviceTask.id, 0);
            changeInput(valueInput, 'newValue');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(valueInput.value).to.equal(originalValue);
          })
        );

      });


      describe('type expression', function() {

        it('should update',
          inject(async function(elementRegistry, selection) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_4');

            await act(() => {
              selection.select(serviceTask);
            });

            const valueInput = getValueInput(container,serviceTask.id, 0);

            // when
            changeInput(valueInput, 'newValue');

            // then
            const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].expression).to.equal('newValue');
          })
        );


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_4');

            await act(() => {
              selection.select(serviceTask);
            });

            const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field'),
                  originalValue = fieldInjection[0].expression;

            const valueInput = getValueInput(container,serviceTask.id, 0);
            changeInput(valueInput, 'newValue');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(valueInput.value).to.equal(originalValue);
          })
        );

      });


      describe('stringValue support', function() {

        it('should display',
          inject(async function(elementRegistry, selection) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_5');

            await act(() => {
              selection.select(serviceTask);
            });

            // when
            const valueInput = getValueInput(container,serviceTask.id, 0);

            // then
            expect(valueInput).to.exist;
            expect(valueInput.value).to.equal('Hello World');
          })
        );


        it('should overwrite with string',
          inject(async function(elementRegistry, selection) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_5');

            await act(() => {
              selection.select(serviceTask);
            });

            const valueInput = getValueInput(container,serviceTask.id, 0);

            // when
            changeInput(valueInput, 'newValue');

            // then
            const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].string).to.equal('newValue');
            expect(fieldInjection[0].stringValue).to.be.undefined;
          })
        );


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_5');

            await act(() => {
              selection.select(serviceTask);
            });

            const valueInput = getValueInput(container,serviceTask.id, 0);

            changeInput(valueInput, 'newValue');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const businessObject = getServiceTaskLikeBusinessObject(serviceTask),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].string).to.be.undefined;
            expect(fieldInjection[0].stringValue).to.equal('Hello World');
          })
        );

      });

    });

  });


  describe('bpmn:IntermediateMessageThrowEvent', function() {

    describe('#field.name', function() {

      it('should not display if no injection',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_1');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const nameInput = getNameInput(container, messageThrowEvent.id, 0);

          // then
          expect(nameInput).to.not.exist;
        })
      );


      it('should display',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const nameInput = getNameInput(container, messageThrowEvent.id, 0);

          // then
          expect(nameInput).to.exist;
          expect(nameInput.value).to.equal('some');
        })
      );


      it('should update',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          const nameInput = getNameInput(container, messageThrowEvent.id, 0);

          // when
          changeInput(nameInput, 'newValue');

          // then
          const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
          expect(fieldInjection[0].name).to.equal('newValue');
        })
      );


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field'),
                originalValue = fieldInjection[0].name;

          const nameInput = getNameInput(container, messageThrowEvent.id, 0);
          changeInput(nameInput, 'newValue');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(nameInput.value).to.equal(originalValue);
        })
      );

    });


    describe('field.type', function() {

      it('should not display if no injection',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_1');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const typeSelect = getTypeSelect(container, messageThrowEvent.id, 0);

          // then
          expect(typeSelect).to.not.exist;
        })
      );


      it('should display',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const typeSelect = getTypeSelect(container, messageThrowEvent.id, 0);

          // then
          expect(typeSelect).to.exist;
          expect(typeSelect.value).to.equal('string');
        })
      );


      it('should update',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          const typeSelect = getTypeSelect(container, messageThrowEvent.id, 0);

          // when
          changeInput(typeSelect, 'expression');

          // then
          const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
          expect(fieldInjection[0].expression).to.equal('');
          expect(fieldInjection[0].string).to.be.undefined;
          expect(fieldInjection[0].stringVavlue).to.be.undefined;
        })
      );


      it('should update on external change',
        inject(async function(elementRegistry, selection, commandStack) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          const typeSelect = getTypeSelect(container, messageThrowEvent.id, 0);
          changeInput(typeSelect, 'expression');

          // when
          await act(() => {
            commandStack.undo();
          });

          // then
          expect(typeSelect.value).to.equal('string');
        })
      );


      it('should support stringValue',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_5');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const typeSelect = getTypeSelect(container, messageThrowEvent.id, 0);

          // then
          expect(typeSelect.value).to.equal('string');
        })
      );

    });


    describe('#field.value', function() {

      it('should not display if no injection',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_1');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const valueInput = getValueInput(container, messageThrowEvent.id, 0);

          // then
          expect(valueInput).to.not.exist;
        })
      );


      it('should display',
        inject(async function(elementRegistry, selection) {

          // given
          const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

          await act(() => {
            selection.select(messageThrowEvent);
          });

          // when
          const valueInput = getValueInput(container,messageThrowEvent.id, 0);

          // then
          expect(valueInput).to.exist;
          expect(valueInput.value).to.equal('stringInjection');
        })
      );


      describe('type string', function() {

        it('should update',
          inject(async function(elementRegistry, selection) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            const valueInput = getValueInput(container,messageThrowEvent.id, 0);

            // when
            changeInput(valueInput, 'newValue');

            // then
            const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].string).to.equal('newValue');
          })
        );


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_2');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field'),
                  originalValue = fieldInjection[0].string;

            const valueInput = getValueInput(container, messageThrowEvent.id, 0);
            changeInput(valueInput, 'newValue');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(valueInput.value).to.equal(originalValue);
          })
        );

      });


      describe('type expression', function() {

        it('should update',
          inject(async function(elementRegistry, selection) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_4');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            const valueInput = getValueInput(container, messageThrowEvent.id, 0);

            // when
            changeInput(valueInput, 'newValue');

            // then
            const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].expression).to.equal('newValue');
          })
        );


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_4');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field'),
                  originalValue = fieldInjection[0].expression;

            const valueInput = getValueInput(container, messageThrowEvent.id, 0);
            changeInput(valueInput, 'newValue');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(valueInput.value).to.equal(originalValue);
          })
        );

      });


      describe('stringValue support', function() {

        it('should display',
          inject(async function(elementRegistry, selection) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_5');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            // when
            const valueInput = getValueInput(container, messageThrowEvent.id, 0);

            // then
            expect(valueInput).to.exist;
            expect(valueInput.value).to.equal('Hello World');
          })
        );


        it('should overwrite with string',
          inject(async function(elementRegistry, selection) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_5');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            const valueInput = getValueInput(container,messageThrowEvent.id, 0);

            // when
            changeInput(valueInput, 'newValue');

            // then
            const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].string).to.equal('newValue');
            expect(fieldInjection[0].stringValue).to.be.undefined;
          })
        );


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageThrowEvent = elementRegistry.get('MessageThrowEvent_5');

            await act(() => {
              selection.select(messageThrowEvent);
            });

            const valueInput = getValueInput(container, messageThrowEvent.id, 0);

            changeInput(valueInput, 'newValue');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            const businessObject = getServiceTaskLikeBusinessObject(messageThrowEvent),
                  fieldInjection = getExtensionElementsList(businessObject, 'camunda:Field');
            expect(fieldInjection[0].string).to.be.undefined;
            expect(fieldInjection[0].stringValue).to.equal('Hello World');
          })
        );

      });

    });

  });

});


// helper //////////////////

function getNameInput(container, elementId, id) {
  return domQuery(`#bio-properties-panel-${elementId}-fieldInjection-${id}-name`, container);
}

function getValueInput(container, elementId, id) {
  return domQuery(`#bio-properties-panel-${elementId}-fieldInjection-${id}-value`, container);
}

function getTypeSelect(container, elementId, id) {
  return domQuery(`#bio-properties-panel-${elementId}-fieldInjection-${id}-type`, container);
}
