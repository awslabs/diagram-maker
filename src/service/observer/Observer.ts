export type ObserverCallback = (...args: any[]) => void;

export default class Observer {
  private globalEventListeners: ObserverCallback[] = [];

  private events: {
    [key: string]: ObserverCallback[]
  } = {};

  public subscribe = (event: string, callback: ObserverCallback): void => {
    if (!this.hasEvent(event)) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  };

  public subscribeAll = (callback: ObserverCallback): void => {
    this.globalEventListeners.push(callback);
  };

  public publish = (event: string, payload?: any): void => {
    this.globalEventListeners.forEach((callback) => {
      callback(payload);
    });

    if (!this.hasEvent(event)) {
      return;
    }

    this.events[event].forEach((callback) => {
      callback(payload);
    });
  };

  private hasEvent = (event: string): boolean => !!this.events[event];
}
