define((function(){return function(t){var e={};function n(i){if(e[i])return e[i].exports;var r=e[i]={i:i,l:!1,exports:{}};return t[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(i,r,function(e){return t[e]}.bind(null,r));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=3)}([function(t,e,n){t.exports=n(2)},function(t,e){function n(t,e,n,i,r,o,s){try{var a=t[o](s),h=a.value}catch(t){return void n(t)}a.done?e(h):Promise.resolve(h).then(i,r)}t.exports=function(t){return function(){var e=this,i=arguments;return new Promise((function(r,o){var s=t.apply(e,i);function a(t){n(s,r,o,a,h,"next",t)}function h(t){n(s,r,o,a,h,"throw",t)}a(void 0)}))}}},function(t,e,n){var i=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},r=i.iterator||"@@iterator",o=i.asyncIterator||"@@asyncIterator",s=i.toStringTag||"@@toStringTag";function a(t,e,n,i){var r=e&&e.prototype instanceof d?e:d,o=Object.create(r.prototype),s=new x(i||[]);return o._invoke=function(t,e,n){var i="suspendedStart";return function(r,o){if("executing"===i)throw new Error("Generator is already running");if("completed"===i){if("throw"===r)throw o;return E()}for(n.method=r,n.arg=o;;){var s=n.delegate;if(s){var a=w(s,n);if(a){if(a===u)continue;return a}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if("suspendedStart"===i)throw i="completed",n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);i="executing";var d=h(t,e,n);if("normal"===d.type){if(i=n.done?"completed":"suspendedYield",d.arg===u)continue;return{value:d.arg,done:n.done}}"throw"===d.type&&(i="completed",n.method="throw",n.arg=d.arg)}}}(t,n,s),o}function h(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=a;var u={};function d(){}function c(){}function l(){}var f={};f[r]=function(){return this};var p=Object.getPrototypeOf,v=p&&p(p(C([])));v&&v!==e&&n.call(v,r)&&(f=v);var g=l.prototype=d.prototype=Object.create(f);function _(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function m(t,e){var i;this._invoke=function(r,o){function s(){return new e((function(i,s){!function i(r,o,s,a){var u=h(t[r],t,o);if("throw"!==u.type){var d=u.arg,c=d.value;return c&&"object"==typeof c&&n.call(c,"__await")?e.resolve(c.__await).then((function(t){i("next",t,s,a)}),(function(t){i("throw",t,s,a)})):e.resolve(c).then((function(t){d.value=t,s(d)}),(function(t){return i("throw",t,s,a)}))}a(u.arg)}(r,o,i,s)}))}return i=i?i.then(s,s):s()}}function w(t,e){var n=t.iterator[e.method];if(void 0===n){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,w(t,e),"throw"===e.method))return u;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return u}var i=h(n,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,u;var r=i.arg;return r?r.done?(e[t.resultName]=r.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,u):r:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,u)}function y(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function b(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function x(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(y,this),this.reset(!0)}function C(t){if(t){var e=t[r];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var i=-1,o=function e(){for(;++i<t.length;)if(n.call(t,i))return e.value=t[i],e.done=!1,e;return e.value=void 0,e.done=!0,e};return o.next=o}}return{next:E}}function E(){return{value:void 0,done:!0}}return c.prototype=g.constructor=l,l.constructor=c,l[s]=c.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===c||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,l):(t.__proto__=l,s in t||(t[s]="GeneratorFunction")),t.prototype=Object.create(g),t},t.awrap=function(t){return{__await:t}},_(m.prototype),m.prototype[o]=function(){return this},t.AsyncIterator=m,t.async=function(e,n,i,r,o){void 0===o&&(o=Promise);var s=new m(a(e,n,i,r),o);return t.isGeneratorFunction(n)?s:s.next().then((function(t){return t.done?t.value:s.next()}))},_(g),g[s]="Generator",g[r]=function(){return this},g.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var i=e.pop();if(i in t)return n.value=i,n.done=!1,n}return n.done=!0,n}},t.values=C,x.prototype={constructor:x,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(b),!t)for(var e in this)"t"===e.charAt(0)&&n.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function i(n,i){return s.type="throw",s.arg=t,e.next=n,i&&(e.method="next",e.arg=void 0),!!i}for(var r=this.tryEntries.length-1;r>=0;--r){var o=this.tryEntries[r],s=o.completion;if("root"===o.tryLoc)return i("end");if(o.tryLoc<=this.prev){var a=n.call(o,"catchLoc"),h=n.call(o,"finallyLoc");if(a&&h){if(this.prev<o.catchLoc)return i(o.catchLoc,!0);if(this.prev<o.finallyLoc)return i(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return i(o.catchLoc,!0)}else{if(!h)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return i(o.finallyLoc)}}}},abrupt:function(t,e){for(var i=this.tryEntries.length-1;i>=0;--i){var r=this.tryEntries[i];if(r.tryLoc<=this.prev&&n.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var o=r;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var s=o?o.completion:{};return s.type=t,s.arg=e,o?(this.method="next",this.next=o.finallyLoc,u):this.complete(s)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),u},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),b(n),u}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var i=n.completion;if("throw"===i.type){var r=i.arg;b(n)}return r}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:C(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=void 0),u}},t}(t.exports);try{regeneratorRuntime=i}catch(t){Function("r","regeneratorRuntime = r")(i)}},function(t,e,n){"use strict";function i(){this._eventMappings=[],this._disposed=!1}n.r(e),n.d(e,"canvas",(function(){return l})),n.d(e,"sprite",(function(){return L})),n.d(e,"loader",(function(){return y})),n.d(e,"collision",(function(){return B}));var r=i,o=i.prototype;o.add=function(t,e,n){return!this.has(t,e)&&(t.addEventListener(e,n,!1),this._eventMappings.push({element:t,type:e,listener:n}),!0)},o.has=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type==e)return!0}return!1},o.remove=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type===e)return t.removeEventListener(e,i.listener,!1),this._eventMappings.splice(n,1),!0}return!1},o.dispose=function(){if(!this._disposed){this._disposed=!0;for(var t=this._eventMappings.length;t--;){var e=this._eventMappings[t];this.remove(e.element,e.type)}this._eventMappings=null}};var s={extend:function(t,e){function n(){}n.prototype=e.prototype,t.superClass_=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.super=function(t,n,i){for(var r=new Array(arguments.length-2),o=2;o<arguments.length;o++)r[o-2]=arguments[o];return e.prototype[n].apply(t,r)},t.extend=function(e){s.extend(e,t)}}},a=s,h=Math.min,u=Math.max,d=Math.round;function c(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,n=void 0===e?300:e,i=t.height,r=void 0===i?300:i,o=t.fps,s=void 0===o?60:o,a=t.scale,h=void 0===a?1:a,u=t.backgroundColor,d=void 0===u?null:u,c=t.animate,l=void 0!==c&&c,f=t.smoothing,p=void 0===f||f,v=t.stretchToFit,g=void 0!==v&&v,_=t.viewport,m=void 0===_?null:_,w=t.handler,y=void 0===w?null:w,b=t.preventEventBubbling,x=void 0!==b&&b,C=t.parentElement,E=void 0===C?null:C,I=t.debug,S=void 0!==I&&I,P=t.onUpdate,k=void 0===P?null:P;if(n<=0||r<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=S,this._fps=s,this._animate=l,this._smoothing=p,this._updateHandler=k,this._renderHandler=this.render.bind(this),this._lastRender=0,this._renderId=0,this._renderPending=!1,this._renderInterval=1e3/this._fps,this._disposed=!1,this._scale={x:h,y:h},this._handler=y,this._activeTouches=[],this._children=[],this._element=document.createElement("canvas"),this._canvasContext=this._element.getContext("2d"),d&&this.setBackgroundColor(d);var L=this._canvasContext,H=window.devicePixelRatio||1,T=L.webkitBackingStorePixelRatio||L.mozBackingStorePixelRatio||L.msBackingStorePixelRatio||L.oBackingStorePixelRatio||L.backingStorePixelRatio||1,M=H/T;this._HDPIscaleRatio=H!==T?M:1,this.setDimensions(n,r,!0,!0),m&&this.setViewport(m.width,m.height),1!==h&&this.scale(h,h),g&&this.stretchToFit(!0),E instanceof Element&&this.insertInPage(E),this.setSmoothing(p),this.preventEventBubbling(x),this.addListeners(),this._animate&&this.render()}var l=c,f=c.prototype;function p(t){var e,n,i=t._HDPIscaleRatio,r=t._viewport;if(t._enqueuedSize){var o=t._enqueuedSize;e=o.width,n=o.height,t._enqueuedSize=null,t._width=e,t._height=n}if(r){var s=t._width,a=t._height;e=h(r.width,s),n=h(r.height,a)}if(e&&n){var u=t._element;u.width=e*i,u.height=n*i,u.style.width="".concat(e,"px"),u.style.height="".concat(n,"px")}t._canvasContext.scale(i,i),!1===t._smoothing&&t.setSmoothing(!1)}c.extend=function(t){a.extend(t,c)},f.insertInPage=function(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)},f.getElement=function(){return this._element},f.preventEventBubbling=function(t){this._preventDefaults=t},f.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=null,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this},f.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.invalidate(),t},f.getChildAt=function(t){return this._children[t]},f.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},f.numChildren=function(){return this._children.length},f.getChildren=function(){return this._children},f.contains=function(t){return t._parent===this},f.invalidate=function(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},f.getFrameRate=function(){return this._fps},f.getRenderInterval=function(){return this._renderInterval},f.setSmoothing=function(t){this._smoothing=t;var e=this._element.style,n=this._canvasContext;["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"].forEach((function(e){void 0!==n[e]&&(n[e]=t)})),["-moz-crisp-edges","-webkit-crisp-edges","pixelated","crisp-edges"].forEach((function(n){e["image-rendering"]=t?void 0:n})),this.invalidate()},f.getWidth=function(){return this._enqueuedSize?this._enqueuedSize.width:this._width},f.getHeight=function(){return this._enqueuedSize?this._enqueuedSize.height:this._height},f.setDimensions=function(t,e){var n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],i=arguments.length>3&&void 0!==arguments[3]&&arguments[3];this._enqueuedSize={width:t,height:e},!0===n&&(this._preferredWidth=t,this._preferredHeight=e),!0===i&&p(this),this.invalidate()},f.setViewport=function(t,e){this._viewport={width:t,height:e},this.panViewport(0,0),p(this)},f.panViewport=function(t,e){var n,i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],r=this._viewport;(r.left=u(0,h(t,this._width-r.width)),r.right=r.left+r.width,r.top=u(0,h(e,this._height-r.height)),r.bottom=r.top+r.height,this.invalidate(),i)&&(null===(n=this._handler)||void 0===n||n.call(this,{type:"panned",value:r}))},f.setBackgroundColor=function(t){this._bgColor=t},f.setAnimatable=function(t){var e,n=this._animate;(this._animate=t,!t||n||this._renderPending)||this._renderHandler((null===(e=window.performance)||void 0===e?void 0:e.now())||Date.now())},f.isAnimatable=function(){return this._animate},f.drawImage=function(t,e,n,i,r,o,s,a,u){if(e=.5+e<<0,n=.5+n<<0,r=.5+r<<0,!((i=.5+i<<0)<=0||r<=0)){var d=this._canvasContext;if("number"==typeof o){var c=(i=h(d.canvas.width,i))/a,l=(r=h(d.canvas.height,r))/u;o+a>t.width&&(i-=c*(o+a-t.width),a-=o+a-t.width),s+u>t.height&&(r-=l*(s+u-t.height),u-=s+u-t.height),d.drawImage(t,o,s,a,u,e,n,i,r)}else d.drawImage(t,e,n,i,r)}},f.scale=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t;this._scale={x:t,y:e};var n=1===t&&1===e?"":"scale(".concat(t,", ").concat(e,")"),i=this._element.style;i["-webkit-transform-origin"]=i["transform-origin"]="0 0",i["-webkit-transform"]=i.transform=n,this.invalidate()},f.stretchToFit=function(t){this._stretchToFit=t;var e=window,n=e.innerWidth,i=e.innerHeight,r=this._preferredWidth,o=this._preferredHeight,s=1,a=1;i>n?(s=n/r,a=i/(o=t?i/n*r:o)):(s=n/(r=t?n/i*o:r),a=i/o),this.setDimensions(d(r),d(o),!1,!0),this.scale(s,a)},f.dispose=function(){if(!this._disposed){this._animate=!1,window.cancelAnimationFrame(this._renderId),this.removeListeners();for(var t=this.numChildren();t--;)this._children[t].dispose();this._children=[],this._element.parentNode&&this._element.parentNode.removeChild(this._element),this._disposed=!0}},f.handleInteraction=function(t){var e,n,i=this._children.length,r=this._viewport;if(i>0)switch(n=this._children[i-1],t.type){default:var o=0,s=0,a=t.changedTouches,h=0,u=a.length;if(u>0){var d=this.getCoordinate();for(r&&(d.x-=r.left,d.y-=r.top),h=0;h<u;++h){var c=a[h],l=c.identifier;switch(o=c.pageX-d.x,s=c.pageY-d.y,t.type){case"touchstart":for(;n;){if(!this._activeTouches.includes(n)&&n.handleInteraction(o,s,t)){this._activeTouches[l]=n;break}n=n.last}n=this._children[i-1];break;default:(null===(e=n=this._activeTouches[l])||void 0===e?void 0:e.handleInteraction(o,s,t))&&"touchmove"!==t.type&&(this._activeTouches[l]=null)}}}break;case"mousedown":case"mousemove":case"mouseup":var f=t.offsetX,p=t.offsetY;for(r&&(f+=r.left,p+=r.top);n&&!n.handleInteraction(f,p,t);)n=n.last;break;case"wheel":var v=t.deltaX,g=t.deltaY,_=0===v?0:v>0?20:-20,m=0===g?0:g>0?20:-20;this.panViewport(r.left+_,r.top+m,!0)}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this._animate||this.invalidate()},f.render=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,e=t-this._lastRender;this._renderPending=!1,this._lastRender=t-e%this._renderInterval,this._enqueuedSize&&p(this);var n,i=this._canvasContext;if(i){var r=this._width,o=this._height;this._bgColor?(i.fillStyle=this._bgColor,i.fillRect(0,0,r,o)):i.clearRect(0,0,r,o);var s="function"==typeof this._updateHandler;for(s&&this._updateHandler(t),n=this._children[0];n;)s||n.update(t),n.draw(i,this._viewport),n=n.next}this._disposed||!this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},f.addListeners=function(){var t=this;this._eventHandler||(this._eventHandler=new r);var e=this._eventHandler,n=this.handleInteraction.bind(this),i=this._element;"ontouchstart"in window&&["start","move","end","cancel"].forEach((function(t){e.add(i,"touch".concat(t),n)})),["down","move"].forEach((function(t){e.add(i,"mouse".concat(t),n)})),e.add(window,"mouseup",n),this._viewport&&e.add(i,"wheel",n),this._stretchToFit&&e.add(window,"resize",(function(){t.stretchToFit(t._stretchToFit)}))},f.removeListeners=function(){this._eventHandler&&this._eventHandler.dispose(),this._eventHandler=null},f.getCoordinate=function(){for(var t=0,e=0,n=this._element;n.offsetParent;)t+=n.offsetLeft,e+=n.offsetTop,n=n.offsetParent;return{x:t+=n.offsetLeft,y:e+=n.offsetTop}};var v=n(0),g=n.n(v),_=n(1),m=n.n(_),w={loadImage:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,i){if(e instanceof window.Image&&w.isReady(e))n(C(e));else{var o=e||new window.Image,s=x(t),a=new r,h=function(){var t=m()(g.a.mark((function t(){return g.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return a.dispose(),t.prev=1,t.next=4,w.onReady(o);case 4:n(C(o)),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(1),i(t.t0);case 10:case"end":return t.stop()}}),t,null,[[1,7]])})));return function(){return t.apply(this,arguments)}}(),u=!s||/^((?!jsdom).)*$/.test(window.navigator.userAgent);u&&(s||b(t,o),a.add(o,"load",h),a.add(o,"error",(function(t){a.dispose(),i(t)}))),o.src=t,u||n(C(o))}}))},isReady:function(t){return!("boolean"==typeof t.complete&&!t.complete)&&!(void 0!==t.naturalWidth&&0===t.naturalWidth)},onReady:function(t,e,n){return m()(g.a.mark((function e(){return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){var i=0;!function r(){w.isReady(t)?e():60==++i?n(new Error("Image could not be resolved. This shouldn't occur.")):window.requestAnimationFrame(r)}()})));case 1:case"end":return e.stop()}}),e)})))()}},y=w;function b(t,e){(function(t){var e=window.location;if("./"===t.substr(0,2)||0===t.indexOf("".concat(e.protocol,"//").concat(e.host)))return!0;var n=t.split("#")[0].split("?")[0];if(n.includes(".html")){var i=n.split("/"),r=i.length;n=n.split(i[r-1]).join("")}if(n){var o=n.match(/^http[s]?:/);if(Array.isArray(o)&&o.length>0)return!1}return!0})(t)||(e.crossOrigin="Anonymous")}function x(t){var e=("string"==typeof t?t:t.src).substr(0,5);return"data:"===e||"blob:"===e}function C(t){var e={image:t,size:null};return t instanceof window.HTMLImageElement&&(e.size=function(t){return{width:t.width||t.naturalWidth,height:t.height||t.naturalHeight}}(t)),e}var E=function(t,e){var n=t.left,i=t.top;return n+t.width>=e.left&&n<=e.right&&i+t.height>=e.top&&i<=e.bottom},I=function(t,e){var n=t.left,i=t.top,r=t.width,o=t.height,s=e.left,a=e.top,h=e.width,u=e.height;return{src:{left:n>s?0:s-n,top:i>a?0:a-i,width:r=n>s?Math.min(r,h-(n-s)):Math.min(h,r-(s-n)),height:o=i>a?Math.min(o,u-(i-a)):Math.min(u,o-(a-i))},dest:{left:n>s?n-s:0,top:i>a?i-a:0,width:r,height:o}}},S=Math.min,P=Math.max;function k(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,n=t.height,i=t.x,r=void 0===i?0:i,o=t.y,s=void 0===o?0:o,a=t.bitmap,h=void 0===a?null:a,u=t.collidable,d=void 0!==u&&u,c=t.interactive,l=void 0!==c&&c,f=t.mask,p=void 0!==f&&f,v=t.sheet,g=void 0===v?[]:v,_=t.sheetTileWidth,m=void 0===_?0:_,w=t.sheetTileHeight,y=void 0===w?0:w;if(e<=0||n<=0)throw new Error("cannot construct a zSprite without valid dimensions");if(this._children=[],this._disposed=!1,this.collidable=d,this.hover=!1,this._mask=p,this._bounds={left:0,top:0,width:e,height:n},this._parent=null,this.last=null,this.next=null,this.canvas=null,this._bitmap,this._bitmapReady=!1,this._draggable=!1,this._keepInBounds=!1,this.isDragging=!1,this.setX(r),this.setY(s),this.setInteractive(l),h&&this.setBitmap(h),Array.isArray(g)&&g.length>0){if(!h)throw new Error("cannot use a spritesheet without a valid Bitmap");this.setSheet(g,m,y)}}var L=k,H=k.prototype;k.extend=function(t){a.extend(t,k)},H.getDraggable=function(){return this._draggable},H.setDraggable=function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this._draggable=t,this._keepInBounds=!!this._constraint||e,t&&!this._interactive&&this.setInteractive(!0)},H.getX=function(){return this._bounds.left},H.setX=function(t){var e=t-this._bounds.left;this._bounds.left=this._constraint?t+this._constraint.left:t;for(var n=this._children[0];n;)n.isDragging||n.setX(n._bounds.left+e),n=n.next},H.getY=function(){return this._bounds.top},H.setY=function(t){var e=t-this._bounds.top;this._bounds.top=this._constraint?t+this._constraint.top:t;for(var n=this._children[0];n;)n.isDragging||n.setY(n._bounds.top+e),n=n.next},H.getWidth=function(){return this._bounds.width},H.setWidth=function(t){var e=this._bounds.width||0;this._bounds.width=t,0!==e&&(this._bounds.left-=.5*t-.5*e),this.invalidate()},H.getHeight=function(){return this._bounds.height},H.setHeight=function(t){var e=this._bounds.height||0;this._bounds.height=t,0!==e&&(this._bounds.top-=.5*t-.5*e),this.invalidate()},H.setBounds=function(t,e,n,i){if(this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");"number"==typeof n&&(this._bounds.width=n),"number"==typeof i&&(this._bounds.height=i);var r=this._bounds.width,o=this._bounds.height,s=this._constraint?this._constraint.width:this.canvas.width,a=this._constraint?this._constraint.height:this.canvas.height;if(this._keepInBounds){var h=S(0,-(r-s)),u=S(0,-(o-a)),d=a-o;t=S(s-r,P(t,h)),e=S(d,P(e,u))}else t>s&&(t+=.5*r),e>a&&(e+=.5*o);this.setX(t),this.setY(e)},H.getBounds=function(){return this._bounds},H.getInteractive=function(){return this._interactive},H.setInteractive=function(t){this._interactive=t},H.update=function(t){for(var e=this._children[0];e;)e.update(t),e=e.next;this._animation&&this.updateAnimation()},H.draw=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(this.canvas){var n=this._bounds,i=this._bitmapReady;if(i&&e&&(i=E(n,e)),t.save(),this._mask&&(t.globalCompositeOperation="destination-in"),i){var r=this._animation,o=n.left,s=n.top,a=n.width,h=n.height;if(r){var u=r.tileWidth?r.tileWidth:.5+a<<0,d=r.tileHeight?r.tileHeight:.5+h<<0;e&&(o-=e.left,s-=e.top),t.drawImage(this._bitmap,r.col*u,r.type.row*d,u,d,.5+o<<0,.5+s<<0,.5+a<<0,.5+h<<0)}else if(e){var c=I(n,e),l=c.src,f=c.dest;t.drawImage(this._bitmap,.5+l.left<<0,.5+l.top<<0,.5+l.width<<0,.5+l.height<<0,.5+f.left<<0,.5+f.top<<0,.5+f.width<<0,.5+f.height<<0)}else t.drawImage(this._bitmap,.5+o<<0,.5+s<<0,.5+a<<0,.5+h<<0)}for(var p=this._children[0];p;)p.draw(t,e),p=p.next;this._mask&&(t.globalCompositeOperation="source-over"),t.restore(),this.canvas.DEBUG&&this.drawOutline(t)}},H.insideBounds=function(t,e){var n=this._bounds,i=n.left,r=n.top,o=n.width,s=n.height;return t>=i&&t<=i+o&&e>=r&&e<=r+s},H.collidesWith=function(t){if(t===this)return!1;var e=this._bounds,n=t.getBounds();return!(e.top+e.height<n.top||e.top>n.top+n.height||e.left+e.width<n.left||e.left>n.left+n.width)},H.getIntersection=function(t){if(this.collidesWith(t)){var e=this._bounds,n=t.getBounds(),i=P(e.left,n.left),r=P(e.top,n.top);return{left:i,top:r,width:S(e.left+e.width,n.width+n.height)-i,height:S(e.top+e.height,n.top+n.height)-r}}return null},H.collidesWithEdge=function(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1},H.getBitmap=function(){return this._bitmap},H.setBitmap=function(t,e,n){var i=this,r=t instanceof window.HTMLCanvasElement,o=t instanceof window.HTMLImageElement;if(t&&!r&&!o&&!("string"==typeof t))throw new Error('expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "'.concat(t,'" instead'));return new Promise(function(){var s=m()(g.a.mark((function s(a,h){var u,d,c,l,f,p,v;return g.a.wrap((function(s){for(;;)switch(s.prev=s.next){case 0:if(i._bitmap!==t&&(i._bitmapReady=!1),t){s.next=4;break}return i._bitmap=null,s.abrupt("return");case 4:if(d="number"==typeof n,(u="number"==typeof e)&&i.setWidth(e),d&&i.setHeight(n),i._keepInBounds&&i.canvas&&(u||d)&&(c=-(i._bounds.width-i.canvas.getWidth()),l=-(i._bounds.height-i.canvas.getHeight()),i._bounds.left>0?i._bounds.left=0:i._bounds.left<c&&(i._bounds.left=c),i._bounds.top>0?i._bounds.top=0:i._bounds.top<l&&(i._bounds.top=l)),!r){s.next=15;break}return i._bitmap=t,i._bitmapReady=!0,s.abrupt("return",a());case 15:return s.prev=15,s.next=18,y.loadImage(o?t.src:t,o?t:null);case 18:return f=s.sent,p=f.size,v=f.image,i._bitmap=v,i._bitmapReady=!0,i._bitmapWidth=p.width,i._bitmapHeight=p.height,i.invalidate(),s.abrupt("return",a());case 29:s.prev=29,s.t0=s.catch(15),h(new Error('zSprite.setBitmap() "'.concat(s.t0.message,'" occurred.')));case 32:case"end":return s.stop()}}),s,null,[[15,29]])})));return function(t,e){return s.apply(this,arguments)}}())},H.setSheet=function(t,e,n){this._sheet=t,t?(this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0},"number"==typeof e&&(this._animation.tileWidth=e),"number"==typeof n&&(this._animation.tileHeight=n),this.switchAnimation(0)):this._animation=null},H.switchAnimation=function(t){var e=this._animation,n=this._sheet[t];e.type=n,e.fpt=n.fpt,e.maxCol=n.col+(n.amount-1),e.col=n.col,e.counter=0,e.onComplete=n.onComplete},H.setParent=function(t){this._parent=t},H.getParent=function(){return this._parent},H.setCanvas=function(t){this.canvas=t},H.setConstraint=function(t,e,n,i){return this._constraint={left:t,top:e,width:n,height:i},this._bounds.left=P(t,this._bounds.left),this._bounds.top=P(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()},H.getConstraint=function(){return this._constraint},H.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=null),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.invalidate(),this},H.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.invalidate(),t},H.getChildAt=function(t){return this._children[t]},H.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},H.numChildren=function(){return this._children.length},H.contains=function(t){return t._parent===this},H.dispose=function(){if(!this._disposed){this._disposed=!0,this._parent&&this._parent.removeChild(this);for(var t=this._children.length;t--;){var e=this._children[t];e.dispose(),e.next=null,e.last=null}this._children=[]}},H.handlePress=function(t,e,n){},H.handleRelease=function(t,e,n){},H.handleClick=function(){},H.handleMove=function(t,e,n){var i=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),r=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(i,r,this._bounds.width,this._bounds.height)},H.handleInteraction=function(t,e,n){var i,r=this._children.length;if(r>0)for(i=this._children[r-1];i;){if(i.handleInteraction(t,e,n))return!0;i=i.last}if(!this._interactive)return!1;var o=n.type;if(this._pressed&&("touchend"===o||"mouseup"===o))return this._pressed=!1,this.isDragging&&(this.isDragging=!1),Date.now()-this._pressTime<250&&this.handleClick(),this.handleRelease(t,e,n),!0;if(this.insideBounds(t,e)){if(this.hover=!0,"touchstart"===o||"mousedown"===o)return this._pressTime=Date.now(),this._pressed=!0,this._draggable&&(this.isDragging=!0,this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e}),this.handlePress(t,e,n),"touchstart"===o&&(n.stopPropagation(),n.preventDefault()),!0}else this.hover=!1;return!!this.isDragging&&(this.handleMove(t,e,n),!0)},H.updateAnimation=function(){var t=this._animation;++t.counter===t.fpt&&(++t.col,t.counter=0),t.col>t.maxCol&&(t.col=t.type.col,"function"==typeof t.onComplete&&t.onComplete(this))},H.invalidate=function(){this.canvas&&this.canvas.invalidate()},H.drawOutline=function(t){t.lineWidth=1,t.strokeStyle="#FF0000",t.strokeRect(this.getX(),this.getY(),this.getWidth(),this.getHeight())};var T=document.createElement("canvas"),M=T.getContext("2d"),R=function(t,e){var n=t.getBitmap(),i=t.getBounds(),r=parseInt(e.left-i.left),o=parseInt(e.top-i.top),s=parseInt(e.width),a=parseInt(e.height);0===s&&(s=1),0===a&&(a=1);var h=!(n instanceof window.HTMLCanvasElement),u=h?T:n,d=h?M:n.getContext("2d");h&&(u.width=i.width,u.height=i.height,d.clearRect(0,0,T.width,T.height),d.drawImage(n,0,0,i.width,i.height));for(var c=d.getImageData(r,o,s,a).data,l=new Array(parseInt(s*a)),f=0,p=0;p<a;++p)for(var v=0;v<s;++v){var g=4*(p*s+v);l[f]=c[g+3]<<24|c[g]<<16|c[g+1]<<8|c[g+2],++f}return l},B={pixelCollision:function(t,e,n){var i=t.getIntersection(e);if(null===i)return!1;var r=R(t,i),o=R(e,i),s=0;if(!0===n)for(var a=0;a<i.height;++a)for(var h=0;h<i.width;++h){if(0!==r[s]&&0!==o[s])return{x:h,y:a};++s}else for(;s<r.length;++s)if(0!==r[s]&&0!==o[s])return!0;return!1},getChildrenUnderPoint:function(t,e,n,i,r,o){for(var s,a,h,u,d,c=[],l=t.length;l--;)a=(s=t[l]).getX(),h=s.getY(),u=s.getWidth(),d=s.getHeight(),a<e+i&&a+u>e&&h<n+r&&h+d>n&&(!o||o&&s.collidable)&&c.push(s);return c}}}])}));