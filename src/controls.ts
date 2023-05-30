import EventEmitter from "events";
import StateMouse from "./state-mouse";

interface ControlProps {
  /** min height of DOM element in PX. This will prevent resizing smaller than the value. */
  minHeight?: number;
  /** min width of DOM element in PX. This will prevent resizing smaller than the value. */
  minWidth?: number;
  /** Distance to the edge of relative parent element (top, left, bottom, right) when the element should snap to it. */
  snapThreshold?: number;
  /** Distance to the edge of element (top, left, bottom, right) when the element should show resize cursor and activate control points */
  controlsThreshold?: number;
  /** DOM element to control */
  element: HTMLElement;
}

export default class Controls extends EventEmitter {
  readonly mouse: StateMouse;
  readonly element: HTMLElement;
  readonly snapThreshold: number;
  readonly controlsThreshold: number;
  readonly window: Window = window;
  readonly minHeight: number;
  readonly minWidth: number;

  constructor({
    element,
    minHeight = 50,
    minWidth = 150,
    snapThreshold = 20,
    controlsThreshold = 10,
  }: ControlProps) {
    super();
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.snapThreshold = snapThreshold;
    this.controlsThreshold = controlsThreshold;
    this.element = element;
    this.window = element.ownerDocument?.defaultView || window;
    this.mouse = new StateMouse({ element, tolerance: controlsThreshold });
    this.mouse.on("update", this.onStateUpdate.bind(this));
  }

  /**
   * Update cursor style based on mouse position
   * and control points state
   * performs drag and resize
   */
  onStateUpdate() {
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
          this.mouse.downOffsetX,
        this.window.innerWidth - this.mouse.startRect.left
      )
    );
    this.setSize({ width });
  }

  private movePointLeft() {
    const left = Math.max(
      0,
      Math.min(
        this.mouse.pageX - this.mouse.downOffsetX,
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
          this.mouse.downOffsetY,
        this.window.innerHeight - this.mouse.startRect.top
      )
    );
    this.setSize({ height });
  }

  private movePointTop() {
    const top = Math.max(
      0,
      Math.min(
        this.mouse.pageY - this.mouse.downOffsetY,
        this.mouse.startRect.bottom - this.minHeight
      )
    );

    const height = Math.max(this.minHeight, this.mouse.startRect.bottom - top);

    this.setSize({ height, top });
  }

  drag() {
    const x = this.mouse.pageX - this.mouse.downOffsetX;
    const y = this.mouse.pageY - this.mouse.downOffsetY;
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
