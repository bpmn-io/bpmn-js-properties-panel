'use strict';

var validate = require('lib/provider/camunda/element-templates/util/validate');


describe('element-templates/util - validate', function() {

  it('should return validation errors only', function() {

    // given
    var templateDescriptors = require('../fixtures/error-bindings-invalid');

    // when
    var errors = validate(templateDescriptors);

    // then
    expect(errors).to.have.length(7);

    expect(errors[0] instanceof Error).to.be.true;
  });

});