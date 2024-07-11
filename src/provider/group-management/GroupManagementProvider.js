// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import groupManagementData from './utils/GroupInfoData';
// import { is } from 'bpmn-js/lib/util/ModelUtil';

const LOW_PRIORITY = 300;

/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} injector
 */
export default function GroupManagementProvider(propertiesPanel, injector) {

  // API ////////
  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function (element) {
    /**
     * We return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups
     *
     * @return {Object[]} modified groups
     */
    return function (groups) {
      let groupManagementDataList = groupManagementData(element);
      return groups.filter(group => !groupManagementDataList.includes(group.label));      
    }
  };


  // registration ////////

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

GroupManagementProvider.$inject = ['propertiesPanel', 'injector'];

