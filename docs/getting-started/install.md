---
sort: 1
---

# Installation
You can install the package from NPM. You can use either npm or yarn for it.

## Installing the core library

### Via npm
```shell
npm install diagram-maker
```

### Via yarn
```shell
yarn add diagram-maker
```

## Installing Dependencies
Diagram Maker comes with all the required dependencies bundled. However, one of our dependencies, dagre is not bundled. The reason is that all of our other dependencies are required unconditionally. The dagre library is only required when using the workflow autolayout capabilities of Diagram Maker. To ensure that consumers who are not using those capabilities do not end up bundling dagre, we do not bundle it within Diagram Maker and instead expect consumers who are using the autolayout capabilities of Diagram Maker to install it separately like so:

### Via npm
```shell
npm install dagre
```

### Via yarn
```shell
yarn add dagre
```
