import EventEmitter from "events";

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
  static readonly ERROR = {
    NO_PARENT:
      "Element must have an offset parent with position relative or absolute)",
  };
  static readonly DEFAULTS = {
    snapThreshold: 20,
    controlsThreshold: 10,
    minContentHeight: 50,
    minContentWidth: 50,
    clickDetectionThreshold: 5,
  };
  static readonly ATTRIBUTES = {
    CONTROLS: "data-overdrag-controls",
    ENGAGED: "data-overdrag-engaged",
    OVER: "data-overdrag-over",
    DOWN: "data-overdrag-down",
    DRAG: "data-overdrag-drag",
    RESIZE: "data-overdrag-resize",
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
    CLICK: "click",
    DRAG: "drag",
    OVER: "over",
    OUT: "out",
    ENGAGED: "engaged",
    DISENGAGED: "disengaged",
    CONTROLS_ACTIVE: "controls-active",
    CONTROLS_INACTIVE: "controls-inactive",
    CONTROL_RIGHT_UPDATE: "control-right-update",
    CONTROL_LEFT_UPDATE: "control-left-update",
    CONTROL_TOP_UPDATE: "control-top-update",
    CONTROL_BOTTOM_UPDATE: "control-bottom-update",
    RESIZE: "resize",
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

    this.position = this.downPosition = this.getComputedPosition();
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

  getComputedPosition(): ComputedPosition {
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
    this.parentMouseX = e.pageX - this.parentElement.offsetLeft;
    this.parentMouseY = e.pageY - this.parentElement.offsetTop;

    if (this.down) {
      // update rect only when mouse is down
      this.position = this.getComputedPosition();

      if (this.dragging) {
        this.drag();
      } else {
        this.reSize();
      }
    } else {
      const engaged = this.isEngaged();
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
    const maxWidth = this.parentElement.offsetWidth - this.position.rect.left;
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
    const maxHeight = this.parentElement.offsetHeight - this.position.rect.top;
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
      0,
      Math.min(
        // track the mouse position and set left accordingly
        this.parentMouseX - this.offsetX,
        // max left, otherwise we'll push the element to the right
        this.downPosition.rect.right - minWidth
      )
    );
    // snap to the parent left edge if within the threshold
    left = left < this.snapThreshold ? 0 : left;
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
      0,
      Math.min(
        // track the mouse position and set top accordingly
        this.parentMouseY - this.offsetY,
        // max top, otherwise we'll push the element to the right
        this.downPosition.rect.bottom - minHeight
      )
    );
    // snap to the parent top edge if within the threshold
    top = top < this.snapThreshold ? 0 : top;
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
    // edge of element relative to parent according to current mouse position (includes margins)
    const x = this.parentMouseX - this.offsetX;
    const y = this.parentMouseY - this.offsetY;
    // snap to the edges of the window
    const left =
      x < this.snapThreshold
        ? 0
        : x + this.position.fullBox.width + this.snapThreshold >=
          this.parentElement.offsetWidth
        ? this.parentElement.offsetWidth - this.position.fullBox.width
        : x;
    // snap to the edges of the window
    const top =
      y < this.snapThreshold
        ? 0
        : y + this.position.fullBox.height + this.snapThreshold >
          this.parentElement.offsetHeight
        ? this.parentElement.offsetHeight - this.position.fullBox.height
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
