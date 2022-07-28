import TestContainer from 'mocha-test-container-support';
import { render } from '@testing-library/preact';

import CoreModule from 'bpmn-js/lib/core';
import { bootstrapModeler, inject } from 'bpmn-js/test/helper';
import { is } from 'bpmn-js/lib/util/ModelUtil';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import { withVariableContext } from 'src/provider/HOCs';

import xml from './withVariableContext.bpmn';

describe('zeebe/HOCs - withVariableContext.js', function() {

  const testModules = [
    CoreModule
  ];

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
      modules: testModules,
      moddleExtensions
    });
  }

  beforeEach(bootstrap(xml));

  it('should supply Variables to Component', inject(function(elementRegistry) {

    // given
    const mockComponent = sinon.spy();
    const WrappedComponent = withVariableContext(mockComponent);
    const props = {
      element: elementRegistry.get('Task_1'),
    };

    // when
    render(<WrappedComponent { ...props } />);

    // then
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

  }));


  it('should supply variables to extension element', inject(function(elementRegistry) {

    // given
    const mockComponent = sinon.spy();
    const WrappedComponent = withVariableContext(mockComponent);
    const bpmnElement = elementRegistry.get('Task_2');
    const ioMappings = getIoMappings(bpmnElement);

    const props = {
      bpmnElement,
      element: ioMappings.outputParameters[0]
    };

    // when
    render(<WrappedComponent { ...props } />);

    // then
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

  }));

});



// helpers ////////////////////////

function getIoMappings(element) {
  const bo = element.businessObject;
  const extensionElements = bo.get('extensionElements');

  return extensionElements.get('values').find(value => {
    return is(value, 'zeebe:IoMapping');
  });

}