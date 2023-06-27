import Overdrag, { ControlProps } from "../src";

function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * Mock HTMLElement.offsetParent as it is not supported in JEST DOM
 */
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  get() {
    let element = this;
    while (
      !isNullOrUndefined(element) &&
      (isNullOrUndefined(element.style) ||
        isNullOrUndefined(element.style.display) ||
        element.style.display.toLowerCase() !== "none")
    ) {
      element = element.parentNode;
    }

    if (!isNullOrUndefined(element)) {
      return null;
    }

    if (
      !isNullOrUndefined(this.style) &&
      !isNullOrUndefined(this.style.position) &&
      this.style.position.toLowerCase() === "fixed"
    ) {
      return null;
    }

    if (
      this.tagName.toLowerCase() === "html" ||
      this.tagName.toLowerCase() === "body"
    ) {
      return null;
    }

    return this.parentNode;
  },
});

export function getRandomValue(min = 0, max = 50) {
  return min + Math.round(Math.random() * (max - min));
}

export function getRandomPixelValue(min = 0, max = 50) {
  return `${getRandomValue(min, max)}px`;
}

function createElement(width: number, height: number): HTMLElement {
  const element = global.document.createElement("div");
  element.style.width = width + "px";
  element.style.height = height + "px";
  element.style.marginTop = getRandomPixelValue();
  element.style.marginLeft = getRandomPixelValue();
  element.style.marginRight = getRandomPixelValue();
  element.style.marginBottom = getRandomPixelValue();
  element.style.paddingTop = getRandomPixelValue();
  element.style.paddingLeft = getRandomPixelValue();
  element.style.paddingRight = getRandomPixelValue();
  element.style.paddingBottom = getRandomPixelValue();
  element.style.borderTopWidth = getRandomPixelValue();
  element.style.borderLeftWidth = getRandomPixelValue();
  element.style.borderRightWidth = getRandomPixelValue();
  element.style.borderBottomWidth = getRandomPixelValue();
  return element;
}

export function elementSetup({
  parentWidth = 500,
  parentHeight = 500,
  elementWidth = 100,
  elementHeight = 100,
} = {}) {
  const parentElement = createElement(parentWidth, parentHeight);
  const element = createElement(elementWidth, elementHeight);
  element.style.top = getRandomPixelValue(0, 50);
  element.style.left = getRandomPixelValue(0, 50);
  parentElement.appendChild(element);
  globalThis.document.body.appendChild(parentElement);
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
      excludePadding: true,
    },
    ...props,
  };

  return new Overdrag(mergedProps);
}

export function moveElementCursor(
  overdrag: Overdrag,
  { x = 0, y = 0 },
  windowEvent = false
) {
  const event = new MouseEvent("mousemove", {
    clientX:
      overdrag.parentPosition.offsetLeft +
      (overdrag.down ? overdrag.offsetX : overdrag.position.visualBounds.left) +
      x,
    clientY:
      overdrag.parentPosition.offsetTop +
      (overdrag.down ? overdrag.offsetY : overdrag.position.visualBounds.top) +
      y,
  });

  if (windowEvent) {
    window.dispatchEvent(event);
  } else {
    overdrag.element.dispatchEvent(event);
  }
}
