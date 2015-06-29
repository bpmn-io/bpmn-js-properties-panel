'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    domQuery = require('min-dom/lib/query'),
    domAttr = require('min-dom/lib/attr'),
    domify = require('min-dom/lib/domify'),
    forEach = require('lodash/collection/forEach'),
    indexBy = require('lodash/collection/indexBy');

// helpers ////////////////////////////////////////

/**
 * returns the root element
 */
function getRoot(businessObject) {
  var parent = businessObject;
  while(!!parent.$parent) {
    parent = parent.$parent;
  }
  return parent;
}

/**
 * filters all elements in the list which have a given type.
 * removes a new list
 */
function filterElementsByType(objectList, type) {
  var list = objectList || [];
  var result = [];
  forEach(list, function(obj) {
    if(is(obj, type)) {
      result.push(obj);
    }
  });
  return result;
}

function findRootElementsByType(businessObject, referencedType) {
  var root = getRoot(businessObject);
  return filterElementsByType(root.rootElements, referencedType);
}

function removeAllChildren(domElement) {
  while(!!domElement.firstChild) {
    domElement.removeChild(domElement.firstChild);
  }
}



/**
 * sets the default parameters which are needed to create an entry
 *
 * @param options
 * @returns {{id: *, description: (*|string), get: (*|Function), set: (*|Function), validate: (*|Function), html: string}}
 */
var setDefaultParameters = function ( options ) {

  // default method to fetch the current value of the input field
  var defaultGet = function (element) {
    var bo = getBusinessObject(element),
      res = {};
    res[options.modelProperty] = bo.get(options.modelProperty);

    return res;
  };

// default method to set a new value to the input field
  var defaultSet = function (element, values) {
    var res = {};
    res[options.modelProperty] = values[options.modelProperty];

    return res;
  };

// default validation method
  var defaultValidate = function () {
    return {};
  };

  return {
    id : options.id,
    description : ( options.description || '' ),
    get : ( options.get || defaultGet ),
    set : ( options.set || defaultSet ),
    validate : ( options.validate || defaultValidate ),
    html: ''
  };
};

function PropertyEntryFactory() {

}

/**
 * Generates an text input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation mehtod - Function
 *
 * - modelProperty: name of the model property - String
 *
 * - buttonAction: Object which contains the following properties: - Object
 * ---- name: name of the [data-action] callback - String
 * ---- method: callback function for [data-action] - Function
 *
 * - buttonShow: Object which contains the following properties: - Object
 * ---- name: name of the [data-show] callback - String
 * ---- method: callback function for [data-show] - Function
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
PropertyEntryFactory.textField = function(options) {

  // Default action for the button next to the input-field
  var defaultButtonAction = function (element, inputNode) {
    var input = domQuery('input[name='+options.modelProperty+']', inputNode);
    input.value = '';

    return true;
  };

  // default method to determine if the button should be visible
  var defaultButtonShow = function (element, inputNode) {
    var input = domQuery('input[name='+options.modelProperty+']', inputNode);

    return input.value !== '';
  };

  var resource = setDefaultParameters(options),
      label = ( options.label || resource.id ),
      buttonLabel = ( options.buttonLabel || 'X' ),
      actionName = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.name : 'clear',
      actionMethod = ( typeof options.buttonAction != 'undefined' ) ? options.buttonAction.method : defaultButtonAction,
      showName = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.name : 'canClear',
      showMethod = ( typeof options.buttonShow != 'undefined' ) ? options.buttonShow.method : defaultButtonShow;



  resource.html = '<label for="camunda-' + resource.id + '">'+ label +':</label>' +
                  '<input id="camunda-' + resource.id + '" type="text" name="' + options.modelProperty+'" />' +
                  '<button data-action="' + actionName + '" data-show="' + showName + '">' + buttonLabel + '</button>';
  resource[actionName] = actionMethod;
  resource[showName] = showMethod;

  return resource;
};

/**
 * Generates a checkbox input entry object for a property panel.
 * options are:
 * - id: id of the entry - String
 *
 * - description: description of the property - String
 *
 * - label: label for the input field - String
 *
 * - set: setter method - Function
 *
 * - get: getter method - Function
 *
 * - validate: validation mehtod - Function
 *
 * - modelProperty: name of the model property - String
 *
 * @param options
 * @returns the propertyPanel entry resource object
 */
PropertyEntryFactory.checkbox = function(options) {
  var resource = setDefaultParameters(options),
      label = ( options.label || resource.id );


  resource.html = '<label for="camunda-' + resource.id + '">' + label + '</label>' +
                  '<input id="camunda-' + resource.id + '" type="checkbox" name="' + options.modelProperty + '" />';

  return resource;
};

PropertyEntryFactory.selectReferenceComboBox = function(options) {

  var resource = setDefaultParameters(options),
      label = ( options.label || resource.id ),
      businessObject = options.businessObject,
      referencedType = options.referencedType,
      referenceProperty = options.referenceProperty,
      referencedObjectToString = options.referencedObjectToString || function(obj) {
        return obj.name + ' (id='+obj.id+')';
      };

  if(!businessObject) {
    throw new Error('businessObject is required');
  }
  if(!referencedType) {
    throw new Error('referencedType is required');
  }
  if(!referenceProperty) {
    throw new Error('referenceProperty is required');
  }

  resource.html =
    '<div>' +
      '<label for="camunda-' + resource.id + '">' + label + ':</label>' +
      '<input id="camunda-' + resource.id + '" type="text" name="' + referenceProperty +
         '" data-focus="showOptions" data-action="showOptions" data-blur="hideOptions" data-keypress="optionsUpdateOnKeyPress" data-keydown="optionsUpdateOnKeyDown" />' +
      '<button data-action="toggleOptions" data-mousedown="preventInputBlur">'+
        '<span data-show="canShowOptions">v</span>'+
        '<span data-show="isOptionsVisible">^</span>'+
      '</button>' +
      '<button data-action="clear" data-show="canClear" data-mousedown="preventInputBlur">X</button>' +
      '<button data-action="createNew" data-show="canCreateNew" data-mousedown="preventInputBlur">Create</button>' +
      '<div data-show="isOptionsVisible" data-mousedown="preventInputBlur">' +
        '<ul data-show="isOptionsAvailable" id="camunda-' + resource.id + '-options" ></ul>' +
        '<span data-show="isNoOptionsAvailable">No Messages defined. Type to create a new Message.</span>' +
      '</div>'+
    '</div>';

  var optionTemplate = '<li data-action="selectOption"></li>';

  resource.businessObject = options.businessObject;

  resource.optionsVisible = false;
  resource.selectedOption = {};
  resource.optionsModel = [];
  resource.origValue = null;

  resource.get = function() {
    // load available messages:
    var values = {};
    var currentModelValue = businessObject[referenceProperty];

    resource.refreshOptionsModel();
    resource.optionsVisible = false;
    resource.origValue = resource.selectOptionById(currentModelValue);
    values[referenceProperty] = resource.origValue;
    return values;
  };

  resource.selectOptionById = function(id) {
    var selectedOption = indexBy(resource.optionsModel, 'value')[id];
    resource.selectedOption = selectedOption;
    return !!selectedOption ? selectedOption.label : '';
  };

  resource.refreshOptionsModel = function() {
    var model = [];
    var referenceableObjects = findRootElementsByType(businessObject, referencedType);
    forEach(referenceableObjects, function(obj) {
      model.push({
        label: referencedObjectToString(obj),
        value: obj.id,
        name: obj.name
      });
    });
    resource.optionsModel = model;
  };

  resource.set = function(element, values) {
    var providedValue = values[referenceProperty];

    if(!resource.selectedOption && !!providedValue && providedValue.length > 0) {
      // create and reference new element
      return {
        cmd: 'properties-panel.create-and-reference',
        context: {
          element: element,
          referencingObject: businessObject,
          referenceProperty: referenceProperty,
          newObject: { type: referencedType, properties: { name: providedValue } },
          newObjectContainer: getRoot(businessObject).rootElements
        }
      };
    }
    else {
      // update or clear reference on business object
      var newId;
      if(!!resource.selectedOption) {
        newId = resource.selectedOption.value;
      }
      var changes = {};
      changes[referenceProperty] = newId;
      return {
        cmd:'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          properties: changes
        }
      };
    }
  };

  resource.canClear = function(el, node) {
    var currentValue = domQuery('input', node).value;
    return currentValue && currentValue.length > 0;
  };

  resource.clear = function(el, node) {
    var input = domQuery('input', node);
    input.value = '';

    // trigger a change if the user clears the selected option.
    // In that case the reference needs to be cleared
    var changed = !!resource.selectedOption;
    resource.selectedOption = null;

    return changed;
  };

  resource.isOptionsAvailable = function() {
    return resource.optionsModel.length > 0;
  };

  resource.isNoOptionsAvailable = function() {
    return !resource.isOptionsAvailable();
  };

  resource.canShowOptions = function() {
    return !resource.optionsVisible;
  };

  resource.toggleOptions = function(el, node, evt) {
    if(!resource.optionsVisible) {
      resource.showOptions(el, node, evt);
    }
    else {
      resource.hideOptions(el, node, evt);
    }
  };

  resource.showOptions  = function (el, node) {
    resource.optionsVisible = true;
    resource.updateOptionsDropDown(node, domQuery('input', node));
  };

  resource.hideOptions = function() {
    resource.optionsVisible = false;
  };

  resource.canCreateNew = function(el, entry) {
    var value = domQuery('input', entry).value;
    return !resource.selectedOption && !!value && value.length > 0;
  };

  resource.createNew = function() {
    resource.selectedOption = undefined;
    return true;
  };

  resource.isOptionsVisible = function() {
    return resource.optionsVisible;
  };

  resource.optionsUpdateOnKeyPress = function(el, entry, evt) {

    // if the user changes the input, reset
    if(!!resource.selectedOption && evt.charCode) {
      evt.target.value = String.fromCharCode(evt.charCode);
      resource.selectedOption = null;
    }

    resource.optionsVisible = true;
    resource.updateOptionsDropDown(entry);
  };

  resource.optionsUpdateOnKeyDown = function(el, entry, evt) {

    // clear on backspace
    if(!!resource.selectedOption && evt.keyCode === 8) {
      evt.target.value = '';
      resource.selectedOption = null;
    }

    resource.optionsVisible = true;
    resource.updateOptionsDropDown(entry);
  };

  resource.updateOptionsDropDown = function(entry) {

    // update options
    var optionsEl = domQuery('ul', entry);
    removeAllChildren(optionsEl);

    if(resource.optionsModel.length > 0) {
      forEach(resource.optionsModel, function(option) {
        var optionDomElement = domify(optionTemplate);
        optionDomElement.textContent = option.label;
        domAttr(optionDomElement, 'data-option-id', option.value);
        optionsEl.appendChild(optionDomElement);
      });
    }
  };

  resource.preventInputBlur = function(el, entry, evt) {
    // prevent the input from being blurred
    evt.preventDefault();
  };

  resource.selectOption = function(el, entry, evt) {
    var target = evt.target;
    var optionId = domAttr(target, 'data-option-id');

    if(!optionId) {
      return;
    }

    // select option
    // set label to input field
    domQuery('input', entry).value = resource.selectOptionById(optionId);

    return true;
  };

  return resource;
};

module.exports = PropertyEntryFactory;
