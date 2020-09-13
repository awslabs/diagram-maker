---
sort: 5
---

# Specify Behavior
Your plugin may or may not want to specify some behavior. Some plugins, for example, could choose to render additional UI based on current behavior like the [minimap plugin](https://github.com/awslabs/diagram-maker-plugin-minimap)), but in some cases plugins might want to override behavior. In those cases, the plugin have 2 ways to override behavior. In those cases, the plugin

## Reducer
Plugins could choose to expose its own reducer that the consumer will pass into the root reducer.

**Example: Reducer**
```javascript
const diagramMaker = new DiagramMaker(
  ...
  {
    consumerRootReducer: testPluginReducer
  }
)
```

```warning

The above approach has a shortcoming that consumer then has to choose between using this plugin and using their own reducer. To solve this problem, diagram maker exposes a utility called `sequenceReducers`.
```

**Example: Sequencing the plugin reducer**
```javascript
const diagramMaker = new DiagramMaker(
  ...
  {
    consumerRootReducer: sequenceReducers(testPluginReducer, consumerRootReducer)
  }
)
```

**Example: Sample plugin reducer**
```javascript
const testPluginReducer = (state: DiagramMakerState<NodeType, EdgeType>, action: AnyAction) => {
  switch (action.type) {
    NodeActionsType.NODE_CREATE:
      return {
        ...state,
        plugins: {
          ...state.plugins
          testPluginId: {
            data: getTestPluginData(state, action)
          }
        }
      }
    default:
      return state;
  }
}
```

## Action Interceptor
Plugins could choose to expose its own action interceptor that the consumer will use inside their own action interceptor configuration.

**Example: Action Interceptor**
```javascript
const diagramMaker = new DiagramMaker(
  container,
  {
    ...
    actionInterceptor: (action, dispatch, getState) => {
      testPluginInterceptor(action, dispatch, getState);
      dispatch(action);
    };
  }

```
