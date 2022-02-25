# Changelog for Diagram maker

## 2.0.1
* fix: Revisit dependency bundling to be able to use in react projects
* feature(docs): Use storybook for test environment & for documentation

## 2.0.0
* Upgrade all deps to latest & remove runtime deps from output bundle (#89)
    * BREAKING CHANGE:
        * Several runtime deps like Preact have been upgraded
        * Made changes in source code to support newer lint rules, newer Preact changes, etc

    * fix: Remove runtime dependencies from output bundle and update package.json accordingly
* feature(edge): Add hover action to an edge

## 1.3.0
* Feature: Added Boundary locator for Rectangular Shape (#39) 

## 1.2.0
* chore(deps): Bump highlight.js from 10.1.2 to 10.4.1
* chore(deps): Bump ini from 1.3.5 to 1.3.8
* chore(deps): Bump node-notifier from 8.0.0 to 8.0.1
* chore(deps-dev): Bump immer from 7.0.8 to 8.0.1
* chore(deps): Bump elliptic from 6.5.3 to 6.5.4
* feature: Dark Theme

## 1.1.0
*  fix: Update devDependency based on dependabot alert
*  fix: Fix issues reported in deepsource
*  feature: Adding data attributes on edges for source node type & destination node type
