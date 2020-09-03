const originalPreact = jest.requireActual('preact');
const mockPreact = {
  ...originalPreact,
  render: jest.fn()
};

jest.mock('preact', () => mockPreact);

import * as Preact from 'preact';

import { destroy, render } from 'diagramMaker/components/renderUtils';

describe('renderUtils', () => {
  const store = {} as any;
  const container = 'someContainer' as any;
  const config = 'someConfig' as any;
  const root = 'someDom' as any;

  beforeEach(() => {
    mockPreact.render.mockClear();
  });

  describe('render', () => {
    it('calls Preact.render passing container & root', () => {
      render(store, container, config, root);
      expect(Preact.render).toHaveBeenCalledWith(expect.anything(), container, root);
    });

    it('renders view', () => {
      render(store, container, config, root);
      expect(mockPreact.render.mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('destroy', () => {
    it('calls Preact.render with null passing container & root', () => {
      destroy(container, root);
      expect(Preact.render).toHaveBeenCalledWith(null, container, root);
    });
  });
});
