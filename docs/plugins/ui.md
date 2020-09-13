---
sort: 2
---

# Render UI
Your plugin may or may not want to render some UI elements. Some plugins, for example, could choose to just bind keyboard shortcuts might not need to render any UI elements, but in some cases(like the [minimap plugin](https://github.com/awslabs/diagram-maker-plugin-minimap)), plugins will render UI elements. In those cases, the plugin should expose methods or Components that the consumer will integrate within their own application to render the plugin's UI.

**Example: Render Method**
```javascript
myDiv.appendChild(createTestPlugin());
```

**Example: JSX Component**
```javascript
render = () => (
  <div>
    <TestPluginComponent/>
  </div>
);
```
