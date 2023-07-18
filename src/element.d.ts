import Overdrag from "./index";

declare global {
  interface HTMLElement {
    __overdrag: Overdrag | undefined;
  }
}
