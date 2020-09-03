/**
 * Gets DOM element based on data-id & data-type
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getElementByDataIdAndType(id: string, type: string): Cypress.Chainable {
  return cy.get(`[data-id="${id}"][data-type="${type}"]`);
}

/**
 * Gets DOM element based on data-type
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getElementByType(type: string): Cypress.Chainable {
  return cy.get(`[data-type="${type}"]`);
}

/**
 * Gets top level container rendered by diagram maker
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getDiagramMakerView(): Cypress.Chainable {
  return getElementByType('DiagramMaker.View');
}

/**
 * Gets DOM element for diagram maker workspace
 * @return {Cypress.Chainable} A Cypress object
 */
export function getWorkspace() {
  return getElementByType('DiagramMaker.Workspace');
}

/**
 * Gets DOM element for diagram maker selection marquee
 * @return {Cypress.Chainable} A Cypress object
 */
export function getSelectionMarquee() {
  return getElementByType('DiagramMaker.SelectionMarquee');
}

/**
 * Gets DOM element for the currently rendered context menu
 * @return {Cypress.Chainable} A Cypress object
 */
export function getContextMenu() {
  return getElementByType('DiagramMaker.ContextMenu');
}

/**
 * Gets DOM element for diagram maker nodes based on data-id
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getNodeById(id: string): Cypress.Chainable {
  return getElementByDataIdAndType(id, 'DiagramMaker.Node');
}

/**
 * Gets DOM element for diagram maker edges based on data-id
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getEdgeById(id: string): Cypress.Chainable {
  return getElementByDataIdAndType(id, 'DiagramMaker.Edge');
}

/**
 * Gets DOM element for diagram maker edge badges based on data-id
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getEdgeBadgeById(id: string): Cypress.Chainable {
  return getElementByDataIdAndType(id, 'DiagramMaker.EdgeBadge');
}

/**
 * Gets DOM element for diagram maker potential nodes based on data-id
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getPotentialNodeById(id: string): Cypress.Chainable {
  return getElementByDataIdAndType(id, 'DiagramMaker.PotentialNode');
}

/**
 * Gets DOM element for diagram maker potential edges
 * @return {Cypress.Chainable} A Cypress object
 */
export function getPotentialEdge(): Cypress.Chainable {
  return getElementByType('DiagramMaker.PotentialEdge');
}

/**
 * Gets DOM element for diagram maker panels based on data-id
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getPanelById(id: string): Cypress.Chainable {
  return getElementByDataIdAndType(id, 'DiagramMaker.Panel');
}

/**
 * Gets DOM element for diagram maker panel drag handle based on data-id
 * @param {string} id
 * @return {Cypress.Chainable} A Cypress object
 */
export function getPanelDragHandleById(id: string): Cypress.Chainable {
  return getElementByDataIdAndType(id, 'DiagramMaker.PanelDragHandle');
}

/**
 * Gets DOM elements for all diagram maker nodes
 * @return {Cypress.Chainable} A Cypress object
 */
export function getAllNodes(): Cypress.Chainable {
  return getElementByType('DiagramMaker.Node');
}

/**
 * Gets DOM elements for all diagram maker edges
 * @return {Cypress.Chainable} A Cypress object
 */
export function getAllEdges(): Cypress.Chainable {
  return getElementByType('DiagramMaker.Edge');
}
