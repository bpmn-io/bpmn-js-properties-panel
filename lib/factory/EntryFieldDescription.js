'use strict';

var domify = require('min-dom').domify,
    domClasses = require('min-dom').classes,
    domEvent = require('min-dom').event;

var escapeHTML = require('../Utils').escapeHTML;

var MAX_DESCRIPTION_LENGTH = 200;

/**
 * Create a linkified and HTML escaped entry field description.
 *
 * As a special feature, this description may contain both markdown,
 * plain <a href> links and <br />
 *
 * @param {string} description
 * @param {object} [options]
 * @param {string} [options.show] - name of callback to determine whether description is shown
 */
module.exports = function entryFieldDescription(translate, description, options) {
  var show = options && options.show;

  // we tokenize the description to extract text, HTML and markdown links
  // text, links and new lines are handled seperately

  var escaped = [];

  // match markdown [{TEXT}]({URL}) and HTML links <a href="{URL}">{TEXT}</a>
  var pattern = /(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\))|(?:<a href="(https?:\/\/[^"]+)">(.+?(?=<\/))<\/a>)/gi;

  var index = 0;
  var match;
  var link, text;

  while ((match = pattern.exec(description))) {

    // escape + insert text before match
    if (match.index > index) {
      escaped.push(escapeText(description.substring(index, match.index)));
    }

    link = match[2] && encodeURI(match[2]) || match[3];
    text = match[1] || match[4];

    // insert safe link
    escaped.push('<a href="' + link + '" target="_blank">' + escapeText(text) + '</a>');

    index = match.index + match[0].length;
  }

  // escape and insert text after last match
  if (index < description.length) {
    escaped.push(escapeText(description.substring(index)));
  }

  description = escaped.join('');

  var html = domify(
    '<div class="bpp-field-description description description--expanded"' +
    (show ? 'data-show="' + show + '">' : '>') +
    '</div>'
  );

  var descriptionText = domify('<span class="description__text">' + description + '</span>');

  html.appendChild(descriptionText);

  function toggleExpanded(expanded) {
    if (expanded) {
      domClasses(html).add('description--expanded');

      descriptionText.textContent = description + ' ';

      expand.textContent = translate('Less');
    } else {
      domClasses(html).remove('description--expanded');

      descriptionText.textContent = descriptionShortened + ' ... ';

      expand.textContent = translate('More');
    }
  }

  var descriptionShortened,
      expand,
      expanded = false;

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    descriptionShortened = description.slice(0, MAX_DESCRIPTION_LENGTH);

    expand = domify(
      '<span class="bpp-entry-link description__expand">' +
        translate('More') +
      '</span>'
    );

    domEvent.bind(expand, 'click', function() {
      expanded = !expanded;

      toggleExpanded(expanded);
    });

    html.appendChild(expand);

    toggleExpanded(expanded);
  }

  return html;
};

function escapeText(text) {
  var match, index = 0, escaped = [];

  // match new line <br/> <br /> <br.... /> etc.
  var pattern = /<br\s*\/?>/gi;

  while ((match = pattern.exec(text))) {

    if (match.index > index) {
      escaped.push(escapeHTML(text.substring(index, match.index)));
    }

    escaped.push('<br />');

    index = match.index + match[0].length;
  }

  if (index < text.length) {
    escaped.push(escapeHTML(text.substring(index)));
  }

  return escaped.join('');
}