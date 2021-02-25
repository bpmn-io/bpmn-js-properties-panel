'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var getVersionOrDateFromTemplate = require('lib/provider/camunda/element-templates/parts/Helper').getVersionOrDateFromTemplate;

var domQuery = require('min-dom').query;

var triggerClickEvent = require('lib/Utils').triggerClickEvent;


describe('element-templates/parts - Description Properties', function() {

  var diagramXML = require('./DescriptionProps.bpmn'),
      elementTemplates = require('./DescriptionProps.json');

  beforeEach(bootstrap(diagramXML, elementTemplates));


  it('should show description', inject(function() {

    // given
    selectAndGet('Task_Description');

    // when
    var descriptionEntry = entrySelect('element-template-description');

    // then
    expect(descriptionEntry).to.exist;
  }));


  it('should not show description', inject(function() {

    // given
    selectAndGet('Task');

    // when
    var descriptionEntry = entrySelect('element-template-description');

    // then
    expect(descriptionEntry).not.to.exist;
  }));


  it('should show version label given a version', inject(function() {

    // given
    selectAndGet('Task_Description');

    // when
    var versionEntry = entrySelect('element-template-version');

    // then
    expect(versionEntry).to.exist;
  }));


  it('should hide version label given no version or metadata', inject(function() {

    // given
    selectAndGet('Task');

    // when
    var versionEntry = entrySelect('element-template-version');

    // then
    expect(versionEntry).not.to.exist;
  }));


  it('should indicate element template not found', inject(function() {

    // given
    selectAndGet('Task_TemplateNotFound');

    // when
    var notFound = entrySelect('element-template-not-found');

    // then
    expect(notFound).to.exist;
  }));


  it('should unlink element template not found', inject(function(elementRegistry) {

    // given
    selectAndGet('Task_TemplateNotFound');

    // when
    var notFound = entrySelect('element-template-not-found');

    // assume
    expect(notFound).to.exist;

    // when
    triggerClickEvent(domQuery('.bpp-entry-link', notFound));

    // then
    var task = elementRegistry.get('Task_TemplateNotFound'),
        taskBo = getBusinessObject(task);

    expect(taskBo.modelerTemplate).not.to.exist;
  }));


  describe('update', function() {

    it('should indicate newest element template', inject(function(elementRegistry) {

      // given
      selectAndGet('StartEvent');

      // when
      var update = entrySelect('element-template-update');

      // then
      expect(update).to.exist;
    }));


    it('should not indicate newest element template (no newest element template)', inject(function(elementRegistry) {

      // given
      selectAndGet('EndEvent');

      // when
      var update = entrySelect('element-template-update');

      // then
      expect(update).not.to.exist;
    }));


    it('should not indicate newest element template (no version)', inject(function(elementRegistry) {

      // given
      selectAndGet('Task');

      // when
      var update = entrySelect('element-template-update');

      // then
      expect(update).not.to.exist;
    }));


    it('should update element template', inject(function(elementRegistry) {

      // given
      selectAndGet('StartEvent');

      // when
      var update = entrySelect('element-template-update');

      // assume
      expect(update).to.exist;

      // when
      triggerClickEvent(domQuery('.bpp-entry-link', update));

      // then
      var startEvent = elementRegistry.get('StartEvent'),
          startEventBo = getBusinessObject(startEvent);

      expect(startEventBo.modelerTemplate).to.equal('StartEvent');
      expect(startEventBo.modelerTemplateVersion).to.equal(2);
    }));

  });


  describe('dropdown', function() {

    it('should unlink task template', inject(function(elementRegistry) {

      // given
      selectAndGet('Task_Description');

      // when
      clickDropdownMenuItem('elementTemplateDescription', 'element-template-unlink');

      // then
      var task = elementRegistry.get('Task_Description'),
          taskBo = getBusinessObject(task);

      expect(taskBo.modelerTemplate).not.to.exist;
    }));


    it('should remove task template', inject(function(elementRegistry) {

      // given
      selectAndGet('Task_Description');

      // when
      clickDropdownMenuItem('elementTemplateDescription', 'element-template-remove');

      // then
      var task = elementRegistry.get('Task_Description'),
          taskBo = getBusinessObject(task);

      expect(taskBo.modelerTemplate).not.to.exist;
      expect(taskBo.asyncBefore).to.be.false;
    }));


    it('should remove conditional event template', inject(function(elementRegistry) {

      // given
      selectAndGet('StartEvent');

      // when
      clickDropdownMenuItem('elementTemplateDescription', 'element-template-remove');

      // then
      var event = elementRegistry.get('StartEvent'),
          eventBo = getBusinessObject(event);

      expect(eventBo.modelerTemplate).not.to.exist;
      expect(eventBo.eventDefinitions).to.have.length(1);
      expect(eventBo.asyncBefore).to.be.false;
    }));

  });


  describe('#getVersionOrDateFromTemplate', function() {

    it('should get version as integer', function() {

      // given
      var template = {
        version: 1
      };

      // when
      var versionOrDate = getVersionOrDateFromTemplate(template);

      // then
      expect(versionOrDate).to.equal('Version 1');
    });


    it('should get version as date', function() {

      // given
      var template = {
        version: 1000000000000,
        metadata: {
          created: 1000000000000
        }
      };

      // when
      var versionOrDate = getVersionOrDateFromTemplate(template);

      // then
      expect(versionOrDate).to.match(/Version [0-9]{2}\.[0-9]{2}\.[0-9]{4}/);
    });


    it('should get version as date', function() {

      // given
      var template = {
        version: 1000000000000,
        metadata: {
          updated: 1000000000000
        }
      };

      // when
      var versionOrDate = getVersionOrDateFromTemplate(template);

      // then
      expect(versionOrDate).to.match(/Version [0-9]{2}\.[0-9]{2}\.[0-9]{4}/);
    });

  });

});

// helpers //////////

function openDropdown(groupId) {
  TestHelper.getBpmnJS().invoke(function(propertiesPanel) {
    var dropdownButton = domQuery('.bpp-properties-group[data-group=' + groupId + '] .group__dropdown', propertiesPanel._container);

    triggerClickEvent(dropdownButton);
  });
}

function clickDropdownMenuItem(groupId, menuItemId) {
  TestHelper.getBpmnJS().invoke(function(propertiesPanel) {
    openDropdown(groupId);

    var dropdownMenuItem = domQuery(
      '.bpp-properties-group[data-group=' + groupId + '] .group__dropdown .group__dropdown-menu-item[data-dropdown-action=' + menuItemId + ']',
      propertiesPanel._container);

    triggerClickEvent(dropdownMenuItem);
  });
}
