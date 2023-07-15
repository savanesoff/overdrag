import Overdrag from "../src";
import {
  createInstance,
  getRandomValue,
  moveElementCursor,
  translateCursor,
} from "./setup";

let overdrag: Overdrag;
// @ts-ignore
let emitSpy: vi.spyOn;
// @ts-ignore
let attrSpy: vi.spyOn;
// @ts-ignore
let removeAttributeSpy: vi.spyOn; 

beforeEach(() => {
  // ensure snapping doesn't interfere with tests
  overdrag = createInstance({ snapThreshold: 0 });
  emitSpy = vi.spyOn(overdrag, "emit");
  attrSpy = vi.spyOn(overdrag.element, "setAttribute");
  removeAttributeSpy = vi.spyOn(overdrag.element, "removeAttribute");
  
  overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
});

afterEach(() => {
  // Reset mock function calls
  window.dispatchEvent(new MouseEvent("mouseup"));
  overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  Overdrag.activeInstance = null;
  vi.clearAllMocks();
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

describe("While resizing", () => {
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
      translateCursor(overdrag, {
        x: distance,
      });
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const width = parseInt(overdrag.element.style.width);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(width - distance);
    });

    it(`should move left position`, () => {
      const left = parseInt(overdrag.element.style.left);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.left)).toBe(left + distance);
    });

    it(`should not resize element to less than "minContentWith"`, () => {
      translateCursor(overdrag, {
        x: 100000,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(
        overdrag.minContentWidth
      );
    });

    it(`should not resize element to more than maximum width as constrained by parent`, () => {
      const maxWidth =
        overdrag.position.fullBounds.right - overdrag.position.horizontalDiff;
      translateCursor(overdrag, {
        x: -100000,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(maxWidth);
    });

    it(`should not resize element to more than defined "maxContentWidth"`, () => {
      overdrag.minContentWidth = getRandomValue(10, 20);
      overdrag.maxContentWidth = getRandomValue(30, 40);
      const maxWidth = overdrag.maxContentWidth;
      translateCursor(overdrag, {
        x: -100000,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(maxWidth);
    });

    it("should not move position if no motion detected", () => {
      const left = parseInt(overdrag.element.style.left);
      translateCursor(overdrag, {
        x: 0,
      });
      expect(left).not.toBeNaN();
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it("should not move right position", () => {
      const right = parseInt(overdrag.element.style.right);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move top position", () => {
      const top = parseInt(overdrag.element.style.top);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it("should not move bottom position", () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom);
    });

    it(`should snap if within "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      const distance =
        -overdrag.position.fullBounds.left + overdrag.snapThreshold;
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.left)).toBe(0);
    });

    it(`should not snap if over the "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      const offset = overdrag.snapThreshold + 1;
      const distance = -overdrag.position.fullBounds.left + offset;
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.left)).toBe(offset);
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
      translateCursor(overdrag, {
        y: distance,
      });
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const height = parseInt(overdrag.element.style.height);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(height - distance);
    });

    it(`should move top position`, () => {
      const top = parseInt(overdrag.element.style.top);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(parseInt(overdrag.element.style.top)).toBe(top + distance);
    });

    it("should not move position if no motion detected", () => {
      const top = parseInt(overdrag.element.style.top);
      translateCursor(overdrag, {
        y: 0,
      });
      expect(top).not.toBeNaN();
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it(`should not resize element to less than "minContentHeight"`, () => {
      translateCursor(overdrag, {
        y: 100000,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(
        overdrag.minContentHeight
      );
    });

    it(`should not resize element to more than maximum height as constrained by parent`, () => {
      const maxHeight =
        overdrag.position.fullBounds.bottom - overdrag.position.verticalDiff;
      translateCursor(overdrag, {
        y: -100000,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it(`should not resize element to more than defined "maxContentHeight"`, () => {
      overdrag.minContentHeight = getRandomValue(10, 20);
      overdrag.maxContentHeight = getRandomValue(30, 40);
      const maxHeight = overdrag.maxContentHeight;
      translateCursor(overdrag, {
        y: -100000,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it("should not move right position", () => {
      const right = parseInt(overdrag.element.style.right);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(right).not.toBeNaN();
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move left position", () => {
      const left = parseInt(overdrag.element.style.left);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(left).not.toBeNaN();
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it("should not move bottom position", () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(bottom).not.toBeNaN();
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom);
    });

    it(`should snap if within "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      const distance =
        -overdrag.position.fullBounds.top + overdrag.snapThreshold;
      translateCursor(overdrag, {
        y: distance,
      });
      expect(parseInt(overdrag.element.style.top)).toBe(0);
    });

    it(`should not snap if over the "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      const offset = overdrag.snapThreshold + 1;
      const distance = -overdrag.position.fullBounds.top + offset;
      translateCursor(overdrag, {
        y: distance,
      });
      expect(parseInt(overdrag.element.style.top)).toBe(offset);
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
      translateCursor(overdrag, {
        y: distance,
      });
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const height = parseInt(overdrag.element.style.height);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(height).not.toBeNaN();
      expect(parseInt(overdrag.element.style.height)).toBe(height + distance);
    });

    it(`should move bottom position`, () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(bottom).not.toBeNaN();
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom - distance);
    });

    it(`should not resize element to less than minimum height`, () => {
      translateCursor(overdrag, {
        y: -100000,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(
        overdrag.minContentHeight
      );
    });

    it(`should not resize element to more than maximum height as constrained by parent`, () => {
      const maxHeight =
        overdrag.parentPosition.actionBounds.bottom -
        overdrag.position.fullBounds.top -
        overdrag.position.verticalDiff;
      translateCursor(overdrag, {
        y: 100000,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it(`should not resize element to more than defined "maxContentHeight"`, () => {
      overdrag.minContentHeight = getRandomValue(10, 20);
      overdrag.maxContentHeight = getRandomValue(30, 40);
      const maxHeight = overdrag.maxContentHeight;
      translateCursor(overdrag, {
        y: 100000,
      });
      expect(parseInt(overdrag.element.style.height)).toBe(maxHeight);
    });

    it("should not move position if no motion detected", () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      translateCursor(overdrag, {
        y: 0,
      });
      expect(bottom).not.toBeNaN();
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom);
    });

    it("should not move right position", () => {
      const right = parseInt(overdrag.element.style.right);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(right).not.toBeNaN();
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move left position", () => {
      const left = parseInt(overdrag.element.style.left);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(left).not.toBeNaN();
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it("should not move top position", () => {
      const top = parseInt(overdrag.element.style.top);
      translateCursor(overdrag, {
        y: distance,
      });
      expect(top).not.toBeNaN();
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it(`should snap if within "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      // distance between bottom control and parent bottom edge
      const distance =
        overdrag.parentPosition.actionBounds.bottom -
        overdrag.position.fullBounds.bottom -
        overdrag.snapThreshold;
      translateCursor(overdrag, {
        y: distance,
      });

      expect(parseInt(overdrag.element.style.bottom)).toBe(0);
    });

    it(`should not snap if over the "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      const offset = overdrag.snapThreshold + 1; // to avoid triggering snap
      // distance between right control and parent right edge
      const distance =
        overdrag.parentPosition.actionBounds.bottom -
        overdrag.position.fullBounds.bottom -
        offset;
      translateCursor(overdrag, {
        y: distance,
      });

      expect(parseInt(overdrag.element.style.bottom)).toBe(offset);
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
      translateCursor(overdrag, {
        x: distance,
      });
      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
    });

    it(`should resize element`, () => {
      const width = parseInt(overdrag.element.style.width);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(width + distance);
    });

    it(`should move right position`, () => {
      const right = parseInt(overdrag.element.style.right);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(right).not.toBeNaN();
      expect(parseInt(overdrag.element.style.right)).toBe(right - distance);
    });

    it(`should not resize element to less than minimum width`, () => {
      translateCursor(overdrag, {
        x: -100000,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(
        overdrag.minContentWidth
      );
    });

    it(`should not resize element to more than maximum width as constrained by parent`, () => {
      const maxWidth =
        overdrag.parentPosition.actionBounds.right -
        overdrag.position.fullBounds.left -
        overdrag.position.horizontalDiff;
      translateCursor(overdrag, {
        x: 100000,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(maxWidth);
    });

    it(`should not resize element to more than defined "maxContentWidth"`, () => {
      overdrag.minContentWidth = getRandomValue(10, 20);
      overdrag.maxContentWidth = getRandomValue(30, 40);
      const maxWidth = overdrag.maxContentWidth;
      translateCursor(overdrag, {
        x: 100000,
      });
      expect(parseInt(overdrag.element.style.width)).toBe(maxWidth);
    });

    it("should not move position if no motion detected", () => {
      const right = parseInt(overdrag.element.style.right);
      translateCursor(overdrag, {
        x: 0,
      });
      expect(right).not.toBeNaN();
      expect(parseInt(overdrag.element.style.right)).toBe(right);
    });

    it("should not move bottom position", () => {
      const bottom = parseInt(overdrag.element.style.bottom);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(bottom).not.toBeNaN();
      expect(parseInt(overdrag.element.style.bottom)).toBe(bottom);
    });

    it("should not move top position", () => {
      const top = parseInt(overdrag.element.style.top);
      translateCursor(overdrag, {
        x: distance,
      });
      expect(top).not.toBeNaN();
      expect(parseInt(overdrag.element.style.top)).toBe(top);
    });

    it("should not move left position", () => {
      const left = parseInt(overdrag.element.style.left);
      translateCursor(overdrag, {
        x: overdrag.position.fullBounds.left + distance,
      });
      expect(parseInt(overdrag.element.style.left)).toBe(left);
    });

    it(`should snap if within "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      // distance between right control and parent right edge
      const distance =
        overdrag.parentPosition.actionBounds.right -
        overdrag.position.fullBounds.right -
        overdrag.snapThreshold;
      translateCursor(overdrag, {
        x: distance,
      });

      expect(parseInt(overdrag.element.style.right)).toBe(0);
    });

    it(`should not snap if over the "snapThreshold" value`, () => {
      overdrag.snapThreshold = getRandomValue(10, 20);
      const offset = overdrag.snapThreshold + 1; // to avoid triggering snap
      // distance between right control and parent right edge
      const distance =
        overdrag.parentPosition.actionBounds.right -
        overdrag.position.fullBounds.right -
        offset;
      translateCursor(overdrag, {
        x: distance,
      });

      expect(parseInt(overdrag.element.style.right)).toBe(offset);
    });
  });
});
