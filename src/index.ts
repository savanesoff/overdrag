import EventEmitter from "eventemitter3";

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

  clickDetectionThreshold?: number;
}

type Box = {
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
  rect: Rect;
  box: Box;
  fullBox: Box;
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
    NO_PARENT:
      "Element must have an offset parent with position relative or absolute)",
  };
  static readonly DEFAULTS = {
    snapThreshold: 16, // 1rem
    controlsThreshold: 16, //1rem
    minContentHeight: 50,
    minContentWidth: 50,
    clickDetectionThreshold: 5,
  };
  static readonly ATTRIBUTES = {
    /** Set while any control point is active with a value of active control, Ex: `data-overdrag-controls="right-left"` */
    CONTROLS: "data-overdrag-controls",
    /** Set while element is engaged. */
    ENGAGED: "data-overdrag-engaged",
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
    TOP_LEFT: "nw-resize",
    /** Set while TOP and RIGHT control sensors are activated (including sensitivity area). */
    TOP_RIGHT: "ne-resize",
    /** Set while BOTTOM and LEFT control sensors are activated (including sensitivity area). */
    BOTTOM_LEFT: "sw-resize",
    /** Set while BOTTOM and RIGHT control sensors are activated (including sensitivity area). */
    BOTTOM_RIGHT: "se-resize",
    /** Set while mouse is over the element pass the control sensors. */
    OVER: "grab",
    /** Set while no interactions are detected. */
    DEFAULT: "default",
  };
  static readonly EVENTS = {
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
    /** Triggered when the element is engaged at visible box including controls sensors sensitivity threshold (active for dragging/resizing). */
    ENGAGED: "engaged",
    /** Triggered when the element is disengaged (inactive for dragging/resizing) or mouse is outside control sensitive distance. */
    DISENGAGED: "disengaged",
    /** Triggered when the control points are activated (edge of element) within control sensor area. */
    CONTROLS_ACTIVE: "controls-active",
    /** Triggered when the control points are deactivated. */
    CONTROLS_INACTIVE: "controls-inactive",
    /** Triggered when the right control point position is updated. */
    CONTROL_RIGHT_UPDATE: "control-right-update",
    /** Triggered when the left control point position is updated. */
    CONTROL_LEFT_UPDATE: "control-left-update",
    /** Triggered when the top control point position is updated. */
    CONTROL_TOP_UPDATE: "control-top-update",
    /** Triggered when the bottom control point position is updated. */
    CONTROL_BOTTOM_UPDATE: "control-bottom-update",
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

  engaged = false;
  /** Control points activation status (Edge of element) */
  controlsActive = false;
  /** Mouse over element status */
  over = false;
  /** Drag mode status */
  dragging = false;
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
  parentPosition: ParentPosition;
  computed = false;

  cursorSet = false;
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
  }: ControlProps) {
    super();
    this.minContentHeight = minContentHeight;
    this.minContentWidth = minContentWidth;
    this.snapThreshold = snapThreshold;
    this.controlsThreshold = controlsThreshold;
    this.element = element;
    this.clickDetectionThreshold = clickDetectionThreshold;

    if (!this.element.offsetParent) {
      throw new Error(Overdrag.ERROR.NO_PARENT);
    }

    this.parentElement = this.element.offsetParent as HTMLElement;

    this.position = this.downPosition = this.getComputedElementPosition();
    this.parentPosition = this.getComputedParentPosition();
    this.window.addEventListener("mousemove", this.onMove);
    this.window.addEventListener("mousedown", this.onDown);
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
    return {
      box: {
        width: this._getInt(computed.width),
        height: this._getInt(computed.height),
      },
      paddings: {
        left: this._getInt(computed.paddingLeft),
        right: this._getInt(computed.paddingRight),
        top: this._getInt(computed.paddingTop),
        bottom: this._getInt(computed.paddingBottom),
      },
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
    const fullWidth =
      width +
      borders.right +
      borders.left +
      paddings.right +
      paddings.left +
      margins.right +
      margins.left;

    const fullHeight =
      height +
      borders.top +
      borders.bottom +
      paddings.top +
      paddings.bottom +
      margins.top +
      margins.bottom;

    return {
      rect: {
        // visual bounds, which includes margins
        top,
        left,
        right: left + fullWidth,
        bottom: top + fullHeight,
      },
      box: { width, height },
      fullBox: {
        width: fullWidth,
        height: fullHeight,
      },
      margins,
      borders,
      paddings,
    };
  }

  onMove = (e: MouseEvent) => {
    if (Overdrag.activeInstance != null && Overdrag.activeInstance != this) {
      // another instance is active, ignore this event
      return;
    }

    if (this.computed) {
      return;
    }

    this.computed = true;
    setTimeout(() => {
      this.computed = false;
    }, 50);

    this.parentPosition = this.getComputedParentPosition();
    // update rect only when mouse is down
    this.position = this.getComputedElementPosition();

    this.parentMouseX = e.pageX - this.parentPosition.offsetLeft;
    this.parentMouseY = e.pageY - this.parentPosition.offsetTop;
    console.log(e.target);

    if (this.down) {
      if (this.dragging) {
        this.drag();
      } else {
        this.reSize();
      }
    } else {
      let engaged = this.isEngaged();
      // ensure recursive engagements excludes multiple instance of overdrag being engaged at the same time
      // if engaged for the first time, add to the array
      if (
        engaged &&
        !this.engaged &&
        Overdrag.__ENGAGED_STACK__.indexOf(this) < 0
      ) {
        Overdrag.__ENGAGED_STACK__.push(this);
      }
      // if engaged and not the last engaged, disengage
      else if (
        engaged &&
        Overdrag.__ENGAGED_STACK__.length > 0 &&
        Overdrag.__ENGAGED_STACK__.at(-1) != this
      ) {
        engaged = false;
      }
      // if not engaged and last engaged is this instance remove it from the array
      else if (!engaged && Overdrag.__ENGAGED_STACK__.at(-1) === this) {
        Overdrag.__ENGAGED_STACK__.pop();
      }

      if (engaged || this.engaged) {
        this.setEngagedState(engaged);
        this.updateControlPointsState();
        this.setOverState(this.isOver());
        this.updateCursorStyle();
      }
    }
  };

  onDown = (e: MouseEvent) => {
    if (!this.engaged) {
      return;
    }
    e.preventDefault();
    Overdrag.activeInstance = this;
    this.down = true;
    // deep copy
    this.downPosition = {
      box: { ...this.position.box },
      fullBox: { ...this.position.fullBox },
      rect: { ...this.position.rect },
      borders: { ...this.position.borders },
      margins: { ...this.position.margins },
      paddings: { ...this.position.paddings },
    };
    // distance from edge of margin to the mouse position
    this.offsetX = this.parentMouseX - this.position.rect.left;
    this.offsetY = this.parentMouseY - this.position.rect.top;

    this.downMouseX = this.parentMouseX;
    this.downMouseY = this.parentMouseY;
    this.dragging = this.over;
    this.window.addEventListener("mouseup", this.onUp);
    this.element.setAttribute(Overdrag.ATTRIBUTES.DOWN, "");
    this.emit(Overdrag.EVENTS.DOWN, this);
  };

  onUp = (e: MouseEvent) => {
    e.preventDefault();
    Overdrag.activeInstance = null;
    this.down = false;
    this.dragging = false;
    this.window.removeEventListener("mouseup", this.onUp);
    this.element.removeAttribute(Overdrag.ATTRIBUTES.DOWN);
    this.element.removeAttribute(Overdrag.ATTRIBUTES.DRAG);
    this.element.removeAttribute(Overdrag.ATTRIBUTES.RESIZE);
    this.emit(Overdrag.EVENTS.UP, this);
    if (this.isClick()) {
      this.emit(Overdrag.EVENTS.CLICK, this);
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
      this.engaged &&
      (this.controls.left ||
        this.controls.right ||
        this.controls.top ||
        this.controls.bottom)
    );
  }

  /**
   * Whether the mouse is over the element
   */
  isEngaged() {
    return (
      this.parentMouseX >=
        this.position.rect.left +
          this.position.margins.left -
          this.controlsThreshold &&
      this.parentMouseX <=
        this.position.rect.right -
          this.position.margins.right +
          this.controlsThreshold &&
      this.parentMouseY >=
        this.position.rect.top +
          this.position.margins.top -
          this.controlsThreshold &&
      this.parentMouseY <=
        this.position.rect.bottom -
          this.position.margins.bottom +
          this.controlsThreshold
    );
  }

  isOver() {
    return (
      this.engaged &&
      this.parentMouseX >
        this.position.rect.left +
          this.position.margins.left +
          this.controlsThreshold &&
      this.parentMouseX <
        this.position.rect.right -
          this.position.margins.right -
          this.controlsThreshold &&
      this.parentMouseY >
        this.position.rect.top +
          this.position.margins.top +
          this.controlsThreshold &&
      this.parentMouseY <
        this.position.rect.bottom -
          this.position.margins.bottom -
          this.controlsThreshold
    );
  }

  setEngagedState(engaged: boolean) {
    this.engaged = engaged;
    if (engaged) {
      this.element.setAttribute(Overdrag.ATTRIBUTES.ENGAGED, "");
      this.emit(Overdrag.EVENTS.ENGAGED, this);
    } else {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.ENGAGED);
      this.emit(Overdrag.EVENTS.DISENGAGED, this);
    }
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
        Math.abs(
          this.parentMouseX -
            this.position.rect.left -
            this.position.margins.left
        ) <= this.controlsThreshold;
      this.controls.right =
        Math.abs(
          this.parentMouseX -
            this.position.rect.right +
            this.position.margins.right
        ) <= this.controlsThreshold;
      this.controls.top =
        Math.abs(
          this.parentMouseY - this.position.rect.top - this.position.margins.top
        ) <= this.controlsThreshold;
      this.controls.bottom =
        Math.abs(
          this.parentMouseY -
            this.position.rect.bottom +
            this.position.margins.bottom
        ) <= this.controlsThreshold;
    }

    this.controlsActive = this.isControlPointActive();

    if (this.controlsActive) {
      this.element.setAttribute(
        Overdrag.ATTRIBUTES.CONTROLS,
        Object.keys(this.controls)
          .filter((key) => this.controls[key as keyof Controls])
          .join("-")
      );
    } else {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.CONTROLS);
    }

    if (current != JSON.stringify(this.controls)) {
      if (this.controlsActive) this.emit(Overdrag.EVENTS.CONTROLS_ACTIVE, this);
      else this.emit(Overdrag.EVENTS.CONTROLS_INACTIVE, this);
    }
  }

  updateCursorStyle() {
    let cursor: null | string = null;
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
      top: this.position.rect.top,
      left: this.position.rect.left,
      width: this.position.box.width,
      height: this.position.box.height,
      ...position,
    };
    // enable precision to avoid deviation when resizing or dragging be reassigning the position to new state
    this.position = {
      ...this.position,
      rect: { ...this.position.rect, top: current.top, left: current.left },
      box: {
        ...this.position.box,
        width: current.width,
        height: current.height,
      },
    };

    this.element.style.left = `${current.left}px`;
    this.element.style.top = `${current.top}px`;
    this.element.style.width = `${current.width}px`;
    this.element.style.height = `${current.height}px`;
    // for iframe, images and canvas
    this.element.setAttribute("width", `${current.width}px`);
    this.element.setAttribute("height", `${current.height}px`);
  }

  movePointRight() {
    // ensure the element full box never goes outside of the parent
    const maxWidth =
      this.parentPosition.box.width -
      this.position.rect.left +
      this.parentPosition.paddings.right;
    const boxDiff = this.position.fullBox.width - this.position.box.width;
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
          this.downPosition.rect.left +
          // add a difference of mouse position relative to the element
          (this.downPosition.fullBox.width - this.offsetX),
        maxWidth
      )
    );

    // snap to the parent right edge if within the threshold
    width = width >= maxWidth - this.snapThreshold ? maxWidth : width;
    // actual width of the element
    width = width - boxDiff;
    if (width !== this.position.box.width) {
      this.assignPosition({ width });
      this.emit(Overdrag.EVENTS.CONTROL_RIGHT_UPDATE, this);
      return true;
    }
    return false;
  }

  movePointBottom() {
    // ensure the element never goes outside of the parent
    const maxHeight =
      this.parentPosition.box.height -
      this.position.rect.top +
      this.parentPosition.paddings.bottom;
    const boxDiff = this.position.fullBox.height - this.position.box.height;
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
          this.downPosition.rect.top +
          // add a difference of mouse position relative to the element
          (this.downPosition.fullBox.height - this.offsetY),
        maxHeight
      )
    );
    // snap to the parent right edge if within the threshold
    height = height >= maxHeight - this.snapThreshold ? maxHeight : height;
    // actual height of the element
    height = height - boxDiff;
    if (height !== this.position.box.height) {
      this.assignPosition({ height });
      this.emit(Overdrag.EVENTS.CONTROL_BOTTOM_UPDATE, this);
      return true;
    }
    return false;
  }

  movePointLeft() {
    const boxDiff = this.position.fullBox.width - this.position.box.width;
    const minWidth = this.minContentWidth + boxDiff;
    let left = Math.max(
      this.parentPosition.paddings.left,
      Math.min(
        // track the mouse position and set left accordingly
        this.parentMouseX - this.offsetX,
        // max left, otherwise we'll push the element to the right
        this.downPosition.rect.right - minWidth
      )
    );
    // snap to the parent left edge if within the threshold
    left =
      left < this.snapThreshold + this.parentPosition.paddings.left
        ? this.parentPosition.paddings.left
        : left;
    // update width accordingly
    const width =
      Math.max(minWidth, this.downPosition.rect.right - left) - boxDiff;

    if (left !== this.position.rect.left) {
      this.assignPosition({ width, left });
      this.emit(Overdrag.EVENTS.CONTROL_LEFT_UPDATE, this);
      return true;
    }
    return false;
  }

  private movePointTop() {
    const boxDiff = this.position.fullBox.height - this.position.box.height;
    const minHeight = this.minContentHeight + boxDiff;
    let top = Math.max(
      this.parentPosition.paddings.top,
      Math.min(
        // track the mouse position and set top accordingly
        this.parentMouseY - this.offsetY,
        // max top, otherwise we'll push the element to the right
        this.downPosition.rect.bottom - minHeight
      )
    );
    // snap to the parent top edge if within the threshold
    top =
      top < this.snapThreshold + this.parentPosition.paddings.top
        ? this.parentPosition.paddings.top
        : top;
    // update height accordingly
    const height =
      Math.max(minHeight, this.downPosition.rect.bottom - top) - boxDiff;

    if (top !== this.position.rect.top) {
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
  drag() {
    // edge of element relative to parent according to current mouse position (includes margins, borders and paddings )
    const x = this.parentMouseX - this.offsetX;
    const y = this.parentMouseY - this.offsetY;

    // snap to the edges of the window
    const left =
      x < this.snapThreshold + this.parentPosition.paddings.left
        ? this.parentPosition.paddings.left
        : x +
            this.position.fullBox.width +
            this.snapThreshold -
            this.parentPosition.paddings.right >=
          this.parentPosition.box.width
        ? this.parentPosition.box.width -
          this.position.fullBox.width +
          this.parentPosition.paddings.right
        : x;

    // snap to the edges of the window
    const top =
      y < this.snapThreshold + this.parentPosition.paddings.top
        ? this.parentPosition.paddings.top
        : y +
            this.position.fullBox.height +
            this.snapThreshold -
            this.parentPosition.paddings.bottom >
          this.parentPosition.box.height
        ? this.parentPosition.box.height -
          this.position.fullBox.height +
          this.parentPosition.paddings.bottom
        : y;

    if (
      this.element.style.left === `${left}px` &&
      this.element.style.top === `${top}px`
    ) {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.DRAG);
      return;
    }

    if (this.position.rect.left !== left || this.position.rect.top !== top) {
      this.assignPosition({ left, top });
      this.element.setAttribute(Overdrag.ATTRIBUTES.DRAG, "");
      this.emit(Overdrag.EVENTS.DRAG, this);
    } else {
      this.element.removeAttribute(Overdrag.ATTRIBUTES.DRAG);
    }
  }
}
