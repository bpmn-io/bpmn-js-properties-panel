import { SelectEntry, TextFieldEntry } from '@bpmn-io/properties-panel';
import { useService } from '../../hooks';
import { useState, useEffect } from '@bpmn-io/properties-panel/preact/hooks';

/**
 * A select entry that uses options from the connector metadata service.
 * Falls back to a text field if metadata is not available.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.element - The BPMN element
 * @param {string} props.id - Entry ID
 * @param {string} props.label - Entry label
 * @param {string} props.description - Entry description
 * @param {Function} props.getValue - Function to get current value
 * @param {Function} props.setValue - Function to set value
 * @param {string} props.metadataKey - Key to access in metadata (e.g., 'channels')
 * @param {string} props.optionValueKey - Key to get value from option object (e.g., 'name')
 * @param {string} props.optionLabelKey - Key to get label from option object (e.g., 'name')
 */
export function SelectWithContextEntry(props) {
  const {
    element,
    id,
    label,
    description,
    getValue,
    setValue,
    metadataKey = 'channels',
    optionValueKey = 'name',
    optionLabelKey = 'name'
  } = props;

  const connectorMetadata = useService('connectorMetadata');
  const elementTemplates = useService('elementTemplates', false);
  const debounce = useService('debounceInput');
  const eventBus = useService('eventBus');

  // Force re-render when metadata is fetched
  const [ metadataVersion, setMetadataVersion ] = useState(0);

  // Get the template for this element
  const template = elementTemplates ? elementTemplates.get(element) : null;

  // Listen for metadata changes
  useEffect(() => {
    const handleMetadataFetched = (event) => {
      // Force re-render by updating state
      setMetadataVersion(v => v + 1);
    };

    eventBus.on('connectorMetadata.fetched', handleMetadataFetched);

    return () => {
      eventBus.off('connectorMetadata.fetched', handleMetadataFetched);
    };
  }, [ eventBus ]);

  // Get metadata if available
  const metadata = template ? connectorMetadata.getMetadata(template.id) : null;
  
  // Get options from metadata
  const options = metadata && metadata[metadataKey] ? metadata[metadataKey] : null;

  // If we have options, render as dropdown
  if (options && Array.isArray(options) && options.length > 0) {
    
    // Convert options to the format expected by SelectEntry
    const getOptions = () => {
      return [
        { value: '', label: '<none>' },
        ...options.map(option => ({
          value: option[optionValueKey],
          label: option[optionLabelKey]
        }))
      ];
    };

    return <SelectEntry
      element={ element }
      id={ id }
      label={ label }
      description={ description }
      getValue={ getValue }
      setValue={ setValue }
      getOptions={ getOptions }
    />;
  }

  // Fall back to text field if no metadata available
  return <TextFieldEntry
    element={ element }
    id={ id }
    label={ label }
    description={ description }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />;
}
