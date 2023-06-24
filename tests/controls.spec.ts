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

  //   it(`should activate if mouse intersects right control point `, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x:
  //         overdrag.position.fullBox.width -
  //         overdrag.position.margins.left -
  //         overdrag.position.margins.right +
  //         overdrag.controlsThreshold,
  //       y: overdrag.controlsThreshold + 1,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS, "right");
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.RIGHT);
  //   });

  //   it(`should activate if mouse intersects top control point `, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x: overdrag.controlsThreshold + 1,
  //       y: -overdrag.controlsThreshold,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS, "top");
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP);
  //   });

  //   it(`should activate if mouse intersects bottom control point `, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x: overdrag.controlsThreshold + 1,
  //       y:
  //         overdrag.position.fullBox.height -
  //         overdrag.position.margins.top -
  //         overdrag.position.margins.bottom +
  //         overdrag.controlsThreshold,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(
  //       Overdrag.ATTRIBUTES.CONTROLS,
  //       "bottom"
  //     );
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM);
  //   });

  //   it(`should activate left-top control points`, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x: -overdrag.controlsThreshold,
  //       y: -overdrag.controlsThreshold,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(
  //       Overdrag.ATTRIBUTES.CONTROLS,
  //       "left-top"
  //     );
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP_LEFT);
  //   });

  //   it(`should activate right-top control points`, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x:
  //         overdrag.position.fullBox.width -
  //         overdrag.position.margins.left -
  //         overdrag.position.margins.right +
  //         overdrag.controlsThreshold,
  //       y: -overdrag.controlsThreshold,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(
  //       Overdrag.ATTRIBUTES.CONTROLS,
  //       "right-top"
  //     );
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP_RIGHT);
  //   });

  //   it(`should activate left-bottom control points`, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x: -overdrag.controlsThreshold,
  //       y:
  //         overdrag.position.fullBox.height -
  //         overdrag.position.margins.top -
  //         overdrag.position.margins.bottom +
  //         overdrag.controlsThreshold,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(
  //       Overdrag.ATTRIBUTES.CONTROLS,
  //       "left-bottom"
  //     );
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM_LEFT);
  //   });

  //   it(`should activate right-bottom control points`, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     move(overdrag, {
  //       x:
  //         overdrag.position.fullBox.width -
  //         overdrag.position.margins.left -
  //         overdrag.position.margins.right +
  //         overdrag.controlsThreshold,
  //       y:
  //         overdrag.position.fullBox.height -
  //         overdrag.position.margins.top -
  //         overdrag.position.margins.bottom +
  //         overdrag.controlsThreshold,
  //     });

  //     expect(overdrag.controlsActive).toBe(true);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_ACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(
  //       Overdrag.ATTRIBUTES.CONTROLS,
  //       "right-bottom"
  //     );
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM_RIGHT);
  //   });

  //   it(`should deactivate if mouse leaves control points`, () => {
  //     const overdrag = createInstance();
  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "removeAttribute");

  //     move(overdrag, {
  //       x: overdrag.controlsThreshold,
  //       y: overdrag.controlsThreshold,
  //     });

  //     move(overdrag, {
  //       x: -overdrag.controlsThreshold - 1,
  //       y: -overdrag.controlsThreshold - 1,
  //     });

  //     expect(overdrag.controlsActive).toBe(false);
  //     expect(emitSpy).toHaveBeenCalledWith(
  //       Overdrag.EVENTS.CONTROLS_INACTIVE,
  //       overdrag
  //     );
  //     expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS);
  //     expect(document.body.style.cursor).toBe(Overdrag.CURSOR.DEFAULT);
  //   });
});
