const SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

// for ID validation as per BPMN Schema (QName - Namespace)
const ID_REGEX = /^[a-z_][\w-.]*$/i;

/**
 * checks whether the id value is valid
 *
 * @param {ModdleElement} element
 * @param {String} idValue
 * @param {Function} translate
 *
 * @return {String} error message
 */
export function isIdValid(element, idValue, translate) {
  const assigned = element.$model.ids.assigned(idValue);
  const idAlreadyExists = assigned && assigned !== element;

  console.log('checking ID', idValue, 'using IDs from element with name', element.name);

  if (idAlreadyExists)
    console.log(`ID ${idValue} does exist`);
  else
    console.log(`ID ${idValue} does not exist`);

  if (!idValue) {
    return translate('ID must not be empty.');
  }

  if (idAlreadyExists) {
    return translate('ID must be unique.');
  }

  return validateId(idValue, translate);
}

export function validateId(idValue, translate) {

  if (containsSpace(idValue)) {
    return translate('ID must not contain spaces.');
  }

  if (!ID_REGEX.test(idValue)) {

    if (QNAME_REGEX.test(idValue)) {
      return translate('ID must not contain prefix.');
    }

    return translate('ID must be a valid QName.');
  }
}

export function containsSpace(value) {
  return SPACE_REGEX.test(value);
}