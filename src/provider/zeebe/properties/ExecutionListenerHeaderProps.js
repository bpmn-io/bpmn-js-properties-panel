import {
  CollapsibleEntry,
  ListEntry
} from '@bpmn-io/properties-panel';

import {
  without
} from 'min-dash';


import Header from './Header';

import {
  createElement
} from '../../../utils/ElementUtil';

import {
  useService
} from '../../../hooks';

/**
 * @typedef {import('bpmn-js/lib/model/Types').ModdleElement} ModdleElement
 */

/**
 * A single header item rendered as a CollapsibleEntry with key/value fields.
 *
 * @param {object} props
 * @param {ModdleElement} props.element
 * @param {string} props.id
 * @param {number} props.index
 * @param {ModdleElement} props.item - zeebe:Header
 * @param {boolean} props.open
 */
function HeaderItem(props) {
  const {
    element,
    id: idPrefix,
    index,
    item: header,
    open
  } = props;

  const headerId = `${ idPrefix }-header-${ index }`;

  const HeaderEntries = Header({
    idPrefix: headerId,
    element,
    header
  });

  return (
    <CollapsibleEntry
      id={ headerId }
      element={ element }
      entries={ HeaderEntries }
      label={ header.get('key') || '' }
      open={ open }
    />
  );
}

/**
 * A nested ListEntry component that renders headers (zeebe:Header)
 * for a given execution listener (zeebe:ExecutionListener).
 *
 * @param {object} props
 * @param {string} props.id
 * @param {ModdleElement} props.element
 * @param {ModdleElement} props.listener - zeebe:ExecutionListener
 */
export default function ExecutionListenerHeaders(props) {
  const {
    id,
    element,
    listener
  } = props;

  const bpmnFactory = useService('bpmnFactory');
  const commandStack = useService('commandStack');
  const translate = useService('translate');

  function addHeader() {
    let commands = [];

    // (1) ensure zeebe:TaskHeaders
    let taskHeaders = listener.get('headers');

    if (!taskHeaders) {
      taskHeaders = createElement('zeebe:TaskHeaders', {
        values: []
      }, listener, bpmnFactory);

      commands.push({
        cmd: 'element.updateModdleProperties',
        context: {
          element,
          moddleElement: listener,
          properties: {
            headers: taskHeaders
          }
        }
      });
    }

    // (2) create header
    const header = createElement('zeebe:Header', {}, taskHeaders, bpmnFactory);

    // (3) add header to the list
    commands.push({
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: taskHeaders,
        properties: {
          values: [ ...taskHeaders.get('values'), header ]
        }
      }
    });

    commandStack.execute('properties-panel.multi-command-executor', commands);
  }

  function removeHeader(header) {
    const taskHeaders = listener.get('headers');

    if (!taskHeaders) {
      return;
    }

    const newHeaders = without(taskHeaders.get('values'), header);

    // remove zeebe:TaskHeaders if there are no headers anymore
    if (!newHeaders.length) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: listener,
        properties: {
          headers: undefined
        }
      });

      return;
    }

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: taskHeaders,
      properties: {
        values: newHeaders
      }
    });
  }

  const headers = getListenerHeaders(listener);

  return <ListEntry
    id={ id }
    element={ element }
    label={ translate('Headers') }
    items={ headers }
    component={ HeaderItem }
    onAdd={ addHeader }
    onRemove={ removeHeader }
    autoFocusEntry={ `[data-entry-id="${id}-header-${headers.length - 1}"] input` }
  />;
}


// helper //////////////////

/**
 * Get zeebe:Header elements for a given execution listener.
 *
 * @param {ModdleElement} listener - zeebe:ExecutionListener
 * @returns {Array<ModdleElement>} list of zeebe:Header elements
 */
function getListenerHeaders(listener) {
  const taskHeaders = listener.get('headers');

  return taskHeaders ? taskHeaders.get('values') : [];
}
