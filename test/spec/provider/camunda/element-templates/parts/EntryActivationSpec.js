'use strict';

require('../../../../../TestHelper');

/* global inject */

var entrySelect = require('./Helper').entrySelect,
    selectAndGet = require('./Helper').selectAndGet,
    bootstrap = require('./Helper').bootstrap;

var domMatches = require('min-dom/lib/matches');


describe('element-templates/parts - entry activation', function() {

  describe('readonly', function() {

    var diagramXML = require('./EntryActivation-editable.bpmn'),
        elementTemplates = require('./EntryActivation-editable');

    beforeEach(bootstrap(diagramXML, elementTemplates));


    it('should set Boolean edit state', inject(function() {

      // when
      selectAndGet('Task');

      // then
      expectEditable('custom-task.editable-0', 'input');
      expectReadonly('custom-task.editable-1', 'input');
    }));


    it('should set String edit state', inject(function() {

      // when
      selectAndGet('Task');

      // then
      expectEditable('custom-task.editable-2', 'input');
      expectReadonly('custom-task.editable-3', 'input');
    }));


    it('should set Text edit state', inject(function() {

      // when
      selectAndGet('Task');

      // then
      expectEditable('custom-task.editable-4', 'div[contenteditable]');
      expectReadonly('custom-task.editable-5', 'div[contenteditable]');
    }));

  });

});


/////// helpers //////////////////////////////

function expectEditable(entryId, inputSelector) {
  expectEditState(entryId, inputSelector, true);
}

function expectReadonly(entryId, inputSelector) {
  expectEditState(entryId, inputSelector, false);
}

function expectEditState(entryId, inputSelector, editable) {

  var inputNode = entrySelect(entryId, inputSelector);

  if (!inputNode) {
    console.error('Input node for', entryId, '#', inputSelector, 'does not exist');
  }

  expect(inputNode).to.exist;

  expect(domMatches(inputNode, '[readonly]')).to.eql(!editable);
}
