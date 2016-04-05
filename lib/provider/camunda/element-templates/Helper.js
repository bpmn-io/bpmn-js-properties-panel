'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

var is = require('bpmn-js/lib/util/ModelUtil').is;

var find = require('lodash/collection/find');


var TEMPLATE_ATTR = 'camunda:modelerTemplate';

/**
 * The BPMN 2.0 extension attribute name under
 * which the element template is stored.
 *
 * @type {String}
 */
module.exports.TEMPLATE_ATTR = TEMPLATE_ATTR;


/**
 * Get template id for a given diagram element.
 *
 * @param {djs.model.Base} element
 *
 * @return {String}
 */
function getTemplateId(element) {

  var bo = getBusinessObject(element);

  if (bo) {
    return bo.get(TEMPLATE_ATTR);
  }
}

module.exports.getTemplateId = getTemplateId;


/**
 * Get template of a given element.
 *
 * @param {Element} element
 * @param {ElementTemplates} elementTemplates
 *
 * @return {TemplateDefinition}
 */
function getTemplate(element, elementTemplates) {
  var id = getTemplateId(element);

  return id && elementTemplates.get(id);
}

module.exports.getTemplate = getTemplate;


function findExtension(element, type) {
  var bo = getBusinessObject(element);

  var extensionElements = bo.extensionElements;

  if (!extensionElements) {
    return null;
  }

  return find(extensionElements.values, function(e) {
    return is(e, type);
  });
}

module.exports.findExtension = findExtension;