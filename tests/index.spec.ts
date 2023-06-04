// @ts-ignore-file
import Overdrag from "../src";

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
// Mock the element object
const mockElement = {
  style: {
    width: "",
    height: "",
    left: "",
    top: "",
  },
  setAttribute: jest.fn(),
  removeAttribute: jest.fn(),
  getBoundingClientRect: jest.fn().mockReturnValue(mockBounds),
  ownerDocument: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  offsetParent: mockOffsetParentElement.offsetParent,
};

// Mock the EventEmitter class
jest.mock("events", () => {
  class EventEmitterMock {
    on = jest.fn();
    emit = jest.fn();
  }
  return EventEmitterMock;
});

const defaultProps = {
  element: mockElement as any,
  minHeight: 50 + Math.round(Math.random() * 100),
  minWidth: 50 + Math.round(Math.random() * 100),
  snapThreshold: 10 + Math.round(Math.random() * 40),
  controlsThreshold: 10 + Math.round(Math.random() * 40),
  clickDetectionThreshold: 10 + Math.round(Math.random() * 40),
};

function createInstance(props = defaultProps) {
  const mergedProps = {
    ...defaultProps,
    ...props,
  };

  return new Overdrag(mergedProps);
}

const windowAddEventListenerSpy = jest.spyOn(
  globalThis.window,
  "addEventListener"
);

describe("Overdrag", () => {
  describe("constructor", () => {
    afterEach(() => {
      // Reset mock function calls
      jest.clearAllMocks();
    });

    it(`should throw "${Overdrag.ERROR.NO_PARENT}" if the element has no offset parent`, () => {
      expect(() =>
        createInstance({
          ...defaultProps,
          element: { ...mockElement, offsetParent: null },
        })
      ).toThrow(Overdrag.ERROR.NO_PARENT);
    });

    it(`should not throw if the element has an offset parent`, () => {
      expect(() => createInstance()).not.toThrow();
    });

    it("should set DEFAULTS if no props are provided", () => {
      const overdrag = createInstance({
        ...defaultProps,
        minHeight: undefined as any,
        minWidth: undefined as any,
        snapThreshold: undefined as any,
        controlsThreshold: undefined as any,
        clickDetectionThreshold: undefined as any,
      });
      expect(overdrag.minHeight).toBe(Overdrag.DEFAULTS.minHeight);
      expect(overdrag.minWidth).toBe(Overdrag.DEFAULTS.minWidth);
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

    it(`should set "parentElement" to "props.element.offsetParent"`, () => {
      const overdrag = createInstance();
      expect(overdrag.parentElement).toBe(
        mockOffsetParentElement.offsetParent as HTMLElement
      );
    });

    it("should set props correctly", () => {
      const overdrag = createInstance(defaultProps);
      expect(overdrag.minHeight).toBe(defaultProps.minHeight);
      expect(overdrag.minWidth).toBe(defaultProps.minWidth);
      expect(overdrag.snapThreshold).toBe(defaultProps.snapThreshold);
      expect(overdrag.controlsThreshold).toBe(defaultProps.controlsThreshold);
      expect(overdrag.clickDetectionThreshold).toBe(
        defaultProps.clickDetectionThreshold
      );
      expect(overdrag.element).toBe(defaultProps.element);
      expect(overdrag.parentElement).toBe(
        mockOffsetParentElement.offsetParent as HTMLElement
      );
    });

    it("should add event listeners for 'mousemove' and 'mousedown'", () => {
      createInstance();
      expect(windowAddEventListenerSpy).toHaveBeenCalledTimes(2);
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
        "mousemove",
        expect.any(Function)
      );
      expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
        "mousedown",
        expect.any(Function)
      );
    });

    it("should have expected defaults", () => {
      const overdrag = createInstance();
      expect(overdrag.engaged).toBe(false);
      expect(overdrag.pageX).toBe(0);
      expect(overdrag.pageY).toBe(0);
      expect(overdrag.controlsActive).toBe(false);
      expect(overdrag.click).toBe(false);
      expect(overdrag.dragging).toBe(false);
      expect(overdrag.offsetX).toBe(0);
      expect(overdrag.offsetY).toBe(0);
      expect(overdrag.rect).toBe(mockBounds);
      expect(overdrag.downRect).toBe(mockBounds);
    });

    describe("onmousemove logic", () => {
      afterEach(() => {
        // Reset mock function calls
        jest.clearAllMocks();
      });

      function move({ x, y }: { x: number; y: number }) {
        const overdrag = createInstance();
        const coord = {
          pageX: x,
          pageY: y,
        };
        overdrag.onMove({
          ...mockEvent,
          ...coord,
        } as any);
        return overdrag;
      }

      describe(".engaged property", () => {
        afterEach(() => {
          // Reset mock function calls
          jest.clearAllMocks();
        });
        it("should set new pageX/Y ", () => {
          const coord = {
            x: Math.random(),
            y: Math.random(),
          };
          const overdrag = move(coord);

          expect(overdrag.pageX).toBe(coord.x);
          expect(overdrag.pageY).toBe(coord.y);
        });

        it(`should set .engaged to "true" if .rect.# - controlsThreshold values intersect PageX/Y `, () => {
          let overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.engaged).toBe(true);

          overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold,
            y: mockBounds.bottom + defaultProps.controlsThreshold,
          });

          expect(overdrag.engaged).toBe(true);
        });

        it(`should set .engaged to "false" if .rect.# - controlThreshold values do not intersect PageX/Y`, () => {
          let overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold - 1,
            y: mockBounds.top - defaultProps.controlsThreshold - 1,
          });

          expect(overdrag.engaged).toBe(false);

          overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold + 1,
            y: mockBounds.bottom + defaultProps.controlsThreshold + 1,
          });

          expect(overdrag.engaged).toBe(false);
        });

        it("should set element attribute 'engaged' to 'true' if engaged", () => {
          const overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.ENGAGED,
            "true"
          );

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.right + defaultProps.controlsThreshold + 1,
              pageY: mockBounds.bottom + defaultProps.controlsThreshold + 1,
            },
          } as any);

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.ENGAGED,
            "false"
          );
        });

        it(`should emit "${Overdrag.EVENTS.ENGAGED}" event if engaged`, () => {
          const overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          const spy = jest.spyOn(overdrag, "emit");

          expect(spy).toHaveBeenCalledWith(Overdrag.EVENTS.ENGAGED, overdrag);
        });

        it(`should emit "${Overdrag.EVENTS.DISENGAGED}" event if disengaged`, () => {
          const overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top,
          });

          const spy = jest.spyOn(overdrag, "emit");

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.right + defaultProps.controlsThreshold + 1,
              pageY: mockBounds.bottom + defaultProps.controlsThreshold + 1,
            },
          } as any);

          expect(spy).toHaveBeenCalledWith(
            Overdrag.EVENTS.DISENGAGED,
            overdrag
          );
        });
      });

      describe(".controlsActive property", () => {
        afterEach(() => {
          // Reset mock function calls
          jest.clearAllMocks();
        });

        it(`should set .controlsActive to "true" if mouse intersects left control point `, () => {
          let overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.left + defaultProps.controlsThreshold,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(true);
        });

        it(`should set .controlsActive to "true" if mouse intersects right control point `, () => {
          let overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.right - defaultProps.controlsThreshold,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.right,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(true);
        });

        it(`should set .controlsActive to "true" if mouse intersects top control point `, () => {
          let overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + defaultProps.controlsThreshold,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top,
          });

          expect(overdrag.controlsActive).toBe(true);
        });

        it(`should set .controlsActive to "true" if mouse intersects bottom control point `, () => {
          let overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.bottom + defaultProps.controlsThreshold,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.bottom - defaultProps.controlsThreshold,
          });

          expect(overdrag.controlsActive).toBe(true);

          overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.bottom,
          });

          expect(overdrag.controlsActive).toBe(true);
        });

        it(`should set .controlsActive to "false" if mouse does not intersect control points`, () => {
          let overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold - 1,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(false);

          overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top - defaultProps.controlsThreshold - 1,
          });

          expect(overdrag.controlsActive).toBe(false);

          overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold + 1,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.controlsActive).toBe(false);

          overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.bottom + defaultProps.controlsThreshold + 1,
          });

          expect(overdrag.controlsActive).toBe(false);
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'top' if top control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "top"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'bottom' if bottom control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.bottom + defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "bottom"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'left' if left control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "left"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'right' if right control point is active`, () => {
          const overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "right"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'left-top' if top-left control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "left-top"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'right-top' if top-right control point is active`, () => {
          const overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "right-top"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'left-bottom' if bottom-left control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.bottom + defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "left-bottom"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to 'right-bottom' if bottom-right control point is active`, () => {
          const overdrag = move({
            x: mockBounds.right + defaultProps.controlsThreshold,
            y: mockBounds.bottom + defaultProps.controlsThreshold,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            "right-bottom"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.CONTROLS}" to '' if no control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            ""
          );

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.CONTROLS,
            ""
          );
        });

        it(`should emit "${Overdrag.EVENTS.CONTROLS_ACTIVE}" event if control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left - defaultProps.controlsThreshold,
            y: mockBounds.top - defaultProps.controlsThreshold,
          });

          expect(overdrag.emit).toHaveBeenCalledWith(
            Overdrag.EVENTS.CONTROLS_ACTIVE,
            overdrag
          );
        });

        it(`should emit "${Overdrag.EVENTS.CONTROLS_INACTIVE}" event if no control point is active`, () => {
          const overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.emit).toHaveBeenCalledWith(
            Overdrag.EVENTS.CONTROLS_INACTIVE,
            overdrag
          );
        });

        it(`should emit "${Overdrag.EVENTS.CONTROLS_ACTIVE}" event if control point is active after being inactive`, () => {
          const overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold,
              pageY: mockBounds.top - defaultProps.controlsThreshold,
            },
          } as any);

          expect(overdrag.emit).toHaveBeenCalledWith(
            Overdrag.EVENTS.CONTROLS_ACTIVE,
            overdrag
          );
        });

        it(`should not emit "${Overdrag.EVENTS.CONTROLS_ACTIVE}" event if no control pint active`, () => {
          const overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          overdrag.emit = jest.fn();
          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 2,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.emit).not.toHaveBeenCalledWith(
            Overdrag.EVENTS.CONTROLS_ACTIVE,
            overdrag
          );
        });
      });

      describe(".over property", () => {
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("should be true if the mouse is over the element", () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.over).toBe(true);
        });

        it("should be false if the mouse is over controls", () => {
          const overdrag = move({
            x: mockBounds.left + defaultProps.controlsThreshold,
            y: mockBounds.top + defaultProps.controlsThreshold,
          });

          expect(overdrag.over).toBe(false);
        });

        it("should be false if the mouse is not over the element", () => {
          const overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.over).toBe(false);
        });

        it("should set the 'over' property to false if the mouse leaves the element", () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.over).toBe(false);
        });

        it("should set the 'over' property to true if the mouse re-enters the element", () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left + mockBounds.width / 2,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.over).toBe(true);
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.OVER}" to 'true' if the mouse is over the element`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.OVER,
            "true"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.OVER}" to 'false' if the mouse is not over the element`, () => {
          const overdrag = move({
            x: mockBounds.left,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.OVER,
            "false"
          );
        });

        it(`should set element attribute "${Overdrag.ATTRIBUTES.OVER}" to 'false' if the mouse leaves the element`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.element.setAttribute).toHaveBeenCalledWith(
            Overdrag.ATTRIBUTES.OVER,
            "false"
          );
        });

        it(`should emit "${Overdrag.EVENTS.OVER}" event if the mouse enters the element`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          const spy = jest.spyOn(overdrag, "emit");

          expect(spy).toHaveBeenCalledWith(Overdrag.EVENTS.OVER, overdrag);
        });

        it(`should emit "${Overdrag.EVENTS.OUT}" event if the mouse leaves the element`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          overdrag.emit = jest.fn();
          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);

          expect(overdrag.emit).toHaveBeenCalledWith(
            Overdrag.EVENTS.OUT,
            overdrag
          );
        });
      });

      describe("element cursor", () => {
        afterEach(() => {
          jest.clearAllMocks();
        });

        it(`should set body cursor to '${Overdrag.CURSOR.OVER}' if the mouse is over the element`, () => {
          move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.OVER);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.TOP}' if the mouse is over TOP controls`, () => {
          move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.BOTTOM}' if the mouse is over BOTTOM controls`, () => {
          move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.LEFT}' if the mouse is over LEFT controls`, () => {
          move({
            x: mockBounds.left,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.LEFT);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.RIGHT}' if the mouse is over RIGHT controls`, () => {
          move({
            x: mockBounds.left + mockBounds.width,
            y: mockBounds.top + mockBounds.height / 2,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.RIGHT);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.TOP_LEFT}' if the mouse is over TOP LEFT controls`, () => {
          move({
            x: mockBounds.left,
            y: mockBounds.top,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP_LEFT);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.TOP_RIGHT}' if the mouse is over TOP RIGHT controls`, () => {
          move({
            x: mockBounds.left + mockBounds.width,
            y: mockBounds.top,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.TOP_RIGHT);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.BOTTOM_LEFT}' if the mouse is over BOTTOM LEFT controls`, () => {
          move({
            x: mockBounds.left,
            y: mockBounds.top + mockBounds.height,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM_LEFT);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.BOTTOM_RIGHT}' if the mouse is over BOTTOM RIGHT controls`, () => {
          move({
            x: mockBounds.left + mockBounds.width,
            y: mockBounds.top + mockBounds.height,
          });

          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.BOTTOM_RIGHT);
        });

        it(`should set body cursor to '${Overdrag.CURSOR.DEFAULT}' if the mouse leaves the element`, () => {
          const overdrag = move({
            x: mockBounds.left + mockBounds.width / 2,
            y: mockBounds.top + mockBounds.height / 2,
          });

          overdrag.onMove({
            ...mockEvent,
            ...{
              pageX: mockBounds.left - defaultProps.controlsThreshold - 1,
              pageY: mockBounds.top + mockBounds.height / 2,
            },
          } as any);
          expect(document.body.style.cursor).toBe(Overdrag.CURSOR.DEFAULT);
        });
      });
    });

    // describe("onDown", () => {
    //   beforeEach(() => {
    //     overdrag.onDown(mockEvent as any);
    //   });

    //   it("should call 'setEngagedState'", () => {
    //     expect(overdrag.setEngagedState).toHaveBeenCalled();
    //   });

    //   it("should set the 'dragging' property to true", () => {
    //     expect(overdrag.dragging).toBe(true);
    //   });

    //   it("should store the initial position and dimensions", () => {
    //     expect(overdrag.initialX).toBe(0);
    //     expect(overdrag.initialY).toBe(0);
    //     expect(overdrag.initialWidth).toBe(100);
    //     expect(overdrag.initialHeight).toBe(100);
    //   });

    //   it("should emit the 'down' event", () => {
    //     expect(overdrag.events.emit).toHaveBeenCalledWith("down", {
    //       pageX: 50,
    //       pageY: 50,
    //     });
    //   });

    //   it("should add event listeners for 'mousemove' and 'mouseup'", () => {
    //     expect(overdrag.parentElement.addEventListener).toHaveBeenCalledTimes(2);
    //     expect(overdrag.parentElement.addEventListener).toHaveBeenCalledWith(
    //       "mousemove",
    //       expect.any(Function)
    //     );
    //     expect(overdrag.parentElement.addEventListener).toHaveBeenCalledWith(
    //       "mouseup",
    //       expect.any(Function)
    //     );
    //   });

    //   it("should call 'updateControlPointsState'", () => {
    //     expect(overdrag.updateControlPointsState).toHaveBeenCalled();
    //   });
    // });

    // describe("onUp", () => {
    //   beforeEach(() => {
    //     overdrag.onUp(mockEvent as any);
    //   });

    //   it("should call 'setEngagedState'", () => {
    //     expect(overdrag.setEngagedState).toHaveBeenCalled();
    //   });

    //   it("should set the 'dragging' property to false", () => {
    //     expect(overdrag.dragging).toBe(false);
    //   });

    //   it("should remove event listeners for 'mousemove' and 'mouseup'", () => {
    //     expect(overdrag.parentElement.removeEventListener).toHaveBeenCalledTimes(
    //       2
    //     );
    //     expect(overdrag.parentElement.removeEventListener).toHaveBeenCalledWith(
    //       "mousemove",
    //       expect.any(Function)
    //     );
    //     expect(overdrag.parentElement.removeEventListener).toHaveBeenCalledWith(
    //       "mouseup",
    //       expect.any(Function)
    //     );
    //   });

    //   it("should emit the 'up' event", () => {
    //     expect(overdrag.events.emit).toHaveBeenCalledWith("up", {
    //       pageX: 50,
    //       pageY: 50,
    //     });
    //   });

    //   it("should call 'updateControlPointsState'", () => {
    //     expect(overdrag.updateControlPointsState).toHaveBeenCalled();
    //   });
    // });

    // describe("setEngagedState", () => {
    //   beforeEach(() => {
    //     overdrag.setEngagedState();
    //   });

    //   it("should set the 'engaged' property to true", () => {
    //     expect(overdrag.engaged).toBe(true);
    //   });

    //   it("should set the 'cursor' style to 'grabbing'", () => {
    //     expect(mockElement.style.cursor).toBe("grabbing");
    //   });

    //   it("should add the 'overdrag-engaged' class to the element", () => {
    //     expect(mockElement.setAttribute).toHaveBeenCalledWith(
    //       "class",
    //       "overdrag-engaged"
    //     );
    //   });

    //   it("should add event listeners for 'mousemove' and 'mouseup'", () => {
    //     expect(overdrag.parentElement.addEventListener).toHaveBeenCalledTimes(2);
    //     expect(overdrag.parentElement.addEventListener).toHaveBeenCalledWith(
    //       "mousemove",
    //       expect.any(Function)
    //     );
    //     expect(overdrag.parentElement.addEventListener).toHaveBeenCalledWith(
    //       "mouseup",
    //       expect.any(Function)
    //     );
    //   });
    // });

    // describe("setDisengagedState", () => {
    //   beforeEach(() => {
    //     overdrag.setDisengagedState();
    //   });

    //   it("should set the 'engaged' property to false", () => {
    //     expect(overdrag.engaged).toBe(false);
    //   });

    //   it("should set the 'cursor' style to 'grab'", () => {
    //     expect(mockElement.style.cursor).toBe("grab");
    //   });

    //   it("should remove the 'overdrag-engaged' class from the element", () => {
    //     expect(mockElement.setAttribute).toHaveBeenCalledWith(
    //       "class",
    //       "overdrag"
    //     );
    //   });

    //   it("should remove event listeners for 'mousemove' and 'mouseup'", () => {
    //     expect(overdrag.parentElement.removeEventListener).toHaveBeenCalledTimes(
    //       2
    //     );
    //     expect(overdrag.parentElement.removeEventListener).toHaveBeenCalledWith(
    //       "mousemove",
    //       expect.any(Function)
    //     );
    //     expect(overdrag.parentElement.removeEventListener).toHaveBeenCalledWith(
    //       "mouseup",
    //       expect.any(Function)
    //     );
    //   });
    // });

    // describe("updateControlPointsState", () => {
    //   it("should update the 'controlPoints' object", () => {
    //     overdrag.updateControlPointsState();
    //     expect(overdrag.controlPoints).toEqual({
    //       nw: { x: 0, y: 0 },
    //       ne: { x: 100, y: 0 },
    //       sw: { x: 0, y: 100 },
    //       se: { x: 100, y: 100 },
    //     });
    //   });
  });
});
