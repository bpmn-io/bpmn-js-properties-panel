module.exports = {
  __depends__: [
    require('./cmd')
  ],
  __init__: [
    'customElementsPropertiesActivator'
  ],
  customElementsPropertiesActivator: [ 'type', require('./CustomElementsPropertiesActivator') ],
  elementTemplates: [ 'type', require('./ElementTemplates') ]
};