var zcanvas=function(t){"use strict";class e{constructor(){this._eventMap=[],this._disposed=!1}add(t,e,i){return!this.has(t,e)&&(t.addEventListener(e,i,!1),this._eventMap.push({target:t,type:e,listener:i}),!0)}has(t,e){let i=this._eventMap.length;for(;i--;){const s=this._eventMap[i];if(s.target===t&&s.type==e)return!0}return!1}remove(t,e){let i=this._eventMap.length;for(;i--;){const s=this._eventMap[i];if(s.target===t&&s.type===e)return t.removeEventListener(e,s.listener,!1),this._eventMap.splice(i,1),!0}return!1}dispose(){if(this._disposed)return;let t=this._eventMap.length;for(;t--;){const e=this._eventMap[t];this.remove(e.target,e.type)}this._eventMap=null,this._disposed=!0}}let i;function s(t=0,e=0,i=!1){const s=document.createElement("canvas"),h=s.getContext("2d",i?{willReadFrequently:!0}:void 0);return 0!==t&&0!==e&&(s.width=t,s.height=e),{cvs:s,ctx:h}}function h(){return i||(i=s().cvs),i}async function n(t){t instanceof Blob&&(t=await async function(t){const e=await a(t),{cvs:i,ctx:h}=s(e.width,e.height);return h.drawImage(e,0,0),i}(t)),o(h(),t);const e=await createImageBitmap(h());return i.width=1,i.height=1,e}function a(t){const e=URL.createObjectURL(t),i=()=>{URL.revokeObjectURL(e)};return new Promise(((t,s)=>{const h=new Image;h.onload=()=>{i(),t(h)},h.onerror=t=>{i(),s(t)},h.src=e}))}function o(t,e,i,s){const h=t.getContext("2d");i=i??e.width,s=s??e.height,t.width=i,t.height=s,h.clearRect(0,0,i,s),h.drawImage(e,0,0,i,s)}async function r(t){const e=new FileReader;return new Promise(((i,s)=>{e.onload=e=>{var h;if(!(null==(h=null==e?void 0:e.target)?void 0:h.result))return s();i(new Blob([e.target.result],{type:t.type}))},e.onerror=t=>s(t),e.readAsArrayBuffer(t)}))}const d={loadImage:t=>new Promise((async(i,s)=>{let h;if(t instanceof File?h=await r(t):t instanceof Blob&&(h=t),void 0!==h){try{const t=await a(h);d.onReady(t).then((()=>i(l(t))))}catch(m){s(m)}return}const n=function(t){const e=t.substring(0,5);return"data:"===e||"blob:"===e}(t),o=new window.Image,c=new e,p=()=>{c.dispose(),d.onReady(o).then((()=>i(l(o)))).catch(s)};var u;n||(u=o,function(t){const{location:e}=window;return!(!t.startsWith("./")&&!t.startsWith(`${e.protocol}//${e.host}`)&&/^http[s]?:/.test(t))}(t)||(u.crossOrigin="Anonymous"),c.add(o,"load",p),c.add(o,"error",(()=>{c.dispose(),s()}))),o.src=t,n&&p()})),async loadBitmap(t){const{image:e}=await d.loadImage(t);return n(e)},isReady:t=>!0===t.complete&&"number"==typeof t.naturalWidth&&t.naturalWidth>0,onReady:t=>new Promise(((e,i)=>{let s=0;!function h(){d.isReady(t)?e():60==++s?i(new Error("Image could not be resolved. This shouldn't occur.")):window.requestAnimationFrame(h)}()}))};function l(t){const e={image:t,size:{width:0,height:0}};return t instanceof window.HTMLImageElement&&(e.size={width:(i=t).width||i.naturalWidth,height:i.height||i.naturalHeight}),e;var i}function c(t,e){e.font=`${t.size}${t.unit} "${t.font}"`,e.fillStyle=t.color}class p{constructor(t,e){this._index=0,this._map=new Map,this._createFn=t,this._destroyFn=e}dispose(){const t=[...this._map].map((([t])=>t));for(;t.length>0;)this.remove(t.shift());this._map=void 0}get(t){return this._map.get(t)}set(t,e){if(this.has(t)){if(this.get(t)===e)return;this.remove(t)}this._map.set(t,e)}has(t){return this._map.has(t)}remove(t){var e;if(!this.has(t))return!1;const i=this.get(t);return null==(e=this._destroyFn)||e.call(this,i),this._map.delete(t)}next(){let t;const e=this._index.toString();return this.has(e)?t=this.get(e):this._createFn&&(t=this._createFn(),this.set(e,t)),++this._index,t}fill(t){const e=this._index;for(let i=0;i<t;++i)this.next();this._index=e}reset(){this._index=0}}const u=Math.PI/180,m=.5;let g;class _{constructor(t,e=!1){this._debug=e,this._canvas=t,this._context=t.getContext("2d"),this._bitmapCache=new p(void 0,(t=>{t.close()})),this._patternCache=new p}dispose(){this._bitmapCache.dispose(),this._patternCache.dispose(),this._canvas=void 0}cacheResource(t,e){this._bitmapCache.set(t,e)}getResource(t){return this._bitmapCache.get(t)}disposeResource(t){this._bitmapCache.remove(t)}setDimensions(t,e){this._canvas.width=t,this._canvas.height=e}setSmoothing(t){const e=this._context;["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"].forEach((i=>{void 0!==e[i]&&(e[i]=t)}))}save(){this._context.save()}restore(){this._context.restore()}translate(t,e){this._context.translate(t,e)}rotate(t){this._context.rotate(t)}transform(t,e,i,s,h,n){this._context.transform(t,e,i,s,h,n)}scale(t,e=t){this._context.scale(t,e)}setBlendMode(t){this._context.globalCompositeOperation=t}setAlpha(t){this._context.globalAlpha=t}clearRect(t,e,i,s){this._context.clearRect(t,e,i,s)}drawRect(t,e,i,s,h,n="fill"){if(g=this._context,"fill"===n)g.fillStyle=h,g.fillRect(t,e,i,s);else{const n=1;g.lineWidth=n,g.strokeStyle=h,g.strokeRect(m+(t-n),m+(e-n),i,s)}}drawRoundRect(t,e,i,s,h,n,a){g=this._context,"fill"===a?(g.fillStyle=n,g.fillRect(t,e,i,s)):(g.strokeStyle=n,g.beginPath(),g.roundRect(t,e,i,s,h),g.stroke())}drawCircle(t,e,i,s="transparent",h){g=this._context,g.beginPath(),g.arc(t+i,e+i,i,0,2*Math.PI,!1),"transparent"!==s&&(g.fillStyle=s,g.fill()),h&&(g.lineWidth=5,g.strokeStyle=h,g.closePath(),g.stroke())}drawImage(t,e,i,s,h,n){if(!this._bitmapCache.has(t))return;const a=n?this.prepare(n,e,i,s,h):0;void 0===s?this._context.drawImage(this._bitmapCache.get(t),e,i):this._context.drawImage(this._bitmapCache.get(t),e,i,s,h),this._debug&&this.drawRect(e,i,s,h,"#FF0000","stroke"),this.applyReset(a)}drawImageCropped(t,e,i,s,h,n,a,o,r,d){if(!this._bitmapCache.has(t))return;if(null==d?void 0:d.safeMode){if(o<=0||r<=0)return;const n=this._bitmapCache.get(t),a=(o=Math.min(this._context.canvas.width,o))/s,d=(r=Math.min(this._context.canvas.height,r))/h;e+s>n.width&&(o-=a*(e+s-n.width),s-=e+s-n.width),i+h>n.height&&(r-=d*(i+h-n.height),h-=i+h-n.height)}const l=d?this.prepare(d,n,a,o,r):0;this._context.drawImage(this._bitmapCache.get(t),m+e<<0,m+i<<0,m+s<<0,m+h<<0,m+n<<0,m+a<<0,m+o<<0,m+r<<0),this._debug&&this.drawRect(n,a,o,r,"#FF0000","stroke"),this.applyReset(l)}drawText(t,e,i,s){const{lines:h,width:n,height:a}=function(t,e){c(t,e);const i=t.text.split("\n"),s=[];let h,n=0,a=0,o=e.measureText("Wq");h=t.lineHeight?t.lineHeight:o.actualBoundingBoxAscent+o.actualBoundingBoxDescent;const r=o.actualBoundingBoxAscent;let d=0;return i.forEach(((i,l)=>{if(d=Math.round(r+l*h),t.spacing){const e=i.split("");n=Math.max(n,e.length*t.spacing)}else o=e.measureText(i),n=Math.max(n,o.actualBoundingBoxRight);s.push({line:i,top:d}),a+=h})),{lines:s,width:Math.ceil(n),height:Math.ceil(a)}}(t,this._context);t.center&&(e-=n*m,i-=a*m);const o=s?this.prepare(s,e,i,n,a):0;!function(t,e,i,s,h){c(i,t);const n=i.spacing??1;e.forEach((({line:e,top:a})=>{i.spacing?e.split("").forEach(((e,i)=>{t.fillText(e,s+Math.round(i*n),h+a)})):t.fillText(e,s,h+a)}))}(this._context,h,t,e,i),this.applyReset(o)}createPattern(t,e){this._bitmapCache.has(t)&&this._patternCache.set(t,this._context.createPattern(this._bitmapCache.get(t),e))}drawPattern(t,e,i,s,h){if(!this._patternCache.has(t))return;const n=this._patternCache.get(t);this._context.fillStyle=n,this._context.fillRect(e,i,s,h)}prepare(t,e,i,s,h){var n,a;const o=void 0!==t.scale&&1!==t.scale,r=0!==t.rotation,d=void 0!==t.alpha,l=void 0!==t.blendMode,c=d||l,p=o||r;if(c)this.save();else if(!p)return 0;if(p){const o=t.scale??1,r=(null==(n=t.pivot)?void 0:n.x)??e+s*m,d=(null==(a=t.pivot)?void 0:a.y)??i+h*m,l=t.rotation*u,c=Math.cos(l)*o,p=Math.sin(l)*o;this._context.setTransform(c,p,-p,c,r-r*c+d*p,d-r*p-d*c)}return l&&this.setBlendMode(t.blendMode),d&&this.setAlpha(t.alpha),c?1:2}applyReset(t){2===t?this._context.resetTransform():1===t&&this.restore()}}const b="IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIHQodCxlKXtlLmZvbnQ9YCR7dC5zaXplfSR7dC51bml0fSAiJHt0LmZvbnR9ImAsZS5maWxsU3R5bGU9dC5jb2xvcn1jbGFzcyBle2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5faW5kZXg9MCx0aGlzLl9tYXA9bmV3IE1hcCx0aGlzLl9jcmVhdGVGbj10LHRoaXMuX2Rlc3Ryb3lGbj1lfWRpc3Bvc2UoKXtjb25zdCB0PVsuLi50aGlzLl9tYXBdLm1hcCgoKFt0XSk9PnQpKTtmb3IoO3QubGVuZ3RoPjA7KXRoaXMucmVtb3ZlKHQuc2hpZnQoKSk7dGhpcy5fbWFwPXZvaWQgMH1nZXQodCl7cmV0dXJuIHRoaXMuX21hcC5nZXQodCl9c2V0KHQsZSl7aWYodGhpcy5oYXModCkpe2lmKHRoaXMuZ2V0KHQpPT09ZSlyZXR1cm47dGhpcy5yZW1vdmUodCl9dGhpcy5fbWFwLnNldCh0LGUpfWhhcyh0KXtyZXR1cm4gdGhpcy5fbWFwLmhhcyh0KX1yZW1vdmUodCl7dmFyIGU7aWYoIXRoaXMuaGFzKHQpKXJldHVybiExO2NvbnN0IHM9dGhpcy5nZXQodCk7cmV0dXJuIG51bGw9PShlPXRoaXMuX2Rlc3Ryb3lGbil8fGUuY2FsbCh0aGlzLHMpLHRoaXMuX21hcC5kZWxldGUodCl9bmV4dCgpe2xldCB0O2NvbnN0IGU9dGhpcy5faW5kZXgudG9TdHJpbmcoKTtyZXR1cm4gdGhpcy5oYXMoZSk/dD10aGlzLmdldChlKTp0aGlzLl9jcmVhdGVGbiYmKHQ9dGhpcy5fY3JlYXRlRm4oKSx0aGlzLnNldChlLHQpKSwrK3RoaXMuX2luZGV4LHR9ZmlsbCh0KXtjb25zdCBlPXRoaXMuX2luZGV4O2ZvcihsZXQgcz0wO3M8dDsrK3MpdGhpcy5uZXh0KCk7dGhpcy5faW5kZXg9ZX1yZXNldCgpe3RoaXMuX2luZGV4PTB9fWNvbnN0IHM9TWF0aC5QSS8xODAsYT0uNTtsZXQgaSxuLG87Y2xhc3MgaHtjb25zdHJ1Y3Rvcih0LHM9ITEpe3RoaXMuX2RlYnVnPXMsdGhpcy5fY2FudmFzPXQsdGhpcy5fY29udGV4dD10LmdldENvbnRleHQoIjJkIiksdGhpcy5fYml0bWFwQ2FjaGU9bmV3IGUodm9pZCAwLCh0PT57dC5jbG9zZSgpfSkpLHRoaXMuX3BhdHRlcm5DYWNoZT1uZXcgZX1kaXNwb3NlKCl7dGhpcy5fYml0bWFwQ2FjaGUuZGlzcG9zZSgpLHRoaXMuX3BhdHRlcm5DYWNoZS5kaXNwb3NlKCksdGhpcy5fY2FudmFzPXZvaWQgMH1jYWNoZVJlc291cmNlKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuc2V0KHQsZSl9Z2V0UmVzb3VyY2UodCl7cmV0dXJuIHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KX1kaXNwb3NlUmVzb3VyY2UodCl7dGhpcy5fYml0bWFwQ2FjaGUucmVtb3ZlKHQpfXNldERpbWVuc2lvbnModCxlKXt0aGlzLl9jYW52YXMud2lkdGg9dCx0aGlzLl9jYW52YXMuaGVpZ2h0PWV9c2V0U21vb3RoaW5nKHQpe2NvbnN0IGU9dGhpcy5fY29udGV4dDtbImltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm9JbWFnZVNtb290aGluZ0VuYWJsZWQiLCJ3ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQiXS5mb3JFYWNoKChzPT57dm9pZCAwIT09ZVtzXSYmKGVbc109dCl9KSl9c2F2ZSgpe3RoaXMuX2NvbnRleHQuc2F2ZSgpfXJlc3RvcmUoKXt0aGlzLl9jb250ZXh0LnJlc3RvcmUoKX10cmFuc2xhdGUodCxlKXt0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSh0LGUpfXJvdGF0ZSh0KXt0aGlzLl9jb250ZXh0LnJvdGF0ZSh0KX10cmFuc2Zvcm0odCxlLHMsYSxpLG4pe3RoaXMuX2NvbnRleHQudHJhbnNmb3JtKHQsZSxzLGEsaSxuKX1zY2FsZSh0LGU9dCl7dGhpcy5fY29udGV4dC5zY2FsZSh0LGUpfXNldEJsZW5kTW9kZSh0KXt0aGlzLl9jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj10fXNldEFscGhhKHQpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGE9dH1jbGVhclJlY3QodCxlLHMsYSl7dGhpcy5fY29udGV4dC5jbGVhclJlY3QodCxlLHMsYSl9ZHJhd1JlY3QodCxlLHMsbixvLGg9ImZpbGwiKXtpZihpPXRoaXMuX2NvbnRleHQsImZpbGwiPT09aClpLmZpbGxTdHlsZT1vLGkuZmlsbFJlY3QodCxlLHMsbik7ZWxzZXtjb25zdCBoPTE7aS5saW5lV2lkdGg9aCxpLnN0cm9rZVN0eWxlPW8saS5zdHJva2VSZWN0KGErKHQtaCksYSsoZS1oKSxzLG4pfX1kcmF3Um91bmRSZWN0KHQsZSxzLGEsbixvLGgpe2k9dGhpcy5fY29udGV4dCwiZmlsbCI9PT1oPyhpLmZpbGxTdHlsZT1vLGkuZmlsbFJlY3QodCxlLHMsYSkpOihpLnN0cm9rZVN0eWxlPW8saS5iZWdpblBhdGgoKSxpLnJvdW5kUmVjdCh0LGUscyxhLG4pLGkuc3Ryb2tlKCkpfWRyYXdDaXJjbGUodCxlLHMsYT0idHJhbnNwYXJlbnQiLG4pe2k9dGhpcy5fY29udGV4dCxpLmJlZ2luUGF0aCgpLGkuYXJjKHQrcyxlK3MscywwLDIqTWF0aC5QSSwhMSksInRyYW5zcGFyZW50IiE9PWEmJihpLmZpbGxTdHlsZT1hLGkuZmlsbCgpKSxuJiYoaS5saW5lV2lkdGg9NSxpLnN0cm9rZVN0eWxlPW4saS5jbG9zZVBhdGgoKSxpLnN0cm9rZSgpKX1kcmF3SW1hZ2UodCxlLHMsYSxpLG4pe2lmKCF0aGlzLl9iaXRtYXBDYWNoZS5oYXModCkpcmV0dXJuO2NvbnN0IG89bj90aGlzLnByZXBhcmUobixlLHMsYSxpKTowO3ZvaWQgMD09PWE/dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGUscyk6dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGUscyxhLGkpLHRoaXMuX2RlYnVnJiZ0aGlzLmRyYXdSZWN0KGUscyxhLGksIiNGRjAwMDAiLCJzdHJva2UiKSx0aGlzLmFwcGx5UmVzZXQobyl9ZHJhd0ltYWdlQ3JvcHBlZCh0LGUscyxpLG4sbyxoLHIsYyxsKXtpZighdGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpKXJldHVybjtpZihudWxsPT1sP3ZvaWQgMDpsLnNhZmVNb2RlKXtpZihyPD0wfHxjPD0wKXJldHVybjtjb25zdCBhPXRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxvPShyPU1hdGgubWluKHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLHIpKS9pLGg9KGM9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0LGMpKS9uO2UraT5hLndpZHRoJiYoci09byooZStpLWEud2lkdGgpLGktPWUraS1hLndpZHRoKSxzK24+YS5oZWlnaHQmJihjLT1oKihzK24tYS5oZWlnaHQpLG4tPXMrbi1hLmhlaWdodCl9Y29uc3QgZD1sP3RoaXMucHJlcGFyZShsLG8saCxyLGMpOjA7dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGErZTw8MCxhK3M8PDAsYStpPDwwLGErbjw8MCxhK288PDAsYStoPDwwLGErcjw8MCxhK2M8PDApLHRoaXMuX2RlYnVnJiZ0aGlzLmRyYXdSZWN0KG8saCxyLGMsIiNGRjAwMDAiLCJzdHJva2UiKSx0aGlzLmFwcGx5UmVzZXQoZCl9ZHJhd1RleHQoZSxzLGksbil7Y29uc3R7bGluZXM6byx3aWR0aDpoLGhlaWdodDpyfT1mdW5jdGlvbihlLHMpe3QoZSxzKTtjb25zdCBhPWUudGV4dC5zcGxpdCgiXG4iKSxpPVtdO2xldCBuLG89MCxoPTAscj1zLm1lYXN1cmVUZXh0KCJXcSIpO249ZS5saW5lSGVpZ2h0P2UubGluZUhlaWdodDpyLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50K3IuYWN0dWFsQm91bmRpbmdCb3hEZXNjZW50O2NvbnN0IGM9ci5hY3R1YWxCb3VuZGluZ0JveEFzY2VudDtsZXQgbD0wO3JldHVybiBhLmZvckVhY2goKCh0LGEpPT57aWYobD1NYXRoLnJvdW5kKGMrYSpuKSxlLnNwYWNpbmcpe2NvbnN0IHM9dC5zcGxpdCgiIik7bz1NYXRoLm1heChvLHMubGVuZ3RoKmUuc3BhY2luZyl9ZWxzZSByPXMubWVhc3VyZVRleHQodCksbz1NYXRoLm1heChvLHIuYWN0dWFsQm91bmRpbmdCb3hSaWdodCk7aS5wdXNoKHtsaW5lOnQsdG9wOmx9KSxoKz1ufSkpLHtsaW5lczppLHdpZHRoOk1hdGguY2VpbChvKSxoZWlnaHQ6TWF0aC5jZWlsKGgpfX0oZSx0aGlzLl9jb250ZXh0KTtlLmNlbnRlciYmKHMtPWgqYSxpLT1yKmEpO2NvbnN0IGM9bj90aGlzLnByZXBhcmUobixzLGksaCxyKTowOyFmdW5jdGlvbihlLHMsYSxpLG4pe3QoYSxlKTtjb25zdCBvPWEuc3BhY2luZz8/MTtzLmZvckVhY2goKCh7bGluZTp0LHRvcDpzfSk9PnthLnNwYWNpbmc/dC5zcGxpdCgiIikuZm9yRWFjaCgoKHQsYSk9PntlLmZpbGxUZXh0KHQsaStNYXRoLnJvdW5kKGEqbyksbitzKX0pKTplLmZpbGxUZXh0KHQsaSxuK3MpfSkpfSh0aGlzLl9jb250ZXh0LG8sZSxzLGkpLHRoaXMuYXBwbHlSZXNldChjKX1jcmVhdGVQYXR0ZXJuKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpJiZ0aGlzLl9wYXR0ZXJuQ2FjaGUuc2V0KHQsdGhpcy5fY29udGV4dC5jcmVhdGVQYXR0ZXJuKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlKSl9ZHJhd1BhdHRlcm4odCxlLHMsYSxpKXtpZighdGhpcy5fcGF0dGVybkNhY2hlLmhhcyh0KSlyZXR1cm47Y29uc3Qgbj10aGlzLl9wYXR0ZXJuQ2FjaGUuZ2V0KHQpO3RoaXMuX2NvbnRleHQuZmlsbFN0eWxlPW4sdGhpcy5fY29udGV4dC5maWxsUmVjdChlLHMsYSxpKX1wcmVwYXJlKHQsZSxpLG4sbyl7dmFyIGgscjtjb25zdCBjPXZvaWQgMCE9PXQuc2NhbGUmJjEhPT10LnNjYWxlLGw9MCE9PXQucm90YXRpb24sZD12b2lkIDAhPT10LmFscGhhLHA9dm9pZCAwIT09dC5ibGVuZE1vZGUsZz1kfHxwLG09Y3x8bDtpZihnKXRoaXMuc2F2ZSgpO2Vsc2UgaWYoIW0pcmV0dXJuIDA7aWYobSl7Y29uc3QgYz10LnNjYWxlPz8xLGw9KG51bGw9PShoPXQucGl2b3QpP3ZvaWQgMDpoLngpPz9lK24qYSxkPShudWxsPT0ocj10LnBpdm90KT92b2lkIDA6ci55KT8/aStvKmEscD10LnJvdGF0aW9uKnMsZz1NYXRoLmNvcyhwKSpjLG09TWF0aC5zaW4ocCkqYzt0aGlzLl9jb250ZXh0LnNldFRyYW5zZm9ybShnLG0sLW0sZyxsLWwqZytkKm0sZC1sKm0tZCpnKX1yZXR1cm4gcCYmdGhpcy5zZXRCbGVuZE1vZGUodC5ibGVuZE1vZGUpLGQmJnRoaXMuc2V0QWxwaGEodC5hbHBoYSksZz8xOjJ9YXBwbHlSZXNldCh0KXsyPT09dD90aGlzLl9jb250ZXh0LnJlc2V0VHJhbnNmb3JtKCk6MT09PXQmJnRoaXMucmVzdG9yZSgpfX1vbm1lc3NhZ2U9dD0+e3N3aXRjaCh0LmRhdGEuY21kKXtkZWZhdWx0OmJyZWFrO2Nhc2UiaW5pdCI6bz10LmRhdGEuY2FudmFzLG49bmV3IGgobyx0LmRhdGEuZGVidWcpO2JyZWFrO2Nhc2UibG9hZFJlc291cmNlIjohYXN5bmMgZnVuY3Rpb24odCxlKXt0cnl7bGV0IHM7aWYoZSBpbnN0YW5jZW9mIEZpbGUpe2NvbnN0IHQ9YXdhaXQgYXN5bmMgZnVuY3Rpb24odCl7Y29uc3QgZT1uZXcgRmlsZVJlYWRlcjtyZXR1cm4gbmV3IFByb21pc2UoKChzLGEpPT57ZS5vbmxvYWQ9ZT0+e3ZhciBpO2lmKCEobnVsbD09KGk9bnVsbD09ZT92b2lkIDA6ZS50YXJnZXQpP3ZvaWQgMDppLnJlc3VsdCkpcmV0dXJuIGEoKTtzKG5ldyBCbG9iKFtlLnRhcmdldC5yZXN1bHRdLHt0eXBlOnQudHlwZX0pKX0sZS5vbmVycm9yPXQ9PmEodCksZS5yZWFkQXNBcnJheUJ1ZmZlcih0KX0pKX0oZSk7cz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcCh0KX1lbHNlIGlmKGUgaW5zdGFuY2VvZiBCbG9iKXM9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoZSk7ZWxzZSBpZigic3RyaW5nIj09dHlwZW9mIGUpe2NvbnN0IHQ9YXdhaXQgZmV0Y2goZSksYT1hd2FpdCB0LmJsb2IoKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKGEpfWVsc2UgZSBpbnN0YW5jZW9mIEltYWdlQml0bWFwJiYocz1lKTtudWxsPT1ufHxuLmNhY2hlUmVzb3VyY2UodCxzKSxwb3N0TWVzc2FnZSh7Y21kOiJvbmxvYWQiLGlkOnQsc2l6ZTp7d2lkdGg6cy53aWR0aCxoZWlnaHQ6cy5oZWlnaHR9fSl9Y2F0Y2gocyl7cG9zdE1lc3NhZ2Uoe2NtZDoib25lcnJvciIsaWQ6dCxlcnJvcjoobnVsbD09cz92b2lkIDA6cy5tZXNzYWdlKT8/c30pfX0odC5kYXRhLmlkLHQuZGF0YS5zb3VyY2UpO2JyZWFrO2Nhc2UiZ2V0UmVzb3VyY2UiOmNvbnN0IGU9bnVsbD09bj92b2lkIDA6bi5nZXRSZXNvdXJjZSh0LmRhdGEuaWQpO3Bvc3RNZXNzYWdlKHtjbWQ6Im9ucmVzb3VyY2UiLGlkOnQuZGF0YS5pZCxiaXRtYXA6ZX0pO2JyZWFrO2Nhc2UiZGlzcG9zZVJlc291cmNlIjpudWxsPT1ufHxuLmRpc3Bvc2VSZXNvdXJjZSguLi50LmRhdGEuYXJncyk7YnJlYWs7Y2FzZSJkaXNwb3NlIjpudWxsPT1ufHxuLmRpc3Bvc2UoKSxvPXZvaWQgMCxuPXZvaWQgMDticmVhaztjYXNlInJlbmRlciI6aWYoIW58fCF0LmRhdGEuY29tbWFuZHMpcmV0dXJuO2Zvcihjb25zdCBzIG9mIHQuZGF0YS5jb21tYW5kcyl7Y29uc3QgdD1zLnNoaWZ0KCk7blt0XSguLi5zKX1wb3N0TWVzc2FnZSh7Y21kOiJvbnJlbmRlciJ9KTticmVhaztjYXNlInNldERpbWVuc2lvbnMiOmNhc2Uic2V0U21vb3RoaW5nIjpjYXNlImNyZWF0ZVBhdHRlcm4iOm5bdC5kYXRhLmNtZF0oLi4udC5kYXRhLmFyZ3MpfX19KCk7Cg==",w="undefined"!=typeof window&&window.Blob&&new Blob([atob(b)],{type:"text/javascript;charset=utf-8"});function f(){let t;try{if(t=w&&(window.URL||window.webkitURL).createObjectURL(w),!t)throw"";return new Worker(t)}catch(e){return new Worker("data:application/javascript;base64,"+b)}finally{t&&(window.URL||window.webkitURL).revokeObjectURL(t)}}class v{constructor(t,e=!1,i=!1){if(this._useWorker=!1,this._element=t,e&&"function"==typeof this._element.transferControlToOffscreen){this._useWorker=!0,this._callbacks=new Map,this._pool=new p((()=>[]),(t=>{t.length=0})),this._pool.fill(1e3),this._commands=[];const e=t.transferControlToOffscreen();this._worker=new f,this._worker.postMessage({cmd:"init",canvas:e,debug:i},[e]),this._worker.onmessage=this.handleMessage.bind(this)}else this._renderer=new _(this._element,i)}loadResource(t,e){return new Promise((async(i,s)=>{if(e instanceof ImageBitmap)this._useWorker?this.wrappedWorkerLoad(t,e,i,s,!0):(this._renderer.cacheResource(t,e),i({width:e.width,height:e.height}));else if("string"!=typeof e){if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){const s=await n(e);return this.loadResource(t,s).then((t=>i(t)))}if(e instanceof File)if(this._useWorker)this.wrappedWorkerLoad(t,e,i,s);else{const h=await r(e);this.wrappedLoad(t,h,i,s)}else e instanceof Blob?this._useWorker?this.wrappedWorkerLoad(t,e,i,s):this.wrappedLoad(t,e,i,s):s("Unsupported resource type: "+typeof e)}else if(e=e.startsWith("./")?new URL(e,document.baseURI).href:e,this._useWorker)this.wrappedWorkerLoad(t,e,i,s);else{const h=await d.loadImage(e);this.wrappedLoad(t,h.image,i,s)}}))}getResource(t){return new Promise(((e,i)=>{this._useWorker?(this._callbacks.set(t,{resolve:e,reject:i}),this._worker.postMessage({cmd:"getResource",id:t})):e(this._renderer.getResource(t))}))}disposeResource(t){this.getBackend("disposeResource",t)}onCommandsReady(){this._useWorker&&(this._worker.postMessage({cmd:"render",commands:this._commands}),this._commands.length=0,this._pool.reset())}dispose(){this.getBackend("dispose"),setTimeout((()=>{var t,e;null==(t=this._worker)||t.terminate(),this._worker=void 0,null==(e=this._callbacks)||e.clear()}),50)}handleMessage(t){const{cmd:e,id:i}=t.data;switch(e){default:break;case"onload":if(!this._callbacks.has(i))return;this._callbacks.get(i).resolve(t.data.size),this._callbacks.delete(i);break;case"onerror":if(!this._callbacks.has(i))return;this._callbacks.get(i).reject(new Error(t.data.error)),this._callbacks.delete(i);break;case"onresource":this._callbacks.get(i).resolve(t.data.bitmap),this._callbacks.delete(i)}}wrappedWorkerLoad(t,e,i,s,h=!1){this._callbacks.set(t,{resolve:i,reject:s}),this._worker.postMessage({cmd:"loadResource",source:e,id:t},h?[e]:[])}async wrappedLoad(t,e,i,s){try{const s=await n(e);this._renderer.cacheResource(t,s),i({width:s.width,height:s.height})}catch(h){s(h)}}setDimensions(t,e){this.getBackend("setDimensions",t,e)}createPattern(t,e){this.getBackend("createPattern",t,e)}setSmoothing(t){this.getBackend("setSmoothing",t)}save(){this.onDraw("save")}restore(){this.onDraw("restore")}translate(t,e){this.onDraw("translate",t,e)}rotate(t){this.onDraw("rotate",t)}transform(t,e,i,s,h,n){this.onDraw("transform",t,e,i,s,h,n)}scale(t,e){this.onDraw("scale",t,e)}setBlendMode(t){this.onDraw("setBlendMode",t)}setAlpha(t){this.onDraw("setAlpha",t)}clearRect(t,e,i,s){this.onDraw("clearRect",t,e,i,s)}drawRect(t,e,i,s,h,n){this.onDraw("drawRect",t,e,i,s,h,n)}drawRoundRect(t,e,i,s,h,n,a){this.onDraw("drawRoundRect",t,e,i,s,h,n,a)}drawCircle(t,e,i,s="transparent",h){this.onDraw("drawCircle",t,e,i,s,h)}drawImage(t,e,i,s,h,n){this.onDraw("drawImage",t,e,i,s,h,n)}drawImageCropped(t,e,i,s,h,n,a,o,r,d){this.onDraw("drawImageCropped",t,e,i,s,h,n,a,o,r,d)}drawText(t,e,i,s){this.onDraw("drawText",t,e,i,s)}drawPattern(t,e,i,s,h){this.onDraw("drawPattern",t,e,i,s,h)}onDraw(t,...e){if(this._useWorker){const i=this._pool.next();return i.length=0,i.push(t,...e),void this._commands.push(i)}this._renderer[t](...e)}getBackend(t,...e){if(this._useWorker)return this._worker.postMessage({cmd:t,args:[...e]});this._renderer[t](...e)}}const Z={x:0,y:0};function G(t,e,i,s,h){return(t-e)/(i-e)*(h-s)+s}let X,C,W,R;const x=t=>t>0?t+.5<<0:0|t,y=[],L=[],Y=s(1,1,!0).cvs;class S{constructor(t){this._renderer=t,this._cacheMap=new Map}dispose(){this._cacheMap.clear(),this._cacheMap=void 0}getChildrenUnderPoint(t,e,i,s,h,n=!1){const a=[];let o,r,d,l,c,p=t.length;for(;p--;)o=t[p],r=o.getX(),d=o.getY(),l=o.getWidth(),c=o.getHeight(),r<e+s&&r+l>e&&d<i+h&&d+c>i&&(!n||n&&o.collidable)&&a.push(o);return a}pixelCollision(t,e,i=!1){const s=t.getIntersection(e);if(void 0===s)return!1;this.getPixelArray(t,s,y),this.getPixelArray(e,s,L);const h=s.width,n=s.height;let a=0;for(let o=0;o<n;++o)for(let t=0;t<h;++t){if(1===y[a]&&1===L[a])return!i||{x:t,y:o};++a}return!1}async cache(t){const e=await this._renderer.getResource(t);if(!e)return!1;const{width:i,height:s}=e;o(Y,e,i,s);const{data:h}=Y.getContext("2d").getImageData(0,0,i,s),n=new Uint8Array(h.length/4);for(let a=0,o=n.length;a<o;++a){const t=h[4*a+3];n[a]=t<5?0:1}return this._cacheMap.set(t,{mask:n,size:{width:i,height:s}}),Y.width=Y.height=1,!0}clearCache(t){return!!this.hasCache(t)&&(this._cacheMap.delete(t),!0)}hasCache(t){return this._cacheMap.has(t)}getPixelArray(t,e,i){const s=t.getResourceId();if(!this.hasCache(s))throw new Error(`Cannot get cached entry for resource "${s}". Cache it first.`);const h=t.getBounds(),n=x(e.left-h.left),a=x(e.top-h.top),o=x(e.width),r=x(e.height),{mask:d,size:l}=this._cacheMap.get(s);if(0===o||0===r)return void(i.length=0);i.length=x(o*r);const c=l.height,p=l.width,u=n+o,m=a+r;let g=-1,_=0;for(let b=a;b<m;++b)for(let t=n;t<u;++t)_=t>=p||b>=c?0:d[b*p+t],i[++g]=_}}class k{constructor(){this._children=[],this._disposed=!1}addChild(t){if(this.contains(t))return this;const e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=void 0,t.setParent(this),this._children.push(t),this.invalidate(),this}removeChild(t){t.setParent(void 0),t.setCanvas(void 0);const e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);const i=t.last,s=t.next;return i&&(i.next=s),s&&(s.last=i),t.last=t.next=void 0,this.invalidate(),t}getChildAt(t){return this._children[t]}removeChildAt(t){return this.removeChild(this.getChildAt(t))}numChildren(){return this._children.length}getChildren(){return this._children}contains(t){return t.getParent()===this}invalidate(){}dispose(){this._disposed=!0,this._parent&&this._parent.removeChild(this);let t=this._children.length;for(;t--;){const e=this._children[t];e.dispose(),e.next=void 0,e.last=void 0}this._children=[]}}const{min:H,max:F}=Math,{min:M,max:z}=Math,K=.5;return t.Canvas=class extends k{constructor({width:t=300,height:e=300,fps:i=60,backgroundColor:s=null,animate:h=!1,smoothing:n=!0,stretchToFit:a=!1,viewport:o=null,preventEventBubbling:r=!1,parentElement:d=null,debug:l=!1,optimize:c="auto",viewportHandler:p,onUpdate:u,onResize:m}={}){if(super(),this.DEBUG=!1,this.benchmark={minElapsed:1/0,maxElapsed:-1/0,minFps:1/0,maxFps:-1/0},this.bbox={left:0,top:0,right:0,bottom:0},this._smoothing=!1,this._stretchToFit=!1,this._HDPIscaleRatio=1,this._preventDefaults=!1,this._lastRender=0,this._renderId=0,this._renderPending=!1,this._disposed=!1,this._scale={x:1,y:1},this._activeTouches=[],this._animate=!1,this._hasFsHandler=!1,this._isFullScreen=!1,t<=0||e<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=l;const{userAgent:g}=navigator,_=g.includes("Safari")&&!g.includes("Chrome"),b=["auto","worker"].includes(c)&&!_;this._element=document.createElement("canvas"),this._renderer=new v(this._element,b,l),this.collision=new S(this._renderer),this._updateHandler=u,this._renderHandler=this.render.bind(this),this._viewportHandler=p,this._resizeHandler=m,this.setFrameRate(i),this.setAnimatable(h),s&&this.setBackgroundColor(s),this._HDPIscaleRatio=window.devicePixelRatio||1,this.setDimensions(t,e,!0,!0),o&&this.setViewport(o.width,o.height),this._stretchToFit=a,this.setSmoothing(n),this.preventEventBubbling(r),this.addListeners(),d instanceof HTMLElement&&this.insertInPage(d),this.handleResize()}loadResource(t,e){return this._renderer.loadResource(t,e)}getResource(t){return this._renderer.getResource(t)}disposeResource(t){return this._renderer.disposeResource(t)}getRenderer(){return this._renderer}insertInPage(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)}getElement(){return this._element}preventEventBubbling(t){this._preventDefaults=t}addChild(t){return t.setCanvas(this),super.addChild(t)}invalidate(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))}getFrameRate(){return this._fps}setFrameRate(t){this._fps=t,this._aFps=t,this._renderInterval=1e3/t}getActualFrameRate(){return this._aFps}getRenderInterval(){return this._renderInterval}getSmoothing(){return this._smoothing}setSmoothing(t){this._renderer.setSmoothing(t),t?this._element.style["image-rendering"]="":["-moz-crisp-edges","-webkit-crisp-edges","pixelated","crisp-edges"].forEach((t=>{this._element.style["image-rendering"]=t})),this._smoothing=t,this.invalidate()}getWidth(){return this._enqueuedSize?this._enqueuedSize.width:this._width}getHeight(){return this._enqueuedSize?this._enqueuedSize.height:this._height}setDimensions(t,e,i=!0,s=!1){this._enqueuedSize={width:t,height:e},i&&(this._preferredWidth=t,this._preferredHeight=e),s&&this.updateCanvasSize(),this.invalidate()}getViewport(){return this._viewport}setViewport(t,e){this._viewport||(this._viewport={width:t,height:e,left:0,top:0,right:t,bottom:e});const i=this._viewport;i.width=t,i.height=e,this.panViewport(Math.min(i.left,t),Math.min(i.top,e))}panViewport(t,e,i=!1){var s;const h=this._viewport;h.left=F(0,H(t,this._width-h.width)),h.right=h.left+h.width,h.top=F(0,H(e,this._height-h.height)),h.bottom=h.top+h.height,this.invalidate(),i&&(null==(s=this._viewportHandler)||s.call(this,{type:"panned",value:h}))}setBackgroundColor(t){this._bgColor=t}setAnimatable(t){var e;this._lastRaf=(null==(e=window.performance)?void 0:e.now())||Date.now(),t&&!this._renderPending&&this.invalidate(),this._animate=t}isAnimatable(){return this._animate}scale(t,e=t){this._scale={x:t,y:e};const i=1===t&&1===e?"":`scale(${t}, ${e})`,{style:s}=this._element;s["-webkit-transform-origin"]=s["transform-origin"]="0 0",s["-webkit-transform"]=s.transform=i,this.invalidate()}stretchToFit(t){this._stretchToFit=t,this.handleResize()}setFullScreen(t,e=!1){if(e||(e=this._stretchToFit),!this._hasFsHandler){this._hasFsHandler=!0;const t=document,i=()=>{this._isFullScreen=t.webkitIsFullScreen||t.mozFullScreen||!0===t.msFullscreenElement,e&&(this._stretchToFit=this._isFullScreen)};["webkitfullscreenchange","mozfullscreenchange","fullscreenchange","MSFullscreenChange"].forEach((e=>{this._eventHandler.add(t,e,i)}))}t!==this._isFullScreen&&function(t){let e;e=t.fullscreenElement||t.webkitFullscreenElement?t.exitFullscreen||t.webkitExitFullscreen||t.mozCancelFullScreen||t.msExitFullscreen:t.requestFullScreen||t.webkitRequestFullScreen||t.mozRequestFullScreen||t.msRequestFullscreen,e&&e.call(t)}(this._element)}getCoordinate(){return void 0===this._coords&&(this._coords=this._element.getBoundingClientRect()),this._coords}dispose(){this._disposed||(this._animate=!1,window.cancelAnimationFrame(this._renderId),this.removeListeners(),super.dispose(),this._element.parentNode&&this._element.parentNode.removeChild(this._element),requestAnimationFrame((()=>{this._renderer.dispose(),this._renderer=void 0,this.collision.dispose(),this.collision=void 0})),this._disposed=!0)}handleInteraction(t){const e=this._children.length,i=this._viewport;let s;if(e>0)switch(s=this._children[e-1],t.type){default:let h=0,n=0;const a=t.changedTouches;let o=0,r=a.length;if(r>0){let{x:d,y:l}=this.getCoordinate();for(i&&(d-=i.left,l-=i.top),o=0;o<r;++o){const i=a[o],{identifier:r}=i;if(h=i.pageX-d,n=i.pageY-l,"touchstart"===t.type){for(;s;){if(!this._activeTouches.includes(s)&&s.handleInteraction(h,n,t)){this._activeTouches[r]=s;break}s=s.last}s=this._children[e-1]}else s=this._activeTouches[r],(null==s?void 0:s.handleInteraction(h,n,t))&&"touchmove"!==t.type&&(this._activeTouches[r]=null)}}break;case"mousedown":case"mousemove":case"mouseup":let{offsetX:d,offsetY:l}=t;if(this._isFullScreen){const e=function(t,e,i,s,h){const n=window.innerHeight/h,a=.5*(window.innerWidth-s*n);return Z.x=G(t.clientX-i.left-a,0,s*n,0,e.width),Z.y=G(t.clientY-i.top,0,h*n,0,e.height),Z}(t,this._element,this.getCoordinate(),this._width,this._height);d=e.x,l=e.y}for(i&&(d+=i.left,l+=i.top);s&&!s.handleInteraction(d,l,t);)s=s.last;break;case"wheel":const{deltaX:c,deltaY:p}=t,u=20,m=0===c?0:c>0?u:-u,g=0===p?0:p>0?u:-u;this.panViewport(i.left+m,i.top+g,!0)}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this._animate||this.invalidate()}render(t=0){this._renderPending=!1;const e=t-this._lastRender;if(this._animate&&e/this._renderInterval<.999)return this._renderId=window.requestAnimationFrame(this._renderHandler),void(this._lastRaf=t);let i,s;this._aFps=1e3/(t-this._lastRaf),i=this._fps>60?this._fps/this._aFps:60===this._fps&&this._aFps>63?1:1/(this._fps/this._aFps),this._lastRaf=t,this._lastRender=t-e%this._renderInterval,this._enqueuedSize&&this.updateCanvasSize();const h=this._width,n=this._height;this._bgColor?this._renderer.drawRect(0,0,h,n,this._bgColor):this._renderer.clearRect(0,0,h,n);const a="function"==typeof this._updateHandler;for(a&&this._updateHandler(t,i),s=this._children[0];s;)a||s.update(t,i),s.draw(this._renderer,this._viewport),s=s.next;if(this._renderer.onCommandsReady(),!this._disposed&&this._animate&&(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler)),this.DEBUG&&t>2){const e=window.performance.now()-t;this.benchmark.minElapsed=H(this.benchmark.minElapsed,e),this.benchmark.maxElapsed=F(this.benchmark.maxElapsed,e),this._aFps!==1/0&&(this.benchmark.minFps=H(this.benchmark.minFps,this._aFps),this.benchmark.maxFps=F(this.benchmark.maxFps,this._aFps))}}addListeners(){this._eventHandler||(this._eventHandler=new e);const t=this._eventHandler,i=this.handleInteraction.bind(this),s=this._element;"ontouchstart"in window&&["start","move","end","cancel"].forEach((e=>{t.add(s,`touch${e}`,i)})),["down","move"].forEach((e=>{t.add(s,`mouse${e}`,i)})),t.add(window,"mouseup",i),this._viewport&&t.add(s,"wheel",i),t.add(window,"resize",this.handleResize.bind(this))}removeListeners(){var t;null==(t=this._eventHandler)||t.dispose(),this._eventHandler=void 0}handleResize(){const{innerWidth:t,innerHeight:e}=window;let i=this._preferredWidth,s=this._preferredHeight,h=1;if(!this._viewport&&(this._stretchToFit||t<i||e<s)){const{width:n,height:a}=function(t,e,i,s){const h=i/s;let n=t,a=e;return t/e>h?a=t/h:n=e*h,{width:n,height:a}}(i,s,t,e);h=t/n,this.setDimensions(n,a,!1,!0)}else H(i,t),this.setDimensions(i,s,!1);this.scale(h)}updateCanvasSize(){var t;const e=this._HDPIscaleRatio;let i,s;if(void 0!==this._enqueuedSize&&(({width:i,height:s}=this._enqueuedSize),this._enqueuedSize=void 0,this._width=i,this._height=s,this.bbox.right=i,this.bbox.bottom=s),this._viewport){const t=this._width,e=this._height;i=H(this._viewport.width,t),s=H(this._viewport.height,e)}if(i&&s){const h=this.getElement();this._renderer.setDimensions(i*e,s*e),h.style.width=`${i}px`,h.style.height=`${s}px`,null==(t=this._resizeHandler)||t.call(this,i,s)}this._renderer.scale(e,e),this.setSmoothing(this._smoothing),this._coords=void 0}},t.Loader=d,t.Sprite=class extends k{constructor({width:t,height:e,resourceId:i,x:s=0,y:h=0,rotation:n=0,collidable:a=!1,interactive:o=!1,mask:r=!1,sheet:d=[],sheetTileWidth:l=0,sheetTileHeight:c=0}={width:64,height:64}){if(super(),this.hover=!1,this.isDragging=!1,this._mask=!1,this._interactive=!1,this._draggable=!1,this._keepInBounds=!1,this._pressed=!1,t<=0||e<=0)throw new Error("cannot construct a Sprite without valid dimensions");if(this.collidable=a,this._mask=r,this._scale=1,this._bounds={left:0,top:0,width:t,height:e},this.setX(s),this.setY(h),this.setRotation(n),this.setInteractive(o),i&&this.setResource(i),Array.isArray(d)&&d.length>0){if(!i)throw new Error("cannot use a spritesheet without a valid resource id");this.setSheet(d,l,c)}}getDraggable(){return this._draggable}setDraggable(t,e=!1){this._draggable=t,this._keepInBounds=!!this._constraint||e,t&&!this._interactive&&this.setInteractive(!0)}getX(){return this._bounds.left}setX(t){const e=t-this._bounds.left;this._bounds.left=this._constraint?t+this._constraint.left:t;let i=this._children[0];for(;i;)i.isDragging||i.setX(i._bounds.left+e),i=i.next}getY(){return this._bounds.top}setY(t){const e=t-this._bounds.top;this._bounds.top=this._constraint?t+this._constraint.top:t;let i=this._children[0];for(;i;)i.isDragging||i.setY(i._bounds.top+e),i=i.next}getWidth(){return this._bounds.width}setWidth(t){const e=this._bounds.width||0;e!==t&&(this._bounds.width=t,0!==e&&(this._bounds.left-=t*K-e*K),this.invalidate())}getHeight(){return this._bounds.height}setHeight(t){const e=this._bounds.height||0;e!==t&&(this._bounds.height=t,0!==e&&(this._bounds.top-=t*K-e*K),this.invalidate())}setBounds(t,e,i,s){if(this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");let h=!1;"number"==typeof i&&(h=this._bounds.width!==i,this._bounds.width=i),"number"==typeof s&&(h=h||this._bounds.height!==s,this._bounds.height=s);const n=this._bounds.width,a=this._bounds.height,o=this._constraint?this._constraint.width:this.canvas.getWidth(),r=this._constraint?this._constraint.height:this.canvas.getHeight();if(this._keepInBounds){const i=M(0,-(n-o)),s=M(0,-(a-r)),h=r-a;t=M(o-n,z(t,i)),e=M(h,z(e,s))}else t>o&&(t+=n*K),e>r&&(e+=a*K);this.setX(t),this.setY(e),h&&this.invalidate()}getBounds(){return this._bounds}getDrawProps(){return this._drawProps||this.invalidateDrawProps(!0),this._drawProps}getRotation(){return this._rotation}setRotation(t,e){this._rotation=t%360,this._pivot=e,this.invalidateDrawProps()}setScale(t){this._scale=t,this.invalidateDrawProps()}getInteractive(){return this._interactive}setInteractive(t){this._interactive=t}update(t,e){let i=this._children[0];for(;i;)i.update(t,e),i=i.next;this._animation&&this.updateAnimation(e)}isVisible(t){return e=this._bounds,i=t||this.canvas.bbox,({left:X,top:C}=e),X+e.width>=i.left&&X<=i.right&&C+e.height>=i.top&&C<=i.bottom;var e,i}draw(t,e){const i=this._bounds;if(this._resourceId&&this.isVisible(e)){const s=this._animation;let{left:h,top:n,width:a,height:o}=i;if(s){const i=s.tileWidth?s.tileWidth:K+a<<0,r=s.tileHeight?s.tileHeight:K+o<<0;e&&(h-=e.left,n-=e.top),t.drawImageCropped(this._resourceId,s.col*i,s.type.row*r,i,r,h,n,a,o,this._drawProps)}else if(e){const{src:s,dest:h}=function(t,e){({left:X,top:C,width:W,height:R}=t);const{left:i,top:s,width:h,height:n}=e;return W=X>i?Math.min(W,h-(X-i)):Math.min(h,W-(i-X)),R=C>s?Math.min(R,n-(C-s)):Math.min(n,R-(s-C)),{src:{left:X>i?0:i-X,top:C>s?0:s-C,width:W,height:R},dest:{left:X>i?X-i:0,top:C>s?C-s:0,width:W,height:R}}}(i,e);t.drawImageCropped(this._resourceId,s.left,s.top,s.width,s.height,h.left,h.top,h.width,h.height,this._drawProps)}else t.drawImage(this._resourceId,h,n,a,o,this._drawProps)}let s=this._children[0];for(;s;)s.draw(t,e),s=s.next}insideBounds(t,e){const{left:i,top:s,width:h,height:n}=this._bounds;return t>=i&&t<=i+h&&e>=s&&e<=s+n}collidesWith(t){if(t===this)return!1;const e=this._bounds,i=t.getBounds();return!(e.top+e.height<i.top||e.top>i.top+i.height||e.left+e.width<i.left||e.left>i.left+i.width)}getIntersection(t){if(this.collidesWith(t)){const e=this._bounds,i=t.getBounds(),s=z(e.left,i.left),h=z(e.top,i.top);return{left:s,top:h,width:M(e.left+e.width,i.width+i.height)-s,height:M(e.top+e.height,i.top+i.height)-h}}}collidesWithEdge(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1}setResource(t,e,i){this._resourceId=t,"number"==typeof e&&this.setWidth(e),"number"==typeof i&&this.setHeight(i),this.invalidate()}getResourceId(){return this._resourceId}setSheet(t,e,i){this._sheet=t,t?(this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0,tileWidth:this.getWidth(),tileHeight:this.getHeight()},"number"==typeof e&&(this._animation.tileWidth=e),"number"==typeof i&&(this._animation.tileHeight=i),this.switchAnimation(0)):this._animation=void 0}switchAnimation(t){const e=this._animation,i=this._sheet[t];e.type=i,e.fpt=i.fpt,e.maxCol=i.col+(i.amount-1),e.col=i.col,e.counter=0,e.onComplete=i.onComplete}setParent(t){this._parent=t}getParent(){return this._parent}setCanvas(t){this.canvas=t;for(const e of this._children)e.setCanvas(t)}setConstraint(t,e,i,s){return this._constraint={left:t,top:e,width:i,height:s},this._bounds.left=z(t,this._bounds.left),this._bounds.top=z(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()}getConstraint(){return this._constraint}addChild(t){return t.setCanvas(this.canvas),super.addChild(t)}dispose(){this._disposed||super.dispose()}handlePress(t,e,i){}handleRelease(t,e,i){}handleClick(){}handleMove(t,e,i){const s=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),h=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(s,h,this._bounds.width,this._bounds.height)}handleInteraction(t,e,i){let s,h=!1;const n=this._children.length;if(n>0)for(s=this._children[n-1];s;){if(h=s.handleInteraction(t,e,i),h)return!0;s=s.last}if(!this._interactive)return!1;const{type:a}=i;if(this._pressed&&("touchend"===a||"mouseup"===a))return this._pressed=!1,this.isDragging&&(this.isDragging=!1),Date.now()-this._pressTime<250&&this.handleClick(),this.handleRelease(t,e,i),!0;if(this.insideBounds(t,e)){if(this.hover=!0,"touchstart"===a||"mousedown"===a)return this._pressTime=Date.now(),this._pressed=!0,this._draggable&&(this.isDragging=!0,this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e}),this.handlePress(t,e,i),"touchstart"===a&&(i.stopPropagation(),i.preventDefault()),!0}else this.hover=!1;return!!this.isDragging&&(this.handleMove(t,e,i),!0)}invalidate(){this.canvas&&this.canvas.invalidate()}invalidateDrawProps(t=!1){if(t||0!==this._rotation||this._mask||1!==this._scale){this._drawProps=this._drawProps??{alpha:1,safeMode:!1};const t=this._drawProps;t.rotation=this._rotation,t.pivot=this._pivot,t.blendMode=this._mask?"destination-in":void 0,t.scale=this._scale}}updateAnimation(t=1){const e=this._animation;e.counter+=t,e.counter>=e.fpt&&(++e.col,e.counter=e.counter%e.fpt),e.col>e.maxCol&&(e.col=e.type.col,"function"==typeof e.onComplete&&e.onComplete(this))}},Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),t}({});
