'use strict';

var escapeHTML = require('../Utils').escapeHTML;
var domQuery = require('min-dom').query;


/**
 * @param  {object} options
 * @param  {string} options.id
 * @param  {string} [options.title='']
 * @param  {string} [options.description='']
 * @param  {boolean} [options.open=false]
 * @param  {Function} [options.onToggle]
 * @param  {Function} [options.onRemove]
 *
 * @return {object}
 */
function Collapsible(options) {

  var id = options.id,
      title = options.title || '',
      description = options.description || '',
      open = !!options.open || false,
      onToggle = options.onToggle || noop,
      onRemove = options.onRemove,
      cssClasses = options.cssClasses || [];


  var collapsibleEntry = {
    id: id,
    toggle: toggle,
    isOpen: isOpen,
    set: set,
    setOpen: setOpen,
    get: get
  };

  if (typeof onRemove === 'function') {
    collapsibleEntry.onRemove = function(entry, entryNode, actionId, event) {
      var commands = onRemove(entry, entryNode, actionId, event);

      if (commands) {
        scheduleCommands(commands, entryNode);
        return true;
      }
    };
  }

  function get(element, entryNode) {
    if (options.get) {
      return options.get(element, entryNode);
    }

    return {
      title: title || '',
      description: description || ''
    };
  }

  function set() {
    var commands = this._commands;

    if (commands) {
      delete this._commands;
      return commands;
    }
  }

  function toggle(element, entryNode, event, scope) {
    var value = !open;

    setOpen(value, entryNode);
    onToggle(value, entryNode);
  }

  /**
   * Set entry's open state.
   *
   * @param {boolean} value
   * @param {HTMLElement} entryNode
   */
  function setOpen(value, entryNode) {
    open = value;
    entryNode.classList.toggle('bpp-collapsible--collapsed', !value);
  }

  function isOpen() {
    return open;
  }

  /**
   * Schedule commands to be run with next `set` method call.
   *
   * @param {Array<any>} commands
   * @param {HTMLElement} entryNode
   */
  function scheduleCommands(commands, entryNode) {
    collapsibleEntry._commands = commands;

    // @barmac: hack to make properties panel call `set`
    var input = domQuery('input[type="hidden"]', entryNode);
    input.value = 1;
  }

  collapsibleEntry.html = '<div class="bpp-field-wrapper" data-action="toggle"><input name="hidden" type="hidden">' +
    '<span class="bpp-collapsible__icon"></span>' +
    '<label class="bpp-collapsible__title" data-value="title">' + escapeHTML(title) + '</label>' +
    '<label class="bpp-collapsible__description" data-value="description">' + escapeHTML(description) + '</label>' +
    (onRemove ? '<button class="bpp-collapsible__remove action-button clear" data-action="onRemove"></button>' : '') +
  '</div>';

  collapsibleEntry.cssClasses = cssClasses.concat(open ?
    [ 'bpp-collapsible' ] : [ 'bpp-collapsible', 'bpp-collapsible--collapsed' ]
  );

  return collapsibleEntry;
}

module.exports = Collapsible;

function noop() {}
