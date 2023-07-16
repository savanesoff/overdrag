import Overdrag from "../src";
import "./style.css";

const overdragTargets = document.querySelectorAll(
  ".overdrag"
) as NodeListOf<HTMLDivElement>;

// assign overdrag to each element
overdragTargets.forEach((element) => {
  const props = (function () {
    try {
      return JSON.parse(element.getAttribute("data-props") || "");
    } catch (e) {
      return {};
    }
  })();
  const overdrag = new Overdrag({ element, ...props });
  // @ts-ignore
  // this is a simple matter of adding a data element to the element as a shortcut
  overdrag.element.data = overdrag.element.querySelector(".data");
  // any event emitted by overdrag can be listened to, however, if you prefer specific events, they are available as well
  overdrag.on("update", onUpdate);
  // trigger initial data render, so we don't stare at a blank screen
  onUpdate(overdrag);
  // a click event is a special event that is only emitted when the user clicks on the element, but does not drag it
  overdrag.on(Overdrag.EVENTS.CLICK, () => console.log("click", overdrag));
});

function onUpdate(instance: Overdrag) {
  // @ts-ignore
  // we'll simply update the data element with the current state of the overdrag instance
  instance.element.data.innerHTML = `
    ${getValue("controls", instance.controlsActive.toString())}
    ${getValue("dragging", instance.dragging.toString())}
    ${getValue("over", instance.over.toString())}
    ${getValue("down", instance.down.toString())} 
    ${getValue("resizing", instance.resizing.toString())} 
    ${getValue("top", instance.position.visualBounds.top.toString())}
    ${getValue("left", instance.position.visualBounds.left.toString())}  
    ${getValue("width", instance.position.width.toString())}
    ${getValue("height", instance.position.height.toString())}  
    ${getValue(
      "control",
      instance.element.getAttribute(Overdrag.ATTRIBUTES.CONTROLS) || ""
    )}  
  `;
}

function getValue(name: string, value: string) {
  return `<div>${name}: ${value}</div>`;
}
