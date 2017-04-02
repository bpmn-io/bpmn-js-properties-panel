module.exports = {
  __depends__: [
    require('./cmd'),
    require('../../../i18n/translate')
  ],
  __init__: [
    'customElementsPropertiesActivator',
    'elementTemplatesLoader'
  ],
  customElementsPropertiesActivator: [ 'type', require('./CustomElementsPropertiesActivator') ],
  elementTemplates: [ 'type', require('./ElementTemplates') ],
  elementTemplatesLoader: [ 'type', require('./ElementTemplatesLoader') ]
};