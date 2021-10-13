import validate from 'src/provider/element-templates/util/validate';


describe('provider/element-template - validate', function() {

  it('should return validation errors only', function() {

    // given
    const templateDescriptors = require('../fixtures/error-bindings-invalid');

    // when
    const errors = validate(templateDescriptors);

    // then
    expect(errors).to.have.length(7);

    expect(errors[ 0 ] instanceof Error).to.be.true;
  });

});