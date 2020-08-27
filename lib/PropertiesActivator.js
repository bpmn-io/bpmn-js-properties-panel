'use strict';

var DEFAULT_PRIORITY = 1000;


/**
 * A component that decides upon the visibility / editable
 * state of properties in the properties panel.
 *
 * Implementors must subclass this component and override
 * {@link PropertiesActivator#isEntryVisible} and
 * {@link PropertiesActivator#isPropertyEditable} to provide
 * custom behavior.
 *
 * @class
 * @constructor
 *
 * @param {EventBus} eventBus
 * @param {Number} [priority] at which priority to hook into the activation
 */
function PropertiesActivator(eventBus, priority) {
  var self = this;

  priority = priority || DEFAULT_PRIORITY;

  eventBus.on('propertiesPanel.isEntryVisible', priority, function(context) {
    var element = context.element,
        entry = context.entry,
        group = context.group,
        tab = context.tab;

    return self.isEntryVisible(element, entry, group, tab);
  });

  eventBus.on('propertiesPanel.isPropertyEditable', priority, function(context) {
    var element = context.element,
        entry = context.entry,
        group = context.group,
        propertyName = context.propertyName,
        tab = context.tab;

    return self.isPropertyEditable(propertyName, element, entry, group, tab);
  });
}

PropertiesActivator.$inject = [ 'eventBus' ];

module.exports = PropertiesActivator;


/**
 * Should the given entry be visible for the specified element.
 *
 * @method  PropertiesActivator#isEntryVisible
 *
 * @param {ModdleElement} element
 * @param {Object} entry
 * @param {Object} group
 * @param {Object} tab
 *
 * @returns {boolean}
 */
PropertiesActivator.prototype.isEntryVisible = function(element, entry, group, tab) {
  return true;
};

/**
 * Should the given property be editable for the specified element
 *
 * @method  PropertiesActivator#isPropertyEditable
 *
 * @param {string} propertyName
 * @param {ModdleElement} element
 * @param {Object} entry
 * @param {Object} group
 * @param {Object} tab
 *
 * @returns {boolean}
 */
PropertiesActivator.prototype.isPropertyEditable = function(propertyName, element, entry, group, tab) {
  return true;
};