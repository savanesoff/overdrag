# Overdrag

[![npm version](https://badge.fury.io/js/package-name.svg)](https://badge.fury.io/js/package-name)
[![Build Status](https://travis-ci.org/username/package-name.svg?branch=master)](https://travis-ci.org/username/package-name)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Overdrag is a library for adding draggable and resizable behavior to DOM elements.

## Installation

To install Overdrag, use npm or yarn:

```shell
npm install overdrag
```

or

```shell
yarn add overdrag
```

## Usage

To use Overdrag, import the Overdrag class from the package:

```JS
import Overdrag from "overdrag";
```

### Constructor

The Overdrag class constructor accepts an object with the following properties:

- `element` (required): The DOM element to control.
- `minContentHeight` (optional, default: `Overdrag.DEFAULTS.minContentHeight`): The minimum height of the DOM element (CSS height) in pixels. This prevents resizing smaller than the specified value.
- `minContentWidth` (optional, default: `Overdrag.DEFAULTS.minContentWidth`): The minimum width of the DOM element (CSS width) in pixels. This prevents resizing smaller than the specified value.
- `snapThreshold` (optional, default: `Overdrag.DEFAULTS.snapThreshold`): The distance to the edge of the relative parent element (top, left, bottom, right) when the element should snap to it.
- `controlsThreshold` (optional, default: `Overdrag.DEFAULTS.controlsThreshold`): The distance to the edge of the element (top, left, bottom, right) when the element should show resize cursor and activate control points.
- `clickDetectionThreshold` (optional, default: `Overdrag.DEFAULTS.clickDetectionThreshold`): The threshold distance to detect a click event. If you've started dragging the element, mouse up event will not trigger `click` event.

(see complete list of defaults as `Overdrag.DEFAULTS`)

### Example

```JS
const element = document.getElementById("myElement");
const overdrag = new Overdrag({
  element: element,
  minContentHeight: 100, // optional
  minContentWidth: 100, // optional
  snapThreshold: 20, // optional
  controlsThreshold: 10, // optional
  clickDetectionThreshold: 5, // optional
});
```

### Description

Controlled element is bound by its parent bounds and requires parent element to have `position:relative` CSS property for the controlled element absolute position be relative to its `offsetParent`.

#### Resizing

While hovering near and/or over the edge of controlled element (left, right, top, bottom), that includes border sizes a corresponding control point will be activated. Pressing mouse down and initiating a drag will move corresponding size of the element, thereby resizing element.

```(NOTE)
Two control points can be activated at once, ex: top-right, in which case dragging mouse around will resize both: width and height of controlled element.
```

Maximum size is determined by the size of the offset parent, however, a margin values of controlled element are respected, so if controlled element has a right-margin value of `10` the max width of the element will be no larger than `offsetParent.width - 10px`

#### Dragging

While hovering over the element content (passed the control sensors), pressing mouse `down` and proceeding to move it will engage `drag` motion and element will follow the motion of a mouse while respecting its initial offset. Max top/bottom/right/left position of the element will be constrained by its offsetParent bounds.

#### Snapping

In both cases, `drag` and `resize` the edge of controlled element will snap to the edge of `offsetParent` if controlled element distance to `offsetParent` edge (including margins) is equal to or less than `snapThreshold` value.

#### Sensors

Sensitivity of control points is determined by the `controlsThreshold` value, where control point is activated if mouse cursor distance to the control point of element is equal to of less than `controlsThreshold` value.

```NOTE
This allows for a better control precision of when control points become active, preventing edge hunting to activate controls
```

## Events 📻

Overdrag extends the `eventemitter3` class and emits various events during the interaction. You can listen to these events using the `on` method or by attaching event listeners.

### Example

```JS
overdrag.on(Overdrag.EVENTS.DOWN, (instance) => {
  console.log("Down event:", instance);
});
```

### Available Events

The available events are:

- `down`: Triggered when the mouse button is pressed down on the element.
- `up`: Triggered when the mouse button is released if pressed while element was "engaged".
- `click`: Triggered when a click action is detected.
- `drag`: Triggered during dragging, on every drag motion with a mouse move.
- `over`: Triggered when the mouse is over the element passed the control point sensors.
- `out`: Triggered when the mouse moves out of the visible box of element excluding control point sensors.
- `engaged`: Triggered when the element is engaged at visible box including controls sensors sensitivity threshold (active for dragging/resizing).
- `disengaged`: Triggered when the element is disengaged (inactive for dragging/resizing) or mouse is outside control sensitive distance.
- `controls-active`: Triggered when the control points are activated (edge of element) within control sensor area.
- `controls-inactive`: Triggered when the control points are deactivated.
- `control-right-update`: Triggered when the right control point position is updated.
- `control-left-update`: Triggered when the left control point position is updated.
- `control-top-update`: Triggered when the top control point position is updated.
- `control-bottom-update`: Triggered when the bottom control point position is updated.
- `resize`: Triggered during resizing on every mouse move (if size change detected).
- `update`: Triggered on any update to the element.

(see complete list of events listed at `Overdrag.EVENTS`)

## Element Action Attributes ⚙️

During interaction with element, its attributes are set according to the current mode and user actions. Use this to set various CSS properties accordingly to reflect type of interaction.

### Example

Say you want your element to change background color while its engaged, here is how you do it:

```CSS
#element-id[data-overdrag-engaged]{
    // change style while element is engaged
    background-color: red;
}
```

### Available Action attributes

- `data-overdrag-controls`: Set while any control point is active with a value of active control type (`left`, `right`, `top`, `bottom`), Ex: `data-overdrag-controls="right-left"`
- `data-overdrag-engaged`: Set while element is engaged.
- `data-overdrag-over`: Set while mouse is over the element pass the control sensors.
- `data-overdrag-down`: Set while mouse is down (preceded by `over` conditions).
- `data-overdrag-drag`: Set while element is dragged.
- `data-overdrag-resize`: Set while element is being resized with a value of side used to resize element. (`left`, `right`, `top`, `bottom`), Ex: `data-overdrag-resize="right"`

(see complete list of action attributes listed at `Overdrag.ATTRIBUTES`)

## Cursor 👆

At every point of interaction with a controlled element, mouse cursor will be set according to the mouse position relative to element control points and being over the content area.

```NOTE
Mouse cursor is set globally on a `document.body`, which may interfere with elements inside or outside controlled element
```

- `w-resize`: ↔️ Set while LEFT control sensor is activated (including sensitivity area)
- `e-resize`: ↔️ Set while RIGHT control sensor is activated (including sensitivity area).
- `n-resize`: ↕️ Set while TOP control sensor is activated (including sensitivity area).
- `s-resize`: ↕️ Set while BOTTOM control sensor is activated (including sensitivity area).
- `nw-resize`: ↗️ Set while TOP and LEFT control sensors are activated (including sensitivity area).
- `ne-resize`: ↗️ Set while TOP and RIGHT control sensors are activated (including sensitivity area).
- `sw-resize`: ↗️ Set while BOTTOM and LEFT control sensors are activated (including sensitivity area).
- `se-resize`: ↗️ Set while BOTTOM and RIGHT control sensors are activated (including sensitivity area).
- `grab`: 👆 Set while mouse is over the element pass the control sensors.
- `default`: ⬆️ Set while no interactions are detected.

(see complete list of cursor values listed at `Overdrag.CURSOR`)

# PS

Hit me up on [Li](https://www.linkedin.com/in/samvel-avanesov/)

Enjoy! 🎉🎉🎉
