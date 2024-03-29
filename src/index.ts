import EventEmitter from "eventemitter3";

type Complete<T> = {
  [P in keyof T]-?: T[P];
};

export interface ControlProps {
  /** min height of DOM element in PX. This will prevent resizing smaller than the value. */
  minContentHeight?: number;
  /** min width of DOM element in PX. This will prevent resizing smaller than the value. */
  minContentWidth?: number;
  /** max height of DOM element in PX. This will prevent resizing larger than the value. */
  maxContentWidth?: number;
  /** max width of DOM element in PX. This will prevent resizing larger than the value. */
  maxContentHeight?: number;
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
  /** if true, parent padding is not treated as available space. Motion ove element will be restricted to parent paddings */
  excludePadding?: boolean;
}

export type Defaults = Complete<Omit<ControlProps, "element">>;

// union of all events
export const Events = {
  /** Triggered when the mouse button is pressed down on the element. */
  DOWN: "down",
  /**  Triggered when the mouse button is released if pressed while element was "engaged". */
  UP: "up",
  /** Triggered when a click action is detected. */
  CLICK: "click",
  /** Triggered during dragging, on every drag motion with a mouse move. */
  DRAG: "drag",
  /** Triggered when the mouse button is pressed down on the element, but not control points. */
  DRAG_START: "dragStart",
  /** Triggered when the mouse button is released after dragging. */
  DRAG_END: "dragEnd",
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
  /** Triggered when resizing starts. */
  RESIZE_START: "resizeStart",
  /** Triggered when resizing ends. */
  RESIZE_END: "resizeEnd",
  /** Triggered on any update to the element (any emitted event will be preceded by update event). */
  UPDATE: "update",
} as const;

// union of all cursors
export const Cursors = {
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
} as const;

// union of all attributes
export const Attributes = {
  /** Set while any control point is active with a value of active control, Ex: `data-overdrag-controls="right-left"` */
  CONTROLS: "data-overdrag-controls",
  /** Set while mouse is over the element pass the control sensors. */
  OVER: "data-overdrag-over",
  /** Set while mouse is down (preceded by `over` conditions). */
  DOWN: "data-overdrag-down",
  /**  Set while element is dragged. */
  DRAG: "data-overdrag-dragging",
  /** Set while element is in a drag mode (mouse down pass control points) */
  DRAG_MODE: "data-overdrag-drag-mode",
  /**  Set while element is being resized. */
  RESIZE: "data-overdrag-resizing",
  /** Set when resize mode initiated. */
  RESIZE_MODE: "data-overdrag-resize-mode",
} as const;

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
  actionBounds: Bounds;
  offsetLeft: number;
  offsetTop: number;
};

export type ComputedPosition = {
  visualBounds: Bounds;
  fullBounds: Bounds;
  width: number;
  height: number;
  margins: Rect;
  borders: Rect;
  paddings: Rect;
  verticalDiff: number;
  horizontalDiff: number;
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
    snapThreshold: 16,
    controlsThreshold: 16,
    minContentHeight: 50,
    minContentWidth: 50,
    maxContentWidth: Infinity,
    maxContentHeight: Infinity,
    clickDetectionThreshold: 5,
    stack: false,
    excludePadding: false,
  };
  static readonly ATTRIBUTES = Attributes;
  static CURSOR = Cursors;
  static readonly EVENTS = Events;
  static activeInstance: Overdrag | null = null;
  readonly window = window;
  readonly element: HTMLElement;
  readonly parentElement: HTMLElement;
  readonly noBoundsCache = { top: 0, right: 0, bottom: 0, left: 0 };
  snapThreshold: number;
  controlsThreshold: number;
  minContentHeight: number;
  minContentWidth: number;
  maxContentWidth: number;
  maxContentHeight: number;
  clickDetectionThreshold: number;

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
  parentMouseX = 0;
  /** current mouse position relative to parent */
  parentMouseY = 0;
  /** coordinate at mouse Down event */
  offsetX = 0;
  /** coordinate at mouse Down event */
  offsetY = 0;
  /** Element rect on last mouse move event */
  position: ComputedPosition;
  /** Element rect on last mouse down event */
  downPosition: ComputedPosition;
  /** Parent element styles and positions */
  parentPosition: ParentPosition;
  /** Flag to opt in for stacked recursive child nodes to prevent its parent from being inactive */
  stack: boolean;
  /** Flag to opt in for parent padding box to be included in calculations */
  excludePadding: boolean;
  /** Control points activation status (Edge of element) */
  readonly controls: Controls = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };

  downMouseX = 0;
  downMouseY = 0;

  constructor({
    element,
    minContentHeight = Overdrag.DEFAULTS.minContentHeight,
    minContentWidth = Overdrag.DEFAULTS.minContentWidth,
    maxContentWidth = Overdrag.DEFAULTS.maxContentWidth,
    maxContentHeight = Overdrag.DEFAULTS.maxContentHeight,
    snapThreshold = Overdrag.DEFAULTS.snapThreshold,
    controlsThreshold = Overdrag.DEFAULTS.controlsThreshold,
    clickDetectionThreshold = Overdrag.DEFAULTS.clickDetectionThreshold,
    stack = Overdrag.DEFAULTS.stack,
    excludePadding = Overdrag.DEFAULTS.excludePadding,
  }: ControlProps) {
    super();
    this.minContentHeight = minContentHeight;
    this.minContentWidth = minContentWidth;
    this.maxContentWidth = maxContentWidth;
    this.maxContentHeight = maxContentHeight;
    this.snapThreshold = snapThreshold;
    this.controlsThreshold = controlsThreshold;
    this.excludePadding = excludePadding;
    this.element = element;
    // ensure element is positioned
    this.element.style.position = "absolute";
    this.stack = stack;

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

    // set all element parameters
    this.assignInitialStyles();
  }

  private assignInitialStyles() {
    this.element.style.left = `${this.position.fullBounds.left}px`;
    this.element.style.top = `${this.position.fullBounds.top}px`;
    this.element.style.width = `${this.position.width}px`;
    this.element.style.height = `${this.position.height}px`;
    this.element.style.right = `${
      this.parentPosition.actionBounds.right - this.position.fullBounds.right
    }px`;
    this.element.style.bottom = `${
      this.parentPosition.actionBounds.bottom - this.position.fullBounds.bottom
    }px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${this.position.width}`);
    this.element.setAttribute("height", `${this.position.height}`);
  }

  private _getInt(value: string | null): number {
    return parseInt(value || "0");
  }

  emit(eventName: string | symbol, ...args: unknown[]): boolean {
    super.emit.apply(this, [Overdrag.EVENTS.UPDATE, this]);
    return super.emit.apply(this, [eventName, ...args]);
  }

  getComputedParentPosition(): ParentPosition {
    const parentRect = this.parentElement.getBoundingClientRect();
    const computed = getComputedStyle(this.parentElement);
    const paddings = this.excludePadding
      ? { top: 0, right: 0, bottom: 0, left: 0 }
      : {
          top: this._getInt(computed.paddingTop),
          right: this._getInt(computed.paddingRight),
          bottom: this._getInt(computed.paddingBottom),
          left: this._getInt(computed.paddingLeft),
        };
    // computed with and height do not include padding
    const width = this._getInt(computed.width);
    const height = this._getInt(computed.height);
    return {
      actionBounds: {
        // element action area
        top: paddings.top,
        left: paddings.left,
        right: width + paddings.left,
        bottom: height + paddings.top,
        // include padding to expand action area
        width: width + paddings.left + paddings.right,
        height: height + paddings.top + paddings.bottom,
      },
      offsetLeft: parentRect.left + this._getInt(computed.borderLeftWidth),
      offsetTop: parentRect.top + this._getInt(computed.borderTopWidth),
    };
  }

  getComputedElementPosition(): ComputedPosition {
    const computed = getComputedStyle(this.element);
    // support for MUI and other frameworks that use transform
    const fullBoxSizing = computed.boxSizing === "border-box";
    const margins = {
      top: this._getInt(computed.marginTop),
      right: this._getInt(computed.marginRight),
      bottom: this._getInt(computed.marginBottom),
      left: this._getInt(computed.marginLeft),
    };
    const borders = fullBoxSizing
      ? this.noBoundsCache
      : {
          top: this._getInt(computed.borderTopWidth),
          right: this._getInt(computed.borderRightWidth),
          bottom: this._getInt(computed.borderBottomWidth),
          left: this._getInt(computed.borderLeftWidth),
        };
    const paddings = fullBoxSizing
      ? this.noBoundsCache
      : {
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
        width +
        (fullBoxSizing
          ? 0
          : borders.right + borders.left + paddings.right + paddings.left),
      height:
        height +
        (fullBoxSizing
          ? 0
          : borders.top + borders.bottom + paddings.top + paddings.bottom),
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
      verticalDiff: fullHeight - height,
      horizontalDiff: fullWidth - width,
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

  destroy() {
    this.element.removeEventListener("mouseenter", this.onMouseOver);
    this.element.removeEventListener("mouseleave", this.onMouseOut);
    this.element.removeEventListener("mousemove", this.onMouseMove);
    this.element.removeEventListener("mousedown", this.onMouseDown);
    this.element.removeEventListener("mouseup", this.onMouseUp);
    this.removeAllListeners();
    this.element.__overdrag = undefined;
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

    const stacked = Overdrag.__ENGAGED_STACK__.at(-1);
    if (!skipStack && stacked && stacked !== this) {
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
    const stacked = Overdrag.__ENGAGED_STACK__.at(-1);
    if (stacked && stacked !== this) {
      return;
    }

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
    // distance from edge of parent padding to element edge (including element margins)
    this.offsetX = this.parentMouseX - this.position.fullBounds.left;
    this.offsetY = this.parentMouseY - this.position.fullBounds.top;

    this.downMouseX = this.parentMouseX;
    this.downMouseY = this.parentMouseY;
    this.dragging = !this.controlsActive;
    this.resizing = this.controlsActive;
    this.element.setAttribute(Overdrag.ATTRIBUTES.DOWN, "");
    this.emit(Overdrag.EVENTS.DOWN, this);

    if (this.dragging) {
      this.element.setAttribute(Overdrag.ATTRIBUTES.DRAG_MODE, "");
      this.emit(Overdrag.EVENTS.DRAG_START, this);
    } else if (this.resizing) {
      this.element.setAttribute(Overdrag.ATTRIBUTES.RESIZE_MODE, "");
      this.emit(Overdrag.EVENTS.RESIZE_START, this);
    }
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

    if (this.dragging) {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.DRAG_MODE);
      this.emit(Overdrag.EVENTS.DRAG_END, this);
    } else if (this.resizing) {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.RESIZE_MODE);
      this.emit(Overdrag.EVENTS.RESIZE_END, this);
    }

    this.dragging = false;
    this.resizing = false;
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
    // in case CSS has changed we need to update the position
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

    if (Overdrag.CURSOR.LEFT_TOP && this.controls.top && this.controls.left) {
      cursor = Overdrag.CURSOR.LEFT_TOP;
    } else if (
      Overdrag.CURSOR.RIGHT_BOTTOM &&
      this.controls.bottom &&
      this.controls.right
    ) {
      cursor = Overdrag.CURSOR.RIGHT_BOTTOM;
    } else if (
      Overdrag.CURSOR.LEFT_BOTTOM &&
      this.controls.bottom &&
      this.controls.left
    ) {
      cursor = Overdrag.CURSOR.LEFT_BOTTOM;
    } else if (
      Overdrag.CURSOR.RIGHT_TOP &&
      this.controls.top &&
      this.controls.right
    ) {
      cursor = Overdrag.CURSOR.RIGHT_TOP;
    } else if (Overdrag.CURSOR.TOP && this.controls.top) {
      cursor = Overdrag.CURSOR.TOP;
    } else if (Overdrag.CURSOR.BOTTOM && this.controls.bottom) {
      cursor = Overdrag.CURSOR.BOTTOM;
    } else if (Overdrag.CURSOR.LEFT && this.controls.left) {
      cursor = Overdrag.CURSOR.LEFT;
    } else if (Overdrag.CURSOR.RIGHT && this.controls.right) {
      cursor = Overdrag.CURSOR.RIGHT;
    } else if (Overdrag.CURSOR.OVER && this.over) {
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
      // sensor type can be derived from control points attributes currently active
      this.element.setAttribute(Overdrag.ATTRIBUTES.RESIZE, "");
      this.emit(Overdrag.EVENTS.RESIZE, this);
    }
  }

  private assignStyle(style: Partial<Position>) {
    const newStyle = {
      top: this.position.fullBounds.top,
      left: this.position.fullBounds.left,
      width: this.position.width,
      height: this.position.height,
      ...style,
    };

    this.element.style.left = `${newStyle.left}px`;
    this.element.style.top = `${newStyle.top}px`;
    this.element.style.width = `${newStyle.width}px`;
    this.element.style.height = `${newStyle.height}px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${newStyle.width}`);
    this.element.setAttribute("height", `${newStyle.height}`);
    this.position = this.getComputedElementPosition();

    this.element.style.right = `${
      this.parentPosition.actionBounds.right - this.position.fullBounds.right
    }px`;
    this.element.style.bottom = `${
      this.parentPosition.actionBounds.bottom - this.position.fullBounds.bottom
    }px`;
  }

  private movePointRight() {
    const width = Math.max(
      this.minContentWidth,
      Math.min(
        this.maxContentWidth,
        this.calcRight() -
          this.downPosition.fullBounds.left -
          this.position.horizontalDiff
      )
    );

    if (width !== this.position.width) {
      this.assignStyle({ width });
      this.emit(Overdrag.EVENTS.CONTROL_RIGHT_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointBottom() {
    const height = Math.max(
      this.minContentHeight,
      Math.min(
        this.maxContentHeight,
        this.calcBottom() -
          this.downPosition.fullBounds.top -
          this.position.verticalDiff
      )
    );

    if (height !== this.position.height) {
      this.assignStyle({ height });
      this.emit(Overdrag.EVENTS.CONTROL_BOTTOM_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointLeft() {
    const minWidth = this.minContentWidth + this.position.horizontalDiff;
    const maxWidth = this.maxContentWidth + this.position.horizontalDiff;

    const left = Math.min(
      Math.max(
        this.calcLeft(), // this will track mouse within action bounds of the parent
        this.downPosition.fullBounds.right - maxWidth // this will restrict the element from going above the maximum width
      ),
      this.downPosition.fullBounds.right - minWidth // this will restrict the element from going below the minimum width
    );

    // determine the width of the element according to the left position
    const width =
      this.downPosition.fullBounds.right - left - this.position.horizontalDiff;

    if (left !== this.position.fullBounds.left) {
      this.assignStyle({ width, left });
      this.emit(Overdrag.EVENTS.CONTROL_LEFT_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointTop() {
    const minHeight = this.minContentHeight + this.position.verticalDiff;
    const maxHeight = this.maxContentHeight + this.position.verticalDiff;

    const top = Math.min(
      Math.max(
        this.calcTop(), // this will track mouse within action bounds of the parent
        this.downPosition.fullBounds.bottom - maxHeight // this will restrict the element from going above the maximum height
      ),
      this.downPosition.fullBounds.bottom - minHeight // this will restrict the element from going below the minimum height
    );

    // determine the height of the element according to the top position
    const height =
      this.downPosition.fullBounds.bottom - top - this.position.verticalDiff;

    if (top !== this.position.fullBounds.top) {
      this.assignStyle({ height, top });
      this.emit(Overdrag.EVENTS.CONTROL_TOP_UPDATE, this);
      return true;
    }
    return false;
  }

  private calcRight(): number {
    let right =
      this.parentMouseX - this.offsetX + this.downPosition.fullBounds.width;
    // snap to the edges of the window
    right =
      // check left side of element snapping threshold
      right + this.snapThreshold >= this.parentPosition.actionBounds.right
        ? // snap to the left edge of the parent
          this.parentPosition.actionBounds.right
        : // check right side of element snapping threshold
          right;
    return right;
  }

  private calcBottom(): number {
    let bottom =
      this.parentMouseY - this.offsetY + this.downPosition.fullBounds.height;
    // snap to the edges of the window
    bottom =
      // check top side of element snapping threshold
      bottom + this.snapThreshold >= this.parentPosition.actionBounds.bottom
        ? // snap to the top edge of the parent
          this.parentPosition.actionBounds.bottom
        : // check bottom side of element snapping threshold
          bottom;
    return bottom;
  }

  private calcLeft(): number {
    const x = this.parentMouseX - this.offsetX;

    // snap to the edges of the window
    const left =
      // check left side of element snapping threshold
      x - this.snapThreshold <= this.parentPosition.actionBounds.left
        ? // snap to the left edge of the parent
          this.parentPosition.actionBounds.left
        : // otherwise, use the current mouse position
          x;

    return left;
  }

  private calcTop(): number {
    const y = this.parentMouseY - this.offsetY;
    // snap to the edges of the window
    const top =
      // check top side of element snapping threshold
      y - this.snapThreshold <= this.parentPosition.actionBounds.top
        ? // snap to the top edge of the parent
          this.parentPosition.actionBounds.top
        : // otherwise, use the current mouse position
          y;

    return top;
  }
  /**
   * Move element by mouse position
   * and snap to the edges of the parent element
   * if mouse is close enough to the edge of the parent element (snapThreshold)
   */
  private drag() {
    const x = this.calcLeft();
    const y = this.calcTop();
    const top =
      // check bottom side of element snapping threshold
      y + this.position.fullBounds.height + this.snapThreshold >=
      this.parentPosition.actionBounds.bottom
        ? // snap to the bottom edge of the parent
          this.parentPosition.actionBounds.bottom -
          this.position.fullBounds.height
        : // otherwise, use the current mouse position
          y;

    const left =
      // check right side of element snapping threshold
      x + this.position.fullBounds.width + this.snapThreshold >=
      this.parentPosition.actionBounds.right
        ? // snap to the right edge of the parent
          this.parentPosition.actionBounds.right -
          this.position.fullBounds.width
        : // otherwise, use the current mouse position
          x;

    if (
      this.position.fullBounds.left !== left ||
      this.position.fullBounds.top !== top
    ) {
      this.assignStyle({ left, top });
      this.element.setAttribute(Overdrag.ATTRIBUTES.DRAG, "");
      this.emit(Overdrag.EVENTS.DRAG, this);
    }
  }
}
