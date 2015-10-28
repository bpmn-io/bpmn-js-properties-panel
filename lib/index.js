module.exports = {
  __depends__: [
    require('./provider/camunda')
  ],
  __init__: [ 'propertiesPanel' ],
  propertiesPanel: [ 'type', require('./PropertiesPanel') ]
};
