// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import { Group, ListGroup } from '@bpmn-io/properties-panel';
import spellProps from './parts/SpellProps';
import {RelativePropertiesProps} from './parts/RelativePropertiesProps'
import { is } from 'bpmn-js/lib/util/ModelUtil';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function MagicPropertiesProvider(propertiesPanel, injector) {

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
            // Add the "magic" group
            groups.push(createMagicGroup(element, injector));
            groups.push(createRelativeGroup(element, injector));
            return groups;
        }
    };


    // registration ////////

    // Register our custom magic properties provider.
    // Use a lower priority to ensure it is loaded after
    // the basic BPMN properties.
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

MagicPropertiesProvider.$inject = ['propertiesPanel', 'injector'];

// Create the custom magic group
function createMagicGroup(element, injector) {
    const translate = injector.get('translate');
    // create a group called "Magic properties".
    const magicGroup = {
        id: 'customGroup',
        label: translate('Custom Group'),
        entries: spellProps(element)
    };

    return magicGroup;
}

// Create the custom magic group
function createRelativeGroup(element, injector) {

    // create a group called "Magic properties".

    const translate = injector.get('translate');
    const group = {
        // id: 'Realative_CamundaPlatform__ExtensionProperties',
        // label: translate('Relative Group'),
        label: translate('Relative process'),
        id: 'CamundaPlatform__ExtensionProperties',
        component: ListGroup,
        ...RelativePropertiesProps({ element, injector})
    };

    if (group.items) {
        return group;
    }

    return null;
}

