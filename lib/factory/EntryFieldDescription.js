'use strict';

var escapeHTML = require('../Utils').escapeHTML;

/**
 * Create a linkified and HTML escaped entry field description.
 *
 * As a special feature, this description may contain both markdown
 * and plain <a href> links.
 *
 * @param {String} description
 */
module.exports = function entryFieldDescription(description) {

  // we tokenize the description to extract text, HTML and markdown links
  // text and links are handled seperately

  var escaped = [];

  // match markdown [{TEXT}]({URL}) and HTML links <a href="{URL}">{TEXT}</a>
  var pattern = /(?:\[([^\]]+)\]\((https?:\/\/[^"<>\]]+)\))|(?:<a href="(https?:\/\/[^"<>]+)">([^<]*)<\/a>)/gi;

  var index = 0;
  var match;
  var link, text;

  while ((match = pattern.exec(description))) {

    // escape + insert text before match
    if (match.index > index) {
      escaped.push(escapeHTML(description.substring(index, match.index)));
    }

    link = match[2] || match[3];
    text = match[1] || match[4];

    // insert safe link
    escaped.push('<a href="' + link + '" target="_blank">' + escapeHTML(text) + '</a>');

    index = match.index + match[0].length;
  }

  // escape and insert text after last match
  if (index < description.length) {
    escaped.push(escapeHTML(description.substring(index)));
  }

  return '<div class="bpp-field-description">' + escaped.join('') + '</div>';
};