import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { PotentialNode } from 'diagramMaker/components/node';

describe('PotentialNode', () => {
  const destroyCallback = jest.fn();
  const renderCallback = jest.fn((container: HTMLElement): HTMLElement => {
    const element = document.createElement('div');
    element.textContent = 'Example node content';
    container.appendChild(element);
    return element;
  });

  const typeId = 'mockPotentialNodeId';
  const position = {
    x: 400,
    y: 600,
  };

  const size = {
    height: 300,
    width: 200,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders at the given position and size', () => {
    const node = shallow(
      <PotentialNode
        typeId={typeId}
        position={position}
        size={size}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />,
    );

    expect(toJson(node)).toMatchSnapshot();
  });
});
