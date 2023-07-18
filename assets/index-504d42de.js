var M=Object.defineProperty;var b=(d,T,t)=>T in d?M(d,T,{enumerable:!0,configurable:!0,writable:!0,value:t}):d[T]=t;var r=(d,T,t)=>(b(d,typeof T!="symbol"?T+"":T,t),t);(function(){const T=document.createElement("link").relList;if(T&&T.supports&&T.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const p of l.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&s(p)}).observe(document,{childList:!0,subtree:!0});function t(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(i){if(i.ep)return;i.ep=!0;const l=t(i);fetch(i.href,l)}})();function L(d){return d&&d.__esModule&&Object.prototype.hasOwnProperty.call(d,"default")?d.default:d}var C={exports:{}};(function(d){var T=Object.prototype.hasOwnProperty,t="~";function s(){}Object.create&&(s.prototype=Object.create(null),new s().__proto__||(t=!1));function i(a,o,h){this.fn=a,this.context=o,this.once=h||!1}function l(a,o,h,n,E){if(typeof h!="function")throw new TypeError("The listener must be a function");var m=new i(h,n||a,E),f=t?t+o:o;return a._events[f]?a._events[f].fn?a._events[f]=[a._events[f],m]:a._events[f].push(m):(a._events[f]=m,a._eventsCount++),a}function p(a,o){--a._eventsCount===0?a._events=new s:delete a._events[o]}function c(){this._events=new s,this._eventsCount=0}c.prototype.eventNames=function(){var o=[],h,n;if(this._eventsCount===0)return o;for(n in h=this._events)T.call(h,n)&&o.push(t?n.slice(1):n);return Object.getOwnPropertySymbols?o.concat(Object.getOwnPropertySymbols(h)):o},c.prototype.listeners=function(o){var h=t?t+o:o,n=this._events[h];if(!n)return[];if(n.fn)return[n.fn];for(var E=0,m=n.length,f=new Array(m);E<m;E++)f[E]=n[E].fn;return f},c.prototype.listenerCount=function(o){var h=t?t+o:o,n=this._events[h];return n?n.fn?1:n.length:0},c.prototype.emit=function(o,h,n,E,m,f){var O=t?t+o:o;if(!this._events[O])return!1;var u=this._events[O],R=arguments.length,A,g;if(u.fn){switch(u.once&&this.removeListener(o,u.fn,void 0,!0),R){case 1:return u.fn.call(u.context),!0;case 2:return u.fn.call(u.context,h),!0;case 3:return u.fn.call(u.context,h,n),!0;case 4:return u.fn.call(u.context,h,n,E),!0;case 5:return u.fn.call(u.context,h,n,E,m),!0;case 6:return u.fn.call(u.context,h,n,E,m,f),!0}for(g=1,A=new Array(R-1);g<R;g++)A[g-1]=arguments[g];u.fn.apply(u.context,A)}else{var P=u.length,w;for(g=0;g<P;g++)switch(u[g].once&&this.removeListener(o,u[g].fn,void 0,!0),R){case 1:u[g].fn.call(u[g].context);break;case 2:u[g].fn.call(u[g].context,h);break;case 3:u[g].fn.call(u[g].context,h,n);break;case 4:u[g].fn.call(u[g].context,h,n,E);break;default:if(!A)for(w=1,A=new Array(R-1);w<R;w++)A[w-1]=arguments[w];u[g].fn.apply(u[g].context,A)}}return!0},c.prototype.on=function(o,h,n){return l(this,o,h,n,!1)},c.prototype.once=function(o,h,n){return l(this,o,h,n,!0)},c.prototype.removeListener=function(o,h,n,E){var m=t?t+o:o;if(!this._events[m])return this;if(!h)return p(this,m),this;var f=this._events[m];if(f.fn)f.fn===h&&(!E||f.once)&&(!n||f.context===n)&&p(this,m);else{for(var O=0,u=[],R=f.length;O<R;O++)(f[O].fn!==h||E&&!f[O].once||n&&f[O].context!==n)&&u.push(f[O]);u.length?this._events[m]=u.length===1?u[0]:u:p(this,m)}return this},c.prototype.removeAllListeners=function(o){var h;return o?(h=t?t+o:o,this._events[h]&&p(this,h)):(this._events=new s,this._eventsCount=0),this},c.prototype.off=c.prototype.removeListener,c.prototype.addListener=c.prototype.on,c.prefixed=t,c.EventEmitter=c,d.exports=c})(C);var I=C.exports;const y=L(I),D={DOWN:"down",UP:"up",CLICK:"click",DRAG:"drag",DRAG_START:"dragStart",DRAG_END:"dragEnd",OVER:"over",OUT:"out",CONTROLS_ACTIVE:"controlsActive",CONTROLS_INACTIVE:"controlsInactive",CONTROL_RIGHT_UPDATE:"controlRightUpdate",CONTROL_LEFT_UPDATE:"controlLeftUpdate",CONTROL_TOP_UPDATE:"controlTopUpdate",CONTROL_BOTTOM_UPDATE:"controlBottomUpdate",RESIZE:"resize",RESIZE_START:"resizeStart",RESIZE_END:"resizeEnd",UPDATE:"update"},_={LEFT:"w-resize",RIGHT:"e-resize",TOP:"n-resize",BOTTOM:"s-resize",LEFT_TOP:"nw-resize",RIGHT_TOP:"ne-resize",LEFT_BOTTOM:"sw-resize",RIGHT_BOTTOM:"se-resize",OVER:"grab",DEFAULT:"default"},N={CONTROLS:"data-overdrag-controls",OVER:"data-overdrag-over",DOWN:"data-overdrag-down",DRAG:"data-overdrag-dragging",DRAG_MODE:"data-overdrag-drag-mode",RESIZE:"data-overdrag-resizing",RESIZE_MODE:"data-overdrag-resize-mode"},e=class extends y{constructor({element:t,minContentHeight:s=e.DEFAULTS.minContentHeight,minContentWidth:i=e.DEFAULTS.minContentWidth,maxContentWidth:l=e.DEFAULTS.maxContentWidth,maxContentHeight:p=e.DEFAULTS.maxContentHeight,snapThreshold:c=e.DEFAULTS.snapThreshold,controlsThreshold:a=e.DEFAULTS.controlsThreshold,clickDetectionThreshold:o=e.DEFAULTS.clickDetectionThreshold,stack:h=e.DEFAULTS.stack,excludePadding:n=e.DEFAULTS.excludePadding}){super();r(this,"window",window);r(this,"element");r(this,"parentElement");r(this,"noBoundsCache",{top:0,right:0,bottom:0,left:0});r(this,"snapThreshold");r(this,"controlsThreshold");r(this,"minContentHeight");r(this,"minContentWidth");r(this,"maxContentWidth");r(this,"maxContentHeight");r(this,"clickDetectionThreshold");r(this,"controlsActive",!1);r(this,"over",!1);r(this,"dragging",!1);r(this,"resizing",!1);r(this,"down",!1);r(this,"parentMouseX",0);r(this,"parentMouseY",0);r(this,"offsetX",0);r(this,"offsetY",0);r(this,"position");r(this,"downPosition");r(this,"parentPosition");r(this,"stack");r(this,"excludePadding");r(this,"controls",{left:!1,right:!1,top:!1,bottom:!1});r(this,"downMouseX",0);r(this,"downMouseY",0);r(this,"onMouseOver",(t,s=!1)=>{var i;this.over||e.activeInstance&&e.activeInstance!==this||(!this.stack&&!s&&((i=e.__ENGAGED_STACK__.at(-1))==null||i.onMouseOut(t,!0),e.__ENGAGED_STACK__.push(this)),this.setOverState(!0),this.element.addEventListener("mouseleave",this.onMouseOut),this.element.addEventListener("mousemove",this.onMouseMove),this.element.addEventListener("mousedown",this.onMouseDown))});r(this,"onMouseOut",(t,s=!1)=>{var l;if(!this.over)return;const i=e.__ENGAGED_STACK__.at(-1);!s&&i&&i!==this||(this.element.removeEventListener("mouseleave",this.onMouseOut),this.element.removeEventListener("mousemove",this.onMouseMove),this.element.removeEventListener("mousedown",this.onMouseDown),this.setOverState(!1),this.resetControlPoints(),!this.stack&&!s&&(e.__ENGAGED_STACK__.pop(),(l=e.__ENGAGED_STACK__.at(-1))==null||l.onMouseOver(t,!0)))});r(this,"onMouseDown",t=>{t.preventDefault();const s=e.__ENGAGED_STACK__.at(-1);s&&s!==this||(this.element.removeEventListener("mouseleave",this.onMouseOut),this.element.removeEventListener("mousemove",this.onMouseMove),this.element.removeEventListener("mousedown",this.onMouseDown),this.element.removeEventListener("mouseenter",this.onMouseOver),this.down=!0,e.activeInstance=this,this.downPosition={...this.position,fullBounds:{...this.position.fullBounds},borders:{...this.position.borders},margins:{...this.position.margins},paddings:{...this.position.paddings},visualBounds:{...this.position.visualBounds}},this.offsetX=this.parentMouseX-this.position.fullBounds.left,this.offsetY=this.parentMouseY-this.position.fullBounds.top,this.downMouseX=this.parentMouseX,this.downMouseY=this.parentMouseY,this.dragging=!this.controlsActive,this.resizing=this.controlsActive,this.element.setAttribute(e.ATTRIBUTES.DOWN,""),this.emit(e.EVENTS.DOWN,this),this.dragging?(this.element.setAttribute(e.ATTRIBUTES.DRAG_MODE,""),this.emit(e.EVENTS.DRAG_START,this)):this.resizing&&(this.element.setAttribute(e.ATTRIBUTES.RESIZE_MODE,""),this.emit(e.EVENTS.RESIZE_START,this)),this.window.addEventListener("mousemove",this.onMouseMove),this.window.addEventListener("mouseup",this.onMouseUp))});r(this,"onMouseUp",t=>{this.window.removeEventListener("mouseup",this.onMouseUp),this.window.removeEventListener("mousemove",this.onMouseMove),this.element.addEventListener("mouseleave",this.onMouseOut),this.element.addEventListener("mousemove",this.onMouseMove),this.element.addEventListener("mousedown",this.onMouseDown),this.element.addEventListener("mouseenter",this.onMouseOver),t.preventDefault(),e.activeInstance=null,this.down=!1,this.dragging?(this.element.removeAttribute(e.ATTRIBUTES.DRAG_MODE),this.emit(e.EVENTS.DRAG_END,this)):this.resizing&&(this.element.removeAttribute(e.ATTRIBUTES.RESIZE_MODE),this.emit(e.EVENTS.RESIZE_END,this)),this.dragging=!1,this.resizing=!1,this.element.removeAttribute(e.ATTRIBUTES.DOWN),this.element.removeAttribute(e.ATTRIBUTES.DRAG),this.element.removeAttribute(e.ATTRIBUTES.RESIZE),this.emit(e.EVENTS.UP,this),this.isClick()&&this.emit(e.EVENTS.CLICK,this)});r(this,"onMouseMove",t=>{this.parentPosition=this.getComputedParentPosition(),this.position=this.getComputedElementPosition(),this.parentMouseX=t.clientX-this.parentPosition.offsetLeft,this.parentMouseY=t.clientY-this.parentPosition.offsetTop,this.down?this.dragging?this.drag():this.reSize():(this.updateControlPointsState(),this.updateCursorStyle())});if(this.minContentHeight=s,this.minContentWidth=i,this.maxContentWidth=l,this.maxContentHeight=p,this.snapThreshold=c,this.controlsThreshold=a,this.excludePadding=n,this.element=t,this.element.style.position="absolute",this.stack=h,this.element.__overdrag=this,this.clickDetectionThreshold=o,!this.element.offsetParent)throw new Error(e.ERROR.NO_PARENT);this.parentElement=this.element.offsetParent,this.element.addEventListener("mouseenter",this.onMouseOver),this.parentPosition=this.getComputedParentPosition(),this.position=this.getComputedElementPosition(),this.downPosition=this.position,this.assignInitialStyles()}assignInitialStyles(){this.element.style.left=`${this.position.fullBounds.left}px`,this.element.style.top=`${this.position.fullBounds.top}px`,this.element.style.width=`${this.position.width}px`,this.element.style.height=`${this.position.height}px`,this.element.style.right=`${this.parentPosition.actionBounds.right-this.position.fullBounds.right}px`,this.element.style.bottom=`${this.parentPosition.actionBounds.bottom-this.position.fullBounds.bottom}px`,this.element.setAttribute("width",`${this.position.width}`),this.element.setAttribute("height",`${this.position.height}`)}_getInt(t){return parseInt(t||"0")}emit(t,...s){return super.emit.apply(this,[e.EVENTS.UPDATE,this]),super.emit.apply(this,[t,...s])}getComputedParentPosition(){const t=this.parentElement.getBoundingClientRect(),s=getComputedStyle(this.parentElement),i=this.excludePadding?{top:0,right:0,bottom:0,left:0}:{top:this._getInt(s.paddingTop),right:this._getInt(s.paddingRight),bottom:this._getInt(s.paddingBottom),left:this._getInt(s.paddingLeft)},l=this._getInt(s.width),p=this._getInt(s.height);return{actionBounds:{top:i.top,left:i.left,right:l+i.left,bottom:p+i.top,width:l+i.left+i.right,height:p+i.top+i.bottom},offsetLeft:t.left+this._getInt(s.borderLeftWidth),offsetTop:t.top+this._getInt(s.borderTopWidth)}}getComputedElementPosition(){const t=getComputedStyle(this.element),s=t.boxSizing==="border-box",i={top:this._getInt(t.marginTop),right:this._getInt(t.marginRight),bottom:this._getInt(t.marginBottom),left:this._getInt(t.marginLeft)},l=s?this.noBoundsCache:{top:this._getInt(t.borderTopWidth),right:this._getInt(t.borderRightWidth),bottom:this._getInt(t.borderBottomWidth),left:this._getInt(t.borderLeftWidth)},p=s?this.noBoundsCache:{top:this._getInt(t.paddingTop),right:this._getInt(t.paddingRight),bottom:this._getInt(t.paddingBottom),left:this._getInt(t.paddingLeft)},c=this._getInt(t.top),a=this._getInt(t.left),o=this._getInt(t.width),h=this._getInt(t.height),n={width:o+(s?0:l.right+l.left+p.right+p.left),height:h+(s?0:l.top+l.bottom+p.top+p.bottom),left:a+i.left,top:c+i.top},E=n.width+i.right+i.left,m=n.height+i.top+i.bottom,f={width:E,height:m,left:a,top:c,right:a+E,bottom:c+m};return{width:o,height:h,verticalDiff:m-h,horizontalDiff:E-o,visualBounds:{...n,right:n.left+n.width,bottom:n.top+n.height},fullBounds:f,margins:i,borders:l,paddings:p}}destroy(){this.element.removeEventListener("mouseenter",this.onMouseOver),this.element.removeEventListener("mouseleave",this.onMouseOut),this.element.removeEventListener("mousemove",this.onMouseMove),this.element.removeEventListener("mousedown",this.onMouseDown),this.element.removeEventListener("mouseup",this.onMouseUp),this.removeAllListeners(),this.element.__overdrag=void 0}isClick(){return Math.abs(this.parentMouseX-this.downMouseX)<this.clickDetectionThreshold&&Math.abs(this.parentMouseY-this.downMouseY)<this.clickDetectionThreshold}setOverState(t){this.over=t,t?(this.element.setAttribute(e.ATTRIBUTES.OVER,""),this.emit(e.EVENTS.OVER,this)):(this.element.removeAttribute(e.ATTRIBUTES.OVER),this.emit(e.EVENTS.OUT,this))}resetControlPoints(){const t=this.controlsActive;this.controlsActive=this.controls.left=this.controls.right=this.controls.top=this.controls.bottom=!1,t!==this.controlsActive&&(this.element.removeAttribute(e.ATTRIBUTES.CONTROLS),this.emit(e.EVENTS.CONTROLS_INACTIVE,this))}updateControlPointsState(){const t=JSON.stringify(this.controls),s=this.parentMouseY>=this.position.visualBounds.top&&this.parentMouseY<=this.position.visualBounds.bottom,i=this.parentMouseX>=this.position.visualBounds.left&&this.parentMouseX<=this.position.visualBounds.right,l=this.parentMouseX-this.position.visualBounds.left,p=this.position.visualBounds.right-this.parentMouseX,c=this.parentMouseY-this.position.visualBounds.top,a=this.position.visualBounds.bottom-this.parentMouseY;this.controls.left=s&&l>=0&&l<=this.controlsThreshold,this.controls.right=s&&p>=0&&p<=this.controlsThreshold,this.controls.top=i&&c>=0&&c<=this.controlsThreshold,this.controls.bottom=i&&a>=0&&a<=this.controlsThreshold;const o=this.controls.left||this.controls.right||this.controls.top||this.controls.bottom;o&&t!==JSON.stringify(this.controls)?(this.controlsActive=!0,this.element.setAttribute(e.ATTRIBUTES.CONTROLS,Object.keys(this.controls).filter(h=>this.controls[h]).join("-")),this.emit(e.EVENTS.CONTROLS_ACTIVE,this)):o||this.resetControlPoints()}updateCursorStyle(){let t=null;this.controls.top&&this.controls.left?t=e.CURSOR.LEFT_TOP:this.controls.bottom&&this.controls.right?t=e.CURSOR.RIGHT_BOTTOM:this.controls.bottom&&this.controls.left?t=e.CURSOR.LEFT_BOTTOM:this.controls.top&&this.controls.right?t=e.CURSOR.RIGHT_TOP:this.controls.top?t=e.CURSOR.TOP:this.controls.bottom?t=e.CURSOR.BOTTOM:this.controls.left?t=e.CURSOR.LEFT:this.controls.right?t=e.CURSOR.RIGHT:this.over&&(t=e.CURSOR.OVER),this.element.style.setProperty("cursor",t)}reSize(){let t=!1;this.controls.top&&(t=this.movePointTop()||t),this.controls.bottom&&(t=this.movePointBottom()||t),this.controls.left&&(t=this.movePointLeft()||t),this.controls.right&&(t=this.movePointRight()||t),t&&(this.element.setAttribute(e.ATTRIBUTES.RESIZE,""),this.emit(e.EVENTS.RESIZE,this))}assignStyle(t){const s={top:this.position.fullBounds.top,left:this.position.fullBounds.left,width:this.position.width,height:this.position.height,...t};this.element.style.left=`${s.left}px`,this.element.style.top=`${s.top}px`,this.element.style.width=`${s.width}px`,this.element.style.height=`${s.height}px`,this.element.setAttribute("width",`${s.width}`),this.element.setAttribute("height",`${s.height}`),this.position=this.getComputedElementPosition(),this.element.style.right=`${this.parentPosition.actionBounds.right-this.position.fullBounds.right}px`,this.element.style.bottom=`${this.parentPosition.actionBounds.bottom-this.position.fullBounds.bottom}px`}movePointRight(){const t=Math.max(this.minContentWidth,Math.min(this.maxContentWidth,this.calcRight()-this.downPosition.fullBounds.left-this.position.horizontalDiff));return t!==this.position.width?(this.assignStyle({width:t}),this.emit(e.EVENTS.CONTROL_RIGHT_UPDATE,this),!0):!1}movePointBottom(){const t=Math.max(this.minContentHeight,Math.min(this.maxContentHeight,this.calcBottom()-this.downPosition.fullBounds.top-this.position.verticalDiff));return t!==this.position.height?(this.assignStyle({height:t}),this.emit(e.EVENTS.CONTROL_BOTTOM_UPDATE,this),!0):!1}movePointLeft(){const t=this.minContentWidth+this.position.horizontalDiff,s=this.maxContentWidth+this.position.horizontalDiff,i=Math.min(Math.max(this.calcLeft(),this.downPosition.fullBounds.right-s),this.downPosition.fullBounds.right-t),l=this.downPosition.fullBounds.right-i-this.position.horizontalDiff;return i!==this.position.fullBounds.left?(this.assignStyle({width:l,left:i}),this.emit(e.EVENTS.CONTROL_LEFT_UPDATE,this),!0):!1}movePointTop(){const t=this.minContentHeight+this.position.verticalDiff,s=this.maxContentHeight+this.position.verticalDiff,i=Math.min(Math.max(this.calcTop(),this.downPosition.fullBounds.bottom-s),this.downPosition.fullBounds.bottom-t),l=this.downPosition.fullBounds.bottom-i-this.position.verticalDiff;return i!==this.position.fullBounds.top?(this.assignStyle({height:l,top:i}),this.emit(e.EVENTS.CONTROL_TOP_UPDATE,this),!0):!1}calcRight(){let t=this.parentMouseX-this.offsetX+this.downPosition.fullBounds.width;return t=t+this.snapThreshold>=this.parentPosition.actionBounds.right?this.parentPosition.actionBounds.right:t,t}calcBottom(){let t=this.parentMouseY-this.offsetY+this.downPosition.fullBounds.height;return t=t+this.snapThreshold>=this.parentPosition.actionBounds.bottom?this.parentPosition.actionBounds.bottom:t,t}calcLeft(){const t=this.parentMouseX-this.offsetX;return t-this.snapThreshold<=this.parentPosition.actionBounds.left?this.parentPosition.actionBounds.left:t}calcTop(){const t=this.parentMouseY-this.offsetY;return t-this.snapThreshold<=this.parentPosition.actionBounds.top?this.parentPosition.actionBounds.top:t}drag(){const t=this.calcLeft(),s=this.calcTop(),i=s+this.position.fullBounds.height+this.snapThreshold>=this.parentPosition.actionBounds.bottom?this.parentPosition.actionBounds.bottom-this.position.fullBounds.height:s,l=t+this.position.fullBounds.width+this.snapThreshold>=this.parentPosition.actionBounds.right?this.parentPosition.actionBounds.right-this.position.fullBounds.width:t;(this.position.fullBounds.left!==l||this.position.fullBounds.top!==i)&&(this.assignStyle({left:l,top:i}),this.element.setAttribute(e.ATTRIBUTES.DRAG,""),this.emit(e.EVENTS.DRAG,this))}};let v=e;r(v,"__ENGAGED_STACK__",[]),r(v,"ERROR",{NO_PARENT:"Element must have an offset parent with position relative)"}),r(v,"DEFAULTS",{snapThreshold:16,controlsThreshold:16,minContentHeight:50,minContentWidth:50,maxContentWidth:1/0,maxContentHeight:1/0,clickDetectionThreshold:5,stack:!1,excludePadding:!1}),r(v,"ATTRIBUTES",N),r(v,"CURSOR",_),r(v,"EVENTS",D),r(v,"activeInstance",null);const U=document.querySelectorAll(".overdrag");U.forEach(d=>{const T=function(){try{return JSON.parse(d.getAttribute("data-props")||"")}catch{return{}}}(),t=new v({element:d,...T});t.element.data=t.element.querySelector(".data"),t.on("update",B),B(t),t.on(v.EVENTS.CLICK,()=>console.log("click",t))});function B(d){d.element.data.innerHTML=`
    ${S("controls",d.controlsActive.toString())}
    ${S("dragging",d.dragging.toString())}
    ${S("over",d.over.toString())}
    ${S("down",d.down.toString())} 
    ${S("resizing",d.resizing.toString())} 
    ${S("top",d.position.visualBounds.top.toString())}
    ${S("left",d.position.visualBounds.left.toString())}  
    ${S("width",d.position.width.toString())}
    ${S("height",d.position.height.toString())}  
    ${S("control",d.element.getAttribute(v.ATTRIBUTES.CONTROLS)||"")}  
  `}function S(d,T){return`<div>${d}: ${T}</div>`}