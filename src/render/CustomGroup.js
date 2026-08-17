import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext
} from '@bpmn-io/properties-panel/preact/hooks';

import {
  createElement
} from '@bpmn-io/properties-panel/preact';

import {
  isFunction
} from 'min-dash';

import classnames from 'classnames';

import {
  query
} from 'min-dom';

import {
  useLayoutState,
  useErrors,
  LayoutContext,
  TooltipEntry,
  useStickyIntersectionObserver
} from '@bpmn-io/properties-panel';

import {
  GearIcon,
  DocumentIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from './icons';

export default function CustomGroup(props) {
  const {
    element,
    entries = [],
    id,
    label,
    shouldOpen = false,
    icon: CustomIcon
  } = props;

  const groupRef = useRef(null);
  const [ open, setOpen ] = useLayoutState([ 'groups', id, 'open' ], shouldOpen);
  const onShow = useCallback(() => setOpen(true), [ setOpen ]);
  const toggleOpen = () => setOpen(!open);
  const [ edited, setEdited ] = useState(false);
  const [ sticky, setSticky ] = useState(false);

  // set edited state depending on all entries
  useEffect(() => {
    const scheduled = requestAnimationFrame(() => {
      const hasOneEditedEntry = entries.find(entry => {
        const {
          id: entryId,
          isEdited
        } = entry;

        const entryNode = query(`[data-entry-id="${entryId}"]`, groupRef.current);

        if (!isFunction(isEdited) || !entryNode) {
          return false;
        }

        const inputNode = query('.bio-properties-panel-input', entryNode);

        return isEdited(inputNode);
      });

      setEdited(!!hasOneEditedEntry);
    });

    return () => cancelAnimationFrame(scheduled);
  }, [ entries, setEdited ]);

  // set error state depending on all entries
  const allErrors = useErrors() || {};
  const hasErrors = entries.some(entry => allErrors[entry.id]);

  // set css class when group is sticky to top
  useStickyIntersectionObserver(groupRef, 'div.bio-properties-panel-scroll-container', setSticky);

  const propertiesPanelContext = {
    ...useContext(LayoutContext),
    onShow
  };

  const isDocGroup = id === 'documentation' || (label && label.toLowerCase().includes('documentation'));
  const GroupIconComponent = CustomIcon || (isDocGroup ? DocumentIcon : GearIcon);

  return (
    <div
      class={ classnames('bio-properties-panel-group', 'bio-properties-panel-group-card', open && 'open') }
      data-group-id={ 'group-' + id }
      ref={ groupRef }
    >
      <div
        class={ classnames('bio-properties-panel-group-header', edited ? '' : 'empty', open ? 'open' : '', sticky && open ? 'sticky' : '') }
        onClick={ toggleOpen }
      >
        <div class="bio-properties-panel-group-header-left">
          <span class="bio-properties-panel-group-icon">
            <GroupIconComponent />
          </span>
          <div
            title={ props.tooltip ? null : label }
            data-title={ label }
            class="bio-properties-panel-group-header-title"
          >
            <TooltipEntry
              value={ props.tooltip }
              forId={ 'group-' + id }
              element={ element }
              parent={ groupRef }
            >
              { label }
            </TooltipEntry>
          </div>
        </div>

        <div class="bio-properties-panel-group-header-buttons">
          <DataMarker
            edited={ edited }
            hasErrors={ hasErrors }
          />
          <button
            type="button"
            title="Toggle section"
            class="bio-properties-panel-group-header-button bio-properties-panel-arrow"
          >
            { open ? <ChevronUpIcon class="bio-properties-panel-arrow-icon" /> : <ChevronDownIcon class="bio-properties-panel-arrow-icon" /> }
          </button>
        </div>
      </div>

      <div class={ classnames('bio-properties-panel-group-entries', open ? 'open' : '') }>
        <LayoutContext.Provider value={ propertiesPanelContext }>
          { entries.map(entry => {
            const {
              component: Component,
              id: entryId
            } = entry;

            return createElement(Component, {
              ...entry,
              element: element,
              key: entryId
            });
          }) }
        </LayoutContext.Provider>
      </div>
    </div>
  );
}

function DataMarker(props) {
  const {
    hasErrors
  } = props;

  if (hasErrors) {
    return (
      <div
        title="Section contains an error"
        class="bio-properties-panel-dot bio-properties-panel-dot--error"
      />
    );
  }

  return null;
}
