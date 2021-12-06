import {
  useEffect
} from '@bpmn-io/properties-panel/preact/hooks';

import {
  query as domQuery
} from 'min-dom';

import {
  usePrevious
} from '@bpmn-io/properties-panel/lib/hooks';

import SelectEntry from '@bpmn-io/properties-panel/lib/components/entries/Select';


export default function ReferenceSelectEntry(props) {
  const {
    autoFocusEntry,
    element,
    getOptions
  } = props;

  const options = getOptions(element);
  const prevOptions = usePrevious(options);

  // auto focus specifc other entry when options changed
  useEffect(() => {
    if (autoFocusEntry && prevOptions && options.length > prevOptions.length) {

      const entry = domQuery(`[data-entry-id="${autoFocusEntry}"]`);

      const focusableInput = domQuery('.bio-properties-panel-input', entry);

      if (focusableInput) {
        focusableInput.select();
      }
    }
  }, [ options ]);

  return (
    <SelectEntry { ...props } />
  );
}