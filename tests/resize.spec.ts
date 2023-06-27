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
});

afterEach(() => {
  // Reset mock function calls
  window.dispatchEvent(new MouseEvent("mouseup"));
  overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  Overdrag.activeInstance = null;
  jest.clearAllMocks();
});

describe("When resizing starts", () => {
  beforeEach(() => {
    // initiate resize, at this point any control point will do
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold,
      y: overdrag.controlsThreshold,
    });

    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
  });

  it(`should set "resizing" state to "true"`, () => {
    expect(overdrag.resizing).toBe(true);
  });

  it(`should set "${Overdrag.ATTRIBUTES.RESIZE_MODE}" attribute`, () => {
    expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.RESIZE_MODE, "");
  });

  it(`should emit "${Overdrag.EVENTS.RESIZE_START}" event`, () => {
    expect(emitSpy).toHaveBeenCalledWith(
      Overdrag.EVENTS.RESIZE_START,
      overdrag
    );
  });
});

describe("When resizing ends", () => {
  beforeEach(() => {
    // initiate resize, at this point any control point will do
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold,
      y: overdrag.controlsThreshold,
    });

    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    globalThis.dispatchEvent(new MouseEvent("mouseup"));
  });

  it(`should set "resizing" state to "false"`, () => {
    expect(overdrag.resizing).toBe(false);
  });

  it(`should remove "${Overdrag.ATTRIBUTES.RESIZE_MODE}" attribute`, () => {
    expect(removeAttributeSpy).toHaveBeenCalledWith(
      Overdrag.ATTRIBUTES.RESIZE_MODE
    );
  });

  it(`should emit "${Overdrag.EVENTS.RESIZE_END}" event`, () => {
    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE_END, overdrag);
  });
});

describe("While resizing without snapping", () => {
  beforeEach(() => {
    overdrag.snapThreshold = 0;
  });

  describe("Left control", () => {
    let distance: number;
    beforeEach(() => {
      // ensure to move in either direction
      distance = getRandomValue(-overdrag.position.fullBounds.left, 50);
      // initiate resize, at this point any control point will do
      moveElementCursor(overdrag, {
        x: getRandomValue(0, overdrag.controlsThreshold), // target left only
        y: overdrag.controlsThreshold + 1, // to avoid triggering other sensors
      });

      overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    });

    it(`should activate sensor`, () => {
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left"
      );
    });

    it(`should emit "${Overdrag.EVENTS.RESIZE}" event`, () => {
      moveElementCursor(
        overdrag,
        {
          x: distance,
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const width = parseInt(overdrag.element.style.width);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.width)).toBe(width - distance);
    });

    it(`should move left position`, () => {
      const left = parseInt(overdrag.element.style.left);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(left + distance);
    });

    it(`should not resize element to less than minimum width`, () => {
      distance = 100000;
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.width)).toBe(
        overdrag.minContentWidth
      );
    });

    it(`should not resize element to more than maximum width as constrained by parent`, () => {
      distance = -100000;
      const maxWidth =
        overdrag.position.fullBounds.right - overdrag.position.horizontalDiff;
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.width)).toBe(maxWidth);
    });

    it(`should not resize element to more than defined "maxContentWidth"`, () => {
      distance = -100000;
      overdrag.minContentWidth = getRandomValue(10, 20);
      overdrag.maxContentWidth = getRandomValue(30, 40);
      const maxWidth = overdrag.maxContentWidth;
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.width)).toBe(maxWidth);
    });

    it("should not move right position", () => {
      const right = parseInt(overdrag.element.style.right);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move top position", () => {
      const top = parseInt(overdrag.element.style.top);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it("should not move bottom position", () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom);
    });

    it(`should remove "${Overdrag.ATTRIBUTES.RESIZE}" attribute if no resize detected`, () => {
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left,
          y: overdrag.position.fullBounds.top,
        },
        true
      );
      expect(removeAttributeSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.RESIZE
      );
    });
  });
});
