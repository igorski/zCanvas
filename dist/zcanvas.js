module.exports=function(t){var e={};function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(i,r,function(e){return t[e]}.bind(null,r));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=3)}([function(t,e,n){t.exports=n(2)},function(t,e){function n(t,e,n,i,r,o,s){try{var a=t[o](s),h=a.value}catch(t){return void n(t)}a.done?e(h):Promise.resolve(h).then(i,r)}t.exports=function(t){return function(){var e=this,i=arguments;return new Promise((function(r,o){var s=t.apply(e,i);function a(t){n(s,r,o,a,h,"next",t)}function h(t){n(s,r,o,a,h,"throw",t)}a(void 0)}))}}},function(t,e,n){var i=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},r=i.iterator||"@@iterator",o=i.asyncIterator||"@@asyncIterator",s=i.toStringTag||"@@toStringTag";function a(t,e,n,i){var r=e&&e.prototype instanceof d?e:d,o=Object.create(r.prototype),s=new x(i||[]);return o._invoke=function(t,e,n){var i="suspendedStart";return function(r,o){if("executing"===i)throw new Error("Generator is already running");if("completed"===i){if("throw"===r)throw o;return C()}for(n.method=r,n.arg=o;;){var s=n.delegate;if(s){var a=y(s,n);if(a){if(a===u)continue;return a}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===i)throw i="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);i="executing";var d=h(t,e,n);if("normal"===d.type){if(i=n.done?"completed":"suspendedYield",d.arg===u)continue;return{value:d.arg,done:n.done}}"throw"===d.type&&(i="completed",n.method="throw",n.arg=d.arg)}}}(t,n,s),o}function h(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=a;var u={};function d(){}function c(){}function l(){}var p={};p[r]=function(){return this};var f=Object.getPrototypeOf,v=f&&f(f(E([])));v&&v!==e&&n.call(v,r)&&(p=v);var g=l.prototype=d.prototype=Object.create(p);function _(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function m(t,e){var i;this._invoke=function(r,o){function s(){return new e((function(i,s){!function i(r,o,s,a){var u=h(t[r],t,o);if("throw"!==u.type){var d=u.arg,c=d.value;return c&&"object"==typeof c&&n.call(c,"__await")?e.resolve(c.__await).then((function(t){i("next",t,s,a)}),(function(t){i("throw",t,s,a)})):e.resolve(c).then((function(t){d.value=t,s(d)}),(function(t){return i("throw",t,s,a)}))}a(u.arg)}(r,o,i,s)}))}return i=i?i.then(s,s):s()}}function y(t,e){var n=t.iterator[e.method];if(void 0===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,y(t,e),"throw"===e.method))return u;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return u}var i=h(n,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,u;var r=i.arg;return r?r.done?(e[t.resultName]=r.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,u):r:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,u)}function w(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function b(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function x(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(w,this),this.reset(!0)}function E(t){if(t){var e=t[r];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var i=-1,o=function e(){for(;++i<t.length;)if(n.call(t,i))return e.value=t[i],e.done=!1,e;return e.value=void 0,e.done=!0,e};return o.next=o}}return{next:C}}function C(){return{value:void 0,done:!0}}return c.prototype=g.constructor=l,l.constructor=c,l[s]=c.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===c||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,l):(t.__proto__=l,s in t||(t[s]="GeneratorFunction")),t.prototype=Object.create(g),t},t.awrap=function(t){return{__await:t}},_(m.prototype),m.prototype[o]=function(){return this},t.AsyncIterator=m,t.async=function(e,n,i,r,o){void 0===o&&(o=Promise);var s=new m(a(e,n,i,r),o);return t.isGeneratorFunction(n)?s:s.next().then((function(t){return t.done?t.value:s.next()}))},_(g),g[s]="Generator",g[r]=function(){return this},g.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var i=e.pop();if(i in t)return n.value=i,n.done=!1,n}return n.done=!0,n}},t.values=E,x.prototype={constructor:x,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(b),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function i(n,i){return s.type="throw",s.arg=t,e.next=n,i&&(e.method="next",e.arg=void 0),!!i}for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r],s=o.completion;if("root"===o.tryLoc)return i("end");if(o.tryLoc<=this.prev){var a=n.call(o,"catchLoc"),h=n.call(o,"finallyLoc");if(a&&h){if(this.prev<o.catchLoc)return i(o.catchLoc,!0);if(this.prev<o.finallyLoc)return i(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return i(o.catchLoc,!0)}else{if(!h)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return i(o.finallyLoc)}}}},abrupt:function(t,e){for(var i=this.tryEntries.length-1;i>=0;--i){var r=this.tryEntries[i];if(r.tryLoc<=this.prev&&n.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var s=o?o.completion:{};return s.type=t,s.arg=e,o?(this.method="next",this.next=o.finallyLoc,u):this.complete(s)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),u},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),b(n),u}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var i=n.completion;if("throw"===i.type){var r=i.arg;b(n)}return r}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:E(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=void 0),u}},t}(t.exports);try{regeneratorRuntime=i}catch(t){Function("r","regeneratorRuntime = r")(i)}},function(t,e,n){"use strict";function i(){this._eventMappings=[],this._disposed=!1}n.r(e),n.d(e,"canvas",(function(){return h})),n.d(e,"sprite",(function(){return x})),n.d(e,"loader",(function(){return v})),n.d(e,"collision",(function(){return I}));var r=i;i.prototype.addEventListener=function(t,e,n){if(!this.hasEventListener(t,e)){if(t.addEventListener)t.addEventListener(e,n,!1);else{if(!t.attachEvent)return!1;t.attachEvent("on".concat(e),n)}return this._eventMappings.push({element:t,type:e,listener:n}),!0}return!1},i.prototype.hasEventListener=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type==e)return!0}return!1},i.prototype.removeEventListener=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type===e){if(t.removeEventListener)t.removeEventListener(e,i.listener,!1);else{if(!t.detachEvent)return!1;t.detachEvent("on".concat(e),i.listener)}return this._eventMappings.splice(n,1),!0}}return!1},i.prototype.dispose=function(){if(!this._disposed){this._disposed=!0;for(var t=this._eventMappings.length;t--;){var e=this._eventMappings[t];this.removeEventListener(e.element,e.type)}this._eventMappings=null}};var o={extend:function(t,e){function n(){}n.prototype=e.prototype,t.superClass_=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.super=function(t,n,i){for(var r=new Array(arguments.length-2),o=2;o<arguments.length;o++)r[o-2]=arguments[o];return e.prototype[n].apply(t,r)},t.extend=function(e){o.extend(e,t)}}},s=o;function a(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,n=void 0===e?300:e,i=t.height,r=void 0===i?300:i,o=t.fps,s=void 0===o?60:o,a=t.scale,h=void 0===a?1:a,u=t.backgroundColor,d=void 0===u?null:u,c=t.animate,l=void 0!==c&&c,p=t.smoothing,f=void 0===p||p,v=t.stretchToFit,g=void 0!==v&&v,_=t.preventEventBubbling,m=void 0!==_&&_,y=t.parentElement,w=void 0===y?null:y,b=t.debug,x=void 0!==b&&b,E=t.onUpdate,C=void 0===E?null:E;if(n<=0||r<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=x,this._fps=s,this._animate=l,this._smoothing=f,this._updateHandler=C,this._renderHandler=this.render.bind(this),this._lastRender=0,this._renderId=0,this._renderPending=!1,this._renderInterval=1e3/this._fps,this._disposed=!1,this._scale={x:h,y:h},this._children=[],this._element=document.createElement("canvas"),this._canvasContext=this._element.getContext("2d"),d&&this.setBackgroundColor(d);var L=this._canvasContext,I=window.devicePixelRatio||1,M=L.webkitBackingStorePixelRatio||L.mozBackingStorePixelRatio||L.msBackingStorePixelRatio||L.oBackingStorePixelRatio||L.backingStorePixelRatio||1,S=I/M;this._HDPIscaleRatio=I!==M?S:1,this.setDimensions(n,r,!0,!0),1!==h&&this.scale(h,h),this.stretchToFit(g),w instanceof Element&&this.insertInPage(w),this.setSmoothing(f),this.preventEventBubbling(m),this.addListeners(),this._animate&&this.render()}var h=a;function u(t){var e=t._HDPIscaleRatio,n=t._enqueuedSize,i=n.width,r=n.height;t._enqueuedSize=null,t._width=i,t._height=r;var o=t._element;o.width=i*e,o.height=r*e,o.style.width="".concat(i,"px"),o.style.height="".concat(r,"px"),t._canvasContext.scale(e,e),!1===t._smoothing&&t.setSmoothing(t._smoothing)}a.extend=function(t){s.extend(t,a)},a.prototype.insertInPage=function(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)},a.prototype.getElement=function(){return this._element},a.prototype.preventEventBubbling=function(t){this._preventDefaults=t},a.prototype.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=null,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this},a.prototype.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.invalidate(),t},a.prototype.getChildAt=function(t){return this._children[t]},a.prototype.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},a.prototype.numChildren=function(){return this._children.length},a.prototype.getChildren=function(){return this._children},a.prototype.contains=function(t){return this._children.indexOf(t)>-1},a.prototype.invalidate=function(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},a.prototype.getFrameRate=function(){return this._fps},a.prototype.getRenderInterval=function(){return this._renderInterval},a.prototype.setSmoothing=function(t){this._smoothing=t;var e=this._element.style,n=this._canvasContext;["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"].forEach((function(e){void 0!==n[e]&&(n[e]=t)})),["-moz-crisp-edges","-webkit-crisp-edges","pixelated","crisp-edges"].forEach((function(n){e["image-rendering"]=t?void 0:n})),this.invalidate()},a.prototype.getWidth=function(){return this._enqueuedSize?this._enqueuedSize.width:this._width},a.prototype.getHeight=function(){return this._enqueuedSize?this._enqueuedSize.height:this._height},a.prototype.setDimensions=function(t,e){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],i=arguments.length>3&&void 0!==arguments[3]&&arguments[3];this._enqueuedSize={width:t,height:e},!0===n&&(this._preferredWidth=t,this._preferredHeight=e),!0===i&&u(this),this.invalidate()},a.prototype.setViewport=function(t,e,n,i){this._viewport={left:t,top:e,width:n,height:i,right:t+n,bottom:e+i}},a.prototype.setBackgroundColor=function(t){this._bgColor=t},a.prototype.setAnimatable=function(t){var e=this._animate;this._animate=t,!t||e||this._renderPending||this._renderHandler()},a.prototype.isAnimatable=function(){return this._animate},a.prototype.drawImage=function(t,e,n,i,r,o,s,a,h){if(e=.5+e<<0,n=.5+n<<0,r=.5+r<<0,!((i=.5+i<<0)<=0||r<=0))if("number"==typeof o){var u=(i=Math.min(this._canvasContext.canvas.width,i))/a,d=(r=Math.min(this._canvasContext.canvas.height,r))/h;o+a>t.width&&(i-=u*(o+a-t.width),a-=o+a-t.width),s+h>t.height&&(r-=d*(s+h-t.height),h-=s+h-t.height),this._canvasContext.drawImage(t,o,s,a,h,e,n,i,r)}else this._canvasContext.drawImage(t,e,n,i,r)},a.prototype.scale=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t;this._scale={x:t,y:e};var n=1===t&&1===e?"":"scale(".concat(t,", ").concat(e,")"),i=this._element.style;i["-webkit-transform-origin"]=i["transform-origin"]="0 0",i["-webkit-transform"]=i.transform=n,this._stretchToFit?this.stretchToFit(!0,this._maintainRatio):this.invalidate()},a.prototype.stretchToFit=function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this._stretchToFit=t,this._maintainRatio=e;var n,i,r=this._preferredWidth,o=this._preferredHeight,s=this._scale,a=s.x,h=s.y,u=window,d=u.innerWidth,c=u.innerHeight;if(e&&t){var l=Math.min(d/r,c/o);n=r*l,i=o*l}else n=t?d/a:r,i=t?c/h:o;this.setDimensions(Math.round(n),Math.round(i),!1)},a.prototype.dispose=function(){if(!this._disposed){this._animate=!1,window.cancelAnimationFrame(this._renderId),this.removeListeners();for(var t=this.numChildren();t--;)this._children[t].dispose();this._children=[],this._element.parentNode&&this._element.parentNode.removeChild(this._element),this._disposed=!0}},a.prototype.handleInteraction=function(t){var e,n=this._children.length;if(n>0)switch(e=this._children[n-1],t.type){default:var i=0,r=0,o=t.touches.length>0?t.touches:t.changedTouches,s=0,a=o.length;if(a>0){var h=this.getCoordinate();for(s=0;s<a;++s){for(i=o[s].pageX-h.x,r=o[s].pageY-h.y;e&&!e.handleInteraction(i,r,t);)e=e.last;e=this._children[n-1]}}break;case"mousedown":case"mousemove":case"mouseup":for(var u=t.offsetX,d=t.offsetY;e&&!e.handleInteraction(u,d,t);)e=e.last}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this._animate||this.invalidate()},a.prototype.render=function(){var t=Date.now(),e=t-this._lastRender;this._renderPending=!1,this._lastRender=t-e%this._renderInterval,this._enqueuedSize&&u(this);var n,i=this._canvasContext;if(i){var r=this._width,o=this._height;this.renderVisiblesOnly;this._bgColor?(i.fillStyle=this._bgColor,i.fillRect(0,0,r,o)):i.clearRect(0,0,r,o);var s="function"==typeof this._updateHandler;for(s&&this._updateHandler(t),n=this._children[0];n;)s||n.update(t),n.draw(i,this._viewport),n=n.next}this._disposed||!this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},a.prototype.addListeners=function(){var t=this;this._eventHandler||(this._eventHandler=new r);var e=this.handleInteraction.bind(this);if("ontouchstart"in window&&(this._eventHandler.addEventListener(this._element,"touchstart",e),this._eventHandler.addEventListener(this._element,"touchmove",e),this._eventHandler.addEventListener(this._element,"touchend",e)),this._eventHandler.addEventListener(this._element,"mousedown",e),this._eventHandler.addEventListener(this._element,"mousemove",e),this._eventHandler.addEventListener(window,"mouseup",e),this._stretchToFit){var n="onorientationchange"in window?"orientationchange":"resize";this._eventHandler.addEventListener(window,n,(function(){t.stretchToFit(t._stretchToFit,t._maintainRatio)}))}},a.prototype.removeListeners=function(){this._eventHandler&&this._eventHandler.dispose(),this._eventHandler=null},a.prototype.getCoordinate=function(){for(var t=0,e=0,n=this._element;n.offsetParent;)t+=n.offsetLeft,e+=n.offsetTop,n=n.offsetParent;return{x:t+=n.offsetLeft,y:e+=n.offsetTop}};var d=n(0),c=n.n(d),l=n(1),p=n.n(l),f={loadImage:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,i){if(e instanceof window.Image&&f.isReady(e))n(m(e));else{var o=e||new window.Image,s=_(t),a=new r,h=function(){var t=p()(c.a.mark((function t(){return c.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return a.dispose(),t.prev=1,t.next=4,f.onReady(o);case 4:n(m(o)),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(1),i(t.t0);case 10:case"end":return t.stop()}}),t,null,[[1,7]])})));return function(){return t.apply(this,arguments)}}(),u=!s||/^((?!jsdom).)*$/.test(window.navigator.userAgent);u&&(s||g(t,o),a.addEventListener(o,"load",h),a.addEventListener(o,"error",(function(t){a.dispose(),i(t)}))),o.src=t,u||n(m(o))}}))},isReady:function(t){return!("boolean"==typeof t.complete&&!t.complete)&&!(void 0!==t.naturalWidth&&0===t.naturalWidth)},onReady:function(t,e,n){return p()(c.a.mark((function e(){return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){var i=0;!function r(){f.isReady(t)?e():60==++i?n(new Error("Image could not be resolved. This shouldn't occur.")):window.requestAnimationFrame(r)}()})));case 1:case"end":return e.stop()}}),e)})))()}},v=f;function g(t,e){(function(t){var e=window.location;if("./"===t.substr(0,2)||0===t.indexOf("".concat(e.protocol,"//").concat(e.host)))return!0;var n=t.split("#")[0].split("?")[0];if(n.includes(".html")){var i=n.split("/"),r=i.length;n=n.split(i[r-1]).join("")}if(n){var o=n.match(/^http[s]?:/);if(Array.isArray(o)&&o.length>0)return!1}return!0})(t)||(e.crossOrigin="Anonymous")}function _(t){var e=("string"==typeof t?t:t.src).substr(0,5);return"data:"===e||"blob:"===e}function m(t){var e={image:t,size:null};return t instanceof window.HTMLImageElement&&(e.size=function(t){return{width:t.width||t.naturalWidth,height:t.height||t.naturalHeight}}(t)),e}var y=function(t,e){var n=t.left,i=t.top;return n+t.width>=e.left&&n<=e.right&&i+t.height>=e.top&&i<=e.bottom},w=function(t,e){var n=t.left,i=t.top,r=t.width,o=t.height,s=e.left,a=e.top,h=e.width,u=e.height;return{src:{left:n>s?0:s-n,top:i>a?0:a-i,width:r=n>s?Math.min(r,h-(n-s)):Math.min(h,r-(s-n)),height:o=i>a?Math.min(o,u-(i-a)):Math.min(u,o-(a-i))},dest:{left:Math.max(n,s),top:Math.max(i,a),width:r,height:o}}};function b(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,n=t.height,i=t.x,r=void 0===i?0:i,o=t.y,s=void 0===o?0:o,a=t.bitmap,h=void 0===a?null:a,u=t.collidable,d=void 0!==u&&u,c=t.interactive,l=void 0!==c&&c,p=t.mask,f=void 0!==p&&p,v=t.sheet,g=void 0===v?[]:v,_=t.sheetTileWidth,m=void 0===_?0:_,y=t.sheetTileHeight,w=void 0===y?0:y;if(e<=0||n<=0)throw new Error("cannot construct a zSprite without valid dimensions");if(this._children=[],this._disposed=!1,this.collidable=d,this.hover=!1,this._mask=f,this._bounds={left:0,top:0,width:e,height:n},this._parent=null,this.last=null,this.next=null,this.canvas=null,this._bitmap,this._bitmapReady=!1,this._draggable=!1,this._keepInBounds=!1,this.isDragging=!1,this.setX(r),this.setY(s),this.setInteractive(l),h&&this.setBitmap(h),Array.isArray(g)&&g.length>0){if(!h)throw new Error("cannot use a spritesheet without a valid Bitmap");this.setSheet(g,m,w)}}var x=b;b.extend=function(t){s.extend(t,b)},b.prototype.getDraggable=function(){return this._draggable},b.prototype.setDraggable=function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this._draggable=t,this._keepInBounds=!!this._constraint||e,t&&!this._interactive&&this.setInteractive(!0)},b.prototype.getX=function(){return this._bounds.left},b.prototype.setX=function(t){var e=t-this._bounds.left;if(this._bounds.left=this._constraint?t+this._constraint.left:t,this._children.length>0)for(var n=this._children[0];n;)n.isDragging||n.setX(n._bounds.left+e),n=n.next},b.prototype.getY=function(){return this._bounds.top},b.prototype.setY=function(t){var e=t-this._bounds.top;if(this._bounds.top=this._constraint?t+this._constraint.top:t,this._children.length>0)for(var n=this._children[0];n;)n.isDragging||n.setY(n._bounds.top+e),n=n.next},b.prototype.getWidth=function(){return this._bounds.width},b.prototype.setWidth=function(t){var e=this._bounds.width||0;this._bounds.width=t,0!==e&&(this._bounds.left-=.5*t-.5*e),this.invalidate()},b.prototype.getHeight=function(){return this._bounds.height},b.prototype.setHeight=function(t){var e=this._bounds.height||0;this._bounds.height=t,0!==e&&(this._bounds.top-=.5*t-.5*e),this.invalidate()},b.prototype.setBounds=function(t,e,n,i){if(this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");"number"==typeof n&&(this._bounds.width=n),"number"==typeof i&&(this._bounds.height=i);var r=this._bounds.width,o=this._bounds.height,s=this._constraint?this._constraint.width:this.canvas.width,a=this._constraint?this._constraint.height:this.canvas.height;if(this._keepInBounds){var h=Math.min(0,-(r-s)),u=Math.min(0,-(o-a)),d=s-r,c=a-o;t=Math.min(d,Math.max(t,h)),e=Math.min(c,Math.max(e,u))}else t>s&&(t+=.5*r),e>a&&(e+=.5*o);this.setX(t),this.setY(e)},b.prototype.getBounds=function(){return this._bounds},b.prototype.getInteractive=function(){return this._interactive},b.prototype.setInteractive=function(t){this._interactive=t},b.prototype.update=function(t){if(this._children.length>0)for(var e=this._children[0];e;)e.update(t),e=e.next;this._animation&&this.updateAnimation()},b.prototype.draw=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(this.canvas){var n=this._bounds,i=this._bitmapReady;if(i&&e&&(i=y(this._bounds,e)),t.save(),this._mask&&(t.globalCompositeOperation="destination-in"),i){var r=this._animation,o=n.left,s=n.top,a=n.width,h=n.height;if(r){var u=r.tileWidth?r.tileWidth:.5+a<<0,d=r.tileHeight?r.tileHeight:.5+h<<0;t.drawImage(this._bitmap,r.col*u,r.type.row*d,u,d,.5+o<<0,.5+s<<0,.5+a<<0,.5+h<<0)}else if(e){var c=w(n,e),l=c.src,p=c.dest;t.drawImage(this._bitmap,.5+l.left<<0,.5+l.top<<0,.5+l.width<<0,.5+l.height<<0,.5+p.left<<0,.5+p.top<<0,.5+p.width<<0,.5+p.height<<0)}else t.drawImage(this._bitmap,.5+o<<0,.5+s<<0,.5+a<<0,.5+h<<0)}for(var f=this._children[0];f;)f.draw(t,e),f=f.next;this._mask&&(t.globalCompositeOperation="source-over"),t.restore(),this.canvas.DEBUG&&this.drawOutline(t)}},b.prototype.collidesWith=function(t){if(t===this)return!1;var e=this._bounds,n=t.getBounds();return!(e.top+e.height<n.top||e.top>n.top+n.height||e.left+e.width<n.left||e.left>n.left+n.width)},b.prototype.getIntersection=function(t){if(this.collidesWith(t)){var e=this._bounds,n=t.getBounds(),i=Math.max(e.left,n.left),r=Math.max(e.top,n.top);return{left:i,top:r,width:Math.min(e.left+e.width,n.width+n.height)-i,height:Math.min(e.top+e.height,n.top+n.height)-r}}return null},b.prototype.collidesWithEdge=function(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1},b.prototype.getBitmap=function(){return this._bitmap},b.prototype.setBitmap=function(t,e,n){var i=this,r=t instanceof window.HTMLCanvasElement,o=t instanceof window.HTMLImageElement;if(t&&!r&&!o&&!("string"==typeof t))throw new Error('expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "'.concat(t,'" instead'));return new Promise(function(){var s=p()(c.a.mark((function s(a,h){var u,d,l,p,f,g,_;return c.a.wrap((function(s){for(;;)switch(s.prev=s.next){case 0:if(i._bitmap!==t&&(i._bitmapReady=!1),t){s.next=4;break}return i._bitmap=null,s.abrupt("return");case 4:if(d="number"==typeof n,(u="number"==typeof e)&&i.setWidth(e),d&&i.setHeight(n),i._keepInBounds&&i.canvas&&(u||d)&&(l=-(i._bounds.width-i.canvas.getWidth()),p=-(i._bounds.height-i.canvas.getHeight()),i._bounds.left>0?i._bounds.left=0:i._bounds.left<l&&(i._bounds.left=l),i._bounds.top>0?i._bounds.top=0:i._bounds.top<p&&(i._bounds.top=p)),!r){s.next=15;break}return i._bitmap=t,i._bitmapReady=!0,s.abrupt("return",a());case 15:return s.prev=15,s.next=18,v.loadImage(o?t.src:t,o?t:null);case 18:return f=s.sent,g=f.size,_=f.image,i._bitmap=_,i._bitmapReady=!0,i._bitmapWidth=g.width,i._bitmapHeight=g.height,i.invalidate(),s.abrupt("return",a());case 29:s.prev=29,s.t0=s.catch(15),h(new Error('zSprite.setBitmap() "'.concat(s.t0.message,'" occurred.')));case 32:case"end":return s.stop()}}),s,null,[[15,29]])})));return function(t,e){return s.apply(this,arguments)}}())},b.prototype.setSheet=function(t,e,n){this._sheet=t,t?(this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0},"number"==typeof e&&(this._animation.tileWidth=e),"number"==typeof n&&(this._animation.tileHeight=n),this.switchAnimation(0)):this._animation=null},b.prototype.switchAnimation=function(t){var e=this._animation,n=this._sheet[t];e.type=n,e.fpt=n.fpt,e.maxCol=n.col+(n.amount-1),e.col=n.col,e.counter=0,e.onComplete=n.onComplete},b.prototype.setParent=function(t){this._parent=t},b.prototype.getParent=function(){return this._parent},b.prototype.setCanvas=function(t){this.canvas=t},b.prototype.setConstraint=function(t,e,n,i){return this._constraint={left:t,top:e,width:n,height:i},this._bounds.left=Math.max(t,this._bounds.left),this._bounds.top=Math.max(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()},b.prototype.getConstraint=function(){return this._constraint},b.prototype.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=null),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.invalidate(),this},b.prototype.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.invalidate(),t},b.prototype.getChildAt=function(t){return this._children[t]},b.prototype.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},b.prototype.numChildren=function(){return this._children.length},b.prototype.contains=function(t){return this._children.indexOf(t)>-1},b.prototype.dispose=function(){if(!this._disposed){this._disposed=!0,this._parent&&this._parent.removeChild(this);for(var t=this._children.length;t--;){var e=this._children[t];e.dispose(),e.next=e.last=null}this._children=[]}},b.prototype.handlePress=function(t,e){},b.prototype.handleRelease=function(t,e){},b.prototype.handleClick=function(){},b.prototype.handleMove=function(t,e){var n=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),i=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(n,i,this._bounds.width,this._bounds.height)},b.prototype.handleInteraction=function(t,e,n){var i,r=this.getX(),o=this.getY(),s=this._children.length;if(s>0)for(i=this._children[s-1];i;){if(i.handleInteraction(t,e,n))return!0;i=i.last}if(!this._interactive)return!1;if(this._pressed&&("touchend"===n.type||"mouseup"===n.type))return this._pressed=!1,this.isDragging&&(this.isDragging=!1),Date.now()-this._pressTime<250&&this.handleClick(),this.handleRelease(t,e),!0;var a=this._bounds;if(t>=r&&t<=r+a.width&&e>=o&&e<=o+a.height){if(this.hover=!0,"touchstart"===n.type||"mousedown"===n.type)return this._pressTime=Date.now(),this._pressed=!0,this._draggable&&(this.isDragging=!0,this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e}),this.handlePress(t,e),!0}else this.hover=!1;return!!this.isDragging&&(this.handleMove(t,e),!0)},b.prototype.updateAnimation=function(){var t=this._animation;++t.counter===t.fpt&&(++t.col,t.counter=0),t.col>t.maxCol&&(t.col=t.type.col,"function"==typeof t.onComplete&&t.onComplete(this))},b.prototype.invalidate=function(){this.canvas&&this.canvas.invalidate()},b.prototype.drawOutline=function(t){t.lineWidth=1,t.strokeStyle="#FF0000",t.strokeRect(this.getX(),this.getY(),this.getWidth(),this.getHeight())};var E=document.createElement("canvas"),C=E.getContext("2d"),L=function(t,e){var n=t.getBitmap(),i=t.getBounds(),r=parseInt(e.left-i.left),o=parseInt(e.top-i.top),s=parseInt(e.width),a=parseInt(e.height);0===s&&(s=1),0===a&&(a=1);var h=!(n instanceof window.HTMLCanvasElement),u=h?E:n,d=h?C:n.getContext("2d");h&&(u.width=i.width,u.height=i.height,d.clearRect(0,0,E.width,E.height),d.drawImage(n,0,0,i.width,i.height));for(var c=d.getImageData(r,o,s,a).data,l=new Array(parseInt(s*a)),p=0,f=0;f<a;++f)for(var v=0;v<s;++v){var g=4*(f*s+v);l[p]=c[g+3]<<24|c[g]<<16|c[g+1]<<8|c[g+2],++p}return l},I={pixelCollision:function(t,e,n){var i=t.getIntersection(e);if(null===i)return!1;var r=L(t,i),o=L(e,i),s=0;if(!0===n)for(var a=0;a<i.height;++a)for(var h=0;h<i.width;++h){if(0!==r[s]&&0!==o[s])return{x:h,y:a};++s}else for(;s<r.length;++s)if(0!==r[s]&&0!==o[s])return!0;return!1},getChildrenUnderPoint:function(t,e,n,i,r,o){for(var s,a,h,u,d,c=[],l=t.length;l--;)a=(s=t[l]).getX(),h=s.getY(),u=s.getWidth(),d=s.getHeight(),a<e+i&&a+u>e&&h<n+r&&h+d>n&&(!o||o&&s.collidable)&&c.push(s);return c}}}]);