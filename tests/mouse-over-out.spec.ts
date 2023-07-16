// @ts-ignore-file
import Overdrag from "../src";
import { createInstance } from "./setup";

describe("onMouseOver", () => {
  afterEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it(`should set "over" state to "true"`, () => {
    const overdrag = createInstance();
    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
    expect(overdrag.over).toBe(true);
  });

  it(`should emit "${Overdrag.EVENTS.OVER}" event`, () => {
    const overdrag = createInstance();
    const emitSpy = vi.spyOn(overdrag, "emit");

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));

    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.OVER, overdrag);
  });

  it(`should set "${Overdrag.ATTRIBUTES.OVER}" attribute`, () => {
    const overdrag = createInstance();
    const attrSpy = vi.spyOn(overdrag.element, "setAttribute");

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));

    expect(attrSpy).toHaveBeenCalledWith(
      Overdrag.ATTRIBUTES.OVER,
      expect.anything()
    );
  });

  it(`should attach 'mousemove' event listener`, () => {
    const overdrag = createInstance();
    const addEventListenerSpy = vi.spyOn(overdrag.element, "addEventListener");

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.anything()
    );
  });

  it(`should attach "mousemove" event listener`, () => {
    const overdrag = createInstance();
    const addEventListenerSpy = vi.spyOn(overdrag.element, "addEventListener");

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.anything()
    );
  });

  it(`should attach "mousedown" event listener`, () => {
    const overdrag = createInstance();
    const addEventListenerSpy = vi.spyOn(overdrag.element, "addEventListener");

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.anything()
    );
  });

  it(`should not attach events if already in over state`, () => {
    const overdrag = createInstance();

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
    const addEventListenerSpy = vi.spyOn(overdrag.element, "addEventListener");

    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));

    expect(addEventListenerSpy).toHaveBeenCalledTimes(0);
  });
});

describe("onMouseOut", () => {
  let overdrag: Overdrag;
  beforeEach(() => {
    overdrag = createInstance();
    overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
  });
  afterEach(() => {
    // Reset mock function calls
    vi.clearAllMocks();
  });

  it(`should set "over" state to "false"`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
    expect(overdrag.over).toBe(false);
  });

  it(`should emit "${Overdrag.EVENTS.OUT}" event`, () => {
    const spy = vi.spyOn(overdrag, "emit");
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
    expect(spy).toHaveBeenCalledWith(Overdrag.EVENTS.OUT, overdrag);
  });

  it(`should remove "${Overdrag.ATTRIBUTES.OVER}" attribute`, () => {
    const spy = vi.spyOn(overdrag.element, "removeAttribute");
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
    expect(spy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.OVER);
  });

  it(`should remove "mousemove" event listener`, () => {
    const spy = vi.spyOn(overdrag.element, "removeEventListener");
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
    expect(spy).toHaveBeenCalledWith("mousemove", expect.anything());
  });

  it(`should remove "mousedown" event listener`, () => {
    const spy = vi.spyOn(overdrag.element, "removeEventListener");
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
    expect(spy).toHaveBeenCalledWith("mousedown", expect.anything());
  });

  it(`should not attach events if not in over state`, () => {
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
    const spy = vi.spyOn(overdrag.element, "removeEventListener");

    overdrag.element.addEventListener("mouseleave", overdrag.onMouseOut);
    overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));

    expect(spy).toHaveBeenCalledTimes(0);
  });
});

describe("stack", () => {
  describe(":false", () => {
    afterEach(() => {
      // Reset mock function calls
      vi.clearAllMocks();
    });

    it(`should call "onMouseOut" for stacked instances`, () => {
      const overdrag = createInstance({ stack: false });
      const overdrag2 = createInstance({ stack: false });
      const onMouseOutSpy = vi.spyOn(overdrag, "onMouseOut");
      const onMouseOutSpy2 = vi.spyOn(overdrag2, "onMouseOut");

      overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
      overdrag2.element.dispatchEvent(new MouseEvent("mouseenter"));

      expect(onMouseOutSpy).toHaveBeenCalled();
      expect(onMouseOutSpy2).not.toHaveBeenCalled();
    });

    it(`should call "onMouseOver" when next stacked instance is out`, () => {
      const overdrag = createInstance({ stack: false });
      const overdrag2 = createInstance({ stack: false });

      overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
      overdrag2.element.dispatchEvent(new MouseEvent("mouseenter"));

      const onMouseOverSpy = vi.spyOn(overdrag, "onMouseOver");
      const onMouseOverSpy2 = vi.spyOn(overdrag2, "onMouseOver");

      overdrag2.onMouseOut({} as MouseEvent);

      expect(onMouseOverSpy2).not.toHaveBeenCalled();
      expect(onMouseOverSpy).toHaveBeenCalled();
    });
  });

  describe(":true", () => {
    afterEach(() => {
      // Reset mock function calls
      vi.clearAllMocks();
    });

    it(`should not call "onMouseOut" for stacked instances`, () => {
      const overdrag = createInstance({ stack: true });
      const overdrag2 = createInstance({ stack: true });
      const onMouseOutSpy = vi.spyOn(overdrag, "onMouseOut");
      const onMouseOutSpy2 = vi.spyOn(overdrag2, "onMouseOut");

      overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
      overdrag2.element.dispatchEvent(new MouseEvent("mouseenter"));

      expect(onMouseOutSpy).not.toHaveBeenCalled();
      expect(onMouseOutSpy2).not.toHaveBeenCalled();
    });

    it(`should not call "onMouseOver" when next stacked instance is out`, () => {
      const overdrag = createInstance({ stack: true });
      const overdrag2 = createInstance({ stack: true });

      overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
      overdrag2.element.dispatchEvent(new MouseEvent("mouseenter"));

      const onMouseOverSpy = vi.spyOn(overdrag, "onMouseOver");
      const onMouseOverSpy2 = vi.spyOn(overdrag2, "onMouseOver");
      overdrag2.element.dispatchEvent(new MouseEvent("mouseleave"));

      expect(onMouseOverSpy2).not.toHaveBeenCalled();
      expect(onMouseOverSpy).not.toHaveBeenCalled();
    });
  });
});
