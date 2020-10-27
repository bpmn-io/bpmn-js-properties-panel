'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

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


  it('should show date last modified', inject(function() {

    // given
    selectAndGet('Task_Description');

    // when
    var dateLastModifiedEntry = entrySelect('element-template-date-last-modified');

    // then
    expect(dateLastModifiedEntry).to.exist;
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
      selectAndGet('StartEvent_Template');

      // when
      clickDropdownMenuItem('elementTemplateDescription', 'element-template-remove');

      // then
      var event = elementRegistry.get('StartEvent_Template'),
          eventBo = getBusinessObject(event);

      expect(eventBo.modelerTemplate).not.to.exist;
      expect(eventBo.eventDefinitions).to.have.length(1);
      expect(eventBo.asyncBefore).to.be.false;
    }));

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