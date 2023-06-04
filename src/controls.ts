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
  static readonly ERROR = {
    NO_PARENT:
      "Element must have an offset parent with position relative or absolute)",
  };
  static readonly DEFAULTS = {
    snapThreshold: 20,
    controlsThreshold: 10,
    minHeight: 50,
    minWidth: 50,
    clickDetectionThreshold: 5,
  };
  static readonly ATTRIBUTES = {
    CONTROLS: "data-overdrag-controls",
    ENGAGED: "data-overdrag-engaged",
    OVER: "data-overdrag-over",
    DOWN: "data-overdrag-down",
  };
  static readonly CURSOR = {
    LEFT: "w-resize",
    RIGHT: "e-resize",
    TOP: "n-resize",
    BOTTOM: "s-resize",
    TOP_LEFT: "nw-resize",
    TOP_RIGHT: "ne-resize",
    BOTTOM_LEFT: "sw-resize",
    BOTTOM_RIGHT: "se-resize",
    OVER: "grab",
    DEFAULT: "default",
  };
  static readonly EVENTS = {
    DOWN: "down",
    UP: "up",
    DRAG: "drag",
    OVER: "over",
    OUT: "out",
    ENGAGED: "engaged",
    DISENGAGED: "disengaged",
    CONTROLS_ACTIVE: "controls-active",
    CONTROLS_INACTIVE: "controls-inactive",
  };
  static activeInstance: Overdrag | null = null;
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

  cursorSet = false;
  /** Control points activation status (Edge of element) */
  readonly controls: Controls = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };
  events: any;

  constructor({
    element,
    minHeight = Overdrag.DEFAULTS.minHeight,
    minWidth = Overdrag.DEFAULTS.minWidth,
    snapThreshold = Overdrag.DEFAULTS.snapThreshold,
    controlsThreshold = Overdrag.DEFAULTS.controlsThreshold,
    clickDetectionThreshold = Overdrag.DEFAULTS.clickDetectionThreshold,
  }: ControlProps) {
    super();
    this.minHeight = minHeight;
    this.minWidth = minWidth;
    this.snapThreshold = snapThreshold;
    this.controlsThreshold = controlsThreshold;
    this.element = element;
    this.clickDetectionThreshold = clickDetectionThreshold;

    if (!this.element.offsetParent) {
      throw new Error(Overdrag.ERROR.NO_PARENT);
    }

    this.parentElement = this.element.offsetParent as HTMLElement;

    this.rect = this.downRect = this.element.getBoundingClientRect();
    this.window.addEventListener("mousemove", this.onMove);
    this.window.addEventListener("mousedown", this.onDown);
    // TODO ensure the min width and height is respected
  }

  onMove = (e: MouseEvent) => {
    if (Overdrag.activeInstance != null && Overdrag.activeInstance != this) {
      // another instance is active, ignore this event
      return;
    }
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
      const engaged = this.engaged;
      this.setEngagedState();
      // if (engaged != this.engaged) {
      this.updateControlPointsState();
      this.setOverState();
      this.updateCursorStyle();
      // }
    }
  };

  onDown = (e: MouseEvent) => {
    if (!this.engaged) {
      return;
    }
    e.preventDefault();
    Overdrag.activeInstance = this;
    this.down = true;
    this.downRect = this.rect;
    this.offsetX = this.pageX - this.rect.left;
    this.offsetY = this.pageY - this.rect.top;
    this.dragging = !this.controlsActive;
    this.element.ownerDocument.addEventListener("mouseup", this.onUp);
    this.element.setAttribute("overdrag-down", "true");
    this.emit("down", this);
  };

  onUp = (e: MouseEvent) => {
    e.preventDefault();
    Overdrag.activeInstance = null;
    this.click = this.isClick();
    this.down = false;
    this.dragging = false;
    this.element.ownerDocument.removeEventListener("mouseup", this.onUp);
    this.element.removeAttribute("overdrag-down");
    if (this.click) this.emit("click", this);
  };

  isClick() {
    return (
      Math.abs(this.pageX - this.offsetX) < this.clickDetectionThreshold &&
      Math.abs(this.pageY - this.offsetY) < this.clickDetectionThreshold
    );
  }

  isControlPointActive() {
    return (
      this.engaged &&
      (this.controls.left ||
        this.controls.right ||
        this.controls.top ||
        this.controls.bottom)
    );
  }

  setEngagedState() {
    const current = this.engaged;
    this.engaged =
      this.pageX >= this.rect.left - this.controlsThreshold &&
      this.pageX <= this.rect.right + this.controlsThreshold &&
      this.pageY >= this.rect.top - this.controlsThreshold &&
      this.pageY <= this.rect.bottom + this.controlsThreshold;

    this.element.setAttribute(
      Overdrag.ATTRIBUTES.ENGAGED,
      this.engaged.toString()
    );

    if (current != this.engaged) {
      if (this.engaged) this.emit(Overdrag.EVENTS.ENGAGED, this);
      else this.emit(Overdrag.EVENTS.DISENGAGED, this);
    }
  }

  setOverState() {
    const current = this.over;
    this.over =
      this.engaged &&
      this.pageX > this.rect.left + this.controlsThreshold &&
      this.pageX < this.rect.right - this.controlsThreshold &&
      this.pageY > this.rect.top + this.controlsThreshold &&
      this.pageY < this.rect.bottom - this.controlsThreshold;

    this.element.setAttribute(Overdrag.ATTRIBUTES.OVER, this.over.toString());

    if (current != this.over) {
      if (this.over) this.emit(Overdrag.EVENTS.OVER, this);
      else this.emit(Overdrag.EVENTS.OUT, this);
    }
  }

  /**
   * Sets control points activation status (Edge of element)
   */
  updateControlPointsState() {
    const current = JSON.stringify(this.controls);
    if (!this.engaged) {
      this.controls.left =
        this.controls.right =
        this.controls.top =
        this.controls.bottom =
          false;
    } else {
      this.controls.left =
        Math.abs(this.pageX - this.rect.left) <= this.controlsThreshold;
      this.controls.right =
        Math.abs(this.pageX - this.rect.right) <= this.controlsThreshold;
      this.controls.top =
        Math.abs(this.pageY - this.rect.top) <= this.controlsThreshold;
      this.controls.bottom =
        Math.abs(this.pageY - this.rect.bottom) <= this.controlsThreshold;
    }

    this.controlsActive = this.isControlPointActive();

    this.element.setAttribute(
      Overdrag.ATTRIBUTES.CONTROLS,
      Object.keys(this.controls)
        .filter((key) => this.controls[key as keyof Controls])
        .join("-")
    );

    if (current != JSON.stringify(this.controls)) {
      if (this.controlsActive) this.emit(Overdrag.EVENTS.CONTROLS_ACTIVE, this);
      else this.emit(Overdrag.EVENTS.CONTROLS_INACTIVE, this);
    }
  }

  updateCursorStyle() {
    let cursor = null;
    if (!this.engaged && this.cursorSet) {
      // reset cursor
      this.window.document.body.style.setProperty(
        "cursor",
        Overdrag.CURSOR.DEFAULT
      );
      this.cursorSet = false;
      return;
    }

    if (!this.engaged) return;

    if (this.over) {
      cursor = Overdrag.CURSOR.OVER;
    } else if (this.controls.top && this.controls.left) {
      cursor = Overdrag.CURSOR.TOP_LEFT;
    } else if (this.controls.bottom && this.controls.right) {
      cursor = Overdrag.CURSOR.BOTTOM_RIGHT;
    } else if (this.controls.bottom && this.controls.left) {
      cursor = Overdrag.CURSOR.BOTTOM_LEFT;
    } else if (this.controls.top && this.controls.right) {
      cursor = Overdrag.CURSOR.TOP_RIGHT;
    } else if (this.controls.top) {
      cursor = Overdrag.CURSOR.TOP;
    } else if (this.controls.bottom) {
      cursor = Overdrag.CURSOR.BOTTOM;
    } else if (this.controls.left) {
      cursor = Overdrag.CURSOR.LEFT;
    } else if (this.controls.right) {
      cursor = Overdrag.CURSOR.RIGHT;
    }

    this.window.document.body.style.setProperty("cursor", cursor);
    this.cursorSet = true;
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

  setSize(rect: Partial<DOMRect>) {
    const newRect = { ...this.rect, ...rect };
    this.element.style.width = `${newRect.width}px`;
    this.element.style.height = `${newRect.height}px`;
    this.element.style.left = `${newRect.left}px`;
    this.element.style.top = `${newRect.top}px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${newRect.width}px`);
    this.element.setAttribute("height", `${newRect.height}px`);
  }

  movePointRight() {
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

  movePointBottom() {
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

  movePointLeft() {
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
