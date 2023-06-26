// @ts-ignore-file
import Overdrag from "../src";
import { createInstance, elementSetup, getRandomValue } from "./__mocks__";

describe("Constructor", () => {
  afterEach(() => {
    // Reset mock function calls
    jest.clearAllMocks();
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

  it("should set DEFAULTS if no props are provided", () => {
    const overdrag = createInstance({
      minContentHeight: undefined as any,
      minContentWidth: undefined as any,
      snapThreshold: undefined as any,
      controlsThreshold: undefined as any,
      clickDetectionThreshold: undefined as any,
    });
    expect(overdrag.minContentHeight).toBe(Overdrag.DEFAULTS.minContentHeight);
    expect(overdrag.minContentWidth).toBe(Overdrag.DEFAULTS.minContentWidth);
    expect(overdrag.snapThreshold).toBe(Overdrag.DEFAULTS.snapThreshold);
    expect(overdrag.controlsThreshold).toBe(
      Overdrag.DEFAULTS.controlsThreshold
    );
    expect(overdrag.clickDetectionThreshold).toBe(
      Overdrag.DEFAULTS.clickDetectionThreshold
    );
    expect(overdrag.stack).toBe(Overdrag.DEFAULTS.stack);
  });

  it("should set props correctly", () => {
    const props = {
      minContentHeight: getRandomValue(),
      minContentWidth: getRandomValue(),
      snapThreshold: getRandomValue(),
      controlsThreshold: getRandomValue(),
      clickDetectionThreshold: getRandomValue(),
      stack: Math.random() > 0.5,
      element: elementSetup(),
    };
    const overdrag = createInstance(props);

    expect(overdrag.minContentHeight).toBe(props.minContentHeight);
    expect(overdrag.minContentWidth).toBe(props.minContentWidth);
    expect(overdrag.snapThreshold).toBe(props.snapThreshold);
    expect(overdrag.controlsThreshold).toBe(props.controlsThreshold);
    expect(overdrag.clickDetectionThreshold).toBe(
      props.clickDetectionThreshold
    );
    expect(overdrag.element).toBe(props.element);
    expect(overdrag.parentElement).toBe(
      props.element.offsetParent as HTMLElement
    );
  });

  it("should have expected defaults", () => {
    const overdrag = createInstance();
    expect(overdrag.down).toBe(false);
    expect(overdrag.over).toBe(false);
    expect(overdrag.controlsActive).toBe(false);
    expect(overdrag.dragging).toBe(false);
  });

  it('should set "mouseenter" event listener on "element"', () => {
    const element = elementSetup();
    const spy = jest.spyOn(element, "addEventListener");
    const overdrag = createInstance({ element });
    expect(spy).toHaveBeenCalledWith("mouseenter", overdrag.onMouseOver);
  });
});
