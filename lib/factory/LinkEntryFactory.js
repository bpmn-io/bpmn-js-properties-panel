'use strict';

var utils = require('../Utils');

var entryFieldDescription = require('./EntryFieldDescription');

var link = function(options, defaultParameters) {

  var id                  = options.id,
      label               = options.label || id,
      hideLink            = options.hideLink,
      canBeHidden         = typeof hideLink === 'function',
      getClickableElement = options.getClickableElement,
      description         = options.description;

  var resource = { id: id };

  resource.html =
    '<a data-action="linkSelected" ' +
    (canBeHidden ? 'data-show="hideLink" ' : '') +
    'class="bpp-entry-link' + (options.cssClasses ? ' ' + options.cssClasses : '') +
    '">' + label + '</a>';

  // add description below link entry field
  if (description) {
    resource.html += entryFieldDescription(description);
  }

  resource.linkSelected = function(element, node, event, scopeNode) {
    if (typeof getClickableElement === 'function') {

      var link = getClickableElement.apply(resource, [ element, node, event, scopeNode ]);
      link && utils.triggerClickEvent(link);
    }

    return false;
  };

  if (canBeHidden) {
    resource.hideLink = function() {
      return !hideLink.apply(resource, arguments);
    };
  }

  return resource;
};

module.exports = link;
