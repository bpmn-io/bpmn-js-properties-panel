import { isArray } from 'min-dash';

import handleLegacyScopes from 'src/provider/element-templates/util/handleLegacyScopes';


describe('provider/element-template - handleLegacyScopes', function() {

  it('should transform legacy scopes descriptor', function() {

    // given
    const templates = require('../fixtures/scopes-single-connector');

    const scopesDescriptor = templates[ 0 ].scopes;

    // when
    const scopes = handleLegacyScopes(scopesDescriptor);

    // then
    expect(isArray(scopes)).to.be.true;

    expect(scopes).to.have.length(1);

    expect(scopes[ 0 ].type).to.eql('camunda:Connector');

    expect(scopes[ 0 ].properties).to.eql(scopesDescriptor[ 'camunda:Connector' ].properties);
  });


  it('should keep scopes untouched', function() {

    // given
    const templates = require('../fixtures/scopes-array');

    const scopesDescriptor = templates[ 0 ].scopes;

    // when
    const scopes = handleLegacyScopes(scopesDescriptor);

    // then
    expect(isArray(scopes)).to.be.true;

    expect(scopes).to.eql(scopesDescriptor);
  });

});