'use strict';

var MARKDOWN_LINK_REGEX = /\[([^\)]+)\]\(([^\]]+)\)/g;

/**
 * Replace MarkDown Link Syntax with HTML Link Syntax
 * [myLink](http://www.myLink.de) -> <a href=http://www.myLink.de>myLink</a>
 *
 * @param {String} value
 *
 * @return {String}
 */
function linkify(text) {
  return text.replace(MARKDOWN_LINK_REGEX, '<a href="$2" target="_blank">$1</a>');
}

module.exports = function entryFieldDescription(description) {
  description = linkify(description);

  return '<div class="bpp-field-description">' + description + '</div>';
};
