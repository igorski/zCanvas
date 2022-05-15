module.exports=function(t){var e={};function i(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)i.d(n,s,function(e){return t[e]}.bind(null,s));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";function n(){this._eventMappings=[],this._disposed=!1}i.r(e),i.d(e,"canvas",(function(){return c})),i.d(e,"sprite",(function(){return H})),i.d(e,"loader",(function(){return p})),i.d(e,"collision",(function(){return W}));var s=n,r=n.prototype;r.add=function(t,e,i){return!this.has(t,e)&&(t.addEventListener(e,i,!1),this._eventMappings.push({element:t,type:e,listener:i}),!0)},r.has=function(t,e){for(var i=this._eventMappings.length;i--;){var n=this._eventMappings[i];if(n.element===t&&n.type==e)return!0}return!1},r.remove=function(t,e){for(var i=this._eventMappings.length;i--;){var n=this._eventMappings[i];if(n.element===t&&n.type===e)return t.removeEventListener(e,n.listener,!1),this._eventMappings.splice(i,1),!0}return!1},r.dispose=function(){if(!this._disposed){this._disposed=!0;for(var t=this._eventMappings.length;t--;){var e=this._eventMappings[t];this.remove(e.element,e.type)}this._eventMappings=null}};var h={extend:function(t,e){function i(){}i.prototype=e.prototype,t.superClass_=e.prototype,t.prototype=new i,t.prototype.constructor=t,t.super=function(t,i,n){for(var s=new Array(arguments.length-2),r=2;r<arguments.length;r++)s[r-2]=arguments[r];return e.prototype[i].apply(t,s)},t.extend=function(e){h.extend(e,t)}}},o=h,a=Math.min,d=Math.max,l=Math.round;function u(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,i=void 0===e?300:e,n=t.height,s=void 0===n?300:n,r=t.fps,h=void 0===r?60:r,o=t.scale,a=void 0===o?1:o,d=t.backgroundColor,l=void 0===d?null:d,u=t.animate,c=void 0!==u&&u,f=t.smoothing,g=void 0===f||f,_=t.stretchToFit,p=void 0!==_&&_,v=t.viewport,m=void 0===v?null:v,w=t.handler,b=void 0===w?null:w,y=t.preventEventBubbling,C=void 0!==y&&y,x=t.parentElement,I=void 0===x?null:x,H=t.debug,E=void 0!==H&&H,S=t.onUpdate,P=void 0===S?null:S;if(i<=0||s<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=E,this._smoothing=g,this._updateHandler=P,this._renderHandler=this.render.bind(this),this._lastRender=0,this._renderId=0,this._renderPending=!1,this._disposed=!1,this._scale={x:a,y:a},this._handler=b,this._activeTouches=[],this._children=[],this.setFrameRate(h),this.setAnimatable(c),this._element=document.createElement("canvas"),this._canvasContext=this._element.getContext("2d"),l&&this.setBackgroundColor(l);var R=this._canvasContext,M=window.devicePixelRatio||1,k=R.webkitBackingStorePixelRatio||R.mozBackingStorePixelRatio||R.msBackingStorePixelRatio||R.oBackingStorePixelRatio||R.backingStorePixelRatio||1,B=M/k;this._HDPIscaleRatio=M!==k?B:1,this.setDimensions(i,s,!0,!0),m&&this.setViewport(m.width,m.height),1!==a&&this.scale(a,a),p&&this.stretchToFit(!0),I instanceof Element&&this.insertInPage(I),this.setSmoothing(g),this.preventEventBubbling(C),this.addListeners(),this._animate&&this.render()}var c=u,f=u.prototype;function g(t){var e,i,n=t._HDPIscaleRatio,s=t._viewport;if(t._enqueuedSize){var r=t._enqueuedSize;e=r.width,i=r.height,t._enqueuedSize=null,t._width=e,t._height=i}if(s){var h=t._width,o=t._height;e=a(s.width,h),i=a(s.height,o)}if(e&&i){var d=t._element;d.width=e*n,d.height=i*n,d.style.width="".concat(e,"px"),d.style.height="".concat(i,"px")}t._canvasContext.scale(n,n),!1===t._smoothing&&t.setSmoothing(!1)}u.extend=function(t){o.extend(t,u)},f.insertInPage=function(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)},f.getElement=function(){return this._element},f.preventEventBubbling=function(t){this._preventDefaults=t},f.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=null,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this},f.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var i=t.last,n=t.next;return i&&(i.next=n),n&&(n.last=i),t.last=t.next=null,this.invalidate(),t},f.getChildAt=function(t){return this._children[t]},f.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},f.numChildren=function(){return this._children.length},f.getChildren=function(){return this._children},f.contains=function(t){return t._parent===this},f.invalidate=function(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},f.getFrameRate=function(){return this._fps},f.setFrameRate=function(t){this._fps=t,this._aFps=t,this._renderInterval=1e3/t},f.getActualFrameRate=function(){return this._aFps},f.getRenderInterval=function(){return this._renderInterval},f.setSmoothing=function(t){this._smoothing=t;var e=this._element.style,i=this._canvasContext;["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"].forEach((function(e){void 0!==i[e]&&(i[e]=t)})),["-moz-crisp-edges","-webkit-crisp-edges","pixelated","crisp-edges"].forEach((function(i){e["image-rendering"]=t?void 0:i})),this.invalidate()},f.getWidth=function(){return this._enqueuedSize?this._enqueuedSize.width:this._width},f.getHeight=function(){return this._enqueuedSize?this._enqueuedSize.height:this._height},f.setDimensions=function(t,e){var i=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],n=arguments.length>3&&void 0!==arguments[3]&&arguments[3];this._enqueuedSize={width:t,height:e},!0===i&&(this._preferredWidth=t,this._preferredHeight=e),!0===n&&g(this),this.invalidate()},f.setViewport=function(t,e){this._viewport={width:t,height:e},this.panViewport(0,0),g(this)},f.panViewport=function(t,e){var i,n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],s=this._viewport;(s.left=d(0,a(t,this._width-s.width)),s.right=s.left+s.width,s.top=d(0,a(e,this._height-s.height)),s.bottom=s.top+s.height,this.invalidate(),n)&&(null===(i=this._handler)||void 0===i||i.call(this,{type:"panned",value:s}))},f.setBackgroundColor=function(t){this._bgColor=t},f.setAnimatable=function(t){var e;this._animate;this._animate=t,this._lastRaf=(null===(e=window.performance)||void 0===e?void 0:e.now())||Date.now(),t&&!this._renderPending&&this._renderHandler(this._lastRaf)},f.isAnimatable=function(){return this._animate},f.drawImage=function(t,e,i,n,s,r,h,o,d){if(e=.5+e<<0,i=.5+i<<0,s=.5+s<<0,!((n=.5+n<<0)<=0||s<=0)){var l=this._canvasContext;if("number"==typeof r){var u=(n=a(l.canvas.width,n))/o,c=(s=a(l.canvas.height,s))/d;r+o>t.width&&(n-=u*(r+o-t.width),o-=r+o-t.width),h+d>t.height&&(s-=c*(h+d-t.height),d-=h+d-t.height),l.drawImage(t,r,h,o,d,e,i,n,s)}else l.drawImage(t,e,i,n,s)}},f.scale=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:t;this._scale={x:t,y:e};var i=1===t&&1===e?"":"scale(".concat(t,", ").concat(e,")"),n=this._element.style;n["-webkit-transform-origin"]=n["transform-origin"]="0 0",n["-webkit-transform"]=n.transform=i,this.invalidate()},f.stretchToFit=function(t){this._stretchToFit=t;var e=window,i=e.innerWidth,n=e.innerHeight,s=this._preferredWidth,r=this._preferredHeight,h=1,o=1;n>i?(h=i/s,o=n/(r=t?n/i*s:r)):(h=i/(s=t?i/n*r:s),o=n/r),this.setDimensions(l(s),l(r),!1,!0),this.scale(h,o)},f.dispose=function(){if(!this._disposed){this._animate=!1,window.cancelAnimationFrame(this._renderId),this.removeListeners();for(var t=this.numChildren();t--;)this._children[t].dispose();this._children=[],this._element.parentNode&&this._element.parentNode.removeChild(this._element),this._disposed=!0}},f.handleInteraction=function(t){var e,i,n=this._children.length,s=this._viewport;if(n>0)switch(i=this._children[n-1],t.type){default:var r=0,h=0,o=t.changedTouches,a=0,d=o.length;if(d>0){var l=this.getCoordinate();for(s&&(l.x-=s.left,l.y-=s.top),a=0;a<d;++a){var u=o[a],c=u.identifier;switch(r=u.pageX-l.x,h=u.pageY-l.y,t.type){case"touchstart":for(;i;){if(!this._activeTouches.includes(i)&&i.handleInteraction(r,h,t)){this._activeTouches[c]=i;break}i=i.last}i=this._children[n-1];break;default:(null===(e=i=this._activeTouches[c])||void 0===e?void 0:e.handleInteraction(r,h,t))&&"touchmove"!==t.type&&(this._activeTouches[c]=null)}}}break;case"mousedown":case"mousemove":case"mouseup":var f=t.offsetX,g=t.offsetY;for(s&&(f+=s.left,g+=s.top);i&&!i.handleInteraction(f,g,t);)i=i.last;break;case"wheel":var _=t.deltaX,p=t.deltaY,v=0===_?0:_>0?20:-20,m=0===p?0:p>0?20:-20;this.panViewport(s.left+v,s.top+m,!0)}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this._animate||this.invalidate()},f.render=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this._renderPending=!1;var e,i=t-this._lastRender;if(this._animate&&i/this._renderInterval<.999)return this._renderId=window.requestAnimationFrame(this._renderHandler),void(this._lastRaf=t);this._aFps=1e3/(t-this._lastRaf),e=this._fps>60?this._fps/this._aFps:60===this._fps&&this._aFps>63?1:1/(this._fps/this._aFps),this._lastRaf=t,this._lastRender=t-i%this._renderInterval,this._enqueuedSize&&g(this);var n,s=this._canvasContext;if(s){var r=this._width,h=this._height;this._bgColor?(s.fillStyle=this._bgColor,s.fillRect(0,0,r,h)):s.clearRect(0,0,r,h);var o="function"==typeof this._updateHandler;for(o&&this._updateHandler(t,e),n=this._children[0];n;)o||n.update(t,e),n.draw(s,this._viewport),n=n.next}!this._disposed&&this._animate&&(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))},f.addListeners=function(){var t=this;this._eventHandler||(this._eventHandler=new s);var e=this._eventHandler,i=this.handleInteraction.bind(this),n=this._element;"ontouchstart"in window&&["start","move","end","cancel"].forEach((function(t){e.add(n,"touch".concat(t),i)})),["down","move"].forEach((function(t){e.add(n,"mouse".concat(t),i)})),e.add(window,"mouseup",i),this._viewport&&e.add(n,"wheel",i),this._stretchToFit&&e.add(window,"resize",(function(){t.stretchToFit(t._stretchToFit)}))},f.removeListeners=function(){this._eventHandler&&this._eventHandler.dispose(),this._eventHandler=null},f.getCoordinate=function(){for(var t=0,e=0,i=this._element;i.offsetParent;)t+=i.offsetLeft,e+=i.offsetTop,i=i.offsetParent;return{x:t+=i.offsetLeft,y:e+=i.offsetTop}};var _={loadImage:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(i,n){var r=e||new window.Image,h=m(t),o=new s;h||(v(t,r),o.add(r,"load",(function(){o.dispose(),_.onReady(r).then((function(t){return i(w(r))})).catch(n)})),o.add(r,"error",(function(t){o.dispose(),n(t)}))),r.src=t,h&&i(w(r))}))},isReady:function(t){return!0===t.complete&&("number"==typeof t.naturalWidth&&t.naturalWidth>0)},onReady:function(t){return new Promise((function(e,i){var n=0;!function s(){_.isReady(t)?e():60==++n?i(new Error("Image could not be resolved. This shouldn't occur.")):window.requestAnimationFrame(s)}()}))}},p=_;function v(t,e){(function(t){var e=window.location;if(t.startsWith("./")||t.startsWith("".concat(e.protocol,"//").concat(e.host)))return!0;if(/^http[s]?:/.test(t))return!1;return!0})(t)||(e.crossOrigin="Anonymous")}function m(t){var e=("string"==typeof t?t:t.src).substr(0,5);return"data:"===e||"blob:"===e}function w(t){var e={image:t,size:null};return t instanceof window.HTMLImageElement&&(e.size=function(t){return{width:t.width||t.naturalWidth,height:t.height||t.naturalHeight}}(t)),e}var b=function(t,e){var i=t.left,n=t.top;return i+t.width>=e.left&&i<=e.right&&n+t.height>=e.top&&n<=e.bottom},y=function(t,e){var i=t.left,n=t.top,s=t.width,r=t.height,h=e.left,o=e.top,a=e.width,d=e.height;return{src:{left:i>h?0:h-i,top:n>o?0:o-n,width:s=i>h?Math.min(s,a-(i-h)):Math.min(a,s-(h-i)),height:r=n>o?Math.min(r,d-(n-o)):Math.min(d,r-(o-n))},dest:{left:i>h?i-h:0,top:n>o?n-o:0,width:s,height:r}}},C=Math.min,x=Math.max;function I(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.width,i=t.height,n=t.x,s=void 0===n?0:n,r=t.y,h=void 0===r?0:r,o=t.bitmap,a=void 0===o?null:o,d=t.collidable,l=void 0!==d&&d,u=t.interactive,c=void 0!==u&&u,f=t.mask,g=void 0!==f&&f,_=t.sheet,p=void 0===_?[]:_,v=t.sheetTileWidth,m=void 0===v?0:v,w=t.sheetTileHeight,b=void 0===w?0:w;if(e<=0||i<=0)throw new Error("cannot construct a zSprite without valid dimensions");if(this._children=[],this._disposed=!1,this.collidable=l,this.hover=!1,this._mask=g,this._bounds={left:0,top:0,width:e,height:i},this._parent=null,this.last=null,this.next=null,this.canvas=null,this._bitmap,this._bitmapReady=!1,this._draggable=!1,this._keepInBounds=!1,this.isDragging=!1,this.setX(s),this.setY(h),this.setInteractive(c),a&&this.setBitmap(a),Array.isArray(p)&&p.length>0){if(!a)throw new Error("cannot use a spritesheet without a valid Bitmap");this.setSheet(p,m,b)}}var H=I,E=I.prototype;I.extend=function(t){o.extend(t,I)},E.getDraggable=function(){return this._draggable},E.setDraggable=function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this._draggable=t,this._keepInBounds=!!this._constraint||e,t&&!this._interactive&&this.setInteractive(!0)},E.getX=function(){return this._bounds.left},E.setX=function(t){var e=t-this._bounds.left;this._bounds.left=this._constraint?t+this._constraint.left:t;for(var i=this._children[0];i;)i.isDragging||i.setX(i._bounds.left+e),i=i.next},E.getY=function(){return this._bounds.top},E.setY=function(t){var e=t-this._bounds.top;this._bounds.top=this._constraint?t+this._constraint.top:t;for(var i=this._children[0];i;)i.isDragging||i.setY(i._bounds.top+e),i=i.next},E.getWidth=function(){return this._bounds.width},E.setWidth=function(t){var e=this._bounds.width||0;this._bounds.width=t,0!==e&&(this._bounds.left-=.5*t-.5*e),this.invalidate()},E.getHeight=function(){return this._bounds.height},E.setHeight=function(t){var e=this._bounds.height||0;this._bounds.height=t,0!==e&&(this._bounds.top-=.5*t-.5*e),this.invalidate()},E.setBounds=function(t,e,i,n){if(this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");"number"==typeof i&&(this._bounds.width=i),"number"==typeof n&&(this._bounds.height=n);var s=this._bounds.width,r=this._bounds.height,h=this._constraint?this._constraint.width:this.canvas.width,o=this._constraint?this._constraint.height:this.canvas.height;if(this._keepInBounds){var a=C(0,-(s-h)),d=C(0,-(r-o)),l=o-r;t=C(h-s,x(t,a)),e=C(l,x(e,d))}else t>h&&(t+=.5*s),e>o&&(e+=.5*r);this.setX(t),this.setY(e)},E.getBounds=function(){return this._bounds},E.getInteractive=function(){return this._interactive},E.setInteractive=function(t){this._interactive=t},E.update=function(t,e){for(var i=this._children[0];i;)i.update(t),i=i.next;this._animation&&this.updateAnimation(e)},E.draw=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(this.canvas){var i=this._bounds,n=this._bitmapReady;if(n&&e&&(n=b(i,e)),t.save(),this._mask&&(t.globalCompositeOperation="destination-in"),n){var s=this._animation,r=i.left,h=i.top,o=i.width,a=i.height;if(s){var d=s.tileWidth?s.tileWidth:.5+o<<0,l=s.tileHeight?s.tileHeight:.5+a<<0;e&&(r-=e.left,h-=e.top),t.drawImage(this._bitmap,s.col*d,s.type.row*l,d,l,.5+r<<0,.5+h<<0,.5+o<<0,.5+a<<0)}else if(e){var u=y(i,e),c=u.src,f=u.dest;t.drawImage(this._bitmap,.5+c.left<<0,.5+c.top<<0,.5+c.width<<0,.5+c.height<<0,.5+f.left<<0,.5+f.top<<0,.5+f.width<<0,.5+f.height<<0)}else t.drawImage(this._bitmap,.5+r<<0,.5+h<<0,.5+o<<0,.5+a<<0)}for(var g=this._children[0];g;)g.draw(t,e),g=g.next;this._mask&&(t.globalCompositeOperation="source-over"),t.restore(),this.canvas.DEBUG&&this.drawOutline(t)}},E.insideBounds=function(t,e){var i=this._bounds,n=i.left,s=i.top,r=i.width,h=i.height;return t>=n&&t<=n+r&&e>=s&&e<=s+h},E.collidesWith=function(t){if(t===this)return!1;var e=this._bounds,i=t.getBounds();return!(e.top+e.height<i.top||e.top>i.top+i.height||e.left+e.width<i.left||e.left>i.left+i.width)},E.getIntersection=function(t){if(this.collidesWith(t)){var e=this._bounds,i=t.getBounds(),n=x(e.left,i.left),s=x(e.top,i.top);return{left:n,top:s,width:C(e.left+e.width,i.width+i.height)-n,height:C(e.top+e.height,i.top+i.height)-s}}return null},E.collidesWithEdge=function(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1},E.getBitmap=function(){return this._bitmap},E.setBitmap=function(t,e,i){var n=this,s=t instanceof window.HTMLCanvasElement,r=t instanceof window.HTMLImageElement;if(t&&!s&&!r&&!("string"==typeof t))throw new Error('expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "'.concat(t,'" instead'));return new Promise((function(h,o){if(n._bitmap!==t&&(n._bitmapReady=!1),t){var a="number"==typeof e,d="number"==typeof i;if(a&&n.setWidth(e),d&&n.setHeight(i),n._keepInBounds&&n.canvas&&(a||d)){var l=-(n._bounds.width-n.canvas.getWidth()),u=-(n._bounds.height-n.canvas.getHeight());n._bounds.left>0?n._bounds.left=0:n._bounds.left<l&&(n._bounds.left=l),n._bounds.top>0?n._bounds.top=0:n._bounds.top<u&&(n._bounds.top=u)}if(s)return n._bitmap=t,n._bitmapReady=!0,h();p.loadImage(r?t.src:t,r?t:null).then((function(t){var e=t.size,i=t.image;n._bitmap=i,n._bitmapReady=!0,n._bitmapWidth=e.width,n._bitmapHeight=e.height,n.invalidate(),h()})).catch((function(t){o(new Error('zSprite.setBitmap() "'.concat(null==t?void 0:t.message,'" occurred.')))}))}else n._bitmap=null}))},E.setSheet=function(t,e,i){this._sheet=t,t?(this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0},"number"==typeof e&&(this._animation.tileWidth=e),"number"==typeof i&&(this._animation.tileHeight=i),this.switchAnimation(0)):this._animation=null},E.switchAnimation=function(t){var e=this._animation,i=this._sheet[t];e.type=i,e.fpt=i.fpt,e.maxCol=i.col+(i.amount-1),e.col=i.col,e.counter=0,e.onComplete=i.onComplete},E.setParent=function(t){this._parent=t},E.getParent=function(){return this._parent},E.setCanvas=function(t){this.canvas=t},E.setConstraint=function(t,e,i,n){return this._constraint={left:t,top:e,width:i,height:n},this._bounds.left=x(t,this._bounds.left),this._bounds.top=x(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()},E.getConstraint=function(){return this._constraint},E.addChild=function(t){if(this.contains(t))return this;var e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=null),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.invalidate(),this},E.removeChild=function(t){t.setParent(null),t.setCanvas(null);var e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);var i=t.last,n=t.next;return i&&(i.next=n),n&&(n.last=i),t.last=t.next=null,this.invalidate(),t},E.getChildAt=function(t){return this._children[t]},E.removeChildAt=function(t){return this.removeChild(this.getChildAt(t))},E.numChildren=function(){return this._children.length},E.contains=function(t){return t._parent===this},E.dispose=function(){if(!this._disposed){this._disposed=!0,this._parent&&this._parent.removeChild(this);for(var t=this._children.length;t--;){var e=this._children[t];e.dispose(),e.next=null,e.last=null}this._children=[]}},E.handlePress=function(t,e,i){},E.handleRelease=function(t,e,i){},E.handleClick=function(){},E.handleMove=function(t,e,i){var n=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),s=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(n,s,this._bounds.width,this._bounds.height)},E.handleInteraction=function(t,e,i){var n,s=this._children.length;if(s>0)for(n=this._children[s-1];n;){if(n.handleInteraction(t,e,i))return!0;n=n.last}if(!this._interactive)return!1;var r=i.type;if(this._pressed&&("touchend"===r||"mouseup"===r))return this._pressed=!1,this.isDragging&&(this.isDragging=!1),Date.now()-this._pressTime<250&&this.handleClick(),this.handleRelease(t,e,i),!0;if(this.insideBounds(t,e)){if(this.hover=!0,"touchstart"===r||"mousedown"===r)return this._pressTime=Date.now(),this._pressed=!0,this._draggable&&(this.isDragging=!0,this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e}),this.handlePress(t,e,i),"touchstart"===r&&(i.stopPropagation(),i.preventDefault()),!0}else this.hover=!1;return!!this.isDragging&&(this.handleMove(t,e,i),!0)},E.updateAnimation=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,e=this._animation;e.counter+=t,e.counter>=e.fpt&&(++e.col,e.counter=e.counter%e.fpt),e.col>e.maxCol&&(e.col=e.type.col,"function"==typeof e.onComplete&&e.onComplete(this))},E.invalidate=function(){this.canvas&&this.canvas.invalidate()},E.drawOutline=function(t){t.lineWidth=1,t.strokeStyle="#FF0000",t.strokeRect(this.getX(),this.getY(),this.getWidth(),this.getHeight())};var S=document.createElement("canvas"),P=S.getContext("2d"),R=new Map,M=[],k=[],B=function(t,e,i){var n,s,r,h,o=t.getBitmap(),a=t.getBounds(),d=parseInt(e.left-a.left),l=parseInt(e.top-a.top),u=parseInt(e.width),c=parseInt(e.height);if(0===u||0===c)return i.length=0;i.length=parseInt(u*c);var f=R.get(o);if(f&&d+u<o.width)n=f,s=o.width,h=l,r=d;else{var g=!(o instanceof window.HTMLCanvasElement),_=g?P:o.getContext("2d");g&&D(S,o,a.width,a.height),n=_.getImageData(d,l,u,c).data,s=u,h=0,r=0}for(var p=h+c,v=r+u,m=-1,w=h;w<p;++w)for(var b=r;b<v;++b){var y=4*(w*s+b);i[++m]=n[y+3]<<24|n[y]<<16|n[y+1]<<8|n[y+2]}},T=function(t){return R.has(t)};function D(t,e,i,n){var s=t.getContext("2d");return t.width=i,t.height=n,s.clearRect(0,0,i,n),s.drawImage(e,0,0,i,n),s}var W={pixelCollision:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]&&arguments[2],n=t.getIntersection(e);if(null===n)return!1;B(t,n,M),B(e,n,k);var s=0;if(!0===i)for(var r=n.width,h=n.height,o=0;o<h;++o)for(var a=0;a<r;++a){if(0!==M[s]&&0!==k[s])return{x:a,y:o};++s}else for(var d=M.length;s<d;++s)if(0!==M[s]&&0!==k[s])return!0;return!1},getChildrenUnderPoint:function(t,e,i,n,s,r){for(var h,o,a,d,l,u=[],c=t.length;c--;)o=(h=t[c]).getX(),a=h.getY(),d=h.getWidth(),l=h.getHeight(),o<e+n&&o+d>e&&a<i+s&&a+l>i&&(!r||r&&h.collidable)&&u.push(h);return u},cache:function(t){return new Promise((function(e,i){!(t instanceof window.HTMLCanvasElement)?p.onReady(t).then((function(){var i=t.width,n=t.height;R.set(t,D(S,t,i,n).getImageData(0,0,i,n).data),S.width=S.height=1,e(!0)})).catch(i):(R.set(t,t.getContext("2d").getImageData(0,0,t.width,t.height).data),e(!0))}))},hasCache:T,clearCache:function(t){return!!T(t)&&(R.delete(t),!0)}}}]);