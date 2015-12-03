'use strict';

function calculateSelectionUpdate(selection, currentValue, newValue) {

  var newSelection = selection.start,
      diff = newValue.length - currentValue.length,
      idx;

  if (diff > 0) {

    // newValue longer than currentValue
    // search position after addition
    // AAABCCC => AAAAB|BCCC
    for (idx = newValue.length; idx >= 0; idx--) {
      if (currentValue.charAt(idx - diff) !== newValue.charAt(idx)) {

        newSelection = idx + 1;
        break;
      }
    }
  } else {

    // currentValue longer than newValue
    // search position before deletion addition
    // AAAABBCCC => AAA|BCCC
    for (idx = 0; idx < newValue.length + 1; idx++) {
      if (currentValue.charAt(idx) !== newValue.charAt(idx)) {

        newSelection = idx;
        break;
      }
    }
  }

  return range(newSelection);
}

module.exports.calculateSelectionUpdate = calculateSelectionUpdate;


function range(start, end) {
  return {
    start: start,
    end: end === undefined ? start : end
  };
}