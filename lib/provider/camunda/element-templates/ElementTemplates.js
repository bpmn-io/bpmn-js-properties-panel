'use strict';

var flatten = require('lodash/flatten'),
    find = require('lodash/find'),
    isString = require('lodash/isString'),
    isUndefined = require('lodash/isUndefined'),
    values = require('lodash/values');

var getTemplateId = require('./Helper').getTemplateId,
    getTemplateVersion = require('./Helper').getTemplateVersion;

var isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

/**
 * Registry for element templates.
 */
function ElementTemplates() {
  this._templates = {};
}

/**
 * Get template with given ID and optional version or for element.
 *
 * @param {String|djs.model.Base} id
 * @param {number} [version]
 *
 * @return {ElementTemplate}
 */
ElementTemplates.prototype.get = function(id, version) {
  var templates = this._templates,
      element;

  if (isUndefined(id)) {
    return null;
  } else if (isString(id)) {

    if (isUndefined(version)) {
      version = '_';
    }

    if (templates[ id ] && templates[ id ][ version ]) {
      return templates[ id ][ version ];
    } else {
      return null;
    }
  } else {
    element = id;

    return this.get(getTemplateId(element), getTemplateVersion(element));
  }
};

/**
 * Get default template for given element.
 *
 * @param {djs.model.Base} element
 *
 * @return {ElementTemplate}
 */
ElementTemplates.prototype.getDefault = function(element) {
  return find(this.getAll(), function(template) {
    return isAny(element, template.appliesTo) && template.isDefault;
  }) || null;
};

/**
 * Get all templates (with given ID).
 *
 * @param {string} [id]
 *
 * @return {Array<ElementTemplate>}
 */
ElementTemplates.prototype.getAll = function(id) {
  if (!isUndefined(id) && this._templates[ id ]) {
    return values(this._templates[ id ]);
  }

  return flatten(values(this._templates).map(values));
};

/**
 * Set templates.
 *
 * @param {Array<ElementTemplate>} templates
 */
ElementTemplates.prototype.set = function(templates) {
  var self = this;

  this._templates = {};

  templates.forEach(function(template) {
    var id = template.id,
        version = isUndefined(template.version) ? '_' : template.version;

    if (!self._templates[ id ]) {
      self._templates[ id ] = {};
    }

    self._templates[ id ][ version ] = template;
  });
};

module.exports = ElementTemplates;