'use strict';

var isArray = require('min-dash').isArray;

var handleLegacyScopes = require('lib/provider/camunda/element-templates/util/handleLegacyScopes');


describe('element-templates/util - handleLegacyScopes', function() {

  it('should transform legacy scopes descriptor', function() {

    // given
    var templates = require('../fixtures/scopes-single-connector');

    var scopesDescriptor = templates[0].scopes;

    // when
    var scopes = handleLegacyScopes(scopesDescriptor);

    // then
    expect(isArray(scopes)).to.be.true;

    expect(scopes).to.have.length(1);

    expect(scopes[0].type).to.eql('camunda:Connector');

    expect(scopes[0].properties).to.eql(scopesDescriptor['camunda:Connector'].properties);
  });


  it('should keep scopes untouched', function() {

    // given
    var templates = require('../fixtures/scopes-array');

    var scopesDescriptor = templates[0].scopes;

    // when
    var scopes = handleLegacyScopes(scopesDescriptor);

    // then
    expect(isArray(scopes)).to.be.true;

    expect(scopes).to.eql(scopesDescriptor);
  });

});