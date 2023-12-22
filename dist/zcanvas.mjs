class t {
  constructor() {
    this._eventMap = [], this._disposed = false;
  }
  add(t2, e2, s2) {
    return !this.has(t2, e2) && (t2.addEventListener(e2, s2, false), this._eventMap.push({ target: t2, type: e2, listener: s2 }), true);
  }
  has(t2, e2) {
    let s2 = this._eventMap.length;
    for (; s2--; ) {
      const i2 = this._eventMap[s2];
      if (i2.target === t2 && i2.type == e2)
        return true;
    }
    return false;
  }
  remove(t2, e2) {
    let s2 = this._eventMap.length;
    for (; s2--; ) {
      const i2 = this._eventMap[s2];
      if (i2.target === t2 && i2.type === e2)
        return t2.removeEventListener(e2, i2.listener, false), this._eventMap.splice(s2, 1), true;
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
function s(t2 = 0, e2 = 0, s2 = false) {
  const i2 = document.createElement("canvas"), h2 = i2.getContext("2d", s2 ? { willReadFrequently: true } : void 0);
  return 0 !== t2 && 0 !== e2 && (i2.width = t2, i2.height = e2), { cvs: i2, ctx: h2 };
}
function i() {
  return e || (e = s().cvs), e;
}
async function h(t2) {
  t2 instanceof Blob && (t2 = await async function(t3) {
    const e2 = await n(t3), { cvs: i2, ctx: h3 } = s(e2.width, e2.height);
    return h3.drawImage(e2, 0, 0), i2;
  }(t2)), a(i(), t2);
  const h2 = await createImageBitmap(i());
  return e.width = 1, e.height = 1, h2;
}
function n(t2) {
  const e2 = URL.createObjectURL(t2), s2 = () => {
    URL.revokeObjectURL(e2);
  };
  return new Promise((t3, i2) => {
    const h2 = new Image();
    h2.onload = () => {
      s2(), t3(h2);
    }, h2.onerror = (t4) => {
      s2(), i2(t4);
    }, h2.src = e2;
  });
}
function a(t2, e2, s2, i2) {
  const h2 = t2.getContext("2d");
  s2 = s2 ?? e2.width, i2 = i2 ?? e2.height, t2.width = s2, t2.height = i2, h2.clearRect(0, 0, s2, i2), h2.drawImage(e2, 0, 0, s2, i2);
}
async function r(t2) {
  const e2 = new FileReader();
  return new Promise((s2, i2) => {
    e2.onload = (e3) => {
      var _a;
      if (!((_a = e3 == null ? void 0 : e3.target) == null ? void 0 : _a.result))
        return i2();
      s2(new Blob([e3.target.result], { type: t2.type }));
    }, e2.onerror = (t3) => i2(t3), e2.readAsArrayBuffer(t2);
  });
}
const o = { loadImage: (e2) => new Promise(async (s2, i2) => {
  let h2;
  if (e2 instanceof File ? h2 = await r(e2) : e2 instanceof Blob && (h2 = e2), void 0 !== h2) {
    try {
      const t2 = await n(h2);
      o.onReady(t2).then(() => s2(d(t2)));
    } catch (t2) {
      i2(t2);
    }
    return;
  }
  const a2 = function(t2) {
    const e3 = ("string" == typeof t2 ? t2 : t2.src).substring(0, 5);
    return "data:" === e3 || "blob:" === e3;
  }(e2), l2 = new window.Image(), c2 = new t(), u2 = () => {
    c2.dispose(), i2();
  }, p2 = () => {
    c2.dispose(), o.onReady(l2).then(() => s2(d(l2))).catch(i2);
  };
  var m2;
  a2 || (m2 = l2, function(t2) {
    const { location: e3 } = window;
    return !(!t2.startsWith("./") && !t2.startsWith(`${e3.protocol}//${e3.host}`)) || !/^http[s]?:/.test(t2);
  }(e2) || (m2.crossOrigin = "Anonymous"), c2.add(l2, "load", p2), c2.add(l2, "error", u2)), l2.src = e2, a2 && p2();
}), async loadBitmap(t2) {
  const { image: e2 } = await o.loadImage(t2);
  return h(e2);
}, isReady: (t2) => true === t2.complete && ("number" == typeof t2.naturalWidth && t2.naturalWidth > 0), onReady: (t2) => new Promise((e2, s2) => {
  const i2 = 60;
  let h2 = 0;
  !function n2() {
    o.isReady(t2) ? e2() : ++h2 === i2 ? (console.error(typeof t2), s2(new Error("Image could not be resolved. This shouldn't occur."))) : window.requestAnimationFrame(n2);
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
    ["imageSmoothingEnabled", "mozImageSmoothingEnabled", "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"].forEach((s2) => {
      void 0 !== e2[s2] && (e2[s2] = t2);
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
  transform(t2, e2, s2, i2, h2, n2) {
    this._context.transform(t2, e2, s2, i2, h2, n2);
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
  clearRect(t2, e2, s2, i2) {
    this._context.clearRect(t2, e2, s2, i2);
  }
  drawRect(t2, e2, s2, i2, h2, n2 = "fill") {
    if (u = this._context, "fill" === n2)
      u.fillStyle = h2, u.fillRect(t2, e2, s2, i2);
    else {
      const n3 = 1;
      u.lineWidth = n3, u.strokeStyle = h2, u.strokeRect(c + (t2 - n3), c + (e2 - n3), s2, i2);
    }
  }
  drawRoundRect(t2, e2, s2, i2, h2, n2, a2) {
    u = this._context, "fill" === a2 ? (u.fillStyle = n2, u.fillRect(t2, e2, s2, i2)) : (u.strokeStyle = n2, u.beginPath(), u.roundRect(t2, e2, s2, i2, h2), u.stroke());
  }
  drawCircle(t2, e2, s2, i2 = "transparent", h2) {
    u = this._context, u.beginPath(), u.arc(t2 + s2, e2 + s2, s2, 0, 2 * Math.PI, false), "transparent" !== i2 && (u.fillStyle = i2, u.fill()), h2 && (u.lineWidth = 5, u.strokeStyle = h2, u.closePath(), u.stroke());
  }
  drawImage(t2, e2, s2, i2, h2, n2) {
    if (!this._bitmapCache.has(t2))
      return;
    const a2 = !!n2 && this.applyDrawContext(n2, e2, s2, i2, h2);
    void 0 === i2 ? this._context.drawImage(this._bitmapCache.get(t2), e2, s2) : this._context.drawImage(this._bitmapCache.get(t2), e2, s2, i2, h2), this._debug && this.drawRect(e2, s2, i2, h2, "#FF0000", "stroke"), a2 && this.restore();
  }
  drawImageCropped(t2, e2, s2, i2, h2, n2, a2, r2, o2, d2) {
    if (!this._bitmapCache.has(t2))
      return;
    if (d2 == null ? void 0 : d2.safeMode) {
      if (r2 <= 0 || o2 <= 0)
        return;
      const n3 = this._bitmapCache.get(t2), a3 = (r2 = Math.min(this._context.canvas.width, r2)) / i2, d3 = (o2 = Math.min(this._context.canvas.height, o2)) / h2;
      e2 + i2 > n3.width && (r2 -= a3 * (e2 + i2 - n3.width), i2 -= e2 + i2 - n3.width), s2 + h2 > n3.height && (o2 -= d3 * (s2 + h2 - n3.height), h2 -= s2 + h2 - n3.height);
    }
    const l2 = !!d2 && this.applyDrawContext(d2, n2, a2, r2, o2);
    this._context.drawImage(this._bitmapCache.get(t2), c + e2 << 0, c + s2 << 0, c + i2 << 0, c + h2 << 0, c + n2 << 0, c + a2 << 0, c + r2 << 0, c + o2 << 0), this._debug && this.drawRect(n2, a2, r2, o2, "#FF0000", "stroke"), l2 && this.restore();
  }
  createPattern(t2, e2) {
    this._bitmapCache.has(t2) && this._patternCache.set(t2, this._context.createPattern(this._bitmapCache.get(t2), e2));
  }
  drawPattern(t2, e2, s2, i2, h2) {
    if (!this._patternCache.has(t2))
      return;
    const n2 = this._patternCache.get(t2);
    this._context.fillStyle = n2, this._context.fillRect(e2, s2, i2, h2);
  }
  applyDrawContext(t2, e2, s2, i2, h2) {
    var _a, _b;
    const n2 = void 0 !== t2.scale && 1 !== t2.scale, a2 = 0 !== t2.rotation, r2 = void 0 !== t2.alpha, o2 = void 0 !== t2.blendMode;
    let d2 = n2 || a2 || r2 || o2;
    if (d2 && this.save(), n2 && !a2 && this.scale(t2.scale), a2) {
      const n3 = t2.scale ?? 1, a3 = ((_a = t2.pivot) == null ? void 0 : _a.x) ?? e2 + i2 * c, r3 = ((_b = t2.pivot) == null ? void 0 : _b.y) ?? s2 + h2 * c, o3 = Math.cos(t2.rotation) * n3, d3 = Math.sin(t2.rotation) * n3;
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
class w {
  constructor(t2, e2 = false, s2 = false) {
    if (this._useWorker = false, this._element = t2, e2 && "function" == typeof this._element.transferControlToOffscreen) {
      this._useWorker = true, this._callbacks = /* @__PURE__ */ new Map(), this._pool = new l(() => [], (t3) => {
        t3.length = 0;
      }), this._pool.fill(1e3), this._commands = [];
      const e3 = t2.transferControlToOffscreen();
      this._worker = new g(), this._worker.postMessage({ cmd: "init", canvas: e3, debug: s2 }, [e3]), this._worker.onmessage = this.handleMessage.bind(this);
    } else
      this._renderer = new p(this._element, s2);
  }
  loadResource(t2, e2) {
    return new Promise(async (s2, i2) => {
      if (e2 instanceof ImageBitmap)
        this._useWorker ? this.wrappedWorkerLoad(t2, e2, s2, i2, true) : (this._renderer.cacheResource(t2, e2), s2({ width: e2.width, height: e2.height }));
      else if ("string" != typeof e2) {
        if (e2 instanceof HTMLImageElement || e2 instanceof HTMLCanvasElement) {
          const i3 = await h(e2);
          return this.loadResource(t2, i3).then((t3) => s2(t3));
        }
        if (e2 instanceof File)
          if (this._useWorker)
            this.wrappedWorkerLoad(t2, e2, s2, i2);
          else {
            const h2 = await r(e2);
            this.wrappedLoad(t2, h2, s2, i2);
          }
        else
          e2 instanceof Blob ? this._useWorker ? this.wrappedWorkerLoad(t2, e2, s2, i2) : this.wrappedLoad(t2, e2, s2, i2) : i2("Unsupported resource type: " + typeof e2);
      } else if (e2 = e2.startsWith("./") ? new URL(e2, document.baseURI).href : e2, this._useWorker)
        this.wrappedWorkerLoad(t2, e2, s2, i2);
      else {
        const h2 = await o.loadImage(e2);
        this.wrappedLoad(t2, h2.image, s2, i2);
      }
    });
  }
  getResource(t2) {
    return new Promise((e2, s2) => {
      this._useWorker ? (this._callbacks.set(t2, { resolve: e2, reject: s2 }), this._worker.postMessage({ cmd: "getResource", id: t2 })) : e2(this._renderer.getResource(t2));
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
      var _a, _b;
      (_a = this._worker) == null ? void 0 : _a.terminate(), this._worker = void 0, (_b = this._callbacks) == null ? void 0 : _b.clear();
    }, 50);
  }
  handleMessage(t2) {
    const { cmd: e2, id: s2 } = t2.data;
    switch (e2) {
      default:
        break;
      case "onload":
        if (!this._callbacks.has(s2))
          return;
        this._callbacks.get(s2).resolve(t2.data.size), this._callbacks.delete(s2);
        break;
      case "onerror":
        if (!this._callbacks.has(s2))
          return;
        this._callbacks.get(s2).reject(new Error(t2.data.error)), this._callbacks.delete(s2);
        break;
      case "onresource":
        this._callbacks.get(s2).resolve(t2.data.bitmap), this._callbacks.delete(s2);
    }
  }
  wrappedWorkerLoad(t2, e2, s2, i2, h2 = false) {
    this._callbacks.set(t2, { resolve: s2, reject: i2 }), this._worker.postMessage({ cmd: "loadResource", source: e2, id: t2 }, h2 ? [e2] : []);
  }
  async wrappedLoad(t2, e2, s2, i2) {
    try {
      const i3 = await h(e2);
      this._renderer.cacheResource(t2, i3), s2({ width: i3.width, height: i3.height });
    } catch (t3) {
      i2(t3);
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
  transform(t2, e2, s2, i2, h2, n2) {
    this.onDraw("transform", t2, e2, s2, i2, h2, n2);
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
  clearRect(t2, e2, s2, i2) {
    this.onDraw("clearRect", t2, e2, s2, i2);
  }
  drawRect(t2, e2, s2, i2, h2, n2) {
    this.onDraw("drawRect", t2, e2, s2, i2, h2, n2);
  }
  drawRoundRect(t2, e2, s2, i2, h2, n2, a2) {
    this.onDraw("drawRoundRect", t2, e2, s2, i2, h2, n2, a2);
  }
  drawCircle(t2, e2, s2, i2 = "transparent", h2) {
    this.onDraw("drawCircle", t2, e2, s2, i2, h2);
  }
  drawImage(t2, e2, s2, i2, h2, n2) {
    this.onDraw("drawImage", t2, e2, s2, i2, h2, n2);
  }
  drawImageCropped(t2, e2, s2, i2, h2, n2, a2, r2, o2, d2) {
    this.onDraw("drawImageCropped", t2, e2, s2, i2, h2, n2, a2, r2, o2, d2);
  }
  drawPattern(t2, e2, s2, i2, h2) {
    this.onDraw("drawPattern", t2, e2, s2, i2, h2);
  }
  onDraw(t2, ...e2) {
    if (this._useWorker) {
      const s2 = this._pool.next();
      return s2.length = 0, s2.push(t2, ...e2), void this._commands.push(s2);
    }
    this._renderer[t2](...e2);
  }
  getBackend(t2, ...e2) {
    if (this._useWorker)
      return this._worker.postMessage({ cmd: t2, args: [...e2] });
    this._renderer[t2](...e2);
  }
}
const b = (t2) => t2 > 0 ? t2 + 0.5 << 0 : 0 | t2, f = [], v = [], Z = s(1, 1, true).cvs;
class C {
  constructor(t2) {
    this._renderer = t2, this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  getChildrenUnderPoint(t2, e2, s2, i2, h2, n2 = false) {
    const a2 = [];
    let r2, o2, d2, l2, c2, u2 = t2.length;
    for (; u2--; )
      r2 = t2[u2], o2 = r2.getX(), d2 = r2.getY(), l2 = r2.getWidth(), c2 = r2.getHeight(), o2 < e2 + i2 && o2 + l2 > e2 && d2 < s2 + h2 && d2 + c2 > s2 && (!n2 || n2 && r2.collidable) && a2.push(r2);
    return a2;
  }
  pixelCollision(t2, e2, s2 = false) {
    const i2 = t2.getIntersection(e2);
    if (void 0 === i2)
      return false;
    this.getPixelArray(t2, i2, f), this.getPixelArray(e2, i2, v);
    let h2 = 0;
    if (true === s2) {
      const t3 = i2.width, e3 = i2.height;
      for (let s3 = 0; s3 < e3; ++s3)
        for (let e4 = 0; e4 < t3; ++e4) {
          if (0 !== f[h2] && 0 !== v[h2])
            return { x: e4, y: s3 };
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
    const { width: s2, height: i2 } = e2;
    return function(t3, e3, s3, i3) {
      a(t3, e3, s3, i3);
    }(Z, e2, s2, i2), this._cacheMap.set(t2, { data: Z.getContext("2d").getImageData(0, 0, s2, i2).data, size: { width: s2, height: i2 } }), Z.width = Z.height = 1, true;
  }
  clearCache(t2) {
    return !!this.hasCache(t2) && (this._cacheMap.delete(t2), true);
  }
  hasCache(t2) {
    return this._cacheMap.has(t2);
  }
  getPixelArray(t2, e2, s2) {
    const i2 = t2.getResourceId();
    if (!this.hasCache(i2))
      throw new Error(`Cannot get cached entry for resource "${i2}". Cache it first.`);
    const h2 = t2.getBounds(), n2 = b(e2.left - h2.left), a2 = b(e2.top - h2.top), r2 = b(e2.width), o2 = b(e2.height), { data: d2, size: l2 } = this._cacheMap.get(i2);
    if (0 === r2 || 0 === o2)
      return void (s2.length = 0);
    s2.length = b(r2 * o2);
    const c2 = l2.width, u2 = a2 + o2, p2 = n2 + r2;
    let m2 = -1;
    for (let t3 = a2; t3 < u2; ++t3)
      for (let e3 = n2; e3 < p2; ++e3) {
        const i3 = 4 * (t3 * c2 + e3);
        s2[++m2] = d2[i3 + 3];
      }
  }
}
const { min: G, max: X, round: R } = Math;
class W {
  constructor({ width: t2 = 300, height: e2 = 300, fps: s2 = 60, scale: i2 = 1, backgroundColor: h2 = null, animate: n2 = false, smoothing: a2 = true, stretchToFit: r2 = false, viewport: o2 = null, preventEventBubbling: d2 = false, parentElement: l2 = null, debug: c2 = false, optimize: u2 = "auto", viewportHandler: p2, onUpdate: m2, onResize: _2 } = {}) {
    if (this.DEBUG = false, this.benchmark = { minElapsed: 1 / 0, maxElapsed: -1 / 0, minFps: 1 / 0, maxFps: -1 / 0 }, this._smoothing = false, this._stretchToFit = false, this._HDPIscaleRatio = 1, this._preventDefaults = false, this._lastRender = 0, this._renderId = 0, this._renderPending = false, this._disposed = false, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._children = [], this._animate = false, this._hasFsHandler = false, this._isFullScreen = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = c2;
    const { userAgent: g2 } = navigator, b2 = g2.includes("Safari") && !g2.includes("Chrome"), f2 = ["auto", "worker"].includes(u2) && !b2;
    this._element = document.createElement("canvas"), this._renderer = new w(this._element, f2, c2), this.collision = new C(this._renderer), this._updateHandler = m2, this._renderHandler = this.render.bind(this), this._viewportHandler = p2, this._resizeHandler = _2, this.setFrameRate(s2), this.setAnimatable(n2), h2 && this.setBackgroundColor(h2), this._HDPIscaleRatio = window.devicePixelRatio || 1, this.setDimensions(t2, e2, true, true), o2 && this.setViewport(o2.width, o2.height), 1 !== i2 && this.scale(i2, i2), this._stretchToFit = r2, this.setSmoothing(a2), this.preventEventBubbling(d2), this.addListeners(), l2 instanceof HTMLElement && this.insertInPage(l2), requestAnimationFrame(() => this.handleResize());
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
    const s2 = t2.last, i2 = t2.next;
    return s2 && (s2.next = i2), i2 && (i2.last = s2), t2.last = t2.next = void 0, this.invalidate(), t2;
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
  setDimensions(t2, e2, s2 = true, i2 = false) {
    this._enqueuedSize = { width: t2, height: e2 }, s2 && (this._preferredWidth = t2, this._preferredHeight = e2), i2 && this.updateCanvasSize(), this.invalidate();
  }
  getViewport() {
    return this._viewport;
  }
  setViewport(t2, e2) {
    this._viewport = { width: t2, height: e2, left: 0, top: 0, right: t2, bottom: e2 }, this.panViewport(0, 0), this.invalidate();
  }
  panViewport(t2, e2, s2 = false) {
    var _a;
    const i2 = this._viewport;
    i2.left = X(0, G(t2, this._width - i2.width)), i2.right = i2.left + i2.width, i2.top = X(0, G(e2, this._height - i2.height)), i2.bottom = i2.top + i2.height, this.invalidate(), s2 && ((_a = this._viewportHandler) == null ? void 0 : _a.call(this, { type: "panned", value: i2 }));
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
    const s2 = 1 === t2 && 1 === e2 ? "" : `scale(${t2}, ${e2})`, { style: i2 } = this._element;
    i2["-webkit-transform-origin"] = i2["transform-origin"] = "0 0", i2["-webkit-transform"] = i2.transform = s2, this.invalidate();
  }
  stretchToFit(t2) {
    this._stretchToFit = t2, this.handleResize();
  }
  setFullScreen(t2, e2 = false) {
    if (!this._hasFsHandler) {
      this._hasFsHandler = true;
      const t3 = document, s2 = () => {
        this._isFullScreen = t3.webkitIsFullScreen || t3.mozFullScreen || true === t3.msFullscreenElement, e2 && (this._stretchToFit = this._isFullScreen);
      };
      ["webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange"].forEach((e3) => {
        this._eventHandler.add(t3, e3, s2);
      });
    }
    t2 !== this._isFullScreen && function(t3) {
      let e3;
      e3 = t3.fullscreenElement || t3.webkitFullscreenElement ? t3.exitFullscreen || t3.webkitExitFullscreen || t3.mozCancelFullScreen || t3.msExitFullscreen : t3.requestFullScreen || t3.webkitRequestFullScreen || t3.mozRequestFullScreen || t3.msRequestFullscreen, e3 && e3.call(t3);
    }(this._element);
  }
  handleResize() {
    const { innerWidth: t2, innerHeight: e2 } = window, s2 = this._preferredWidth, i2 = this._preferredHeight;
    let h2 = t2, n2 = e2, a2 = 1, r2 = 1;
    if (this._stretchToFit || t2 < s2 || e2 < i2) {
      if (s2 > i2) {
        n2 = h2 * (s2 / i2);
      } else if (s2 < i2) {
        n2 *= i2 / s2;
      }
      h2 = R(G(t2, h2)), n2 = R(G(e2, n2)), a2 = t2 / h2, r2 = e2 / n2, this.setDimensions(h2, n2, false, true);
    } else {
      const o2 = i2 / s2;
      if (h2 = G(s2, t2), n2 = G(e2, R(h2 * o2)), this.setDimensions(s2, i2, false), a2 = r2 = t2 < s2 ? t2 / s2 : 1, this._viewport) {
        const t3 = h2 / a2, e3 = n2 / r2;
        this.setViewport(t3, e3);
      }
    }
    this.scale(a2, r2);
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
    const e2 = this._children.length, s2 = this._viewport;
    let i2;
    if (e2 > 0)
      switch (i2 = this._children[e2 - 1], t2.type) {
        default:
          let h2 = 0, n2 = 0;
          const a2 = t2.changedTouches;
          let r2 = 0, o2 = a2.length;
          if (o2 > 0) {
            let { x: d3, y: l3 } = this.getCoordinate();
            for (s2 && (d3 -= s2.left, l3 -= s2.top), r2 = 0; r2 < o2; ++r2) {
              const s3 = a2[r2], { identifier: o3 } = s3;
              if (h2 = s3.pageX - d3, n2 = s3.pageY - l3, "touchstart" === t2.type) {
                for (; i2; ) {
                  if (!this._activeTouches.includes(i2) && i2.handleInteraction(h2, n2, t2)) {
                    this._activeTouches[o3] = i2;
                    break;
                  }
                  i2 = i2.last;
                }
                i2 = this._children[e2 - 1];
              } else
                i2 = this._activeTouches[o3], (i2 == null ? void 0 : i2.handleInteraction(h2, n2, t2)) && "touchmove" !== t2.type && (this._activeTouches[o3] = null);
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: d2, offsetY: l2 } = t2;
          for (s2 && (d2 += s2.left, l2 += s2.top); i2 && !i2.handleInteraction(d2, l2, t2); )
            i2 = i2.last;
          break;
        case "wheel":
          const { deltaX: c2, deltaY: u2 } = t2, p2 = 20, m2 = 0 === c2 ? 0 : c2 > 0 ? p2 : -p2, _2 = 0 === u2 ? 0 : u2 > 0 ? p2 : -p2;
          this.panViewport(s2.left + m2, s2.top + _2, true);
      }
    this._preventDefaults && (t2.stopPropagation(), t2.preventDefault()), this._animate || this.invalidate();
  }
  render(t2 = 0) {
    this._renderPending = false;
    const e2 = t2 - this._lastRender;
    if (this._animate && e2 / this._renderInterval < 0.999)
      return this._renderId = window.requestAnimationFrame(this._renderHandler), void (this._lastRaf = t2);
    let s2, i2;
    this._aFps = 1e3 / (t2 - this._lastRaf), s2 = this._fps > 60 ? this._fps / this._aFps : 60 === this._fps && this._aFps > 63 ? 1 : 1 / (this._fps / this._aFps), this._lastRaf = t2, this._lastRender = t2 - e2 % this._renderInterval, this._enqueuedSize && this.updateCanvasSize();
    const h2 = this._width, n2 = this._height;
    this._bgColor ? this._renderer.drawRect(0, 0, h2, n2, this._bgColor) : this._renderer.clearRect(0, 0, h2, n2);
    const a2 = "function" == typeof this._updateHandler;
    for (a2 && this._updateHandler(t2, s2), i2 = this._children[0]; i2; )
      a2 || i2.update(t2, s2), i2.draw(this._renderer, this._viewport), i2 = i2.next;
    if (this._renderer.onCommandsReady(), !this._disposed && this._animate && (this._renderPending = true, this._renderId = window.requestAnimationFrame(this._renderHandler)), this.DEBUG && t2 > 2) {
      const e3 = window.performance.now() - t2;
      this.benchmark.minElapsed = G(this.benchmark.minElapsed, e3), this.benchmark.maxElapsed = X(this.benchmark.maxElapsed, e3), this._aFps !== 1 / 0 && (this.benchmark.minFps = G(this.benchmark.minFps, this._aFps), this.benchmark.maxFps = X(this.benchmark.maxFps, this._aFps));
    }
  }
  addListeners() {
    this._eventHandler || (this._eventHandler = new t());
    const e2 = this._eventHandler, s2 = this.handleInteraction.bind(this), i2 = this._element;
    "ontouchstart" in window && ["start", "move", "end", "cancel"].forEach((t2) => {
      e2.add(i2, `touch${t2}`, s2);
    }), ["down", "move"].forEach((t2) => {
      e2.add(i2, `mouse${t2}`, s2);
    }), e2.add(window, "mouseup", s2), this._viewport && e2.add(i2, "wheel", s2), e2.add(window, "resize", this.handleResize.bind(this));
  }
  removeListeners() {
    var _a;
    (_a = this._eventHandler) == null ? void 0 : _a.dispose(), this._eventHandler = void 0;
  }
  updateCanvasSize() {
    var _a;
    const t2 = this._HDPIscaleRatio;
    let e2, s2;
    if (void 0 !== this._enqueuedSize && ({ width: e2, height: s2 } = this._enqueuedSize, this._enqueuedSize = void 0, this._width = e2, this._height = s2), this._viewport) {
      const t3 = this._width, i2 = this._height;
      e2 = G(this._viewport.width, t3), s2 = G(this._viewport.height, i2);
    }
    if (e2 && s2) {
      const i2 = this.getElement();
      this._renderer.setDimensions(e2 * t2, s2 * t2), i2.style.width = `${e2}px`, i2.style.height = `${s2}px`, (_a = this._resizeHandler) == null ? void 0 : _a.call(this, e2, s2);
    }
    this._renderer.scale(t2, t2), this.setSmoothing(this._smoothing), this._coords = void 0;
  }
}
let Y, y, x, L;
const S = (t2, e2) => {
  ({ left: Y, top: y, width: x, height: L } = t2);
  const { left: s2, top: i2, width: h2, height: n2 } = e2;
  return x = Y > s2 ? Math.min(x, h2 - (Y - s2)) : Math.min(h2, x - (s2 - Y)), L = y > i2 ? Math.min(L, n2 - (y - i2)) : Math.min(n2, L - (i2 - y)), { src: { left: Y > s2 ? 0 : s2 - Y, top: y > i2 ? 0 : i2 - y, width: x, height: L }, dest: { left: Y > s2 ? Y - s2 : 0, top: y > i2 ? y - i2 : 0, width: x, height: L } };
}, { min: k, max: H } = Math, F = 180 / Math.PI, z = Math.PI / 180, I = 0.5;
class M {
  constructor({ width: t2, height: e2, resourceId: s2, x: i2 = 0, y: h2 = 0, rotation: n2 = 0, collidable: a2 = false, interactive: r2 = false, mask: o2 = false, sheet: d2 = [], sheetTileWidth: l2 = 0, sheetTileHeight: c2 = 0 } = { width: 64, height: 64 }) {
    if (this.hover = false, this.isDragging = false, this._children = [], this._disposed = false, this._mask = false, this._interactive = false, this._draggable = false, this._keepInBounds = false, this._pressed = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a Sprite without valid dimensions");
    if (this.collidable = a2, this._mask = o2, this._bounds = { left: 0, top: 0, width: t2, height: e2 }, this.setX(i2), this.setY(h2), this.setRotation(n2), this.setInteractive(r2), s2 && this.setResource(s2), Array.isArray(d2) && d2.length > 0) {
      if (!s2)
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
    let s2 = this._children[0];
    for (; s2; )
      s2.isDragging || s2.setX(s2._bounds.left + e2), s2 = s2.next;
  }
  getY() {
    return this._bounds.top;
  }
  setY(t2) {
    const e2 = t2 - this._bounds.top;
    this._bounds.top = this._constraint ? t2 + this._constraint.top : t2;
    let s2 = this._children[0];
    for (; s2; )
      s2.isDragging || s2.setY(s2._bounds.top + e2), s2 = s2.next;
  }
  getWidth() {
    return this._bounds.width;
  }
  setWidth(t2) {
    const e2 = this._bounds.width || 0;
    e2 !== t2 && (this._bounds.width = t2, 0 !== e2 && (this._bounds.left -= t2 * I - e2 * I), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t2) {
    const e2 = this._bounds.height || 0;
    e2 !== t2 && (this._bounds.height = t2, 0 !== e2 && (this._bounds.top -= t2 * I - e2 * I), this.invalidate());
  }
  setBounds(t2, e2, s2, i2) {
    if (this._constraint)
      t2 -= this._constraint.left, e2 -= this._constraint.top;
    else if (!this.canvas)
      throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");
    let h2 = false;
    "number" == typeof s2 && (h2 = this._bounds.width !== s2, this._bounds.width = s2), "number" == typeof i2 && (h2 = h2 || this._bounds.height !== i2, this._bounds.height = i2);
    const n2 = this._bounds.width, a2 = this._bounds.height, r2 = this._constraint ? this._constraint.width : this.canvas.getWidth(), o2 = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const s3 = k(0, -(n2 - r2)), i3 = k(0, -(a2 - o2)), h3 = o2 - a2;
      t2 = k(r2 - n2, H(t2, s3)), e2 = k(h3, H(e2, i3));
    } else
      t2 > r2 && (t2 += n2 * I), e2 > o2 && (e2 += a2 * I);
    this.setX(t2), this.setY(e2), h2 && this.invalidate();
  }
  getBounds() {
    return this._bounds;
  }
  getRotation() {
    return this._rotation * F;
  }
  setRotation(t2, e2) {
    this._rotation = t2 % 360 * z, this._pivot = e2, this.invalidateDrawContext();
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
    let s2 = this._children[0];
    for (; s2; )
      s2.update(t2, e2), s2 = s2.next;
    this._animation && this.updateAnimation(e2);
  }
  draw(t2, e2) {
    const s2 = this._bounds;
    let i2 = !!this._resourceId;
    if (i2 && e2 && (i2 = ((t3, e3) => ({ left: Y, top: y } = t3, Y + t3.width >= e3.left && Y <= e3.right && y + t3.height >= e3.top && y <= e3.bottom))(s2, e2)), i2) {
      const i3 = this._animation;
      let { left: h3, top: n2, width: a2, height: r2 } = s2;
      if (i3) {
        const s3 = i3.tileWidth ? i3.tileWidth : I + a2 << 0, o2 = i3.tileHeight ? i3.tileHeight : I + r2 << 0;
        e2 && (h3 -= e2.left, n2 -= e2.top), t2.drawImageCropped(this._resourceId, i3.col * s3, i3.type.row * o2, s3, o2, h3, n2, a2, r2, this._drawContext);
      } else if (e2) {
        const { src: i4, dest: h4 } = S(s2, e2);
        t2.drawImageCropped(this._resourceId, i4.left, i4.top, i4.width, i4.height, h4.left, h4.top, h4.width, h4.height, this._drawContext);
      } else
        t2.drawImage(this._resourceId, h3, n2, a2, r2, this._drawContext);
    }
    let h2 = this._children[0];
    for (; h2; )
      h2.draw(t2, e2), h2 = h2.next;
  }
  insideBounds(t2, e2) {
    const { left: s2, top: i2, width: h2, height: n2 } = this._bounds;
    return t2 >= s2 && t2 <= s2 + h2 && e2 >= i2 && e2 <= i2 + n2;
  }
  collidesWith(t2) {
    if (t2 === this)
      return false;
    const e2 = this._bounds, s2 = t2.getBounds();
    return !(e2.top + e2.height < s2.top || e2.top > s2.top + s2.height || e2.left + e2.width < s2.left || e2.left > s2.left + s2.width);
  }
  getIntersection(t2) {
    if (this.collidesWith(t2)) {
      const e2 = this._bounds, s2 = t2.getBounds(), i2 = H(e2.left, s2.left), h2 = H(e2.top, s2.top);
      return { left: i2, top: h2, width: k(e2.left + e2.width, s2.width + s2.height) - i2, height: k(e2.top + e2.height, s2.top + s2.height) - h2 };
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
  setResource(t2, e2, s2) {
    this._resourceId = t2, "number" == typeof e2 && this.setWidth(e2), "number" == typeof s2 && this.setHeight(s2), this.invalidate();
  }
  getResourceId() {
    return this._resourceId;
  }
  setSheet(t2, e2, s2) {
    this._sheet = t2, t2 ? (this._animation = { type: null, col: 0, maxCol: 0, fpt: 0, counter: 0, tileWidth: this.getWidth(), tileHeight: this.getHeight() }, "number" == typeof e2 && (this._animation.tileWidth = e2), "number" == typeof s2 && (this._animation.tileHeight = s2), this.switchAnimation(0)) : this._animation = void 0;
  }
  switchAnimation(t2) {
    const e2 = this._animation, s2 = this._sheet[t2];
    e2.type = s2, e2.fpt = s2.fpt, e2.maxCol = s2.col + (s2.amount - 1), e2.col = s2.col, e2.counter = 0, e2.onComplete = s2.onComplete;
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
  setConstraint(t2, e2, s2, i2) {
    return this._constraint = { left: t2, top: e2, width: s2, height: i2 }, this._bounds.left = H(t2, this._bounds.left), this._bounds.top = H(e2, this._bounds.top), this._keepInBounds = true, this.getConstraint();
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
    const s2 = t2.last, i2 = t2.next;
    return s2 && (s2.next = i2), i2 && (i2.last = s2), t2.last = t2.next = void 0, this.invalidate(), t2;
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
  handlePress(t2, e2, s2) {
  }
  handleRelease(t2, e2, s2) {
  }
  handleClick() {
  }
  handleMove(t2, e2, s2) {
    const i2 = this._dragStartOffset.x + (t2 - this._dragStartEventCoordinates.x), h2 = this._dragStartOffset.y + (e2 - this._dragStartEventCoordinates.y);
    this.setBounds(i2, h2, this._bounds.width, this._bounds.height);
  }
  handleInteraction(t2, e2, s2) {
    let i2, h2 = false;
    const n2 = this._children.length;
    if (n2 > 0)
      for (i2 = this._children[n2 - 1]; i2; ) {
        if (h2 = i2.handleInteraction(t2, e2, s2), h2)
          return true;
        i2 = i2.last;
      }
    if (!this._interactive)
      return false;
    const { type: a2 } = s2;
    if (this._pressed && ("touchend" === a2 || "mouseup" === a2))
      return this._pressed = false, this.isDragging && (this.isDragging = false), Date.now() - this._pressTime < 250 && this.handleClick(), this.handleRelease(t2, e2, s2), true;
    if (this.insideBounds(t2, e2)) {
      if (this.hover = true, "touchstart" === a2 || "mousedown" === a2)
        return this._pressTime = Date.now(), this._pressed = true, this._draggable && (this.isDragging = true, this._dragStartOffset = { x: this._bounds.left, y: this._bounds.top }, this._dragStartEventCoordinates = { x: t2, y: e2 }), this.handlePress(t2, e2, s2), "touchstart" === a2 && (s2.stopPropagation(), s2.preventDefault()), true;
    } else
      this.hover = false;
    return !!this.isDragging && (this.handleMove(t2, e2, s2), true);
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
  M as Sprite
};
