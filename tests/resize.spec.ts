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
    beforeEach(() => {
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

    it(`should emit "${Overdrag.EVENTS.RESIZE}" event while moving`, () => {
      const left = getRandomValue(10, 50);
      moveElementCursor(
        overdrag,
        {
          x: left,
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const distance = getRandomValue(10, 50);
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
