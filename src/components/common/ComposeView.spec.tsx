import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { ComposeView } from '.';

describe('ComposeView', () => {
  const destroyCallback = jest.fn();
  const renderCallback = jest.fn((container: HTMLElement): HTMLElement => {
    const element = document.createElement('div');
    element.textContent = 'Example node content';
    container.appendChild(element);
    return element;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls props.renderCallback() after component mounts', () => {

    shallow(
      <ComposeView
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(renderCallback).toHaveBeenCalledTimes(1);
  });

  it('calls props.renderCallback after component update', () => {
    const context = shallow(
      <ComposeView
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    jest.clearAllMocks();

    context.render(
      <ComposeView
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );
    expect(renderCallback).toHaveBeenCalledTimes(1);
  });

  it('calls props.destroyCallback() before unmounting', () => {

    const context = shallow(
      <ComposeView
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    // FIXME: Preact-render-spy typings do not support passing null, but the API does
    context.render(null as any);

    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });
});
