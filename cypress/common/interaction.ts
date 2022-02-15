import { getNodeById } from './getters';

/**
 * Returns parameters required for DiagramMaker
 * DiagramMaker currently exposes an enum for MouseEvents => MouseClickEventType
 */
function getLeftButtonMouseEventParams() {
  return { button: 0 };
}

/**
 * Returns parameters required for DiagramMaker
 * DiagramMaker currently exposes an enum for MouseEvents => MouseClickEventType
 */
function getRightButtonMouseEventParams() {
  return { button: 1 };
}

/**
 * Drags element to position dictated
 * @param {Cypress.Chainable} element DOM element to be dragged
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 * @param {} position Object representing position to move; i.e. {pageX: 0, pageY: 0} or {clientX: 0, clientY: 0}
 */
export function dragAndDropElement(
  element: Cypress.Chainable,
  position: { pageX: number, pageY: number },
  mouseParams: { button: number } = getLeftButtonMouseEventParams(),
) {
  element.trigger('mousedown', { ...mouseParams, which: 1, force: true })
    .trigger('mousemove', { ...mouseParams, ...position, force: true })
    .trigger('mouseup', { ...mouseParams, force: true });
}

/**
 * Starts dragging element to position dictated
 * @param {Cypress.Chainable} element DOM element to be dragged
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 * @param {} position Object representing position to move; i.e. {pageX: 0, pageY: 0} or {clientX: 0, clientY: 0}
 */
export function dragStartElement(
  element: Cypress.Chainable,
  position: { pageX: number, pageY: number },
  originPosition?: { pageX: number, pageY: number },
  mouseParams: { button: number } = getLeftButtonMouseEventParams(),
) {
  element.trigger('mousedown', {
    ...mouseParams, which: 1, ...originPosition, force: true,
  })
    .trigger('mousemove', { ...mouseParams, ...position, force: true });
}

/**
 * Drags element to position dictated
 * @param {Cypress.Chainable} element DOM element to be dragged
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 * @param {} position Object representing position to move; i.e. {pageX: 0, pageY: 0} or {clientX: 0, clientY: 0}
 */
export function dragElement(
  element: Cypress.Chainable,
  position: { pageX: number, pageY: number },
  mouseParams: { button: number } = getLeftButtonMouseEventParams(),
) {
  element.trigger('mousemove', { ...mouseParams, ...position, force: true });
}

/**
 * Drops element to position dictated
 * @param {Cypress.Chainable} element DOM element to be dragged
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 * @param {} position Object representing position to move; i.e. {pageX: 0, pageY: 0} or {clientX: 0, clientY: 0}
 */
export function dropElement(
  element: Cypress.Chainable,
  position?: { pageX: number, pageY: number },
  mouseParams: { button: number } = getLeftButtonMouseEventParams(),
) {
  element.trigger('mouseup', { ...mouseParams, ...position, force: true });
}

/**
 * Drags element to position with force
 * Cypres will not move the mouse if the element does not move on an action
 * So, force must be used to force cypress to move mouse
 * This is necessary for tests where mouse position matters, like edge creation
 * @param {Cypress.Chainable} element DOM element to be dragged
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 * @param {} position Object representing position to move; i.e. {pageX: 0, pageY: 0} or {clientX: 0, clientY: 0}
 */
export function forceDragAndDropElement(
  element: Cypress.Chainable,
  position: { pageX: number, pageY: number },
  mouseParams: { button: number } = getLeftButtonMouseEventParams(),
) {
  element.trigger('mousedown', { ...mouseParams, which: 1, force: true })
    .trigger('mousemove', { ...mouseParams, ...position, force: true })
    .trigger('mouseup', { ...mouseParams, force: true });
}

/**
 * Clicks on an element based on PositionType
 * @param {Cypress.Chainable} element DOM element to be selected
 * @param {Cypress.PositionType} position String representation of location for click
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 */
export function clickElement(
  element: Cypress.Chainable,
  position: Cypress.PositionType = 'center',
  mouseParams: { button: number } = getLeftButtonMouseEventParams(),
) {
  element.trigger('mousedown', position, { ...mouseParams, force: true })
    .trigger('mouseup', { ...mouseParams, force: true });
}

/**
 * Right clicks an element based on PositionType
 * @param {Cypress.Chainable} element DOM element to be selected
 * @param {Cypress.PositionType} position String representation of location for click
 * @param {{ button: number }} mouseParams DiagramMaker expected button params
 */
export function rightClickElement(
  element: Cypress.Chainable,
  position: Cypress.PositionType = 'center',
  mouseParams: { button: number } = getRightButtonMouseEventParams(),
) {
  element.trigger('contextmenu', position, { ...mouseParams, force: true });
}

/**
 * Triggers a keyboard event on a specific DOM element
 * @param {Cypress.Chainable} element DOM element on which to fire the event
 * @param {string} key the character generated by press of the key
 * @param {string} modKey whether the command key on the mac or ctrl key on windows is pressed along with the key
 */
export function triggerKeyboardEvent(
  element: Cypress.Chainable,
  key: string,
  modKey = false,
) {
  let text = key;
  if (key === 'Delete') {
    text = '{del}';
  } else if (key === 'Backspace') {
    text = '{backspace}';
  }
  if (modKey) {
    text = `{cmd}{ctrl}${text}`;
  }
  element.focus();
  element.type(text);
}

/**
 * Creates a new edge between 2 nodes.
 * @param {string} srcNode - The ID of the source node
 * @param {string} destNode - The ID of the destintation node
 */
export function createEdgeBetween(srcNode: string, destNode: string) {
  const inputNode = getNodeById(destNode);

  inputNode.children('.dm-connector-input').then((el) => {
    const rect = el[0].getBoundingClientRect();

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const outputNode = getNodeById(srcNode);
    const outputConnector = outputNode.children('.dm-connector-output');

    dragAndDropElement(outputConnector, { pageX: x, pageY: y });
  });
}
