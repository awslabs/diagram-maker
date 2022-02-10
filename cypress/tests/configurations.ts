import {
  getAllEdges, getAllNodes, getContextMenu, getDiagramMakerView, getEdgeById, getElementByType,
  getNodeById, getPanelById, getPotentialNodeById, getWorkspace,
} from '../common/getters';
import {
  clickElement, createEdgeBetween, dragAndDropElement, dragStartElement, rightClickElement, triggerKeyboardEvent,
} from '../common/interaction';
import { convertScaleToMatrix, convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMaker.Configurations', () => {
  describe('nodeTypeConfiguration', () => {
    beforeEach(() => {
      cy.visit('/LeftRightRectangular.html');
    });

    describe('size', () => {
      it('picks size from the config', () => {
        const initialNodeIds: string[] = [];
        getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));
        const element = getPotentialNodeById('testId-normal');
        dragAndDropElement(element, { pageX: 200, pageY: 200 });
        getAllNodes().each(($el) => {
          const dataId = $el.data('id');
          if (initialNodeIds.indexOf(dataId) === -1) {
            getNodeById(dataId).should('have.css', 'width').and('eq', '150px');
            getNodeById(dataId).should('have.css', 'height').and('eq', '50px');
          }
        });
      });

      it('picks size from data attrs if present', () => {
        const initialNodeIds: string[] = [];
        getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));
        const element = getPotentialNodeById('testId-normalWithSize');
        dragAndDropElement(element, { pageX: 200, pageY: 200 });
        getAllNodes().each(($el) => {
          const dataId = $el.data('id');
          if (initialNodeIds.indexOf(dataId) === -1) {
            getNodeById(dataId).should('have.css', 'width').and('eq', '100px');
            getNodeById(dataId).should('have.css', 'height').and('eq', '50px');
          }
        });
      });
    });

    describe('visibleConnectorTypes', () => {
      describe('normal node', () => {
        const initialNodeIds: string[] = [];
        beforeEach(() => {
          getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

          const element = getPotentialNodeById('testId-normal');
          dragAndDropElement(element, { pageX: 200, pageY: 200 });
        });

        it('renders a input connector on left side', () => {
          const expectedTransform = convertTranslate2dToMatrix(0, 25);
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              const inputConnector = getNodeById(dataId).children('.dm-connector-input');
              inputConnector.should('have.css', 'transform').and('eq', expectedTransform);
            }
          });
        });

        it('renders output connector on right side', () => {
          const expectedTransform = convertTranslate2dToMatrix(150, 25);
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              const outputConnector = getNodeById(dataId).children('.dm-connector-output');
              outputConnector.should('have.css', 'transform').and('eq', expectedTransform);
            }
          });
        });
      });

      describe('end node', () => {
        const initialNodeIds: string[] = [];
        beforeEach(() => {
          getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

          const element = getPotentialNodeById('testId-end');
          dragAndDropElement(element, { pageX: 200, pageY: 200 });
        });

        it('renders a input connector on left side', () => {
          const expectedTransform = convertTranslate2dToMatrix(0, 25);
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              const inputConnector = getNodeById(dataId).children('.dm-connector-input');
              inputConnector.should('have.css', 'transform').and('eq', expectedTransform);
            }
          });
        });

        it('does not render an output connector', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              getNodeById(dataId).children('.dm-connector-output').should('not.exist');
            }
          });
        });
      });

      describe('start node', () => {
        const initialNodeIds: string[] = [];
        beforeEach(() => {
          getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

          // Grab an starting node and add it to the DOM
          const element = getPotentialNodeById('testId-start');
          dragAndDropElement(element, { pageX: 250, pageY: 250 });
        });

        it('renders output connector on right side', () => {
          const expectedTransform = convertTranslate2dToMatrix(150, 25);
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              const outputConnector = getNodeById(dataId).children('.dm-connector-output');
              outputConnector.should('have.css', 'transform').and('eq', expectedTransform);
            }
          });
        });

        it('does not render an input connector', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              getNodeById(dataId).children('.dm-connector-input').should('not.exist');
            }
          });
        });
      });

      describe('dead node', () => {
        const initialNodeIds: string[] = [];
        beforeEach(() => {
          getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

          const element = getPotentialNodeById('testId-dead');
          dragAndDropElement(element, { pageX: 200, pageY: 200 });
        });

        it('does not render an input connector', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              getNodeById(dataId).children('.dm-connector-input').should('not.exist');
            }
          });
        });

        it('does not render an output connector', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              getNodeById(dataId).children('.dm-connector-output').should('not.exist');
            }
          });
        });
      });
    });

    describe('connectorPlacementOverride', () => {
      describe('top bottom', () => {
        const initialNodeIds: string[] = [];
        beforeEach(() => {
          getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

          const element = getPotentialNodeById('testId-topBottom');
          dragAndDropElement(element, { pageX: 200, pageY: 50 });
        });

        it('renders connectors on top & bottom', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              const expectedInputTransform = convertTranslate2dToMatrix(75, 0);
              const expectedOutputTransform = convertTranslate2dToMatrix(75, 50);
              const outputConnector = getNodeById(dataId).children('.dm-connector-output');
              outputConnector.should('have.css', 'transform').and('eq', expectedOutputTransform);
              const inputConnector = getNodeById(dataId).children('.dm-connector-input');
              inputConnector.should('have.css', 'transform').and('eq', expectedInputTransform);
            }
          });
        });

        it('renders straight edge between left right & top bottom nodes', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              createEdgeBetween(dataId, 'node1');
              getAllEdges().should('have.length', 2);
            }
          });
        });
      });

      describe('centered', () => {
        const initialNodeIds: string[] = [];
        beforeEach(() => {
          getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

          const element = getPotentialNodeById('testId-centered');
          dragAndDropElement(element, { pageX: 200, pageY: 200 });
        });

        it('renders no connectors', () => {
          getAllNodes().each(($el) => {
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              getNodeById(dataId).children('.dm-connector-output').should('not.exist');
              getNodeById(dataId).children('.dm-connector-input').should('not.exist');
            }
          });
        });
      });
    });
  });

  describe('context menu', () => {
    beforeEach(() => {
      cy.visit('/LeftRightRectangular.html');
    });

    describe('workspace', () => {
      it('renders the context menu on right click', () => {
        rightClickElement(getWorkspace(), 'topLeft');
        getContextMenu().should('have.length', 1);
      });

      it('doesn\'t disappear on left/right click within menu', () => {
        rightClickElement(getWorkspace(), 'topLeft');
        getContextMenu().should('have.length', 1);
        clickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
        rightClickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
      });

      it('disappears on left click outside menu', () => {
        rightClickElement(getWorkspace(), 'topLeft');
        getContextMenu().should('have.length', 1);
        clickElement(getWorkspace());
        getContextMenu().should('have.length', 0);
      });

      it('disappears & reappears on right click outside menu', () => {
        const workspace = { width: 3200, height: 1600 };
        const oldTransform = convertTranslate2dToMatrix(0, 0);
        const newTransform = convertTranslate2dToMatrix(workspace.width / 2, workspace.height / 2);
        rightClickElement(getWorkspace(), 'topLeft');
        getContextMenu().should('have.length', 1);
        getContextMenu().should('have.css', 'transform').and('eq', oldTransform);
        rightClickElement(getWorkspace());
        getContextMenu().should('have.length', 1);
        getContextMenu().should('have.css', 'transform').and('eq', newTransform);
      });

      it('doesnt allow zoom when the context menu is open', () => {
        rightClickElement(getWorkspace(), 'topLeft');
        getContextMenu().should('have.length', 1);
        const expectedTransform = convertScaleToMatrix(1);
        getWorkspace()
          .trigger('wheel', {
            deltaY: -50, pageX: 0, pageY: 0, force: true,
          });
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });
    });

    describe('node', () => {
      it('renders the context menu on right click', () => {
        rightClickElement(getNodeById('node1'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'node1');
      });

      it('doesn\'t disappear on left/right click within menu', () => {
        rightClickElement(getNodeById('node1'));
        getContextMenu().should('have.length', 1);
        clickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
        rightClickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
      });

      it('disappears on left click outside menu', () => {
        rightClickElement(getNodeById('node1'));
        getContextMenu().should('have.length', 1);
        clickElement(getWorkspace());
        getContextMenu().should('have.length', 0);
      });

      it('disappears & reappears on right click outside menu', () => {
        rightClickElement(getNodeById('node1'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'node1');
        rightClickElement(getNodeById('node2'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'node2');
      });

      it('doesnt allow zoom when the context menu is open', () => {
        rightClickElement(getNodeById('node1'));
        getContextMenu().should('have.length', 1);
        const expectedTransform = convertScaleToMatrix(1);
        getWorkspace()
          .trigger('wheel', {
            deltaY: -50, pageX: 0, pageY: 0, force: true,
          });
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });
    });

    describe('edge', () => {
      it('renders the context menu on right click', () => {
        rightClickElement(getEdgeById('edge1'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'edge1');
      });

      it('doesn\'t disappear on left/right click within menu', () => {
        rightClickElement(getEdgeById('edge1'));
        getContextMenu().should('have.length', 1);
        clickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
        rightClickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
      });

      it('disappears on left click outside menu', () => {
        rightClickElement(getEdgeById('edge1'));
        getContextMenu().should('have.length', 1);
        clickElement(getWorkspace());
        getContextMenu().should('have.length', 0);
      });

      it('disappears & reappears on right click outside menu', () => {
        rightClickElement(getEdgeById('edge1'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'edge1');
        rightClickElement(getNodeById('node1'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'node1');
      });

      it('doesnt allow zoom when the context menu is open', () => {
        rightClickElement(getEdgeById('edge1'));
        getContextMenu().should('have.length', 1);
        const expectedTransform = convertScaleToMatrix(1);
        getWorkspace()
          .trigger('wheel', {
            deltaY: -50, pageX: 0, pageY: 0, force: true,
          });
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });
    });

    describe('panel', () => {
      it('renders the context menu on right click', () => {
        rightClickElement(getPanelById('library'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'library');
      });

      it('doesn\'t disappear on left/right click within menu', () => {
        rightClickElement(getPanelById('library'));
        getContextMenu().should('have.length', 1);
        clickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
        rightClickElement(getContextMenu());
        getContextMenu().should('have.length', 1);
      });

      it('disappears on left click outside menu', () => {
        rightClickElement(getPanelById('library'));
        getContextMenu().should('have.length', 1);
        clickElement(getWorkspace());
        getContextMenu().should('have.length', 0);
      });

      it('disappears & reappears on right click outside menu', () => {
        rightClickElement(getPanelById('library'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'library');
        rightClickElement(getPanelById('tools'));
        getContextMenu().should('have.length', 1);
        getContextMenu().children().should('contain', 'tools');
      });

      it('doesnt allow zoom when the context menu is open', () => {
        rightClickElement(getPanelById('library'));
        getContextMenu().should('have.length', 1);
        const expectedTransform = convertScaleToMatrix(1);
        getWorkspace()
          .trigger('wheel', {
            deltaY: -50, pageX: 0, pageY: 0, force: true,
          });
        getWorkspace().should('have.css', 'transform').and('eq', expectedTransform);
      });
    });
  });

  describe('action interceptor', () => {
    beforeEach(() => {
      cy.visit('/ActionInterceptor.html');
    });

    describe('logging an action', () => {
      it('logs workspace deselect action', () => {
        clickElement(getWorkspace());
        getElementByType('DiagramMaker.ActionType').should('have.length', 1);
      });

      it('logs node move action', () => {
        const node = getNodeById('node1');
        dragStartElement(node, { pageX: 500, pageY: 500 });
        getElementByType('DiagramMaker.ActionType').should('have.length', 1);
        getElementByType('DiagramMaker.ActionPayload').should('have.length', 1);
      });
    });

    describe('cancelling an action', () => {
      it('cancels delete node action', () => {
        const node = getNodeById('node1');
        clickElement(node);
        triggerKeyboardEvent(getDiagramMakerView(), 'Delete');
        getNodeById('node1').should('exist');
      });
    });

    describe('modifies an action', () => {
      it('adds red color to nodes created when its an odd node', () => {
        const initialNodeIds: string[] = [];
        getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

        const element = getPotentialNodeById('testId-normal');
        dragAndDropElement(element, { pageX: 200, pageY: 200 });

        getAllNodes().each(($el) => {
          const dataId = $el.data('id');
          if (initialNodeIds.indexOf(dataId) === -1) {
            getNodeById(dataId).children('.dm-content').children().should('have.class', 'odd');
          }
        });
      });

      it('adds blue color to nodes created when its an even node', () => {
        let element = getPotentialNodeById('testId-normal');
        dragAndDropElement(element, { pageX: 200, pageY: 200 });

        const initialNodeIds: string[] = [];
        getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

        element = getPotentialNodeById('testId-normal');
        dragAndDropElement(element, { pageX: 300, pageY: 300 });

        getAllNodes().each(($el) => {
          const dataId = $el.data('id');
          if (initialNodeIds.indexOf(dataId) === -1) {
            getNodeById(dataId).children('.dm-content').children().should('have.class', 'even');
          }
        });
      });
    });

    describe('fires additional action asynchronously', () => {
      it('fires create edge action for the opposite edge 1s after the original edge is created', () => {
        const initialNodeIds: string[] = [];
        getAllNodes().each(($el) => initialNodeIds.push($el.data('id')));

        let element = getPotentialNodeById('testId-normal');
        dragAndDropElement(element, { pageX: 200, pageY: 200 });

        element = getPotentialNodeById('testId-normal');
        dragAndDropElement(element, { pageX: 300, pageY: 300 });

        getAllNodes().should('have.length', 4);

        const newNodeIds: string[] = [];
        getAllNodes().then(($els: JQuery<any>) => {
          $els.each((index, el) => {
            const $el = Cypress.$(el);
            const dataId = $el.data('id');
            if (initialNodeIds.indexOf(dataId) === -1) {
              newNodeIds.push(dataId);
            }
          });

          getAllEdges().should('have.length', 1);

          const inputNode = getNodeById(newNodeIds[0]);

          inputNode.children('.dm-connector-input').then((el) => {
            const rect = el[0].getBoundingClientRect();

            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const outputNode = getNodeById(newNodeIds[1]);
            const outputConnector = outputNode.children('.dm-connector-output');

            dragAndDropElement(outputConnector, { pageX: x, pageY: y });

            getAllEdges().should('have.length', 2);

            // A new edge is asynchronously added
            getAllEdges().should('have.length', 3);
          });
        });
      });
    });
  });
});
