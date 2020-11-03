module.exports = {
  __depends__: [
    require('./cmd'),
    require('diagram-js/lib/i18n/translate').default
  ],
  __init__: [
    'customElementsPropertiesActivator',
    'elementTemplatesLoader',
    'replaceBehavior'
  ],
  customElementsPropertiesActivator: [ 'type', require('./CustomElementsPropertiesActivator') ],
  elementTemplates: [ 'type', require('./ElementTemplates') ],
  elementTemplatesLoader: [ 'type', require('./ElementTemplatesLoader') ],
  replaceBehavior: [ 'type', require('./ReplaceBehavior') ],
};
