import { getBrowserRectangle } from 'diagramMaker/service/browserUtils';
import { fromContainerToPage, fromPageToScreen, isPositionInRectangle } from 'diagramMaker/service/positionUtils';
import { Position } from 'diagramMaker/state/types';

export interface NormalizedTarget {
  originalTarget: HTMLElement;
  id?: string;
  type?: string;
}

const TRUE = 'true';

export default class UITargetNormalizer {
  public static normalizeTarget(target: HTMLElement): NormalizedTarget {
    return {
      originalTarget: target,
      id: target && target.getAttribute('data-id') || undefined,
      type: target && target.getAttribute('data-type') || undefined
    };
  }

  public static checkAttributeValue(target: Element, attribute: string, expectedValue: string = TRUE): boolean {
    const value = target.getAttribute(attribute);

    if (!value) {
      return false;
    }

    return value === expectedValue;
  }

  public static isMouseEventInsideBrowser(event: MouseEvent): boolean {
    const clientPosition: Position = {
      x: event.clientX,
      y: event.clientY
    };

    return isPositionInRectangle(clientPosition, getBrowserRectangle());
  }

  public static normalizeMouseEventTarget(event: MouseEvent): MouseEvent {

    // Firefox returns the `document` object as the target for
    // mouse events fired outside of the window.  Chrome and Safari
    // instead return the root HTML tag.
    //
    // An example of an event being fired outside of the window:
    // If a drag event starts on DiagramMaker but the mouse is
    // then moved outside of the browser window.
    //
    // In order to make Firefox match Chrome and Safari, we'll change
    // the target to the root <html> tag if the target is the document
    // and the position of the mouse is outside of the bounds of the browser.
    //
    //    _____________________________
    //    |   Browser   |   Target    |
    //    -----------------------------
    //    |  Chrome     | root <html> |
    //    |  Safari     | root <html> |
    //    |  Firefox    | document    | <-- wth Firefox?
    //    -----------------------------

    const { target } = event;

    if (!target) {
      return event;
    }

    if (UITargetNormalizer.isMouseEventInsideBrowser(event)) {
      return event;
    }

    if (target !== document) {
      return event;
    }

    return {
      ...event,
      target: document.documentElement
    };
  }

  public static getTarget(
    event: MouseEvent,
    requiredAttribute?: string,
    requiredAttributeValue?: string
  ): HTMLElement | undefined {
    const { target } = UITargetNormalizer.normalizeMouseEventTarget(event);

    if (!target) {
      return;
    }

    let currentTarget = target as HTMLElement;

    // @FIXME this is a hacky way to make sure that events outside of the browser don't require a target.
    if (currentTarget === document.documentElement) {
      return currentTarget;
    }

    if (!requiredAttribute) {
      return currentTarget;
    }

    while (!UITargetNormalizer.checkAttributeValue(currentTarget, requiredAttribute, requiredAttributeValue) &&
      currentTarget.parentElement) {
      currentTarget = currentTarget.parentElement;
    }

    return UITargetNormalizer
      .checkAttributeValue(currentTarget, requiredAttribute, requiredAttributeValue) && currentTarget || undefined;
  }

  // IE11 Fallback (msElementsFromPoint)
  public static getElementsFromPoint(position: Position): Element[] {
    const { x, y } = position;

    if (document.elementsFromPoint) {
      return document.elementsFromPoint(x, y);
    }

    // IE 11 specific method not part of typescript definitions for DOM API
    const nodeList = (document as any).msElementsFromPoint(x, y);

    return UITargetNormalizer.nodeListToElementArray(nodeList);
  }

  public static getDropZoneTarget(containerPosition: Position, contextOffset: Position): HTMLElement | undefined {
    // Make the coordinates relative to the screen instead of relative to the document or relative to the container
    const pagePosition = fromContainerToPage(containerPosition, contextOffset);
    const screenPosition = fromPageToScreen(pagePosition);
    const targets = UITargetNormalizer.getElementsFromPoint(screenPosition);
    let dropTarget: HTMLElement | undefined;

    for (const target of targets) {
      if (UITargetNormalizer.checkAttributeValue(target, 'data-dropzone')) {
        dropTarget = target as HTMLElement;
        break;
      }
    }

    if (!dropTarget) {
      return;
    }

    return dropTarget;
  }

  private static nodeListToElementArray(nodeList: NodeListOf<Element>): Element[] {
    const elementArray: Element[] = [];

    const length = nodeList.length;
    for (let i = 0; i < length; i += 1) {
      elementArray.push(nodeList[i]);
    }

    return elementArray;
  }
}
