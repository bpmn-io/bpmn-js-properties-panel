// Import your custom property entries.
// The entry is a text input field with logic attached to create,
// update and delete the "spell" property.
import { Group, ListGroup } from '@bpmn-io/properties-panel';
import {AttributesProps, 
    RelativePropertiesProps, 
    IconTypeProps, 
    PropertyProps
} from './properties';

const LOW_PRIORITY = 500;

const CUSTOM_GROUPS = [
    CustomGroup,
    RelativeGroup,
    PropertyGroup
];

/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function CustomPropertiesProvider(propertiesPanel, injector) {

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
        //contract: if a group returns null, it should not be displayed at all
        return (groups) => {
            groups = groups.concat(this._getGroups(element));
            return groups;
          }
    };

    this._getGroups = function (element) {
        const groups = CUSTOM_GROUPS.map(createGroup => createGroup(element, injector));

        // contract: if a group returns null, it should not be displayed at all
        return groups.filter(group => group !== null);
    }


    // registration ////////

    // Register our custom magic properties provider.
    // Use a lower priority to ensure it is loaded after
    // the basic BPMN properties.
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'injector'];

// Create the custom group
function CustomGroup(element, injector) {
    const translate = injector.get('translate');
    const entries = [
        ...AttributesProps(element), 
        ...IconTypeProps(element)
    ];
    const customGroup = {
        id: 'customGroup',
        label: translate('Custom Group'),
        component: Group,
        entries
    };

    if (customGroup.entries.length > 0) {
        return customGroup;
    }

    return null;
}

function RelativeGroup(element, injector) {
    const translate = injector.get('translate');
    const group = {
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

function PropertyGroup(element, injector) {

    const translate = injector.get('translate');
    const group = {
        label: translate('Properties'),
        id: 'CamundaPlatform__TaskProperties',
        component: ListGroup,
        ...PropertyProps({ element, injector})
    };

    if (group.items) {
        return group;
    }

    return null;
}

