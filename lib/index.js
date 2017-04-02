module.exports = {
  __depends__: [
    require('./cmd'),
    require('./i18n/translate')
  ],
  __init__: [ 'propertiesPanel' ],
  propertiesPanel: [ 'type', require('./PropertiesPanel') ]
};
