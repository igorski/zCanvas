class t {
  constructor() {
    this._eventMap = [], this._disposed = false;
  }
  add(t2, e2, i2) {
    return !this.has(t2, e2) && (t2.addEventListener(e2, i2, false), this._eventMap.push({ target: t2, type: e2, listener: i2 }), true);
  }
  has(t2, e2) {
    let i2 = this._eventMap.length;
    for (; i2--; ) {
      const s2 = this._eventMap[i2];
      if (s2.target === t2 && s2.type == e2)
        return true;
    }
    return false;
  }
  remove(t2, e2) {
    let i2 = this._eventMap.length;
    for (; i2--; ) {
      const s2 = this._eventMap[i2];
      if (s2.target === t2 && s2.type === e2)
        return t2.removeEventListener(e2, s2.listener, false), this._eventMap.splice(i2, 1), true;
    }
    return false;
  }
  dispose() {
    if (this._disposed)
      return;
    let t2 = this._eventMap.length;
    for (; t2--; ) {
      const e2 = this._eventMap[t2];
      this.remove(e2.target, e2.type);
    }
    this._eventMap = null, this._disposed = true;
  }
}
let e;
function i(t2 = 0, e2 = 0, i2 = false) {
  const s2 = document.createElement("canvas"), h2 = s2.getContext("2d", i2 ? { willReadFrequently: true } : void 0);
  return 0 !== t2 && 0 !== e2 && (s2.width = t2, s2.height = e2), { cvs: s2, ctx: h2 };
}
function s() {
  return e || (e = i().cvs), e;
}
async function h(t2) {
  t2 instanceof Blob && (t2 = await async function(t3) {
    const e2 = await n(t3), { cvs: s2, ctx: h3 } = i(e2.width, e2.height);
    return h3.drawImage(e2, 0, 0), s2;
  }(t2)), a(s(), t2);
  const h2 = await createImageBitmap(s());
  return e.width = 1, e.height = 1, h2;
}
function n(t2) {
  const e2 = URL.createObjectURL(t2), i2 = () => {
    URL.revokeObjectURL(e2);
  };
  return new Promise((t3, s2) => {
    const h2 = new Image();
    h2.onload = () => {
      i2(), t3(h2);
    }, h2.onerror = (t4) => {
      i2(), s2(t4);
    }, h2.src = e2;
  });
}
function a(t2, e2, i2, s2) {
  const h2 = t2.getContext("2d");
  i2 = i2 ?? e2.width, s2 = s2 ?? e2.height, t2.width = i2, t2.height = s2, h2.clearRect(0, 0, i2, s2), h2.drawImage(e2, 0, 0, i2, s2);
}
async function r(t2) {
  const e2 = new FileReader();
  return new Promise((i2, s2) => {
    e2.onload = (e3) => {
      var _a;
      if (!((_a = e3 == null ? void 0 : e3.target) == null ? void 0 : _a.result))
        return s2();
      i2(new Blob([e3.target.result], { type: t2.type }));
    }, e2.onerror = (t3) => s2(t3), e2.readAsArrayBuffer(t2);
  });
}
const o = { loadImage: (e2) => new Promise(async (i2, s2) => {
  let h2;
  if (e2 instanceof File ? h2 = await r(e2) : e2 instanceof Blob && (h2 = e2), void 0 !== h2) {
    try {
      const t2 = await n(h2);
      o.onReady(t2).then(() => i2(d(t2)));
    } catch (t2) {
      s2(t2);
    }
    return;
  }
  const a2 = function(t2) {
    const e3 = ("string" == typeof t2 ? t2 : t2.src).substring(0, 5);
    return "data:" === e3 || "blob:" === e3;
  }(e2), l2 = new window.Image(), c2 = new t(), u2 = () => {
    c2.dispose(), s2();
  }, p2 = () => {
    c2.dispose(), o.onReady(l2).then(() => i2(d(l2))).catch(s2);
  };
  var m2;
  a2 || (m2 = l2, function(t2) {
    const { location: e3 } = window;
    return !(!t2.startsWith("./") && !t2.startsWith(`${e3.protocol}//${e3.host}`)) || !/^http[s]?:/.test(t2);
  }(e2) || (m2.crossOrigin = "Anonymous"), c2.add(l2, "load", p2), c2.add(l2, "error", u2)), l2.src = e2, a2 && p2();
}), async loadBitmap(t2) {
  const { image: e2 } = await o.loadImage(t2);
  return h(e2);
}, isReady: (t2) => true === t2.complete && ("number" == typeof t2.naturalWidth && t2.naturalWidth > 0), onReady: (t2) => new Promise((e2, i2) => {
  const s2 = 60;
  let h2 = 0;
  !function n2() {
    o.isReady(t2) ? e2() : ++h2 === s2 ? (console.error(typeof t2), i2(new Error("Image could not be resolved. This shouldn't occur."))) : window.requestAnimationFrame(n2);
  }();
}) };
function d(t2) {
  const e2 = { image: t2, size: { width: 0, height: 0 } };
  return t2 instanceof window.HTMLImageElement && (e2.size = function(t3) {
    return { width: t3.width || t3.naturalWidth, height: t3.height || t3.naturalHeight };
  }(t2)), e2;
}
class l {
  constructor(t2, e2) {
    this._index = 0, this._map = /* @__PURE__ */ new Map(), this._createFn = t2, this._destroyFn = e2;
  }
  dispose() {
    const t2 = [...this._map].map(([t3]) => t3);
    for (; t2.length > 0; )
      this.remove(t2.shift());
    this._map = void 0;
  }
  get(t2) {
    return this._map.get(t2);
  }
  set(t2, e2) {
    if (this.has(t2)) {
      if (this.get(t2) === e2)
        return;
      this.remove(t2);
    }
    this._map.set(t2, e2);
  }
  has(t2) {
    return this._map.has(t2);
  }
  remove(t2) {
    var _a;
    if (!this.has(t2))
      return false;
    const e2 = this.get(t2);
    return (_a = this._destroyFn) == null ? void 0 : _a.call(this, e2), this._map.delete(t2);
  }
  next() {
    let t2;
    const e2 = this._index.toString();
    return this.has(e2) ? t2 = this.get(e2) : this._createFn && (t2 = this._createFn(), this.set(e2, t2)), ++this._index, t2;
  }
  fill(t2) {
    const e2 = this._index;
    for (let e3 = 0; e3 < t2; ++e3)
      this.next();
    this._index = e2;
  }
  reset() {
    this._index = 0;
  }
}
const c = 0.5;
let u;
class p {
  constructor(t2, e2 = false) {
    this._debug = e2, this._canvas = t2, this._context = t2.getContext("2d"), this._bitmapCache = new l(void 0, (t3) => {
      t3.close();
    }), this._patternCache = new l();
  }
  dispose() {
    this._bitmapCache.dispose(), this._patternCache.dispose(), this._canvas = void 0;
  }
  cacheResource(t2, e2) {
    this._bitmapCache.set(t2, e2);
  }
  getResource(t2) {
    return this._bitmapCache.get(t2);
  }
  disposeResource(t2) {
    this._bitmapCache.remove(t2);
  }
  setDimensions(t2, e2) {
    this._canvas.width = t2, this._canvas.height = e2;
  }
  setSmoothing(t2) {
    const e2 = this._context;
    ["imageSmoothingEnabled", "mozImageSmoothingEnabled", "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"].forEach((i2) => {
      void 0 !== e2[i2] && (e2[i2] = t2);
    });
  }
  save() {
    this._context.save();
  }
  restore() {
    this._context.restore();
  }
  translate(t2, e2) {
    this._context.translate(t2, e2);
  }
  rotate(t2) {
    this._context.rotate(t2);
  }
  transform(t2, e2, i2, s2, h2, n2) {
    this._context.transform(t2, e2, i2, s2, h2, n2);
  }
  scale(t2, e2 = t2) {
    this._context.scale(t2, e2);
  }
  setBlendMode(t2) {
    this._context.globalCompositeOperation = t2;
  }
  setAlpha(t2) {
    this._context.globalAlpha = t2;
  }
  clearRect(t2, e2, i2, s2) {
    this._context.clearRect(t2, e2, i2, s2);
  }
  drawRect(t2, e2, i2, s2, h2, n2 = "fill") {
    if (u = this._context, "fill" === n2)
      u.fillStyle = h2, u.fillRect(t2, e2, i2, s2);
    else {
      const n3 = 1;
      u.lineWidth = n3, u.strokeStyle = h2, u.strokeRect(c + (t2 - n3), c + (e2 - n3), i2, s2);
    }
  }
  drawRoundRect(t2, e2, i2, s2, h2, n2, a2) {
    u = this._context, "fill" === a2 ? (u.fillStyle = n2, u.fillRect(t2, e2, i2, s2)) : (u.strokeStyle = n2, u.beginPath(), u.roundRect(t2, e2, i2, s2, h2), u.stroke());
  }
  drawCircle(t2, e2, i2, s2 = "transparent", h2) {
    u = this._context, u.beginPath(), u.arc(t2 + i2, e2 + i2, i2, 0, 2 * Math.PI, false), "transparent" !== s2 && (u.fillStyle = s2, u.fill()), h2 && (u.lineWidth = 5, u.strokeStyle = h2, u.closePath(), u.stroke());
  }
  drawImage(t2, e2, i2, s2, h2, n2) {
    if (!this._bitmapCache.has(t2))
      return;
    const a2 = !!n2 && this.applyDrawContext(n2, e2, i2, s2, h2);
    void 0 === s2 ? this._context.drawImage(this._bitmapCache.get(t2), e2, i2) : this._context.drawImage(this._bitmapCache.get(t2), e2, i2, s2, h2), this._debug && this.drawRect(e2, i2, s2, h2, "#FF0000", "stroke"), a2 && this.restore();
  }
  drawImageCropped(t2, e2, i2, s2, h2, n2, a2, r2, o2, d2) {
    if (!this._bitmapCache.has(t2))
      return;
    if (d2 == null ? void 0 : d2.safeMode) {
      if (r2 <= 0 || o2 <= 0)
        return;
      const n3 = this._bitmapCache.get(t2), a3 = (r2 = Math.min(this._context.canvas.width, r2)) / s2, d3 = (o2 = Math.min(this._context.canvas.height, o2)) / h2;
      e2 + s2 > n3.width && (r2 -= a3 * (e2 + s2 - n3.width), s2 -= e2 + s2 - n3.width), i2 + h2 > n3.height && (o2 -= d3 * (i2 + h2 - n3.height), h2 -= i2 + h2 - n3.height);
    }
    const l2 = !!d2 && this.applyDrawContext(d2, n2, a2, r2, o2);
    this._context.drawImage(this._bitmapCache.get(t2), c + e2 << 0, c + i2 << 0, c + s2 << 0, c + h2 << 0, c + n2 << 0, c + a2 << 0, c + r2 << 0, c + o2 << 0), this._debug && this.drawRect(n2, a2, r2, o2, "#FF0000", "stroke"), l2 && this.restore();
  }
  createPattern(t2, e2) {
    this._bitmapCache.has(t2) && this._patternCache.set(t2, this._context.createPattern(this._bitmapCache.get(t2), e2));
  }
  drawPattern(t2, e2, i2, s2, h2) {
    if (!this._patternCache.has(t2))
      return;
    const n2 = this._patternCache.get(t2);
    this._context.fillStyle = n2, this._context.fillRect(e2, i2, s2, h2);
  }
  applyDrawContext(t2, e2, i2, s2, h2) {
    var _a, _b;
    const n2 = void 0 !== t2.scale && 1 !== t2.scale, a2 = 0 !== t2.rotation, r2 = void 0 !== t2.alpha, o2 = void 0 !== t2.blendMode;
    let d2 = n2 || a2 || r2 || o2;
    if (d2 && this.save(), n2 && !a2 && this.scale(t2.scale), a2) {
      const n3 = t2.scale ?? 1, a3 = ((_a = t2.pivot) == null ? void 0 : _a.x) ?? e2 + s2 * c, r3 = ((_b = t2.pivot) == null ? void 0 : _b.y) ?? i2 + h2 * c, o3 = Math.cos(t2.rotation) * n3, d3 = Math.sin(t2.rotation) * n3;
      this._context.setTransform(o3, d3, -d3, o3, a3 - a3 * o3 + r3 * d3, r3 - a3 * d3 - r3 * o3);
    }
    return o2 && this.setBlendMode(t2.blendMode), r2 && this.setAlpha(t2.alpha), d2;
  }
}
const m = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NsYXNzIHR7Y29uc3RydWN0b3IodCxlKXt0aGlzLl9pbmRleD0wLHRoaXMuX21hcD1uZXcgTWFwLHRoaXMuX2NyZWF0ZUZuPXQsdGhpcy5fZGVzdHJveUZuPWV9ZGlzcG9zZSgpe2NvbnN0IHQ9Wy4uLnRoaXMuX21hcF0ubWFwKCgoW3RdKT0+dCkpO2Zvcig7dC5sZW5ndGg+MDspdGhpcy5yZW1vdmUodC5zaGlmdCgpKTt0aGlzLl9tYXA9dm9pZCAwfWdldCh0KXtyZXR1cm4gdGhpcy5fbWFwLmdldCh0KX1zZXQodCxlKXtpZih0aGlzLmhhcyh0KSl7aWYodGhpcy5nZXQodCk9PT1lKXJldHVybjt0aGlzLnJlbW92ZSh0KX10aGlzLl9tYXAuc2V0KHQsZSl9aGFzKHQpe3JldHVybiB0aGlzLl9tYXAuaGFzKHQpfXJlbW92ZSh0KXt2YXIgZTtpZighdGhpcy5oYXModCkpcmV0dXJuITE7Y29uc3Qgcz10aGlzLmdldCh0KTtyZXR1cm4gbnVsbD09KGU9dGhpcy5fZGVzdHJveUZuKXx8ZS5jYWxsKHRoaXMscyksdGhpcy5fbWFwLmRlbGV0ZSh0KX1uZXh0KCl7bGV0IHQ7Y29uc3QgZT10aGlzLl9pbmRleC50b1N0cmluZygpO3JldHVybiB0aGlzLmhhcyhlKT90PXRoaXMuZ2V0KGUpOnRoaXMuX2NyZWF0ZUZuJiYodD10aGlzLl9jcmVhdGVGbigpLHRoaXMuc2V0KGUsdCkpLCsrdGhpcy5faW5kZXgsdH1maWxsKHQpe2NvbnN0IGU9dGhpcy5faW5kZXg7Zm9yKGxldCBzPTA7czx0Oysrcyl0aGlzLm5leHQoKTt0aGlzLl9pbmRleD1lfXJlc2V0KCl7dGhpcy5faW5kZXg9MH19Y29uc3QgZT0uNTtsZXQgcyxhLGk7Y2xhc3Mgb3tjb25zdHJ1Y3RvcihlLHM9ITEpe3RoaXMuX2RlYnVnPXMsdGhpcy5fY2FudmFzPWUsdGhpcy5fY29udGV4dD1lLmdldENvbnRleHQoIjJkIiksdGhpcy5fYml0bWFwQ2FjaGU9bmV3IHQodm9pZCAwLCh0PT57dC5jbG9zZSgpfSkpLHRoaXMuX3BhdHRlcm5DYWNoZT1uZXcgdH1kaXNwb3NlKCl7dGhpcy5fYml0bWFwQ2FjaGUuZGlzcG9zZSgpLHRoaXMuX3BhdHRlcm5DYWNoZS5kaXNwb3NlKCksdGhpcy5fY2FudmFzPXZvaWQgMH1jYWNoZVJlc291cmNlKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuc2V0KHQsZSl9Z2V0UmVzb3VyY2UodCl7cmV0dXJuIHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KX1kaXNwb3NlUmVzb3VyY2UodCl7dGhpcy5fYml0bWFwQ2FjaGUucmVtb3ZlKHQpfXNldERpbWVuc2lvbnModCxlKXt0aGlzLl9jYW52YXMud2lkdGg9dCx0aGlzLl9jYW52YXMuaGVpZ2h0PWV9c2V0U21vb3RoaW5nKHQpe2NvbnN0IGU9dGhpcy5fY29udGV4dDtbImltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm9JbWFnZVNtb290aGluZ0VuYWJsZWQiLCJ3ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQiXS5mb3JFYWNoKChzPT57dm9pZCAwIT09ZVtzXSYmKGVbc109dCl9KSl9c2F2ZSgpe3RoaXMuX2NvbnRleHQuc2F2ZSgpfXJlc3RvcmUoKXt0aGlzLl9jb250ZXh0LnJlc3RvcmUoKX10cmFuc2xhdGUodCxlKXt0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSh0LGUpfXJvdGF0ZSh0KXt0aGlzLl9jb250ZXh0LnJvdGF0ZSh0KX10cmFuc2Zvcm0odCxlLHMsYSxpLG8pe3RoaXMuX2NvbnRleHQudHJhbnNmb3JtKHQsZSxzLGEsaSxvKX1zY2FsZSh0LGU9dCl7dGhpcy5fY29udGV4dC5zY2FsZSh0LGUpfXNldEJsZW5kTW9kZSh0KXt0aGlzLl9jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj10fXNldEFscGhhKHQpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGE9dH1jbGVhclJlY3QodCxlLHMsYSl7dGhpcy5fY29udGV4dC5jbGVhclJlY3QodCxlLHMsYSl9ZHJhd1JlY3QodCxhLGksbyxuLHI9ImZpbGwiKXtpZihzPXRoaXMuX2NvbnRleHQsImZpbGwiPT09cilzLmZpbGxTdHlsZT1uLHMuZmlsbFJlY3QodCxhLGksbyk7ZWxzZXtjb25zdCByPTE7cy5saW5lV2lkdGg9cixzLnN0cm9rZVN0eWxlPW4scy5zdHJva2VSZWN0KGUrKHQtciksZSsoYS1yKSxpLG8pfX1kcmF3Um91bmRSZWN0KHQsZSxhLGksbyxuLHIpe3M9dGhpcy5fY29udGV4dCwiZmlsbCI9PT1yPyhzLmZpbGxTdHlsZT1uLHMuZmlsbFJlY3QodCxlLGEsaSkpOihzLnN0cm9rZVN0eWxlPW4scy5iZWdpblBhdGgoKSxzLnJvdW5kUmVjdCh0LGUsYSxpLG8pLHMuc3Ryb2tlKCkpfWRyYXdDaXJjbGUodCxlLGEsaT0idHJhbnNwYXJlbnQiLG8pe3M9dGhpcy5fY29udGV4dCxzLmJlZ2luUGF0aCgpLHMuYXJjKHQrYSxlK2EsYSwwLDIqTWF0aC5QSSwhMSksInRyYW5zcGFyZW50IiE9PWkmJihzLmZpbGxTdHlsZT1pLHMuZmlsbCgpKSxvJiYocy5saW5lV2lkdGg9NSxzLnN0cm9rZVN0eWxlPW8scy5jbG9zZVBhdGgoKSxzLnN0cm9rZSgpKX1kcmF3SW1hZ2UodCxlLHMsYSxpLG8pe2lmKCF0aGlzLl9iaXRtYXBDYWNoZS5oYXModCkpcmV0dXJuO2NvbnN0IG49ISFvJiZ0aGlzLmFwcGx5RHJhd0NvbnRleHQobyxlLHMsYSxpKTt2b2lkIDA9PT1hP3RoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlLHMpOnRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlLHMsYSxpKSx0aGlzLl9kZWJ1ZyYmdGhpcy5kcmF3UmVjdChlLHMsYSxpLCIjRkYwMDAwIiwic3Ryb2tlIiksbiYmdGhpcy5yZXN0b3JlKCl9ZHJhd0ltYWdlQ3JvcHBlZCh0LHMsYSxpLG8sbixyLGgsYyxsKXtpZighdGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpKXJldHVybjtpZihudWxsPT1sP3ZvaWQgMDpsLnNhZmVNb2RlKXtpZihoPD0wfHxjPD0wKXJldHVybjtjb25zdCBlPXRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxuPShoPU1hdGgubWluKHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLGgpKS9pLHI9KGM9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0LGMpKS9vO3MraT5lLndpZHRoJiYoaC09bioocytpLWUud2lkdGgpLGktPXMraS1lLndpZHRoKSxhK28+ZS5oZWlnaHQmJihjLT1yKihhK28tZS5oZWlnaHQpLG8tPWErby1lLmhlaWdodCl9Y29uc3QgZD0hIWwmJnRoaXMuYXBwbHlEcmF3Q29udGV4dChsLG4scixoLGMpO3RoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlK3M8PDAsZSthPDwwLGUraTw8MCxlK288PDAsZStuPDwwLGUrcjw8MCxlK2g8PDAsZStjPDwwKSx0aGlzLl9kZWJ1ZyYmdGhpcy5kcmF3UmVjdChuLHIsaCxjLCIjRkYwMDAwIiwic3Ryb2tlIiksZCYmdGhpcy5yZXN0b3JlKCl9Y3JlYXRlUGF0dGVybih0LGUpe3RoaXMuX2JpdG1hcENhY2hlLmhhcyh0KSYmdGhpcy5fcGF0dGVybkNhY2hlLnNldCh0LHRoaXMuX2NvbnRleHQuY3JlYXRlUGF0dGVybih0aGlzLl9iaXRtYXBDYWNoZS5nZXQodCksZSkpfWRyYXdQYXR0ZXJuKHQsZSxzLGEsaSl7aWYoIXRoaXMuX3BhdHRlcm5DYWNoZS5oYXModCkpcmV0dXJuO2NvbnN0IG89dGhpcy5fcGF0dGVybkNhY2hlLmdldCh0KTt0aGlzLl9jb250ZXh0LmZpbGxTdHlsZT1vLHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoZSxzLGEsaSl9YXBwbHlEcmF3Q29udGV4dCh0LHMsYSxpLG8pe3ZhciBuLHI7Y29uc3QgaD12b2lkIDAhPT10LnNjYWxlJiYxIT09dC5zY2FsZSxjPTAhPT10LnJvdGF0aW9uLGw9dm9pZCAwIT09dC5hbHBoYSxkPXZvaWQgMCE9PXQuYmxlbmRNb2RlO2xldCBtPWh8fGN8fGx8fGQ7aWYobSYmdGhpcy5zYXZlKCksaCYmIWMmJnRoaXMuc2NhbGUodC5zY2FsZSksYyl7Y29uc3QgaD10LnNjYWxlPz8xLGM9KG51bGw9PShuPXQucGl2b3QpP3ZvaWQgMDpuLngpPz9zK2kqZSxsPShudWxsPT0ocj10LnBpdm90KT92b2lkIDA6ci55KT8/YStvKmUsZD1NYXRoLmNvcyh0LnJvdGF0aW9uKSpoLG09TWF0aC5zaW4odC5yb3RhdGlvbikqaDt0aGlzLl9jb250ZXh0LnNldFRyYW5zZm9ybShkLG0sLW0sZCxjLWMqZCtsKm0sbC1jKm0tbCpkKX1yZXR1cm4gZCYmdGhpcy5zZXRCbGVuZE1vZGUodC5ibGVuZE1vZGUpLGwmJnRoaXMuc2V0QWxwaGEodC5hbHBoYSksbX19b25tZXNzYWdlPXQ9Pntzd2l0Y2godC5kYXRhLmNtZCl7ZGVmYXVsdDpicmVhaztjYXNlImluaXQiOmk9dC5kYXRhLmNhbnZhcyxhPW5ldyBvKGksdC5kYXRhLmRlYnVnKSxjb25zb2xlLmluZm8oIi0tLSBpbml0aWFsaXplZCBXb3JrZXIiLGksYSk7YnJlYWs7Y2FzZSJsb2FkUmVzb3VyY2UiOiFhc3luYyBmdW5jdGlvbih0LGUpe3RyeXtsZXQgcztpZihlIGluc3RhbmNlb2YgRmlsZSl7Y29uc3QgdD1hd2FpdCBhc3luYyBmdW5jdGlvbih0KXtjb25zdCBlPW5ldyBGaWxlUmVhZGVyO3JldHVybiBuZXcgUHJvbWlzZSgoKHMsYSk9PntlLm9ubG9hZD1lPT57dmFyIGk7aWYoIShudWxsPT0oaT1udWxsPT1lP3ZvaWQgMDplLnRhcmdldCk/dm9pZCAwOmkucmVzdWx0KSlyZXR1cm4gYSgpO3MobmV3IEJsb2IoW2UudGFyZ2V0LnJlc3VsdF0se3R5cGU6dC50eXBlfSkpfSxlLm9uZXJyb3I9dD0+YSh0KSxlLnJlYWRBc0FycmF5QnVmZmVyKHQpfSkpfShlKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKHQpfWVsc2UgaWYoZSBpbnN0YW5jZW9mIEJsb2Ipcz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcChlKTtlbHNlIGlmKCJzdHJpbmciPT10eXBlb2YgZSl7Y29uc3QgdD1hd2FpdCBmZXRjaChlKSxhPWF3YWl0IHQuYmxvYigpO3M9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoYSl9ZWxzZSBlIGluc3RhbmNlb2YgSW1hZ2VCaXRtYXAmJihzPWUpO251bGw9PWF8fGEuY2FjaGVSZXNvdXJjZSh0LHMpLHBvc3RNZXNzYWdlKHtjbWQ6Im9ubG9hZCIsaWQ6dCxzaXplOnt3aWR0aDpzLndpZHRoLGhlaWdodDpzLmhlaWdodH19KX1jYXRjaChzKXtwb3N0TWVzc2FnZSh7Y21kOiJvbmVycm9yIixpZDp0LGVycm9yOihudWxsPT1zP3ZvaWQgMDpzLm1lc3NhZ2UpPz9zfSl9fSh0LmRhdGEuaWQsdC5kYXRhLnNvdXJjZSk7YnJlYWs7Y2FzZSJnZXRSZXNvdXJjZSI6Y29uc3QgZT1udWxsPT1hP3ZvaWQgMDphLmdldFJlc291cmNlKHQuZGF0YS5pZCk7cG9zdE1lc3NhZ2Uoe2NtZDoib25yZXNvdXJjZSIsaWQ6dC5kYXRhLmlkLGJpdG1hcDplfSk7YnJlYWs7Y2FzZSJkaXNwb3NlUmVzb3VyY2UiOm51bGw9PWF8fGEuZGlzcG9zZVJlc291cmNlKC4uLnQuZGF0YS5hcmdzKTticmVhaztjYXNlImRpc3Bvc2UiOm51bGw9PWF8fGEuZGlzcG9zZSgpLGk9dm9pZCAwLGE9dm9pZCAwO2JyZWFrO2Nhc2UicmVuZGVyIjppZighYXx8IXQuZGF0YS5jb21tYW5kcylyZXR1cm47Zm9yKGNvbnN0IHMgb2YgdC5kYXRhLmNvbW1hbmRzKXtjb25zdCB0PXMuc2hpZnQoKTthW3RdKC4uLnMpfXBvc3RNZXNzYWdlKHtjbWQ6Im9ucmVuZGVyIn0pO2JyZWFrO2Nhc2Uic2V0RGltZW5zaW9ucyI6Y2FzZSJzZXRTbW9vdGhpbmciOmNhc2UiY3JlYXRlUGF0dGVybiI6YVt0LmRhdGEuY21kXSguLi50LmRhdGEuYXJncyl9fX0oKTsK", _ = "undefined" != typeof window && window.Blob && new Blob([atob(m)], { type: "text/javascript;charset=utf-8" });
function g() {
  let t2;
  try {
    if (t2 = _ && (window.URL || window.webkitURL).createObjectURL(_), !t2)
      throw "";
    return new Worker(t2);
  } catch (t3) {
    return new Worker("data:application/javascript;base64," + m);
  } finally {
    t2 && (window.URL || window.webkitURL).revokeObjectURL(t2);
  }
}
class b {
  constructor(t2, e2 = false, i2 = false) {
    if (this._useWorker = false, this._element = t2, e2 && "function" == typeof this._element.transferControlToOffscreen) {
      this._useWorker = true, this._callbacks = /* @__PURE__ */ new Map(), this._pool = new l(() => [], (t3) => {
        t3.length = 0;
      }), this._pool.fill(1e3), this._commands = [];
      const e3 = t2.transferControlToOffscreen();
      this._worker = new g(), this._worker.postMessage({ cmd: "init", canvas: e3, debug: i2 }, [e3]), this._worker.onmessage = this.handleMessage.bind(this);
    } else
      this._renderer = new p(this._element, i2);
  }
  loadResource(t2, e2) {
    return new Promise(async (i2, s2) => {
      if (e2 instanceof ImageBitmap)
        this._useWorker ? this.wrappedWorkerLoad(t2, e2, i2, s2, true) : (this._renderer.cacheResource(t2, e2), i2({ width: e2.width, height: e2.height }));
      else if ("string" != typeof e2) {
        if (e2 instanceof HTMLImageElement || e2 instanceof HTMLCanvasElement) {
          const s3 = await h(e2);
          return this.loadResource(t2, s3).then((t3) => i2(t3));
        }
        if (e2 instanceof File)
          if (this._useWorker)
            this.wrappedWorkerLoad(t2, e2, i2, s2);
          else {
            const h2 = await r(e2);
            this.wrappedLoad(t2, h2, i2, s2);
          }
        else
          e2 instanceof Blob ? this._useWorker ? this.wrappedWorkerLoad(t2, e2, i2, s2) : this.wrappedLoad(t2, e2, i2, s2) : s2("Unsupported resource type: " + typeof e2);
      } else if (e2 = e2.startsWith("./") ? new URL(e2, document.baseURI).href : e2, this._useWorker)
        this.wrappedWorkerLoad(t2, e2, i2, s2);
      else {
        const h2 = await o.loadImage(e2);
        this.wrappedLoad(t2, h2.image, i2, s2);
      }
    });
  }
  getResource(t2) {
    return new Promise((e2, i2) => {
      this._useWorker ? (this._callbacks.set(t2, { resolve: e2, reject: i2 }), this._worker.postMessage({ cmd: "getResource", id: t2 })) : e2(this._renderer.getResource(t2));
    });
  }
  disposeResource(t2) {
    this.getBackend("disposeResource", t2);
  }
  onCommandsReady() {
    this._useWorker && (this._worker.postMessage({ cmd: "render", commands: this._commands }), this._commands.length = 0, this._pool.reset());
  }
  dispose() {
    this.getBackend("dispose"), setTimeout(() => {
      var _a, _b2;
      (_a = this._worker) == null ? void 0 : _a.terminate(), this._worker = void 0, (_b2 = this._callbacks) == null ? void 0 : _b2.clear();
    }, 50);
  }
  handleMessage(t2) {
    const { cmd: e2, id: i2 } = t2.data;
    switch (e2) {
      default:
        break;
      case "onload":
        if (!this._callbacks.has(i2))
          return;
        this._callbacks.get(i2).resolve(t2.data.size), this._callbacks.delete(i2);
        break;
      case "onerror":
        if (!this._callbacks.has(i2))
          return;
        this._callbacks.get(i2).reject(new Error(t2.data.error)), this._callbacks.delete(i2);
        break;
      case "onresource":
        this._callbacks.get(i2).resolve(t2.data.bitmap), this._callbacks.delete(i2);
    }
  }
  wrappedWorkerLoad(t2, e2, i2, s2, h2 = false) {
    this._callbacks.set(t2, { resolve: i2, reject: s2 }), this._worker.postMessage({ cmd: "loadResource", source: e2, id: t2 }, h2 ? [e2] : []);
  }
  async wrappedLoad(t2, e2, i2, s2) {
    try {
      const s3 = await h(e2);
      this._renderer.cacheResource(t2, s3), i2({ width: s3.width, height: s3.height });
    } catch (t3) {
      s2(t3);
    }
  }
  setDimensions(t2, e2) {
    this.getBackend("setDimensions", t2, e2);
  }
  createPattern(t2, e2) {
    this.getBackend("createPattern", t2, e2);
  }
  setSmoothing(t2) {
    this.getBackend("setSmoothing", t2);
  }
  save() {
    this.onDraw("save");
  }
  restore() {
    this.onDraw("restore");
  }
  translate(t2, e2) {
    this.onDraw("translate", t2, e2);
  }
  rotate(t2) {
    this.onDraw("rotate", t2);
  }
  transform(t2, e2, i2, s2, h2, n2) {
    this.onDraw("transform", t2, e2, i2, s2, h2, n2);
  }
  scale(t2, e2) {
    this.onDraw("scale", t2, e2);
  }
  setBlendMode(t2) {
    this.onDraw("setBlendMode", t2);
  }
  setAlpha(t2) {
    this.onDraw("setAlpha", t2);
  }
  clearRect(t2, e2, i2, s2) {
    this.onDraw("clearRect", t2, e2, i2, s2);
  }
  drawRect(t2, e2, i2, s2, h2, n2) {
    this.onDraw("drawRect", t2, e2, i2, s2, h2, n2);
  }
  drawRoundRect(t2, e2, i2, s2, h2, n2, a2) {
    this.onDraw("drawRoundRect", t2, e2, i2, s2, h2, n2, a2);
  }
  drawCircle(t2, e2, i2, s2 = "transparent", h2) {
    this.onDraw("drawCircle", t2, e2, i2, s2, h2);
  }
  drawImage(t2, e2, i2, s2, h2, n2) {
    this.onDraw("drawImage", t2, e2, i2, s2, h2, n2);
  }
  drawImageCropped(t2, e2, i2, s2, h2, n2, a2, r2, o2, d2) {
    this.onDraw("drawImageCropped", t2, e2, i2, s2, h2, n2, a2, r2, o2, d2);
  }
  drawPattern(t2, e2, i2, s2, h2) {
    this.onDraw("drawPattern", t2, e2, i2, s2, h2);
  }
  onDraw(t2, ...e2) {
    if (this._useWorker) {
      const i2 = this._pool.next();
      return i2.length = 0, i2.push(t2, ...e2), void this._commands.push(i2);
    }
    this._renderer[t2](...e2);
  }
  getBackend(t2, ...e2) {
    if (this._useWorker)
      return this._worker.postMessage({ cmd: t2, args: [...e2] });
    this._renderer[t2](...e2);
  }
}
const w = (t2) => t2 > 0 ? t2 + 0.5 << 0 : 0 | t2, f = [], v = [], Z = i(1, 1, true).cvs;
class G {
  constructor(t2) {
    this._renderer = t2, this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  getChildrenUnderPoint(t2, e2, i2, s2, h2, n2 = false) {
    const a2 = [];
    let r2, o2, d2, l2, c2, u2 = t2.length;
    for (; u2--; )
      r2 = t2[u2], o2 = r2.getX(), d2 = r2.getY(), l2 = r2.getWidth(), c2 = r2.getHeight(), o2 < e2 + s2 && o2 + l2 > e2 && d2 < i2 + h2 && d2 + c2 > i2 && (!n2 || n2 && r2.collidable) && a2.push(r2);
    return a2;
  }
  pixelCollision(t2, e2, i2 = false) {
    const s2 = t2.getIntersection(e2);
    if (void 0 === s2)
      return false;
    this.getPixelArray(t2, s2, f), this.getPixelArray(e2, s2, v);
    let h2 = 0;
    if (true === i2) {
      const t3 = s2.width, e3 = s2.height;
      for (let i3 = 0; i3 < e3; ++i3)
        for (let e4 = 0; e4 < t3; ++e4) {
          if (0 !== f[h2] && 0 !== v[h2])
            return { x: e4, y: i3 };
          ++h2;
        }
    } else {
      const t3 = f.length;
      for (; h2 < t3; ++h2)
        if (0 !== f[h2] && 0 !== v[h2])
          return true;
    }
    return false;
  }
  async cache(t2) {
    const e2 = await this._renderer.getResource(t2);
    if (!e2)
      return false;
    const { width: i2, height: s2 } = e2;
    return function(t3, e3, i3, s3) {
      a(t3, e3, i3, s3);
    }(Z, e2, i2, s2), this._cacheMap.set(t2, { data: Z.getContext("2d").getImageData(0, 0, i2, s2).data, size: { width: i2, height: s2 } }), Z.width = Z.height = 1, true;
  }
  clearCache(t2) {
    return !!this.hasCache(t2) && (this._cacheMap.delete(t2), true);
  }
  hasCache(t2) {
    return this._cacheMap.has(t2);
  }
  getPixelArray(t2, e2, i2) {
    const s2 = t2.getResourceId();
    if (!this.hasCache(s2))
      throw new Error(`Cannot get cached entry for resource "${s2}". Cache it first.`);
    const h2 = t2.getBounds(), n2 = w(e2.left - h2.left), a2 = w(e2.top - h2.top), r2 = w(e2.width), o2 = w(e2.height), { data: d2, size: l2 } = this._cacheMap.get(s2);
    if (0 === r2 || 0 === o2)
      return void (i2.length = 0);
    i2.length = w(r2 * o2);
    const c2 = l2.width, u2 = a2 + o2, p2 = n2 + r2;
    let m2 = -1;
    for (let t3 = a2; t3 < u2; ++t3)
      for (let e3 = n2; e3 < p2; ++e3) {
        const s3 = 4 * (t3 * c2 + e3);
        i2[++m2] = d2[s3 + 3];
      }
  }
}
const { min: C, max: X, round: R } = Math;
class W {
  constructor({ width: t2 = 300, height: e2 = 300, fps: i2 = 60, scale: s2 = 1, backgroundColor: h2 = null, animate: n2 = false, smoothing: a2 = true, stretchToFit: r2 = false, viewport: o2 = null, preventEventBubbling: d2 = false, parentElement: l2 = null, debug: c2 = false, optimize: u2 = "auto", viewportHandler: p2, onUpdate: m2, onResize: _2 } = {}) {
    if (this.DEBUG = false, this.benchmark = { minElapsed: 1 / 0, maxElapsed: -1 / 0, minFps: 1 / 0, maxFps: -1 / 0 }, this._smoothing = false, this._stretchToFit = false, this._HDPIscaleRatio = 1, this._preventDefaults = false, this._lastRender = 0, this._renderId = 0, this._renderPending = false, this._disposed = false, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._children = [], this._animate = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = c2;
    const { userAgent: g2 } = navigator, w2 = g2.includes("Safari") && !g2.includes("Chrome");
    console.log("Are we running Safari:" + w2);
    const f2 = ["auto", "worker"].includes(u2) && !w2;
    console.info("use worker?:" + f2 + " for value:" + u2), this._element = document.createElement("canvas"), this._renderer = new b(this._element, f2, c2), this.collision = new G(this._renderer), this._updateHandler = m2, this._renderHandler = this.render.bind(this), this._viewportHandler = p2, this._resizeHandler = _2, this.setFrameRate(i2), this.setAnimatable(n2), h2 && this.setBackgroundColor(h2), this._HDPIscaleRatio = window.devicePixelRatio || 1, this.setDimensions(t2, e2, true, true), o2 && this.setViewport(o2.width, o2.height), 1 !== s2 && this.scale(s2, s2), this._stretchToFit = r2, this.setSmoothing(a2), this.preventEventBubbling(d2), this.addListeners(), l2 instanceof HTMLElement && this.insertInPage(l2), requestAnimationFrame(() => this.handleResize());
  }
  loadResource(t2, e2) {
    return this._renderer.loadResource(t2, e2);
  }
  getResource(t2) {
    return this._renderer.getResource(t2);
  }
  disposeResource(t2) {
    return this._renderer.disposeResource(t2);
  }
  getRenderer() {
    return this._renderer;
  }
  insertInPage(t2) {
    if (this._element.parentNode)
      throw new Error("Canvas already present in DOM");
    t2.appendChild(this._element);
  }
  getElement() {
    return this._element;
  }
  preventEventBubbling(t2) {
    this._preventDefaults = t2;
  }
  addChild(t2) {
    if (this.contains(t2))
      return this;
    const e2 = this._children.length;
    return e2 > 0 && (t2.last = this._children[e2 - 1], t2.last.next = t2), t2.next = void 0, t2.setCanvas(this), t2.setParent(this), this._children.push(t2), this.invalidate(), this;
  }
  removeChild(t2) {
    t2.setParent(void 0), t2.setCanvas(void 0);
    const e2 = this._children.indexOf(t2);
    -1 !== e2 && this._children.splice(e2, 1);
    const i2 = t2.last, s2 = t2.next;
    return i2 && (i2.next = s2), s2 && (s2.last = i2), t2.last = t2.next = void 0, this.invalidate(), t2;
  }
  getChildAt(t2) {
    return this._children[t2];
  }
  removeChildAt(t2) {
    return this.removeChild(this.getChildAt(t2));
  }
  numChildren() {
    return this._children.length;
  }
  getChildren() {
    return this._children;
  }
  contains(t2) {
    return t2.canvas === this;
  }
  invalidate() {
    this._animate || this._renderPending || (this._renderPending = true, this._renderId = window.requestAnimationFrame(this._renderHandler));
  }
  getFrameRate() {
    return this._fps;
  }
  setFrameRate(t2) {
    this._fps = t2, this._aFps = t2, this._renderInterval = 1e3 / t2;
  }
  getActualFrameRate() {
    return this._aFps;
  }
  getRenderInterval() {
    return this._renderInterval;
  }
  getSmoothing() {
    return this._smoothing;
  }
  setSmoothing(t2) {
    this._renderer.setSmoothing(t2), t2 ? this._element.style["image-rendering"] = "" : ["-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges"].forEach((t3) => {
      this._element.style["image-rendering"] = t3;
    }), this._smoothing = t2, this.invalidate();
  }
  getWidth() {
    return this._enqueuedSize ? this._enqueuedSize.width : this._width;
  }
  getHeight() {
    return this._enqueuedSize ? this._enqueuedSize.height : this._height;
  }
  setDimensions(t2, e2, i2 = true, s2 = false) {
    this._enqueuedSize = { width: t2, height: e2 }, i2 && (this._preferredWidth = t2, this._preferredHeight = e2), s2 && this.updateCanvasSize(), this.invalidate();
  }
  getViewport() {
    return this._viewport;
  }
  setViewport(t2, e2) {
    this._viewport = { width: t2, height: e2, left: 0, top: 0, right: t2, bottom: e2 }, this.panViewport(0, 0), this.invalidate();
  }
  panViewport(t2, e2, i2 = false) {
    var _a;
    const s2 = this._viewport;
    s2.left = X(0, C(t2, this._width - s2.width)), s2.right = s2.left + s2.width, s2.top = X(0, C(e2, this._height - s2.height)), s2.bottom = s2.top + s2.height, this.invalidate(), i2 && ((_a = this._viewportHandler) == null ? void 0 : _a.call(this, { type: "panned", value: s2 }));
  }
  setBackgroundColor(t2) {
    this._bgColor = t2;
  }
  setAnimatable(t2) {
    var _a;
    this._lastRaf = ((_a = window.performance) == null ? void 0 : _a.now()) || Date.now(), t2 && !this._renderPending && this.invalidate(), this._animate = t2;
  }
  isAnimatable() {
    return this._animate;
  }
  scale(t2, e2 = t2) {
    this._scale = { x: t2, y: e2 };
    const i2 = 1 === t2 && 1 === e2 ? "" : `scale(${t2}, ${e2})`, { style: s2 } = this._element;
    s2["-webkit-transform-origin"] = s2["transform-origin"] = "0 0", s2["-webkit-transform"] = s2.transform = i2, this.invalidate();
  }
  stretchToFit(t2) {
    this._stretchToFit = t2, this.handleResize();
  }
  handleResize() {
    var _a;
    const { innerWidth: t2, innerHeight: e2 } = window, i2 = this._preferredWidth, s2 = this._preferredHeight;
    let h2 = t2, n2 = e2, a2 = 1, r2 = 1;
    if (this._stretchToFit || t2 < i2 || e2 < s2) {
      if (i2 > s2) {
        n2 = h2 * (i2 / s2);
      } else if (i2 < s2) {
        n2 *= s2 / i2;
      }
      h2 = R(Math.min(t2, h2)), n2 = R(Math.min(e2, n2)), a2 = t2 / h2, r2 = e2 / n2, this.setDimensions(h2, n2, false, true);
    } else {
      const o2 = s2 / i2;
      h2 = Math.min(i2, t2), n2 = Math.min(e2, Math.round(h2 * o2)), this.setDimensions(i2, s2, false), a2 = r2 = t2 < i2 ? t2 / i2 : 1;
      const d2 = h2 / a2, l2 = n2 / r2;
      this.setViewport(d2, l2);
    }
    this.scale(a2, r2), (_a = this._resizeHandler) == null ? void 0 : _a.call(this, h2, n2);
  }
  getCoordinate() {
    return void 0 === this._coords && (this._coords = this._element.getBoundingClientRect()), this._coords;
  }
  dispose() {
    if (this._disposed)
      return;
    this._animate = false, window.cancelAnimationFrame(this._renderId), this.removeListeners();
    let t2 = this.numChildren();
    for (; t2--; )
      this._children[t2].dispose();
    this._children = [], this._element.parentNode && this._element.parentNode.removeChild(this._element), requestAnimationFrame(() => {
      this._renderer.dispose(), this._renderer = void 0, this.collision.dispose(), this.collision = void 0;
    }), this._disposed = true;
  }
  handleInteraction(t2) {
    const e2 = this._children.length, i2 = this._viewport;
    let s2;
    if (e2 > 0)
      switch (s2 = this._children[e2 - 1], t2.type) {
        default:
          let h2 = 0, n2 = 0;
          const a2 = t2.changedTouches;
          let r2 = 0, o2 = a2.length;
          if (o2 > 0) {
            let { x: d3, y: l3 } = this.getCoordinate();
            for (i2 && (d3 -= i2.left, l3 -= i2.top), r2 = 0; r2 < o2; ++r2) {
              const i3 = a2[r2], { identifier: o3 } = i3;
              if (h2 = i3.pageX - d3, n2 = i3.pageY - l3, "touchstart" === t2.type) {
                for (; s2; ) {
                  if (!this._activeTouches.includes(s2) && s2.handleInteraction(h2, n2, t2)) {
                    this._activeTouches[o3] = s2;
                    break;
                  }
                  s2 = s2.last;
                }
                s2 = this._children[e2 - 1];
              } else
                s2 = this._activeTouches[o3], (s2 == null ? void 0 : s2.handleInteraction(h2, n2, t2)) && "touchmove" !== t2.type && (this._activeTouches[o3] = null);
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: d2, offsetY: l2 } = t2;
          for (i2 && (d2 += i2.left, l2 += i2.top); s2 && !s2.handleInteraction(d2, l2, t2); )
            s2 = s2.last;
          break;
        case "wheel":
          const { deltaX: c2, deltaY: u2 } = t2, p2 = 20, m2 = 0 === c2 ? 0 : c2 > 0 ? p2 : -p2, _2 = 0 === u2 ? 0 : u2 > 0 ? p2 : -p2;
          this.panViewport(i2.left + m2, i2.top + _2, true);
      }
    this._preventDefaults && (t2.stopPropagation(), t2.preventDefault()), this._animate || this.invalidate();
  }
  render(t2 = 0) {
    this._renderPending = false;
    const e2 = t2 - this._lastRender;
    if (this._animate && e2 / this._renderInterval < 0.999)
      return this._renderId = window.requestAnimationFrame(this._renderHandler), void (this._lastRaf = t2);
    let i2, s2;
    this._aFps = 1e3 / (t2 - this._lastRaf), i2 = this._fps > 60 ? this._fps / this._aFps : 60 === this._fps && this._aFps > 63 ? 1 : 1 / (this._fps / this._aFps), this._lastRaf = t2, this._lastRender = t2 - e2 % this._renderInterval, this._enqueuedSize && this.updateCanvasSize();
    const h2 = this._width, n2 = this._height;
    this._bgColor ? this._renderer.drawRect(0, 0, h2, n2, this._bgColor) : this._renderer.clearRect(0, 0, h2, n2);
    const a2 = "function" == typeof this._updateHandler;
    for (a2 && this._updateHandler(t2, i2), s2 = this._children[0]; s2; )
      a2 || s2.update(t2, i2), s2.draw(this._renderer, this._viewport), s2 = s2.next;
    if (this._renderer.onCommandsReady(), !this._disposed && this._animate && (this._renderPending = true, this._renderId = window.requestAnimationFrame(this._renderHandler)), this.DEBUG && t2 > 2) {
      const e3 = window.performance.now() - t2;
      this.benchmark.minElapsed = Math.min(this.benchmark.minElapsed, e3), this.benchmark.maxElapsed = Math.max(this.benchmark.maxElapsed, e3), this._aFps !== 1 / 0 && (this.benchmark.minFps = Math.min(this.benchmark.minFps, this._aFps), this.benchmark.maxFps = Math.max(this.benchmark.maxFps, this._aFps));
    }
  }
  addListeners() {
    this._eventHandler || (this._eventHandler = new t());
    const e2 = this._eventHandler, i2 = this.handleInteraction.bind(this), s2 = this._element;
    "ontouchstart" in window && ["start", "move", "end", "cancel"].forEach((t2) => {
      e2.add(s2, `touch${t2}`, i2);
    }), ["down", "move"].forEach((t2) => {
      e2.add(s2, `mouse${t2}`, i2);
    }), e2.add(window, "mouseup", i2), this._viewport && e2.add(s2, "wheel", i2), e2.add(window, "resize", this.handleResize.bind(this));
  }
  removeListeners() {
    var _a;
    (_a = this._eventHandler) == null ? void 0 : _a.dispose(), this._eventHandler = void 0;
  }
  updateCanvasSize() {
    const t2 = this._HDPIscaleRatio;
    let e2, i2;
    if (void 0 !== this._enqueuedSize && ({ width: e2, height: i2 } = this._enqueuedSize, this._enqueuedSize = void 0, this._width = e2, this._height = i2), this._viewport) {
      const t3 = this._width, s2 = this._height;
      e2 = C(this._viewport.width, t3), i2 = C(this._viewport.height, s2);
    }
    if (e2 && i2) {
      const s2 = this.getElement();
      this._renderer.setDimensions(e2 * t2, i2 * t2), s2.style.width = `${e2}px`, s2.style.height = `${i2}px`;
    }
    this._renderer.scale(t2, t2), this.setSmoothing(this._smoothing), this._coords = void 0;
  }
}
let Y, y, x, L;
const k = (t2, e2) => {
  ({ left: Y, top: y, width: x, height: L } = t2);
  const { left: i2, top: s2, width: h2, height: n2 } = e2;
  return x = Y > i2 ? Math.min(x, h2 - (Y - i2)) : Math.min(h2, x - (i2 - Y)), L = y > s2 ? Math.min(L, n2 - (y - s2)) : Math.min(n2, L - (s2 - y)), { src: { left: Y > i2 ? 0 : i2 - Y, top: y > s2 ? 0 : s2 - y, width: x, height: L }, dest: { left: Y > i2 ? Y - i2 : 0, top: y > s2 ? y - s2 : 0, width: x, height: L } };
}, { min: S, max: H } = Math, z = 180 / Math.PI, I = Math.PI / 180, M = 0.5;
class F {
  constructor({ width: t2, height: e2, resourceId: i2, x: s2 = 0, y: h2 = 0, rotation: n2 = 0, collidable: a2 = false, interactive: r2 = false, mask: o2 = false, sheet: d2 = [], sheetTileWidth: l2 = 0, sheetTileHeight: c2 = 0 } = { width: 64, height: 64 }) {
    if (this.hover = false, this.isDragging = false, this._children = [], this._disposed = false, this._mask = false, this._interactive = false, this._draggable = false, this._keepInBounds = false, this._pressed = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a Sprite without valid dimensions");
    if (this.collidable = a2, this._mask = o2, this._bounds = { left: 0, top: 0, width: t2, height: e2 }, this.setX(s2), this.setY(h2), this.setRotation(n2), this.setInteractive(r2), i2 && this.setResource(i2), Array.isArray(d2) && d2.length > 0) {
      if (!i2)
        throw new Error("cannot use a spritesheet without a valid resource id");
      this.setSheet(d2, l2, c2);
    }
  }
  getDraggable() {
    return this._draggable;
  }
  setDraggable(t2, e2 = false) {
    this._draggable = t2, this._keepInBounds = !!this._constraint || e2, t2 && !this._interactive && this.setInteractive(true);
  }
  getX() {
    return this._bounds.left;
  }
  setX(t2) {
    const e2 = t2 - this._bounds.left;
    this._bounds.left = this._constraint ? t2 + this._constraint.left : t2;
    let i2 = this._children[0];
    for (; i2; )
      i2.isDragging || i2.setX(i2._bounds.left + e2), i2 = i2.next;
  }
  getY() {
    return this._bounds.top;
  }
  setY(t2) {
    const e2 = t2 - this._bounds.top;
    this._bounds.top = this._constraint ? t2 + this._constraint.top : t2;
    let i2 = this._children[0];
    for (; i2; )
      i2.isDragging || i2.setY(i2._bounds.top + e2), i2 = i2.next;
  }
  getWidth() {
    return this._bounds.width;
  }
  setWidth(t2) {
    const e2 = this._bounds.width || 0;
    e2 !== t2 && (this._bounds.width = t2, 0 !== e2 && (this._bounds.left -= t2 * M - e2 * M), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t2) {
    const e2 = this._bounds.height || 0;
    e2 !== t2 && (this._bounds.height = t2, 0 !== e2 && (this._bounds.top -= t2 * M - e2 * M), this.invalidate());
  }
  setBounds(t2, e2, i2, s2) {
    if (this._constraint)
      t2 -= this._constraint.left, e2 -= this._constraint.top;
    else if (!this.canvas)
      throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");
    let h2 = false;
    "number" == typeof i2 && (h2 = this._bounds.width !== i2, this._bounds.width = i2), "number" == typeof s2 && (h2 = h2 || this._bounds.height !== s2, this._bounds.height = s2);
    const n2 = this._bounds.width, a2 = this._bounds.height, r2 = this._constraint ? this._constraint.width : this.canvas.getWidth(), o2 = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const i3 = S(0, -(n2 - r2)), s3 = S(0, -(a2 - o2)), h3 = o2 - a2;
      t2 = S(r2 - n2, H(t2, i3)), e2 = S(h3, H(e2, s3));
    } else
      t2 > r2 && (t2 += n2 * M), e2 > o2 && (e2 += a2 * M);
    this.setX(t2), this.setY(e2), h2 && this.invalidate();
  }
  getBounds() {
    return this._bounds;
  }
  getRotation() {
    return this._rotation * z;
  }
  setRotation(t2, e2) {
    this._rotation = t2 % 360 * I, this._pivot = e2, this.invalidateDrawContext();
  }
  setScale(t2) {
    this._scale = t2, this.invalidateDrawContext();
  }
  getInteractive() {
    return this._interactive;
  }
  setInteractive(t2) {
    this._interactive = t2;
  }
  update(t2, e2) {
    let i2 = this._children[0];
    for (; i2; )
      i2.update(t2, e2), i2 = i2.next;
    this._animation && this.updateAnimation(e2);
  }
  draw(t2, e2) {
    const i2 = this._bounds;
    let s2 = !!this._resourceId;
    if (s2 && e2 && (s2 = ((t3, e3) => ({ left: Y, top: y } = t3, Y + t3.width >= e3.left && Y <= e3.right && y + t3.height >= e3.top && y <= e3.bottom))(i2, e2)), s2) {
      const s3 = this._animation;
      let { left: h3, top: n2, width: a2, height: r2 } = i2;
      if (s3) {
        const i3 = s3.tileWidth ? s3.tileWidth : M + a2 << 0, o2 = s3.tileHeight ? s3.tileHeight : M + r2 << 0;
        e2 && (h3 -= e2.left, n2 -= e2.top), t2.drawImageCropped(this._resourceId, s3.col * i3, s3.type.row * o2, i3, o2, h3, n2, a2, r2, this._drawContext);
      } else if (e2) {
        const { src: s4, dest: h4 } = k(i2, e2);
        t2.drawImageCropped(this._resourceId, s4.left, s4.top, s4.width, s4.height, h4.left, h4.top, h4.width, h4.height, this._drawContext);
      } else
        t2.drawImage(this._resourceId, h3, n2, a2, r2, this._drawContext);
    }
    let h2 = this._children[0];
    for (; h2; )
      h2.draw(t2, e2), h2 = h2.next;
  }
  insideBounds(t2, e2) {
    const { left: i2, top: s2, width: h2, height: n2 } = this._bounds;
    return t2 >= i2 && t2 <= i2 + h2 && e2 >= s2 && e2 <= s2 + n2;
  }
  collidesWith(t2) {
    if (t2 === this)
      return false;
    const e2 = this._bounds, i2 = t2.getBounds();
    return !(e2.top + e2.height < i2.top || e2.top > i2.top + i2.height || e2.left + e2.width < i2.left || e2.left > i2.left + i2.width);
  }
  getIntersection(t2) {
    if (this.collidesWith(t2)) {
      const e2 = this._bounds, i2 = t2.getBounds(), s2 = H(e2.left, i2.left), h2 = H(e2.top, i2.top);
      return { left: s2, top: h2, width: S(e2.left + e2.width, i2.width + i2.height) - s2, height: S(e2.top + e2.height, i2.top + i2.height) - h2 };
    }
  }
  collidesWithEdge(t2, e2) {
    if (t2 === this)
      return false;
    if (isNaN(e2) || e2 < 0 || e2 > 3)
      throw new Error("invalid argument for edge");
    switch (e2) {
      case 0:
        return this.getX() <= t2.getX() + t2.getWidth();
      case 1:
        return this.getY() <= t2.getY() + t2.getHeight();
      case 2:
        return this.getX() + this.getWidth() <= t2.getX();
      case 3:
        return this.getY() + this.getHeight() >= t2.getY();
    }
    return false;
  }
  setResource(t2, e2, i2) {
    this._resourceId = t2;
    const s2 = "number" == typeof e2, h2 = "number" == typeof i2;
    if (s2 && this.setWidth(e2), h2 && this.setHeight(i2), this._keepInBounds && this.canvas && (s2 || h2)) {
      const t3 = -(this._bounds.width - this.canvas.getWidth()), e3 = -(this._bounds.height - this.canvas.getHeight());
      this._bounds.left > 0 ? this._bounds.left = 0 : this._bounds.left < t3 && (this._bounds.left = t3), this._bounds.top > 0 ? this._bounds.top = 0 : this._bounds.top < e3 && (this._bounds.top = e3);
    }
  }
  getResourceId() {
    return this._resourceId;
  }
  setSheet(t2, e2, i2) {
    this._sheet = t2, t2 ? (this._animation = { type: null, col: 0, maxCol: 0, fpt: 0, counter: 0, tileWidth: this.getWidth(), tileHeight: this.getHeight() }, "number" == typeof e2 && (this._animation.tileWidth = e2), "number" == typeof i2 && (this._animation.tileHeight = i2), this.switchAnimation(0)) : this._animation = void 0;
  }
  switchAnimation(t2) {
    const e2 = this._animation, i2 = this._sheet[t2];
    e2.type = i2, e2.fpt = i2.fpt, e2.maxCol = i2.col + (i2.amount - 1), e2.col = i2.col, e2.counter = 0, e2.onComplete = i2.onComplete;
  }
  setParent(t2) {
    this._parent = t2;
  }
  getParent() {
    return this._parent;
  }
  setCanvas(t2) {
    this.canvas = t2;
    for (const e2 of this._children)
      e2.setCanvas(t2);
  }
  setConstraint(t2, e2, i2, s2) {
    return this._constraint = { left: t2, top: e2, width: i2, height: s2 }, this._bounds.left = H(t2, this._bounds.left), this._bounds.top = H(e2, this._bounds.top), this._keepInBounds = true, this.getConstraint();
  }
  getConstraint() {
    return this._constraint;
  }
  addChild(t2) {
    if (this.contains(t2))
      return this;
    const e2 = this._children.length;
    return e2 > 0 && (t2.last = this._children[e2 - 1], t2.last.next = t2, t2.next = void 0), t2.setCanvas(this.canvas), t2.setParent(this), this._children.push(t2), this.invalidate(), this;
  }
  removeChild(t2) {
    t2.setParent(void 0), t2.setCanvas(void 0);
    const e2 = this._children.indexOf(t2);
    -1 !== e2 && this._children.splice(e2, 1);
    const i2 = t2.last, s2 = t2.next;
    return i2 && (i2.next = s2), s2 && (s2.last = i2), t2.last = t2.next = void 0, this.invalidate(), t2;
  }
  getChildAt(t2) {
    return this._children[t2];
  }
  removeChildAt(t2) {
    return this.removeChild(this.getChildAt(t2));
  }
  numChildren() {
    return this._children.length;
  }
  getChildren() {
    return this._children;
  }
  contains(t2) {
    return t2._parent === this;
  }
  dispose() {
    if (this._disposed)
      return;
    this._disposed = true, this._parent && this._parent.removeChild(this);
    let t2 = this._children.length;
    for (; t2--; ) {
      const e2 = this._children[t2];
      e2.dispose(), e2.next = void 0, e2.last = void 0;
    }
    this._children = [];
  }
  handlePress(t2, e2, i2) {
  }
  handleRelease(t2, e2, i2) {
  }
  handleClick() {
  }
  handleMove(t2, e2, i2) {
    const s2 = this._dragStartOffset.x + (t2 - this._dragStartEventCoordinates.x), h2 = this._dragStartOffset.y + (e2 - this._dragStartEventCoordinates.y);
    this.setBounds(s2, h2, this._bounds.width, this._bounds.height);
  }
  handleInteraction(t2, e2, i2) {
    let s2, h2 = false;
    const n2 = this._children.length;
    if (n2 > 0)
      for (s2 = this._children[n2 - 1]; s2; ) {
        if (h2 = s2.handleInteraction(t2, e2, i2), h2)
          return true;
        s2 = s2.last;
      }
    if (!this._interactive)
      return false;
    const { type: a2 } = i2;
    if (this._pressed && ("touchend" === a2 || "mouseup" === a2))
      return this._pressed = false, this.isDragging && (this.isDragging = false), Date.now() - this._pressTime < 250 && this.handleClick(), this.handleRelease(t2, e2, i2), true;
    if (this.insideBounds(t2, e2)) {
      if (this.hover = true, "touchstart" === a2 || "mousedown" === a2)
        return this._pressTime = Date.now(), this._pressed = true, this._draggable && (this.isDragging = true, this._dragStartOffset = { x: this._bounds.left, y: this._bounds.top }, this._dragStartEventCoordinates = { x: t2, y: e2 }), this.handlePress(t2, e2, i2), "touchstart" === a2 && (i2.stopPropagation(), i2.preventDefault()), true;
    } else
      this.hover = false;
    return !!this.isDragging && (this.handleMove(t2, e2, i2), true);
  }
  invalidate() {
    this.canvas && this.canvas.invalidate();
  }
  invalidateDrawContext() {
    if (0 !== this._rotation || this._mask || 1 !== this._scale) {
      this._drawContext = this._drawContext ?? {};
      const t2 = this._drawContext;
      t2.rotation = this._rotation, t2.pivot = this._pivot, t2.blendMode = this._mask ? "destination-in" : void 0, t2.scale = this._scale;
    }
  }
  updateAnimation(t2 = 1) {
    const e2 = this._animation;
    e2.counter += t2, e2.counter >= e2.fpt && (++e2.col, e2.counter = e2.counter % e2.fpt), e2.col > e2.maxCol && (e2.col = e2.type.col, "function" == typeof e2.onComplete && e2.onComplete(this));
  }
}
export {
  W as Canvas,
  o as Loader,
  F as Sprite
};
