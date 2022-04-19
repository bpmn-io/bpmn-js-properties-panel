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
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

import CoreModule from 'bpmn-js/lib/core';
import SelectionModule from 'diagram-js/lib/features/selection';
import ModelingModule from 'bpmn-js/lib/features/modeling';

import BpmnPropertiesPanel from 'src/render';

import {
  getServiceTaskLikeBusinessObject,
  getImplementationType
} from 'src/provider/camunda-platform/utils/ImplementationTypeUtils';

import {
  getExtensionElementsList
} from 'src/utils/ExtensionElementsUtil';

import BpmnPropertiesProvider from 'src/provider/bpmn';
import CamundaPlatformPropertiesProvider from 'src/provider/camunda-platform';

import BehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-platform';

import camundaModdleExtensions from 'camunda-bpmn-moddle/resources/camunda.json';

import diagramXML from './ImplementationProps.bpmn';


describe('provider/camunda-platform - ImplementationTypeProps', function() {

  const testModules = [
    BpmnPropertiesPanel,
    BpmnPropertiesProvider,
    CamundaPlatformPropertiesProvider,
    CoreModule,
    ModelingModule,
    SelectionModule,
    BehaviorsModule
  ];

  let container;

  const moddleExtensions = {
    camunda: camundaModdleExtensions
  };

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
    const serviceTask = elementRegistry.get('ServiceTask_class');

    await act(() => {
      selection.select(serviceTask);
    });

    // when
    const select = domQuery('select[name=implementationType]', container);

    // then
    expect(select.value).to.eql(getImplementationType(serviceTask));
  }));


  it('should display options according to priority', inject(async function(elementRegistry, selection) {

    // given
    const businessRuleTask = elementRegistry.get('BusinessRuleTask_class');

    await act(() => {
      selection.select(businessRuleTask);
    });

    // when
    const select = domQuery('select[name=implementationType]', container);

    // then
    expect(asOptionNamesList(select)).to.eql([
      '<none>',
      'DMN',
      'External',
      'Java class',
      'Expression',
      'Delegate expression',
      'Connector'
    ]);
  }));


  describe('update', function() {

    describe('on serviceTask', function() {

      describe('from class to <none>', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, '');

          // then
          expect(select.value).to.eql('');
        }));


        it('should remove class', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, '');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:class')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_class');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, '');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );
      });


      describe('from class to expression', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'expression');

          // then
          expect(select.value).to.eql(getImplementationType(serviceTask));
        }));


        it('should keep value', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          const originalValue = getBusinessObject(serviceTask).get('camunda:class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'expression');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:class')).to.not.exist;
          expect(getBusinessObject(serviceTask).get('camunda:expression')).to.eql(originalValue);
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_class');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'expression');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to delegateExpression', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'delegateExpression');

          // then
          expect(select.value).to.eql(getImplementationType(serviceTask));
        }));


        it('should keep value', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          const originalValue = getBusinessObject(serviceTask).get('camunda:class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'delegateExpression');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:class')).to.not.exist;
          expect(
            getBusinessObject(serviceTask).get('camunda:delegateExpression')
          ).to.eql(originalValue);
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_class');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'delegateExpression');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to dmn', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('BusinessRuleTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'dmn');

          // then
          expect(select.value).to.eql(getImplementationType(serviceTask));
        }));


        it('should set decisionRef', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('BusinessRuleTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'dmn');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:decisionRef')).to.exist;
        }));


        it('should remove class', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('BusinessRuleTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'dmn');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:class')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('BusinessRuleTask_class');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'dmn');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from dmn to class', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

          await act(() => {
            selection.select(businessRuleTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(select.value).to.eql(getImplementationType(businessRuleTask));
        }));


        it('should set class', inject(async function(elementRegistry, selection) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

          await act(() => {
            selection.select(businessRuleTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getBusinessObject(businessRuleTask).get('camunda:class')).to.eql('');
        }));


        it('should remove decisionRef', inject(async function(elementRegistry, selection) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

          await act(() => {
            selection.select(businessRuleTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getBusinessObject(businessRuleTask).get('camunda:decisionRef')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const businessRuleTask = elementRegistry.get('BusinessRuleTask_dmn');

            const originalValue = getImplementationType(businessRuleTask);

            await act(() => {
              selection.select(businessRuleTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'class');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to external', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('BusinessRuleTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'external');

          // then
          expect(select.value).to.eql(getImplementationType(serviceTask));
        }));


        it('should set type & topic', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('BusinessRuleTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'external');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:type')).to.eql('external');
          expect(getBusinessObject(serviceTask).get('camunda:topic')).to.exist;
        }));


        it('should remove class', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('BusinessRuleTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'external');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:class')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('BusinessRuleTask_class');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'external');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from external to class', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_external');

          await act(() => {
            selection.select(businessRuleTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(select.value).to.eql(getImplementationType(businessRuleTask));
        }));


        it('should set class', inject(async function(elementRegistry, selection) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_external');

          await act(() => {
            selection.select(businessRuleTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getBusinessObject(businessRuleTask).get('camunda:class')).to.eql('');
        }));


        it('should remove type & topic', inject(async function(elementRegistry, selection) {

          // given
          const businessRuleTask = elementRegistry.get('BusinessRuleTask_external');

          await act(() => {
            selection.select(businessRuleTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getBusinessObject(businessRuleTask).get('camunda:type')).to.not.exist;
          expect(getBusinessObject(businessRuleTask).get('camunda:topic')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const businessRuleTask = elementRegistry.get('BusinessRuleTask_external');

            const originalValue = getImplementationType(businessRuleTask);

            await act(() => {
              selection.select(businessRuleTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'class');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to connector', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'connector');

          // then
          expect(select.value).to.eql(getImplementationType(serviceTask));
        }));


        it('should add connector', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_class');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'connector');

          // then
          expect(getConnector(serviceTask)).to.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_class');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'connector');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
            expect(getConnector(serviceTask)).to.not.exist;
          })
        );

      });


      describe('from connector to class', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_connector');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(select.value).to.eql(getImplementationType(serviceTask));
        }));


        it('should set class', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_connector');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getBusinessObject(serviceTask).get('camunda:class')).to.eql('');
        }));


        it('should remove connector', inject(async function(elementRegistry, selection) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_connector');

          await act(() => {
            selection.select(serviceTask);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getConnector(serviceTask)).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const serviceTask = elementRegistry.get('ServiceTask_connector');

            const originalValue = getImplementationType(serviceTask);

            await act(() => {
              selection.select(serviceTask);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'class');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
            expect(getConnector(serviceTask)).to.exist;
          })
        );

      });

    });


    describe('on messageEventDefinition', function() {

      describe('from class to <none>', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, '');

          // then
          expect(select.value).to.eql('');
        }));


        it('should remove class', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, '');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_Class');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, '');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );
      });


      describe('from class to expression', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'expression');

          // then
          expect(select.value).to.eql(getImplementationType(messageEvent));
        }));


        it('should keep value', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'expression');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.not.exist;
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:expression')).to.eql(originalValue);
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_Class');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'expression');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to delegateExpression', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'delegateExpression');

          // then
          expect(select.value).to.eql(getImplementationType(messageEvent));
        }));


        it('should keep value', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          const originalValue = getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'delegateExpression');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.not.exist;
          expect(
            getServiceTaskLikeBusinessObject(messageEvent).get('camunda:delegateExpression')
          ).to.eql(originalValue);
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_Class');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'delegateExpression');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to external', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'external');

          // then
          expect(select.value).to.eql(getImplementationType(messageEvent));
        }));


        it('should set type & topic', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'external');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:type')).to.eql('external');
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:topic')).to.exist;
        }));


        it('should remove class', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'external');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_Class');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'external');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from external to class', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_External');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(select.value).to.eql(getImplementationType(messageEvent));
        }));


        it('should set class', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_External');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.eql('');
        }));


        it('should remove type & topic', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_External');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:type')).to.not.exist;
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:topic')).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_External');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'class');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
          })
        );

      });


      describe('from class to connector', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'connector');

          // then
          expect(select.value).to.eql(getImplementationType(messageEvent));
        }));


        it('should add connector', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Class');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'connector');

          // then
          expect(getConnector(messageEvent)).to.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_Class');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'connector');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
            expect(getConnector(messageEvent)).to.not.exist;
          })
        );

      });


      describe('from connector to class', function() {

        it('should update', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(select.value).to.eql(getImplementationType(messageEvent));
        }));


        it('should set class', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getServiceTaskLikeBusinessObject(messageEvent).get('camunda:class')).to.eql('');
        }));


        it('should remove connector', inject(async function(elementRegistry, selection) {

          // given
          const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

          await act(() => {
            selection.select(messageEvent);
          });

          // when
          const select = domQuery('select[name=implementationType]', container);
          changeInput(select, 'class');

          // then
          expect(getConnector(messageEvent)).to.not.exist;
        }));


        it('should update on external change',
          inject(async function(elementRegistry, selection, commandStack) {

            // given
            const messageEvent = elementRegistry.get('MessageEndEvent_Connector');

            const originalValue = getImplementationType(messageEvent);

            await act(() => {
              selection.select(messageEvent);
            });
            const select = domQuery('select[name=implementationType]', container);
            changeInput(select, 'class');

            // when
            await act(() => {
              commandStack.undo();
            });

            // then
            expect(select.value).to.eql(originalValue);
            expect(getConnector(messageEvent)).to.exist;
          })
        );

      });

    });

  });


  describe('integration', function() {

    it('should remove error event definitions when updating to non-external', inject(
      async function(elementRegistry, selection) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_error');

        await act(() => {
          selection.select(serviceTask);
        });

        // when
        const select = domQuery('select[name=implementationType]', container);

        changeInput(select, 'class');

        // then
        const businessObject = getBusinessObject(serviceTask),
              errorEventDefinitions = getErrorEventDefinitions(businessObject);

        expect(errorEventDefinitions).to.be.empty;
      }
    ));

  });

});


// helper /////////////////////

function getConnectors(businessObject) {
  return getExtensionElementsList(businessObject, 'camunda:Connector');
}

function getConnector(element) {
  const businessObject = getServiceTaskLikeBusinessObject(element);
  const connectors = getConnectors(businessObject);

  return connectors[0];
}

function asOptionNamesList(select) {
  const names = [];
  const options = domQueryAll('option', select);

  options.forEach(o => names.push(o.label));

  return names;
}

function getErrorEventDefinitions(businessObject) {
  const extensionElements = businessObject.get('extensionElements');

  if (!extensionElements) {
    return;
  }

  return extensionElements.get('values').filter((element) => {
    return is(element, 'camunda:ErrorEventDefinition');
  });
}
