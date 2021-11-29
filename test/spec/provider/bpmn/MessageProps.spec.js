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

import {
  EMPTY_OPTION,
  CREATE_NEW_OPTION
} from 'src/provider/bpmn/properties/MessageProps';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import BpmnPropertiesProvider from 'src/provider/bpmn';

import {
  getMessage
} from 'src/provider/bpmn/utils/EventDefinitionUtil';

import diagramXML from './MessageProps.bpmn';


describe('provider/bpmn - MessageProps', function() {

  const testModules = [
    CoreModule,
    SelectionModule,
    ModelingModule,
    BpmnPropertiesPanel,
    BpmnPropertiesProvider
  ];

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapPropertiesPanel(diagramXML, {
    modules: testModules,
    debounceInput: false
  }));


  describe('bpmn:StartEvent#messageRef', function() {

    it('should NOT be displayed for normal start event',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        await act(() => {
          selection.select(startEvent);
        });

        // then
        const messageRefSelect = domQuery('select[name=messageRef]', container);

        expect(messageRefSelect).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);

      // then
      expect(messageRefSelect.value).to.eql(getMessage(messageEvent).get('id'));
    }));


    it('should display select options in correct order', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);

      // then
      expect(asOptionNamesList(messageRefSelect)).to.eql([
        '<none>',
        'Create new ...',
        'Message_1',
        'Message_2',
        'Message_3'
      ]);
    }));


    it('should create new message', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_empty');

      await act(() => {
        selection.select(messageEvent);
      });

      // assume
      expect(getMessage(messageEvent)).to.not.exist;

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);
      changeInput(messageRefSelect, 'create-new');

      // then
      expect(getMessage(messageEvent)).to.exist;
    }));


    it('should remove message reference', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // assume
      expect(getMessage(messageEvent)).to.exist;

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);
      changeInput(messageRefSelect, '');

      // then
      expect(getMessage(messageEvent)).to.not.exist;
    }));


    describe('update', function() {

      describe('<none> to message', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEvent_empty');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const messageRefSelect = domQuery('select[name=messageRef]', container);
          changeInput(messageRefSelect, 'Message_2');

          // then
          expect(getMessage(messageEvent).get('id')).to.eql('Message_2');

          expect(messageRefSelect.value).to.eql('Message_2');
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEvent_empty');

            await act(() => {
              selection.select(messageEvent);
            });
            const messageRefSelect = domQuery('select[name=messageRef]', container);
            changeInput(messageRefSelect, 'Message_2');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(getMessage(messageEvent)).not.to.exist;

            expect(messageRefSelect.value).to.eql(EMPTY_OPTION);
          })
        );

      });


      describe('message to message', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEvent_1');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const messageRefSelect = domQuery('select[name=messageRef]', container);
          changeInput(messageRefSelect, 'Message_2');

          // then
          expect(getMessage(messageEvent).get('id')).to.eql('Message_2');

          expect(messageRefSelect.value).to.eql('Message_2');
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEvent_1');
            const originalValue = getMessage(messageEvent).get('id');

            await act(() => {
              selection.select(messageEvent);
            });
            const messageRefSelect = domQuery('select[name=messageRef]', container);
            changeInput(messageRefSelect, 'Message_2');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(messageRefSelect.value).to.eql(originalValue);

            expect(messageRefSelect.value).to.eql('Message_1');
          })
        );

      });

    });

  });


  describe('bpmn:ReceiveTask#messageRef', function() {

    it('should NOT be displayed for normal task',
      inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        // then
        const messageRefSelect = domQuery('select[name=messageRef]', container);

        expect(messageRefSelect).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);

      // then
      expect(messageRefSelect.value).to.eql(getMessage(receiveTask).get('id'));
    }));


    it('should display select options in correct order', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);

      // then
      expect(asOptionNamesList(messageRefSelect)).to.eql([
        '<none>',
        'Create new ...',
        'Message_1',
        'Message_2',
        'Message_3'
      ]);
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);
      changeInput(messageRefSelect, 'Message_2');

      // then
      expect(getMessage(receiveTask).get('id')).to.eql('Message_2');
    }));


    it('should create new message', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_empty');

      await act(() => {
        selection.select(receiveTask);
      });

      // assume
      expect(getMessage(receiveTask)).to.not.exist;

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);
      changeInput(messageRefSelect, CREATE_NEW_OPTION);

      // then
      expect(getMessage(receiveTask)).to.exist;
    }));


    it('should remove message reference', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // assume
      expect(getMessage(receiveTask)).to.exist;

      // when
      const messageRefSelect = domQuery('select[name=messageRef]', container);
      changeInput(messageRefSelect, '');

      // then
      expect(getMessage(receiveTask)).to.not.exist;
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const receiveTask = elementRegistry.get('ReceiveTask_1');
        const originalValue = getMessage(receiveTask).get('id');

        await act(() => {
          selection.select(receiveTask);
        });
        const messageRefSelect = domQuery('select[name=messageRef]', container);
        changeInput(messageRefSelect, 'Message_2');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(messageRefSelect.value).to.eql(originalValue);
      })
    );

  });


  describe('bpmn:StartEvent#messageRef.name', function() {

    it('should NOT be displayed for normal start event',
      inject(async function(elementRegistry, selection) {

        // given
        const startEvent = elementRegistry.get('StartEvent_1');

        // when
        await act(() => {
          selection.select(startEvent);
        });

        // then
        const messageNameInput = domQuery('input[name=messageName]', container);

        expect(messageNameInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);

      // then
      expect(messageNameInput.value).to.eql(getMessage(messageEvent).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      changeInput(messageNameInput, 'newValue');

      // then
      expect(getMessage(messageEvent).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const messageEvent = elementRegistry.get('MessageEvent_1');
        const originalValue = getMessage(messageEvent).get('name');

        await act(() => {
          selection.select(messageEvent);
        });
        const messageNameInput = domQuery('input[name=messageName]', container);
        changeInput(messageNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(messageNameInput.value).to.eql(originalValue);
      })
    );


    it('should not blow up on empty message name', inject(async function(elementRegistry, selection) {

      // given
      const messageEvent = elementRegistry.get('MessageEvent_1');

      await act(() => {
        selection.select(messageEvent);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      await act(() => {
        changeInput(messageNameInput, '');
      });

      // then
      expect(getMessage(messageEvent).get('name')).to.eql(undefined);
    }));

  });


  describe('bpmn:ReceiveTask#messageRef.name', function() {

    it('should NOT be displayed for normal task',
      inject(async function(elementRegistry, selection) {

        // given
        const task = elementRegistry.get('Task_1');

        // when
        await act(() => {
          selection.select(task);
        });

        // then
        const messageNameInput = domQuery('input[name=messageName]', container);

        expect(messageNameInput).to.be.null;
      })
    );


    it('should display', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);

      // then
      expect(messageNameInput.value).to.eql(getMessage(receiveTask).get('name'));
    }));


    it('should update', inject(async function(elementRegistry, selection) {

      // given
      const receiveTask = elementRegistry.get('ReceiveTask_1');

      await act(() => {
        selection.select(receiveTask);
      });

      // when
      const messageNameInput = domQuery('input[name=messageName]', container);
      changeInput(messageNameInput, 'newValue');

      // then
      expect(getMessage(receiveTask).get('name')).to.eql('newValue');
    }));


    it('should update on external change',
      inject(async function(elementRegistry, selection, commandStack) {

        // given
        const receiveTask = elementRegistry.get('ReceiveTask_1');
        const originalValue = getMessage(receiveTask).get('name');

        await act(() => {
          selection.select(receiveTask);
        });
        const messageNameInput = domQuery('input[name=messageName]', container);
        changeInput(messageNameInput, 'newValue');

        // when
        await act(() => {
          commandStack.undo();
        });

        // then
        expect(messageNameInput.value).to.eql(originalValue);
      })
    );

  });

});

// helper //////////////////////

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}