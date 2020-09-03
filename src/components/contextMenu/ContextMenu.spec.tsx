import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { ContextMenu } from '.';

describe('ContextMenu', () => {

  const destroyCallback = jest.fn();
  const renderCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders at the given position and size', () => {
    const contextMenu = shallow(
      <ContextMenu
        position={{ x: 400, y: 600 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(contextMenu).toMatchSnapshot();
  });
});
