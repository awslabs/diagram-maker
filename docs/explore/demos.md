---
sort: 1
---

# Demos

Here are a few demos with different configurations to showcase uses of diagram maker. Read more about diagram maker configurations [here]({{ '/usage/configuration.html' | relative_url }}).

* **[Left Right Rectangular]({{ '/examples/LeftRightRectangular.html' | relative_url }})** : Uses a LeftRight connector placement with rectangular shape nodes by default.
* **[Top Bottom Rectangular]({{ '/examples/TopBottomRectangular.html' | relative_url }})** : Uses a TopBottom connector placement with rectangular shape nodes by default.
* **[Boundary Circular]({{ '/examples/BoundaryCircular.html' | relative_url }})** : Uses a Boundary connector placement with circular shape nodes by default.
* **[Boundary Rectangular]({{ '/examples/BoundaryRectangular.html' | relative_url }})** : Uses a Boundary connector placement with rectangular shape nodes.
* **[Layout]({{ '/examples/Layout.html' | relative_url }})** : Uses an initial graph that is setup to test the layout APIs.
* **[Action Interceptor]({{ '/examples/ActionInterceptor.html' | relative_url }})** : Uses an action interceptor to add every new node that is dragged in with an extra attribute. The extra attribute is a boolean indicating whether the node that was dragged is an odd numbered new node or not. For rectangular nodes, the odd numbered nodes have a Red colored outline and the even numbered ones have a blue outline. Furthermore, when new edges are created, it creates the reverse edge 1 second later.
* **[Dark Theme]({{ '/examples/DarkTheme.html' | relative_url }})** : Same as Left Right Rectangular demo with Dark Theme enabled.

The code for these demos can be found [here](https://github.com/awslabs/diagram-maker/tree/master/integ).
