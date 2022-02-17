import {
  getElementByDataIdAndType,
  getPanelById,
  getPanelDragHandleById,
} from '../common/getters';
import { dragAndDropElement } from '../common/interaction';
import { convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMaker.Panels', () => {
  const viewContainer = { width: 1200, height: 900 };

  beforeEach(() => {
    cy.visit('/iframe.html?id=demos-diagram-maker--left-right-rectangular&args=&viewMode=story');
  });

  describe('panel rendering', () => {
    it('renders library panel', () => {
      const panel = getPanelById('library');
      panel.should('have.length', 1);
      panel.should('have.class', 'dm-panel');
    });

    it('renders tools panel', () => {
      const panel = getPanelById('tools');
      panel.should('have.length', 1);
      panel.should('have.class', 'dm-panel');
    });
  });

  describe('panel dragging', () => {
    it('moves panel when dragging the drag handle', () => {
      const panelDragHandle = getPanelDragHandleById('library');
      dragAndDropElement(panelDragHandle, { pageX: 0, pageY: 0 });

      const expectedTransform = convertTranslate2dToMatrix(0, 0);

      const panel = getPanelById('library');
      panel.should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('snaps panel to edge of viewport when within anchor bounds', () => {
      const panelDragHandle = getPanelDragHandleById('library');

      // Move panel to 5px away from top and left of container to test snapping
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width / 2, pageY: viewContainer.height / 2 });
      dragAndDropElement(panelDragHandle, { pageX: 130, pageY: 36 });

      const expectedTransform = convertTranslate2dToMatrix(0, 0);

      const panel = getPanelById('library');
      panel.should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('does not move panel when not dragging the drag handle', () => {
      const panel = getPanelById('library');
      dragAndDropElement(panel, { pageX: 0, pageY: 0 });

      getPanelById('library').then((el) => {
        const rect = el[0].getBoundingClientRect();

        const topLeftX = rect.left;
        const topLeftY = rect.top;

        const expectedTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);

        const movedPanel = getPanelById('library');
        movedPanel.should('have.css', 'transform').and('eq', expectedTransform);
      });
    });
  });

  describe('panel anchoring', () => {
    it('anchors panel at top left', () => {
      const panelDragHandle = getPanelDragHandleById('library');

      // Move panel to top left
      dragAndDropElement(panelDragHandle, { pageX: 0, pageY: 0 });

      // Check panel is in top left
      const topLeftX = 0;
      const topLeftY = 0;
      let expectedTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);

      // Resize window
      const newViewPort = { width: viewContainer.width + 500, height: viewContainer.height + 500 };
      cy.viewport(newViewPort.width, newViewPort.height);

      // Call update container
      getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();

      // Check panel is now in new top left
      expectedTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('anchors panel at top right', () => {
      const panelDragHandle = getPanelDragHandleById('library');

      // Move panel to middle of canvas and then to top right
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width / 2, pageY: viewContainer.height / 2 });
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width, pageY: 0 });

      getPanelById('library').then((el) => {
        const rect = el[0].getBoundingClientRect();

        // Check panel is at top right
        const topRightX = viewContainer.width - rect.width;
        const topRightY = 0;
        let expectedTransform = convertTranslate2dToMatrix(topRightX, topRightY);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);

        // Resize window
        const newViewPort = { width: viewContainer.width + 500, height: viewContainer.height + 500 };
        cy.viewport(newViewPort.width, newViewPort.height);

        // Call update container
        getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();

        // Check panel is now in new top right
        expectedTransform = convertTranslate2dToMatrix(topRightX + 500, topRightY);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
      });
    });

    it('anchors panel at bottom left', () => {
      const panelDragHandle = getPanelDragHandleById('library');

      // Move panel to middle of canvas and then to bottom left
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width / 2, pageY: viewContainer.height / 2 });
      dragAndDropElement(panelDragHandle, { pageX: 0, pageY: viewContainer.height });

      getPanelById('library').then((el) => {
        const rect = el[0].getBoundingClientRect();

        // Check panel is at bottom left
        const bottomLeftX = 0;
        const bottomLeftY = viewContainer.height - rect.height;
        let expectedTransform = convertTranslate2dToMatrix(bottomLeftX, bottomLeftY);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);

        // Resize window
        const newViewPort = { width: viewContainer.width + 500, height: viewContainer.height + 500 };
        cy.viewport(newViewPort.width, newViewPort.height);

        // Call update container
        getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();

        // Check panel is now in new bottom left
        expectedTransform = convertTranslate2dToMatrix(bottomLeftX, bottomLeftY + 500);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
      });
    });

    it('anchors panel at bottom right', () => {
      const panelDragHandle = getPanelDragHandleById('library');

      // Move panel to middle of canvas and then to bottom left
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width / 2, pageY: viewContainer.height / 2 });
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width, pageY: viewContainer.height });

      getPanelById('library').then((el) => {
        const rect = el[0].getBoundingClientRect();

        // Check panel is at bottom right
        const bottomRightX = viewContainer.width - rect.width;
        const bottomRightY = viewContainer.height - rect.height;
        let expectedTransform = convertTranslate2dToMatrix(bottomRightX, bottomRightY);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);

        // Resize window
        const newViewPort = { width: viewContainer.width + 500, height: viewContainer.height + 500 };
        cy.viewport(newViewPort.width, newViewPort.height);

        // Call update container
        getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();

        // Check panel is now in new bottom right
        expectedTransform = convertTranslate2dToMatrix(bottomRightX + 500, bottomRightY + 500);
        getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
      });
    });
  });

  describe('undocked panels', () => {
    const testUndockingFromPosition = (pageX: number, pageY: number) => {
      const panelDragHandle = getPanelDragHandleById('library');

      // Dock and then undock
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width / 2, pageY: viewContainer.height / 2 });
      dragAndDropElement(panelDragHandle, { pageX, pageY });
      dragAndDropElement(panelDragHandle, { pageX: viewContainer.width / 2, pageY: viewContainer.height / 2 });

      // Current panel position
      const expectedTransform = convertTranslate2dToMatrix(475, 300);

      // Resize window
      const newViewPort = { width: viewContainer.width + 500, height: viewContainer.height + 500 };
      cy.viewport(newViewPort.width, newViewPort.height);

      // Call update container
      getElementByDataIdAndType('UpdateContainer', 'DiagramMaker.Tools').click();

      // Check panel hasn't moved
      getPanelById('library').should('have.css', 'transform').and('eq', expectedTransform);
    };

    it('does not move when updating container after panel is undocked from top left', () => {
      testUndockingFromPosition(0, 0);
    });

    it('does not move when updating container after panel is undocked from top right', () => {
      testUndockingFromPosition(viewContainer.width, 0);
    });

    it('does not move when updating container after panel is undocked from bottom left', () => {
      testUndockingFromPosition(0, viewContainer.height);
    });

    it('does not move when updating container after panel is undocked from bottom right', () => {
      testUndockingFromPosition(viewContainer.width, viewContainer.height);
    });
  });
});
