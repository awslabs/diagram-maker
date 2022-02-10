// Object.values() polyfill
// TODO: import polyfills instead of bundling it
import 'diagramMaker/polyfills/object-values';

import {
  Action, Reducer, Store, StoreEnhancer,
} from 'redux';

import { destroy, render } from 'diagramMaker/components/renderUtils';
import ConfigService, { DiagramMakerConfig } from 'diagramMaker/service/ConfigService';
import DiagramMakerApi from 'diagramMaker/service/DiagramMakerApi';
import Observer, { ObserverCallback } from 'diagramMaker/service/observer/Observer';
import UIEventManager, {
  ContainerEventType,
  DestroyEventType,
} from 'diagramMaker/service/ui/UIEventManager';
import UIEventNormalizer from 'diagramMaker/service/ui/UIEventNormalizer';
import ActionDispatcher from 'diagramMaker/state/ActionDispatcher';
import createStore from 'diagramMaker/state/createStore';
import { DiagramMakerData } from 'diagramMaker/state/types';

/**
 * Top Level DiagramMaker Class.
 * Instantiate to render a diagram maker instance within a container.
 * @class
 */
export default class DiagramMaker<NodeType = {}, EdgeType = {}> {
  /**
   * DiagramMaker store.
   * Currently used for dispatching, fetching state & listening to updates.
   * Will be moved to API and closed out.
   */
  public readonly store: Store<DiagramMakerData<NodeType, EdgeType>>;

  /**
   * DiagramMaker APIs.
   */
  public readonly api: DiagramMakerApi<NodeType, EdgeType>;

  private config: ConfigService<NodeType, EdgeType>;

  private container: HTMLElement;

  private actionDispatcher: ActionDispatcher<NodeType, EdgeType>;

  private observer: Observer;

  private eventManager: UIEventManager;

  constructor(
    domHandle: string | HTMLElement,
    config: DiagramMakerConfig<NodeType, EdgeType>,
    {
      initialData, consumerRootReducer, consumerEnhancer, eventListener,
    }: {
      initialData?: DiagramMakerData<NodeType, EdgeType>,
      consumerRootReducer?: Reducer<DiagramMakerData<NodeType, EdgeType>, Action>,
      consumerEnhancer?: StoreEnhancer,
      eventListener?: ObserverCallback;
    } = {},
  ) {
    this.config = new ConfigService(config);
    this.store = createStore(initialData, consumerRootReducer, consumerEnhancer, this.config.getActionInterceptor());
    this.api = new DiagramMakerApi(this.store);

    this.container = DiagramMaker.getContainer(domHandle);
    this.observer = new Observer();
    if (eventListener) {
      this.observer.subscribeAll(eventListener);
    }
    this.eventManager = new UIEventManager(this.observer, this.container);
    this.actionDispatcher = new ActionDispatcher(this.observer, this.store, this.config);

    render<NodeType, EdgeType>(this.store, this.container, this.config);

    this.updateContainer();
  }

  /**
   * API called to update diagram maker about container size changes.
   * Should be called when the window resizes or panels outside of diagram maker
   * opening up to cause changes to container size.
   *
   * This is used for several calculations, so dragging & other interactions might be broken
   * if this API is not called appropriately.
   */
  public updateContainer = () => {
    const normalizedEvent = UIEventNormalizer.normalizeContainerEvent(this.container);
    this.observer.publish(ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE, normalizedEvent);
  };

  /**
   * API called to clean up a diagram maker instance after the user navigates away from the page
   * or closes the workspace.
   *
   * This is used to clean up event handlers that diagram maker attaches to the container, so
   * it could lead to a memory leak if its not called. This is because DOM & event listeners
   * have a self loop so it never gets garbage collected automatically unless we remove the event
   * listeners.
   */
  public destroy = () => {
    this.observer.publish(DestroyEventType.DESTROY);
    destroy(this.container);
  };

  private static getContainer = (domHandle: string | HTMLElement) => {
    if (typeof domHandle !== 'string') {
      return domHandle;
    }
    const container = document.getElementById(domHandle);
    if (!container) {
      throw new Error('Container not found');
    }
    return container;
  };
}
