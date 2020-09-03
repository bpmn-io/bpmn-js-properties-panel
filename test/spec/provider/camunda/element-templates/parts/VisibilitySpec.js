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
      'elementTemplate-chooser',
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
        'elementTemplate-chooser',
        'executionListeners'
      ]);
    }));

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
