import EventEmitter from "events";

interface StateMouseProps {
  element: HTMLElement;
  tolerance?: number;
}
export default class StateMouse extends EventEmitter {
  readonly tolerance: number;
  readonly element: HTMLElement;
  readonly window: Window;

  /** current mouse position relative to window */
  pageX: number = 0;
  /** current mouse position relative to window */
  pageY: number = 0;
  /** coordinate at mouse Down event */
  downX: number = 0;
  /** coordinate at mouse Down event */
  downY: number = 0;
  /** offset of mouse position relative to element on last down event*/
  downOffsetX: number = 0;
  /** offset of mouse position relative to element on last down event*/
  downOffsetY: number = 0;
  /** Drag mode status */
  dragging = false;
  /** Mouse Down status */
  down = false;
  /** Element rect on last mouse move event */
  rect: DOMRect;
  /** Element rect on last mouse down event */
  startRect: DOMRect;
  /** Control points activation status (Edge of element) */
  readonly controlPoints = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };
  /** Control points activation status (Edge of element) */
  controlsActive = false;
  /** Mouse over element status */
  over = false;
  /** Mouse click status */
  click = false;

  constructor({ element, tolerance = 10 }: StateMouseProps) {
    super();
    this.element = element;
    this.tolerance = tolerance;
    this.window = element.ownerDocument?.defaultView || window;
    this.rect = this.startRect = this.element.getBoundingClientRect();
    this.onMove = this.onMove.bind(this);
    this.onDown = this.onDown.bind(this);
    this.onUp = this.onUp.bind(this);
    this.element.ownerDocument.addEventListener("mousemove", this.onMove);
    this.element.ownerDocument.addEventListener("mousedown", this.onDown);
  }

  private onMove(e: MouseEvent) {
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    if (this.down) {
      // update rect only when mouse is down
      this.rect = this.element.getBoundingClientRect();
    } else {
      this.updateControlPointsState();
      this.updateCursorStyle();
      this.over = this.isMouseOver();
      this.controlsActive = this.isControlPointActive();
    }
    this.emit("update", this);
  }

  private onDown(e: MouseEvent) {
    if (!this.over) {
      return;
    }
    e.preventDefault();
    this.down = true;
    this.startRect = this.rect;
    this.downX = this.pageX;
    this.downY = this.pageY;
    this.downOffsetX = this.pageX - this.rect.left;
    this.downOffsetY = this.pageY - this.rect.top;
    this.dragging = !this.controlsActive;
    this.element.ownerDocument.addEventListener("mouseup", this.onUp);
    this.emit("update", this);
  }

  private onUp(e: MouseEvent) {
    e.preventDefault();
    this.click = this.isClick();
    this.down = false;
    this.dragging = false;
    this.element.ownerDocument.removeEventListener("mouseup", this.onUp);
    this.emit("update", this);
    if (this.click) this.emit("click", this);
  }

  private isClick() {
    return (
      Math.abs(this.pageX - this.downX) < this.tolerance &&
      Math.abs(this.pageY - this.downY) < this.tolerance
    );
  }

  /**
   * Sets control points activation status (Edge of element)
   */
  private updateControlPointsState() {
    this.controlPoints.left =
      this.over && Math.abs(this.pageX - this.rect.left) < this.tolerance;
    this.controlPoints.right =
      this.over && Math.abs(this.pageX - this.rect.right) < this.tolerance;
    this.controlPoints.top =
      this.over && Math.abs(this.pageY - this.rect.top) < this.tolerance;
    this.controlPoints.bottom =
      this.over && Math.abs(this.pageY - this.rect.bottom) < this.tolerance;
  }

  private updateCursorStyle() {
    if (
      (this.controlPoints.left && this.controlPoints.top) ||
      (this.controlPoints.right && this.controlPoints.bottom)
    ) {
      this.window.document.body.style.cursor = "nwse-resize";
    } else if (
      (this.controlPoints.left && this.controlPoints.bottom) ||
      (this.controlPoints.right && this.controlPoints.top)
    ) {
      this.window.document.body.style.cursor = "nesw-resize";
    } else if (this.controlPoints.top || this.controlPoints.bottom) {
      this.window.document.body.style.cursor = "ns-resize";
    } else if (this.controlPoints.left || this.controlPoints.right) {
      this.window.document.body.style.cursor = "ew-resize";
    } else if (this.over) {
      this.window.document.body.style.cursor = "pointer";
    } else {
      this.window.document.body.style.cursor = "default";
    }
  }

  private isControlPointActive() {
    return (
      this.controlPoints.left ||
      this.controlPoints.right ||
      this.controlPoints.top ||
      this.controlPoints.bottom
    );
  }

  private isMouseOver() {
    return (
      this.rect.left - this.tolerance <= this.pageX &&
      this.pageX < this.rect.right + this.tolerance &&
      this.rect.top - this.tolerance < this.pageY &&
      this.pageY < this.rect.bottom + this.tolerance
    );
  }
}
