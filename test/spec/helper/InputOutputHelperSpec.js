'use strict';

var BpmnModdle = require('bpmn-moddle').default;
var CamundaBpmnModdle = require('camunda-bpmn-moddle/resources/camunda');

var InputOutputHelper = require('lib/helper/InputOutputHelper');


describe('inputOutput', function() {

  var moddle = new BpmnModdle({
    camunda: CamundaBpmnModdle
  });


  it('should NOT be supported on bpmn:Gateway', function() {

    // given
    var element = moddle.create('bpmn:Gateway');

    // then
    expect(InputOutputHelper.isInputOutputSupported(element, false)).to.be.false;
  });


  it('should be supported inside camunda:Connector', function() {

    // given
    var element = moddle.create('bpmn:ServiceTask');

    // then
    expect(InputOutputHelper.isInputOutputSupported(element, true)).to.be.true;
  });

});
