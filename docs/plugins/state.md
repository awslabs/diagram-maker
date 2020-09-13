---
sort: 3
---

# Store state
Your plugin may or may not want to store additional state. Some plugins, for example, could choose to just bind keyboard shortcuts might not need to store any additional state, but in some cases(like the [minimap plugin](https://github.com/awslabs/diagram-maker-plugin-minimap)), plugins will store additional state. In those cases, the plugin could choose to store data within the plugins section of the [diagram maker state](/usage/state.html) object under its chosen ID.

```note

The ID for each of the plugin in use simultaneously needs to be unique. Please check the [plugins](/explore/plugins.html) section to see the other plugins and the ID they're using to avoid conflicts.
```

**Example: State**
```javascript
plugins: {
    testPlugin: {
      data:{
        size: { width: 200, height: 50 },
        workspacePos: { x: -100, height: -100 }
      }
    }

    ...more plugins
}
```

The state can be set using reducers. Read more about using reducers in the upcoming sections.
