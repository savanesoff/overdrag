import Overdrag, { ControlProps } from "../src";

export function getRandomValue(min = 0, max = 50) {
  return min + Math.round(Math.random() * (max - min));
}

export function getRandomPixelValue(min = 0, max = 50) {
  return `${getRandomValue(min, max)}px`;
}

function generateStyle(
  width: number,
  height: number
): Record<string, string | (() => void)> {
  const style: Record<string, string | jest.Func> = {
    width: width + "px",
    height: height + "px",
    marginTop: getRandomPixelValue(),
    marginLeft: getRandomPixelValue(),
    marginRight: getRandomPixelValue(),
    marginBottom: getRandomPixelValue(),
    paddingTop: getRandomPixelValue(),
    paddingLeft: getRandomPixelValue(),
    paddingRight: getRandomPixelValue(),
    paddingBottom: getRandomPixelValue(),
    borderTopWidth: getRandomPixelValue(),
    borderLeftWidth: getRandomPixelValue(),
    borderRightWidth: getRandomPixelValue(),
    borderBottomWidth: getRandomPixelValue(),
    setProperty: jest.fn((name: string, value: string) => {
      style[name] = value;
    }),
    getPropertyValue: jest.fn((name: string) => style[name]),
  };

  return style;
}

function createParentElement(style: Record<string, string | jest.Func>) {
  const bounds = {
    left: getRandomValue(1, 100),
    top: getRandomValue(1, 100),
  };
  return {
    style,
    getBoundingClientRect: jest.fn(() => ({
      ...bounds,
      // we don'e need anything else
    })),
  };
}

function generateElement(
  style: Record<string, string | jest.Func>,
  offsetParent: any
) {
  const callbacks = new Map<string, ((e: MouseEvent) => void)[]>();
  style.top = getRandomPixelValue(0, 50);
  style.left = getRandomPixelValue(0, 50);
  return {
    style,
    setAttribute: jest.fn(),
    removeAttribute: jest.fn(),
    addEventListener: jest
      .fn()
      .mockImplementation((event, callback: () => void) => {
        const eventCallbacks = callbacks.get(event) || [];
        callbacks.set(event, [...eventCallbacks, callback]);
      }),
    removeEventListener: jest.fn((event, callback) => {
      const eventCallbacks = callbacks.get(event) || [];
      callbacks.set(
        event,
        eventCallbacks.filter((eventCallback) => eventCallback !== callback)
      );
    }),
    dispatchEvent: jest.fn().mockImplementation((event: MouseEvent) => {
      const eventCallbacks = callbacks.get(event.type) || [];
      eventCallbacks.forEach((callback) => callback(event));
      return true;
    }),
    offsetParent,
  } as any;
}

jest
  .spyOn(globalThis.window, "getComputedStyle")
  // element.style comes from element mocks
  .mockImplementation((element: any) => element.style as any);

export function elementSetup() {
  const parentElement = createParentElement(generateStyle(500, 500)) as any;
  const element = generateElement(
    generateStyle(100, 100),
    parentElement
  ) as any;
  return element;
}

export function createInstance(props: Partial<ControlProps> = {}) {
  const mergedProps = {
    ...{
      element: elementSetup(),
      minContentHeight: 100,
      minContentWidth: 100,
      snapThreshold: 10 + Math.round(Math.random() * 10),
      controlsThreshold: 10 + Math.round(Math.random() * 10),
      clickDetectionThreshold: 10 + Math.round(Math.random() * 10),
      stack: Math.random() > 0.5,
    },
    ...props,
  };

  return new Overdrag(mergedProps);
}

export function moveElementCursor(
  instance: Overdrag,
  { x = 0, y = 0 },
  windowEvent = false
) {
  const event = new MouseEvent("mousemove", {
    clientX:
      instance.parentPosition.offsetLeft +
      instance.position.visualBounds.left +
      x,
    clientY:
      instance.parentPosition.offsetTop +
      instance.position.visualBounds.top +
      y,
  });

  if (windowEvent) {
    window.dispatchEvent(event);
  } else {
    instance.element.dispatchEvent(event);
  }
}
