'use strict';

var map = require('lodash/collection/map');

var extensionElementsHelper = require('./ExtensionElementsHelper');

/**
 * Returns true if the attribute 'camunda:asyncBefore' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncBefore(bo) {
  return !!(bo.get('camunda:asyncBefore') || bo.get('camunda:async'));
}

module.exports.isAsyncBefore = isAsyncBefore;

/**
 * Returns true if the attribute 'camunda:asyncAfter' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isAsyncAfter(bo) {
  return !!bo.get('camunda:asyncAfter');
}

module.exports.isAsyncAfter = isAsyncAfter;

/**
 * Returns true if the attribute 'camunda:exclusive' is set
 * to true.
 *
 * @param  {ModdleElement} bo
 *
 * @return {boolean} a boolean value
 */
function isExclusive(bo) {
  return !!bo.get('camunda:exclusive');
}

module.exports.isExclusive = isExclusive;

/**
 * Get first 'camunda:FailedJobRetryTimeCycle' from the business object.
 *
 * @param  {ModdleElement} bo
 *
 * @return {Array<ModdleElement>} a list of 'camunda:FailedJobRetryTimeCycle'
 */
function getFailedJobRetryTimeCycle(bo) {
  return (extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle') || [])[0];
}

module.exports.getFailedJobRetryTimeCycle = getFailedJobRetryTimeCycle;

/**
 * Removes all existing 'camunda:FailedJobRetryTimeCycle' from the business object
 *
 * @param  {ModdleElement} bo
 *
 * @return {Array<ModdleElement>} a list of 'camunda:FailedJobRetryTimeCycle'
 */
function removeFailedJobRetryTimeCycle(bo, element) {
  var retryTimeCycles = extensionElementsHelper.getExtensionElements(bo, 'camunda:FailedJobRetryTimeCycle');
  return map(retryTimeCycles, function(cycle) {
    return extensionElementsHelper.removeEntry(bo, element, cycle);
  });
}

module.exports.removeFailedJobRetryTimeCycle = removeFailedJobRetryTimeCycle;