'use strict';

var escapeHTML = require('../Utils').escapeHTML;

var HTML_UNESCAPE_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
};


module.exports = function entryFieldDescription(description) {

  description = escapeHTML(description);
  description = linkify(description);

  return '<div class="bpp-field-description">' + description + '</div>';
};

/**
 * Replace MarkDown Link Syntax with HTML Link Syntax
 * [myLink](http://www.myLink.de) -> <a href=http://www.myLink.de>myLink</a>
 *
 * @param {String} value
 *
 * @return {String}
 */
function linkify(text) {
  return text.replace(/\[([^)]+)\]\(([^\]]+)\)/g, function(_, text, link) {

    // unescape HTML to prevent breaking query params
    link = unescapeHTML(link);
    link = encodeURI(link);

    return '<a href="' + link + '" target="_blank">' + text + '</a>';
  });
}

function unescapeHTML(str) {
  return str && str.replace(/&(?:amp|lt|gt|quot|#39);/g, function(match) {
    return HTML_UNESCAPE_MAP[match];
  });
}
