import TestContainer from 'mocha-test-container-support';
import { render } from '@testing-library/preact';

import CoreModule from 'bpmn-js/lib/core';
import { bootstrapModeler, inject } from 'bpmn-js/test/helper';

import zeebeModdleExtensions from 'zeebe-bpmn-moddle/resources/zeebe';

import { withTooltipContainer } from 'src/provider/HOCs';

import xml from './withTooltipContainer.bpmn';
import { BpmnPropertiesPanelContext } from '../../../../src/context';

describe('HOCs - withTooltipContainer.js', function() {

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


  function bootstrap(diagramXML, options) {
    return bootstrapModeler(diagramXML, {
      container,
      modules: testModules,
      moddleExtensions,
      ...options
    });
  }

  beforeEach(bootstrap(xml));

  it('should supply tooltipContainer to Component', inject(function(injector, config) {

    // given
    const component = sinon.spy();
    config.propertiesPanel = {
      feelTooltipContainer: '#foo'
    };

    // when
    createTooltipComponent({
      component,
      injector,
      container
    });


    // then
    expect(component).to.have.been.calledWith(
      sinon.match({
        tooltipContainer: '#foo'
      })
    );

  }));


  it('should not supply default', inject(function(injector) {

    // given
    const component = sinon.spy();


    // when
    createTooltipComponent({
      component,
      injector,
      container
    });


    // then
    expect(component).to.have.been.calledWith(
      sinon.match({
        tooltipContainer: undefined
      })
    );

  }));

});


function createTooltipComponent(options) {
  const {
    component,
    injector,
    container,
  } = options;

  const context = {
    getService: injector.get
  };

  const WrappedComponent = withTooltipContainer(component);

  return render(
    <BpmnPropertiesPanelContext.Provider value={ context }>
      <WrappedComponent />
    </BpmnPropertiesPanelContext.Provider>,
    {
      container
    }
  );
}