module.exports = {
  __depends__: [
    require('./cmd')
  ],
  __init__: [ 'propertiesPanel' ],
  propertiesPanel: [ 'type', require('./PropertiesPanel') ]
};
