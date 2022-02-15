import * as Preact from 'preact';
import { shallow } from 'enzyme';

import { ComposeView } from '.';
import { ComposeViewProps } from './ComposeView';

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
      />,
    );

    expect(renderCallback).toHaveBeenCalledTimes(1);
  });

  it('calls props.renderCallback after component update', () => {
    const context = shallow<ComposeView, ComposeViewProps>(
      <ComposeView
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />,
    );

    jest.clearAllMocks();

    context.setProps({
      renderCallback,
      destroyCallback,
    });
    expect(renderCallback).toHaveBeenCalledTimes(2);
  });

  it('calls props.destroyCallback() before unmounting', () => {
    const context = shallow(
      <ComposeView
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />,
    );

    context.unmount();

    expect(destroyCallback).toHaveBeenCalledTimes(1);
  });
});
