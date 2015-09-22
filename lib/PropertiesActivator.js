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

  eventBus.on('propertiesPanel.isEntryVisible', priority, function(e) {
    return self.isEntryVisible(e.entry, e.element);
  });

  eventBus.on('propertiesPanel.isPropertyEditable', priority, function(e) {
    return self.isPropertyEditable(e.entry, e.propertyName, e.element);
  });
}

PropertiesActivator.$inject = [ 'eventBus' ];

module.exports = PropertiesActivator;


/**
 * Should the given entry be visible for the specified element.
 *
 * @method  PropertiesActivator#isEntryVisible
 *
 * @param {EntryDescriptor} entry
 * @param {ModdleElement} element
 *
 * @returns {Boolean}
 */
PropertiesActivator.prototype.isEntryVisible = function(entry, element) {
  return true;
};

/**
 * Should the given property be editable for the specified element
 *
 * @method  PropertiesActivator#isPropertyEditable
 *
 * @param {EntryDescriptor} entry
 * @param {String} propertyName
 * @param {ModdleElement} element
 *
 * @returns {Boolean}
 */
PropertiesActivator.prototype.isPropertyEditable = function(entry, propertyName, element) {
  return true;
};