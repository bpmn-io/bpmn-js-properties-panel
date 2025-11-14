const SPACE_REGEX = /\s/;

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i;

// for ID validation as per BPMN Schema (QName - Namespace)
const ID_REGEX = /^[a-z_][\w-.]*$/i;

// for Program ID validation as per BPMN Schema AAA_M1234 or AAA_P12345 (e.g., BKD_M1001, DND_P1002, DND_M1001_NEW), separated by commas.
const PROGRAM_ID_REGEX = /^[A-Z]{3}_[MP]\d{4,5}(?:_[A-Z0-9]+)?(?:,\s*[A-Z]{3}_[MP]\d{4}(?:_[A-Z0-9]+)?)*$/i;
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

export function validateParentId(idValue, translate) {

  if (!idValue) {
    return;
  }

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

export function validateProgramId(idValue, translate) {

  if (!idValue) {
    return;
  }

  if (containsSpace(idValue)) {
    return translate('Program ID must not contain spaces.');
  }

  if (!PROGRAM_ID_REGEX.test(idValue)) {
    return translate('Please enter ID(s) in format: AAA_M1234 or AAA_P12345 (e.g., BKD_M1001), separated by commas.');
  }
  
}

export function containsSpace(value) {
  return SPACE_REGEX.test(value);
}