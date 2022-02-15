import * as Preact from 'preact';

import { destroy, render } from 'diagramMaker/components/renderUtils';
import { asMock } from 'diagramMaker/testing/testUtils';

jest.mock('preact', () => {
  const originalPreact = jest.requireActual('preact');
  return {
    ...originalPreact,
    render: jest.fn(),
  };
});

describe('renderUtils', () => {
  const store = {} as any;
  const container = 'someContainer' as any;
  const config = 'someConfig' as any;

  beforeEach(() => {
    asMock(Preact.render).mockClear();
  });

  describe('render', () => {
    it('calls Preact.render passing container & root', () => {
      render(store, container, config);
      expect(Preact.render).toHaveBeenCalledWith(expect.anything(), container);
    });

    it('renders view', () => {
      render(store, container, config);
      expect(asMock(Preact.render).mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('destroy', () => {
    it('calls Preact.render with null passing container & root', () => {
      destroy(container);
      expect(Preact.render).toHaveBeenCalledWith(null, container);
    });
  });
});
