'use strict';

var calculateSelectionUpdate = require('../../../lib/util/StringUtils').calculateSelectionUpdate;


describe('StringUtils', function() {

  describe('#calculateSelectionUpdate', function() {

    describe('should handle select ALL', function() {

      it('with content removed from middle', expectSelection('|AABBC|', 'AA|C'));

      it('with content added in middle', expectSelection('|AABBC|', 'AAVV|BBC'));

    });


    describe('same string update', function() {

      it('should keep mid selection', expectSelection('AABB|CCC', 'AABB|CCC'));

      it('should keep start selection', expectSelection('|AABBCCC', '|AABBCCC'));

      it('should keep end selection', expectSelection('AABBCCC|', 'AABBCCC|'));

    });


    describe('should handle empty string', function() {

      it('with content added', expectSelection('|', 'AAA|'));

    });


    describe('should modify cursor adding content', function() {

      it('after cursor', expectSelection('AA|BBC', 'AABBCVV|'));

      it('directly after cursor', expectSelection('AA|BBC', 'AAVV|BBC'));

      it('before cursor', expectSelection('AA|BBC', 'VV|AABBC'));

      it('directly before cursor', expectSelection('AA|BBC', 'AAVV|BBC'));

    });


    describe('should handle replace', function() {

      it('with longer text', expectSelection('AA|BB', 'XXFFOOLL|'));

      it('with shorter text', expectSelection('XXFFOO|LL', 'XX|AABB'));

    });


    describe('should modify cursor removing content', function() {

      it('after cursor', expectSelection('AA|BBVVC', 'AABB|C'));

      it('directly after cursor', expectSelection('AABB|VVC', 'AA|VVC'));

      it('before cursor', expectSelection('AAVVBB|C', 'AA|BBC'));

      it('directly before cursor', expectSelection('AABB|VVC', 'AA|VVC'));

    });

  });

});



function expectSelection(oldString, newString) {

  return function() {

    var oldStart, oldEnd;

    oldStart = oldString.indexOf('|');

    if (oldStart === -1) {
      throw new Error('no start cursor (|) in old string');
    }

    oldEnd = oldString.indexOf('|', oldStart + 1);

    if (oldEnd === -1) {
      oldEnd = oldStart;
    } else {
      oldEnd = oldEnd - 1;
    }

    oldString = oldString.replace(/\|/g, '');

    var newStart, newEnd;

    newStart = newString.indexOf('|');

    if (newStart === -1) {
      throw new Error('no start cursor (|) in new string');
    }

    newEnd = newString.indexOf('|', newStart + 1);

    if (newEnd === -1) {
      newEnd = newStart;
    } else {
      newEnd = newEnd - 1;
    }

    newString = newString.replace(/\|/g, '');

    // when
    var oldSelection = { start: oldStart, end: oldEnd };
    var newSelection = calculateSelectionUpdate(oldSelection, oldString, newString);

    // then
    expect(newSelection).to.eql({ start: newStart, end: newEnd });

  }
}
