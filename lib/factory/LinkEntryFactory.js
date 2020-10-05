'use strict';

var domify = require('min-dom').domify;

var escapeHTML = require('../Utils').escapeHTML;

var entryFieldDescription = require('./EntryFieldDescription');

var bind = require('lodash/bind');

/**
 * An entry that renders a clickable link.
 *
 * A passed {@link options#handleClick} handler is responsible
 * to process the click.
 *
 * The link may be conditionally shown or hidden. This can be
 * controlled via the {@link options.showLink}.
 *
 * @param {Object} options
 * @param {String} options.id
 * @param {String} [options.buttonLabel]
 * @param {Function} options.handleClick
 * @param {Function} [options.showLink] returning false to hide link
 * @param {String} [options.description]
 *
 * @example
 *
 * var linkEntry = link({
 *   id: 'foo',
 *   description: 'Some Description',
 *   handleClick: function(element, node, event) { ... },
 *   showLink: function(element, node) { ... }
 * });
 *
 * @return {Entry} the newly created entry
 */
function link(translate, options) {

  var id = options.id,
      buttonLabel = options.buttonLabel || id,
      showLink = options.showLink,
      handleClick = options.handleClick,
      description = options.description,
      label = options.label;

  if (showLink && typeof showLink !== 'function') {
    throw new Error('options.showLink must be a function');
  }

  if (typeof handleClick !== 'function') {
    throw new Error('options.handleClick must be a function');
  }

  var resource = {
    id: id,
    html: document.createDocumentFragment()
  };

  if (label) {
    resource.html.appendChild(domify('<label for="camunda-' + escapeHTML(id) + '" ' +
      (showLink ? 'data-show="showLink" ' : '') +
      '>'+ escapeHTML(label) +'</label>'));
  }

  resource.html.appendChild(domify('<div class="bpp-field-wrapper">' +
    '<a data-action="handleClick" ' +
    (showLink ? 'data-show="showLink" ' : '') +
    'class="bpp-entry-link' + (options.cssClasses ? ' ' + escapeHTML(options.cssClasses) : '') +
    '">' + escapeHTML(buttonLabel) + '</a></div>'));


  // add description below link entry field
  if (description) {
    resource.html.appendChild(entryFieldDescription(translate, description, { show: 'showLink' }));
  }

  resource.handleClick = bind(handleClick, resource);

  if (typeof showLink === 'function') {
    resource.showLink = function() {
      return showLink.apply(resource, arguments);
    };
  }

  return resource;
}

module.exports = link;
