import Overdrag from "../src";
import {
  createInstance,
  getRandomValue,
  moveElementCursor,
  translateCursor,
} from "./__mocks__";

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
      const topDistance = getRandomValue(-10, 50);
      const leftDistance = getRandomValue(-10, 50);
      const top = parseInt(overdrag.element.style.top);
      const left = parseInt(overdrag.element.style.left);
      translateCursor(
        overdrag,
        {
          x: leftDistance,
          y: topDistance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(top + topDistance);
      expect(parseInt(overdrag.element.style.left)).toBe(left + leftDistance);
    });

    it(`should emit "${Overdrag.EVENTS.DRAG}" event on horizontal motion`, () => {
      translateCursor(
        overdrag,
        {
          x: getRandomValue(10, 50),
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
    });

    it(`should emit "${Overdrag.EVENTS.DRAG}" event on vertical motion`, () => {
      translateCursor(
        overdrag,
        {
          y: getRandomValue(10, 50),
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
    });

    it(`should emit "${Overdrag.EVENTS.DRAG}" event on all axis motion`, () => {
      translateCursor(
        overdrag,
        {
          y: getRandomValue(10, 50),
          x: getRandomValue(10, 50),
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
    });

    it(`should not emit "${Overdrag.EVENTS.DRAG}" event if mouse position didn't change`, () => {
      translateCursor(
        overdrag,
        {
          x: 0,
          y: 0,
        },
        true
      );
      expect(emitSpy).not.toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
    });

    it(`should not move element passed the parent's top edge`, () => {
      translateCursor(
        overdrag,
        {
          y: -10000,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(0);
    });

    it(`should not move element passed the parent's left edge`, () => {
      translateCursor(
        overdrag,
        {
          x: -10000,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(0);
    });

    it(`should not move element passed the parent's bottom edge`, () => {
      translateCursor(
        overdrag,
        {
          y: 10000,
        },
        true
      );

      expect(parseInt(overdrag.element.style.bottom)).toBe(0);
    });

    it(`should not move element passed the parent's right edge`, () => {
      translateCursor(
        overdrag,
        {
          x: 10000,
        },
        true
      );
      expect(parseInt(overdrag.element.style.right)).toBe(0);
    });
  });

  describe("with snapping", () => {
    const snapThreshold = getRandomValue(10, 50);
    beforeEach(() => {
      overdrag.snapThreshold = snapThreshold;
    });

    it(`should snap element to the parent's top edge`, () => {
      translateCursor(
        overdrag,
        {
          y: -overdrag.position.fullBounds.top + snapThreshold,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(0);
    });

    it(`should not snap element to the parent's top edge if one px away from snap value`, () => {
      translateCursor(
        overdrag,
        {
          y: -overdrag.position.fullBounds.top + snapThreshold + 1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(snapThreshold + 1);
    });

    it(`should snap element to the parent's left edge`, () => {
      translateCursor(
        overdrag,
        {
          x: -overdrag.position.fullBounds.left + snapThreshold,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(0);
    });

    it(`should not snap element to the parent's left edge if one px away from snap value`, () => {
      translateCursor(
        overdrag,
        {
          x: -overdrag.position.fullBounds.left + snapThreshold + 1,
        },
        true
      );

      expect(parseInt(overdrag.element.style.left)).toBe(snapThreshold + 1);
    });

    it(`should snap element to the parent's right edge`, () => {
      translateCursor(
        overdrag,
        {
          x:
            overdrag.parentPosition.actionBounds.right -
            overdrag.position.fullBounds.right -
            snapThreshold,
        },
        true
      );

      expect(parseInt(overdrag.element.style.right)).toBe(0);
      expect(parseInt(overdrag.element.style.left)).toBe(
        overdrag.parentPosition.actionBounds.right -
          overdrag.position.fullBounds.width
      );
    });

    it(`should not snap element to the parent's right edge if one px away from snap value`, () => {
      translateCursor(
        overdrag,
        {
          x:
            overdrag.parentPosition.actionBounds.right -
            overdrag.position.fullBounds.right -
            snapThreshold -
            1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.right)).toBe(snapThreshold + 1);
      expect(parseInt(overdrag.element.style.left)).toBe(
        overdrag.parentPosition.actionBounds.right -
          overdrag.position.fullBounds.width -
          snapThreshold -
          1
      );
    });

    it(`should snap element to the parent's bottom edge`, () => {
      translateCursor(
        overdrag,
        {
          y:
            overdrag.parentPosition.actionBounds.bottom -
            overdrag.position.fullBounds.bottom -
            snapThreshold,
        },
        true
      );

      expect(parseInt(overdrag.element.style.bottom)).toBe(0);
      expect(parseInt(overdrag.element.style.top)).toBe(
        overdrag.parentPosition.actionBounds.bottom -
          overdrag.position.fullBounds.height
      );
    });

    it(`should not snap element to the parent's bottom edge if one px away from snap value`, () => {
      translateCursor(
        overdrag,
        {
          y:
            overdrag.parentPosition.actionBounds.bottom -
            overdrag.position.fullBounds.bottom -
            snapThreshold -
            1,
        },
        true
      );
      expect(parseInt(overdrag.element.style.bottom)).toBe(snapThreshold + 1);
      expect(parseInt(overdrag.element.style.top)).toBe(
        overdrag.parentPosition.actionBounds.bottom -
          overdrag.position.fullBounds.height -
          snapThreshold -
          1
      );
    });
  });
});
