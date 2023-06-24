import EventEmitter from "eventemitter3";

type Complete<T> = {
  [P in keyof T]-?: T[P];
};

export interface ControlProps {
  /** min height of DOM element in PX. This will prevent resizing smaller than the value. */
  minContentHeight?: number;
  /** min width of DOM element in PX. This will prevent resizing smaller than the value. */
  minContentWidth?: number;
  /** Distance to the edge of relative parent element (top, left, bottom, right) when the element should snap to it. */
  snapThreshold?: number;
  /** Distance to the edge of element (top, left, bottom, right) when the element should show resize cursor and activate control points */
  controlsThreshold?: number;
  /** DOM element to control */
  element: HTMLElement;
  /** max humber of pixels cursor can move between down and up events to be considered a click */
  clickDetectionThreshold?: number;
  /** if true, "over" state of parent Overdrag will no be canceled while child overdrag is active*/
  stack?: boolean;
}

export type Defaults = Complete<Omit<ControlProps, "element">>;
// union of all events
export type Events =
  | "down"
  | "up"
  | "click"
  | "drag"
  | "over"
  | "out"
  | "controlsActive"
  | "controlsInactive"
  | "controlRightUpdate"
  | "controlLeftUpdate"
  | "controlTopUpdate"
  | "controlBottomUpdate"
  | "resize"
  | "update";

// union of all cursors
export type Cursors =
  | "default"
  | "grab"
  | "w-resize"
  | "e-resize"
  | "n-resize"
  | "s-resize"
  | "nw-resize"
  | "ne-resize"
  | "sw-resize"
  | "se-resize";

// union of all attributes
export type Attributes =
  | "data-overdrag-controls"
  | "data-overdrag-over"
  | "data-overdrag-down"
  | "data-overdrag-drag"
  | "data-overdrag-resize";

type Box = {
  width: number;
  height: number;
};

type Bounds = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

type Position = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Rect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type ParentPosition = {
  box: Box;
  paddings: Rect;
  offsetLeft: number;
  offsetTop: number;
};

type ComputedPosition = {
  visualBounds: Bounds;
  fullBounds: Bounds;
  width: number;
  height: number;
  margins: Rect;
  borders: Rect;
  paddings: Rect;
};

type ControlPoints = "left" | "right" | "top" | "bottom";
type Controls = {
  [key in ControlPoints]: boolean;
};

export default class Overdrag extends EventEmitter {
  static readonly __ENGAGED_STACK__: Overdrag[] = [];
  static readonly ERROR = {
    NO_PARENT: "Element must have an offset parent with position relative)",
  };
  static readonly DEFAULTS: Defaults = {
    snapThreshold: 16, // 1rem
    controlsThreshold: 16, //1rem
    minContentHeight: 50,
    minContentWidth: 50,
    clickDetectionThreshold: 5,
    stack: false,
  };
  static readonly ATTRIBUTES = {
    /** Set while any control point is active with a value of active control, Ex: `data-overdrag-controls="right-left"` */
    CONTROLS: "data-overdrag-controls",
    /** Set while mouse is over the element pass the control sensors. */
    OVER: "data-overdrag-over",
    /** Set while mouse is down (preceded by `over` conditions). */
    DOWN: "data-overdrag-down",
    /**  Set while element is dragged. */
    DRAG: "data-overdrag-drag",
    /**  Set while element is being resized with a value of side used to resize element. (`left`, `right`, `top`, `bottom`), Ex: `data-overdrag-resize="right"`. */
    RESIZE: "data-overdrag-resize",
  };
  static readonly CURSOR = {
    /** Set while LEFT control sensor is activated (including sensitivity area). */
    LEFT: "w-resize",
    /** Set while RIGHT control sensor is activated (including sensitivity area). */
    RIGHT: "e-resize",
    /** Set while TOP control sensor is activated (including sensitivity area). */
    TOP: "n-resize",
    /** Set while BOTTOM control sensor is activated (including sensitivity area). */
    BOTTOM: "s-resize",
    /** Set while TOP and LEFT control sensors are activated (including sensitivity area). */
    LEFT_TOP: "nw-resize",
    /** Set while TOP and RIGHT control sensors are activated (including sensitivity area). */
    RIGHT_TOP: "ne-resize",
    /** Set while BOTTOM and LEFT control sensors are activated (including sensitivity area). */
    LEFT_BOTTOM: "sw-resize",
    /** Set while BOTTOM and RIGHT control sensors are activated (including sensitivity area). */
    RIGHT_BOTTOM: "se-resize",
    /** Set while mouse is over the element pass the control sensors. */
    OVER: "grab",
    /** Set while no interactions are detected. */
    DEFAULT: "default",
  };
  static readonly EVENTS: { [key: string]: Events } = {
    /** Triggered when the mouse button is pressed down on the element. */
    DOWN: "down",
    /**  Triggered when the mouse button is released if pressed while element was "engaged". */
    UP: "up",
    /** Triggered when a click action is detected. */
    CLICK: "click",
    /** Triggered during dragging, on every drag motion with a mouse move. */
    DRAG: "drag",
    /**  Triggered when the mouse is over the element passed the control point sensors. */
    OVER: "over",
    /** Triggered when the mouse moves out of the visible box of element excluding control point sensors. */
    OUT: "out",
    /** Triggered when the control points are activated (edge of element) within control sensor area. */
    CONTROLS_ACTIVE: "controlsActive",
    /** Triggered when the control points are deactivated. */
    CONTROLS_INACTIVE: "controlsInactive",
    /** Triggered when the right control point position is updated. */
    CONTROL_RIGHT_UPDATE: "controlRightUpdate",
    /** Triggered when the left control point position is updated. */
    CONTROL_LEFT_UPDATE: "controlLeftUpdate",
    /** Triggered when the top control point position is updated. */
    CONTROL_TOP_UPDATE: "controlTopUpdate",
    /** Triggered when the bottom control point position is updated. */
    CONTROL_BOTTOM_UPDATE: "controlBottomUpdate",
    /**  Triggered during resizing on every mouse move (if size change detected). */
    RESIZE: "resize",
    /** Triggered on any update to the element (any emitted event will be preceded by update event). */
    UPDATE: "update",
  };
  static activeInstance: Overdrag | null = null;
  readonly window = window;
  readonly element: HTMLElement;
  readonly parentElement: HTMLElement;
  readonly snapThreshold: number;
  readonly controlsThreshold: number;
  readonly minContentHeight: number;
  readonly minContentWidth: number;
  readonly clickDetectionThreshold: number;

  /** Control points activation status (Edge of element) */
  controlsActive = false;
  /** Mouse over element status */
  over = false;
  /** Drag mode status */
  dragging = false;
  /** Resize mode status */
  resizing = false;
  /** Mouse Down status */
  down = false;
  /** current mouse position relative to parent */
  parentMouseX: number = 0;
  /** current mouse position relative to parent */
  parentMouseY: number = 0;
  /** coordinate at mouse Down event */
  offsetX: number = 0;
  /** coordinate at mouse Down event */
  offsetY: number = 0;
  /** Element rect on last mouse move event */
  position: ComputedPosition;
  /** Element rect on last mouse down event */
  downPosition: ComputedPosition;
  /** Parent element styles and positions */
  parentPosition: ParentPosition;
  /** Flag to opt in for stacked recursive child nodes to prevent its parent from being inactive */
  stack: boolean;
  /** Control points activation status (Edge of element) */
  readonly controls: Controls = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };

  downMouseX: number = 0;
  downMouseY: number = 0;

  constructor({
    element,
    minContentHeight = Overdrag.DEFAULTS.minContentHeight,
    minContentWidth = Overdrag.DEFAULTS.minContentWidth,
    snapThreshold = Overdrag.DEFAULTS.snapThreshold,
    controlsThreshold = Overdrag.DEFAULTS.controlsThreshold,
    clickDetectionThreshold = Overdrag.DEFAULTS.clickDetectionThreshold,
    stack = Overdrag.DEFAULTS.stack,
  }: ControlProps) {
    super();
    this.minContentHeight = minContentHeight;
    this.minContentWidth = minContentWidth;
    this.snapThreshold = snapThreshold;
    this.controlsThreshold = controlsThreshold;
    this.element = element;
    // ensure element is positioned
    this.element.style.position = "absolute";
    this.stack = stack;
    // @ts-ignore
    this.element.__overdrag = this;
    this.clickDetectionThreshold = clickDetectionThreshold;

    if (!this.element.offsetParent) {
      throw new Error(Overdrag.ERROR.NO_PARENT);
    }

    this.parentElement = this.element.offsetParent as HTMLElement;
    this.element.addEventListener("mouseenter", this.onMouseOver);
    this.parentPosition = this.getComputedParentPosition();
    // update rect only when mouse is down
    this.position = this.getComputedElementPosition();
    this.downPosition = this.position;
    // TODO ensure the min width and height is respected
  }

  private _getInt(value: string | null): number {
    return parseInt(value || "0");
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    super.emit.apply(this, [Overdrag.EVENTS.UPDATE, this]);
    return super.emit.apply(this, [eventName, ...args]);
  }

  getComputedParentPosition(): ParentPosition {
    const parentRect = this.parentElement.getBoundingClientRect();
    const computed = getComputedStyle(this.parentElement);
    const paddings = {
      top: this._getInt(computed.paddingTop),
      right: this._getInt(computed.paddingRight),
      bottom: this._getInt(computed.paddingBottom),
      left: this._getInt(computed.paddingLeft),
    };
    return {
      box: {
        // element action area
        width: this._getInt(computed.width),
        height: this._getInt(computed.height),
      },
      paddings,
      offsetLeft: parentRect.left + this._getInt(computed.borderLeftWidth),
      offsetTop: parentRect.top + this._getInt(computed.borderTopWidth),
    };
  }

  getComputedElementPosition(): ComputedPosition {
    const computed = getComputedStyle(this.element);

    const margins = {
      top: this._getInt(computed.marginTop),
      right: this._getInt(computed.marginRight),
      bottom: this._getInt(computed.marginBottom),
      left: this._getInt(computed.marginLeft),
    };
    const borders = {
      top: this._getInt(computed.borderTopWidth),
      right: this._getInt(computed.borderRightWidth),
      bottom: this._getInt(computed.borderBottomWidth),
      left: this._getInt(computed.borderLeftWidth),
    };
    const paddings = {
      top: this._getInt(computed.paddingTop),
      right: this._getInt(computed.paddingRight),
      bottom: this._getInt(computed.paddingBottom),
      left: this._getInt(computed.paddingLeft),
    };
    const top = this._getInt(computed.top); // edge of visual bounds (including margins)
    const left = this._getInt(computed.left); // edge of visual bounds (including margins)
    const width = this._getInt(computed.width); // content width
    const height = this._getInt(computed.height); // content height

    const visualBounds = {
      width:
        width + borders.right + borders.left + paddings.right + paddings.left,
      height:
        height + borders.top + borders.bottom + paddings.top + paddings.bottom,
      left: left + margins.left,
      top: top + margins.top,
    };

    const fullWidth = visualBounds.width + margins.right + margins.left;
    const fullHeight = visualBounds.height + margins.top + margins.bottom;

    const fullBounds = {
      width: fullWidth,
      height: fullHeight,
      left,
      top,
      right: left + fullWidth,
      bottom: top + fullHeight,
    };

    return {
      width,
      height,
      visualBounds: {
        ...visualBounds,
        right: visualBounds.left + visualBounds.width,
        bottom: visualBounds.top + visualBounds.height,
      },
      fullBounds,
      margins,
      borders,
      paddings,
    };
  }

  onMouseOver = (e: MouseEvent, skipStack = false) => {
    if (
      this.over ||
      (Overdrag.activeInstance && Overdrag.activeInstance !== this)
    ) {
      return;
    }

    // perform stack ops at the start of call to preserve order of events
    if (!this.stack && !skipStack) {
      Overdrag.__ENGAGED_STACK__.at(-1)?.onMouseOut(e, true);
      Overdrag.__ENGAGED_STACK__.push(this);
    }

    this.setOverState(true);
    // initialize listeners, controls and positions
    this.element.addEventListener("mouseleave", this.onMouseOut);
    this.element.addEventListener("mousemove", this.onMouseMove);
    this.element.addEventListener("mousedown", this.onMouseDown);
  };

  onMouseOut = (e: MouseEvent, skipStack = false) => {
    if (!this.over) {
      return;
    }
    // remove listeners, controls and positions
    this.element.removeEventListener("mouseleave", this.onMouseOut);
    this.element.removeEventListener("mousemove", this.onMouseMove);
    this.element.removeEventListener("mousedown", this.onMouseDown);

    this.setOverState(false);
    this.resetControlPoints();

    // perform stack ops at the end of call to preserve order of events
    if (!this.stack && !skipStack) {
      Overdrag.__ENGAGED_STACK__.pop();
      Overdrag.__ENGAGED_STACK__.at(-1)?.onMouseOver(e, true);
    }
  };

  onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    // remove all listeners,
    this.element.removeEventListener("mouseleave", this.onMouseOut);
    this.element.removeEventListener("mousemove", this.onMouseMove);
    this.element.removeEventListener("mousedown", this.onMouseDown);
    this.element.removeEventListener("mouseenter", this.onMouseOver);

    this.down = true;
    Overdrag.activeInstance = this;
    // deep copy
    this.downPosition = {
      ...this.position,
      fullBounds: { ...this.position.fullBounds },
      borders: { ...this.position.borders },
      margins: { ...this.position.margins },
      paddings: { ...this.position.paddings },
      visualBounds: { ...this.position.visualBounds },
    };
    // distance from edge of parent padding to element edge (does not include element margins)
    this.offsetX = this.parentMouseX - this.position.visualBounds.left;
    this.offsetY = this.parentMouseY - this.position.visualBounds.top;

    this.downMouseX = this.parentMouseX;
    this.downMouseY = this.parentMouseY;
    this.dragging = !this.controlsActive;
    this.resizing = this.controlsActive;
    this.element.setAttribute(Overdrag.ATTRIBUTES.DOWN, "");
    if (this.dragging) {
      this.element.setAttribute(Overdrag.ATTRIBUTES.DRAG, "");
    }
    this.emit(Overdrag.EVENTS.DOWN, this);
    // add global listeners
    this.window.addEventListener("mousemove", this.onMouseMove);
    this.window.addEventListener("mouseup", this.onMouseUp);
  };

  onMouseUp = (e: MouseEvent) => {
    // remove up listeners
    this.window.removeEventListener("mouseup", this.onMouseUp);
    this.window.removeEventListener("mousemove", this.onMouseMove);

    this.element.addEventListener("mouseleave", this.onMouseOut);
    this.element.addEventListener("mousemove", this.onMouseMove);
    this.element.addEventListener("mousedown", this.onMouseDown);
    this.element.addEventListener("mouseenter", this.onMouseOver);

    e.preventDefault();
    Overdrag.activeInstance = null;
    this.down = false;
    this.dragging = false;
    this.element.removeAttribute(Overdrag.ATTRIBUTES.DOWN);
    this.element.removeAttribute(Overdrag.ATTRIBUTES.DRAG);
    this.element.removeAttribute(Overdrag.ATTRIBUTES.RESIZE);
    this.emit(Overdrag.EVENTS.UP, this);
    if (this.isClick()) {
      this.emit(Overdrag.EVENTS.CLICK, this);
    }
  };

  onMouseMove = (e: MouseEvent) => {
    this.parentPosition = this.getComputedParentPosition();
    this.position = this.getComputedElementPosition();

    this.parentMouseX = e.clientX - this.parentPosition.offsetLeft;
    this.parentMouseY = e.clientY - this.parentPosition.offsetTop;

    if (!this.down) {
      this.updateControlPointsState();
      this.updateCursorStyle();
    } else if (this.dragging) {
      this.drag();
    } else {
      this.reSize();
    }
  };

  isClick() {
    return (
      Math.abs(this.parentMouseX - this.downMouseX) <
        this.clickDetectionThreshold &&
      Math.abs(this.parentMouseY - this.downMouseY) <
        this.clickDetectionThreshold
    );
  }

  isControlPointActive() {
    return (
      this.over &&
      (this.controls.left ||
        this.controls.right ||
        this.controls.top ||
        this.controls.bottom)
    );
  }

  setOverState(over: boolean) {
    this.over = over;
    if (over) {
      this.element.setAttribute(Overdrag.ATTRIBUTES.OVER, "");
      this.emit(Overdrag.EVENTS.OVER, this);
    } else {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.OVER);
      this.emit(Overdrag.EVENTS.OUT, this);
    }
  }

  resetControlPoints() {
    const current = this.controlsActive;
    this.controlsActive =
      this.controls.left =
      this.controls.right =
      this.controls.top =
      this.controls.bottom =
        false;

    if (current !== this.controlsActive) {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.CONTROLS);
      this.emit(Overdrag.EVENTS.CONTROLS_INACTIVE, this);
    }
  }

  /**
   * Sets control points activation status (Edge of element)
   */
  updateControlPointsState() {
    const current = JSON.stringify(this.controls);
    const inYBounds =
      this.parentMouseY >= this.position.visualBounds.top &&
      this.parentMouseY <= this.position.visualBounds.bottom;
    const inXBounds =
      this.parentMouseX >= this.position.visualBounds.left &&
      this.parentMouseX <= this.position.visualBounds.right;

    const left = this.parentMouseX - this.position.visualBounds.left;
    const right = this.position.visualBounds.right - this.parentMouseX;
    const top = this.parentMouseY - this.position.visualBounds.top;
    const bottom = this.position.visualBounds.bottom - this.parentMouseY;
    this.controls.left =
      inYBounds && left >= 0 && left <= this.controlsThreshold;
    this.controls.right =
      inYBounds && right >= 0 && right <= this.controlsThreshold;
    this.controls.top = inXBounds && top >= 0 && top <= this.controlsThreshold;
    this.controls.bottom =
      inXBounds && bottom >= 0 && bottom <= this.controlsThreshold;

    const controlsActive =
      this.controls.left ||
      this.controls.right ||
      this.controls.top ||
      this.controls.bottom;

    if (controlsActive && current !== JSON.stringify(this.controls)) {
      this.controlsActive = true;
      this.element.setAttribute(
        Overdrag.ATTRIBUTES.CONTROLS,
        Object.keys(this.controls)
          .filter((key) => this.controls[key as keyof Controls])
          .join("-")
      );
      this.emit(Overdrag.EVENTS.CONTROLS_ACTIVE, this);
    } else if (!controlsActive) {
      this.resetControlPoints();
    }
  }

  updateCursorStyle() {
    let cursor: null | string = null;

    if (this.controls.top && this.controls.left) {
      cursor = Overdrag.CURSOR.LEFT_TOP;
    } else if (this.controls.bottom && this.controls.right) {
      cursor = Overdrag.CURSOR.RIGHT_BOTTOM;
    } else if (this.controls.bottom && this.controls.left) {
      cursor = Overdrag.CURSOR.LEFT_BOTTOM;
    } else if (this.controls.top && this.controls.right) {
      cursor = Overdrag.CURSOR.RIGHT_TOP;
    } else if (this.controls.top) {
      cursor = Overdrag.CURSOR.TOP;
    } else if (this.controls.bottom) {
      cursor = Overdrag.CURSOR.BOTTOM;
    } else if (this.controls.left) {
      cursor = Overdrag.CURSOR.LEFT;
    } else if (this.controls.right) {
      cursor = Overdrag.CURSOR.RIGHT;
    } else if (this.over) {
      cursor = Overdrag.CURSOR.OVER;
    }

    this.element.style.setProperty("cursor", cursor);
  }

  reSize() {
    let changed = false;
    if (this.controls.top) {
      changed = this.movePointTop() || changed;
    }
    if (this.controls.bottom) {
      changed = this.movePointBottom() || changed;
    }
    if (this.controls.left) {
      changed = this.movePointLeft() || changed;
    }
    if (this.controls.right) {
      changed = this.movePointRight() || changed;
    }

    if (changed) {
      this.emit(Overdrag.EVENTS.RESIZE, this);
      this.element.setAttribute(
        Overdrag.ATTRIBUTES.RESIZE,
        Object.keys(this.controls)
          .filter((key) => this.controls[key as keyof Controls])
          .join("-")
      );
    }
  }

  assignPosition(position: Partial<Position>) {
    const current = {
      top: this.position.visualBounds.top,
      left: this.position.visualBounds.left,
      width: this.position.width,
      height: this.position.height,
      ...position,
    };
    // enable precision to avoid deviation when resizing or dragging be reassigning the position to new state
    this.position = {
      ...this.position,
      visualBounds: {
        ...this.position.visualBounds,
        top: current.top,
        left: current.left,
      },
      width: current.width,
      height: current.height,
    };

    this.element.style.left = `${current.left}px`;
    this.element.style.top = `${current.top}px`;
    this.element.style.width = `${current.width}px`;
    this.element.style.height = `${current.height}px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${current.width}`);
    this.element.setAttribute("height", `${current.height}`);
  }

  private movePointRight() {
    // ensure the element full box never goes outside of the parent
    const maxWidth =
      this.parentPosition.box.width -
      this.position.visualBounds.left +
      this.parentPosition.paddings.right;
    const boxDiff = this.position.fullBounds.width - this.position.width;
    // ensure to account for the minimum content width in the context of a full box
    const minWidth =
      this.minContentWidth +
      // add difference between full box and box to account for paddings, borders and margins
      boxDiff;
    // ensure the element never goes below the minimum width
    let width = Math.max(
      minWidth,
      Math.min(
        // track the mouse position and set width accordingly
        this.parentMouseX -
          this.downPosition.visualBounds.left +
          // add a difference of mouse position relative to the element
          (this.downPosition.fullBounds.width - this.offsetX),
        maxWidth
      )
    );

    // snap to the parent right edge if within the threshold
    width = width >= maxWidth - this.snapThreshold ? maxWidth : width;
    // actual width of the element
    width = width - boxDiff;
    if (width !== this.position.width) {
      this.assignPosition({ width });
      this.emit(Overdrag.EVENTS.CONTROL_RIGHT_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointBottom() {
    // ensure the element never goes outside of the parent
    const maxHeight =
      this.parentPosition.box.height -
      this.position.visualBounds.top +
      this.parentPosition.paddings.bottom;
    const boxDiff = this.position.fullBounds.height - this.position.height;
    // ensure to account for the minimum content height in the context of a full box
    const minHeight =
      this.minContentHeight +
      // add difference between full box and box to account for paddings, borders and margins
      boxDiff;
    // ensure the element never goes below the minimum width
    let height = Math.max(
      minHeight,
      Math.min(
        // track the mouse position and set width accordingly
        this.parentMouseY -
          this.downPosition.visualBounds.top +
          // add a difference of mouse position relative to the element
          (this.downPosition.fullBounds.height - this.offsetY),
        maxHeight
      )
    );
    // snap to the parent right edge if within the threshold
    height = height >= maxHeight - this.snapThreshold ? maxHeight : height;
    // actual height of the element
    height = height - boxDiff;
    if (height !== this.position.height) {
      this.assignPosition({ height });
      this.emit(Overdrag.EVENTS.CONTROL_BOTTOM_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointLeft() {
    const boxDiff = this.position.fullBounds.width - this.position.width;
    const minWidth = this.minContentWidth + boxDiff;
    let left = Math.max(
      this.parentPosition.paddings.left,
      Math.min(
        // track the mouse position and set left accordingly
        this.parentMouseX - this.offsetX,
        // max left, otherwise we'll push the element to the right
        this.downPosition.visualBounds.right - minWidth
      )
    );
    // snap to the parent left edge if within the threshold
    left =
      left < this.snapThreshold + this.parentPosition.paddings.left
        ? this.parentPosition.paddings.left
        : left;
    // update width accordingly
    const width =
      Math.max(minWidth, this.downPosition.visualBounds.right - left) - boxDiff;

    if (left !== this.position.visualBounds.left) {
      this.assignPosition({ width, left });
      this.emit(Overdrag.EVENTS.CONTROL_LEFT_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointTop() {
    const boxDiff = this.position.fullBounds.height - this.position.height;
    const minHeight = this.minContentHeight + boxDiff;
    let top = Math.max(
      this.parentPosition.paddings.top,
      Math.min(
        // track the mouse position and set top accordingly
        this.parentMouseY - this.offsetY,
        // max top, otherwise we'll push the element to the right
        this.downPosition.visualBounds.bottom - minHeight
      )
    );
    // snap to the parent top edge if within the threshold
    top =
      top < this.snapThreshold + this.parentPosition.paddings.top
        ? this.parentPosition.paddings.top
        : top;
    // update height accordingly
    const height =
      Math.max(minHeight, this.downPosition.visualBounds.bottom - top) -
      boxDiff;

    if (top !== this.position.visualBounds.top) {
      this.assignPosition({ height, top });
      this.emit(Overdrag.EVENTS.CONTROL_TOP_UPDATE, this);
      return true;
    }
    return false;
  }

  /**
   * Move element by mouse position
   * and snap to the edges of the parent element
   * if mouse is close enough to the edge of the parent element (snapThreshold)
   */
  private drag() {
    // edge of element relative to parent according to current mouse position (includes margins, borders and paddings )
    let left = this.parentMouseX - this.offsetX;
    let top = this.parentMouseY - this.offsetY;

    // snap to the edges of the window
    left =
      left <= this.snapThreshold + this.parentPosition.paddings.left
        ? this.parentPosition.paddings.left
        : left + this.position.fullBounds.width >=
          this.parentPosition.paddings.left +
            this.parentPosition.box.width -
            this.snapThreshold
        ? this.parentPosition.paddings.left +
          this.parentPosition.box.width -
          this.position.fullBounds.width
        : left;

    // snap to the edges of the window
    top =
      top <= this.snapThreshold + this.parentPosition.paddings.top
        ? this.parentPosition.paddings.top
        : top + this.position.fullBounds.height >=
          this.parentPosition.paddings.top +
            this.parentPosition.box.height -
            this.snapThreshold
        ? this.parentPosition.paddings.top +
          this.parentPosition.box.height -
          this.position.fullBounds.height
        : top;

    if (
      this.position.visualBounds.right !== left ||
      this.position.visualBounds.top !== top
    ) {
      this.assignPosition({ left, top });
      this.element.setAttribute(Overdrag.ATTRIBUTES.DRAG, "");
      this.emit(Overdrag.EVENTS.DRAG, this);
    }
  }
}
