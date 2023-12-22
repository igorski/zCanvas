var zcanvas=function(t){"use strict";class e{constructor(){this._eventMap=[],this._disposed=!1}add(t,e,i){return!this.has(t,e)&&(t.addEventListener(e,i,!1),this._eventMap.push({target:t,type:e,listener:i}),!0)}has(t,e){let i=this._eventMap.length;for(;i--;){const s=this._eventMap[i];if(s.target===t&&s.type==e)return!0}return!1}remove(t,e){let i=this._eventMap.length;for(;i--;){const s=this._eventMap[i];if(s.target===t&&s.type===e)return t.removeEventListener(e,s.listener,!1),this._eventMap.splice(i,1),!0}return!1}dispose(){if(this._disposed)return;let t=this._eventMap.length;for(;t--;){const e=this._eventMap[t];this.remove(e.target,e.type)}this._eventMap=null,this._disposed=!0}}let i;function s(t=0,e=0,i=!1){const s=document.createElement("canvas"),h=s.getContext("2d",i?{willReadFrequently:!0}:void 0);return 0!==t&&0!==e&&(s.width=t,s.height=e),{cvs:s,ctx:h}}function h(){return i||(i=s().cvs),i}async function n(t){t instanceof Blob&&(t=await async function(t){const e=await a(t),{cvs:i,ctx:h}=s(e.width,e.height);return h.drawImage(e,0,0),i}(t)),r(h(),t);const e=await createImageBitmap(h());return i.width=1,i.height=1,e}function a(t){const e=URL.createObjectURL(t),i=()=>{URL.revokeObjectURL(e)};return new Promise(((t,s)=>{const h=new Image;h.onload=()=>{i(),t(h)},h.onerror=t=>{i(),s(t)},h.src=e}))}function r(t,e,i,s){const h=t.getContext("2d");i=i??e.width,s=s??e.height,t.width=i,t.height=s,h.clearRect(0,0,i,s),h.drawImage(e,0,0,i,s)}async function o(t){const e=new FileReader;return new Promise(((i,s)=>{e.onload=e=>{var h;if(!(null==(h=null==e?void 0:e.target)?void 0:h.result))return s();i(new Blob([e.target.result],{type:t.type}))},e.onerror=t=>s(t),e.readAsArrayBuffer(t)}))}const d={loadImage:t=>new Promise((async(i,s)=>{let h;if(t instanceof File?h=await o(t):t instanceof Blob&&(h=t),void 0!==h){try{const t=await a(h);d.onReady(t).then((()=>i(l(t))))}catch(m){s(m)}return}const n=function(t){const e=("string"==typeof t?t:t.src).substring(0,5);return"data:"===e||"blob:"===e}(t),r=new window.Image,c=new e,u=()=>{c.dispose(),d.onReady(r).then((()=>i(l(r)))).catch(s)};var p;n||(p=r,function(t){const{location:e}=window;return!(!t.startsWith("./")&&!t.startsWith(`${e.protocol}//${e.host}`)&&/^http[s]?:/.test(t))}(t)||(p.crossOrigin="Anonymous"),c.add(r,"load",u),c.add(r,"error",(()=>{c.dispose(),s()}))),r.src=t,n&&u()})),async loadBitmap(t){const{image:e}=await d.loadImage(t);return n(e)},isReady:t=>!0===t.complete&&"number"==typeof t.naturalWidth&&t.naturalWidth>0,onReady:t=>new Promise(((e,i)=>{let s=0;!function h(){d.isReady(t)?e():60==++s?(console.error(typeof t),i(new Error("Image could not be resolved. This shouldn't occur."))):window.requestAnimationFrame(h)}()}))};function l(t){const e={image:t,size:{width:0,height:0}};return t instanceof window.HTMLImageElement&&(e.size={width:(i=t).width||i.naturalWidth,height:i.height||i.naturalHeight}),e;var i}class c{constructor(t,e){this._index=0,this._map=new Map,this._createFn=t,this._destroyFn=e}dispose(){const t=[...this._map].map((([t])=>t));for(;t.length>0;)this.remove(t.shift());this._map=void 0}get(t){return this._map.get(t)}set(t,e){if(this.has(t)){if(this.get(t)===e)return;this.remove(t)}this._map.set(t,e)}has(t){return this._map.has(t)}remove(t){var e;if(!this.has(t))return!1;const i=this.get(t);return null==(e=this._destroyFn)||e.call(this,i),this._map.delete(t)}next(){let t;const e=this._index.toString();return this.has(e)?t=this.get(e):this._createFn&&(t=this._createFn(),this.set(e,t)),++this._index,t}fill(t){const e=this._index;for(let i=0;i<t;++i)this.next();this._index=e}reset(){this._index=0}}const u=.5;let p;class m{constructor(t,e=!1){this._debug=e,this._canvas=t,this._context=t.getContext("2d"),this._bitmapCache=new c(void 0,(t=>{t.close()})),this._patternCache=new c}dispose(){this._bitmapCache.dispose(),this._patternCache.dispose(),this._canvas=void 0}cacheResource(t,e){this._bitmapCache.set(t,e)}getResource(t){return this._bitmapCache.get(t)}disposeResource(t){this._bitmapCache.remove(t)}setDimensions(t,e){this._canvas.width=t,this._canvas.height=e}setSmoothing(t){const e=this._context;["imageSmoothingEnabled","mozImageSmoothingEnabled","oImageSmoothingEnabled","webkitImageSmoothingEnabled"].forEach((i=>{void 0!==e[i]&&(e[i]=t)}))}save(){this._context.save()}restore(){this._context.restore()}translate(t,e){this._context.translate(t,e)}rotate(t){this._context.rotate(t)}transform(t,e,i,s,h,n){this._context.transform(t,e,i,s,h,n)}scale(t,e=t){this._context.scale(t,e)}setBlendMode(t){this._context.globalCompositeOperation=t}setAlpha(t){this._context.globalAlpha=t}clearRect(t,e,i,s){this._context.clearRect(t,e,i,s)}drawRect(t,e,i,s,h,n="fill"){if(p=this._context,"fill"===n)p.fillStyle=h,p.fillRect(t,e,i,s);else{const n=1;p.lineWidth=n,p.strokeStyle=h,p.strokeRect(u+(t-n),u+(e-n),i,s)}}drawRoundRect(t,e,i,s,h,n,a){p=this._context,"fill"===a?(p.fillStyle=n,p.fillRect(t,e,i,s)):(p.strokeStyle=n,p.beginPath(),p.roundRect(t,e,i,s,h),p.stroke())}drawCircle(t,e,i,s="transparent",h){p=this._context,p.beginPath(),p.arc(t+i,e+i,i,0,2*Math.PI,!1),"transparent"!==s&&(p.fillStyle=s,p.fill()),h&&(p.lineWidth=5,p.strokeStyle=h,p.closePath(),p.stroke())}drawImage(t,e,i,s,h,n){if(!this._bitmapCache.has(t))return;const a=!!n&&this.applyDrawContext(n,e,i,s,h);void 0===s?this._context.drawImage(this._bitmapCache.get(t),e,i):this._context.drawImage(this._bitmapCache.get(t),e,i,s,h),this._debug&&this.drawRect(e,i,s,h,"#FF0000","stroke"),a&&this.restore()}drawImageCropped(t,e,i,s,h,n,a,r,o,d){if(!this._bitmapCache.has(t))return;if(null==d?void 0:d.safeMode){if(r<=0||o<=0)return;const n=this._bitmapCache.get(t),a=(r=Math.min(this._context.canvas.width,r))/s,d=(o=Math.min(this._context.canvas.height,o))/h;e+s>n.width&&(r-=a*(e+s-n.width),s-=e+s-n.width),i+h>n.height&&(o-=d*(i+h-n.height),h-=i+h-n.height)}const l=!!d&&this.applyDrawContext(d,n,a,r,o);this._context.drawImage(this._bitmapCache.get(t),u+e<<0,u+i<<0,u+s<<0,u+h<<0,u+n<<0,u+a<<0,u+r<<0,u+o<<0),this._debug&&this.drawRect(n,a,r,o,"#FF0000","stroke"),l&&this.restore()}createPattern(t,e){this._bitmapCache.has(t)&&this._patternCache.set(t,this._context.createPattern(this._bitmapCache.get(t),e))}drawPattern(t,e,i,s,h){if(!this._patternCache.has(t))return;const n=this._patternCache.get(t);this._context.fillStyle=n,this._context.fillRect(e,i,s,h)}applyDrawContext(t,e,i,s,h){var n,a;const r=void 0!==t.scale&&1!==t.scale,o=0!==t.rotation,d=void 0!==t.alpha,l=void 0!==t.blendMode;let c=r||o||d||l;if(c&&this.save(),r&&!o&&this.scale(t.scale),o){const r=t.scale??1,o=(null==(n=t.pivot)?void 0:n.x)??e+s*u,d=(null==(a=t.pivot)?void 0:a.y)??i+h*u,l=Math.cos(t.rotation)*r,c=Math.sin(t.rotation)*r;this._context.setTransform(l,c,-c,l,o-o*l+d*c,d-o*c-d*l)}return l&&this.setBlendMode(t.blendMode),d&&this.setAlpha(t.alpha),c}}const _="IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NsYXNzIHR7Y29uc3RydWN0b3IodCxlKXt0aGlzLl9pbmRleD0wLHRoaXMuX21hcD1uZXcgTWFwLHRoaXMuX2NyZWF0ZUZuPXQsdGhpcy5fZGVzdHJveUZuPWV9ZGlzcG9zZSgpe2NvbnN0IHQ9Wy4uLnRoaXMuX21hcF0ubWFwKCgoW3RdKT0+dCkpO2Zvcig7dC5sZW5ndGg+MDspdGhpcy5yZW1vdmUodC5zaGlmdCgpKTt0aGlzLl9tYXA9dm9pZCAwfWdldCh0KXtyZXR1cm4gdGhpcy5fbWFwLmdldCh0KX1zZXQodCxlKXtpZih0aGlzLmhhcyh0KSl7aWYodGhpcy5nZXQodCk9PT1lKXJldHVybjt0aGlzLnJlbW92ZSh0KX10aGlzLl9tYXAuc2V0KHQsZSl9aGFzKHQpe3JldHVybiB0aGlzLl9tYXAuaGFzKHQpfXJlbW92ZSh0KXt2YXIgZTtpZighdGhpcy5oYXModCkpcmV0dXJuITE7Y29uc3Qgcz10aGlzLmdldCh0KTtyZXR1cm4gbnVsbD09KGU9dGhpcy5fZGVzdHJveUZuKXx8ZS5jYWxsKHRoaXMscyksdGhpcy5fbWFwLmRlbGV0ZSh0KX1uZXh0KCl7bGV0IHQ7Y29uc3QgZT10aGlzLl9pbmRleC50b1N0cmluZygpO3JldHVybiB0aGlzLmhhcyhlKT90PXRoaXMuZ2V0KGUpOnRoaXMuX2NyZWF0ZUZuJiYodD10aGlzLl9jcmVhdGVGbigpLHRoaXMuc2V0KGUsdCkpLCsrdGhpcy5faW5kZXgsdH1maWxsKHQpe2NvbnN0IGU9dGhpcy5faW5kZXg7Zm9yKGxldCBzPTA7czx0Oysrcyl0aGlzLm5leHQoKTt0aGlzLl9pbmRleD1lfXJlc2V0KCl7dGhpcy5faW5kZXg9MH19Y29uc3QgZT0uNTtsZXQgcyxhLGk7Y2xhc3Mgb3tjb25zdHJ1Y3RvcihlLHM9ITEpe3RoaXMuX2RlYnVnPXMsdGhpcy5fY2FudmFzPWUsdGhpcy5fY29udGV4dD1lLmdldENvbnRleHQoIjJkIiksdGhpcy5fYml0bWFwQ2FjaGU9bmV3IHQodm9pZCAwLCh0PT57dC5jbG9zZSgpfSkpLHRoaXMuX3BhdHRlcm5DYWNoZT1uZXcgdH1kaXNwb3NlKCl7dGhpcy5fYml0bWFwQ2FjaGUuZGlzcG9zZSgpLHRoaXMuX3BhdHRlcm5DYWNoZS5kaXNwb3NlKCksdGhpcy5fY2FudmFzPXZvaWQgMH1jYWNoZVJlc291cmNlKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuc2V0KHQsZSl9Z2V0UmVzb3VyY2UodCl7cmV0dXJuIHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KX1kaXNwb3NlUmVzb3VyY2UodCl7dGhpcy5fYml0bWFwQ2FjaGUucmVtb3ZlKHQpfXNldERpbWVuc2lvbnModCxlKXt0aGlzLl9jYW52YXMud2lkdGg9dCx0aGlzLl9jYW52YXMuaGVpZ2h0PWV9c2V0U21vb3RoaW5nKHQpe2NvbnN0IGU9dGhpcy5fY29udGV4dDtbImltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm9JbWFnZVNtb290aGluZ0VuYWJsZWQiLCJ3ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQiXS5mb3JFYWNoKChzPT57dm9pZCAwIT09ZVtzXSYmKGVbc109dCl9KSl9c2F2ZSgpe3RoaXMuX2NvbnRleHQuc2F2ZSgpfXJlc3RvcmUoKXt0aGlzLl9jb250ZXh0LnJlc3RvcmUoKX10cmFuc2xhdGUodCxlKXt0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSh0LGUpfXJvdGF0ZSh0KXt0aGlzLl9jb250ZXh0LnJvdGF0ZSh0KX10cmFuc2Zvcm0odCxlLHMsYSxpLG8pe3RoaXMuX2NvbnRleHQudHJhbnNmb3JtKHQsZSxzLGEsaSxvKX1zY2FsZSh0LGU9dCl7dGhpcy5fY29udGV4dC5zY2FsZSh0LGUpfXNldEJsZW5kTW9kZSh0KXt0aGlzLl9jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj10fXNldEFscGhhKHQpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGE9dH1jbGVhclJlY3QodCxlLHMsYSl7dGhpcy5fY29udGV4dC5jbGVhclJlY3QodCxlLHMsYSl9ZHJhd1JlY3QodCxhLGksbyxuLHI9ImZpbGwiKXtpZihzPXRoaXMuX2NvbnRleHQsImZpbGwiPT09cilzLmZpbGxTdHlsZT1uLHMuZmlsbFJlY3QodCxhLGksbyk7ZWxzZXtjb25zdCByPTE7cy5saW5lV2lkdGg9cixzLnN0cm9rZVN0eWxlPW4scy5zdHJva2VSZWN0KGUrKHQtciksZSsoYS1yKSxpLG8pfX1kcmF3Um91bmRSZWN0KHQsZSxhLGksbyxuLHIpe3M9dGhpcy5fY29udGV4dCwiZmlsbCI9PT1yPyhzLmZpbGxTdHlsZT1uLHMuZmlsbFJlY3QodCxlLGEsaSkpOihzLnN0cm9rZVN0eWxlPW4scy5iZWdpblBhdGgoKSxzLnJvdW5kUmVjdCh0LGUsYSxpLG8pLHMuc3Ryb2tlKCkpfWRyYXdDaXJjbGUodCxlLGEsaT0idHJhbnNwYXJlbnQiLG8pe3M9dGhpcy5fY29udGV4dCxzLmJlZ2luUGF0aCgpLHMuYXJjKHQrYSxlK2EsYSwwLDIqTWF0aC5QSSwhMSksInRyYW5zcGFyZW50IiE9PWkmJihzLmZpbGxTdHlsZT1pLHMuZmlsbCgpKSxvJiYocy5saW5lV2lkdGg9NSxzLnN0cm9rZVN0eWxlPW8scy5jbG9zZVBhdGgoKSxzLnN0cm9rZSgpKX1kcmF3SW1hZ2UodCxlLHMsYSxpLG8pe2lmKCF0aGlzLl9iaXRtYXBDYWNoZS5oYXModCkpcmV0dXJuO2NvbnN0IG49ISFvJiZ0aGlzLmFwcGx5RHJhd0NvbnRleHQobyxlLHMsYSxpKTt2b2lkIDA9PT1hP3RoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlLHMpOnRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlLHMsYSxpKSx0aGlzLl9kZWJ1ZyYmdGhpcy5kcmF3UmVjdChlLHMsYSxpLCIjRkYwMDAwIiwic3Ryb2tlIiksbiYmdGhpcy5yZXN0b3JlKCl9ZHJhd0ltYWdlQ3JvcHBlZCh0LHMsYSxpLG8sbixyLGgsYyxsKXtpZighdGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpKXJldHVybjtpZihudWxsPT1sP3ZvaWQgMDpsLnNhZmVNb2RlKXtpZihoPD0wfHxjPD0wKXJldHVybjtjb25zdCBlPXRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxuPShoPU1hdGgubWluKHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLGgpKS9pLHI9KGM9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0LGMpKS9vO3MraT5lLndpZHRoJiYoaC09bioocytpLWUud2lkdGgpLGktPXMraS1lLndpZHRoKSxhK28+ZS5oZWlnaHQmJihjLT1yKihhK28tZS5oZWlnaHQpLG8tPWErby1lLmhlaWdodCl9Y29uc3QgZD0hIWwmJnRoaXMuYXBwbHlEcmF3Q29udGV4dChsLG4scixoLGMpO3RoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlK3M8PDAsZSthPDwwLGUraTw8MCxlK288PDAsZStuPDwwLGUrcjw8MCxlK2g8PDAsZStjPDwwKSx0aGlzLl9kZWJ1ZyYmdGhpcy5kcmF3UmVjdChuLHIsaCxjLCIjRkYwMDAwIiwic3Ryb2tlIiksZCYmdGhpcy5yZXN0b3JlKCl9Y3JlYXRlUGF0dGVybih0LGUpe3RoaXMuX2JpdG1hcENhY2hlLmhhcyh0KSYmdGhpcy5fcGF0dGVybkNhY2hlLnNldCh0LHRoaXMuX2NvbnRleHQuY3JlYXRlUGF0dGVybih0aGlzLl9iaXRtYXBDYWNoZS5nZXQodCksZSkpfWRyYXdQYXR0ZXJuKHQsZSxzLGEsaSl7aWYoIXRoaXMuX3BhdHRlcm5DYWNoZS5oYXModCkpcmV0dXJuO2NvbnN0IG89dGhpcy5fcGF0dGVybkNhY2hlLmdldCh0KTt0aGlzLl9jb250ZXh0LmZpbGxTdHlsZT1vLHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoZSxzLGEsaSl9YXBwbHlEcmF3Q29udGV4dCh0LHMsYSxpLG8pe3ZhciBuLHI7Y29uc3QgaD12b2lkIDAhPT10LnNjYWxlJiYxIT09dC5zY2FsZSxjPTAhPT10LnJvdGF0aW9uLGw9dm9pZCAwIT09dC5hbHBoYSxkPXZvaWQgMCE9PXQuYmxlbmRNb2RlO2xldCBtPWh8fGN8fGx8fGQ7aWYobSYmdGhpcy5zYXZlKCksaCYmIWMmJnRoaXMuc2NhbGUodC5zY2FsZSksYyl7Y29uc3QgaD10LnNjYWxlPz8xLGM9KG51bGw9PShuPXQucGl2b3QpP3ZvaWQgMDpuLngpPz9zK2kqZSxsPShudWxsPT0ocj10LnBpdm90KT92b2lkIDA6ci55KT8/YStvKmUsZD1NYXRoLmNvcyh0LnJvdGF0aW9uKSpoLG09TWF0aC5zaW4odC5yb3RhdGlvbikqaDt0aGlzLl9jb250ZXh0LnNldFRyYW5zZm9ybShkLG0sLW0sZCxjLWMqZCtsKm0sbC1jKm0tbCpkKX1yZXR1cm4gZCYmdGhpcy5zZXRCbGVuZE1vZGUodC5ibGVuZE1vZGUpLGwmJnRoaXMuc2V0QWxwaGEodC5hbHBoYSksbX19b25tZXNzYWdlPXQ9Pntzd2l0Y2godC5kYXRhLmNtZCl7ZGVmYXVsdDpicmVhaztjYXNlImluaXQiOmk9dC5kYXRhLmNhbnZhcyxhPW5ldyBvKGksdC5kYXRhLmRlYnVnKSxjb25zb2xlLmluZm8oIi0tLSBpbml0aWFsaXplZCBXb3JrZXIiLGksYSk7YnJlYWs7Y2FzZSJsb2FkUmVzb3VyY2UiOiFhc3luYyBmdW5jdGlvbih0LGUpe3RyeXtsZXQgcztpZihlIGluc3RhbmNlb2YgRmlsZSl7Y29uc3QgdD1hd2FpdCBhc3luYyBmdW5jdGlvbih0KXtjb25zdCBlPW5ldyBGaWxlUmVhZGVyO3JldHVybiBuZXcgUHJvbWlzZSgoKHMsYSk9PntlLm9ubG9hZD1lPT57dmFyIGk7aWYoIShudWxsPT0oaT1udWxsPT1lP3ZvaWQgMDplLnRhcmdldCk/dm9pZCAwOmkucmVzdWx0KSlyZXR1cm4gYSgpO3MobmV3IEJsb2IoW2UudGFyZ2V0LnJlc3VsdF0se3R5cGU6dC50eXBlfSkpfSxlLm9uZXJyb3I9dD0+YSh0KSxlLnJlYWRBc0FycmF5QnVmZmVyKHQpfSkpfShlKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKHQpfWVsc2UgaWYoZSBpbnN0YW5jZW9mIEJsb2Ipcz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcChlKTtlbHNlIGlmKCJzdHJpbmciPT10eXBlb2YgZSl7Y29uc3QgdD1hd2FpdCBmZXRjaChlKSxhPWF3YWl0IHQuYmxvYigpO3M9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoYSl9ZWxzZSBlIGluc3RhbmNlb2YgSW1hZ2VCaXRtYXAmJihzPWUpO251bGw9PWF8fGEuY2FjaGVSZXNvdXJjZSh0LHMpLHBvc3RNZXNzYWdlKHtjbWQ6Im9ubG9hZCIsaWQ6dCxzaXplOnt3aWR0aDpzLndpZHRoLGhlaWdodDpzLmhlaWdodH19KX1jYXRjaChzKXtwb3N0TWVzc2FnZSh7Y21kOiJvbmVycm9yIixpZDp0LGVycm9yOihudWxsPT1zP3ZvaWQgMDpzLm1lc3NhZ2UpPz9zfSl9fSh0LmRhdGEuaWQsdC5kYXRhLnNvdXJjZSk7YnJlYWs7Y2FzZSJnZXRSZXNvdXJjZSI6Y29uc3QgZT1udWxsPT1hP3ZvaWQgMDphLmdldFJlc291cmNlKHQuZGF0YS5pZCk7cG9zdE1lc3NhZ2Uoe2NtZDoib25yZXNvdXJjZSIsaWQ6dC5kYXRhLmlkLGJpdG1hcDplfSk7YnJlYWs7Y2FzZSJkaXNwb3NlUmVzb3VyY2UiOm51bGw9PWF8fGEuZGlzcG9zZVJlc291cmNlKC4uLnQuZGF0YS5hcmdzKTticmVhaztjYXNlImRpc3Bvc2UiOm51bGw9PWF8fGEuZGlzcG9zZSgpLGk9dm9pZCAwLGE9dm9pZCAwO2JyZWFrO2Nhc2UicmVuZGVyIjppZighYXx8IXQuZGF0YS5jb21tYW5kcylyZXR1cm47Zm9yKGNvbnN0IHMgb2YgdC5kYXRhLmNvbW1hbmRzKXtjb25zdCB0PXMuc2hpZnQoKTthW3RdKC4uLnMpfXBvc3RNZXNzYWdlKHtjbWQ6Im9ucmVuZGVyIn0pO2JyZWFrO2Nhc2Uic2V0RGltZW5zaW9ucyI6Y2FzZSJzZXRTbW9vdGhpbmciOmNhc2UiY3JlYXRlUGF0dGVybiI6YVt0LmRhdGEuY21kXSguLi50LmRhdGEuYXJncyl9fX0oKTsK",g="undefined"!=typeof window&&window.Blob&&new Blob([atob(_)],{type:"text/javascript;charset=utf-8"});function w(){let t;try{if(t=g&&(window.URL||window.webkitURL).createObjectURL(g),!t)throw"";return new Worker(t)}catch(e){return new Worker("data:application/javascript;base64,"+_)}finally{t&&(window.URL||window.webkitURL).revokeObjectURL(t)}}class b{constructor(t,e=!1,i=!1){if(this._useWorker=!1,this._element=t,e&&"function"==typeof this._element.transferControlToOffscreen){this._useWorker=!0,this._callbacks=new Map,this._pool=new c((()=>[]),(t=>{t.length=0})),this._pool.fill(1e3),this._commands=[];const e=t.transferControlToOffscreen();this._worker=new w,this._worker.postMessage({cmd:"init",canvas:e,debug:i},[e]),this._worker.onmessage=this.handleMessage.bind(this)}else this._renderer=new m(this._element,i)}loadResource(t,e){return new Promise((async(i,s)=>{if(e instanceof ImageBitmap)this._useWorker?this.wrappedWorkerLoad(t,e,i,s,!0):(this._renderer.cacheResource(t,e),i({width:e.width,height:e.height}));else if("string"!=typeof e){if(e instanceof HTMLImageElement||e instanceof HTMLCanvasElement){const s=await n(e);return this.loadResource(t,s).then((t=>i(t)))}if(e instanceof File)if(this._useWorker)this.wrappedWorkerLoad(t,e,i,s);else{const h=await o(e);this.wrappedLoad(t,h,i,s)}else e instanceof Blob?this._useWorker?this.wrappedWorkerLoad(t,e,i,s):this.wrappedLoad(t,e,i,s):s("Unsupported resource type: "+typeof e)}else if(e=e.startsWith("./")?new URL(e,document.baseURI).href:e,this._useWorker)this.wrappedWorkerLoad(t,e,i,s);else{const h=await d.loadImage(e);this.wrappedLoad(t,h.image,i,s)}}))}getResource(t){return new Promise(((e,i)=>{this._useWorker?(this._callbacks.set(t,{resolve:e,reject:i}),this._worker.postMessage({cmd:"getResource",id:t})):e(this._renderer.getResource(t))}))}disposeResource(t){this.getBackend("disposeResource",t)}onCommandsReady(){this._useWorker&&(this._worker.postMessage({cmd:"render",commands:this._commands}),this._commands.length=0,this._pool.reset())}dispose(){this.getBackend("dispose"),setTimeout((()=>{var t,e;null==(t=this._worker)||t.terminate(),this._worker=void 0,null==(e=this._callbacks)||e.clear()}),50)}handleMessage(t){const{cmd:e,id:i}=t.data;switch(e){default:break;case"onload":if(!this._callbacks.has(i))return;this._callbacks.get(i).resolve(t.data.size),this._callbacks.delete(i);break;case"onerror":if(!this._callbacks.has(i))return;this._callbacks.get(i).reject(new Error(t.data.error)),this._callbacks.delete(i);break;case"onresource":this._callbacks.get(i).resolve(t.data.bitmap),this._callbacks.delete(i)}}wrappedWorkerLoad(t,e,i,s,h=!1){this._callbacks.set(t,{resolve:i,reject:s}),this._worker.postMessage({cmd:"loadResource",source:e,id:t},h?[e]:[])}async wrappedLoad(t,e,i,s){try{const s=await n(e);this._renderer.cacheResource(t,s),i({width:s.width,height:s.height})}catch(h){s(h)}}setDimensions(t,e){this.getBackend("setDimensions",t,e)}createPattern(t,e){this.getBackend("createPattern",t,e)}setSmoothing(t){this.getBackend("setSmoothing",t)}save(){this.onDraw("save")}restore(){this.onDraw("restore")}translate(t,e){this.onDraw("translate",t,e)}rotate(t){this.onDraw("rotate",t)}transform(t,e,i,s,h,n){this.onDraw("transform",t,e,i,s,h,n)}scale(t,e){this.onDraw("scale",t,e)}setBlendMode(t){this.onDraw("setBlendMode",t)}setAlpha(t){this.onDraw("setAlpha",t)}clearRect(t,e,i,s){this.onDraw("clearRect",t,e,i,s)}drawRect(t,e,i,s,h,n){this.onDraw("drawRect",t,e,i,s,h,n)}drawRoundRect(t,e,i,s,h,n,a){this.onDraw("drawRoundRect",t,e,i,s,h,n,a)}drawCircle(t,e,i,s="transparent",h){this.onDraw("drawCircle",t,e,i,s,h)}drawImage(t,e,i,s,h,n){this.onDraw("drawImage",t,e,i,s,h,n)}drawImageCropped(t,e,i,s,h,n,a,r,o,d){this.onDraw("drawImageCropped",t,e,i,s,h,n,a,r,o,d)}drawPattern(t,e,i,s,h){this.onDraw("drawPattern",t,e,i,s,h)}onDraw(t,...e){if(this._useWorker){const i=this._pool.next();return i.length=0,i.push(t,...e),void this._commands.push(i)}this._renderer[t](...e)}getBackend(t,...e){if(this._useWorker)return this._worker.postMessage({cmd:t,args:[...e]});this._renderer[t](...e)}}const f=t=>t>0?t+.5<<0:0|t,v=[],Z=[],C=s(1,1,!0).cvs;class G{constructor(t){this._renderer=t,this._cacheMap=new Map}dispose(){this._cacheMap.clear(),this._cacheMap=void 0}getChildrenUnderPoint(t,e,i,s,h,n=!1){const a=[];let r,o,d,l,c,u=t.length;for(;u--;)r=t[u],o=r.getX(),d=r.getY(),l=r.getWidth(),c=r.getHeight(),o<e+s&&o+l>e&&d<i+h&&d+c>i&&(!n||n&&r.collidable)&&a.push(r);return a}pixelCollision(t,e,i=!1){const s=t.getIntersection(e);if(void 0===s)return!1;this.getPixelArray(t,s,v),this.getPixelArray(e,s,Z);let h=0;if(!0===i){const t=s.width,e=s.height;for(let i=0;i<e;++i)for(let e=0;e<t;++e){if(0!==v[h]&&0!==Z[h])return{x:e,y:i};++h}}else{const t=v.length;for(;h<t;++h)if(0!==v[h]&&0!==Z[h])return!0}return!1}async cache(t){const e=await this._renderer.getResource(t);if(!e)return!1;const{width:i,height:s}=e;return r(C,e,i,s),this._cacheMap.set(t,{data:C.getContext("2d").getImageData(0,0,i,s).data,size:{width:i,height:s}}),C.width=C.height=1,!0}clearCache(t){return!!this.hasCache(t)&&(this._cacheMap.delete(t),!0)}hasCache(t){return this._cacheMap.has(t)}getPixelArray(t,e,i){const s=t.getResourceId();if(!this.hasCache(s))throw new Error(`Cannot get cached entry for resource "${s}". Cache it first.`);const h=t.getBounds(),n=f(e.left-h.left),a=f(e.top-h.top),r=f(e.width),o=f(e.height),{data:d,size:l}=this._cacheMap.get(s);if(0===r||0===o)return void(i.length=0);i.length=f(r*o);const c=l.width,u=a+o,p=n+r;let m=-1;for(let _=a;_<u;++_)for(let t=n;t<p;++t){const e=4*(_*c+t);i[++m]=d[e+3]}}}const{min:X,max:R,round:W}=Math;let y,Y,x,L;const{min:S,max:k}=Math,H=180/Math.PI,F=Math.PI/180,z=.5;return t.Canvas=class{constructor({width:t=300,height:e=300,fps:i=60,scale:s=1,backgroundColor:h=null,animate:n=!1,smoothing:a=!0,stretchToFit:r=!1,viewport:o=null,preventEventBubbling:d=!1,parentElement:l=null,debug:c=!1,optimize:u="auto",viewportHandler:p,onUpdate:m,onResize:_}={}){if(this.DEBUG=!1,this.benchmark={minElapsed:1/0,maxElapsed:-1/0,minFps:1/0,maxFps:-1/0},this._smoothing=!1,this._stretchToFit=!1,this._HDPIscaleRatio=1,this._preventDefaults=!1,this._lastRender=0,this._renderId=0,this._renderPending=!1,this._disposed=!1,this._scale={x:1,y:1},this._activeTouches=[],this._children=[],this._animate=!1,this._hasFsHandler=!1,this._isFullScreen=!1,t<=0||e<=0)throw new Error("cannot construct a zCanvas without valid dimensions");this.DEBUG=c;const{userAgent:g}=navigator,w=g.includes("Safari")&&!g.includes("Chrome"),f=["auto","worker"].includes(u)&&!w;this._element=document.createElement("canvas"),this._renderer=new b(this._element,f,c),this.collision=new G(this._renderer),this._updateHandler=m,this._renderHandler=this.render.bind(this),this._viewportHandler=p,this._resizeHandler=_,this.setFrameRate(i),this.setAnimatable(n),h&&this.setBackgroundColor(h),this._HDPIscaleRatio=window.devicePixelRatio||1,this.setDimensions(t,e,!0,!0),o&&this.setViewport(o.width,o.height),1!==s&&this.scale(s,s),this._stretchToFit=r,this.setSmoothing(a),this.preventEventBubbling(d),this.addListeners(),l instanceof HTMLElement&&this.insertInPage(l),requestAnimationFrame((()=>this.handleResize()))}loadResource(t,e){return this._renderer.loadResource(t,e)}getResource(t){return this._renderer.getResource(t)}disposeResource(t){return this._renderer.disposeResource(t)}getRenderer(){return this._renderer}insertInPage(t){if(this._element.parentNode)throw new Error("Canvas already present in DOM");t.appendChild(this._element)}getElement(){return this._element}preventEventBubbling(t){this._preventDefaults=t}addChild(t){if(this.contains(t))return this;const e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t),t.next=void 0,t.setCanvas(this),t.setParent(this),this._children.push(t),this.invalidate(),this}removeChild(t){t.setParent(void 0),t.setCanvas(void 0);const e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);const i=t.last,s=t.next;return i&&(i.next=s),s&&(s.last=i),t.last=t.next=void 0,this.invalidate(),t}getChildAt(t){return this._children[t]}removeChildAt(t){return this.removeChild(this.getChildAt(t))}numChildren(){return this._children.length}getChildren(){return this._children}contains(t){return t.canvas===this}invalidate(){this._animate||this._renderPending||(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler))}getFrameRate(){return this._fps}setFrameRate(t){this._fps=t,this._aFps=t,this._renderInterval=1e3/t}getActualFrameRate(){return this._aFps}getRenderInterval(){return this._renderInterval}getSmoothing(){return this._smoothing}setSmoothing(t){this._renderer.setSmoothing(t),t?this._element.style["image-rendering"]="":["-moz-crisp-edges","-webkit-crisp-edges","pixelated","crisp-edges"].forEach((t=>{this._element.style["image-rendering"]=t})),this._smoothing=t,this.invalidate()}getWidth(){return this._enqueuedSize?this._enqueuedSize.width:this._width}getHeight(){return this._enqueuedSize?this._enqueuedSize.height:this._height}setDimensions(t,e,i=!0,s=!1){this._enqueuedSize={width:t,height:e},i&&(this._preferredWidth=t,this._preferredHeight=e),s&&this.updateCanvasSize(),this.invalidate()}getViewport(){return this._viewport}setViewport(t,e){this._viewport={width:t,height:e,left:0,top:0,right:t,bottom:e},this.panViewport(0,0),this.invalidate()}panViewport(t,e,i=!1){var s;const h=this._viewport;h.left=R(0,X(t,this._width-h.width)),h.right=h.left+h.width,h.top=R(0,X(e,this._height-h.height)),h.bottom=h.top+h.height,this.invalidate(),i&&(null==(s=this._viewportHandler)||s.call(this,{type:"panned",value:h}))}setBackgroundColor(t){this._bgColor=t}setAnimatable(t){var e;this._lastRaf=(null==(e=window.performance)?void 0:e.now())||Date.now(),t&&!this._renderPending&&this.invalidate(),this._animate=t}isAnimatable(){return this._animate}scale(t,e=t){this._scale={x:t,y:e};const i=1===t&&1===e?"":`scale(${t}, ${e})`,{style:s}=this._element;s["-webkit-transform-origin"]=s["transform-origin"]="0 0",s["-webkit-transform"]=s.transform=i,this.invalidate()}stretchToFit(t){this._stretchToFit=t,this.handleResize()}setFullScreen(t,e=!1){if(!this._hasFsHandler){this._hasFsHandler=!0;const t=document,i=()=>{this._isFullScreen=t.webkitIsFullScreen||t.mozFullScreen||!0===t.msFullscreenElement,e&&(this._stretchToFit=this._isFullScreen)};["webkitfullscreenchange","mozfullscreenchange","fullscreenchange","MSFullscreenChange"].forEach((e=>{this._eventHandler.add(t,e,i)}))}t!==this._isFullScreen&&function(t){let e;e=t.fullscreenElement||t.webkitFullscreenElement?t.exitFullscreen||t.webkitExitFullscreen||t.mozCancelFullScreen||t.msExitFullscreen:t.requestFullScreen||t.webkitRequestFullScreen||t.mozRequestFullScreen||t.msRequestFullscreen,e&&e.call(t)}(this._element)}handleResize(){const{innerWidth:t,innerHeight:e}=window,i=this._preferredWidth,s=this._preferredHeight;let h=t,n=e,a=1,r=1;if(this._stretchToFit||t<i||e<s)i>s?n=h*(i/s):i<s&&(n*=s/i),h=W(X(t,h)),n=W(X(e,n)),a=t/h,r=e/n,this.setDimensions(h,n,!1,!0);else{const o=s/i;if(h=X(i,t),n=X(e,W(h*o)),this.setDimensions(i,s,!1),a=r=t<i?t/i:1,this._viewport){const t=h/a,e=n/r;this.setViewport(t,e)}}this.scale(a,r)}getCoordinate(){return void 0===this._coords&&(this._coords=this._element.getBoundingClientRect()),this._coords}dispose(){if(this._disposed)return;this._animate=!1,window.cancelAnimationFrame(this._renderId),this.removeListeners();let t=this.numChildren();for(;t--;)this._children[t].dispose();this._children=[],this._element.parentNode&&this._element.parentNode.removeChild(this._element),requestAnimationFrame((()=>{this._renderer.dispose(),this._renderer=void 0,this.collision.dispose(),this.collision=void 0})),this._disposed=!0}handleInteraction(t){const e=this._children.length,i=this._viewport;let s;if(e>0)switch(s=this._children[e-1],t.type){default:let h=0,n=0;const a=t.changedTouches;let r=0,o=a.length;if(o>0){let{x:d,y:l}=this.getCoordinate();for(i&&(d-=i.left,l-=i.top),r=0;r<o;++r){const i=a[r],{identifier:o}=i;if(h=i.pageX-d,n=i.pageY-l,"touchstart"===t.type){for(;s;){if(!this._activeTouches.includes(s)&&s.handleInteraction(h,n,t)){this._activeTouches[o]=s;break}s=s.last}s=this._children[e-1]}else s=this._activeTouches[o],(null==s?void 0:s.handleInteraction(h,n,t))&&"touchmove"!==t.type&&(this._activeTouches[o]=null)}}break;case"mousedown":case"mousemove":case"mouseup":let{offsetX:d,offsetY:l}=t;for(i&&(d+=i.left,l+=i.top);s&&!s.handleInteraction(d,l,t);)s=s.last;break;case"wheel":const{deltaX:c,deltaY:u}=t,p=20,m=0===c?0:c>0?p:-p,_=0===u?0:u>0?p:-p;this.panViewport(i.left+m,i.top+_,!0)}this._preventDefaults&&(t.stopPropagation(),t.preventDefault()),this._animate||this.invalidate()}render(t=0){this._renderPending=!1;const e=t-this._lastRender;if(this._animate&&e/this._renderInterval<.999)return this._renderId=window.requestAnimationFrame(this._renderHandler),void(this._lastRaf=t);let i,s;this._aFps=1e3/(t-this._lastRaf),i=this._fps>60?this._fps/this._aFps:60===this._fps&&this._aFps>63?1:1/(this._fps/this._aFps),this._lastRaf=t,this._lastRender=t-e%this._renderInterval,this._enqueuedSize&&this.updateCanvasSize();const h=this._width,n=this._height;this._bgColor?this._renderer.drawRect(0,0,h,n,this._bgColor):this._renderer.clearRect(0,0,h,n);const a="function"==typeof this._updateHandler;for(a&&this._updateHandler(t,i),s=this._children[0];s;)a||s.update(t,i),s.draw(this._renderer,this._viewport),s=s.next;if(this._renderer.onCommandsReady(),!this._disposed&&this._animate&&(this._renderPending=!0,this._renderId=window.requestAnimationFrame(this._renderHandler)),this.DEBUG&&t>2){const e=window.performance.now()-t;this.benchmark.minElapsed=X(this.benchmark.minElapsed,e),this.benchmark.maxElapsed=R(this.benchmark.maxElapsed,e),this._aFps!==1/0&&(this.benchmark.minFps=X(this.benchmark.minFps,this._aFps),this.benchmark.maxFps=R(this.benchmark.maxFps,this._aFps))}}addListeners(){this._eventHandler||(this._eventHandler=new e);const t=this._eventHandler,i=this.handleInteraction.bind(this),s=this._element;"ontouchstart"in window&&["start","move","end","cancel"].forEach((e=>{t.add(s,`touch${e}`,i)})),["down","move"].forEach((e=>{t.add(s,`mouse${e}`,i)})),t.add(window,"mouseup",i),this._viewport&&t.add(s,"wheel",i),t.add(window,"resize",this.handleResize.bind(this))}removeListeners(){var t;null==(t=this._eventHandler)||t.dispose(),this._eventHandler=void 0}updateCanvasSize(){var t;const e=this._HDPIscaleRatio;let i,s;if(void 0!==this._enqueuedSize&&(({width:i,height:s}=this._enqueuedSize),this._enqueuedSize=void 0,this._width=i,this._height=s),this._viewport){const t=this._width,e=this._height;i=X(this._viewport.width,t),s=X(this._viewport.height,e)}if(i&&s){const h=this.getElement();this._renderer.setDimensions(i*e,s*e),h.style.width=`${i}px`,h.style.height=`${s}px`,null==(t=this._resizeHandler)||t.call(this,i,s)}this._renderer.scale(e,e),this.setSmoothing(this._smoothing),this._coords=void 0}},t.Loader=d,t.Sprite=class{constructor({width:t,height:e,resourceId:i,x:s=0,y:h=0,rotation:n=0,collidable:a=!1,interactive:r=!1,mask:o=!1,sheet:d=[],sheetTileWidth:l=0,sheetTileHeight:c=0}={width:64,height:64}){if(this.hover=!1,this.isDragging=!1,this._children=[],this._disposed=!1,this._mask=!1,this._interactive=!1,this._draggable=!1,this._keepInBounds=!1,this._pressed=!1,t<=0||e<=0)throw new Error("cannot construct a Sprite without valid dimensions");if(this.collidable=a,this._mask=o,this._bounds={left:0,top:0,width:t,height:e},this.setX(s),this.setY(h),this.setRotation(n),this.setInteractive(r),i&&this.setResource(i),Array.isArray(d)&&d.length>0){if(!i)throw new Error("cannot use a spritesheet without a valid resource id");this.setSheet(d,l,c)}}getDraggable(){return this._draggable}setDraggable(t,e=!1){this._draggable=t,this._keepInBounds=!!this._constraint||e,t&&!this._interactive&&this.setInteractive(!0)}getX(){return this._bounds.left}setX(t){const e=t-this._bounds.left;this._bounds.left=this._constraint?t+this._constraint.left:t;let i=this._children[0];for(;i;)i.isDragging||i.setX(i._bounds.left+e),i=i.next}getY(){return this._bounds.top}setY(t){const e=t-this._bounds.top;this._bounds.top=this._constraint?t+this._constraint.top:t;let i=this._children[0];for(;i;)i.isDragging||i.setY(i._bounds.top+e),i=i.next}getWidth(){return this._bounds.width}setWidth(t){const e=this._bounds.width||0;e!==t&&(this._bounds.width=t,0!==e&&(this._bounds.left-=t*z-e*z),this.invalidate())}getHeight(){return this._bounds.height}setHeight(t){const e=this._bounds.height||0;e!==t&&(this._bounds.height=t,0!==e&&(this._bounds.top-=t*z-e*z),this.invalidate())}setBounds(t,e,i,s){if(this._constraint)t-=this._constraint.left,e-=this._constraint.top;else if(!this.canvas)throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");let h=!1;"number"==typeof i&&(h=this._bounds.width!==i,this._bounds.width=i),"number"==typeof s&&(h=h||this._bounds.height!==s,this._bounds.height=s);const n=this._bounds.width,a=this._bounds.height,r=this._constraint?this._constraint.width:this.canvas.getWidth(),o=this._constraint?this._constraint.height:this.canvas.getHeight();if(this._keepInBounds){const i=S(0,-(n-r)),s=S(0,-(a-o)),h=o-a;t=S(r-n,k(t,i)),e=S(h,k(e,s))}else t>r&&(t+=n*z),e>o&&(e+=a*z);this.setX(t),this.setY(e),h&&this.invalidate()}getBounds(){return this._bounds}getRotation(){return this._rotation*H}setRotation(t,e){this._rotation=t%360*F,this._pivot=e,this.invalidateDrawContext()}setScale(t){this._scale=t,this.invalidateDrawContext()}getInteractive(){return this._interactive}setInteractive(t){this._interactive=t}update(t,e){let i=this._children[0];for(;i;)i.update(t,e),i=i.next;this._animation&&this.updateAnimation(e)}draw(t,e){const i=this._bounds;let s=!!this._resourceId;if(s&&e&&(h=i,n=e,({left:y,top:Y}=h),s=y+h.width>=n.left&&y<=n.right&&Y+h.height>=n.top&&Y<=n.bottom),s){const s=this._animation;let{left:h,top:n,width:a,height:r}=i;if(s){const i=s.tileWidth?s.tileWidth:z+a<<0,o=s.tileHeight?s.tileHeight:z+r<<0;e&&(h-=e.left,n-=e.top),t.drawImageCropped(this._resourceId,s.col*i,s.type.row*o,i,o,h,n,a,r,this._drawContext)}else if(e){const{src:s,dest:h}=((t,e)=>{({left:y,top:Y,width:x,height:L}=t);const{left:i,top:s,width:h,height:n}=e;return x=y>i?Math.min(x,h-(y-i)):Math.min(h,x-(i-y)),L=Y>s?Math.min(L,n-(Y-s)):Math.min(n,L-(s-Y)),{src:{left:y>i?0:i-y,top:Y>s?0:s-Y,width:x,height:L},dest:{left:y>i?y-i:0,top:Y>s?Y-s:0,width:x,height:L}}})(i,e);t.drawImageCropped(this._resourceId,s.left,s.top,s.width,s.height,h.left,h.top,h.width,h.height,this._drawContext)}else t.drawImage(this._resourceId,h,n,a,r,this._drawContext)}var h,n;let a=this._children[0];for(;a;)a.draw(t,e),a=a.next}insideBounds(t,e){const{left:i,top:s,width:h,height:n}=this._bounds;return t>=i&&t<=i+h&&e>=s&&e<=s+n}collidesWith(t){if(t===this)return!1;const e=this._bounds,i=t.getBounds();return!(e.top+e.height<i.top||e.top>i.top+i.height||e.left+e.width<i.left||e.left>i.left+i.width)}getIntersection(t){if(this.collidesWith(t)){const e=this._bounds,i=t.getBounds(),s=k(e.left,i.left),h=k(e.top,i.top);return{left:s,top:h,width:S(e.left+e.width,i.width+i.height)-s,height:S(e.top+e.height,i.top+i.height)-h}}}collidesWithEdge(t,e){if(t===this)return!1;if(isNaN(e)||e<0||e>3)throw new Error("invalid argument for edge");switch(e){case 0:return this.getX()<=t.getX()+t.getWidth();case 1:return this.getY()<=t.getY()+t.getHeight();case 2:return this.getX()+this.getWidth()<=t.getX();case 3:return this.getY()+this.getHeight()>=t.getY()}return!1}setResource(t,e,i){this._resourceId=t,"number"==typeof e&&this.setWidth(e),"number"==typeof i&&this.setHeight(i),this.invalidate()}getResourceId(){return this._resourceId}setSheet(t,e,i){this._sheet=t,t?(this._animation={type:null,col:0,maxCol:0,fpt:0,counter:0,tileWidth:this.getWidth(),tileHeight:this.getHeight()},"number"==typeof e&&(this._animation.tileWidth=e),"number"==typeof i&&(this._animation.tileHeight=i),this.switchAnimation(0)):this._animation=void 0}switchAnimation(t){const e=this._animation,i=this._sheet[t];e.type=i,e.fpt=i.fpt,e.maxCol=i.col+(i.amount-1),e.col=i.col,e.counter=0,e.onComplete=i.onComplete}setParent(t){this._parent=t}getParent(){return this._parent}setCanvas(t){this.canvas=t;for(const e of this._children)e.setCanvas(t)}setConstraint(t,e,i,s){return this._constraint={left:t,top:e,width:i,height:s},this._bounds.left=k(t,this._bounds.left),this._bounds.top=k(e,this._bounds.top),this._keepInBounds=!0,this.getConstraint()}getConstraint(){return this._constraint}addChild(t){if(this.contains(t))return this;const e=this._children.length;return e>0&&(t.last=this._children[e-1],t.last.next=t,t.next=void 0),t.setCanvas(this.canvas),t.setParent(this),this._children.push(t),this.invalidate(),this}removeChild(t){t.setParent(void 0),t.setCanvas(void 0);const e=this._children.indexOf(t);-1!==e&&this._children.splice(e,1);const i=t.last,s=t.next;return i&&(i.next=s),s&&(s.last=i),t.last=t.next=void 0,this.invalidate(),t}getChildAt(t){return this._children[t]}removeChildAt(t){return this.removeChild(this.getChildAt(t))}numChildren(){return this._children.length}getChildren(){return this._children}contains(t){return t._parent===this}dispose(){if(this._disposed)return;this._disposed=!0,this._parent&&this._parent.removeChild(this);let t=this._children.length;for(;t--;){const e=this._children[t];e.dispose(),e.next=void 0,e.last=void 0}this._children=[]}handlePress(t,e,i){}handleRelease(t,e,i){}handleClick(){}handleMove(t,e,i){const s=this._dragStartOffset.x+(t-this._dragStartEventCoordinates.x),h=this._dragStartOffset.y+(e-this._dragStartEventCoordinates.y);this.setBounds(s,h,this._bounds.width,this._bounds.height)}handleInteraction(t,e,i){let s,h=!1;const n=this._children.length;if(n>0)for(s=this._children[n-1];s;){if(h=s.handleInteraction(t,e,i),h)return!0;s=s.last}if(!this._interactive)return!1;const{type:a}=i;if(this._pressed&&("touchend"===a||"mouseup"===a))return this._pressed=!1,this.isDragging&&(this.isDragging=!1),Date.now()-this._pressTime<250&&this.handleClick(),this.handleRelease(t,e,i),!0;if(this.insideBounds(t,e)){if(this.hover=!0,"touchstart"===a||"mousedown"===a)return this._pressTime=Date.now(),this._pressed=!0,this._draggable&&(this.isDragging=!0,this._dragStartOffset={x:this._bounds.left,y:this._bounds.top},this._dragStartEventCoordinates={x:t,y:e}),this.handlePress(t,e,i),"touchstart"===a&&(i.stopPropagation(),i.preventDefault()),!0}else this.hover=!1;return!!this.isDragging&&(this.handleMove(t,e,i),!0)}invalidate(){this.canvas&&this.canvas.invalidate()}invalidateDrawContext(){if(0!==this._rotation||this._mask||1!==this._scale){this._drawContext=this._drawContext??{};const t=this._drawContext;t.rotation=this._rotation,t.pivot=this._pivot,t.blendMode=this._mask?"destination-in":void 0,t.scale=this._scale}}updateAnimation(t=1){const e=this._animation;e.counter+=t,e.counter>=e.fpt&&(++e.col,e.counter=e.counter%e.fpt),e.col>e.maxCol&&(e.col=e.type.col,"function"==typeof e.onComplete&&e.onComplete(this))}},Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),t}({});
