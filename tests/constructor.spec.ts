// @ts-ignore-file
import Overdrag from "../src";
import { createInstance, elementSetup, getRandomValue } from "./setup";

describe("Constructor", () => {
  afterEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it(`should throw "${Overdrag.ERROR.NO_PARENT}" if the element has no offsetParent`, () => {
    expect(() =>
      createInstance({ element: globalThis.document.createElement("div") })
    ).toThrow(Overdrag.ERROR.NO_PARENT);
  });

  it(`should not throw if the element has offsetParent parent`, () => {
    const element = elementSetup();
    expect(() => createInstance({ element })).not.toThrow(
      Overdrag.ERROR.NO_PARENT
    );
  });

  it(`should set default "minContentHeight"`, () => {
    const overdrag = createInstance({ minContentHeight: undefined });
    expect(overdrag.minContentHeight).toBe(Overdrag.DEFAULTS.minContentHeight);
  });

  it(`should set default "minContentWidth"`, () => {
    const overdrag = createInstance({ minContentWidth: undefined });
    expect(overdrag.minContentWidth).toBe(Overdrag.DEFAULTS.minContentWidth);
  });

  it(`should set default "maxContentHeight"`, () => {
    const overdrag = createInstance({ maxContentHeight: undefined });
    expect(overdrag.maxContentHeight).toBe(Overdrag.DEFAULTS.maxContentHeight);
  });

  it(`should set default "maxContentWidth"`, () => {
    const overdrag = createInstance({ maxContentWidth: undefined });
    expect(overdrag.maxContentWidth).toBe(Overdrag.DEFAULTS.maxContentWidth);
  });

  it(`should set default "snapThreshold"`, () => {
    const overdrag = createInstance({ snapThreshold: undefined });
    expect(overdrag.snapThreshold).toBe(Overdrag.DEFAULTS.snapThreshold);
  });

  it(`should set default "controlsThreshold"`, () => {
    const overdrag = createInstance({ controlsThreshold: undefined });
    expect(overdrag.controlsThreshold).toBe(
      Overdrag.DEFAULTS.controlsThreshold
    );
  });

  it(`should set default "clickDetectionThreshold"`, () => {
    const overdrag = createInstance({ clickDetectionThreshold: undefined });
    expect(overdrag.clickDetectionThreshold).toBe(
      Overdrag.DEFAULTS.clickDetectionThreshold
    );
  });

  it(`should set default "stack"`, () => {
    const overdrag = createInstance({ stack: undefined });
    expect(overdrag.stack).toBe(Overdrag.DEFAULTS.stack);
  });

  it(`should set "minContentHeight"`, () => {
    const minContentHeight = getRandomValue();
    const overdrag = createInstance({ minContentHeight });
    expect(overdrag.minContentHeight).toBe(minContentHeight);
  });

  it(`should set "minContentWidth"`, () => {
    const minContentWidth = getRandomValue();
    const overdrag = createInstance({ minContentWidth });
    expect(overdrag.minContentWidth).toBe(minContentWidth);
  });

  it(`should set "maxContentHeight"`, () => {
    const maxContentHeight = getRandomValue();
    const overdrag = createInstance({ maxContentHeight });
    expect(overdrag.maxContentHeight).toBe(maxContentHeight);
  });

  it(`should set "maxContentWidth"`, () => {
    const maxContentWidth = getRandomValue();
    const overdrag = createInstance({ maxContentWidth });
    expect(overdrag.maxContentWidth).toBe(maxContentWidth);
  });

  it(`should set "snapThreshold"`, () => {
    const snapThreshold = getRandomValue();
    const overdrag = createInstance({ snapThreshold });
    expect(overdrag.snapThreshold).toBe(snapThreshold);
  });

  it(`should set "controlsThreshold"`, () => {
    const controlsThreshold = getRandomValue();
    const overdrag = createInstance({ controlsThreshold });
    expect(overdrag.controlsThreshold).toBe(controlsThreshold);
  });

  it(`should set "clickDetectionThreshold"`, () => {
    const clickDetectionThreshold = getRandomValue();
    const overdrag = createInstance({ clickDetectionThreshold });
    expect(overdrag.clickDetectionThreshold).toBe(clickDetectionThreshold);
  });

  it(`should set "stack"`, () => {
    const stack = Math.random() > 0.5;
    const overdrag = createInstance({ stack });
    expect(overdrag.stack).toBe(stack);
  });

  it(`should set "element"`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(overdrag.element).toBe(element);
  });

  it(`should set "parentElement"`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(overdrag.parentElement).toBe(element.offsetParent as HTMLElement);
  });

  it(`should set "down" as false`, () => {
    const overdrag = createInstance();
    expect(overdrag.down).toBe(false);
  });

  it(`should set "over" as false`, () => {
    const overdrag = createInstance();
    expect(overdrag.over).toBe(false);
  });

  it(`should set "controlsActive" as false`, () => {
    const overdrag = createInstance();
    expect(overdrag.controlsActive).toBe(false);
  });

  it(`should set "dragging" as false`, () => {
    const overdrag = createInstance();
    expect(overdrag.dragging).toBe(false);
  });

  it(`should set "resizing" as false`, () => {
    const overdrag = createInstance();
    expect(overdrag.resizing).toBe(false);
  });

  it('should set "mouseenter" event listener on "element"', () => {
    const element = elementSetup();
    const spy = vi.spyOn(element, "addEventListener");
    const overdrag = createInstance({ element });
    expect(spy).toHaveBeenCalledWith("mouseenter", overdrag.onMouseOver);
  });

  it(`should set element "top" style`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(element.style.top).toBe(`${overdrag.position.fullBounds.top}px`);
  });

  it(`should set element "left" style`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(element.style.left).toBe(`${overdrag.position.fullBounds.left}px`);
  });

  it(`should set element "right" style`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(element.style.right).toBe(
      `${
        overdrag.parentPosition.actionBounds.right -
        overdrag.position.fullBounds.right
      }px`
    );
  });

  it(`should set element "bottom" style`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(element.style.bottom).toBe(
      `${
        overdrag.parentPosition.actionBounds.bottom -
        overdrag.position.fullBounds.bottom
      }px`
    );
  });

  it(`should set element "width" style`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(element.style.width).toBe(`${overdrag.position.width}px`);
  });

  it(`should set element "height" style`, () => {
    const element = elementSetup();
    const overdrag = createInstance({ element });
    expect(element.style.height).toBe(`${overdrag.position.height}px`);
  });

  it(`should set element "position" style`, () => {
    const element = elementSetup();
    createInstance({ element });
    expect(element.style.position).toBe("absolute");
  });
});
