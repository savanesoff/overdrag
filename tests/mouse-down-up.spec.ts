import Overdrag from "../src";
import { createInstance, moveElementCursor, translateCursor } from "./setup";

let overdrag: Overdrag;
// @ts-ignore
let emitSpy: vi.spyOn;
// @ts-ignore
let attrSpy: vi.spyOn;
// @ts-ignore
let removeAttributeSpy: vi.spyOn;
// @ts-ignore
let removeEventListenerSpy: vi.spyOn;
// @ts-ignore
let addEventListenerSpy: vi.spyOn;
// @ts-ignore
let windowAddEventListenerSpy: vi.spyOn;
// @ts-ignore
let windowRemoveEventListenerSpy: vi.spyOn;
//@ts-ignore
beforeEach(() => {
  overdrag = createInstance();
  emitSpy = vi.spyOn(overdrag, "emit");
  attrSpy = vi.spyOn(overdrag.element, "setAttribute");
  removeAttributeSpy = vi.spyOn(overdrag.element, "removeAttribute");
  removeEventListenerSpy = vi.spyOn(overdrag.element, "removeEventListener");
  addEventListenerSpy = vi.spyOn(overdrag.element, "addEventListener");
  windowAddEventListenerSpy = vi.spyOn(window, "addEventListener");
  windowRemoveEventListenerSpy = vi.spyOn(window, "removeEventListener");
  overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
});

afterEach(() => {
  // Reset mock function calls
  // window.dispatchEvent(new MouseEvent("mouseup"));
  // overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  vi.clearAllMocks();
});

describe("onMouseDown", () => {
  afterEach(() => {
    window.dispatchEvent(new MouseEvent("mouseup"));
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  });

  it(`should set "down" state to "true"`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(overdrag.down).toBe(true);
  });

  it(`should remove "mouseleave" event listener`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mouseleave",
      expect.anything()
    );
  });

  it(`should remove "mousemove" event listener`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.anything()
    );
  });

  it(`should remove "mousedown" event listener`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.anything()
    );
  });

  it(`should remove "mouseenter" event listener`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mouseenter",
      expect.anything()
    );
  });

  it(`should emit "${Overdrag.EVENTS.DOWN}" event`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DOWN, overdrag);
  });

  it(`should set "${Overdrag.ATTRIBUTES.DOWN}" attribute`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(attrSpy).toHaveBeenCalledWith(
      Overdrag.ATTRIBUTES.DOWN,
      expect.anything()
    );
  });

  it(`should attach "mouseup" event listener to window`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.anything()
    );
  });

  it(`should attach "mousemove" event listener to window`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.anything()
    );
  });

  it(`should set "dragging" state to "true" if no sensor is active`, () => {
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold + 1,
      y: overdrag.controlsThreshold + 1,
    });

    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(overdrag.dragging).toBe(true);
  });

  it(`should set "${Overdrag.ATTRIBUTES.DRAG_MODE}" attribute`, () => {
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold + 1,
      y: overdrag.controlsThreshold + 1,
    });

    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(attrSpy).toHaveBeenCalledWith(
      Overdrag.ATTRIBUTES.DRAG_MODE,
      expect.anything()
    );
  });

  it(`should set "dragging" state to "false" if sensor is active`, () => {
    moveElementCursor(overdrag, {
      x: 0,
      y: 0,
    });
    expect(overdrag.dragging).toBe(false);
  });
});

describe("onMouseUp", () => {
  beforeEach(() => {
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    window.dispatchEvent(new MouseEvent("mouseup"));
  });
  afterEach(() => {
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  });

  it(`should set "down" state to "false"`, () => {
    expect(overdrag.down).toBe(false);
  });

  it(`should set "dragging" state to "false"`, () => {
    expect(overdrag.dragging).toBe(false);
  });

  it(`should emit "${Overdrag.EVENTS.UP}" event`, () => {
    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.UP, overdrag);
  });

  it(`should remove "${Overdrag.ATTRIBUTES.DOWN}" attribute`, () => {
    expect(removeAttributeSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DOWN);
  });

  it(`should remove "${Overdrag.ATTRIBUTES.DRAG_MODE}" attribute`, () => {
    expect(removeAttributeSpy).toHaveBeenCalledWith(
      Overdrag.ATTRIBUTES.DRAG_MODE
    );
  });

  it(`should remove "${Overdrag.ATTRIBUTES.RESIZE}" attribute`, () => {
    expect(removeAttributeSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.RESIZE);
  });

  it(`should remove "mousemove" event listener from window`, () => {
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.anything()
    );
  });

  it(`should remove "mouseup" event listener from window`, () => {
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
      "mouseup",
      expect.anything()
    );
  });

  it(`should attach "mousemove" event listener to element`, () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.anything()
    );
  });

  it(`should attach "mousedown" event listener to element`, () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.anything()
    );
  });

  it(`should attach "mouseenter" event listener to element`, () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mouseenter",
      expect.anything()
    );
  });

  it(`should attach "mouseleave" event listener to element`, () => {
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mouseleave",
      expect.anything()
    );
  });
});

describe("Click", () => {
  afterEach(() => {
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  });
  it(`should emit "${Overdrag.EVENTS.CLICK}" event if not moved at all`, () => {
    // position cursor inside the element
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold + 1,
      y: overdrag.controlsThreshold + 1,
    });
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(overdrag.dragging).toBe(true);

    window.dispatchEvent(new MouseEvent("mouseup"));

    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.CLICK, overdrag);
  });

  it(`should emit "${Overdrag.EVENTS.CLICK}" event if moved under clickDetectionThreshold`, () => {
    // position cursor inside the element
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold + 1,
      y: overdrag.controlsThreshold + 1,
    });
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(overdrag.dragging).toBe(true);

    // move window cursor
    translateCursor(overdrag, {
      x: overdrag.clickDetectionThreshold - 1,
      y: overdrag.clickDetectionThreshold - 1,
    });

    window.dispatchEvent(new MouseEvent("mouseup"));

    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.CLICK, overdrag);
  });

  it(`should not emit "${Overdrag.EVENTS.CLICK}" event if moved passed clickDetectionThreshold`, () => {
    // position cursor inside the element
    moveElementCursor(overdrag, {
      x: overdrag.controlsThreshold + 1,
      y: overdrag.controlsThreshold + 1,
    });
    overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
    expect(overdrag.dragging).toBe(true);

    // move window cursor
    translateCursor(overdrag, {
      x: overdrag.clickDetectionThreshold,
      y: overdrag.clickDetectionThreshold,
    });

    window.dispatchEvent(new MouseEvent("mouseup"));

    expect(emitSpy).not.toHaveBeenCalledWith(Overdrag.EVENTS.CLICK, overdrag);
  });
});
