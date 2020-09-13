---
sort: 4
---

# Detect Interaction
If your plugin renders additional UI elements, it may optionally want to use Diagram Maker's UI events module to detect and normalize those events. In those cases, the plugin could choose to expose a function that consumers will use inside their own eventListener configuration when initializing diagram maker.

**Example: Attaching an event listener**
```javascript
const diagramMaker = new DiagramMaker(
  ...
  {
    eventListener: (event: NormalizedEvent) => {
      handleTestPluginEvent(event);
    }
  }
)
```

```warning

Some plugins might require access to the diagramMaker instance inside their event listeners. To avoid circular references when initializing diagram maker for such plugins, use a wrapper object like below.
```

**Example: Passing diagram maker instance to plugin event listener**
```javascript
const wrapper = { diagramMaker: null };
wrapper.diagramMaker = new DiagramMaker(
  ...
  {
    eventListener: (event: NormalizedEvent) => {
      handleTestPluginEvent(event, wrapper.diagramMaker);
    }
  }
)
```

**Example: Sample event listener**
```javascript
export function handleTestPluginEvent(event: NormalizedEvent, diagramMaker: DiagramMaker) {
  if (event.type === Event.LEFT_CLICK && event.target.type === 'testPlugin') {
    const state = diagramMaker.store.getState();
    if (!state.plugins) return;
    const position = state.plugins.testPlugin.data.workspacePos;

    diagramMaker.api.dispatch({
      payload: { position },
      type: WorkspaceActions.WORKSPACE_DRAG
    });
  }
}
```
