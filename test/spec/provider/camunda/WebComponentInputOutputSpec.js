'use strict';

/* global sinon */

var InputOutputParameter = require('lib/provider/camunda/parts/implementation/InputOutputParameter.js');
var entryFactory = require('lib/factory/EntryFactory');

describe('web-component-input-parameters', function() {

  afterEach(function() {
    entryFactory.collapsible.restore();
  });

  it('should call domQuery with provided parent element', function() {
    var param = {
      get: function() {}
    };
    var value = 'dummy';
    var elementMock = {
      querySelector: sinon.spy()
    };
    var openMock = {
      setOpen: sinon.spy()
    };
    sinon.stub(entryFactory, 'collapsible').returns(openMock);
    var io = InputOutputParameter(param, null, null, function() {});
    io.setOpen(value, elementMock);

    // querySelector should be called on the provided element
    expect(elementMock.querySelector.calledOnce).to.be.true;
    expect(openMock.setOpen.calledOnce).to.be.true;
    expect(openMock.setOpen.firstCall.args[0]).to.equal(value);
  });
});
