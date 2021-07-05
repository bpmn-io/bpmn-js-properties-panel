'use strict';

var Validator = require('lib/provider/camunda/element-templates/Validator');

var getTemplateSchemaVersion = require('@bpmn-io/element-templates-validator').getSchemaVersion;

var ElementTemplateSchemaVersion = getTemplateSchemaVersion();


describe('element-templates - Validator', function() {

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
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple-same-schema-version.json');

      templateDescriptor.map(function(template) {
        template.$schema = 'https://unpkg.com/@camunda/element-templates-json-schema@' +
          ElementTemplateSchemaVersion + '/resources/schema.json';
      });

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(6);
    });


    it('should accept when template has lower version than library', function() {

      // given
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple-low-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(6);
    });


    it('should reject when template has higher version than library', function() {

      // given
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple-high-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(valid(templates)).to.be.empty;

      expect(errors(templates)).to.have.length(6);
    });


    it('should accept when template has no version', function() {

      // given
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(6);
    });


    it('should accept when template has latest version', function() {

      // given
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple-latest-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(6);
    });


    it('should accept and reject when some templates have unsupported version', function() {

      // given
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple-mixed-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.have.length(3);

      expect(valid(templates)).to.have.length(3);
    });


    it('should provide correct error details when rejecting', function() {

      // given
      var templates = new Validator();

      var templateDescriptor = require('./fixtures/simple-high-schema-version.json');

      // when
      templates.addAll(templateDescriptor);

      // then
      expect(errors(templates)).to.have.length(6);

      expect(errors(templates)[0]).to.eql('template(id: <foo>, name: <Foo>): unsupported element template schema version <99.99.99>. Your installation only supports up to version <'+ ElementTemplateSchemaVersion + '>. Please update your installation');
    });

  });


  describe('content validation', function() {

    it('should accept simple example template', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/simple');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(6);
    });


    it('should accept misc example template', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/misc');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


    it('should accept call-activity-variables template', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/call-activity-variables');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


    it('should accept dropdown example template', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/dropdown');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


    it('should reject missing name', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-name-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: <invalid>, name: <undefined>): missing template name');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject missing id', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-id-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: <undefined>, name: <Invalid>): missing template id');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject duplicate id', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-id-duplicate');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: <foo>, name: <Foo 2>): template id <foo> already used');

      expect(valid(templates)).to.have.length(1);
    });


    it('should reject duplicate id and version', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-id-version-duplicate');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: <foo>, name: <Foo 2>): template id <foo> and version <1> already used');

      expect(valid(templates)).to.have.length(1);
    });


    it('should reject missing appliesTo', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-appliesTo-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: <foo>, name: <Invalid>): missing appliesTo=[]');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject missing properties', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-properties-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.contain('template(id: <foo>, name: <Invalid>): missing properties=[]');

      expect(valid(templates)).to.be.empty;
    });


    it('should reject missing dropdown choices', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-dropdown-choices-missing');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'template(id: <bar>, name: <Task>): must provide choices=[] with "Dropdown" type'
      ]);

      expect(valid(templates)).to.be.empty;
    });


    it('should reject invalid dropdown choices', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-dropdown-choices-invalid');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'template(id: <bar>, name: <Task>): { name, value } must be specified for "Dropdown" choices'
      ]);

      expect(valid(templates)).to.be.empty;
    });


    it('should reject invalid property', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-property-invalid');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'template(id: <foo>, name: <Invalid>): invalid property.binding type "alsoInvalid"; must be any of { ' +
        'property, camunda:property, camunda:inputParameter, ' +
        'camunda:outputParameter, camunda:in, camunda:out, ' +
        'camunda:in:businessKey, camunda:executionListener, ' +
        'camunda:field, camunda:errorEventDefinition ' +
      '}'
      ]);

      expect(valid(templates)).to.be.empty;
    });


    it('should reject invalid bindings', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-bindings-invalid');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'template(id: <foo>, name: <Invalid>): property.binding "property" requires name',
        'template(id: <foo>, name: <Invalid>): property.binding "camunda:property" requires name',
        'template(id: <foo>, name: <Invalid>): property.binding "camunda:inputParameter" requires name',
        'template(id: <foo>, name: <Invalid>): property.binding "camunda:outputParameter" requires source',
        'template(id: <foo>, name: <Invalid>): property.binding "camunda:in" requires variables, target, or both',
        'template(id: <foo>, name: <Invalid>): property.binding "camunda:out" requires one of the following: variables, sourceExpression, source, (sourceExpression and variables), or (source and variables)',
        'template(id: <foo>, name: <Invalid>): property.binding "camunda:errorEventDefinition" requires errorRef'
      ]);

      expect(valid(templates)).to.be.empty;
    });


    it('should accept type "hidden" for execution listeners', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/execution-listener');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


    it('should accept missing type', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/missing-types');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


    it('should reject invalid types for execution listeners', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-execution-listener-invalid-type');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.eql([
        'template(id: <my.execution.listener.task>, name: <Execution Listener>): invalid property type "String" for binding type "camunda:executionListener"; must be "Hidden"',
        'template(id: <my.execution.listener.task>, name: <Execution Listener>): invalid property type "Text" for binding type "camunda:executionListener"; must be "Hidden"',
        'template(id: <my.execution.listener.task>, name: <Execution Listener>): invalid property type "Boolean" for binding type "camunda:executionListener"; must be "Hidden"',
        'template(id: <my.execution.listener.task>, name: <Execution Listener>): must provide choices=[] with "Dropdown" type',
        'template(id: <my.execution.listener.task>, name: <Execution Listener>): invalid property type "Dropdown" for binding type "camunda:executionListener"; must be "Hidden"',
      ]);

      expect(valid(templates)).to.have.length(0);
    });


    describe('scopes', function() {

      it('should accept scopes as array', function() {

        // given
        var templates = new Validator();

        var templateDescriptors = require('./fixtures/scopes-array');

        // when
        templates.addAll(templateDescriptors);

        // then
        expect(errors(templates)).to.be.empty;

        expect(valid(templates)).to.have.length(1);
      });


      it('should accept scopes as object descriptor (connectors)', function() {

        // given
        var templates = new Validator();

        var templateDescriptors = require('./fixtures/scopes-single-connector');

        // when
        templates.addAll(templateDescriptors);

        // then
        expect(errors(templates)).to.be.empty;

        expect(valid(templates)).to.have.length(1);
      });


      it('should reject invalid scopes content', function() {

        // given
        var templates = new Validator();

        var templateDescriptors = require('./fixtures/error-scopes-invalid-scope');

        // when
        templates.addAll(templateDescriptors);

        // then
        expect(errors(templates)).to.contain('template(id: <foo>, name: <Invalid>): invalid scope "properties", object descriptor is only supported for "camunda:Connector"');

        expect(valid(templates)).to.be.empty;
      });


      it('should reject missing scope properties', function() {

        // given
        var templates = new Validator();

        var templateDescriptors = require('./fixtures/error-scopes-properties-missing');

        // when
        templates.addAll(templateDescriptors);

        // then
        expect(errors(templates)).to.contain(
          'template(id: <foo>, name: <Invalid>): invalid scope "camunda:Connector", missing properties=[]'
        );

        expect(valid(templates)).to.be.empty;
      });


      it('should reject missing scope type', function() {

        // given
        var templates = new Validator();

        var templateDescriptors = require('./fixtures/error-scopes-type-missing');

        // when
        templates.addAll(templateDescriptors);

        // then
        expect(errors(templates)).to.contain(
          'template(id: <foo>, name: <Invalid>): invalid scope, missing type'
        );

        expect(valid(templates)).to.be.empty;
      });


      it('should reject scope with invalid property', function() {

        // given
        var templates = new Validator();

        var templateDescriptors = require('./fixtures/error-scopes-property-invalid');

        // when
        templates.addAll(templateDescriptors);

        // then
        expect(errors(templates)).to.eql([
          'template(id: <foo>, name: <Invalid>): invalid property.binding type "alsoInvalid"; must be any of { ' +
          'property, camunda:property, camunda:inputParameter, ' +
          'camunda:outputParameter, camunda:in, camunda:out, ' +
          'camunda:in:businessKey, camunda:executionListener, ' +
          'camunda:field, camunda:errorEventDefinition ' +
        '}'
        ]);
        expect(valid(templates)).to.be.empty;
      });

    });


    it('should accept field injections example template', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/field-injections');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


    it('should accept errors example template', function() {

      // given
      var templates = new Validator();

      var templateDescriptors = require('./fixtures/error-templates');

      // when
      templates.addAll(templateDescriptors);

      // then
      expect(errors(templates)).to.be.empty;

      expect(valid(templates)).to.have.length(1);
    });


  });
});
