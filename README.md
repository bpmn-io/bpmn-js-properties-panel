> 👷‍♀️👷‍♂️🏗

# @bpmn-io/bpmn-properties-panel

[![CI](https://github.com/bpmn-io/bpmn-properties-panel/workflows/CI/badge.svg)](https://github.com/bpmn-io/bpmn-properties-panel/actions?query=workflow%3ACI)


Properties panel for [bpmn-js](https://github.com/bpmn-io/bpmn-js), built on top of [@bpmn-io/properties-panel](https://github.com/bpmn-io/properties-panel).

## Installation


```
npm install bpmn-io/bpmn-properties-panel
```

## Usage


Provide two HTML elements, one for the properties panel and one for the BPMN diagram:

```html
<div class="modeler">
  <div id="canvas"></div>
  <div id="properties"></div>
</div>
```

Bootstrap [bpmn-js](https://github.com/bpmn-io/bpmn-js) with the properties panel and a [properties provider](https://github.com/bpmn-io/bpmn-properties-panel/tree/master/src/provider):


```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from '@bpmn-io/bpmn-properties-panel';

const modeler = new BpmnModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule
  ]
});
```

## Styling


For proper styling include the necessary stylesheets:

```html
<link rel="stylesheet" href="https://unpkg.com/@bpmn-io/bpmn-properties-panel@0.3.0/dist/assets/properties-panel.css">
<link rel="stylesheet" href="https://unpkg.com/@bpmn-io/bpmn-properties-panel@0.3.0/dist/assets/element-templates.css">
```

## API


#### `BpmnPropertiesPanelRenderer#attachTo(container: HTMLElement) => void`

Attach the properties panel to a parent node.

```javascript
const propertiesPanel = modeler.get('propertiesPanel');

propertiesPanel.attachTo('#other-properties');
```

#### `BpmnPropertiesPanelRenderer#detach() => void`

Detach the properties panel from its parent node.

```javascript
const propertiesPanel = modeler.get('propertiesPanel');

propertiesPanel.detach();
```

#### `BpmnPropertiesPanelRenderer#registerProvider(priority: Number, provider: PropertiesProvider) => void`

Register a new properties provider to the properties panel.

```javascript
class ExamplePropertiesProvider {
  constructor(propertiesPanel) {
    propertiesPanel.registerProvider(500, this);
  }

  getGroups(element) {
    return (groups) => {

      // add, modify or remove groups
      // ...

      return groups;
    };
  }
}

ExamplePropertiesProvider.$inject = [ 'propertiesPanel' ];
```


## Build and Run


Prepare the project by installing all dependencies:

```sh
npm install
```

Then, depending on your use-case, you may run any of the following commands:

```sh
# build the library and run all tests
npm run all

# spin up a single local modeler instance
npm start

# run the full development setup
npm run dev
```

## Release

```sh
np --no-publish
```

## License

MIT