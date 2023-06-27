import Overdrag from "../src";
import { createInstance, getRandomValue, moveElementCursor } from "./__mocks__";

let overdrag: Overdrag;
let emitSpy: jest.SpyInstance;
let attrSpy: jest.SpyInstance;
let removeAttributeSpy: jest.SpyInstance;
let removeEventListenerSpy: jest.SpyInstance;
let addEventListenerSpy: jest.SpyInstance;
let windowAddEventListenerSpy: jest.SpyInstance;
let windowRemoveEventListenerSpy: jest.SpyInstance;

beforeEach(() => {
  // ensure snapping doesn't interfere with tests
  overdrag = createInstance();
  emitSpy = jest.spyOn(overdrag, "emit");
  attrSpy = jest.spyOn(overdrag.element, "setAttribute");
  removeAttributeSpy = jest.spyOn(overdrag.element, "removeAttribute");
  removeEventListenerSpy = jest.spyOn(overdrag.element, "removeEventListener");
  addEventListenerSpy = jest.spyOn(overdrag.element, "addEventListener");
  windowAddEventListenerSpy = jest.spyOn(window, "addEventListener");
  windowRemoveEventListenerSpy = jest.spyOn(window, "removeEventListener");
  overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
  // initiate drag
  moveElementCursor(overdrag, {
    x: overdrag.controlsThreshold + 1,
    y: overdrag.controlsThreshold + 1,
  });

  overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
});
afterEach(() => {
  // Reset mock function calls
  window.dispatchEvent(new MouseEvent("mouseup"));
  overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  Overdrag.activeInstance = null;
  jest.clearAllMocks();
});
describe("While dragging", () => {
  it(`should set "dragging" state to "true"`, () => {
    expect(overdrag.dragging).toBe(true);
  });

  it(`should set "${Overdrag.ATTRIBUTES.DRAG_MODE}" attribute`, () => {
    expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG_MODE, "");
  });

  it(`should emit "${Overdrag.EVENTS.DRAG_START}" event`, () => {
    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG_START, overdrag);
  });

  describe("with no snapping", () => {
    beforeEach(() => {
      overdrag.snapThreshold = 0;
    });
    it(`should move element by the same amount as mouse `, () => {
      const top = getRandomValue(10, 50);
      const left = getRandomValue(10, 50);
      moveElementCursor(
        overdrag,
        {
          x: left,
          y: top,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(top);
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it(`should emit "${Overdrag.EVENTS.DRAG}" event`, () => {
      moveElementCursor(
        overdrag,
        {
          x: getRandomValue(10, 50),
          y: getRandomValue(10, 50),
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
    });

    it(`should not emit "${Overdrag.EVENTS.DRAG}" event if mouse position didn't change`, () => {
      moveElementCursor(
        overdrag,
        {
          x: parseInt(overdrag.element.style.left),
          y: parseInt(overdrag.element.style.top),
        },
        true
      );
      expect(emitSpy).not.toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
    });

    it(`should not move element passed the parent's top edge`, () => {
      moveElementCursor(
        overdrag,
        {
          y: -10000,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(0);
    });

    it(`should not move element passed the parent's left edge`, () => {
      moveElementCursor(
        overdrag,
        {
          x: -10000,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(0);
    });

    it(`should not move element passed the parent's bottom edge`, () => {
      moveElementCursor(
        overdrag,
        {
          y: 10000,
        },
        true
      );
      const top =
        overdrag.parentPosition.actionBounds.height -
        overdrag.position.fullBounds.height;
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it(`should not move element passed the parent's right edge`, () => {
      moveElementCursor(
        overdrag,
        {
          x: 10000,
        },
        true
      );
      const left =
        overdrag.parentPosition.actionBounds.width -
        overdrag.position.fullBounds.width;
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });
  });

  describe("with snapping", () => {
    const snapThreshold = getRandomValue(10, 50);
    beforeEach(() => {
      overdrag.snapThreshold = snapThreshold;
    });
    it(`should snap element to the parent's top edge`, () => {
      moveElementCursor(
        overdrag,
        {
          y: 1000,
        },
        true
      );
      moveElementCursor(
        overdrag,
        {
          y: snapThreshold,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(0);
    });

    it(`should not snap element to the parent's top edge if one px away from snap value`, () => {
      moveElementCursor(
        overdrag,
        {
          y: 1000,
        },
        true
      );
      moveElementCursor(
        overdrag,
        {
          y: snapThreshold + 1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(snapThreshold + 1);
    });

    it(`should snap element to the parent's left edge`, () => {
      moveElementCursor(
        overdrag,
        {
          x: 1000,
        },
        true
      );

      moveElementCursor(
        overdrag,
        {
          x: snapThreshold,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(0);
    });

    it(`should not snap element to the parent's left edge if one px away from snap value`, () => {
      moveElementCursor(
        overdrag,
        {
          x: 1000,
        },
        true
      );

      moveElementCursor(
        overdrag,
        {
          x: snapThreshold + 1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(snapThreshold + 1);
    });

    it(`should snap element to the parent's right edge`, () => {
      moveElementCursor(
        overdrag,
        {
          x: 0,
        },
        true
      );
      const left =
        overdrag.parentPosition.actionBounds.width -
        overdrag.position.fullBounds.width;

      moveElementCursor(
        overdrag,
        {
          x: left - snapThreshold,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it(`should not snap element to the parent's right edge if one px away from snap value`, () => {
      moveElementCursor(
        overdrag,
        {
          x: 0,
        },
        true
      );

      const left =
        overdrag.parentPosition.actionBounds.width -
        overdrag.position.fullBounds.width;
      moveElementCursor(
        overdrag,
        {
          x: left - snapThreshold - 1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(
        left - snapThreshold - 1
      );
    });

    it(`should snap element to the parent's bottom edge`, () => {
      moveElementCursor(
        overdrag,
        {
          y: 0,
        },
        true
      );
      const top =
        overdrag.parentPosition.actionBounds.height -
        overdrag.position.fullBounds.height;

      moveElementCursor(
        overdrag,
        {
          y: top - snapThreshold,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it(`should not snap element to the parent's bottom edge if one px away from snap value`, () => {
      moveElementCursor(
        overdrag,
        {
          y: 0,
        },
        true
      );

      const top =
        overdrag.parentPosition.actionBounds.height -
        overdrag.position.fullBounds.height;
      moveElementCursor(
        overdrag,
        {
          y: top - snapThreshold - 1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(
        top - snapThreshold - 1
      );
    });
  });
});
