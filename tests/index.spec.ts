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
  getBoundingClientRect: jest.fn().mockReturnValue({
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
  }),
  ownerDocument: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  offsetParent: mockOffsetParentElement.offsetParent,
};

const mockElementWithOffsetParent = {
  ...mockElement,
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

function createInstance({ element = mockElement as any }) {
  return new Overdrag({
    element,
    minHeight: 50,
    minWidth: 50,
    snapThreshold: 20,
    controlsThreshold: 10,
    clickDetectionThreshold: 5,
  });
}

describe("Overdrag", () => {
  let overdrag: Overdrag;

  beforeEach(() => {
    overdrag = new Overdrag({
      element: mockElement as any,
      minHeight: 50,
      minWidth: 50,
      snapThreshold: 20,
      controlsThreshold: 10,
      clickDetectionThreshold: 5,
    });

    // Reset mock function calls
    jest.clearAllMocks();
  });

  describe.only("constructor", () => {
    it("should set the properties correctly", () => {
      expect(overdrag.minHeight).toBe(50);
      expect(overdrag.minWidth).toBe(50);
      expect(overdrag.snapThreshold).toBe(20);
      expect(overdrag.controlsThreshold).toBe(10);
      expect(overdrag.clickDetectionThreshold).toBe(5);
      expect(overdrag.element).toBe(mockElement);
      expect(overdrag.parentElement).toBe(
        mockOffsetParentElement.offsetParent as HTMLElement
      );
    });

    it("should throw an error if the element has no offset parent", () => {
      // @ts-ignore
      mockElement.offsetParent = null;
      expect(() => {
        new Overdrag({
          element: mockElement as any,
        });
      }).toThrow("Element must have an offset parent");
      mockElement.offsetParent = mockOffsetParentElement.offsetParent;
    });

    it("should add event listeners for 'mousemove' and 'mousedown'", () => {
      const spy = jest.spyOn(window, "addEventListener").mockImplementation();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(spy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    });
    // });

    // describe("onMove", () => {
    //   beforeEach(() => {
    //     overdrag.onMove(mockEvent as any);
    //   });

    //   it("should update the 'pageX' and 'pageY' properties", () => {
    //     expect(overdrag.pageX).toBe(50);
    //     expect(overdrag.pageY).toBe(50);
    //   });

    //   it("should call 'setEngagedState'", () => {
    //     expect(overdrag.setEngagedState).toHaveBeenCalled();
    //   });

    //   it("should call 'updateControlPointsState'", () => {
    //     expect(overdrag.updateControlPointsState).toHaveBeenCalled();
    //   });

    //   it("should emit the 'move' event", () => {
    //     expect(overdrag.events.emit).toHaveBeenCalledWith("move", {
    //       pageX: 50,
    //       pageY: 50,
    //     });
    //   });
    // });

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
