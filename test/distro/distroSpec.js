const {
  expect
} = require('chai');


describe('modules', function() {

  it('should expose CJS bundle', function() {

    // given
    const {
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ZeebePropertiesProviderModule,
      useService
    } = require('../../dist');

    // then
    expect(BpmnPropertiesPanelModule).to.exist;
    expect(BpmnPropertiesProviderModule).to.exist;
    expect(ZeebePropertiesProviderModule).to.exist;

    expect(useService).to.exist;
  });
});