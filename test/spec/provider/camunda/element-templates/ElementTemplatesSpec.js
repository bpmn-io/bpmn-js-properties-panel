'use strict';

var ElementTemplates = require('../../../../../lib/provider/camunda/element-templates/ElementTemplates');


describe('element-templates - ElementTemplates', function() {

  describe('set', function() {

    it('should set templates', function() {

      // given
      var templateDescriptors = require('./fixtures/vip-ordering');

      var elementTemplates = new ElementTemplates();

      // when
      elementTemplates.set(templateDescriptors);

      // then
      expect(elementTemplates.getAll()).to.eql(templateDescriptors);
    });


    it('should clear on set', function() {

      // given
      var templateDescriptors = require('./fixtures/vip-ordering');

      var elementTemplates = new ElementTemplates().set(templateDescriptors);

      // when
      elementTemplates.set([]);

      // then
      expect(elementTemplates.getAll()).to.eql([]);
    });

  });


  describe('get', function() {

    it('should retrieve template by id', function() {

      // given
      var elementTemplates = new ElementTemplates();

      var templateDescriptors = require('./fixtures/vip-ordering');

      elementTemplates.set(templateDescriptors);

      // when
      var descriptor = elementTemplates.get('e.com.merce.FastPath');

      // then
      expect(descriptor).to.eql(templateDescriptors[0]);
    });

  });

});