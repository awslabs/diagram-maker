---
sort: 1
---

# Introduction
Diagram Maker comes with extensibility at its core. There are several hooks exposed for consumers to customize diagram maker's behavior and the same can be used by plugins to provide reusable pieces of functionality on top of this library. Plugins can:
* Render UI elements
* Store additional state
* Detect user interaction using Diagram Maker's inbuilt UI event module
* Specify behavior via both action interceptors as well as reducers
