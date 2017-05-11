'use strict';

require('../../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

/* global bootstrapModeler, inject, sinon */

var coreModule = require('bpmn-js/lib/core'),
    modelingModule = require('bpmn-js/lib/features/modeling'),
    propertiesPanelCommandsModule = require('../../../../../lib/cmd'),
    elementTemplatesModule = require('../../../../../lib/provider/camunda/element-templates'),
    camundaModdlePackage = require('camunda-bpmn-moddle/resources/camunda');


describe('element-templates - ElementTemplatesLoader', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('init with Array<TemplateDescriptor>', function() {

    var diagramXML = require('./fixtures/empty-diagram.bpmn');

    var templateDescriptors = require('./fixtures/misc');

    beforeEach(bootstrapModeler(diagramXML, {
      container: container,
      modules: [
        coreModule,
        modelingModule,
        propertiesPanelCommandsModule,
        elementTemplatesModule
      ],
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      elementTemplates: templateDescriptors
    }));


    it('should configure elementTemplates service', inject(function(elementTemplates) {

      // then
      expect(elementTemplates.getAll()).to.eql(templateDescriptors);
    }));


    it('should emit <elementTemplates.changed> event', inject(function(elementTemplatesLoader, eventBus) {

      // given
      var changedListener = sinon.spy(function() {});

      eventBus.on('elementTemplates.changed', changedListener);

      // when
      elementTemplatesLoader.reload();

      // then
      expect(changedListener).to.have.been.called;
    }));

  });


  describe('init with node style callback', function() {

    var diagramXML = require('./fixtures/empty-diagram.bpmn');

    var templateDescriptors = require('./fixtures/misc');

    var PROVIDER = function(done) {
      done(null, templateDescriptors);
    };

    var templateProviderFn = function(done) {
      PROVIDER(done);
    };

    beforeEach(bootstrapModeler(diagramXML, {
      container: container,
      modules: [
        coreModule,
        modelingModule,
        propertiesPanelCommandsModule,
        elementTemplatesModule
      ],
      moddleExtensions: {
        camunda: camundaModdlePackage
      },
      elementTemplates: templateProviderFn
    }));


    it('should configure elementTemplates service',
      inject(function(elementTemplates) {

        // then
        expect(elementTemplates.getAll()).to.eql(templateDescriptors);
      })
    );


    it('should emit <elementTemplates.changed> event',
      inject(function(elementTemplatesLoader, eventBus) {

        // given
        var changedListener = sinon.spy(function() {});

        eventBus.on('elementTemplates.changed', changedListener);

        // when
        elementTemplatesLoader.reload();

        // then
        expect(changedListener).to.have.been.called;
      })
    );


    it('should NOT emit <elementTemplates.errors> event',
      inject(function(elementTemplatesLoader, eventBus) {

        // given
        var errorListener = sinon.spy(function() {
          console.log(arguments);
        });

        eventBus.on('elementTemplates.errors', errorListener);

        // when
        elementTemplatesLoader.reload();

        // then
        expect(errorListener).not.to.have.been.called;
      })
    );


    it('should handle templates load errors', inject(
      function(elementTemplatesLoader, eventBus) {

        // given
        PROVIDER = function(done) {
          done(new Error('foo'));
        };

        var errorListener = sinon.spy(function(e) {

          var errors = e.errors;

          expect(errors).to.have.length(1);

          expect(errors[0].message).to.eql('foo');
        });

        var changedListener = sinon.spy(function() {});

        eventBus.on('elementTemplates.errors', errorListener);
        eventBus.on('elementTemplates.changed', changedListener);

        // when
        elementTemplatesLoader.reload();

        // then
        expect(errorListener).to.have.been.called;
        expect(changedListener).not.to.have.been.called;
      })
    );


    it('should handle templates validation error',
      inject(function(elementTemplatesLoader, eventBus) {

        // given
        PROVIDER = function(done) {
          done(null, [
            { id: 'foo', appliesTo: [ 'foo:Bar' ], properties: [ ] },
            { id: 'foo' },
            { id: 'foo' }
          ]);
        };

        var errorListener = sinon.spy(function(e) {

          var errors = e.errors;

          expect(messages(errors)).to.eql([
            'template id <foo> already used',
            'template id <foo> already used'
          ]);
        });

        var changedListener = sinon.spy(function() {});

        eventBus.on('elementTemplates.errors', errorListener);
        eventBus.on('elementTemplates.changed', changedListener);

        // when
        elementTemplatesLoader.reload();

        // then
        expect(errorListener).to.have.been.called;
        expect(changedListener).to.have.been.called;

      })
    );

  });

});


//////////// helpers ////////////////////////////

function messages(errors) {
  return errors.map(function(e) {
    return e.message;
  });
}