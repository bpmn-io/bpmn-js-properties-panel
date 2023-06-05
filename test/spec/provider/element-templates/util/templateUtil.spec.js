import {
  getVersionOrDateFromTemplate
} from 'src/provider/element-templates/util/templateUtil';

import TestContainer from 'mocha-test-container-support';

import { bootstrapModeler } from 'test/TestHelper';

import coreModule from 'bpmn-js/lib/core';
import elementTemplatesModule from 'src/provider/element-templates';
import modelingModule from 'bpmn-js/lib/features/modeling';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';

import diagramXML from '../fixtures/template-util.bpmn';


describe('provider/element-template - templateUtil', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  beforeEach(bootstrapModeler(diagramXML, {
    container: container,
    modules: [
      coreModule,
      elementTemplatesModule,
      modelingModule,
      {
        propertiesPanel: [ 'value', { registerProvider() {} } ]
      }
    ],
    moddleExtensions: {
      camunda: camundaModdlePackage
    }
  }));


  describe('#getVersionOrDateFromTemplate', function() {

    it('should return readable date from metadata.created', function() {

      // given
      const template = { metadata: { created: 0 } };

      // when
      const date = getVersionOrDateFromTemplate(template);

      // then
      expect(date).to.eql('01.01.1970 01:00');
    });


    it('should return readable date from metadata.updated', function() {

      // given
      const template = { metadata: { updated: 0 } };

      // when
      const date = getVersionOrDateFromTemplate(template);

      // then
      expect(date).to.eql('01.01.1970 01:00');
    });


    it('should return version if metadata is not present', function() {

      // given
      const template = { version: 0 };

      // when
      const version = getVersionOrDateFromTemplate(template);

      // then
      expect(version).to.eql(0);
    });


    it('should return null if neither version nor metadate is present', function() {

      // given
      const template = {};

      // when
      const result = getVersionOrDateFromTemplate(template);

      // then
      expect(result).to.be.null;
    });
  });

});
