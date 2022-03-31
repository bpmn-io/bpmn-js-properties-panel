import { Validator } from 'src/provider/cloud-element-templates/Validator';

import { getZeebeSchemaVersion as getTemplateSchemaVersion } from '@bpmn-io/element-templates-validator';

const ElementTemplateSchemaVersion = getTemplateSchemaVersion();


describe('provider/cloud-element-templates - Validator', function() {

  function errors(validator) {
    return validator.getErrors().map(function(e) {
      return e.message;
    });
  }

  function valid(validator) {
    return validator.getValidTemplates();
  }

  describe('schema version', function() {

    it('should accept when template and library have the same version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-same-schema-version.json');

      templateDescriptor.map(function(template) {
        template.$schema = 'https://unpkg.com/@camunda/zeebe-element-templates-json-schema@' +
          ElementTemplateSchemaVersion + '/resources/schema.json';
      });

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept when template has lower version than library', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-low-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should reject when template has higher version than library', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-high-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(valid(templates)).to.be.empty;

      expect(errors(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept when template has no version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept when template has latest version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-latest-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept and reject when some templates have unsupported version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-mixed-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.have.length(3);

      expect(valid(templates)).to.have.length(3);
    });


    it('should provide correct error details when rejecting', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-high-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.have.length(6);

      expect(errors(templates)[0]).to.eql('template(id: <foo>, name: <Foo>): unsupported element template schema version <99.99.99>. Your installation only supports up to version <' + ElementTemplateSchemaVersion + '>. Please update your installation');
    });

  });


  describe('schema attribute', function() {

    it('should accept', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-defined-schema.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept - other vendor', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-other-vendor-schema.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should reject - missing $schema', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-missing-schema.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(valid(templates)).to.be.empty;

      expect(errors(templates)).to.jsonEqual([
        'template(id: <foo>, name: <Foo>): missing $schema attribute.'
      ]);
    });


    it('should reject - wrong $schema', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple-wrong-schema.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(valid(templates)).to.be.empty;

      expect(errors(templates)).to.jsonEqual([
        'template(id: <foo>, name: <Foo>): unsupported $schema attribute <https://unpkg.com/@camunda/element-templates-json-schema/resources/schema.json>.'
      ]);
    });

  });


  describe('content validation', function() {

    it('should accept simple example templates', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/simple');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept complex example templates', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/complex');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should accept connectors templates', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/connectors');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(templateDescriptor.length);
    });


    it('should reject missing name', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-name-missing');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <invalid>, name: <undefined>): missing template name');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject missing id', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-id-missing');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <undefined>, name: <Invalid>): missing template id');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject missing binding', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-binding-missing');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <invalid>, name: <Invalid>): missing binding for property "0"');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject duplicate id', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-id-duplicate');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <foo>, name: <Foo 2>): template id <foo> already used');

      expect(valid(templates)).to.have.length(1);
    });


    it('should reject duplicate id and version', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-id-version-duplicate');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <foo>, name: <Foo 2>): template id <foo> and version <1> already used');

      expect(valid(templates)).to.have.length(1);
    });


    it('should reject invalid optional binding type', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-invalid-optional');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <invalid>, name: <Invalid>): optional is not supported for binding type "zeebe:taskHeader"; must be any of { zeebe:input, zeebe:output }');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject optional=true <-> constraints.notEmpty=true', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-optional-not-empty');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <invalid>, name: <Invalid>): optional is not allowed for truthy "notEmpty" constraint');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject feel on invalid type', function() {

      // given
      const templates = new Validator();

      const templateDescriptor = require('./fixtures/error-feel-invalid-type');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.contain('template(id: <invalid>, name: <Invalid>): feel is only supported for "String" and "Text" type');

      expect(valid(templates)).to.be.empty;
    });


    describe('grouping', function() {

      it('should accept groups', function() {

        // given
        const templates = new Validator();

        const templateDescriptor = require('./fixtures/groups');

        // when
        templates.addAll(templateDescriptor);

        // then
        expect(errors(templates)).to.be.empty;

        expect(valid(templates)).to.have.length(templateDescriptor.length);
      });


      it('should not accept missing group id', function() {

        // given
        const templates = new Validator();

        const templateDescriptor = require('./fixtures/error-groups-missing-id');

        // when
        templates.addAll(templateDescriptor);

        // then
        expect(errors(templates)).to.contain('template(id: <example.com.missingGroupId>, name: <Missing group id>): missing id for group "0"');

        expect(valid(templates)).to.be.empty;
      });

    });


    describe('icons', function() {

      it('should accept icons', function() {

        // given
        const templates = new Validator();

        const templateDescriptor = require('./fixtures/icons');

        // when
        templates.addAll(templateDescriptor);

        // then
        expect(errors(templates)).to.be.empty;

        expect(valid(templates)).to.have.length(templateDescriptor.length);
      });


      it('should not accept malformed uri', function() {

        // given
        const templates = new Validator();

        const templateDescriptor = require('./fixtures/error-icon-malformed');

        // when
        templates.addAll(templateDescriptor);

        // then
        expect(errors(templates)).to.contain('template(id: <icon.template.malformed-icon>, name: <Malformed Icon URI>): Malformed icon source, must be a valid HTTP(s) or data URL');

        expect(valid(templates)).to.be.empty;
      });
    });

  });

});
