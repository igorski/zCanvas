define("utils/EventHandler",["module"],function(t){"use strict";function e(){this._eventMappings=[],this._disposed=!1}t.exports=e,e.prototype.addEventListener=function(t,e,n){if(!this.hasEventListener(t,e)){if(t.addEventListener)t.addEventListener(e,n,!1);else{if(!t.attachEvent)return!1;t.attachEvent("on"+e,n)}return this._eventMappings.push({element:t,type:e,listener:n}),!0}return!1},e.prototype.hasEventListener=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type==e)return!0}return!1},e.prototype.removeEventListener=function(t,e){for(var n=this._eventMappings.length;n--;){var i=this._eventMappings[n];if(i.element===t&&i.type===e){if(t.removeEventListener)t.removeEventListener(e,i.listener,!1);else{if(!t.detachEvent)return!1;t.detachEvent("on"+e,i.listener)}return this._eventMappings.splice(n,1),!0}}return!1},e.prototype.dispose=function(){if(!this._disposed){this._disposed=!0;for(var t=this._eventMappings.length;t--;){var e=this._eventMappings[t];this.removeEventListener(e.element,e.type)}this._eventMappings=null}}}),define("utils/OOP",["module"],function(t){"use strict";var e=t.exports={extend:function(t,n){function i(){}i.prototype=n.prototype,t.superClass_=n.prototype,t.prototype=new i,t.prototype.constructor=t,t.super=function(t,e,i){for(var o=new Array(arguments.length-2),s=2;s<arguments.length;s++)o[s-2]=arguments[s];return n.prototype[e].apply(t,o)},t.extend=function(n){e.extend(n,t)}}}}),define("zCanvas",["module","utils/EventHandler","utils/OOP"],function(t,e,n){"use strict";function i(t){t=t||{};var e="number"==typeof t.width?t.width:300,n="number"==typeof t.height?t.height:300;if(e<=0||n<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG="boolean"==typeof t.debug&&t.debug,this._fps="number"==typeof t.fps?t.fps:60,this._renderInterval=1e3/this._fps,this._animate="boolean"==typeof t.animate&&t.animate,this._smoothing=!0,this._updateHandler="function"==typeof t.onUpdate?t.onUpdate:null,this._renderHandler=this.render.bind(this),this._lastRender=0,this._renderId=0,this._renderPending=!1,this._disposed=!1,this._children=[],this._element=document.createElement("canvas"),this._canvasContext=this._element.getContext("2d");var i=window.devicePixelRatio||1,o=this._canvasContext.webkitBackingStorePixelRatio||this._canvasContext.mozBackingStorePixelRatio||this._canvasContext.msBackingStorePixelRatio||this._canvasContext.oBackingStorePixelRatio||this._canvasContext.backingStorePixelRatio||1,s=i/o;this._HDPIscaleRatio=i!==o?s:1,this.setDimensions(e,n),this.preventEventBubbling(!1),this.addListeners(),this._animate&&this.render()}t.exports=i,i.extend=function(t){n.extend(t,i)},i.prototype.insertInPage=function(t){if(this._element.parentNode)throw new Error("zCanvas already present in DOM");t.appendChild(this._element)},i.prototype.getElement=function(){return this._element},i.prototype.preventEventBubbling=function(t){this._preventDefaults=t},i.prototype.addChild=function(t){var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=null,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this},i.prototype.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);e!==-1&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.invalidate(),t},i.prototype.getChildAt=function(t){return this._children[t]},i.prototype.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},i.prototype.numChildren=function(){return this._children.length},i.prototype.getChildren=function(){return this._children},i.prototype.contains=function(t){return this._children.indexOf(t)>-1},i.prototype.invalidate=function(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},i.prototype.getChildrenUnderPoint=function(t,e,n,i,o){for(var s=[],r=this._children.length,a=void 0,h=void 0,d=void 0,l=void 0,p=void 0;r--;)a=this._children[r],h=a.getX(),d=a.getY(),l=a.getWidth(),p=a.getHeight(),h<t+n&&h+l>t&&d<e+i&&d+p>e&&(!o||o&&a.collidable)&&s.push(a);return s},i.prototype.getFrameRate=function(){return this._fps},i.prototype.getRenderInterval=function(){return this._renderInterval},i.prototype.setSmoothing=function(t){var e=["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"],n=this._canvasContext;this._smoothing=t,window.requestAnimationFrame(function(){e.forEach(function(e){void 0!==n[e]&&(n[e]=t)})})},i.prototype.getWidth=function(){return this._width},i.prototype.getHeight=function(){return this._height},i.prototype.setDimensions=function(t,e){var n=this._HDPIscaleRatio;this._width=t,this._height=e,this._element.width=t*n,this._element.height=e*n,this._element.style.width=t+"px",this._element.style.height=e+"px",this._canvasContext.scale(n,n),this._smoothing===!1&&this.setSmoothing(this._smoothing),this.invalidate()},i.prototype.setBackgroundColor=function(t){this._bgColor=t},i.prototype.setAnimatable=function(t){var e=this._animate;this._animate=t,t&&!e&&this._renderHandler()},i.prototype.isAnimatable=function(){return this._animate},i.prototype.checkCollision=function(t,e,n,i,o,s,r,a,h){s=s||t.getX(),r=r||t.getY(),a=a||1,h=h||1;var d=t.getWidth(),l=t.getHeight(),p=this._canvasContext,u=function(t,s,r,a){for(var h=p.getImageData(t,s,r,a),d=void 0,l=0,u=r*a*4;l<u;l+=4){if(d=!1,"number"==typeof e&&(d=h.data[l]==e,!d))return!1;if("number"==typeof n&&(d=h.data[l+1]==n,!d))return!1;if("number"==typeof i&&(d=h.data[l+2]==i,!d))return!1;if("number"==typeof o&&(d=h.data[l+3]==o,!d))return!1;if(d)return!0}return!1},c=void 0,f=void 0;return c=u(s-a,r,a,l),f=u(s,r+l+h,d,h),c||(c=u(s+d+a,r,a,l)),f||(f=u(s,r-h,d,h)),c||f?c?f?3:1:2:0},i.prototype.dispose=function(){if(!this._disposed){this._disposed=!0,this.removeListeners(),this._animate=!1,window.cancelAnimationFrame(this._renderId);for(var t=this.numChildren();t--;)this._children[t].dispose();this._children=[]}},i.prototype.render=function(){var t=Date.now(),e=t-this._lastRender;if(this._renderPending=!1,e>this._renderInterval){this._lastRender=t-e%this._renderInterval;var n=this._canvasContext,i=void 0;if(n){this._bgColor?(n.fillStyle=this._bgColor,n.fillRect(0,0,this._width,this._height)):n.clearRect(0,0,this._width,this._height);var o="function"==typeof this._updateHandler;if(o&&this._updateHandler(t),this._children.length>0)for(i=this._children[0];i;)o||i.update(t),i.draw(n),i=i.next}}!this._disposed&&this._animate&&(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},i.prototype.handleInteraction=function(t){var e=this._children.length,n=0,i=0,o=void 0,s=void 0,r=void 0;if(e>0)switch(o=this._children[e-1],t.type){default:if(s=t.touches.length>0?t.touches:t.changedTouches,s.length>0){var a=this.getCoordinate();n=s[0].pageX-a.x,i=s[0].pageY-a.y}for(;o;)o.handleInteraction(n,i,t),o=o.last;break;case"mousedown":case"mousemove":case"mouseup":for(;o&&!(r=o.handleInteraction(t.offsetX,t.offsetY,t));)o=o.last}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this.invalidate()},i.prototype.addListeners=function(){this._eventHandler||(this._eventHandler=new e);var t=this.handleInteraction.bind(this);"ontouchstart"in window?(this._eventHandler.addEventListener(this._element,"touchstart",t),this._eventHandler.addEventListener(this._element,"touchmove",t),this._eventHandler.addEventListener(this._element,"touchend",t)):(this._eventHandler.addEventListener(this._element,"mousedown",t),this._eventHandler.addEventListener(this._element,"mousemove",t),this._eventHandler.addEventListener(window,"mouseup",t))},i.prototype.removeListeners=function(){this._eventHandler&&this._eventHandler.dispose(),this._eventHandler=null},i.prototype.getCoordinate=function(){for(var t=0,e=0,n=this._element;n.offsetParent;)t+=n.offsetLeft,e+=n.offsetTop,n=n.offsetParent;return t+=n.offsetLeft,e+=n.offsetTop,{x:t,y:e}}}),define("zLoader",["module","utils/EventHandler"],function(t,e){"use strict";function n(t,e){a(t)||(e.crossOrigin="Anonymous")}function i(t){return!("boolean"==typeof t.complete&&!t.complete)&&!("undefined"!=typeof t.naturalWidth&&0===t.naturalWidth)}function o(t,e,n){function o(){i(t)?e():++r===s?("function"==typeof n&&n(),console.warn("Image could not be resolved. This shouldn't occur.")):window.requestAnimationFrame(o)}var s=60,r=0;o()}function s(t){var e=("string"==typeof t?t:t.src).substr(0,5);return"data:"===e||"blob:"===e}function r(t){return{width:t.width||t.naturalWidth,height:t.height||t.naturalHeight}}function a(t){if("./"===t.substr(0,2)||0===t.indexOf(window.location.protocol+"//"+window.location.host))return!0;var e=t.split("#")[0].split("?")[0];if(e.indexOf(".html")>-1){var n=e.split("/"),i=n.length;e=e.split(n[i-1]).join("")}if(e){var o=e.match(/^http[s]?:/);if(Array.isArray(o)&&o.length>0)return!1}return!0}function h(t){var e={image:t,size:null};return t instanceof window.HTMLImageElement&&(e.size=r(t)),e}t.exports={loadImage:function(t,r,a){if(a instanceof window.Image&&i(a))return void r(h(a));var d=a instanceof window.Image?a:new window.Image,l=s(t),p=new e,u=function(t){p.dispose(),r(h(d),new Error(t.type))},c=function(){p.dispose(),o(d,function(){return r(h(d))})},f=/^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);return l&&!f||(l||n(t,d),p.addEventListener(d,"load",c),p.addEventListener(d,"error",u)),d.src=t,l&&r(h(d)),d}}}),define("zSprite",["module","utils/OOP","zLoader"],function(t,e,n){"use strict";function i(t,e,n,i,s,r,a){var h=void 0;if("number"==typeof t)h={x:t,y:e,width:n,height:i,bitmap:s,collidable:r,mask:a};else{if("object"!==("undefined"==typeof t?"undefined":o(t)))throw new Error("zSprite must either be constructed using a definitions Object {} or x, y, width, height, bitmap (optional), collidable (optional), mask (optional)");h=t}if("number"!=typeof h.width||"number"!=typeof h.height)throw new Error("cannot construct a zSprite without valid dimensions");"number"!=typeof h.x&&(h.x=0),"number"!=typeof h.y&&(h.y=0),this._children=[],this._disposed=!1,this.collidable="boolean"==typeof h.collidable&&h.collidable,this.hover=!1,this._mask="boolean"==typeof h.mask&&h.mask,this._bounds={left:0,top:0,width:h.width,height:h.height},this._parent=null,this._bitmap,this._bitmapReady=!1,this._draggable=!1,this._interactive=!1,this._keepInBounds=!1,this.isDragging=!1,h.bitmap&&this.setBitmap(h.bitmap),this.setX(h.x),this.setY(h.y)}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};t.exports=i,i.extend=function(t){e.extend(t,i)},i.prototype.last=null,i.prototype.next=null,i.prototype.canvas=null,i.prototype.getDraggable=function(){return this._draggable},i.prototype.setDraggable=function(t,e){this._draggable=t,this._keepInBounds=e||!1,t&&!this._interactive&&this.setInteractive(!0)},i.prototype.getX=function(){return this._bounds.left},i.prototype.setX=function(t){var e=t-this._bounds.left;if(this._bounds.left=this._constraint?t+this._constraint.left:t,this._children.length>0)for(var n=this._children[0];n;)n.isDragging||n.setX(n._bounds.left+e),n=n.next},i.prototype.getY=function(){return this._bounds.top},i.prototype.setY=function(t){var e=t-this._bounds.top;if(this._bounds.top=this._constraint?t+this._constraint.top:t,this._children.length>0)for(var n=this._children[0];n;)n.isDragging||n.setY(n._bounds.top+e),n=n.next},i.prototype.getWidth=function(){return this._bounds.width},i.prototype.setWidth=function(t){var e=this._bounds.width||0;this._bounds.width=t,0!==e&&(this._bounds.left-=.5*t-.5*e)},i.prototype.getHeight=function(){return this._bounds.height},i.prototype.setHeight=function(t){var e=this._bounds.height||0;this._bounds.height=t,0!==e&&(this._bounds.top-=.5*t-.5*e)},i.prototype.getBounds=function(){return this._bounds},i.prototype.getInteractive=function(){return this._interactive},i.prototype.setInteractive=function(t){this._interactive=t},i.prototype.update=function(t){if(this._children.length>0)for(var e=this._children[0];e;)e.update(t),e=e.next},i.prototype.updatePosition=function(t,e){if("number"!=typeof t&&(t=this._bounds.left),"number"!=typeof e&&(e=this._bounds.top),this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a zSprite that has no constraint or is not added to a zCanvas");var n=this._bounds.width,i=this._bounds.height,o=this._constraint?this._constraint.width:this.canvas.width,s=this._constraint?this._constraint.height:this.canvas.height;if(this._keepInBounds){var r=Math.min(0,-(n-o)),a=Math.min(0,-(i-s)),h=o-n,d=s-i;t=Math.min(h,Math.max(t,r)),e=Math.min(d,Math.max(e,a))}else t>o&&(t+=.5*n),e>s&&(e+=.5*i);this.setX(t),this.setY(e)},i.prototype.draw=function(t){if(t.save(),this._mask&&(t.globalCompositeOperation="destination-in"),this._bitmapReady){var e=this._bounds;t.drawImage(this._bitmap,e.left,e.top,e.width,e.height)}if(this._children.length>0)for(var n=this._children[0];n;)n.draw(t),n=n.next;this._mask&&(t.globalCompositeOperation="source-over"),t.restore(),this.canvas.DEBUG&&this.drawOutline(t)},i.prototype.collidesWith=function(t){if(t==this)return!1;var e=t.getX(),n=t.getY(),i=t.getWidth(),o=t.getHeight(),s=this.getX(),r=this.getY(),a=this.getWidth(),h=this.getHeight();return e<s+a&&e+i>s&&n<r+h&&n+o>r},i.prototype.collidesWithEdge=function(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1},i.prototype.setBitmap=function(t,e,i){var o=this;if(this._bitmap!==t&&(this._bitmapReady=!1),t||(this._bitmap=null),t)if(t instanceof window.HTMLCanvasElement)this._bitmap=t,this._bitmapReady=!0;else{if(!(t instanceof window.HTMLImageElement||"string"==typeof t))throw new Error("expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "+t+" instead");!function(){var s=o;n.loadImage(t,function(t,n){if(n instanceof Error)console.error(n.message+" occurred. Could not setBitmap()");else if(s._bitmap=t.image,s._bitmapReady=!0,o._bitmapWidth=t.size.width,o._bitmapHeight=t.size.height,"number"==typeof e&&o.setWidth(e),"number"==typeof i&&o.setHeight(i),s._keepInBounds&&s.canvas){var r=-(s._bounds.width-s.canvas.getWidth()),a=-(s._bounds.height-s.canvas.getHeight());s._bounds.left>0?s._bounds.left=0:s._bounds.left<r&&(s._bounds.left=r),s._bounds.top>0?s._bounds.top=0:s._bounds.top<a&&(s._bounds.top=a)}})}()}},i.prototype.setParent=function(t){this._parent=t},i.prototype.getParent=function(){return this._parent},i.prototype.setCanvas=function(t){this.canvas=t,!this._constraint&&t&&this.setConstraint(0,0,t.getWidth(),t.getHeight())},i.prototype.setConstraint=function(t,e,n,i){return this._constraint={left:t,top:e,width:n,height:i},this._bounds.left=Math.max(t,this._bounds.left),this._bounds.top=Math.max(e,this._bounds.top),this._keepInBounds=!0,this._constraint},i.prototype.getConstraint=function(){return this._constraint},i.prototype.addChild=function(t){var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=null),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.canvas&&this.canvas.invalidate(),this},i.prototype.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);e!==-1&&this._children.splice(e,1);var n=t.last,i=t.next;return n&&(n.next=i),i&&(i.last=n),t.last=t.next=null,this.canvas&&this.canvas.invalidate(),t},i.prototype.getChildAt=function(t){return this._children[t]},i.prototype.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},i.prototype.numChildren=function(){return this._children.length},i.prototype.contains=function(t){return this._children.indexOf(t)>-1},i.prototype.handlePress=function(t,e){},i.prototype.handleRelease=function(t,e){},i.prototype.handleClick=function(){},i.prototype.handleMove=function(t,e){var n=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),i=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.updatePosition(n,i)},i.prototype.handleInteraction=function(t,e,n){var i=!1,o=void 0,s=this.getX(),r=this.getY(),a=this._children.length;if(a>0)for(o=this._children[a-1];o;){if(i=o.handleInteraction(t,e,n))return!0;o=o.last}if(!this._interactive)return!1;if(this.isDragging&&("touchend"===n.type||"mouseup"===n.type))return this.isDragging=!1,Date.now()-this._dragStartTime<250&&this.handleClick(),this.handleRelease(t,e),!0;var h=this._bounds;if(t>=s&&t<=s+h.width&&e>=r&&e<=r+h.height){if(this.hover=!0,!this.isDragging&&("touchstart"===n.type||"mousedown"===n.type))return this.isDragging=!0,this._dragStartTime=Date.now(),this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e},this.handlePress(t,e),!0}else this.hover=!1;return!(!this._draggable||!this.isDragging)&&(this.handleMove(t,e),!0)},i.prototype.dispose=function(){if(!this._disposed){this._disposed=!0,this._parent&&this._parent.removeChild(this);for(var t=this._children.length;t--;){var e=this._children[t];e.dispose(),e.next=e.last=null}this._children=[]}},i.prototype.drawOutline=function(t){t.lineWidth=1,t.strokeStyle="#FF0000",t.strokeRect(this.getX(),this.getY(),this.getWidth(),this.getHeight())}}),define("zcanvas.amd",["module","zCanvas","zSprite","zLoader"],function(t,e,n,i){"use strict";t.exports={zCanvas:e,zSprite:n,zLoader:i}});