module.exports = {
  __depends__: [
    require('./element-templates'),
    require('diagram-js/lib/i18n/translate')
  ],
  __init__: [ 'propertiesProvider' ],
  propertiesProvider: [ 'type', require('./CamundaPropertiesProvider') ]
};
