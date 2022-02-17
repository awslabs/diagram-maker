import {
  DiagramMaker, EditorMode, Event, Layout, WorkflowLayoutDirection, WorkspaceActions,
} from 'diagramMaker/index';
import { DiagramMakerNode, DiagramMakerPotentialNode, Size } from 'diagramMaker/state/types';
import { Action, AnyAction } from 'redux';

export function createDivWithText(text: string) {
  const newDiv = document.createElement('div');
  const newContent = document.createTextNode(text);
  newDiv.appendChild(newContent);
  return newDiv;
}

export function createPotentialNode(node: DiagramMakerPotentialNode, container: HTMLElement) {
  const id = node.typeId;
  const newDiv = createDivWithText(id);
  newDiv.classList.add('rectangle', 'example-node');
  container.innerHTML = '';
  container.appendChild(newDiv);
  return newDiv;
}

export function createRectangularNode(node: DiagramMakerNode<{ odd?: boolean }>, container: HTMLElement) {
  const id = node.id.substring(0, 13);
  const newDiv = createDivWithText(id);
  newDiv.classList.add('rectangle', 'example-node');
  if (node.diagramMakerData.selected) {
    newDiv.classList.add('selected');
  }
  if (node.consumerData) {
    if (node.consumerData.odd) {
      newDiv.classList.add('odd');
    } else {
      newDiv.classList.add('even');
    }
  }
  container.innerHTML = '';
  container.appendChild(newDiv);
  return newDiv;
}

export function createRectangularConnectorNode(node: DiagramMakerNode<{ odd?: boolean }>, container: HTMLElement) {
  const id = node.id.substring(0, 13);
  const newDiv = createDivWithText(id);
  newDiv.classList.add('rectangle', 'example-node', 'connector-node');
  if (node.diagramMakerData.selected) {
    newDiv.classList.add('selected');
  }
  container.innerHTML = '';
  const connectorDiv = document.createElement('div');
  connectorDiv.classList.add('outer', 'outer-rectangle');
  connectorDiv.setAttribute('data-id', node.id);
  connectorDiv.setAttribute('data-type', 'DiagramMaker.Connector');
  connectorDiv.setAttribute('data-draggable', 'true');
  connectorDiv.setAttribute('data-event-target', 'true');
  newDiv.setAttribute('data-id', node.id);
  newDiv.setAttribute('data-type', 'DiagramMaker.Connector');
  newDiv.setAttribute('data-dropzone', 'true');
  container.appendChild(connectorDiv);
  container.appendChild(newDiv);
  return newDiv;
}

export function createNodeWithInput(node: DiagramMakerNode<any>, container: HTMLElement) {
  if (container.innerHTML !== '') {
    const childDiv = container.children[0];
    if (node.diagramMakerData.selected) {
      childDiv.classList.add('selected');
    } else {
      childDiv.classList.remove('selected');
    }
    return undefined;
  }
  const newDiv = document.createElement('div');
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('data-event-target', 'true');
  input.setAttribute('data-draggable', 'true');
  newDiv.appendChild(input);
  newDiv.classList.add('rectangle', 'example-node');
  if (node.diagramMakerData.selected) {
    newDiv.classList.add('selected');
  }
  container.appendChild(newDiv);
  return newDiv;
}

export function createNodeWithDropdown(node: DiagramMakerNode<any>, container: HTMLElement) {
  if (container.innerHTML !== '') {
    const childDiv = container.children[0];
    if (node.diagramMakerData.selected) {
      childDiv.classList.add('selected');
    } else {
      childDiv.classList.remove('selected');
    }
    return undefined;
  }
  const newDiv = document.createElement('div');
  const select = document.createElement('select');
  const option = document.createElement('option');
  const optionValue = document.createTextNode('test');
  option.appendChild(optionValue);
  select.appendChild(option);
  select.setAttribute('type', 'text');
  select.setAttribute('data-event-target', 'true');
  newDiv.appendChild(select);
  newDiv.classList.add('rectangle', 'example-node');
  if (node.diagramMakerData.selected) {
    newDiv.classList.add('selected');
  }
  container.appendChild(newDiv);
  return newDiv;
}

export function createCircularNode(node: DiagramMakerNode<any>, container: HTMLElement) {
  const id = node.id.substring(0, 13);
  const newDiv = createDivWithText(id);
  newDiv.classList.add('circle', 'example-node');
  if (node.diagramMakerData.selected) {
    newDiv.classList.add('selected');
  }
  container.innerHTML = '';
  const connectorDiv = document.createElement('div');
  connectorDiv.classList.add('outer');
  connectorDiv.setAttribute('data-id', node.id);
  connectorDiv.setAttribute('data-type', 'DiagramMaker.Connector');
  connectorDiv.setAttribute('data-draggable', 'true');
  connectorDiv.setAttribute('data-event-target', 'true');
  newDiv.setAttribute('data-id', node.id);
  newDiv.setAttribute('data-type', 'DiagramMaker.Connector');
  newDiv.setAttribute('data-dropzone', 'true');
  container.appendChild(connectorDiv);
  container.appendChild(newDiv);
  return newDiv;
}

export function createContextMenu(text: string) {
  const newDiv = createDivWithText(text);
  newDiv.classList.add('contextMenu');
  return newDiv;
}

export function createNodeContextMenu(id: string | undefined, container: HTMLElement) {
  if (!id) {
    return;
  }
  container.innerHTML = '';
  container.appendChild(createContextMenu(`This is the node: ${id}`));
}

export function createEdgeContextMenu(id: string | undefined, container: HTMLElement) {
  if (!id) {
    return;
  }
  container.innerHTML = '';
  container.appendChild(createContextMenu(`This is the edge: ${id}`));
}

export function createPanelContextMenu(id: string | undefined, container: HTMLElement) {
  if (!id) {
    return;
  }
  container.innerHTML = '';
  container.appendChild(createContextMenu(`This is the panel: ${id}`));
}

export function createWorkspaceContextMenu(container: HTMLElement) {
  container.innerHTML = '';
  container.appendChild(createContextMenu('This is the workspace'));
}

export function createPanelNode(testId: string, text: string, size?: Size) {
  const newDiv = createDivWithText(text);
  newDiv.classList.add('rectangle', 'example-node', 'potential-node');
  newDiv.setAttribute('data-id', testId);
  newDiv.setAttribute('data-type', 'DiagramMaker.PotentialNode');
  newDiv.setAttribute('data-draggable', 'true');
  newDiv.setAttribute('data-event-target', 'true');
  if (size) {
    newDiv.setAttribute('data-width', `${size.width}`);
    newDiv.setAttribute('data-height', `${size.height}`);
  }
  return newDiv;
}

export function createLibraryPanel(container: HTMLElement) {
  if (container.innerHTML !== '') {
    return undefined;
  }

  const newDiv = document.createElement('div');
  newDiv.setAttribute('data-event-target', 'true');
  newDiv.setAttribute('data-dropzone', 'true');
  newDiv.classList.add('library');

  // Create element that is draggable at the top of the panel
  const draggableElement = document.createElement('div');
  draggableElement.innerText = 'drag here';
  draggableElement.classList.add('draggableElement');
  draggableElement.setAttribute('data-event-target', 'true');
  draggableElement.setAttribute('data-draggable', 'true');
  draggableElement.setAttribute('data-type', 'DiagramMaker.PanelDragHandle');
  draggableElement.setAttribute('data-id', 'library');

  newDiv.appendChild(draggableElement);

  newDiv.appendChild(createPanelNode('testId-normal', 'Normal'));
  newDiv.appendChild(createPanelNode('testId-normalWithSize', 'Normal with Size', { width: 100, height: 50 }));
  newDiv.appendChild(createPanelNode('testId-topBottom', 'Top Bottom'));
  newDiv.appendChild(createPanelNode('testId-centered', 'Centered'));
  newDiv.appendChild(createPanelNode('testId-start', 'Start Node'));
  newDiv.appendChild(createPanelNode('testId-end', 'End Node'));
  newDiv.appendChild(createPanelNode('testId-dead', 'Dead Node'));
  newDiv.appendChild(createPanelNode('testId-input', 'With Input'));
  newDiv.appendChild(createPanelNode('testId-dropdown', 'With Dropdown'));
  container.appendChild(newDiv);
  return newDiv;
}

function createToolButton(text: string, eventListener: () => void) {
  const newDiv = createDivWithText(text);
  newDiv.setAttribute('data-type', 'DiagramMaker.Tools');
  newDiv.setAttribute('data-id', text);
  newDiv.addEventListener('click', eventListener);
  return newDiv;
}

function createUpdateContainerButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('UpdateContainer', () => {
    getDiagramMakerObj().updateContainer();
  });
}

function createDestroyButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('Destroy', () => {
    getDiagramMakerObj().destroy();
  });
}

function createDragToolButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('Drag', () => {
    getDiagramMakerObj().api.setEditorMode(EditorMode.DRAG);
  });
}

function createSelectToolButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('Select', () => {
    getDiagramMakerObj().api.setEditorMode(EditorMode.SELECT);
  });
}

function createReadOnlyToolButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('ReadOnly', () => {
    getDiagramMakerObj().api.setEditorMode(EditorMode.READ_ONLY);
  });
}

function createFocusNodeButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('FocusNode', () => {
    getDiagramMakerObj().api.focusNode('node1');
  });
}

function createFocusSelectedButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('FocusSelected', () => {
    getDiagramMakerObj().api.focusSelected();
  });
}

function createFitButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('Fit', () => {
    getDiagramMakerObj().api.fit();
  });
}

function createZoomInButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('ZoomIn', () => {
    getDiagramMakerObj().api.zoomIn();
  });
}

function createZoomOutButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('ZoomOut', () => {
    getDiagramMakerObj().api.zoomOut();
  });
}

function createResetZoomButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('ResetZoom', () => {
    getDiagramMakerObj().api.resetZoom();
  });
}

function createUndoButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('Undo', () => {
    getDiagramMakerObj().api.undo();
  });
}

function createRedoButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('Redo', () => {
    getDiagramMakerObj().api.redo();
  });
}

function createWorkflowLayoutButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('WorkflowLayout', () => {
    getDiagramMakerObj().api.layout({
      direction: WorkflowLayoutDirection.LEFT_RIGHT,
      distanceMin: 200,
      layoutType: Layout.WORKFLOW,
    });
  });
}

function createHierarchicalLayoutButton(getDiagramMakerObj: () => DiagramMaker) {
  return createToolButton('HierarchicalLayout', () => {
    getDiagramMakerObj().api.layout({
      distanceMin: 200,
      fixedNodeIds: ['node1'],
      layoutType: Layout.HIERARCHICAL,
    });
  });
}

function createTestInput() {
  const div = document.createElement('div');
  const input = document.createElement('input');
  input.classList.add('testInput');
  input.setAttribute('data-type', 'DiagramMaker.Tools');
  input.setAttribute('data-id', 'TestInput');
  input.setAttribute('type', 'text');
  div.appendChild(input);
  return div;
}

export function createToolsPanel(container: HTMLElement, getDiagramMakerObj: () => DiagramMaker) {
  if (container.innerHTML !== '') {
    return;
  }

  const newDiv = document.createElement('div');
  newDiv.classList.add('tools');

  newDiv.appendChild(createUpdateContainerButton(getDiagramMakerObj));
  newDiv.appendChild(createDestroyButton(getDiagramMakerObj));
  newDiv.appendChild(createDragToolButton(getDiagramMakerObj));
  newDiv.appendChild(createSelectToolButton(getDiagramMakerObj));
  newDiv.appendChild(createReadOnlyToolButton(getDiagramMakerObj));
  newDiv.appendChild(createFocusNodeButton(getDiagramMakerObj));
  newDiv.appendChild(createFocusSelectedButton(getDiagramMakerObj));
  newDiv.appendChild(createFitButton(getDiagramMakerObj));
  newDiv.appendChild(createZoomInButton(getDiagramMakerObj));
  newDiv.appendChild(createZoomOutButton(getDiagramMakerObj));
  newDiv.appendChild(createResetZoomButton(getDiagramMakerObj));
  newDiv.appendChild(createUndoButton(getDiagramMakerObj));
  newDiv.appendChild(createRedoButton(getDiagramMakerObj));
  newDiv.appendChild(createWorkflowLayoutButton(getDiagramMakerObj));
  newDiv.appendChild(createHierarchicalLayoutButton(getDiagramMakerObj));
  newDiv.appendChild(createTestInput());

  container.appendChild(newDiv);
}

export function createPluginPanel(container: HTMLElement, state: any) {
  if (container.innerHTML !== '') {
    return undefined;
  }

  const newDiv = document.createElement('div');
  newDiv.setAttribute('data-event-target', 'true');
  newDiv.setAttribute('data-dropzone', 'true');
  newDiv.classList.add('library');

  // Create element that is draggable at the top of the panel
  const draggableElement = document.createElement('div');
  draggableElement.innerText = 'drag here';
  draggableElement.classList.add('draggableElement');
  draggableElement.setAttribute('data-event-target', 'true');
  draggableElement.setAttribute('data-draggable', 'true');
  draggableElement.setAttribute('data-type', 'DiagramMaker.PanelDragHandle');
  draggableElement.setAttribute('data-id', 'plugin');
  newDiv.appendChild(draggableElement);

  // Create a plugin that can drag workspace to a target position
  const testPlugin = createDivWithText('Click this plugin to move workspace to a target position');
  testPlugin.setAttribute('data-event-target', 'true');
  testPlugin.setAttribute('data-type', 'testPlugin');
  testPlugin.setAttribute('data-id', 'testPlugin');
  const { width } = state.plugins.testPlugin.data.size;
  const { height } = state.plugins.testPlugin.data.size;
  testPlugin.style.width = `${width}px`;
  testPlugin.style.height = `${height}px`;
  testPlugin.style.backgroundColor = 'orange';
  testPlugin.style.paddingTop = '15px';
  testPlugin.style.textAlign = 'center';
  newDiv.appendChild(testPlugin);

  container.appendChild(newDiv);
  return newDiv;
}

export function handleTestPluginEvent(event: any, diagramMaker: any) {
  if (event.type === Event.LEFT_CLICK && event.target.type === 'testPlugin') {
    const state = diagramMaker.store.getState();
    if (!state.plugins) return;
    const position = state.plugins.testPlugin.data.workspacePos;

    diagramMaker.api.dispatch({
      payload: { position },
      type: WorkspaceActions.WORKSPACE_DRAG,
    });
  }
}

export function updateActionInLogger(action: Action) {
  const anyAction = action as AnyAction;
  const logger = document.getElementById('diagramMakerLogger');
  if (logger) {
    const type = createDivWithText(`Type is ${action.type}`);
    type.setAttribute('data-type', 'DiagramMaker.ActionType');
    type.setAttribute('data-id', action.type);
    logger.innerHTML = '';
    logger.appendChild(type);
    if (anyAction.payload) {
      const payload = createDivWithText(`Payload is ${JSON.stringify(anyAction.payload)}`);
      payload.setAttribute('data-type', 'DiagramMaker.ActionPayload');
      payload.setAttribute('data-id', action.type);
      logger.appendChild(payload);
    }
  }
}

export function addDevTools() {
  if (process.env.NODE_ENV === 'development') {
    const windowAsAny = window as any;
    // eslint-disable-next-line no-underscore-dangle
    return windowAsAny.__REDUX_DEVTOOLS_EXTENSION__ && windowAsAny.__REDUX_DEVTOOLS_EXTENSION__();
  }
  return undefined;
}
