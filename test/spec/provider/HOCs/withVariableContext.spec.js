import TestContainer from 'mocha-test-container-support';
import { act, render, waitFor } from '@testing-library/preact';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import { withVariableContext } from 'src/provider/HOCs';

import {
  BpmnPropertiesPanelContext
} from 'src/context';

import xml from './withVariableContext.bpmn';


/**
 * As of @bpmn-io/extract-process-variables@0.7.0, the extraction is async. To get the
 * correct process variables, we use `eventually` in all test cases.
 */
describe('HOCs - withVariableContext.js', function() {


  const moddleExtensions = {
    zeebe: zeebeModdleExtensions
  };

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function bootstrap(diagramXML) {
    return bootstrapModeler(diagramXML, {
      container,
      moddleExtensions
    });
  }

  beforeEach(bootstrap(xml));

  it('should supply Variables to Component', inject(async function(elementRegistry) {

    // given
    const mockComponent = sinon.spy();
    const props = {
      element: elementRegistry.get('Task_1'),
    };

    // when
    createVariableComponent({ component: mockComponent, props });

    // then
    await waitFor(() => {
      expect(mockComponent).to.have.been.calledWith(
        sinon.match({
          variables: [
            {
              name: 'OutputVariable_0svilsd',
              info: 'Written in Task_2'
            }
          ]
        })
      );
    });
  }));


  it('should supply variables to extension element', inject(async function(elementRegistry) {

    // given
    const mockComponent = sinon.spy();
    const bpmnElement = elementRegistry.get('Task_2');
    const ioMappings = getIoMappings(bpmnElement);

    const props = {
      bpmnElement,
      element: ioMappings.outputParameters[0]
    };

    // when
    createVariableComponent({ component: mockComponent, props });

    // then
    await waitFor(() => {
      expect(mockComponent).to.have.been.calledWith(
        sinon.match({
          variables: [
            {
              name: 'OutputVariable_0svilsd',
              info: 'Written in Task_2'
            }
          ]
        })
      );
    });

  }));


  it('should update variables to Component', inject(async function(elementRegistry, commandStack, injector) {

    // given
    const mockComponent = sinon.spy();

    const bpmnElement = elementRegistry.get('Task_2');

    const ioMappings = getIoMappings(bpmnElement);

    const props = {
      element: bpmnElement,
    };

    createVariableComponent({
      component: mockComponent,
      context: {
        getService: injector.get
      },
      props,
      container
    });

    const ioMapping = ioMappings.outputParameters[0];

    // when
    await act(() => {
      commandStack.execute('element.updateModdleProperties', {
        element: bpmnElement,
        moddleElement: ioMapping,
        properties: {
          target: 'newVariable'
        }
      });
    });

    // then
    await waitFor(() => {
      expect(mockComponent.lastCall).to.have.been.calledWith(
        sinon.match({
          variables: [
            {
              name: 'newVariable',
              info: 'Written in Task_2'
            }
          ]
        })
      );
    });
  }));

});

// helpers ////////////////////////

function createVariableComponent(options) {
  const {
    component,
    context = {
      getService: () => ({
        on: ()=>{},
        off: ()=> {} })
    },
    container,
    props
  } = options;

  const WrappedComponent = withVariableContext(component);

  return render(
    <BpmnPropertiesPanelContext.Provider value={ context }>
      <WrappedComponent { ...props } />
    </BpmnPropertiesPanelContext.Provider>,
    {
      container
    }
  );
}


function getIoMappings(element) {
  const bo = element.businessObject;
  const extensionElements = bo.get('extensionElements');

  return extensionElements.get('values').find(value => {
    return is(value, 'zeebe:IoMapping');
  });

}