'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  domQuery = require('min-dom/lib/query'),
  domClasses = require('min-dom/lib/classes'),
  domAttr = require('min-dom/lib/attr'),
  domify = require('min-dom/lib/domify'),
  forEach = require('lodash/collection/forEach'),
  indexBy = require('lodash/collection/indexBy');

var combobox = function(options, defaultParameters, getRoot, findRootElementsByType, removeAllChildren) {

  var resource = defaultParameters,
    label = options.label || resource.id,
    businessObject = options.businessObject,
    referencedType = options.referencedType,
    referenceTypeName = options.referencedType.substr(5),
    referenceProperty = options.referenceProperty,
    referencedObjectToString = options.referencedObjectToString || function(obj) {
        return obj.name + ' (id='+obj.id+')';
      };

  if(!businessObject) throw new Error('businessObject is required');
  if(!referencedType) throw new Error('referencedType is required');
  if(!referenceProperty) throw new Error('referenceProperty is required');

  resource.html =
    '<div>' +
      '<label for="camunda-' + resource.id + '">' + label + '</label>' +

      '<div>' +
        '<input id="camunda-' + resource.id + '" ' +
          'type="text" ' +
          'name="' + referenceProperty + '" ' +
          'data-focus="showOptions" ' +
          'data-action="showOptions" ' +
          'data-blur="hideOptions" ' +
          'data-keypress="optionsUpdateOnKeyPress" ' +
          'data-keydown="optionsUpdateOnKeyDown" />' +

        '<button data-action="toggleOptions" data-mousedown="preventInputBlur">'+
        '</button>' +

        '<button data-action="clear" ' +
          'data-show="canClear" ' +
          'data-mousedown="preventInputBlur"><span>Clear</span></button>' +

        '<button data-action="createNew" ' +
          'data-show="canCreateNew" ' +
          'data-mousedown="preventInputBlur"><span>Create</span></button>' +
      '</div>' +

      '<div class="options" '+ //data-show="isOptionsVisible" ' +
        'data-mousedown="preventInputBlur">' +

        '<ul id="camunda-' + resource.id + '-options"></ul>' +

        '<div class="no-options" data-show="isNoOptionsAvailable">' +
          'No ' + referenceTypeName + ' defined. Type to create a new ' + referenceTypeName + '.' +
        '</div>' +

      '</div>'+
    '</div>';

  var optionTemplate = '<li data-action="selectOption"></li>';

  resource.businessObject = options.businessObject;

  resource.optionsVisible = false;
  resource.selectedOption = {};
  resource.optionsModel = [];

  resource.get = function() {
    // load available messages:
    var values = {},
        currentModel = businessObject[referenceProperty],
        currentModelValue = (currentModel) ? currentModel.id : undefined;

    resource.refreshOptionsModel();
    resource.optionsVisible = false;
    values[referenceProperty] = resource.selectOptionById(currentModelValue);
    return values;
  };

  resource.selectOptionById = function(id) {
    var selectedOption = indexBy(resource.optionsModel, 'value')[id];
    resource.selectedOption = selectedOption;
    return selectedOption ? selectedOption.label : '';
  };

  resource.refreshOptionsModel = function() {
    var model = [];
    var referableObjects = findRootElementsByType(businessObject, referencedType);
    forEach(referableObjects, function(obj) {
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

    if(!resource.selectedOption && providedValue && providedValue.length > 0) {
      // create and reference new element
      return {
        cmd: 'properties-panel.create-and-reference',
        context: {
          element: element,
          referencingObject: businessObject,
          referenceProperty: referenceProperty,
          newObject: { type: referencedType, properties: { name: providedValue } },
          newObjectContainer: getRoot(businessObject).rootElements,
          newObjectParent: getRoot(businessObject)
        }
      };
    } else {
      // update or clear reference on business object
      var changes = {};
      changes[referenceProperty] = ( resource.selectedOption ) ? resource.selectedOption.value : undefined;

      return {
        cmd:'properties-panel.update-businessobject',
        context: {
          element: element,
          businessObject: businessObject,
          referenceType: referencedType,
          referenceProperty: referenceProperty,
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
    var changed = resource.selectedOption;
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
    } else {
      resource.hideOptions(el, node, evt);
    }
  };

  resource.showOptions  = function (el, node) {
    resource.optionsVisible = true;
    resource.updateOptionsDropDown(node, domQuery('input', node));
    domClasses(node).add('open');
  };

  resource.hideOptions = function(el, node) {
    resource.optionsVisible = false;
    domClasses(node).remove('open');
  };

  resource.canCreateNew = function(el, entry) {
    var value = domQuery('input', entry).value;
    return !resource.selectedOption && value && value.length > 0;
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
    if(resource.selectedOption && evt.charCode) {
      evt.target.value = '';
      resource.selectedOption = null;
    }

    resource.optionsVisible = true;
    resource.updateOptionsDropDown(entry);
  };

  resource.optionsUpdateOnKeyDown = function(el, entry, evt) {

    // clear on backspace
    if(resource.selectedOption && evt.keyCode === 8) {
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
    var target = evt.target,
        optionId = domAttr(target, 'data-option-id');

    if(!optionId) {
      return;
    }

    // select option and set label to input field
    domQuery('input', entry).value = resource.selectOptionById(optionId);

    return true;
  };

  resource.cssClasses = ['combobox'];

  return resource;
};

module.exports = combobox;
