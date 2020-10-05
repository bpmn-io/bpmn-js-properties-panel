'use strict';

var TestContainer = require('mocha-test-container-support');

var domQuery = require('min-dom').query;

var assign = require('min-dash').assign;

var entryFactory = require('lib/factory/EntryFactory');

var INPUT_WIDTH = '200px';

var SUGGESTION_LIST_WIDTH = '100px';

var SMALL_SUGGESTION_LIST_HEIGHT = '50px';

var LARGE_SUGGESTION_LIST_HEIGHT = '300px';


var DUMMY_CONTENT = 'foobar foobar foobar foobar <br/>' +
            'foobar <br/> foobar <br/> foobar <br/>' +
            'foobar foobar foobar foobar <br/>';


describe('factory/AutoSuggestTextBoxFactory', function() {

  describe('#getSuggestionListPosition', function() {
    var container,
        entry,
        wrapperNode,
        inputNode,
        listNode;

    beforeEach(function() {
      container = TestContainer.get(this);
    });

    beforeEach(function() {
      entry = entryFactory.autoSuggest(translate, { id: 'foo' });

      container.appendChild(entry.html);

      wrapperNode = domQuery('.bpp-field-wrapper', container);
      assign(wrapperNode.style, { width: INPUT_WIDTH });

      inputNode = domQuery('[contenteditable]', container);

      listNode = domQuery('.bpp-autosuggest-list', container);
      assign(listNode.style, {
        width: SUGGESTION_LIST_WIDTH,
        height: SMALL_SUGGESTION_LIST_HEIGHT,
        position: 'fixed'
      });

      // expand a bit to create all scenarios
      inputNode.innerHTML = DUMMY_CONTENT;
    });

    it('should place to bottom-right', function() {

      // given
      setCaretPosition(inputNode, 10);

      // when
      var position = entry.getSuggestionListPosition(listNode, wrapperNode);

      // then
      expect(position.orientation).to.equal('bottom-right');
    });


    it('should place to bottom-left', function() {

      // given
      setCaretPosition(inputNode, 20);

      // when
      var position = entry.getSuggestionListPosition(listNode, wrapperNode);

      // then
      expect(position.orientation).to.equal('bottom-left');
    });


    it('should place to top-right', function() {

      // given
      assign(listNode.style, { height: LARGE_SUGGESTION_LIST_HEIGHT });
      setCaretPosition(inputNode, 10);

      // when
      var position = entry.getSuggestionListPosition(listNode, wrapperNode);

      // then
      expect(position.orientation).to.equal('top-right');
    });


    it('should place to top-left', function() {

      // given
      assign(listNode.style, { height: LARGE_SUGGESTION_LIST_HEIGHT });
      setCaretPosition(inputNode, 20);

      // when
      var position = entry.getSuggestionListPosition(listNode, wrapperNode);

      // then
      expect(position.orientation).to.equal('top-left');
    });

  });

});


// helper //////////////////////////

function setCaretPosition(node, position) {
  var range = document.createRange(),
      selection = window.getSelection(),
      focusNode = node.childNodes[0];

  range.setStart(focusNode, position);
  range.setEnd(focusNode, position);

  selection.removeAllRanges();

  selection.addRange(range);
}

function translate(string) {
  return string;
}