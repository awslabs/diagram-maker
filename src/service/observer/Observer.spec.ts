import Observer from './Observer';

describe('Observer', () => {
  let observer: Observer;
  const event = 'example_event';

  beforeEach(() => {
    observer = new Observer();
  });

  it('calls all callbacks when a given event is published', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    observer.subscribe(event, callback1);
    observer.subscribe(event, callback2);

    observer.publish(event, {});

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('does not fire callbacks for other events which were not triggered', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    observer.subscribe(event, callback1);
    observer.subscribe('another_event', callback2);
    observer.publish(event, {});

    expect(callback1).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it('passes the proper payload to the callback', () => {
    const callback = jest.fn();
    const payload = { test: 'payload' };

    observer.subscribe(event, callback);
    observer.publish(event, payload);

    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('calls the callback only once', () => {
    const callback = jest.fn();

    observer.subscribe(event, callback);
    observer.publish(event, {});

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('gracefully fails if a consumer tries to publish an event which does not exist', () => {
    expect(() => {
      observer.publish('non-existent-event', {});
    }).not.toThrow();
  });

  it('calls all callbacks when published', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    observer.subscribeAll(callback1);
    observer.subscribeAll(callback2);

    observer.publish(event, {});

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });
});
