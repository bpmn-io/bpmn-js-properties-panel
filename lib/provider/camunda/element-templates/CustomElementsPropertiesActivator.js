'use strict';

var inherits = require('inherits');

var getTemplate = require('./Helper').getTemplate;

var PropertiesActivator = require('../../../PropertiesActivator');

var HIGHER_PRIORITY = 1100;

/**
 * Applies template visibility settings.
 *
 * Controlled using `entriesVisible` on template config object:
 *
 * ```json
 *     "entriesVisible": {
 *       "_all": true|false,
 *       "entry-name": true|false,
 *       ...
 *     }
 * ```
 *
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 */
function CustomElementsPropertiesActivator(eventBus, elementTemplates) {
  PropertiesActivator.call(this, eventBus, HIGHER_PRIORITY);

  this.isEntryVisible = function(entry, element) {

    var template = getTemplate(element, elementTemplates);

    if (template && !isEntryVisible(entry, template)) {
      return false;
    }
  };
}

CustomElementsPropertiesActivator.$inject = [ 'eventBus', 'elementTemplates' ];

inherits(CustomElementsPropertiesActivator, PropertiesActivator);

module.exports = CustomElementsPropertiesActivator;



////// helpers ////////////////////////////////////


var CUSTOM_PROPERTIES_PATTERN = /^custom-/;

var DEFAULT_ENTRIES_VISIBLE = {
  _all: false,
  id: true,
  name: true
};

function isEntryVisible(entry, template) {

  var id = entry.id;

  if (id === 'elementTemplate-chooser' || CUSTOM_PROPERTIES_PATTERN.test(id)) {
    return true;
  }

  var entriesVisible = template.entriesVisible || DEFAULT_ENTRIES_VISIBLE;

  if (typeof entriesVisible === 'boolean') {
    return entriesVisible;
  }

  var defaultVisible = entriesVisible._all || false,
      entryVisible = entriesVisible[id];

  // d = true, e = false => false
  // d = false, e = true => true
  // d = false, e = false
  return (
    (defaultVisible === true && entryVisible !== false) ||
    (defaultVisible === false && entryVisible === true)
  );
}