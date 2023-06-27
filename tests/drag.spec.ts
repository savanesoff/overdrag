import Overdrag from "../src";
import { createInstance, moveElementCursor } from "./__mocks__";

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
  overdrag = createInstance({ snapThreshold: 0 });
  emitSpy = jest.spyOn(overdrag, "emit");
  attrSpy = jest.spyOn(overdrag.element, "setAttribute");
  removeAttributeSpy = jest.spyOn(overdrag.element, "removeAttribute");
  removeEventListenerSpy = jest.spyOn(overdrag.element, "removeEventListener");
  addEventListenerSpy = jest.spyOn(overdrag.element, "addEventListener");
  windowAddEventListenerSpy = jest.spyOn(window, "addEventListener");
  windowRemoveEventListenerSpy = jest.spyOn(window, "removeEventListener");
  overdrag.element.dispatchEvent(new MouseEvent("mouseenter"));
  // initiate drag
  moveElementCursor(overdrag, {
    x: overdrag.controlsThreshold + 1,
    y: overdrag.controlsThreshold + 1,
  });

  overdrag.element.dispatchEvent(new MouseEvent("mousedown"));
});
afterEach(() => {
  // Reset mock function calls
  window.dispatchEvent(new MouseEvent("mouseup"));
  overdrag.element.dispatchEvent(new MouseEvent("mouseleave"));
  Overdrag.activeInstance = null;
  jest.clearAllMocks();
});
describe("WHile dragging", () => {
  it(`should set "dragging" state to "true"`, () => {
    expect(overdrag.dragging).toBe(true);
  });

  it(`should change element position`, () => {
    const top = overdrag.position.visualBounds.top;
    const left = overdrag.position.visualBounds.left;
    moveElementCursor(
      overdrag,
      {
        x: overdrag.controlsThreshold + 5,
        y: overdrag.controlsThreshold + 5,
      },
      true
    );
    expect(overdrag.position.visualBounds.top).not.toBe(top);
    expect(overdrag.position.visualBounds.left).not.toBe(left);
  });

  it(`should emit "${Overdrag.EVENTS.DRAG_START}" event on mouse down`, () => {
    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG_START, overdrag);
  });

  it(`should emit "${Overdrag.EVENTS.DRAG}" event`, () => {
    moveElementCursor(
      overdrag,
      {
        x: overdrag.controlsThreshold + 5,
        y: overdrag.controlsThreshold + 5,
      },
      true
    );
    expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
  });

  it(`should not emit "${Overdrag.EVENTS.DRAG}" event if mouse is not moving`, () => {
    moveElementCursor(
      overdrag,
      {
        x: overdrag.controlsThreshold + 1,
        y: overdrag.controlsThreshold + 1,
      },
      true
    );
    expect(emitSpy).not.toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
  });

  it(`should set "${Overdrag.ATTRIBUTES.DRAG_MODE}" attribute on mouse down`, () => {
    expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG_MODE, "");
  });

  it(`should not set "${Overdrag.ATTRIBUTES.DRAG_MODE}" attribute if mouse is not moving`, () => {
    moveElementCursor(
      overdrag,
      {
        x: overdrag.controlsThreshold + 1,
        y: overdrag.controlsThreshold + 1,
      },
      true
    );
    expect(attrSpy).not.toHaveBeenCalledWith(
      Overdrag.ATTRIBUTES.DRAG,
      expect.anything()
    );
  });

  it(`should move element by the same amount as mouse`, () => {
    const top = parseInt(overdrag.element.style.top);
    const left = parseInt(overdrag.element.style.left);
    moveElementCursor(
      overdrag,
      {
        x: overdrag.controlsThreshold + 5,
        y: overdrag.controlsThreshold + 5,
      },
      true
    );
    expect(parseInt(overdrag.element.style.top)).toBe(top + 4);
    expect(parseInt(overdrag.element.style.left)).toBe(left + 4);
  });

  it(`should not move element passed the parent's top edge`, () => {
    moveElementCursor(
      overdrag,
      {
        y: -10000,
      },
      true
    );
    expect(parseInt(overdrag.element.style.top)).toBe(0);
  });

  it(`should not move element passed the parent's left edge`, () => {
    moveElementCursor(
      overdrag,
      {
        x: -10000,
      },
      true
    );
    expect(parseInt(overdrag.element.style.left)).toBe(0);
  });

  it(`should not move element passed the parent's bottom edge`, () => {
    moveElementCursor(
      overdrag,
      {
        y: 10000,
      },
      true
    );
    const top =
      parseInt(overdrag.parentElement.style.height) -
      parseInt(overdrag.element.style.marginTop) -
      parseInt(overdrag.element.style.height) -
      parseInt(overdrag.element.style.marginBottom) -
      parseInt(overdrag.element.style.borderTopWidth) -
      parseInt(overdrag.element.style.borderBottomWidth) -
      parseInt(overdrag.element.style.paddingTop) -
      parseInt(overdrag.element.style.paddingBottom);
    expect(parseInt(overdrag.element.style.top)).toBe(top);
  });

  it(`should not move element passed the parent's right edge`, () => {
    moveElementCursor(
      overdrag,
      {
        x: 10000,
      },
      true
    );
    const left =
      parseInt(overdrag.parentElement.style.width) -
      parseInt(overdrag.element.style.marginLeft) -
      parseInt(overdrag.element.style.width) -
      parseInt(overdrag.element.style.marginRight) -
      parseInt(overdrag.element.style.borderLeftWidth) -
      parseInt(overdrag.element.style.borderRightWidth) -
      parseInt(overdrag.element.style.paddingLeft) -
      parseInt(overdrag.element.style.paddingRight);
    expect(parseInt(overdrag.element.style.left)).toBe(left);
  });

  it(`should snap element to the parent's top edge`, () => {
    moveElementCursor(
      overdrag,
      {
        y: 1000,
      },
      true
    );
    overdrag.snapThreshold = 10;
    moveElementCursor(
      overdrag,
      {
        y:
          -overdrag.position.visualBounds.top +
          overdrag.offsetY +
          overdrag.snapThreshold +
          0,
      },
      true
    );
    expect(parseInt(overdrag.element.style.top)).toBe(0);
  });

  it(`should snap element to the parent's left edge`, () => {
    moveElementCursor(
      overdrag,
      {
        x: 1000,
      },
      true
    );

    overdrag.snapThreshold = 10;
    moveElementCursor(
      overdrag,
      {
        x:
          -overdrag.position.visualBounds.left +
          overdrag.offsetX +
          overdrag.snapThreshold +
          0,
      },
      true
    );
    expect(parseInt(overdrag.element.style.left)).toBe(0);
  });
});

//     it.skip("should move element by the same amount as mouse", () => {
//       const overdrag = createInstance();

//       const emitSpy = jest.spyOn(overdrag, "emit");
//       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

//       down(overdrag, {
//         x: overdrag.controlsThreshold + 1,
//         y: overdrag.controlsThreshold + 1,
//       });
//       const top = overdrag.position.rect.top;
//       const left = overdrag.position.rect.left;
//       move(overdrag, {
//         x: overdrag.controlsThreshold + 5,
//         y: overdrag.controlsThreshold + 5,
//       });

//       expect(overdrag.position.rect.top).not.toBe(top);
//       expect(overdrag.position.rect.left).not.toBe(left);

//       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
//       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG, "");
//     });

//     it("should snap to top of parent", () => {
//       const overdrag = createInstance();

//       const emitSpy = jest.spyOn(overdrag, "emit");
//       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

//       down(overdrag, {
//         x: overdrag.controlsThreshold + 1,
//         y: overdrag.controlsThreshold + 1,
//       });
//       move(overdrag, {
//         y: -10000,
//       });

//       expect(overdrag.position.rect.top).toBe(0);

//       move(overdrag, {
//         y: overdrag.snapThreshold - 1,
//       });

//       expect(overdrag.position.rect.top).toBe(0);
//       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
//       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG, "");
//     });

//     it("should snap to bottom of parent", () => {
//       const overdrag = createInstance();

//       const emitSpy = jest.spyOn(overdrag, "emit");
//       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

//       down(overdrag, {
//         x: overdrag.controlsThreshold + 1,
//         y: overdrag.controlsThreshold + 1,
//       });

//       move(overdrag, {
//         y: 10000,
//       });

//       expect(overdrag.position.rect.top).toBe(
//         overdrag.parentElement.offsetHeight - overdrag.position.fullBox.height
//       );

//       move(overdrag, {
//         y:
//           overdrag.parentElement.offsetHeight -
//           overdrag.position.fullBox.height -
//           overdrag.snapThreshold +
//           1,
//       });

//       expect(overdrag.position.rect.top).toBe(
//         overdrag.parentElement.offsetHeight - overdrag.position.fullBox.height
//       );
//       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
//       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG, "");
//     });

//     it("should snap to left of parent", () => {
//       const overdrag = createInstance();

//       const emitSpy = jest.spyOn(overdrag, "emit");
//       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

//       down(overdrag, {
//         x: overdrag.controlsThreshold + 1,
//         y: overdrag.controlsThreshold + 1,
//       });

//       move(overdrag, {
//         x: -10000,
//       });

//       expect(overdrag.position.rect.left).toBe(0);

//       move(overdrag, {
//         x: overdrag.snapThreshold - 1,
//       });

//       expect(overdrag.position.rect.left).toBe(0);
//       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
//       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG, "");
//     });

//     it("should snap to right of parent", () => {
//       const overdrag = createInstance();

//       const emitSpy = jest.spyOn(overdrag, "emit");
//       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

//       down(overdrag, {
//         x: overdrag.controlsThreshold + 1,
//         y: overdrag.controlsThreshold + 1,
//       });

//       move(overdrag, {
//         x: 10000,
//       });

//       expect(overdrag.position.rect.left).toBe(
//         overdrag.parentElement.offsetWidth - overdrag.position.fullBox.width
//       );

//       move(overdrag, {
//         x:
//           overdrag.parentElement.offsetWidth -
//           overdrag.position.fullBox.width -
//           overdrag.snapThreshold +
//           1,
//       });

//       expect(overdrag.position.rect.left).toBe(
//         overdrag.parentElement.offsetWidth - overdrag.position.fullBox.width
//       );
//       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
//       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG, "");
//     });
//   });
// });
