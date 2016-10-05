module.exports = {
  __depends__: [
    require('./cmd')
  ],
  __init__: [
    'customElementsPropertiesActivator',
    'elementTemplatesLoader'
  ],
  customElementsPropertiesActivator: [ 'type', require('./CustomElementsPropertiesActivator') ],
  elementTemplates: [ 'type', require('./ElementTemplates') ],
  elementTemplatesLoader: [ 'type', require('./ElementTemplatesLoader') ]
};