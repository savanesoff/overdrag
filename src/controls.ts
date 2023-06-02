import EventEmitter from "events";

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

  clickDetectionThreshold?: number;
}

type ControlPoints = "left" | "right" | "top" | "bottom";
type Controls = {
  [key in ControlPoints]: boolean;
};

export default class Overdrag extends EventEmitter {
  [on: string]: any;
  readonly window = window;
  readonly element: HTMLElement;
  readonly parentElement: HTMLElement;
  readonly snapThreshold: number;
  readonly controlsThreshold: number;
  readonly minHeight: number;
  readonly minWidth: number;
  readonly clickDetectionThreshold: number;

  engaged = false;
  /** Control points activation status (Edge of element) */
  controlsActive = false;
  /** Mouse over element status */
  over = false;
  /** Mouse click status */
  click = false;
  /** Drag mode status */
  dragging = false;
  /** Mouse Down status */
  down = false;
  /** current mouse position relative to window */
  pageX: number = 0;
  /** current mouse position relative to window */
  pageY: number = 0;
  /** coordinate at mouse Down event */
  downPageX: number = 0;
  /** coordinate at mouse Down event */
  downPageY: number = 0;
  /** Element rect on last mouse move event */
  rect: DOMRect;
  /** Element rect on last mouse down event */
  downRect: DOMRect;

  /** Control points activation status (Edge of element) */
  readonly controls: Controls = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };

  constructor({
    element,
    minHeight = 50,
    minWidth = 150,
    snapThreshold = 20,
    controlsThreshold = 10,
    clickDetectionThreshold = 5,
  }: ControlProps) {
    super();
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.snapThreshold = snapThreshold;
    this.controlsThreshold = controlsThreshold;
    this.element = element;
    this.clickDetectionThreshold = clickDetectionThreshold;

    if (!this.element.parentElement) {
      throw new Error("Element must have a parent element");
    }

    this.parentElement = this.element.parentElement;

    if (!this.element.offsetParent) {
      this.element.parentElement.style.position = "relative";
    }

    this.rect = this.downRect = this.element.getBoundingClientRect();
    this.window.addEventListener("mousemove", this.onMove);
    this.window.addEventListener("mousedown", this.onDown);
  }

  private onMove = (e: MouseEvent) => {
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    if (this.down) {
      // update rect only when mouse is down
      this.rect = this.element.getBoundingClientRect();
    } else {
      this.setEngagedState();
      this.updateControlPointsState();
      this.updateCursorStyle();
      this.setOverState();
      this.controlsActive = this.isControlPointActive();
    }

    this.emit("move", this);
  };

  private onDown = (e: MouseEvent) => {
    if (!this.over) {
      return;
    }
    e.preventDefault();
    this.down = true;
    this.downRect = this.rect;
    this.downPageX = this.pageX;
    this.downPageY = this.pageY;
    this.dragging = !this.controlsActive;
    this.element.ownerDocument.addEventListener("mouseup", this.onUp);
    this.emit("update", this);
  };

  private onUp = (e: MouseEvent) => {
    e.preventDefault();
    this.click = this.isClick();
    this.down = false;
    this.dragging = false;
    this.element.ownerDocument.removeEventListener("mouseup", this.onUp);
    this.emit("update", this);
    if (this.click) this.emit("click", this);
  };

  private isClick() {
    return (
      Math.abs(this.pageX - this.downPageX) < this.clickDetectionThreshold &&
      Math.abs(this.pageY - this.downPageY) < this.clickDetectionThreshold
    );
  }

  private isControlPointActive() {
    return (
      this.controls.left ||
      this.controls.right ||
      this.controls.top ||
      this.controls.bottom
    );
  }

  private setEngagedState() {
    this.engaged =
      this.pageX >= this.rect.left - this.controlsThreshold &&
      this.pageX <= this.rect.right + this.controlsThreshold &&
      this.pageY >= this.rect.top - this.controlsThreshold &&
      this.pageY <= this.rect.bottom + this.controlsThreshold;
    this.element.setAttribute("overdrag-engaged", this.engaged.toString());
  }

  private setOverState() {
    this.over =
      this.pageX >= this.rect.left + this.controlsThreshold &&
      this.pageX <= this.rect.right - this.controlsThreshold &&
      this.pageY >= this.rect.top + this.controlsThreshold &&
      this.pageY <= this.rect.bottom - this.controlsThreshold;

    this.element.setAttribute("overdrag-over", this.over.toString());
  }

  /**
   * Sets control points activation status (Edge of element)
   */
  private updateControlPointsState() {
    this.controls.left =
      this.engaged &&
      Math.abs(this.pageX - this.rect.left) < this.controlsThreshold;
    this.controls.right =
      this.engaged &&
      Math.abs(this.pageX - this.rect.right) < this.controlsThreshold;
    this.controls.top =
      this.engaged &&
      Math.abs(this.pageY - this.rect.top) < this.controlsThreshold;
    this.controls.bottom =
      this.engaged &&
      Math.abs(this.pageY - this.rect.bottom) < this.controlsThreshold;
  }

  private updateCursorStyle() {
    if (
      (this.controls.left && this.controls.top) ||
      (this.controls.right && this.controls.bottom)
    ) {
      this.window.document.body.style.cursor = "nwse-resize";
    } else if (
      (this.controls.left && this.controls.bottom) ||
      (this.controls.right && this.controls.top)
    ) {
      this.window.document.body.style.cursor = "nesw-resize";
    } else if (this.controls.top || this.controls.bottom) {
      this.window.document.body.style.cursor = "ns-resize";
    } else if (this.controls.left || this.controls.right) {
      this.window.document.body.style.cursor = "ew-resize";
    } else if (this.over) {
      this.window.document.body.style.cursor = "pointer";
    } else {
      this.window.document.body.style.cursor = "default";
    }

    this.element.setAttribute(
      "overdrag-controls",
      Object.keys(this.controls)
        .filter((key) => this.controls[key as keyof Controls])
        .join("-")
    );
  }

  /**
   * Update cursor style based on mouse position
   * and control points state
   * performs drag and resize
   */
  onStateUpdate() {
    if (this.dragging) {
      this.drag();
    } else if (this.down) {
      this.reSize();
    }
    this.emit("update", this);
  }

  reSize() {
    if (this.controls.top) {
      this.movePointTop();
    }
    if (this.controls.bottom) {
      this.movePointBottom();
    }
    if (this.controls.left) {
      this.movePointLeft();
    }
    if (this.controls.right) {
      this.movePointRight();
    }
    this.emit("resize", this);
  }

  private setSize(rect: Partial<DOMRect>) {
    const newRect = { ...this.element.getBoundingClientRect(), ...rect };
    this.element.style.width = `${newRect.width}px`;
    this.element.style.height = `${newRect.height}px`;
    this.element.style.left = `${newRect.left}px`;
    this.element.style.top = `${newRect.top}px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${newRect.width}px`);
    this.element.setAttribute("height", `${newRect.height}px`);
  }

  private movePointRight() {
    const width = Math.max(
      this.minWidth,
      Math.min(
        this.pageX - this.downRect.left + this.downRect.width - this.downPageX,
        this.parentElement.offsetWidth - this.downRect.left
      )
    );
    this.setSize({ width });
    this.emit("point-right", this);
  }

  private movePointLeft() {
    const left = Math.max(
      0,
      Math.min(this.pageX - this.downPageX, this.downRect.right - this.minWidth)
    );

    const width = Math.max(this.minWidth, this.downRect.right - left);
    this.setSize({ width, left });
    this.emit("point-left", this);
  }

  private movePointBottom() {
    const height = Math.max(
      this.minHeight,
      Math.min(
        this.pageY - this.downRect.top + this.downRect.height - this.downPageY,
        this.parentElement.offsetHeight - this.downRect.top
      )
    );
    this.setSize({ height });
    this.emit("point-bottom", this);
  }

  private movePointTop() {
    const top = Math.max(
      0,
      Math.min(
        this.pageY - this.downPageY,
        this.downRect.bottom - this.minHeight
      )
    );

    const height = Math.max(this.minHeight, this.downRect.bottom - top);

    this.setSize({ height, top });
    this.emit("point-top", this);
  }

  /**
   * Move element by mouse position
   * and snap to the edges of the parent element
   * if mouse is close enough to the edge of the parent element (snapThreshold)
   */
  drag() {
    const x = this.pageX - this.downPageX;
    const y = this.pageY - this.downPageY;
    // snap to the edges of the window
    const left =
      x < this.snapThreshold
        ? 0
        : x + this.rect.width + this.snapThreshold >
          this.parentElement.offsetWidth
        ? this.parentElement.offsetWidth - this.rect.width
        : x;
    // snap to the edges of the window
    const top =
      y < this.snapThreshold
        ? 0
        : y + this.rect.height + this.snapThreshold >
          this.parentElement.offsetHeight
        ? this.element.offsetHeight - this.rect.height
        : y;

    this.setSize({ left, top });
    this.emit("drag", this);
  }
}
