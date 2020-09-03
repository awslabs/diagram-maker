import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { EdgeBadge } from '.';

describe('EdgeBadge', () => {

  const destroyCallback = jest.fn();
  const renderCallback = jest.fn((container: HTMLElement): HTMLElement => {
    const element = document.createElement('div');
    element.textContent = 'Example edge content';
    container.appendChild(element);
    return element;
  });

  it('renders badge if passed', () => {
    const testId = 'testBadge';
    const edge = shallow(
      <EdgeBadge
        id={testId}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
        src={{ x:0, y:100 }}
        dest={{ x:100, y:0 }}
      />
    );

    expect(edge).toMatchSnapshot();
  });

  it('renders badge when isPartOfEdgePair is true', () => {
    const testId = 'overlappingBadge';
    const edge = shallow(
      <EdgeBadge
        id={testId}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
        src={{ x:0, y:100 }}
        dest={{ x:100, y:0 }}
        isPartOfEdgePair={true}
      />
    );

    expect(edge).toMatchSnapshot();
  });
});
