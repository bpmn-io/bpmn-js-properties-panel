'use strict';

require('../../../../../TestHelper');

/* global inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var domClasses = require('min-dom').classes;

var VERY_HIGH_PRIORITY = 3000;


describe('element-templates/parts - Visibility', function() {

  var diagramXML = require('./Visibility.bpmn'),
      elementTemplates = require('./Visibility');

  beforeEach(bootstrap(diagramXML, elementTemplates));


  it('should only show element template tab entries if applied', inject(function() {

    // when
    selectAndGet('Task_1');

    // then
    expectShown([
      'element-template-description',
      'element-template-element-id',
      'element-template-element-name'
    ]);

    expectHidden([
      'asyncBefore',
      'executionListeners'
    ]);
  }));


  describe('customization', function() {

    it('should allow overriding', inject(function(eventBus) {

      // given
      eventBus.on('propertiesPanel.isEntryVisible', VERY_HIGH_PRIORITY, function(context) {
        var entry = context.entry;

        return entry.id === 'asyncBefore';
      });

      // when
      selectAndGet('Task_1');

      // then
      expectShown([
        'asyncBefore'
      ]);

      expectHidden([
        'executionListeners'
      ]);
    }));


    describe('entriesVisible', function() {

      it('all entries visible', inject(function(elementTemplatesLoader) {

        // given
        elementTemplatesLoader.setTemplates([
          {
            name: 'Foo',
            id: 'foo',
            description: 'Foo',
            appliesTo: [
              'bpmn:Task'
            ],
            properties: [],
            entriesVisible: true
          }
        ]);

        // when
        selectAndGet('Task_1');

        // then
        expectShown([
          'element-template-description',
          'element-template-element-id',
          'element-template-element-name',
          'asyncBefore',
          'executionListeners'
        ]);
      }));


      it('all entries visible by default', inject(function(elementTemplatesLoader) {

        // given
        elementTemplatesLoader.setTemplates([
          {
            name: 'Foo',
            id: 'foo',
            description: 'Foo',
            appliesTo: [
              'bpmn:Task'
            ],
            properties: [],
            entriesVisible: {
              _all: true
            }
          }
        ]);

        // when
        selectAndGet('Task_1');

        // then
        expectShown([
          'element-template-description',
          'element-template-element-id',
          'element-template-element-name',
          'asyncBefore',
          'executionListeners'
        ]);
      }));


      it('all entries visible by default, asyncBefore hidden', inject(function(elementTemplatesLoader) {

        // given
        elementTemplatesLoader.setTemplates([
          {
            name: 'Foo',
            id: 'foo',
            description: 'Foo',
            appliesTo: [
              'bpmn:Task'
            ],
            properties: [],
            entriesVisible: {
              _all: true,
              asyncBefore: false
            }
          }
        ]);

        // when
        selectAndGet('Task_1');

        // then
        expectShown([
          'element-template-description',
          'element-template-element-id',
          'element-template-element-name',
          'executionListeners'
        ]);

        expectHidden([
          'asyncBefore'
        ]);
      }));


      it('all entries hidden by default, asyncBefore visible', inject(function(elementTemplatesLoader) {

        // given
        elementTemplatesLoader.setTemplates([
          {
            name: 'Foo',
            id: 'foo',
            description: 'Foo',
            appliesTo: [
              'bpmn:Task'
            ],
            properties: [],
            entriesVisible: {
              asyncBefore: true
            }
          }
        ]);

        // when
        selectAndGet('Task_1');

        // then
        expectShown([
          'element-template-description',
          'element-template-element-id',
          'element-template-element-name',
          'asyncBefore'
        ]);

        expectHidden([
          'executionListeners'
        ]);
      }));

    });

  });

});


var HIDDEN_CLS = 'bpp-hidden';

function expectShown(entryIds) {
  expectVisibility(entryIds, true);
}

function expectHidden(entryIds) {
  expectVisibility(entryIds, false);
}

function expectVisibility(entryIds, shown) {

  if (typeof entryIds === 'string') {
    entryIds = [ entryIds ];
  }

  entryIds.forEach(function(entryId) {
    var entryNode = entrySelect(entryId);

    if (!entryNode) {
      console.error('Node for', entryId, 'does not exist');
    }

    expect(entryNode).to.exist;

    var classes = domClasses(entryNode);

    expect(classes.has(HIDDEN_CLS)).to.eql(!shown);
  });
}
