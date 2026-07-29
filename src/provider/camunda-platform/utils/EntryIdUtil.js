import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { isArray } from 'min-dash';

/**
 * Entry id schemes for moddle elements that are rendered as static
 * (non-list) entries, keyed by moddle `$type` and moddle property name.
 */
const SINGLETON_ENTRY_SCHEMES = {
  'bpmn:Process': {
    historyTimeToLive: 'historyTimeToLive'
  }
};

/**
 * Resolve the id of a static (non-list) entry that edits the given moddle
 * property. This is the single source for the id scheme: it is used both
 * to render the entry and to resolve it.
 *
 * @param {string} type the moddle `$type` of the edited element
 * @param {string} property the edited moddle property
 *
 * @return {string|null}
 */
export function getSingletonEntryId(type, property) {
  const scheme = SINGLETON_ENTRY_SCHEMES[type];

  return scheme && scheme[property] || null;
}

/**
 * Resolve a moddle location on an element to the Camunda 7 (platform) entry id
 * this provider renders for it.
 *
 * The location is a moddle `path` (as produced by `getPath` from
 * `@bpmn-io/moddle-utils`) rooted at the element's business object — the same
 * shape lint rules report. Scoped to the properties the camunda-platform
 * provider owns; mirrors the zeebe and bpmn providers' resolvers.
 *
 * Returns `null` when the location is not rendered by a camunda-platform entry
 * (so the caller can defer to another provider or its own fallback).
 *
 * @param {djs.model.Base} element
 * @param {(string|number)[]} path
 *
 * @return {string|null}
 */
export function getCamundaPlatformEntryId(element, path) {
  if (!element || !isArray(path) || !path.length) {
    return null;
  }

  const field = path[path.length - 1];

  if (typeof field !== 'string') {
    return null;
  }

  let node = getBusinessObject(element);

  // walk all but the last segment to the node that owns the edited property
  // (e.g. a bpmn:Participant's `processRef` points at the bpmn:Process)
  for (let i = 0; i < path.length - 1 && node; i++) {
    const segment = path[i];

    node = typeof segment === 'number' ? node[segment] : node.get(segment);
  }

  if (!node) {
    return null;
  }

  return getSingletonEntryId(node.$type, field);
}
