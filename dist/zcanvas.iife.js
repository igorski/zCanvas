var j=(_,g,m)=>{if(!g.has(_))throw TypeError("Cannot "+m)};var k=(_,g,m)=>(j(_,g,"read from private field"),m?m.call(_):g.get(_)),J=(_,g,m)=>{if(g.has(_))throw TypeError("Cannot add the same private member more than once");g instanceof WeakSet?g.add(_):g.set(_,m)},$=(_,g,m,S)=>(j(_,g,"write to private field"),S?S.call(_,m):g.set(_,m),m);var zcanvas=function(_){var w;"use strict";class m{constructor(t,e){this._context=t,this._cache=e}getBackingStoreRatio(){const t=this._context;return t.webkitBackingStorePixelRatio||t.mozBackingStorePixelRatio||t.msBackingStorePixelRatio||t.oBackingStorePixelRatio||t.backingStorePixelRatio||1}setSmoothing(t){const e=["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"],i=["-moz-crisp-edges","-webkit-crisp-edges","pixelated","crisp-edges"],s=this._context,n=s.canvas.style;e.forEach(r=>{s[r]!==void 0&&(s[r]=t)}),i.forEach(r=>{n["image-rendering"]=t?void 0:r})}save(){this._context.save()}restore(){this._context.restore()}scale(t,e=t){this._context.scale(t,e)}setBlendMode(t){this._context.globalCompositeOperation=t}clearRect(t,e,i,s){this._context.clearRect(t,e,i,s)}drawRect(t,e,i,s,n,r="fill"){r==="fill"?(this._context.fillStyle=n,this._context.fillRect(t,e,i,s)):r==="stroke"&&(this._context.lineWidth=1,this._context.strokeStyle=n,this._context.strokeRect(t,e,i,s))}drawImage(t,e,i,s,n){this._context.drawImage(t,e,i,s,n)}drawImageCropped(t,e,i,s,n,r,a,o,l){this._context.drawImage(t,.5+e<<0,.5+i<<0,.5+s<<0,.5+n<<0,.5+r<<0,.5+a<<0,.5+o<<0,.5+l<<0)}}class S{constructor(){this._eventMap=[],this._disposed=!1}add(t,e,i){return this.has(t,e)?!1:(t.addEventListener(e,i,!1),this._eventMap.push({target:t,type:e,listener:i}),!0)}has(t,e){let i=this._eventMap.length;for(;i--;){const s=this._eventMap[i];if(s.target===t&&s.type==e)return!0}return!1}remove(t,e){let i=this._eventMap.length;for(;i--;){const s=this._eventMap[i];if(s.target===t&&s.type===e)return t.removeEventListener(e,s.listener,!1),this._eventMap.splice(i,1),!0}return!1}dispose(){if(this._disposed)return;let t=this._eventMap.length;for(;t--;){const e=this._eventMap[t];this.remove(e.target,e.type)}this._eventMap=null,this._disposed=!0}}const b={loadImage(h,t=null){return new Promise((e,i)=>{const s=t||new window.Image,n=Q(h),r=new S,a=l=>{r.dispose(),i(l)},o=()=>{r.dispose(),b.onReady(s).then(l=>e(X(s))).catch(i)};n||(K(h,s),r.add(s,"load",o),r.add(s,"error",a)),s.src=h,n&&b.onReady(s).then(l=>e(X(s))).catch(i)})},isReady(h){return h.complete!==!0?!1:typeof h.naturalWidth=="number"&&h.naturalWidth>0},onReady(h){return new Promise((t,e)=>{let s=0;function n(){b.isReady(h)?t():++s===60?(console.error(typeof h),e(new Error("Image could not be resolved. This shouldn't occur."))):window.requestAnimationFrame(n)}n()})}};function K(h,t){tt(h)||(t.crossOrigin="Anonymous")}function Q(h){const t=(typeof h=="string"?h:h.src).substr(0,5);return t==="data:"||t==="blob:"}function Z(h){return{width:h.width||h.naturalWidth,height:h.height||h.naturalHeight}}function tt(h){const{location:t}=window;return h.startsWith("./")||h.startsWith(`${t.protocol}//${t.host}`)?!0:!/^http[s]?:/.test(h)}function X(h){const t={image:h,size:null};return h instanceof window.HTMLImageElement&&(t.size=Z(h)),t}let M;function F(){return M||(M=document.createElement("canvas")),M}function Y(){M.width=1,M.height=1}async function et(h,t,e,i=!0){if(h.size.width===t||h.size.height===e)return console.info("return as is"),h.image;T(F(),h.image,t,e);const s=F().toDataURL(i?"image/png":"image/jpg");Y();const n=new Image;return await b.loadImage(s,n),n}function T(h,t,e,i){const s=h.getContext("2d");return h.width=e,h.height=i,s.clearRect(0,0,e,i),s.drawImage(t,0,0,e,i),s}class q{constructor(){J(this,w,void 0);$(this,w,new Map)}dispose(){k(this,w).clear(),$(this,w,void 0)}get(t){var e;return(e=k(this,w).get(t))==null?void 0:e.bitmap}set(t,e,i,s){return k(this,w).set(t,{original:e,resizedImage:i,size:s}),i}async cache(t,e,i=0,s=0){const n=e instanceof window.HTMLCanvasElement,r=e instanceof window.HTMLImageElement;let a;n?(a.width=e.width,a.height=e.height):{size:a,image:e}=await b.loadImage(r?e.src:e,r?e:null);let o=e;return(i>0&&a.width!==i||s>0&&a.height!==s)&&(o=await et({size:a,image:e},i,s)),this.set(t,e,o,a),o}has(t,e,i){const s=k(this,w).get(t);return s?(console.info("has entry for "+t+":"+(s.size.width===e&&s.size.height===i)),s.size.width===e&&s.size.height===i):!1}clear(t){return k(this,w).delete(t)}}w=new WeakMap;class it{constructor(t,e=!1){if(this._element=t,e&&typeof this._element.transferControlToOffscreen=="function"){const i=t.transferControlToOffscreen();this._worker=new Worker("./workers/canvas.worker.js"),this._worker.postMessage({cmd:"register",canvas:i},[i])}else this._renderer=new m(t.getContext("2d"),new q)}getBackingStoreRatio(){return this._renderer.getBackingStoreRatio()}setSmoothing(t){this._renderer.setSmoothing(t)}save(){this._renderer.save()}restore(){this._renderer.restore()}scale(t,e){this._renderer.scale(t,e)}setBlendMode(t){this._renderer.setBlendMode(t)}clearRect(t,e,i,s){this._renderer.clearRect(t,e,i,s)}drawRect(t,e,i,s,n,r){this._renderer.drawRect(t,e,i,s,n,r)}drawImage(t,e,i,s,n){this._renderer.drawImage(t,e,i,s,n)}drawImageCropped(t,e,i,s,n,r,a,o,l){this._renderer.drawImageCropped(t,e,i,s,n,r,a,o,l)}}const{min:y,max:O,round:V}=Math,A=60,st=A+3;class nt{constructor({width:t=300,height:e=300,fps:i=A,scale:s=1,backgroundColor:n=null,animate:r=!1,smoothing:a=!0,stretchToFit:o=!1,viewport:l=null,preventEventBubbling:f=!1,parentElement:d=null,debug:c=!1,viewportHandler:u,onUpdate:x,useOffscreen:B=!1}={}){if(this.DEBUG=!1,this.benchmark={minElapsed:1/0,maxElapsed:-1/0,minFps:1/0,maxFps:-1/0},this.cache=new q,this._smoothing=!1,this._stretchToFit=!1,this._HDPIscaleRatio=1,this._preventDefaults=!1,this._lastRender=0,this._renderId=0,this._renderPending=!1,this._disposed=!1,this._scale={x:1,y:1},this._activeTouches=[],this._children=[],this._animate=!1,t<=0||e<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=c,this._element=document.createElement("canvas"),this._renderer=new it(this._element,B),this._updateHandler=x,this._renderHandler=this.render.bind(this),this._viewportHandler=u,this.setFrameRate(i),this.setAnimatable(r),n&&this.setBackgroundColor(n);const E=window.devicePixelRatio||1,p=this._renderer.getBackingStoreRatio(),v=E/p;this._HDPIscaleRatio=E!==p?v:1,this.setDimensions(t,e,!0,!0),l&&this.setViewport(l.width,l.height),s!==1&&this.scale(s,s),o&&this.stretchToFit(!0),d instanceof HTMLElement&&this.insertInPage(d),this.setSmoothing(a),this.preventEventBubbling(f),this.addListeners(),this._animate&&this.render()}insertInPage(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)}getElement(){return this._element}preventEventBubbling(t){this._preventDefaults=t}addChild(t){if(this.contains(t))return this;const e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=void 0,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this}removeChild(t){t.setParent(void 0),t.setCanvas(void 0);const e=this._children.indexOf(t);e!==-1&&this._children.splice(e,1);const i=t.last,s=t.next;return i&&(i.next=s),s&&(s.last=i),t.last=t.next=void 0,this.invalidate(),t}getChildAt(t){return this._children[t]}removeChildAt(t){return this.removeChild(this.getChildAt(t))}numChildren(){return this._children.length}getChildren(){return this._children}contains(t){return t.canvas===this}invalidate(){!this._animate&&!this._renderPending&&(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))}getFrameRate(){return this._fps}setFrameRate(t){this._fps=t,this._aFps=t,this._renderInterval=1e3/t}getActualFrameRate(){return this._aFps}getRenderInterval(){return this._renderInterval}getSmoothing(){return this._smoothing}setSmoothing(t){this._renderer.setSmoothing(t),this._smoothing=t,this.invalidate()}getWidth(){return this._enqueuedSize?this._enqueuedSize.width:this._width}getHeight(){return this._enqueuedSize?this._enqueuedSize.height:this._height}setDimensions(t,e,i=!0,s=!1){this._enqueuedSize={width:t,height:e},i===!0&&(this._preferredWidth=t,this._preferredHeight=e),s===!0&&L(this,this._renderer),this.invalidate()}getViewport(){return this._viewport}setViewport(t,e){this._viewport={width:t,height:e,left:0,top:0,right:t,bottom:e},this.panViewport(0,0),L(this,this._renderer)}panViewport(t,e,i=!1){var n;const s=this._viewport;s.left=O(0,y(t,this._width-s.width)),s.right=s.left+s.width,s.top=O(0,y(e,this._height-s.height)),s.bottom=s.top+s.height,this.invalidate(),i&&((n=this._viewportHandler)==null||n.call(this,{type:"panned",value:s}))}setBackgroundColor(t){this._bgColor=t}setAnimatable(t){var e;this._animate,this._animate=t,this._lastRaf=((e=window.performance)==null?void 0:e.now())||Date.now(),t&&!this._renderPending&&this._renderHandler(this._lastRaf)}isAnimatable(){return this._animate}drawImage(t,e,i,s,n,r,a,o,l){if(e=.5+e<<0,i=.5+i<<0,s=.5+s<<0,n=.5+n<<0,!(s<=0||n<=0))if(typeof r=="number"){s=y(this._element.width,s),n=y(this._element.height,n);const f=s/o,d=n/l;r+o>t.width&&(s-=f*(r+o-t.width),o-=r+o-t.width),a+l>t.height&&(n-=d*(a+l-t.height),l-=a+l-t.height),this._renderer.drawImageCropped(t,r,a,o,l,e,i,s,n)}else this._renderer.drawImage(t,e,i,s,n)}scale(t,e=t){this._scale={x:t,y:e};const i=t===1&&e===1?"":`scale(${t}, ${e})`,{style:s}=this._element;s["-webkit-transform-origin"]=s["transform-origin"]="0 0",s["-webkit-transform"]=s.transform=i,this.invalidate()}stretchToFit(t){this._stretchToFit=t;const{innerWidth:e,innerHeight:i}=window;let s=this._preferredWidth,n=this._preferredHeight,r=1,a=1;i>e?(n=t?i/e*s:n,r=e/s,a=i/n):(s=t?e/i*n:s,r=e/s,a=i/n),this.setDimensions(V(s),V(n),!1,!0),this.scale(r,a)}dispose(){if(this._disposed)return;this._animate=!1,window.cancelAnimationFrame(this._renderId),this.removeListeners();let t=this.numChildren();for(;t--;)this._children[t].dispose();this._children=[],this._element.parentNode&&this._element.parentNode.removeChild(this._element),this.cache.dispose(),this._disposed=!0}handleInteraction(t){const e=this._children.length,i=this._viewport;let s;if(e>0)switch(s=this._children[e-1],t.type){default:let n=0,r=0;const a=t.changedTouches;let o=0,l=a.length;if(l>0){let{x:p,y:v}=this.getCoordinate();for(i&&(p-=i.left,v-=i.top),o=0;o<l;++o){const I=a[o],{identifier:W}=I;switch(n=I.pageX-p,r=I.pageY-v,t.type){case"touchstart":for(;s;){if(!this._activeTouches.includes(s)&&s.handleInteraction(n,r,t)){this._activeTouches[W]=s;break}s=s.last}s=this._children[e-1];break;default:s=this._activeTouches[W],s!=null&&s.handleInteraction(n,r,t)&&t.type!=="touchmove"&&(this._activeTouches[W]=null);break}}}break;case"mousedown":case"mousemove":case"mouseup":let{offsetX:f,offsetY:d}=t;for(i&&(f+=i.left,d+=i.top);s&&!s.handleInteraction(f,d,t);)s=s.last;break;case"wheel":const{deltaX:c,deltaY:u}=t,x=20,B=c===0?0:c>0?x:-x,E=u===0?0:u>0?x:-x;this.panViewport(i.left+B,i.top+E,!0);break}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this._animate||this.invalidate()}render(t=0){this._renderPending=!1;const e=t-this._lastRender;if(this._animate&&e/this._renderInterval<.999){this._renderId=window.requestAnimationFrame(this._renderHandler),this._lastRaf=t;return}this._aFps=1e3/(t-this._lastRaf);let i;this._fps>A?i=this._fps/this._aFps:this._fps===A&&this._aFps>st?i=1:i=1/(this._fps/this._aFps),this._lastRaf=t,this._lastRender=t-e%this._renderInterval,this._enqueuedSize&&L(this,this._renderer);let s;const n=this._width,r=this._height;this._bgColor?this._renderer.drawRect(0,0,n,r,this._bgColor):this._renderer.clearRect(0,0,n,r);const a=typeof this._updateHandler=="function";for(a&&this._updateHandler(t,i),s=this._children[0];s;)a||s.update(t,i),s.draw(this._renderer,this._viewport),s=s.next;if(!this._disposed&&this._animate&&(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler)),this.DEBUG&&t>2){const o=window.performance.now()-t;this.benchmark.minElapsed=Math.min(this.benchmark.minElapsed,o),this.benchmark.maxElapsed=Math.max(this.benchmark.maxElapsed,o),this._aFps!==1/0&&(this.benchmark.minFps=Math.min(this.benchmark.minFps,this._aFps),this.benchmark.maxFps=Math.max(this.benchmark.maxFps,this._aFps))}}addListeners(){this._eventHandler||(this._eventHandler=new S);const t=this._eventHandler,e=this.handleInteraction.bind(this),i=this._element;"ontouchstart"in window&&["start","move","end","cancel"].forEach(s=>{t.add(i,`touch${s}`,e)}),["down","move"].forEach(s=>{t.add(i,`mouse${s}`,e)}),t.add(window,"mouseup",e),this._viewport&&t.add(i,"wheel",e),this._stretchToFit&&t.add(window,"resize",()=>{this.stretchToFit(this._stretchToFit)})}removeListeners(){this._eventHandler&&this._eventHandler.dispose(),this._eventHandler=void 0}getCoordinate(){return this._coords===void 0&&(this._coords=this._element.getBoundingClientRect()),this._coords}}function L(h,t){const e=h._HDPIscaleRatio,i=h.getViewport();let s,n;if(h._enqueuedSize&&({width:s,height:n}=h._enqueuedSize,h._enqueuedSize=void 0,h._width=s,h._height=n),i){const r=h._width,a=h._height;s=y(i.width,r),n=y(i.height,a)}if(s&&n){const r=h.getElement();r.width=s*e,r.height=n*e,r.style.width=`${s}px`,r.style.height=`${n}px`}t.scale(e,e),h.setSmoothing(h._smoothing),h._coords=void 0}const N=(h,t)=>{const{left:e,top:i}=h;return e+h.width>=t.left&&e<=t.right&&i+h.height>=t.top&&i<=t.bottom},ht=(h,t)=>{let{left:e,top:i,width:s,height:n}=h;const{left:r,top:a,width:o,height:l}=t;return e>r?s=Math.min(s,o-(e-r)):s=Math.min(o,s-(r-e)),i>a?n=Math.min(n,l-(i-a)):n=Math.min(l,n-(a-i)),{src:{left:e>r?0:r-e,top:i>a?0:a-i,width:s,height:n},dest:{left:e>r?e-r:0,top:i>a?i-a:0,width:s,height:n}}},{min:R,max:H}=Math,C=.5;class rt{constructor({width:t,height:e,x:i=0,y:s=0,bitmap:n=void 0,collidable:r=!1,interactive:a=!1,mask:o=!1,sheet:l=[],sheetTileWidth:f=0,sheetTileHeight:d=0}={width:64,height:64}){if(this.hover=!1,this.isDragging=!1,this._children=[],this._disposed=!1,this._mask=!1,this._interactive=!1,this._draggable=!1,this._keepInBounds=!1,this._bitmapReady=!1,this._pressed=!1,t<=0||e<=0)throw new Error("cannot construct a zSprite without valid dimensions");if(this.collidable=r,this._mask=o,this._bounds={left:0,top:0,width:t,height:e},this.setX(i),this.setY(s),this.setInteractive(a),n&&this.setBitmap(n),Array.isArray(l)&&l.length>0){if(!n)throw new Error("cannot use a spritesheet without a valid Bitmap");this.setSheet(l,f,d)}}getDraggable(){return this._draggable}setDraggable(t,e=!1){this._draggable=t,this._keepInBounds=this._constraint?!0:e,t&&!this._interactive&&this.setInteractive(!0)}getX(){return this._bounds.left}setX(t){const e=t-this._bounds.left;this._bounds.left=this._constraint?t+this._constraint.left:t;let i=this._children[0];for(;i;)i.isDragging||i.setX(i._bounds.left+e),i=i.next}getY(){return this._bounds.top}setY(t){const e=t-this._bounds.top;this._bounds.top=this._constraint?t+this._constraint.top:t;let i=this._children[0];for(;i;)i.isDragging||i.setY(i._bounds.top+e),i=i.next}getWidth(){return this._bounds.width}setWidth(t){const e=this._bounds.width||0;e!==t&&(this._bounds.width=t,e!==0&&(this._bounds.left-=t*C-e*C),this.invalidate())}getHeight(){return this._bounds.height}setHeight(t){const e=this._bounds.height||0;e!==t&&(this._bounds.height=t,e!==0&&(this._bounds.top-=t*C-e*C),this.invalidate())}setBounds(t,e,i,s){if(this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");let n=!1;typeof i=="number"&&(n=this._bounds.width!==i,this._bounds.width=i),typeof s=="number"&&(n=n||this._bounds.height!==s,this._bounds.height=s);const r=this._bounds.width,a=this._bounds.height,o=this._constraint?this._constraint.width:this.canvas.getWidth(),l=this._constraint?this._constraint.height:this.canvas.getHeight();if(this._keepInBounds){const f=R(0,-(r-o)),d=R(0,-(a-l)),c=o-r,u=l-a;t=R(c,H(t,f)),e=R(u,H(e,d))}else t>o&&(t=t+r*C),e>l&&(e=e+a*C);this.setX(t),this.setY(e),n&&this.invalidate()}getBounds(){return this._bounds}getInteractive(){return this._interactive}setInteractive(t){this._interactive=t}update(t,e){let i=this._children[0];for(;i;)i.update(t,e),i=i.next;this._animation&&this.updateAnimation(e)}draw(t,e){if(!this.canvas)return;const i=this._bounds;let s=this._bitmapReady;s&&e&&(s=N(i,e));let n=this._mask;if(n&&t.save(),this._mask&&t.setBlendMode("destination-in"),s){const a=this._animation;let{left:o,top:l,width:f,height:d}=i;if(a){const c=a.tileWidth?a.tileWidth:C+f<<0,u=a.tileHeight?a.tileHeight:C+d<<0;e&&(o-=e.left,l-=e.top),t.drawImageCropped(this._bitmap,a.col*c,a.type.row*u,c,u,o,l,f,d)}else if(e){const{src:c,dest:u}=ht(i,e);t.drawImageCropped(this._bitmap,c.left,c.top,c.width,c.height,u.left,u.top,u.width,u.height)}else t.drawImage(this._bitmap,o,l,f,d)}let r=this._children[0];for(;r;)r.draw(t,e),r=r.next;this._mask&&t.setBlendMode("source-over"),this.canvas.DEBUG&&t.drawRect(this.getX(),this.getY(),this.getWidth(),this.getHeight(),"#FF0000","stroke"),n&&t.restore()}insideBounds(t,e){const{left:i,top:s,width:n,height:r}=this._bounds;return t>=i&&t<=i+n&&e>=s&&e<=s+r}collidesWith(t){if(t===this)return!1;const e=this._bounds,i=t.getBounds();return!(e.top+e.height<i.top||e.top>i.top+i.height||e.left+e.width<i.left||e.left>i.left+i.width)}getIntersection(t){if(this.collidesWith(t)){const e=this._bounds,i=t.getBounds(),s=H(e.left,i.left),n=H(e.top,i.top),r=R(e.left+e.width,i.width+i.height)-s,a=R(e.top+e.height,i.top+i.height)-n;return{left:s,top:n,width:r,height:a}}}collidesWithEdge(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1}getBitmap(){return this._bitmap}setBitmap(t,e,i){const s=t instanceof window.HTMLCanvasElement,n=t instanceof window.HTMLImageElement;if(t&&!s&&!n&&!(typeof t=="string"))throw new Error(`expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "${t}" instead`);return new Promise((a,o)=>{if(this._bitmapReady=!1,!t){this._bitmap=void 0;return}const l=typeof e=="number",f=typeof i=="number";if(l&&this.setWidth(e),f&&this.setHeight(i),this._keepInBounds&&this.canvas&&(l||f)){const d=-(this._bounds.width-this.canvas.getWidth()),c=-(this._bounds.height-this.canvas.getHeight());this._bounds.left>0?this._bounds.left=0:this._bounds.left<d&&(this._bounds.left=d),this._bounds.top>0?this._bounds.top=0:this._bounds.top<c&&(this._bounds.top=c)}if(s)return this._bitmap=t,this._bitmapReady=!0,this.invalidate(),a();b.loadImage(n?t.src:t,n?t:null).then(({size:d,image:c})=>{this._bitmap=c,this._bitmapReady=!0,this.invalidate(),a()}).catch(d=>{o(new Error(`zSprite.setBitmap() "${d==null?void 0:d.message}" occurred.`))})})}setSheet(t,e,i){if(this._sheet=t,!t){this._animation=void 0;return}this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0,tileWidth:this.getWidth(),tileHeight:this.getHeight()},typeof e=="number"&&(this._animation.tileWidth=e),typeof i=="number"&&(this._animation.tileHeight=i),this.switchAnimation(0)}switchAnimation(t){const e=this._animation,i=this._sheet[t];e.type=i,e.fpt=i.fpt,e.maxCol=i.col+(i.amount-1),e.col=i.col,e.counter=0,e.onComplete=i.onComplete}setParent(t){this._parent=t}getParent(){return this._parent}setCanvas(t){this.canvas=t;for(const e of this._children)e.setCanvas(t)}setConstraint(t,e,i,s){return this._constraint={left:t,top:e,width:i,height:s},this._bounds.left=H(t,this._bounds.left),this._bounds.top=H(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()}getConstraint(){return this._constraint}addChild(t){if(this.contains(t))return this;const e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=void 0),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.invalidate(),this}removeChild(t){t.setParent(void 0),t.setCanvas(void 0);const e=this._children.indexOf(t);e!==-1&&this._children.splice(e,1);const i=t.last,s=t.next;return i&&(i.next=s),s&&(s.last=i),t.last=t.next=void 0,this.invalidate(),t}getChildAt(t){return this._children[t]}removeChildAt(t){return this.removeChild(this.getChildAt(t))}numChildren(){return this._children.length}getChildren(){return this._children}contains(t){return t._parent===this}dispose(){if(this._disposed)return;this._disposed=!0,this._parent&&this._parent.removeChild(this);let t=this._children.length;for(;t--;){const e=this._children[t];e.dispose(),e.next=void 0,e.last=void 0}this._children=[]}handlePress(t,e,i){}handleRelease(t,e,i){}handleClick(){}handleMove(t,e,i){const s=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),n=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(s,n,this._bounds.width,this._bounds.height)}handleInteraction(t,e,i){let s=!1,n;const r=this._children.length;if(r>0)for(n=this._children[r-1];n;){if(s=n.handleInteraction(t,e,i),s)return!0;n=n.last}if(!this._interactive)return!1;const{type:a}=i;if(this._pressed&&(a==="touchend"||a==="mouseup"))return this._pressed=!1,this.isDragging&&(this.isDragging=!1),Date.now()-this._pressTime<250&&this.handleClick(),this.handleRelease(t,e,i),!0;if(this.insideBounds(t,e)){if(this.hover=!0,a==="touchstart"||a==="mousedown")return this._pressTime=Date.now(),this._pressed=!0,this._draggable&&(this.isDragging=!0,this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e}),this.handlePress(t,e,i),a==="touchstart"&&(i.stopPropagation(),i.preventDefault()),!0}else this.hover=!1;return this.isDragging?(this.handleMove(t,e,i),!0):!1}invalidate(){this.canvas&&this.canvas.invalidate()}updateAnimation(t=1){const e=this._animation;e.counter+=t,e.counter>=e.fpt&&(++e.col,e.counter=e.counter%e.fpt),e.col>e.maxCol&&(e.col=e.type.col,typeof e.onComplete=="function"&&e.onComplete(this))}}const P=new Map,D=[],z=[],at=(h,t,e=!1)=>{const i=h.getIntersection(t);if(i===void 0)return!1;U(h,i,D),U(t,i,z);let s=0;if(e===!0){const n=i.width,r=i.height;for(let a=0;a<r;++a)for(let o=0;o<n;++o){if(D[s]!==0&&z[s]!==0)return{x:o,y:a};++s}}else{const n=D.length;for(s;s<n;++s)if(D[s]!==0&&z[s]!==0)return!0}return!1},U=(h,t,e)=>{const i=h.getBitmap(),s=h.getBounds(),n=parseInt(t.left-s.left),r=parseInt(t.top-s.top);let a=parseInt(t.width),o=parseInt(t.height);if(a===0||o===0)return e.length=0;e.length=parseInt(a*o);let l,f,d,c;const u=P.get(i);if(u&&n+a<i.width)l=u,f=i.width,c=r,d=n;else{const p=!(i instanceof window.HTMLCanvasElement),v=(p?F():i).getContext("2d");p&&T(F(),i,s.width,s.height),l=v.getImageData(n,r,a,o).data,f=a,c=0,d=0}const x=c+o,B=d+a;let E=-1;for(let p=c;p<x;++p)for(let v=d;v<B;++v){const I=(p*f+v)*4;e[++E]=l[I+3]<<24|l[I]<<16|l[I+1]<<8|l[I+2]}},ot=(h,t,e,i,s,n=!1)=>{const r=[];let a=h.length,o,l,f,d,c;for(;a--;)o=h[a],l=o.getX(),f=o.getY(),d=o.getWidth(),c=o.getHeight(),l<t+i&&l+d>t&&f<e+s&&f+c>e&&(!n||n&&o.collidable)&&r.push(o);return r},lt=h=>new Promise((t,e)=>{!(h instanceof window.HTMLCanvasElement)?b.onReady(h).then(()=>{const{width:s,height:n}=h,r=F();P.set(h,T(r,h,s,n).getImageData(0,0,s,n).data),Y(),t(!0)}).catch(e):(P.set(h,h.getContext("2d").getImageData(0,0,h.width,h.height).data),t(!0))}),dt=h=>G(h)?(P.delete(h),!0):!1,G=h=>P.has(h),ct={pixelCollision:at,getChildrenUnderPoint:ot,cache:lt,hasCache:G,clearCache:dt,isInsideViewport:N};return _.canvas=nt,_.collision=ct,_.loader=b,_.sprite=rt,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"}),_}({});
