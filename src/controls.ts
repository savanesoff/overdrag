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
  offsetX: number = 0;
  /** coordinate at mouse Down event */
  offsetY: number = 0;
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
    minWidth = 50,
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

    if (!this.element.offsetParent) {
      throw new Error(
        "Element must have an offset parent  with position relative or absolute)"
      );
    }

    this.parentElement = this.element.offsetParent as HTMLElement;

    this.rect = this.downRect = this.element.getBoundingClientRect();
    this.window.addEventListener("mousemove", this.onMove);
    this.window.addEventListener("mousedown", this.onDown);
    // TODO ensure the min width and height is respected
  }

  private onMove = (e: MouseEvent) => {
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    if (this.down) {
      // update rect only when mouse is down
      this.rect = this.element.getBoundingClientRect();

      if (this.dragging) {
        this.drag();
      } else {
        this.reSize();
      }
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
    if (!this.engaged) {
      return;
    }
    e.preventDefault();
    this.down = true;
    this.downRect = this.rect;
    this.offsetX = this.pageX - this.rect.left;
    this.offsetY = this.pageY - this.rect.top;
    this.dragging = !this.controlsActive;
    this.element.ownerDocument.addEventListener("mouseup", this.onUp);
    this.element.setAttribute("overdrag-down", "true");
    this.emit("down", this);
  };

  private onUp = (e: MouseEvent) => {
    e.preventDefault();
    this.click = this.isClick();
    this.down = false;
    this.dragging = false;
    this.element.ownerDocument.removeEventListener("mouseup", this.onUp);
    this.element.removeAttribute("overdrag-down");
    if (this.click) this.emit("click", this);
  };

  private isClick() {
    return (
      Math.abs(this.pageX - this.offsetX) < this.clickDetectionThreshold &&
      Math.abs(this.pageY - this.offsetY) < this.clickDetectionThreshold
    );
  }

  private isControlPointActive() {
    return (
      this.engaged &&
      (this.controls.left ||
        this.controls.right ||
        this.controls.top ||
        this.controls.bottom)
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
      this.engaged &&
      this.pageX > this.rect.left + this.controlsThreshold &&
      this.pageX < this.rect.right - this.controlsThreshold &&
      this.pageY > this.rect.top + this.controlsThreshold &&
      this.pageY < this.rect.bottom - this.controlsThreshold;

    this.element.setAttribute("overdrag-over", this.over.toString());
  }

  /**
   * Sets control points activation status (Edge of element)
   */
  private updateControlPointsState() {
    this.controls.left =
      this.engaged &&
      Math.abs(this.pageX - this.rect.left) <= this.controlsThreshold;
    this.controls.right =
      this.engaged &&
      Math.abs(this.pageX - this.rect.right) <= this.controlsThreshold;
    this.controls.top =
      this.engaged &&
      Math.abs(this.pageY - this.rect.top) <= this.controlsThreshold;
    this.controls.bottom =
      this.engaged &&
      Math.abs(this.pageY - this.rect.bottom) <= this.controlsThreshold;
  }

  private updateCursorStyle() {
    let cursor = "default";
    if (
      (this.controls.left && this.controls.top) ||
      (this.controls.right && this.controls.bottom)
    ) {
      cursor = "nwse-resize";
    } else if (
      (this.controls.left && this.controls.bottom) ||
      (this.controls.right && this.controls.top)
    ) {
      cursor = "nesw-resize";
    } else if (this.controls.top || this.controls.bottom) {
      cursor = "ns-resize";
    } else if (this.controls.left || this.controls.right) {
      cursor = "ew-resize";
    } else if (this.over) {
      cursor = "pointer";
    } else {
      cursor = "default";
    }
    this.window.document.body.style.cursor = cursor;
    this.element.setAttribute(
      "overdrag-controls",
      Object.keys(this.controls)
        .filter((key) => this.controls[key as keyof Controls])
        .join("-")
    );
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
    const newRect = { ...this.rect, ...rect };
    this.element.style.width = `${newRect.width}px`;
    this.element.style.height = `${newRect.height}px`;
    this.element.style.left = `${newRect.left}px`;
    this.element.style.top = `${newRect.top}px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${newRect.width}px`);
    this.element.setAttribute("height", `${newRect.height}px`);
  }

  private movePointRight() {
    // ensure the element never goes outside of the parent
    const maxWidth =
      this.parentElement.offsetWidth - parseInt(this.element.style.left);
    // ensure the element never goes below the minimum width
    let width = Math.max(
      this.minWidth,
      Math.min(
        // track the mouse position and set width accordingly
        this.pageX - this.downRect.left + (this.downRect.width - this.offsetX),
        maxWidth
      )
    );
    // snap to the parent right edge if within the threshold
    width = width > maxWidth - this.snapThreshold ? maxWidth : width;
    this.setSize({ width });
    this.emit("control-right", this);
  }

  private movePointBottom() {
    // ensure the element never goes outside of the parent
    const maxHeight =
      this.parentElement.offsetHeight - parseInt(this.element.style.top);
    // ensure the element never goes below the minimum width
    let height = Math.max(
      this.minHeight,
      Math.min(
        // track the mouse position and set width accordingly
        this.pageY - this.downRect.top + (this.downRect.height - this.offsetY),
        maxHeight
      )
    );
    // snap to the parent bottom  edge if within the threshold
    height = height > maxHeight - this.snapThreshold ? maxHeight : height;
    this.setSize({ height });
    this.emit("control-bottom", this);
  }

  private movePointLeft() {
    let left = Math.max(
      0,
      Math.min(
        // track the mouse position and set left accordingly
        this.pageX - this.parentElement.offsetLeft - this.offsetX,
        // max left, otherwise we'll push the element to the right
        this.downRect.right - this.minWidth - this.parentElement.offsetLeft
      )
    );
    // snap to the parent left edge if within the threshold
    left = left < this.snapThreshold ? 0 : left;
    // update width accordingly
    const width = Math.max(
      this.minWidth,
      this.downRect.right - this.parentElement.offsetLeft - left
    );

    this.setSize({ width, left });
    this.emit("control-bottom", this);
  }

  private movePointTop() {
    let top = Math.max(
      0,
      Math.min(
        this.pageY - this.parentElement.offsetTop - this.offsetY,
        this.downRect.bottom - this.minHeight - this.parentElement.offsetTop
      )
    );
    // snap to the parent top edge if within the threshold
    top = top < this.snapThreshold ? 0 : top;
    // update height accordingly
    const height = Math.max(
      this.minHeight,
      this.downRect.bottom - this.parentElement.offsetTop - top
    );

    this.setSize({ height, top });
    this.emit("control-top", this);
  }

  /**
   * Move element by mouse position
   * and snap to the edges of the parent element
   * if mouse is close enough to the edge of the parent element (snapThreshold)
   */
  drag() {
    const x = this.pageX - this.offsetX - this.parentElement.offsetLeft;
    const y = this.pageY - this.offsetY - this.parentElement.offsetTop;
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
        ? this.parentElement.offsetHeight - this.rect.height
        : y;

    this.setSize({ left, top });
    this.emit("drag", this);
  }
}
