'use strict';

var TestHelper = require('../../../../../TestHelper');

/* global bootstrapModeler, inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var domClasses = require('min-dom/lib/classes');


describe('element-templates/parts - Visibility', function() {

  var diagramXML = require('./Visibility.bpmn'),
      elementTemplates = require('./Visibility.json');

  beforeEach(bootstrap(diagramXML, elementTemplates));


  it('should show default entries', inject(function() {

    // when
    selectAndGet('Task_Default');

    // then
    expectShown([
      'id',
      'name',
      'elementTemplate-chooser'
    ]);

    expectHidden([
      'asyncBefore',
      'executionListeners'
    ]);
  }));


  describe('customization', function() {

    it('should show all entries', inject(function() {

      // when
      selectAndGet('Task_All');

      // then
      expectShown([
        'id',
        'name',
        'elementTemplate-chooser',
        'documentation',
        'asyncBefore',
        'executionListeners',
        'properties'
      ]);
    }));


    it('should hide entries selectively', inject(function() {

      // when
      selectAndGet('Task_AllButSome');

      // then
      expectShown([
        'id',
        'properties',
        'parameterName',
        'elementTemplate-chooser'
      ]);

      expectHidden([
        'name',
        'asyncBefore',
        'asyncAfter',
        'documentation',
        'executionListeners'
      ]);
    }));


    it('should show entries selectively', inject(function() {

      // when
      selectAndGet('Task_Some');

      // then
      expectShown([
        'elementTemplate-chooser',
        'asyncBefore',
        'asyncAfter',
        'executionListeners',
        'documentation'
      ]);

      expectHidden([
        'id',
        'name',
        'properties',
        'parameterName',
      ]);
    }));

  });

});


var HIDDEN_CLS = 'pp-hidden';

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