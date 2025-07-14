# Custom Panel Header Provider

This feature allows you to provide a custom panel header provider for the BPMN properties panel, enabling you to customize the appearance and behavior of the properties panel header.

## Overview

The properties panel header displays information about the currently selected element, including:
- Element icon
- Element type label  
- Element name/label
- Documentation link (optional)

With the custom header provider feature, you can:
- Change how elements are displayed in the header
- Add custom icons or styling
- Provide custom type labels
- Add custom documentation links
- Style headers based on element types

## Usage

### Basic Custom Header Provider

You can provide a custom header provider by registering it as a service:

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { BpmnPropertiesPanelModule } from 'bpmn-js-properties-panel';

// Define your custom header provider
const CustomHeaderProviderModule = {
  propertiesPanelHeaderProvider: ['value', {
    getElementLabel: function(element) {
      // Custom label logic
      return 'Custom: ' + (element.businessObject.name || element.id);
    },
    
    getElementIcon: function(element) {
      // Return custom icon based on element type
      if (element.type === 'bpmn:UserTask') {
        return () => '<i class="fa fa-user"></i>';
      }
      return null; // Use default icon
    },
    
    getTypeLabel: function(element) {
      // Custom type labeling
      const type = element.type.split(':')[1] || element.type;
      return type.toUpperCase() + ' (CUSTOM)';
    },
    
    getDocumentationRef: function(element) {
      // Provide custom documentation links
      return 'https://your-docs.com/elements/' + element.type;
    }
  }]
};

const modeler = new BpmnModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties'
  },
  additionalModules: [
    BpmnPropertiesPanelModule,
    CustomHeaderProviderModule
  ]
});
```

### Service-Based Header Provider

For more complex scenarios, you can implement a service class:

```javascript
class MyCustomHeaderProvider {
  constructor(translate, elementTemplates) {
    this._translate = translate;
    this._elementTemplates = elementTemplates;
  }
  
  getHeaderProvider() {
    return {
      getElementLabel: (element) => {
        // Use translation service
        return this._translate('Element: {name}', { 
          name: element.businessObject.name || element.id 
        });
      },
      
      getElementIcon: (element) => {
        // Custom icon logic with element templates support
        const template = this._elementTemplates && this._elementTemplates.get(element);
        if (template && template.icon) {
          return () => `<img src="${template.icon}" alt="Template Icon" />`;
        }
        
        // Font Awesome icons based on element type
        const iconMap = {
          'bpmn:UserTask': 'fa-user',
          'bpmn:ServiceTask': 'fa-cog',
          'bpmn:StartEvent': 'fa-play'
        };
        
        const iconClass = iconMap[element.type] || 'fa-question';
        return () => `<i class="fa ${iconClass}"></i>`;
      },
      
      getTypeLabel: (element) => {
        const template = this._elementTemplates && this._elementTemplates.get(element);
        if (template && template.name) {
          return this._translate(template.name);
        }
        
        const type = element.type.split(':')[1] || element.type;
        return this._translate(type.replace(/([A-Z])/g, ' $1').trim());
      },
      
      getDocumentationRef: (element) => {
        const template = this._elementTemplates && this._elementTemplates.get(element);
        return template && template.documentationRef;
      }
    };
  }
}

MyCustomHeaderProvider.$inject = ['translate', 'elementTemplates'];

const CustomHeaderProviderModule = {
  propertiesPanelHeaderProvider: ['type', MyCustomHeaderProvider]
};
```

### Styling-Based Customization

You can add CSS classes or styling based on element types:

```javascript
const StyledHeaderProviderModule = {
  propertiesPanelHeaderProvider: ['value', {
    getElementLabel: function(element) {
      return element.businessObject.name || element.id;
    },
    
    getElementIcon: function(element) {
      // Return styled icons with CSS classes
      const colorMap = {
        'bpmn:UserTask': 'blue',
        'bpmn:ServiceTask': 'green', 
        'bpmn:StartEvent': 'orange'
      };
      
      const color = colorMap[element.type] || 'gray';
      return () => `<div class="custom-element-icon" style="color: ${color};">●</div>`;
    },
    
    getTypeLabel: function(element) {
      const type = element.type.split(':')[1] || element.type;
      return type.toUpperCase();
    },
    
    getDocumentationRef: function(element) {
      return null;
    }
  }]
};
```

## API Reference

The header provider object should implement the following methods:

### `getElementLabel(element)`
- **Parameters**: `element` - The BPMN element
- **Returns**: `string` - The label to display for the element
- **Description**: Determines how the element name/label is displayed

### `getElementIcon(element)`
- **Parameters**: `element` - The BPMN element  
- **Returns**: `function|null` - A function that returns HTML for the icon, or null
- **Description**: Provides custom icon rendering for the element

### `getTypeLabel(element)`
- **Parameters**: `element` - The BPMN element
- **Returns**: `string` - The type label to display
- **Description**: Determines how the element type is displayed

### `getDocumentationRef(element)`
- **Parameters**: `element` - The BPMN element
- **Returns**: `string|null` - URL to documentation, or null
- **Description**: Provides a link to documentation for the element

## Migration from Default

If you're currently using the default header provider and want to maintain the same behavior while adding customizations:

```javascript
import { PanelHeaderProvider } from 'bpmn-js-properties-panel';

const EnhancedHeaderProviderModule = {
  propertiesPanelHeaderProvider: ['type', class {
    constructor(translate) {
      this._translate = translate;
      this._defaultProvider = PanelHeaderProvider(translate);
    }
    
    getHeaderProvider() {
      return {
        getElementLabel: (element) => {
          // Use default behavior
          return this._defaultProvider.getElementLabel(element);
        },
        
        getElementIcon: (element) => {
          // Add custom icon for specific types, fall back to default
          if (element.type === 'bpmn:UserTask') {
            return () => '<i class="fa fa-user custom-user-icon"></i>';
          }
          return this._defaultProvider.getElementIcon(element);
        },
        
        getTypeLabel: (element) => {
          // Use default behavior
          return this._defaultProvider.getTypeLabel(element);
        },
        
        getDocumentationRef: (element) => {
          // Use default behavior  
          return this._defaultProvider.getDocumentationRef(element);
        }
      };
    }
  }]
};
```

## Examples

### Element Template Integration
```javascript
// Enhance header with element template information
const templateHeaderProvider = {
  getElementLabel: function(element) {
    const templates = this.elementTemplates;
    const template = templates && templates.get(element);
    
    if (template) {
      return `${template.name}: ${element.businessObject.name || element.id}`;
    }
    
    return element.businessObject.name || element.id;
  }
  // ... other methods
};
```

### Type-Based Styling
```javascript
// Apply different styling based on element types
const typeBasedProvider = {
  getTypeLabel: function(element) {
    const typeStyles = {
      'bpmn:UserTask': '👤 USER TASK',
      'bpmn:ServiceTask': '⚙️ SERVICE TASK',
      'bpmn:StartEvent': '▶️ START EVENT'
    };
    
    return typeStyles[element.type] || element.type.split(':')[1].toUpperCase();
  }
};
```

## Backward Compatibility

This feature is fully backward compatible. If no custom header provider is registered, the default header provider will be used automatically, maintaining the existing behavior.
