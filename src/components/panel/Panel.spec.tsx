import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { Panel } from 'diagramMaker/components/panel';
import { PositionAnchorType } from 'diagramMaker/state/types';

describe('Panel', () => {
  const destroyCallback = jest.fn();
  const renderCallback = jest.fn((container: HTMLElement): HTMLElement => {
    const element = document.createElement('div');
    element.textContent = 'Example panel content';
    container.appendChild(element);
    return element;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders at the given position and size', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        position={{ x: 400, y: 600 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at top left with correct size', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.TOP_LEFT}
        position={{ x: 0, y: 0 }}
        size={{ width: 300, height: 600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at bottom left with correct size', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.BOTTOM_LEFT}
        position={{ x: 0, y: 0 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at top right with correct size', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.TOP_RIGHT}
        position={{ x: 0, y: 0 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at bottom right with correct size', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.BOTTOM_RIGHT}
        position={{ x: 0, y: 0 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at top left with correct size and relative position', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.TOP_LEFT}
        position={{ x: 100, y: 100 }}
        size={{ width: 300, height: 600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at bottom left with correct size and relative position', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.BOTTOM_LEFT}
        position={{ x: 100, y: 100 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at top right with correct size and relative position', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.TOP_RIGHT}
        position={{ x: 100, y: 100 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });

  it('renders panel docked at bottom right with correct size and relative position', () => {
    const panel = shallow(
      <Panel
        id="myPanel"
        positionAnchor={PositionAnchorType.BOTTOM_RIGHT}
        position={{ x: 100, y: 100 }}
        size={{ width:300, height:600 }}
        viewContainerSize={{ width: 1200, height: 800 }}
        renderCallback={renderCallback}
        destroyCallback={destroyCallback}
      />
    );

    expect(panel).toMatchSnapshot();
  });
});
