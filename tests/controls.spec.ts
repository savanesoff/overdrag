// @ts-ignore-file
import Overdrag from "../src";
import { createInstance, moveElementCursor } from "./__mocks__";

describe("controls", () => {
  describe("When mouse is over left control sensor", () => {
    let overdrag: Overdrag;
    let emitSpy: jest.SpyInstance;
    let attrSpy: jest.SpyInstance;
    beforeEach(() => {
      overdrag = createInstance();
      emitSpy = jest.spyOn(overdrag, "emit");
      attrSpy = jest.spyOn(overdrag.element, "setAttribute");
      overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
    });
    beforeEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should activate sensor at edge`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: 0,
      });

      expect(overdrag.controls.left).toBe(true);
    });

    it(`should activate sensor at end of zone`, () => {
      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold,
        y: 0,
      });

      expect(overdrag.controls.left).toBe(true);
    });

    it(`should not activate sensor before edge`, () => {
      moveElementCursor(overdrag, {
        x: -1,
        y: 0,
      });

      expect(overdrag.controls.left).toBe(false);
    });

    it(`should not activate sensor after end of zone`, () => {
      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold + 1,
        y: 0,
      });

      expect(overdrag.controls.left).toBe(false);
    });

    it(`should not activate sensor if vertical outside of bounds`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: -1,
      });
      expect(overdrag.controls.left).toBe(false);

      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.position.visualBounds.height + 1,
      });
      expect(overdrag.controls.left).toBe(false);
    });

    it(`should set "${Overdrag.ATTRIBUTES.CONTROLS}" attribute to "left"' if only left sensor activated`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left"
      );
    });

    it(`should set "${Overdrag.ATTRIBUTES.CONTROLS}" attribute to "left-top" for both sensors activation`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: 0,
      });

      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left-top"
      );
    });

    it(`should set "${Overdrag.ATTRIBUTES.CONTROLS}" attribute to "left-bottom" for both sensors activation`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.position.visualBounds.height,
      });

      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left-bottom"
      );
    });

    it(`should emit "${Overdrag.EVENTS.CONTROLS_ACTIVE}" event`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
    });

    it(`should emit "${Overdrag.EVENTS.CONTROLS_INACTIVE}" event once left sensor is deactivated`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      moveElementCursor(overdrag, {
        x: -1,
        y: overdrag.controlsThreshold + 1,
      });

      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_INACTIVE,
        overdrag
      );
    });

    it(`should emit "${Overdrag.EVENTS.CONTROLS_INACTIVE}" for out of bound vertical`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      moveElementCursor(overdrag, {
        x: 0,
        y: -1,
      });

      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_INACTIVE,
        overdrag
      );
    });

    it(`should set element cursor to "${Overdrag.CURSOR.LEFT}"`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.LEFT);
    });

    it(`should set element cursor to "${Overdrag.CURSOR.LEFT_TOP}"`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: 0,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.LEFT_TOP);
    });

    it(`should set element cursor to "${Overdrag.CURSOR.LEFT_BOTTOM}"`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.position.visualBounds.height,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.LEFT_BOTTOM);
    });

    it(`should set element cursor to "${Overdrag.CURSOR.OVER}"`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold + 1,
        y: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.OVER);
    });
  });

  describe("When mouse is over top control sensor", () => {
    let overdrag: Overdrag;
    let emitSpy: jest.SpyInstance;
    let attrSpy: jest.SpyInstance;
    beforeEach(() => {
      overdrag = createInstance();
      emitSpy = jest.spyOn(overdrag, "emit");
      attrSpy = jest.spyOn(overdrag.element, "setAttribute");
      overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
    });
    beforeEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should activate sensor at edge`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: 0,
      });

      expect(overdrag.controls.top).toBe(true);
    });

    it(`should activate sensor at end of zone`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold,
      });

      expect(overdrag.controls.top).toBe(true);
    });

    it(`should not activate sensor before edge`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: -1,
      });

      expect(overdrag.controls.top).toBe(false);
    });

    it(`should not activate sensor after end of zone`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.controls.top).toBe(false);
    });

    it(`should not activate sensor if horizontal outside of bounds`, () => {
      moveElementCursor(overdrag, {
        x: -1,
        y: 0,
      });
      expect(overdrag.controls.top).toBe(false);

      moveElementCursor(overdrag, {
        x: overdrag.position.visualBounds.width + 1,
        y: 0,
      });
      expect(overdrag.controls.top).toBe(false);
    });

    it(`should set "${Overdrag.ATTRIBUTES.CONTROLS}" attribute to "top"' if only top sensor activated`, () => {
      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold + 1,
        y: 0,
      });

      expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS, "top");
    });

    it(`should set "${Overdrag.ATTRIBUTES.CONTROLS}" attribute to "left-top" for both sensors activation`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: 0,
      });

      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left-top"
      );
    });

    it(`should set "${Overdrag.ATTRIBUTES.CONTROLS}" attribute to "right-top" for both sensors activation`, () => {
      moveElementCursor(overdrag, {
        x: overdrag.position.visualBounds.width,
        y: 0,
      });

      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "right-top"
      );
    });

    it(`should emit "${Overdrag.EVENTS.CONTROLS_ACTIVE}" event`, () => {
      moveElementCursor(overdrag, {
        y: 0,
        x: overdrag.controlsThreshold + 1,
      });

      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
    });

    it(`should emit "${Overdrag.EVENTS.CONTROLS_INACTIVE}" event once top sensor is deactivated`, () => {
      moveElementCursor(overdrag, {
        y: 0,
        x: overdrag.controlsThreshold + 1,
      });

      moveElementCursor(overdrag, {
        y: -1,
        x: overdrag.controlsThreshold + 1,
      });

      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_INACTIVE,
        overdrag
      );
    });

    it(`should emit "${Overdrag.EVENTS.CONTROLS_INACTIVE}" for out of bound vertical`, () => {
      moveElementCursor(overdrag, {
        y: 0,
        x: overdrag.controlsThreshold + 1,
      });

      moveElementCursor(overdrag, {
        y: 0,
        x: -1,
      });

      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_INACTIVE,
        overdrag
      );
    });

    it(`should set element cursor to "${Overdrag.CURSOR.TOP}"`, () => {
      moveElementCursor(overdrag, {
        y: 0,
        x: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.TOP);
    });

    it(`should set element cursor to "${Overdrag.CURSOR.LEFT_TOP}"`, () => {
      moveElementCursor(overdrag, {
        x: 0,
        y: 0,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.LEFT_TOP);
    });

    it(`should set element cursor to "${Overdrag.CURSOR.RIGHT_TOP}"`, () => {
      moveElementCursor(overdrag, {
        y: 0,
        x: overdrag.position.visualBounds.width,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.RIGHT_TOP);
    });

    it(`should set element cursor to "${Overdrag.CURSOR.OVER}"`, () => {
      moveElementCursor(overdrag, {
        y: 0,
        x: overdrag.controlsThreshold + 1,
      });

      moveElementCursor(overdrag, {
        x: overdrag.controlsThreshold + 1,
        y: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.element.style.cursor).toBe(Overdrag.CURSOR.OVER);
    });
  });
});
