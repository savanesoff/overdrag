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
  });

  describe("Top control", () => {
    let distance: number;
    beforeEach(() => {
      // ensure to move in either direction
      distance = getRandomValue(-overdrag.position.fullBounds.top, 50);
      // initiate resize, at this point any control point will do
      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold + 1, // to avoid triggering other sensors
        y: getRandomValue(0, overdrag.controlsThreshold), // target top only
      });

      overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    });

    it(`should activate sensor`, () => {
      expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS, "top");
    });

    it(`should emit "${Overdrag.EVENTS.RESIZE}" event`, () => {
      moveElementCursor(
        overdrag,
        {
          y: distance,
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const height = parseInt(overdrag.element.style.height);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(height - distance);
    });

    it(`should move top position`, () => {
      const top = parseInt(overdrag.element.style.top);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(top + distance);
    });

    it(`should not resize element to less than minimum height`, () => {
      distance = 100000;
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(
        overdrag.minContentHeight
      );
    });

    it(`should not resize element to more than maximum height as constrained by parent`, () => {
      distance = -100000;
      const maxHeight =
        overdrag.position.fullBounds.bottom - overdrag.position.verticalDiff;
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it(`should not resize element to more than defined "maxContentHeight"`, () => {
      distance = -100000;
      overdrag.minContentHeight = getRandomValue(10, 20);
      overdrag.maxContentHeight = getRandomValue(30, 40);
      const maxHeight = overdrag.maxContentHeight;
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it("should not move right position", () => {
      const right = parseInt(overdrag.element.style.right);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move left position", () => {
      const left = parseInt(overdrag.element.style.left);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it("should not move bottom position", () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom);
    });
  });

  describe("Bottom control", () => {
    let distance: number;
    beforeEach(() => {
      // ensure to move in either direction
      distance = getRandomValue(
        -50,
        overdrag.parentPosition.actionBounds.bottom -
          overdrag.position.fullBounds.bottom
      );
      // initiate resize, at this point any control point will do
      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold + 1, // to avoid triggering other sensors
        y:
          overdrag.position.visualBounds.height -
          getRandomValue(0, overdrag.controlsThreshold), // target top only
      });

      overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    });

    it(`should activate sensor`, () => {
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "bottom"
      );
    });

    it(`should emit "${Overdrag.EVENTS.RESIZE}" event`, () => {
      moveElementCursor(
        overdrag,
        {
          y: distance,
        },
        true
      );
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const height = parseInt(overdrag.element.style.height);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(height + distance);
    });

    it(`should move bottom position`, () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom + distance);
    });

    it(`should not resize element to less than minimum height`, () => {
      distance = -100000;
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(
        overdrag.minContentHeight
      );
    });

    it(`should not resize element to more than maximum height as constrained by parent`, () => {
      distance = 100000;
      const maxHeight =
        overdrag.parentPosition.actionBounds.bottom -
        overdrag.position.fullBounds.top -
        overdrag.position.verticalDiff;
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it(`should not resize element to more than defined "maxContentHeight"`, () => {
      distance = 100000;
      overdrag.minContentHeight = getRandomValue(10, 20);
      overdrag.maxContentHeight = getRandomValue(30, 40);
      const maxHeight = overdrag.maxContentHeight;
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it("should not move right position", () => {
      const right = parseInt(overdrag.element.style.right);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move left position", () => {
      const left = parseInt(overdrag.element.style.left);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it("should not move top position", () => {
      const top = parseInt(overdrag.element.style.top);
      moveElementCursor(
        overdrag,
        {
          y: overdrag.position.fullBounds.top + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });
  });

  describe("Right control", () => {
    let distance: number;
    beforeEach(() => {
      // ensure to move in either direction
      distance = getRandomValue(
        -50,
        overdrag.parentPosition.actionBounds.right -
          overdrag.position.fullBounds.right
      );
      // initiate resize, at this point any control point will do
      moveElementCursor(overdrag, {
        x:
          overdrag.position.visualBounds.width -
          getRandomValue(0, overdrag.controlsThreshold), // target top only
        y: overdrag.controlsThreshold + 1, // to avoid triggering other sensors
      });

      overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    });

    it(`should activate sensor`, () => {
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "right"
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
      expect(parseInt(overdrag.element.style.width)).toBe(width + distance);
    });

    it(`should move right position`, () => {
      const right = parseInt(overdrag.element.style.right);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.right)).toBe(right + distance);
    });

    it(`should not resize element to less than minimum width`, () => {
      distance = -100000;
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
      distance = 100000;
      const maxWidth =
        overdrag.parentPosition.actionBounds.right -
        overdrag.position.fullBounds.left -
        overdrag.position.horizontalDiff;
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
      distance = 100000;
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

    it("should not move left position", () => {
      const left = parseInt(overdrag.element.style.left);
      moveElementCursor(
        overdrag,
        {
          x: overdrag.position.fullBounds.left + distance,
        },
        true
      );
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });
  });
});
