import Markup from 'preact-markup';

import { sanitizeHTML } from '../util/sanitize';

export function PropertyDescription(props) {

  const {
    description
  } = props;

  return description && (
    <Markup
      markup={ sanitizeHTML(description) }
      trim={ false } />
  );
}