module.exports=function(t){var e={};function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(i,r,function(e){return t[e]}.bind(null,r));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=3)}([function(t,e,n){t.exports=n(2)},function(t,e){function n(t,e,n,i,r,o,s){try{var a=t[o](s),h=a.value}catch(t){return void n(t)}a.done?e(h):Promise.resolve(h).then(i,r)}t.exports=function(t){return function(){var e=this,i=arguments;return new Promise((function(r,o){var s=t.apply(e,i);function a(t){n(s,r,o,a,h,"next",t)}function h(t){n(s,r,o,a,h,"throw",t)}a(void 0)}))}}},function(t,e,n){var i=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},r=i.iterator||"@@iterator",o=i.asyncIterator||"@@asyncIterator",s=i.toStringTag||"@@toStringTag";function a(t,e,n,i){var r=e&&e.prototype instanceof d?e:d,o=Object.create(r.prototype),s=new x(i||[]);return o._invoke=function(t,e,n){var i="suspendedStart";return function(r,o){if("executing"===i)throw new Error("Generator is already running");if("completed"===i){if("throw"===r)throw o;return C()}for(n.method=r,n.arg=o;;){var s=n.delegate;if(s){var a=y(s,n);if(a){if(a===u)continue;return a}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===i)throw i="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);i="executing";var d=h(t,e,n);if("normal"===d.type){if(i=n.done?"completed":"suspendedYield",d.arg===u)continue;return{value:d.arg,done:n.done}}"throw"===d.type&&(i="completed",n.method="throw",n.arg=d.arg)}}}(t,n,s),o}function h(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=a;var u={};function d(){}function c(){}function l(){}var p={};p[r]=function(){return this};var f=Object.getPrototypeOf,v=f&&f(f(E([])));v&&v!==e&&n.call(v,r)&&(p=v);var g=l.prototype=d.prototype=Object.create(p);function _(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function m(t,e){var i;this._invoke=function(r,o){function s(){return new e((function(i,s){!function i(r,o,s,a){var u=h(t[r],t,o);if("throw"!==u.type){var d=u.arg,c=d.value;return c&&"object"==typeof c&&n.call(c,"__await")?e.resolve(c.__await).then((function(t){i("next",t,s,a)}),(function(t){i("throw",t,s,a)})):e.resolve(c).then((function(t){d.value=t,s(d)}),(function(t){return i("throw",t,s,a)}))}a(u.arg)}(r,o,i,s)}))}return i=i?i.then(s,s):s()}}function y(t,e){var n=t.iterator[e.method];if(void 0===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,y(t,e),"throw"===e.method))return u;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return u}var i=h(n,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,u;var r=i.arg;return r?r.done?(e[t.resultName]=r.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,u):r:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,u)}function w(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function b(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function x(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(w,this),this.reset(!0)}function E(t){if(t){var e=t[r];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var i=-1,o=function e(){for(;++i<t.length;)if(n.call(t,i))return e.value=t[i],e.done=!1,e;return e.value=void 0,e.done=!0,e};return o.next=o}}return{next:C}}function C(){return{value:void 0,done:!0}}return c.prototype=g.constructor=l,l.constructor=c,l[s]=c.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===c||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,l):(t.__proto__=l,s in t||(t[s]="GeneratorFunction")),t.prototype=Object.create(g),t},t.awrap=function(t){return{__await:t}},_(m.prototype),m.prototype[o]=function(){return this},t.AsyncIterator=m,t.async=function(e,n,i,r,o){void 0===o&&(o=Promise);var s=new m(a(e,n,i,r),o);return t.isGeneratorFunction(n)?s:s.next().then((function(t){return t.done?t.value:s.next()}))},_(g),g[s]="Generator",g[r]=function(){return this},g.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var i=e.pop();if(i in t)return n.value=i,n.done=!1,n}return n.done=!0,n}},t.values=E,x.prototype={constructor:x,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(b),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function i(n,i){return s.type="throw",s.arg=t,e.next=n,i&&(e.method="next",e.arg=void 0),!!i}for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r],s=o.completion;if("root"===o.tryLoc)return i("end");if(o.tryLoc<=this.prev){var a=n.call(o,"catchLoc"),h=n.call(o,"finallyLoc");if(a&&h){if(this.prev<o.catchLoc)return i(o.catchLoc,!0);if(this.prev<o.finallyLoc)return i(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return i(o.catchLoc,!0)}else{if(!h)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return i(o.finallyLoc)}}}},abrupt:function(t,e){for(var i=this.tryEntries.length-1;i>=0;--i){var r=this.tryEntries[i];if(r.tryLoc<=this.prev&&n.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var s=o?o.completion:{};return s.type=t,s.arg=e,o?(this.method="next",this.next=o.finallyLoc,u):this.complete(s)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),u},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),b(n),u}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var i=n.completion;if("throw"===i.type){var r=i.arg;b(n)}return r}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:E(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=void 0),u}},t}(t.exports);try{regeneratorRuntime=i}catch(t){Function("r","regeneratorRuntime = r")(i)}},function(t,e,n){"use strict";function i(){this._eventMappings=[],this._disposed=!1}n.r(e),n.d(e,"canvas",(function(){return h})),n.d(e,"sprite",(function(){return w})),n.d(e,"loader",(function(){return v})),n.d(e,"collision",(function(){return C}));var r=i;i.prototype.addEventListener=function(t,e,n){if(!this.hasEventListener(t,e)){if(t.addEventListener)t.addEventListener(e,n,!1);else{if(!t.attachEvent)return!1;t.attachEvent("on".concat(e),n)}return this._eventMappings.push({element:t,type:e,listener:n}),!0}return!1},i.prototype.hasEventListener=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type==e)return!0}return!1},i.prototype.removeEventListener=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type===e){if(t.removeEventListener)t.removeEventListener(e,i.listener,!1);else{if(!t.detachEvent)return!1;t.detachEvent("on".concat(e),i.listener)}return this._eventMappings.splice(n,1),!0}}return!1},i.prototype.dispose=function(){if(!this._disposed){this._disposed=!0;for(var t=this._eventMappings.length;t--;){var e=this._eventMappings[t];this.removeEventListener(e.element,e.type)}this._eventMappings=null}};var o={extend:function(t,e){function n(){}n.prototype=e.prototype,t.superClass_=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.super=function(t,n,i){for(var r=new Array(arguments.length-2),o=2;o<arguments.length;o++)r[o-2]=arguments[o];return e.prototype[n].apply(t,r)},t.extend=function(e){o.extend(e,t)}}},s=o;function a(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,n=void 0===e?300:e,i=t.height,r=void 0===i?300:i,o=t.fps,s=void 0===o?60:o,a=t.animate,h=void 0!==a&&a,u=t.smoothing,d=void 0===u||u,c=t.stretchToFit,l=void 0!==c&&c,p=t.debug,f=void 0!==p&&p,v=t.onUpdate,g=void 0===v?null:v;if(n<=0||r<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=f,this._fps=s,this._animate=h,this._smoothing=d,this._stretchToFit=l,this._updateHandler=g,this._renderHandler=this.render.bind(this),this._lastRender=0,this._renderId=0,this._renderPending=!1,this._renderInterval=1e3/this._fps,this._disposed=!1,this._children=[],this._element=document.createElement("canvas"),this._canvasContext=this._element.getContext("2d");var _=window.devicePixelRatio||1,m=this._canvasContext.webkitBackingStorePixelRatio||this._canvasContext.mozBackingStorePixelRatio||this._canvasContext.msBackingStorePixelRatio||this._canvasContext.oBackingStorePixelRatio||this._canvasContext.backingStorePixelRatio||1,y=_/m;this._HDPIscaleRatio=_!==m?y:1,this.setDimensions(n,r,!0,!0),this.setSmoothing(d),this.preventEventBubbling(!1),this.addListeners(),this._stretchToFit&&this.stretchToFit(!0),this._animate&&this.render()}var h=a;function u(t){var e=t._HDPIscaleRatio,n=t._enqueuedSize.width,i=t._enqueuedSize.height;t._enqueuedSize=null,t._width=n,t._height=i,t._element.width=n*e,t._element.height=i*e,t._element.style.width=n+"px",t._element.style.height=i+"px",t._canvasContext.scale(e,e),!1===t._smoothing&&t.setSmoothing(t._smoothing)}a.extend=function(t){s.extend(t,a)},a.prototype.insertInPage=function(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)},a.prototype.getElement=function(){return this._element},a.prototype.preventEventBubbling=function(t){this._preventDefaults=t},a.prototype.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=null,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this},a.prototype.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.invalidate(),t},a.prototype.getChildAt=function(t){return this._children[t]},a.prototype.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},a.prototype.numChildren=function(){return this._children.length},a.prototype.getChildren=function(){return this._children},a.prototype.contains=function(t){return this._children.indexOf(t)>-1},a.prototype.invalidate=function(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},a.prototype.getFrameRate=function(){return this._fps},a.prototype.getRenderInterval=function(){return this._renderInterval},a.prototype.setSmoothing=function(t){var e=["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"],n=this._canvasContext;this._smoothing=t,window.requestAnimationFrame((function(){e.forEach((function(e){void 0!==n[e]&&(n[e]=t)}))}))},a.prototype.getWidth=function(){return this._enqueuedSize?this._enqueuedSize.width:this._width},a.prototype.getHeight=function(){return this._enqueuedSize?this._enqueuedSize.height:this._height},a.prototype.setDimensions=function(t,e,n,i){this._enqueuedSize={width:t,height:e},!1!==n&&(this._preferredWidth=t,this._preferredHeight=e),!0===i&&u(this),this.invalidate()},a.prototype.setBackgroundColor=function(t){this._bgColor=t},a.prototype.setAnimatable=function(t){var e=this._animate;this._animate=t,!t||e||this._renderPending||this._renderHandler()},a.prototype.isAnimatable=function(){return this._animate},a.prototype.drawImage=function(t,e,n,i,r,o,s,a,h){if(e=.5+e<<0,n=.5+n<<0,r=.5+r<<0,!((i=.5+i<<0)<=0||r<=0))if("number"==typeof o){var u=(i=Math.min(this._canvasContext.canvas.width,i))/a,d=(r=Math.min(this._canvasContext.canvas.height,r))/h;o+a>t.width&&(i-=u*(o+a-t.width),a-=o+a-t.width),s+h>t.height&&(r-=d*(s+h-t.height),h-=s+h-t.height),this._canvasContext.drawImage(t,o,s,a,h,e,n,i,r)}else this._canvasContext.drawImage(t,e,n,i,r)},a.prototype.stretchToFit=function(t){var e,n,i=this._preferredWidth,r=this._preferredHeight,o=document.documentElement.clientWidth,s=document.documentElement.clientHeight;if(s>o){var a=!0===t?Math.round(s/o*i):r;this.setDimensions(i,a,!1),e=o/i,n=s/a}else{var h=!0===t?Math.round(o/s*r):i;this.setDimensions(h,r,!1),e=o/h,n=s/r}var u=this.getElement(),d="scale(".concat(e,", ").concat(n,")");u.style["-webkit-transform-origin"]=u.style["transform-origin"]="0 0",u.style["-webkit-transform"]=u.style.transform=!0===t?d:""},a.prototype.dispose=function(){if(!this._disposed){this._disposed=!0,this.removeListeners(),this._animate=!1,window.cancelAnimationFrame(this._renderId);for(var t=this.numChildren();t--;)this._children[t].dispose();this._children=[]}},a.prototype.handleInteraction=function(t){var e,n,i=this._children.length,r=0,o=0;if(i>0)switch(e=this._children[i-1],t.type){default:if((n=t.touches.length>0?t.touches:t.changedTouches).length>0){var s=this.getCoordinate();r=n[0].pageX-s.x,o=n[0].pageY-s.y}for(;e;)e.handleInteraction(r,o,t),e=e.last;break;case"mousedown":case"mousemove":case"mouseup":for(;e&&!e.handleInteraction(t.offsetX,t.offsetY,t);)e=e.last}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this.invalidate()},a.prototype.render=function(){var t=Date.now(),e=t-this._lastRender;this._renderPending=!1,this._lastRender=t-e%this._renderInterval,this._enqueuedSize&&u(this);var n,i=this._canvasContext;if(i){this._bgColor?(i.fillStyle=this._bgColor,i.fillRect(0,0,this._width,this._height)):i.clearRect(0,0,this._width,this._height);var r="function"==typeof this._updateHandler;if(r&&this._updateHandler(t),this._children.length>0)for(n=this._children[0];n;)r||n.update(t),n.draw(i),n=n.next}this._disposed||!this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},a.prototype.addListeners=function(){this._eventHandler||(this._eventHandler=new r);var t=this.handleInteraction.bind(this);if("ontouchstart"in window&&(this._eventHandler.addEventListener(this._element,"touchstart",t),this._eventHandler.addEventListener(this._element,"touchmove",t),this._eventHandler.addEventListener(this._element,"touchend",t)),this._eventHandler.addEventListener(this._element,"mousedown",t),this._eventHandler.addEventListener(this._element,"mousemove",t),this._eventHandler.addEventListener(window,"mouseup",t),this._stretchToFit){var e=this;if(void 0!==(window.msMatchMedia||window.MozMatchMedia||window.WebkitMatchMedia||window.matchMedia))window.matchMedia("(orientation: portrait)").addListener((function(){return e.stretchToFit(!0)}));else{var n="onorientationchange"in window?"orientationchange":"resize";this._eventHandler.addEventListener(window,n,(function(t){return e.stretchToFit(!0)}))}}},a.prototype.removeListeners=function(){this._eventHandler&&this._eventHandler.dispose(),this._eventHandler=null},a.prototype.getCoordinate=function(){for(var t=0,e=0,n=this._element;n.offsetParent;)t+=n.offsetLeft,e+=n.offsetTop,n=n.offsetParent;return{x:t+=n.offsetLeft,y:e+=n.offsetTop}};var d=n(0),c=n.n(d),l=n(1),p=n.n(l),f={loadImage:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new window.Image;return new Promise((function(n,i){if(e instanceof window.Image&&f.isReady(e))n(m(e));else{var o=e,s=_(t),a=new r,h=function(){var t=p()(c.a.mark((function t(){return c.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return a.dispose(),t.prev=1,t.next=4,f.onReady(o);case 4:n(m(o)),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(1),i(t.t0);case 10:case"end":return t.stop()}}),t,null,[[1,7]])})));return function(){return t.apply(this,arguments)}}(),u=/^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);s&&!u||(s||g(t,o),a.addEventListener(o,"load",h),a.addEventListener(o,"error",(function(t){a.dispose(),i(new Error(t.type))}))),o.src=t,s&&n(m(o))}}))},isReady:function(t){return!("boolean"==typeof t.complete&&!t.complete)&&!(void 0!==t.naturalWidth&&0===t.naturalWidth)},onReady:function(t,e,n){return p()(c.a.mark((function e(){return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){var i=0;!function r(){f.isReady(t)?e():60==++i?n(new Error("Image could not be resolved. This shouldn't occur.")):window.requestAnimationFrame(r)}()})));case 1:case"end":return e.stop()}}),e)})))()}},v=f;function g(t,e){(function(t){var e=window.location;if("./"===t.substr(0,2)||0===t.indexOf("".concat(e.protocol,"//").concat(e.host)))return!0;var n=t.split("#")[0].split("?")[0];if(n.includes(".html")){var i=n.split("/"),r=i.length;n=n.split(i[r-1]).join("")}if(n){var o=n.match(/^http[s]?:/);if(Array.isArray(o)&&o.length>0)return!1}return!0})(t)||(e.crossOrigin="Anonymous")}function _(t){var e=("string"==typeof t?t:t.src).substr(0,5);return"data:"===e||"blob:"===e}function m(t){var e={image:t,size:null};return t instanceof window.HTMLImageElement&&(e.size=function(t){return{width:t.width||t.naturalWidth,height:t.height||t.naturalHeight}}(t)),e}function y(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,n=t.height,i=t.x,r=void 0===i?0:i,o=t.y,s=void 0===o?0:o,a=t.bitmap,h=void 0===a?null:a,u=t.collidable,d=void 0!==u&&u,c=t.mask,l=void 0!==c&&c,p=t.sheet,f=void 0===p?[]:p,v=t.sheetTileWidth,g=void 0===v?0:v,_=t.sheetTileHeight,m=void 0===_?0:_;if(e<=0||n<=0)throw new Error("cannot construct a zSprite without valid dimensions");if(this._children=[],this._disposed=!1,this.collidable=d,this.hover=!1,this._mask=l,this._bounds={left:0,top:0,width:e,height:n},this._parent=null,this.last=null,this.next=null,this.canvas=null,this._bitmap,this._bitmapReady=!1,this._draggable=!1,this._interactive=!1,this._keepInBounds=!1,this.isDragging=!1,this.setX(r),this.setY(s),h&&this.setBitmap(h),Array.isArray(f)&&f.length>0){if(!h)throw new Error("cannot use a spritesheet without a valid Bitmap");this.setSheet(f,g,m)}}var w=y;y.extend=function(t){s.extend(t,y)},y.prototype.getDraggable=function(){return this._draggable},y.prototype.setDraggable=function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this._draggable=t,this._keepInBounds=e,t&&!this._interactive&&this.setInteractive(!0)},y.prototype.getX=function(){return this._bounds.left},y.prototype.setX=function(t){var e=t-this._bounds.left;if(this._bounds.left=this._constraint?t+this._constraint.left:t,this._children.length>0)for(var n=this._children[0];n;)n.isDragging||n.setX(n._bounds.left+e),n=n.next},y.prototype.getY=function(){return this._bounds.top},y.prototype.setY=function(t){var e=t-this._bounds.top;if(this._bounds.top=this._constraint?t+this._constraint.top:t,this._children.length>0)for(var n=this._children[0];n;)n.isDragging||n.setY(n._bounds.top+e),n=n.next},y.prototype.getWidth=function(){return this._bounds.width},y.prototype.setWidth=function(t){var e=this._bounds.width||0;this._bounds.width=t,0!==e&&(this._bounds.left-=.5*t-.5*e)},y.prototype.getHeight=function(){return this._bounds.height},y.prototype.setHeight=function(t){var e=this._bounds.height||0;this._bounds.height=t,0!==e&&(this._bounds.top-=.5*t-.5*e)},y.prototype.setBounds=function(t,e,n,i){if("number"!=typeof t&&(t=this._bounds.left),"number"!=typeof e&&(e=this._bounds.top),this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");"number"==typeof n&&(this._bounds.width=n),"number"==typeof i&&(this._bounds.height=i);var r=this._bounds.width,o=this._bounds.height,s=this._constraint?this._constraint.width:this.canvas.width,a=this._constraint?this._constraint.height:this.canvas.height;if(this._keepInBounds){var h=Math.min(0,-(r-s)),u=Math.min(0,-(o-a)),d=s-r,c=a-o;t=Math.min(d,Math.max(t,h)),e=Math.min(c,Math.max(e,u))}else t>s&&(t+=.5*r),e>a&&(e+=.5*o);this.setX(t),this.setY(e)},y.prototype.getBounds=function(){return this._bounds},y.prototype.getInteractive=function(){return this._interactive},y.prototype.setInteractive=function(t){this._interactive=t},y.prototype.update=function(t){if(this._children.length>0)for(var e=this._children[0];e;)e.update(t),e=e.next;this._animation&&this.updateAnimation()},y.prototype.draw=function(t){if(this.canvas){if(t.save(),this._mask&&(t.globalCompositeOperation="destination-in"),this._bitmapReady){var e=this._bounds,n=this._animation;if(n){var i=n.tileWidth?n.tileWidth:.5+e.width<<0,r=n.tileHeight?n.tileHeight:.5+e.height<<0;t.drawImage(this._bitmap,n.col*i,n.type.row*r,i,r,.5+e.left<<0,.5+e.top<<0,.5+e.width<<0,.5+e.height<<0)}else t.drawImage(this._bitmap,.5+e.left<<0,.5+e.top<<0,.5+e.width<<0,.5+e.height<<0)}if(this._children.length>0)for(var o=this._children[0];o;)o.draw(t),o=o.next;this._mask&&(t.globalCompositeOperation="source-over"),t.restore(),this.canvas.DEBUG&&this.drawOutline(t)}},y.prototype.collidesWith=function(t){if(t===this)return!1;var e=this._bounds,n=t.getBounds();return!(e.top+e.height<n.top||e.top>n.top+n.height||e.left+e.width<n.left||e.left>n.left+n.width)},y.prototype.getIntersection=function(t){if(this.collidesWith(t)){var e=this._bounds,n=t.getBounds(),i=Math.max(e.left,n.left),r=Math.max(e.top,n.top);return{left:i,top:r,width:Math.min(e.left+e.width,n.width+n.height)-i,height:Math.min(e.top+e.height,n.top+n.height)-r}}return null},y.prototype.collidesWithEdge=function(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1},y.prototype.getBitmap=function(){return this._bitmap},y.prototype.setBitmap=function(t,e,n){var i=this,r=t instanceof window.HTMLCanvasElement,o=t instanceof window.HTMLImageElement,s="string"==typeof t;if(t&&!r&&!o&&!s)throw new Error('expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "'.concat(t,'" instead'));return new Promise(function(){var a=p()(c.a.mark((function a(h,u){var d,l,p,f,g,_,m;return c.a.wrap((function(a){for(;;)switch(a.prev=a.next){case 0:if(i._bitmap!==t&&(i._bitmapReady=!1),t){a.next=4;break}return i._bitmap=null,a.abrupt("return");case 4:if(l="number"==typeof n,(d="number"==typeof e)&&i.setWidth(e),l&&i.setHeight(n),i._keepInBounds&&i.canvas&&(d||l)&&(p=-(i._bounds.width-i.canvas.getWidth()),f=-(i._bounds.height-i.canvas.getHeight()),i._bounds.left>0?i._bounds.left=0:i._bounds.left<p&&(i._bounds.left=p),i._bounds.top>0?i._bounds.top=0:i._bounds.top<f&&(i._bounds.top=f)),!r){a.next=15;break}return i._bitmap=t,i._bitmapReady=!0,a.abrupt("return",h());case 15:if(!o&&!s){a.next=32;break}return a.prev=16,a.next=19,v.loadImage(t);case 19:return g=a.sent,_=g.size,m=g.image,i._bitmap=m,i._bitmapReady=!0,i._bitmapWidth=_.width,i._bitmapHeight=_.height,a.abrupt("return",h());case 29:a.prev=29,a.t0=a.catch(16),u(new Error('zSprite.setBitmap() "'.concat(a.t0.message,'" occurred.')));case 32:case"end":return a.stop()}}),a,null,[[16,29]])})));return function(t,e){return a.apply(this,arguments)}}())},y.prototype.setSheet=function(t,e,n){this._sheet=t,t?(this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0},"number"==typeof e&&(this._animation.tileWidth=e),"number"==typeof n&&(this._animation.tileHeight=n),this.switchAnimation(0)):this._animation=null},y.prototype.switchAnimation=function(t){var e=this._animation,n=this._sheet[t];e.type=n,e.fpt=n.fpt,e.maxCol=n.col+(n.amount-1),e.col=n.col,e.counter=0,e.onComplete=n.onComplete},y.prototype.setParent=function(t){this._parent=t},y.prototype.getParent=function(){return this._parent},y.prototype.setCanvas=function(t){this.canvas=t},y.prototype.setConstraint=function(t,e,n,i){return this._constraint={left:t,top:e,width:n,height:i},this._bounds.left=Math.max(t,this._bounds.left),this._bounds.top=Math.max(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()},y.prototype.getConstraint=function(){return this._constraint},y.prototype.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=null),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.canvas&&this.canvas.invalidate(),this},y.prototype.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.canvas&&this.canvas.invalidate(),t},y.prototype.getChildAt=function(t){return this._children[t]},y.prototype.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},y.prototype.numChildren=function(){return this._children.length},y.prototype.contains=function(t){return this._children.indexOf(t)>-1},y.prototype.dispose=function(){if(!this._disposed){this._disposed=!0,this._parent&&this._parent.removeChild(this);for(var t=this._children.length;t--;){var e=this._children[t];e.dispose(),e.next=e.last=null}this._children=[]}},y.prototype.handlePress=function(t,e){},y.prototype.handleRelease=function(t,e){},y.prototype.handleClick=function(){},y.prototype.handleMove=function(t,e){var n=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),i=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(n,i)},y.prototype.handleInteraction=function(t,e,n){var i,r=this.getX(),o=this.getY(),s=this._children.length;if(s>0)for(i=this._children[s-1];i;){if(i.handleInteraction(t,e,n))return!0;i=i.last}if(!this._interactive)return!1;if(this.isDragging&&("touchend"===n.type||"mouseup"===n.type))return this.isDragging=!1,Date.now()-this._dragStartTime<250&&this.handleClick(),this.handleRelease(t,e),!0;var a=this._bounds;if(t>=r&&t<=r+a.width&&e>=o&&e<=o+a.height){if(this.hover=!0,!this.isDragging&&("touchstart"===n.type||"mousedown"===n.type))return this.isDragging=!0,this._dragStartTime=Date.now(),this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e},this.handlePress(t,e),!0}else this.hover=!1;return!(!this._draggable||!this.isDragging)&&(this.handleMove(t,e),!0)},y.prototype.updateAnimation=function(){var t=this._animation;++t.counter===t.fpt&&(++t.col,t.counter=0),t.col>t.maxCol&&(t.col=t.type.col,"function"==typeof t.onComplete&&t.onComplete(this))},y.prototype.drawOutline=function(t){t.lineWidth=1,t.strokeStyle="#FF0000",t.strokeRect(this.getX(),this.getY(),this.getWidth(),this.getHeight())};var b=document.createElement("canvas"),x=b.getContext("2d"),E=function(t,e){var n=t.getBitmap(),i=t.getBounds(),r=parseInt(e.left-i.left),o=parseInt(e.top-i.top),s=parseInt(e.width),a=parseInt(e.height);0===s&&(s=1),0===a&&(a=1);var h=!(n instanceof window.HTMLCanvasElement),u=h?b:n,d=h?x:n.getContext("2d");h&&(u.width=i.width,u.height=i.height,d.clearRect(0,0,b.width,b.height),d.drawImage(n,0,0,i.width,i.height));for(var c=d.getImageData(r,o,s,a).data,l=new Array(parseInt(s*a)),p=0,f=0;f<a;++f)for(var v=0;v<s;++v){var g=4*(f*s+v);l[p]=c[g+3]<<24|c[g]<<16|c[g+1]<<8|c[g+2],++p}return l},C={pixelCollision:function(t,e,n){var i=t.getIntersection(e);if(null===i)return!1;var r=E(t,i),o=E(e,i),s=0;if(!0===n)for(var a=0;a<i.height;++a)for(var h=0;h<i.width;++h){if(0!==r[s]&&0!==o[s])return{x:h,y:a};++s}else for(;s<r.length;++s)if(0!==r[s]&&0!==o[s])return!0;return!1},getChildrenUnderPoint:function(t,e,n,i,r,o){for(var s,a,h,u,d,c=[],l=t.length;l--;)a=(s=t[l]).getX(),h=s.getY(),u=s.getWidth(),d=s.getHeight(),a<e+i&&a+u>e&&h<n+r&&h+d>n&&(!o||o&&s.collidable)&&c.push(s);return c}}}]);