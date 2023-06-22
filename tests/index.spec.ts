// @ts-ignore-file
import Overdrag, { ControlProps } from "../src";

// Mock the window object
const mockWindow = {
  addEventListener: jest.fn(),
  document: {
    body: {
      style: {
        cursor: "",
      },
    },
  },
};
// Mock the offset parent element
const mockOffsetParentElement = {
  offsetParent: {
    offsetLeft: 0,
    offsetTop: 0,
    offsetWidth: 500,
    offsetHeight: 500,
  },
};

// Mock the event object
const mockEvent = {
  pageX: 50,
  pageY: 50,
  preventDefault: jest.fn(),
};

const mockBounds = {
  left: 0,
  top: 0,
  right: 100,
  bottom: 100,
  width: 100,
  height: 100,
};

const elementMinBox = {
  width: 50 + Math.round(Math.random() * 100),
  height: 50 + Math.round(Math.random() * 100),
};

function getMockedOffsetParentElement() {
  return {
    getBoundingClientRect: jest.fn(() => mockBounds),
    style: {
      top: `${Math.round(Math.random() * 50)}px`,
      left: `${Math.round(Math.random() * 50)}px`,
      width: `${elementMinBox.width}px`,
      height: `${elementMinBox.height}px`,
      marginTop: `${Math.round(Math.random() * 50)}px`,
      marginLeft: `${Math.round(Math.random() * 50)}px`,
      marginRight: `${Math.round(Math.random() * 50)}px`,
      marginBottom: `${Math.round(Math.random() * 50)}px`,
      paddingTop: `${Math.round(Math.random() * 50)}px`,
      paddingLeft: `${Math.round(Math.random() * 50)}px`,
      paddingRight: `${Math.round(Math.random() * 50)}px`,
      paddingBottom: `${Math.round(Math.random() * 50)}px`,
      borderTopWidth: `${Math.round(Math.random() * 50)}px`,
      borderLeftWidth: `${Math.round(Math.random() * 50)}px`,
      borderRightWidth: `${Math.round(Math.random() * 50)}px`,
      borderBottomWidth: `${Math.round(Math.random() * 50)}px`,
      setProperty: jest.fn(),
    },
  };
}

// Mock the element object
const mockElement = {
  style: {
    top: `${Math.round(Math.random() * 50)}px`,
    left: `${Math.round(Math.random() * 50)}px`,
    width: `${elementMinBox.width}px`,
    height: `${elementMinBox.height}px`,
    marginTop: `${Math.round(Math.random() * 50)}px`,
    marginLeft: `${Math.round(Math.random() * 50)}px`,
    marginRight: `${Math.round(Math.random() * 50)}px`,
    marginBottom: `${Math.round(Math.random() * 50)}px`,
    paddingTop: `${Math.round(Math.random() * 50)}px`,
    paddingLeft: `${Math.round(Math.random() * 50)}px`,
    paddingRight: `${Math.round(Math.random() * 50)}px`,
    paddingBottom: `${Math.round(Math.random() * 50)}px`,
    borderTopWidth: `${Math.round(Math.random() * 50)}px`,
    borderLeftWidth: `${Math.round(Math.random() * 50)}px`,
    borderRightWidth: `${Math.round(Math.random() * 50)}px`,
    borderBottomWidth: `${Math.round(Math.random() * 50)}px`,
    setProperty: jest.fn(),
  },
  setAttribute: jest.fn(),
  removeAttribute: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  ownerDocument: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getBoundingClientRect: jest.fn(() => mockBounds),
  },
};

// Mock the EventEmitter class
jest.mock("events", () => {
  class EventEmitterMock {
    on = jest.fn();
    emit = jest.fn();
  }
  return EventEmitterMock;
});

function getDefaultProps(): ControlProps {
  const element = mockElement as any;
  element.offsetParent = getMockedOffsetParentElement();
  return {
    element,
    minContentHeight: elementMinBox.height,
    minContentWidth: elementMinBox.width,
    snapThreshold: 10 + Math.round(Math.random() * 40),
    controlsThreshold: 10 + Math.round(Math.random() * 40),
    clickDetectionThreshold: 10 + Math.round(Math.random() * 40),
  };
}

function createInstance(props: Partial<ControlProps> = {}) {
  const mergedProps = {
    ...getDefaultProps(),
    ...props,
  };

  return new Overdrag(mergedProps);
}

function move(overdrag: Overdrag, { x = 0, y = 0 }) {
  const coord = {
    pageX:
      overdrag.position.rect.left +
      overdrag.parentElement.offsetLeft +
      overdrag.position.margins.left +
      x,
    pageY:
      overdrag.position.rect.top +
      overdrag.parentElement.offsetTop +
      overdrag.position.margins.top +
      y,
  };

  overdrag.onMouseOver({} as any);

  overdrag.onMouseMove({
    ...mockEvent,
    ...coord,
  } as any);

  return overdrag;
}

const windowAddEventListenerSpy = jest.spyOn(
  globalThis.window,
  "addEventListener"
);

jest
  .spyOn(globalThis.window, "getComputedStyle")
  .mockImplementation(() => mockElement.style as any);

describe("Overdrag", () => {
  describe("constructor", () => {
    afterEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should throw "${Overdrag.ERROR.NO_PARENT}" if the element has no offset parent`, () => {
      expect(() =>
        createInstance({
          element: { ...mockElement, offsetParent: null } as any,
        })
      ).toThrow(Overdrag.ERROR.NO_PARENT);
    });

    it(`should not throw if the element has an offset parent`, () => {
      expect(() => createInstance()).not.toThrow();
    });

    it("should set DEFAULTS if no props are provided", () => {
      const overdrag = createInstance({
        minContentHeight: undefined as any,
        minContentWidth: undefined as any,
        snapThreshold: undefined as any,
        controlsThreshold: undefined as any,
        clickDetectionThreshold: undefined as any,
      });
      expect(overdrag.minContentHeight).toBe(
        Overdrag.DEFAULTS.minContentHeight
      );
      expect(overdrag.minContentWidth).toBe(Overdrag.DEFAULTS.minContentWidth);
      expect(overdrag.snapThreshold).toBe(Overdrag.DEFAULTS.snapThreshold);
      expect(overdrag.controlsThreshold).toBe(
        Overdrag.DEFAULTS.controlsThreshold
      );
      expect(overdrag.clickDetectionThreshold).toBe(
        Overdrag.DEFAULTS.clickDetectionThreshold
      );
    });

    it(`should set "element" to "props.element"`, () => {
      const overdrag = createInstance();
      expect(overdrag.element).toBe(mockElement);
    });

    it(`should have "parentElement" defined"`, () => {
      const overdrag = createInstance();
      expect(overdrag.parentElement).toBeDefined();
    });

    it("should set props correctly", () => {
      const props = getDefaultProps();
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
      expect(overdrag.parentMouseX).toBe(0);
      expect(overdrag.parentMouseY).toBe(0);
      expect(overdrag.controlsActive).toBe(false);
      expect(overdrag.dragging).toBe(false);
      expect(overdrag.offsetX).toBe(0);
      expect(overdrag.offsetY).toBe(0);
    });
  });

  describe("onMouseOver", () => {
    afterEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should set over state`, () => {
      const overdrag = createInstance();

      overdrag.onMouseOver({} as any);
      expect(overdrag.over).toBe(true);
    });

    it('should emit "Overdrag.EVENTS.OVER" event', () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");

      overdrag.onMouseOver({} as any);

      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.OVER, overdrag);
    });

    it('should set "Overdrag.ATTRIBUTES.OVER" attribute', () => {
      const overdrag = createInstance();
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      overdrag.onMouseOver({} as any);

      expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.OVER, "");
    });

    it(`should call onMouseOut for stacked overdrag instances`, () => {
      const overdrag = createInstance();
      const overdrag2 = createInstance();
      const onMouseOutSpy = jest.spyOn(overdrag, "onMouseOut");
      const onMouseOutSpy2 = jest.spyOn(overdrag2, "onMouseOut");

      overdrag.onMouseOver({} as any);
      overdrag2.onMouseOver({} as any);

      expect(onMouseOutSpy).toHaveBeenCalled();
      expect(onMouseOutSpy2).not.toHaveBeenCalled();
    });
  });

  describe("onMouseOut", () => {
    afterEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should set over state`, () => {
      const overdrag = createInstance();
      overdrag.onMouseOver({} as any);
      overdrag.onMouseOut({} as any);
      expect(overdrag.over).toBe(false);
    });

    it('should emit "Overdrag.EVENTS.OUT" event', () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");

      overdrag.onMouseOver({} as any);
      overdrag.onMouseOut({} as any);

      expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.OUT, overdrag);
    });

    it('should remove "Overdrag.ATTRIBUTES.OVER" attribute', () => {
      const overdrag = createInstance();
      const removeAttrSpy = jest.spyOn(overdrag.element, "removeAttribute");

      overdrag.onMouseOver({} as any);
      overdrag.onMouseOut({} as any);

      expect(removeAttrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.OVER);
    });

    it("should call onMouseOver for stacked overdrag instances", () => {
      const overdrag = createInstance();
      const overdrag2 = createInstance();

      overdrag.onMouseOver({} as any);
      overdrag2.onMouseOver({} as any);

      const onMouseOverSpy = jest.spyOn(overdrag, "onMouseOver");
      const onMouseOverSpy2 = jest.spyOn(overdrag2, "onMouseOver");
      overdrag2.onMouseOut({} as any);

      expect(onMouseOverSpy2).not.toHaveBeenCalled();
      expect(onMouseOverSpy).toHaveBeenCalled();
    });
  });

  describe.skip("controls", () => {
    afterEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should activate if mouse intersects left control point `, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x: -overdrag.controlsThreshold,
        y: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.LEFT);
    });

    it(`should activate if mouse intersects right control point `, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x:
          overdrag.position.fullBox.width -
          overdrag.position.margins.left -
          overdrag.position.margins.right +
          overdrag.controlsThreshold,
        y: overdrag.controlsThreshold + 1,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "right"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.RIGHT);
    });

    it(`should activate if mouse intersects top control point `, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x: overdrag.controlsThreshold + 1,
        y: -overdrag.controlsThreshold,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS, "top");
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP);
    });

    it(`should activate if mouse intersects bottom control point `, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x: overdrag.controlsThreshold + 1,
        y:
          overdrag.position.fullBox.height -
          overdrag.position.margins.top -
          overdrag.position.margins.bottom +
          overdrag.controlsThreshold,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "bottom"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM);
    });

    it(`should activate left-top control points`, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x: -overdrag.controlsThreshold,
        y: -overdrag.controlsThreshold,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left-top"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP_LEFT);
    });

    it(`should activate right-top control points`, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x:
          overdrag.position.fullBox.width -
          overdrag.position.margins.left -
          overdrag.position.margins.right +
          overdrag.controlsThreshold,
        y: -overdrag.controlsThreshold,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "right-top"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP_RIGHT);
    });

    it(`should activate left-bottom control points`, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x: -overdrag.controlsThreshold,
        y:
          overdrag.position.fullBox.height -
          overdrag.position.margins.top -
          overdrag.position.margins.bottom +
          overdrag.controlsThreshold,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "left-bottom"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM_LEFT);
    });

    it(`should activate right-bottom control points`, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

      move(overdrag, {
        x:
          overdrag.position.fullBox.width -
          overdrag.position.margins.left -
          overdrag.position.margins.right +
          overdrag.controlsThreshold,
        y:
          overdrag.position.fullBox.height -
          overdrag.position.margins.top -
          overdrag.position.margins.bottom +
          overdrag.controlsThreshold,
      });

      expect(overdrag.controlsActive).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_ACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(
        Overdrag.ATTRIBUTES.CONTROLS,
        "right-bottom"
      );
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM_RIGHT);
    });

    it(`should deactivate if mouse leaves control points`, () => {
      const overdrag = createInstance();
      const emitSpy = jest.spyOn(overdrag, "emit");
      const attrSpy = jest.spyOn(overdrag.element, "removeAttribute");

      move(overdrag, {
        x: overdrag.controlsThreshold,
        y: overdrag.controlsThreshold,
      });

      move(overdrag, {
        x: -overdrag.controlsThreshold - 1,
        y: -overdrag.controlsThreshold - 1,
      });

      expect(overdrag.controlsActive).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith(
        Overdrag.EVENTS.CONTROLS_INACTIVE,
        overdrag
      );
      expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.CONTROLS);
      expect(document.body.style.cursor).toBe(Overdrag.CURSOR.DEFAULT);
    });
  });

  //   describe("over state", () => {
  //     afterEach(() => {
  //       jest.clearAllMocks();
  //     });

  //     it(`should have over state if the mouse is over the element passed the controlThreshold`, () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");
  //       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");
  //       move(overdrag, {
  //         x: overdrag.controlsThreshold + 1,
  //         y: overdrag.controlsThreshold + 1,
  //       });

  //       expect(overdrag.over).toBe(true);
  //       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.OVER, overdrag);
  //       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.OVER, "");
  //       expect(document.body.style.cursor).toBe(Overdrag.CURSOR.OVER);
  //     });

  //     it(`should have out state if the mouse leaves the element passed the controlThreshold`, () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");
  //       const attrSpy = jest.spyOn(overdrag.element, "removeAttribute");

  //       move(overdrag, {
  //         x: overdrag.controlsThreshold + 1,
  //         y: overdrag.controlsThreshold + 1,
  //       });
  //       move(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       expect(overdrag.over).toBe(false);
  //       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.OUT, overdrag);
  //       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.OVER);
  //       expect(document.body.style.cursor).not.toBe(Overdrag.CURSOR.OVER);
  //     });
  //   });

  //   describe("down state", () => {
  //     afterEach(() => {
  //       Overdrag.activeInstance = null;
  //       jest.clearAllMocks();
  //     });

  //     function down(overdrag: Overdrag, { x = 0, y = 0 }) {
  //       const coord = {
  //         pageX:
  //           overdrag.position.rect.left +
  //           overdrag.parentElement.offsetLeft +
  //           overdrag.position.margins.left +
  //           x,
  //         pageY:
  //           overdrag.position.rect.top +
  //           overdrag.parentElement.offsetTop +
  //           overdrag.position.margins.top +
  //           y,
  //       };

  //       overdrag.onMouseMove(coord as MouseEvent);
  //       overdrag.onMouseDown({ preventDefault: () => {} } as MouseEvent);
  //     }

  //     it(`should have down state if the mouse is down over visible area`, () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");
  //       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //       down(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       expect(overdrag.down).toBe(true);
  //       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DOWN, overdrag);
  //       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DOWN, "");
  //     });

  //     it("should not have down state if the mouse is down over invisible area", () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");
  //       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //       down(overdrag, {
  //         x: -overdrag.controlsThreshold - 1,
  //         y: -overdrag.controlsThreshold - 1,
  //       });

  //       expect(overdrag.down).toBe(false);
  //       expect(emitSpy).not.toHaveBeenCalledWith(
  //         Overdrag.EVENTS.DOWN,
  //         overdrag
  //       );
  //       expect(attrSpy).not.toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DOWN, "");
  //     });
  //   });

  //   describe("up state", () => {
  //     afterEach(() => {
  //       Overdrag.activeInstance = null;
  //       jest.clearAllMocks();
  //     });

  //     function down(overdrag: Overdrag, { x = 0, y = 0 }) {
  //       const coord = {
  //         pageX:
  //           overdrag.position.rect.left +
  //           overdrag.parentElement.offsetLeft +
  //           overdrag.position.margins.left +
  //           x,
  //         pageY:
  //           overdrag.position.rect.top +
  //           overdrag.parentElement.offsetTop +
  //           overdrag.position.margins.top +
  //           y,
  //       };

  //       overdrag.onMouseMove(coord as MouseEvent);
  //       overdrag.onMouseDown({ preventDefault: () => {} } as MouseEvent);
  //     }

  //     function up(overdrag: Overdrag, { x = 0, y = 0 }) {
  //       const coord = {
  //         pageX:
  //           overdrag.position.rect.left +
  //           overdrag.parentElement.offsetLeft +
  //           overdrag.position.margins.left +
  //           x,
  //         pageY:
  //           overdrag.position.rect.top +
  //           overdrag.parentElement.offsetTop +
  //           overdrag.position.margins.top +
  //           y,
  //       };

  //       overdrag.onMouseMove(coord as MouseEvent);
  //       overdrag.onMouseUp({ preventDefault: () => {} } as MouseEvent);
  //     }

  //     it(`should have up state after down`, () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");
  //       const attrSpy = jest.spyOn(overdrag.element, "removeAttribute");

  //       down(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       up(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       expect(overdrag.down).toBe(false);
  //       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.UP, overdrag);
  //       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DOWN);
  //     });

  //     it("should have a click event after down and up without moving mouse", () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");

  //       down(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       up(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.CLICK, overdrag);
  //     });

  //     it("should not have a click event after down and up with moving mouse", () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");

  //       down(overdrag, {
  //         x: overdrag.controlsThreshold,
  //         y: overdrag.controlsThreshold,
  //       });

  //       up(overdrag, {
  //         x: overdrag.controlsThreshold + overdrag.clickDetectionThreshold,
  //         y: overdrag.controlsThreshold + overdrag.clickDetectionThreshold,
  //       });

  //       expect(emitSpy).not.toHaveBeenCalledWith(
  //         Overdrag.EVENTS.CLICK,
  //         overdrag
  //       );
  //     });
  //   });

  //   describe("drag state", () => {
  //     afterEach(() => {
  //       Overdrag.activeInstance = null;
  //       jest.clearAllMocks();
  //     });

  //     function down(overdrag: Overdrag, { x = 0, y = 0 }) {
  //       const coord = {
  //         pageX:
  //           overdrag.position.rect.left +
  //           overdrag.parentElement.offsetLeft +
  //           overdrag.position.margins.left +
  //           x,
  //         pageY:
  //           overdrag.position.rect.top +
  //           overdrag.parentElement.offsetTop +
  //           overdrag.position.margins.top +
  //           y,
  //       };

  //       overdrag.onMouseMove(coord as MouseEvent);
  //       overdrag.onMouseDown({ preventDefault: () => {} } as MouseEvent);
  //     }

  //     function move(overdrag: Overdrag, { x = 0, y = 0 }) {
  //       const coord = {
  //         pageX:
  //           overdrag.position.rect.left +
  //           overdrag.parentElement.offsetLeft +
  //           overdrag.position.margins.left +
  //           x,
  //         pageY:
  //           overdrag.position.rect.top +
  //           overdrag.parentElement.offsetTop +
  //           overdrag.position.margins.top +
  //           y,
  //       };

  //       overdrag.onMouseMove(coord as MouseEvent);
  //     }

  //     it.skip("should have a dragging state after down while over", () => {
  //       const overdrag = createInstance();
  //       const emitSpy = jest.spyOn(overdrag, "emit");
  //       const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //       down(overdrag, {
  //         x: overdrag.controlsThreshold + 1,
  //         y: overdrag.controlsThreshold + 1,
  //       });

  //       expect(overdrag.dragging).toBe(true);

  //       move(overdrag, {
  //         x: overdrag.controlsThreshold + 100,
  //         y: overdrag.controlsThreshold + 100,
  //       });
  //       expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.DRAG, overdrag);
  //       expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.DRAG, "");
  //     });

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

  // describe("resize", () => {
  //   afterEach(() => {
  //     Overdrag.activeInstance = null;
  //     jest.clearAllMocks();
  //   });

  //   function down(overdrag: Overdrag, { x = 0, y = 0 }) {
  //     const coord = {
  //       pageX: overdrag.parentElement.offsetLeft + x,
  //       pageY: overdrag.parentElement.offsetTop + y,
  //     };

  //     overdrag.onMouseMove(coord as MouseEvent);
  //     overdrag.onMouseDown({ preventDefault: () => {} } as MouseEvent);
  //   }

  //   function move(overdrag: Overdrag, { x = 0, y = 0 }) {
  //     const coord = {
  //       pageX: overdrag.parentElement.offsetLeft + x,
  //       pageY: overdrag.parentElement.offsetTop + y,
  //     };

  //     overdrag.onMouseMove(coord as MouseEvent);
  //   }

  //   it("should resize when right control point moved", () => {
  //     const overdrag = createInstance();

  //     const emitSpy = jest.spyOn(overdrag, "emit");
  //     const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //     down(overdrag, {
  //       x: overdrag.position.rect.right - overdrag.position.margins.right,
  //       y: overdrag.position.rect.top + overdrag.position.fullBox.height / 2,
  //     });

  //     const right = overdrag.position.rect.right;

  //     expect(overdrag.controls.right).toBe(true);

  //     move(overdrag, {
  //       x: overdrag.position.rect.right,
  //       y: overdrag.position.rect.top + overdrag.position.fullBox.height / 2,
  //     });

  //     expect(overdrag.position.rect.right).toBe(right);

  //     expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
  //     expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.RESIZE, "right");
  //   });

  //   // it("should resize when left control point moved", () => {
  //   //   const overdrag = createInstance();

  //   //   const emitSpy = jest.spyOn(overdrag, "emit");
  //   //   const attrSpy = jest.spyOn(overdrag.element, "setAttribute");

  //   //   down(overdrag, {
  //   //     x: overdrag.position.rect.left + overdrag.position.margins.left,
  //   //     y: overdrag.position.rect.top + overdrag.position.fullBox.height / 2,
  //   //   });

  //   //   const left = overdrag.position.rect.left;

  //   //   expect(overdrag.controls.left).toBe(true);

  //   //   move(overdrag, {
  //   //     x: overdrag.position.rect.left,
  //   //     y: overdrag.position.rect.top + overdrag.position.fullBox.height / 2,
  //   //   });

  //   //   expect(overdrag.position.rect.left).toBe(overdrag.position.margins.left);

  //   //   expect(emitSpy).toHaveBeenCalledWith(Overdrag.EVENTS.RESIZE, overdrag);
  //   //   expect(attrSpy).toHaveBeenCalledWith(Overdrag.ATTRIBUTES.RESIZE, "left");
  //   // });
  // });
});
