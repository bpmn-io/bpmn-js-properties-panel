'use strict';

var ElementTemplates = require('../../../../../lib/provider/camunda/element-templates/ElementTemplates');


describe('element-templates - ElementTemplates', function() {

  function errors(templates) {
    return templates._errors.map(function(e) {
      return e.message;
    });
  }

  function parsed(templates) {
    return Object.keys(templates._all).map(function(k) {
      return templates._all[k];
    });
  }


  describe('add', function() {

    it('should accept vip-ordering example template', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/vip-ordering');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(parsed(templates)).to.have.length(1);
    });


    it('should accept misc example template', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/misc');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(parsed(templates)).to.have.length(1);
    });


    it('should accept dropdown example template', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/dropdown');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(parsed(templates)).to.have.length(1);
    });


    it('should reject missing id', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-id-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('missing template id');

      expect(parsed(templates)).to.be.empty;
    });


    it('should reject duplicate id', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-id-duplicate');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template id <foo> already used');

      expect(parsed(templates)).to.have.length(1);
    });


    it('should reject missing appliesTo', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-appliesTo-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: foo) missing appliesTo=[]');

      expect(parsed(templates)).to.be.empty;
    });


    it('should reject missing properties', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-properties-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: foo) missing properties=[]');

      expect(parsed(templates)).to.be.empty;
    });


    it('should reject missing dropdown choices', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-dropdown-choices-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'must provide choices=[] with Dropdown type'
      ]);

      expect(parsed(templates)).to.be.empty;
    });


    it('should reject invalid dropdown choices', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-dropdown-choices-invalid');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        '{ name, value } must be specified for Dropdown choices'
      ]);

      expect(parsed(templates)).to.be.empty;
    });


    it('should reject invalid property', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-property-invalid');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'invalid property type <InvalidType>; must be any of { String, Text, Boolean, Dropdown }',
        'invalid property.binding type <alsoInvalid>; must be any of { property, camunda:property, camunda:inputParameter, camunda:outputParameter }'
      ]);

      expect(parsed(templates)).to.be.empty;
    });


    it('should reject invalid bindings', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/error-bindings-invalid');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'property.binding <property> requires name',
        'property.binding <camunda:property> requires name',
        'property.binding <camunda:inputParameter> requires name',
        'property.binding <camunda:outputParameter> requires source'
      ]);

      expect(parsed(templates)).to.be.empty;
    });

  });


  describe('get', function() {

    it('should retrieve template by id', function() {

      // given
      var templates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/vip-ordering');

      templates.addAll(templateDescriptors);

      // when
      var descriptor = templates.get('e.com.merce.FastPath');

      // then
      expect(descriptor).to.eql(templateDescriptors[0]);
    });


    it('should retrieve all known', function() {

      // given
      var templates = new ElementTemplates();

      templates._all = {};

      // when
      var allTemplates = templates.getAll();

      // then
      expect(allTemplates).to.equal(templates._all);
    });

  });

});