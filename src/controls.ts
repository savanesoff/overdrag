import { EventEmitter } from "events";
import StateMouse from "./state-mouse.js";

export default class Controls extends EventEmitter {
  mouse: StateMouse;
  element: HTMLElement;
  snapThreshold = 20;
  window: Window = window;
  border = {
    color: "#f00",
    width: 3,
    spread: 0,
    blur: 0,
  };
  minHeight = 50;
  minWidth = 150;

  constructor(element: HTMLElement) {
    super();
    this.element = element;
    this.window = element.ownerDocument?.defaultView || window;
    this.mouse = new StateMouse(element);
    this.mouse.on("update", this.onStateUpdate.bind(this));
  }

  /**
   * Update cursor style based on mouse position
   * and control points state
   * performs drag and resize
   */
  onStateUpdate() {
    this.updateCursorStyle();
    if (this.mouse.dragging) {
      this.drag();
    } else if (this.mouse.down) {
      this.reSize();
    }
    this.emit("update", this.mouse);
  }

  reSize() {
    if (this.mouse.controlPoints.top) {
      this.movePointTop();
    }
    if (this.mouse.controlPoints.bottom) {
      this.movePointBottom();
    }
    if (this.mouse.controlPoints.left) {
      this.movePointLeft();
    }
    if (this.mouse.controlPoints.right) {
      this.movePointRight();
    }
  }

  private setSize(rect: Partial<DOMRect>) {
    const newRect = { ...this.element.getBoundingClientRect(), ...rect };
    this.element.style.width = `${newRect.width}px`;
    this.element.style.height = `${newRect.height}px`;
    this.element.style.left = `${newRect.left}px`;
    this.element.style.top = `${newRect.top}px`;
    this.element.setAttribute("width", `${newRect.width}px`);
    this.element.setAttribute("height", `${newRect.height}px`);
  }

  private movePointRight() {
    const width = Math.max(
      this.minWidth,
      Math.min(
        this.mouse.pageX -
          this.mouse.startRect.left +
          this.mouse.startRect.width -
          this.mouse.offsetX,
        this.window.innerWidth - this.mouse.startRect.left
      )
    );
    this.setSize({ width });
  }

  private movePointLeft() {
    const left = Math.max(
      0,
      Math.min(
        this.mouse.pageX - this.mouse.offsetX,
        this.mouse.startRect.right - this.minWidth
      )
    );

    const width = Math.max(this.minWidth, this.mouse.startRect.right - left);
    this.setSize({ width, left });
  }

  private movePointBottom() {
    const height = Math.max(
      this.minHeight,
      Math.min(
        this.mouse.pageY -
          this.mouse.startRect.top +
          this.mouse.startRect.height -
          this.mouse.offsetY,
        this.window.innerHeight - this.mouse.startRect.top
      )
    );
    this.setSize({ height });
  }

  private movePointTop() {
    const top = Math.max(
      0,
      Math.min(
        this.mouse.pageY - this.mouse.offsetY,
        this.mouse.startRect.bottom - this.minHeight
      )
    );

    const height = Math.max(this.minHeight, this.mouse.startRect.bottom - top);

    this.setSize({ height, top });
  }

  private updateCursorStyle() {
    if (
      (this.mouse.controlPoints.left && this.mouse.controlPoints.top) ||
      (this.mouse.controlPoints.right && this.mouse.controlPoints.bottom)
    ) {
      this.window.document.body.style.cursor = "nwse-resize";
    } else if (
      (this.mouse.controlPoints.left && this.mouse.controlPoints.bottom) ||
      (this.mouse.controlPoints.right && this.mouse.controlPoints.top)
    ) {
      this.window.document.body.style.cursor = "nesw-resize";
    } else if (
      this.mouse.controlPoints.top ||
      this.mouse.controlPoints.bottom
    ) {
      this.window.document.body.style.cursor = "ns-resize";
    } else if (
      this.mouse.controlPoints.left ||
      this.mouse.controlPoints.right
    ) {
      this.window.document.body.style.cursor = "ew-resize";
    } else if (this.mouse.over) {
      this.window.document.body.style.cursor = "pointer";
    } else {
      this.window.document.body.style.cursor = "default";
    }
  }

  drag() {
    const x = this.mouse.pageX - this.mouse.offsetX;
    const y = this.mouse.pageY - this.mouse.offsetY;
    // snap to the edges of the window
    const left =
      x < this.snapThreshold
        ? 0
        : x + this.mouse.rect.width + this.snapThreshold >
          this.window.innerWidth
        ? this.window.innerWidth - this.mouse.rect.width
        : x;
    // snap to the edges of the window
    const top =
      y < this.snapThreshold
        ? 0
        : y + this.mouse.rect.height + this.snapThreshold >
          this.window.innerHeight
        ? this.window.innerHeight - this.mouse.rect.height
        : y;

    this.setSize({ left, top });
  }
}
