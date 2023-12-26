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
async function o(t2) {
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
const r = { loadImage: (e2) => new Promise(async (s2, i2) => {
  let h2;
  if (e2 instanceof File ? h2 = await o(e2) : e2 instanceof Blob && (h2 = e2), void 0 !== h2) {
    try {
      const t2 = await n(h2);
      r.onReady(t2).then(() => s2(d(t2)));
    } catch (t2) {
      i2(t2);
    }
    return;
  }
  const a2 = function(t2) {
    const e3 = t2.substring(0, 5);
    return "data:" === e3 || "blob:" === e3;
  }(e2), l2 = new window.Image(), c2 = new t(), p2 = () => {
    c2.dispose(), i2();
  }, u2 = () => {
    c2.dispose(), r.onReady(l2).then(() => s2(d(l2))).catch(i2);
  };
  var m2;
  a2 || (m2 = l2, function(t2) {
    const { location: e3 } = window;
    return !(!t2.startsWith("./") && !t2.startsWith(`${e3.protocol}//${e3.host}`)) || !/^http[s]?:/.test(t2);
  }(e2) || (m2.crossOrigin = "Anonymous"), c2.add(l2, "load", u2), c2.add(l2, "error", p2)), l2.src = e2, a2 && u2();
}), async loadBitmap(t2) {
  const { image: e2 } = await r.loadImage(t2);
  return h(e2);
}, isReady: (t2) => true === t2.complete && ("number" == typeof t2.naturalWidth && t2.naturalWidth > 0), onReady: (t2) => new Promise((e2, s2) => {
  const i2 = 60;
  let h2 = 0;
  !function n2() {
    r.isReady(t2) ? e2() : ++h2 === i2 ? s2(new Error("Image could not be resolved. This shouldn't occur.")) : window.requestAnimationFrame(n2);
  }();
}) };
function d(t2) {
  const e2 = { image: t2, size: { width: 0, height: 0 } };
  return t2 instanceof window.HTMLImageElement && (e2.size = function(t3) {
    return { width: t3.width || t3.naturalWidth, height: t3.height || t3.naturalHeight };
  }(t2)), e2;
}
function l(t2, e2) {
  e2.font = `${t2.size}${t2.unit} "${t2.font}"`, e2.fillStyle = t2.color;
}
class c {
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
const p = Math.PI / 180, u = 0.5;
let m;
class g {
  constructor(t2, e2 = false) {
    this._debug = e2, this._canvas = t2, this._context = t2.getContext("2d"), this._bitmapCache = new c(void 0, (t3) => {
      t3.close();
    }), this._patternCache = new c();
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
    if (m = this._context, "fill" === n2)
      m.fillStyle = h2, m.fillRect(t2, e2, s2, i2);
    else {
      const n3 = 1;
      m.lineWidth = n3, m.strokeStyle = h2, m.strokeRect(u + (t2 - n3), u + (e2 - n3), s2, i2);
    }
  }
  drawRoundRect(t2, e2, s2, i2, h2, n2, a2) {
    m = this._context, "fill" === a2 ? (m.fillStyle = n2, m.fillRect(t2, e2, s2, i2)) : (m.strokeStyle = n2, m.beginPath(), m.roundRect(t2, e2, s2, i2, h2), m.stroke());
  }
  drawCircle(t2, e2, s2, i2 = "transparent", h2) {
    m = this._context, m.beginPath(), m.arc(t2 + s2, e2 + s2, s2, 0, 2 * Math.PI, false), "transparent" !== i2 && (m.fillStyle = i2, m.fill()), h2 && (m.lineWidth = 5, m.strokeStyle = h2, m.closePath(), m.stroke());
  }
  drawImage(t2, e2, s2, i2, h2, n2) {
    if (!this._bitmapCache.has(t2))
      return;
    const a2 = n2 ? this.prepare(n2, e2, s2, i2, h2) : 0;
    void 0 === i2 ? this._context.drawImage(this._bitmapCache.get(t2), e2, s2) : this._context.drawImage(this._bitmapCache.get(t2), e2, s2, i2, h2), this._debug && this.drawRect(e2, s2, i2, h2, "#FF0000", "stroke"), this.applyReset(a2);
  }
  drawImageCropped(t2, e2, s2, i2, h2, n2, a2, o2, r2, d2) {
    if (!this._bitmapCache.has(t2))
      return;
    if (d2 == null ? void 0 : d2.safeMode) {
      if (o2 <= 0 || r2 <= 0)
        return;
      const n3 = this._bitmapCache.get(t2), a3 = (o2 = Math.min(this._context.canvas.width, o2)) / i2, d3 = (r2 = Math.min(this._context.canvas.height, r2)) / h2;
      e2 + i2 > n3.width && (o2 -= a3 * (e2 + i2 - n3.width), i2 -= e2 + i2 - n3.width), s2 + h2 > n3.height && (r2 -= d3 * (s2 + h2 - n3.height), h2 -= s2 + h2 - n3.height);
    }
    const l2 = d2 ? this.prepare(d2, n2, a2, o2, r2) : 0;
    this._context.drawImage(this._bitmapCache.get(t2), u + e2 << 0, u + s2 << 0, u + i2 << 0, u + h2 << 0, u + n2 << 0, u + a2 << 0, u + o2 << 0, u + r2 << 0), this._debug && this.drawRect(n2, a2, o2, r2, "#FF0000", "stroke"), this.applyReset(l2);
  }
  drawText(t2, e2, s2, i2) {
    const { lines: h2, width: n2, height: a2 } = function(t3, e3) {
      l(t3, e3);
      const s3 = t3.text.split("\n"), i3 = [];
      let h3, n3 = 0, a3 = 0, o3 = e3.measureText("Wq");
      h3 = t3.lineHeight ? t3.lineHeight : o3.actualBoundingBoxAscent + o3.actualBoundingBoxDescent;
      const r2 = o3.actualBoundingBoxAscent;
      let d2 = 0;
      return s3.forEach((s4, l2) => {
        if (d2 = Math.round(r2 + l2 * h3), t3.spacing) {
          const e4 = s4.split("");
          n3 = Math.max(n3, e4.length * t3.spacing);
        } else
          o3 = e3.measureText(s4), n3 = Math.max(n3, o3.actualBoundingBoxRight);
        i3.push({ line: s4, top: d2 }), a3 += h3;
      }), { lines: i3, width: Math.ceil(n3), height: Math.ceil(a3) };
    }(t2, this._context);
    t2.center && (e2 -= n2 * u, s2 -= a2 * u);
    const o2 = i2 ? this.prepare(i2, e2, s2, n2, a2) : 0;
    !function(t3, e3, s3, i3, h3) {
      l(s3, t3);
      const n3 = s3.spacing ?? 1;
      e3.forEach(({ line: e4, top: a3 }) => {
        s3.spacing ? e4.split("").forEach((e5, s4) => {
          t3.fillText(e5, i3 + Math.round(s4 * n3), h3 + a3);
        }) : t3.fillText(e4, i3, h3 + a3);
      });
    }(this._context, h2, t2, e2, s2), this.applyReset(o2);
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
  prepare(t2, e2, s2, i2, h2) {
    var _a, _b;
    const n2 = void 0 !== t2.scale && 1 !== t2.scale, a2 = 0 !== t2.rotation, o2 = void 0 !== t2.alpha, r2 = void 0 !== t2.blendMode, d2 = o2 || r2, l2 = n2 || a2;
    if (d2)
      this.save();
    else if (!l2)
      return 0;
    if (l2) {
      const n3 = t2.scale ?? 1, a3 = ((_a = t2.pivot) == null ? void 0 : _a.x) ?? e2 + i2 * u, o3 = ((_b = t2.pivot) == null ? void 0 : _b.y) ?? s2 + h2 * u, r3 = t2.rotation * p, d3 = Math.cos(r3) * n3, l3 = Math.sin(r3) * n3;
      this._context.setTransform(d3, l3, -l3, d3, a3 - a3 * d3 + o3 * l3, o3 - a3 * l3 - o3 * d3);
    }
    return r2 && this.setBlendMode(t2.blendMode), o2 && this.setAlpha(t2.alpha), d2 ? 1 : 2;
  }
  applyReset(t2) {
    2 === t2 ? this._context.resetTransform() : 1 === t2 && this.restore();
  }
}
const _ = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIHQodCxlKXtlLmZvbnQ9YCR7dC5zaXplfSR7dC51bml0fSAiJHt0LmZvbnR9ImAsZS5maWxsU3R5bGU9dC5jb2xvcn1jbGFzcyBle2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5faW5kZXg9MCx0aGlzLl9tYXA9bmV3IE1hcCx0aGlzLl9jcmVhdGVGbj10LHRoaXMuX2Rlc3Ryb3lGbj1lfWRpc3Bvc2UoKXtjb25zdCB0PVsuLi50aGlzLl9tYXBdLm1hcCgoKFt0XSk9PnQpKTtmb3IoO3QubGVuZ3RoPjA7KXRoaXMucmVtb3ZlKHQuc2hpZnQoKSk7dGhpcy5fbWFwPXZvaWQgMH1nZXQodCl7cmV0dXJuIHRoaXMuX21hcC5nZXQodCl9c2V0KHQsZSl7aWYodGhpcy5oYXModCkpe2lmKHRoaXMuZ2V0KHQpPT09ZSlyZXR1cm47dGhpcy5yZW1vdmUodCl9dGhpcy5fbWFwLnNldCh0LGUpfWhhcyh0KXtyZXR1cm4gdGhpcy5fbWFwLmhhcyh0KX1yZW1vdmUodCl7dmFyIGU7aWYoIXRoaXMuaGFzKHQpKXJldHVybiExO2NvbnN0IHM9dGhpcy5nZXQodCk7cmV0dXJuIG51bGw9PShlPXRoaXMuX2Rlc3Ryb3lGbil8fGUuY2FsbCh0aGlzLHMpLHRoaXMuX21hcC5kZWxldGUodCl9bmV4dCgpe2xldCB0O2NvbnN0IGU9dGhpcy5faW5kZXgudG9TdHJpbmcoKTtyZXR1cm4gdGhpcy5oYXMoZSk/dD10aGlzLmdldChlKTp0aGlzLl9jcmVhdGVGbiYmKHQ9dGhpcy5fY3JlYXRlRm4oKSx0aGlzLnNldChlLHQpKSwrK3RoaXMuX2luZGV4LHR9ZmlsbCh0KXtjb25zdCBlPXRoaXMuX2luZGV4O2ZvcihsZXQgcz0wO3M8dDsrK3MpdGhpcy5uZXh0KCk7dGhpcy5faW5kZXg9ZX1yZXNldCgpe3RoaXMuX2luZGV4PTB9fWNvbnN0IHM9TWF0aC5QSS8xODAsYT0uNTtsZXQgaSxuLG87Y2xhc3MgaHtjb25zdHJ1Y3Rvcih0LHM9ITEpe3RoaXMuX2RlYnVnPXMsdGhpcy5fY2FudmFzPXQsdGhpcy5fY29udGV4dD10LmdldENvbnRleHQoIjJkIiksdGhpcy5fYml0bWFwQ2FjaGU9bmV3IGUodm9pZCAwLCh0PT57dC5jbG9zZSgpfSkpLHRoaXMuX3BhdHRlcm5DYWNoZT1uZXcgZX1kaXNwb3NlKCl7dGhpcy5fYml0bWFwQ2FjaGUuZGlzcG9zZSgpLHRoaXMuX3BhdHRlcm5DYWNoZS5kaXNwb3NlKCksdGhpcy5fY2FudmFzPXZvaWQgMH1jYWNoZVJlc291cmNlKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuc2V0KHQsZSl9Z2V0UmVzb3VyY2UodCl7cmV0dXJuIHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KX1kaXNwb3NlUmVzb3VyY2UodCl7dGhpcy5fYml0bWFwQ2FjaGUucmVtb3ZlKHQpfXNldERpbWVuc2lvbnModCxlKXt0aGlzLl9jYW52YXMud2lkdGg9dCx0aGlzLl9jYW52YXMuaGVpZ2h0PWV9c2V0U21vb3RoaW5nKHQpe2NvbnN0IGU9dGhpcy5fY29udGV4dDtbImltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm1vekltYWdlU21vb3RoaW5nRW5hYmxlZCIsIm9JbWFnZVNtb290aGluZ0VuYWJsZWQiLCJ3ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQiXS5mb3JFYWNoKChzPT57dm9pZCAwIT09ZVtzXSYmKGVbc109dCl9KSl9c2F2ZSgpe3RoaXMuX2NvbnRleHQuc2F2ZSgpfXJlc3RvcmUoKXt0aGlzLl9jb250ZXh0LnJlc3RvcmUoKX10cmFuc2xhdGUodCxlKXt0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSh0LGUpfXJvdGF0ZSh0KXt0aGlzLl9jb250ZXh0LnJvdGF0ZSh0KX10cmFuc2Zvcm0odCxlLHMsYSxpLG4pe3RoaXMuX2NvbnRleHQudHJhbnNmb3JtKHQsZSxzLGEsaSxuKX1zY2FsZSh0LGU9dCl7dGhpcy5fY29udGV4dC5zY2FsZSh0LGUpfXNldEJsZW5kTW9kZSh0KXt0aGlzLl9jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj10fXNldEFscGhhKHQpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGE9dH1jbGVhclJlY3QodCxlLHMsYSl7dGhpcy5fY29udGV4dC5jbGVhclJlY3QodCxlLHMsYSl9ZHJhd1JlY3QodCxlLHMsbixvLGg9ImZpbGwiKXtpZihpPXRoaXMuX2NvbnRleHQsImZpbGwiPT09aClpLmZpbGxTdHlsZT1vLGkuZmlsbFJlY3QodCxlLHMsbik7ZWxzZXtjb25zdCBoPTE7aS5saW5lV2lkdGg9aCxpLnN0cm9rZVN0eWxlPW8saS5zdHJva2VSZWN0KGErKHQtaCksYSsoZS1oKSxzLG4pfX1kcmF3Um91bmRSZWN0KHQsZSxzLGEsbixvLGgpe2k9dGhpcy5fY29udGV4dCwiZmlsbCI9PT1oPyhpLmZpbGxTdHlsZT1vLGkuZmlsbFJlY3QodCxlLHMsYSkpOihpLnN0cm9rZVN0eWxlPW8saS5iZWdpblBhdGgoKSxpLnJvdW5kUmVjdCh0LGUscyxhLG4pLGkuc3Ryb2tlKCkpfWRyYXdDaXJjbGUodCxlLHMsYT0idHJhbnNwYXJlbnQiLG4pe2k9dGhpcy5fY29udGV4dCxpLmJlZ2luUGF0aCgpLGkuYXJjKHQrcyxlK3MscywwLDIqTWF0aC5QSSwhMSksInRyYW5zcGFyZW50IiE9PWEmJihpLmZpbGxTdHlsZT1hLGkuZmlsbCgpKSxuJiYoaS5saW5lV2lkdGg9NSxpLnN0cm9rZVN0eWxlPW4saS5jbG9zZVBhdGgoKSxpLnN0cm9rZSgpKX1kcmF3SW1hZ2UodCxlLHMsYSxpLG4pe2lmKCF0aGlzLl9iaXRtYXBDYWNoZS5oYXModCkpcmV0dXJuO2NvbnN0IG89bj90aGlzLnByZXBhcmUobixlLHMsYSxpKTowO3ZvaWQgMD09PWE/dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGUscyk6dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGUscyxhLGkpLHRoaXMuX2RlYnVnJiZ0aGlzLmRyYXdSZWN0KGUscyxhLGksIiNGRjAwMDAiLCJzdHJva2UiKSx0aGlzLmFwcGx5UmVzZXQobyl9ZHJhd0ltYWdlQ3JvcHBlZCh0LGUscyxpLG4sbyxoLHIsYyxsKXtpZighdGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpKXJldHVybjtpZihudWxsPT1sP3ZvaWQgMDpsLnNhZmVNb2RlKXtpZihyPD0wfHxjPD0wKXJldHVybjtjb25zdCBhPXRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxvPShyPU1hdGgubWluKHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLHIpKS9pLGg9KGM9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0LGMpKS9uO2UraT5hLndpZHRoJiYoci09byooZStpLWEud2lkdGgpLGktPWUraS1hLndpZHRoKSxzK24+YS5oZWlnaHQmJihjLT1oKihzK24tYS5oZWlnaHQpLG4tPXMrbi1hLmhlaWdodCl9Y29uc3QgZD1sP3RoaXMucHJlcGFyZShsLG8saCxyLGMpOjA7dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGErZTw8MCxhK3M8PDAsYStpPDwwLGErbjw8MCxhK288PDAsYStoPDwwLGErcjw8MCxhK2M8PDApLHRoaXMuX2RlYnVnJiZ0aGlzLmRyYXdSZWN0KG8saCxyLGMsIiNGRjAwMDAiLCJzdHJva2UiKSx0aGlzLmFwcGx5UmVzZXQoZCl9ZHJhd1RleHQoZSxzLGksbil7Y29uc3R7bGluZXM6byx3aWR0aDpoLGhlaWdodDpyfT1mdW5jdGlvbihlLHMpe3QoZSxzKTtjb25zdCBhPWUudGV4dC5zcGxpdCgiXG4iKSxpPVtdO2xldCBuLG89MCxoPTAscj1zLm1lYXN1cmVUZXh0KCJXcSIpO249ZS5saW5lSGVpZ2h0P2UubGluZUhlaWdodDpyLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50K3IuYWN0dWFsQm91bmRpbmdCb3hEZXNjZW50O2NvbnN0IGM9ci5hY3R1YWxCb3VuZGluZ0JveEFzY2VudDtsZXQgbD0wO3JldHVybiBhLmZvckVhY2goKCh0LGEpPT57aWYobD1NYXRoLnJvdW5kKGMrYSpuKSxlLnNwYWNpbmcpe2NvbnN0IHM9dC5zcGxpdCgiIik7bz1NYXRoLm1heChvLHMubGVuZ3RoKmUuc3BhY2luZyl9ZWxzZSByPXMubWVhc3VyZVRleHQodCksbz1NYXRoLm1heChvLHIuYWN0dWFsQm91bmRpbmdCb3hSaWdodCk7aS5wdXNoKHtsaW5lOnQsdG9wOmx9KSxoKz1ufSkpLHtsaW5lczppLHdpZHRoOk1hdGguY2VpbChvKSxoZWlnaHQ6TWF0aC5jZWlsKGgpfX0oZSx0aGlzLl9jb250ZXh0KTtlLmNlbnRlciYmKHMtPWgqYSxpLT1yKmEpO2NvbnN0IGM9bj90aGlzLnByZXBhcmUobixzLGksaCxyKTowOyFmdW5jdGlvbihlLHMsYSxpLG4pe3QoYSxlKTtjb25zdCBvPWEuc3BhY2luZz8/MTtzLmZvckVhY2goKCh7bGluZTp0LHRvcDpzfSk9PnthLnNwYWNpbmc/dC5zcGxpdCgiIikuZm9yRWFjaCgoKHQsYSk9PntlLmZpbGxUZXh0KHQsaStNYXRoLnJvdW5kKGEqbyksbitzKX0pKTplLmZpbGxUZXh0KHQsaSxuK3MpfSkpfSh0aGlzLl9jb250ZXh0LG8sZSxzLGkpLHRoaXMuYXBwbHlSZXNldChjKX1jcmVhdGVQYXR0ZXJuKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpJiZ0aGlzLl9wYXR0ZXJuQ2FjaGUuc2V0KHQsdGhpcy5fY29udGV4dC5jcmVhdGVQYXR0ZXJuKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlKSl9ZHJhd1BhdHRlcm4odCxlLHMsYSxpKXtpZighdGhpcy5fcGF0dGVybkNhY2hlLmhhcyh0KSlyZXR1cm47Y29uc3Qgbj10aGlzLl9wYXR0ZXJuQ2FjaGUuZ2V0KHQpO3RoaXMuX2NvbnRleHQuZmlsbFN0eWxlPW4sdGhpcy5fY29udGV4dC5maWxsUmVjdChlLHMsYSxpKX1wcmVwYXJlKHQsZSxpLG4sbyl7dmFyIGgscjtjb25zdCBjPXZvaWQgMCE9PXQuc2NhbGUmJjEhPT10LnNjYWxlLGw9MCE9PXQucm90YXRpb24sZD12b2lkIDAhPT10LmFscGhhLHA9dm9pZCAwIT09dC5ibGVuZE1vZGUsZz1kfHxwLG09Y3x8bDtpZihnKXRoaXMuc2F2ZSgpO2Vsc2UgaWYoIW0pcmV0dXJuIDA7aWYobSl7Y29uc3QgYz10LnNjYWxlPz8xLGw9KG51bGw9PShoPXQucGl2b3QpP3ZvaWQgMDpoLngpPz9lK24qYSxkPShudWxsPT0ocj10LnBpdm90KT92b2lkIDA6ci55KT8/aStvKmEscD10LnJvdGF0aW9uKnMsZz1NYXRoLmNvcyhwKSpjLG09TWF0aC5zaW4ocCkqYzt0aGlzLl9jb250ZXh0LnNldFRyYW5zZm9ybShnLG0sLW0sZyxsLWwqZytkKm0sZC1sKm0tZCpnKX1yZXR1cm4gcCYmdGhpcy5zZXRCbGVuZE1vZGUodC5ibGVuZE1vZGUpLGQmJnRoaXMuc2V0QWxwaGEodC5hbHBoYSksZz8xOjJ9YXBwbHlSZXNldCh0KXsyPT09dD90aGlzLl9jb250ZXh0LnJlc2V0VHJhbnNmb3JtKCk6MT09PXQmJnRoaXMucmVzdG9yZSgpfX1vbm1lc3NhZ2U9dD0+e3N3aXRjaCh0LmRhdGEuY21kKXtkZWZhdWx0OmJyZWFrO2Nhc2UiaW5pdCI6bz10LmRhdGEuY2FudmFzLG49bmV3IGgobyx0LmRhdGEuZGVidWcpO2JyZWFrO2Nhc2UibG9hZFJlc291cmNlIjohYXN5bmMgZnVuY3Rpb24odCxlKXt0cnl7bGV0IHM7aWYoZSBpbnN0YW5jZW9mIEZpbGUpe2NvbnN0IHQ9YXdhaXQgYXN5bmMgZnVuY3Rpb24odCl7Y29uc3QgZT1uZXcgRmlsZVJlYWRlcjtyZXR1cm4gbmV3IFByb21pc2UoKChzLGEpPT57ZS5vbmxvYWQ9ZT0+e3ZhciBpO2lmKCEobnVsbD09KGk9bnVsbD09ZT92b2lkIDA6ZS50YXJnZXQpP3ZvaWQgMDppLnJlc3VsdCkpcmV0dXJuIGEoKTtzKG5ldyBCbG9iKFtlLnRhcmdldC5yZXN1bHRdLHt0eXBlOnQudHlwZX0pKX0sZS5vbmVycm9yPXQ9PmEodCksZS5yZWFkQXNBcnJheUJ1ZmZlcih0KX0pKX0oZSk7cz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcCh0KX1lbHNlIGlmKGUgaW5zdGFuY2VvZiBCbG9iKXM9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoZSk7ZWxzZSBpZigic3RyaW5nIj09dHlwZW9mIGUpe2NvbnN0IHQ9YXdhaXQgZmV0Y2goZSksYT1hd2FpdCB0LmJsb2IoKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKGEpfWVsc2UgZSBpbnN0YW5jZW9mIEltYWdlQml0bWFwJiYocz1lKTtudWxsPT1ufHxuLmNhY2hlUmVzb3VyY2UodCxzKSxwb3N0TWVzc2FnZSh7Y21kOiJvbmxvYWQiLGlkOnQsc2l6ZTp7d2lkdGg6cy53aWR0aCxoZWlnaHQ6cy5oZWlnaHR9fSl9Y2F0Y2gocyl7cG9zdE1lc3NhZ2Uoe2NtZDoib25lcnJvciIsaWQ6dCxlcnJvcjoobnVsbD09cz92b2lkIDA6cy5tZXNzYWdlKT8/c30pfX0odC5kYXRhLmlkLHQuZGF0YS5zb3VyY2UpO2JyZWFrO2Nhc2UiZ2V0UmVzb3VyY2UiOmNvbnN0IGU9bnVsbD09bj92b2lkIDA6bi5nZXRSZXNvdXJjZSh0LmRhdGEuaWQpO3Bvc3RNZXNzYWdlKHtjbWQ6Im9ucmVzb3VyY2UiLGlkOnQuZGF0YS5pZCxiaXRtYXA6ZX0pO2JyZWFrO2Nhc2UiZGlzcG9zZVJlc291cmNlIjpudWxsPT1ufHxuLmRpc3Bvc2VSZXNvdXJjZSguLi50LmRhdGEuYXJncyk7YnJlYWs7Y2FzZSJkaXNwb3NlIjpudWxsPT1ufHxuLmRpc3Bvc2UoKSxvPXZvaWQgMCxuPXZvaWQgMDticmVhaztjYXNlInJlbmRlciI6aWYoIW58fCF0LmRhdGEuY29tbWFuZHMpcmV0dXJuO2Zvcihjb25zdCBzIG9mIHQuZGF0YS5jb21tYW5kcyl7Y29uc3QgdD1zLnNoaWZ0KCk7blt0XSguLi5zKX1wb3N0TWVzc2FnZSh7Y21kOiJvbnJlbmRlciJ9KTticmVhaztjYXNlInNldERpbWVuc2lvbnMiOmNhc2Uic2V0U21vb3RoaW5nIjpjYXNlImNyZWF0ZVBhdHRlcm4iOm5bdC5kYXRhLmNtZF0oLi4udC5kYXRhLmFyZ3MpfX19KCk7Cg==", b = "undefined" != typeof window && window.Blob && new Blob([atob(_)], { type: "text/javascript;charset=utf-8" });
function w() {
  let t2;
  try {
    if (t2 = b && (window.URL || window.webkitURL).createObjectURL(b), !t2)
      throw "";
    return new Worker(t2);
  } catch (t3) {
    return new Worker("data:application/javascript;base64," + _);
  } finally {
    t2 && (window.URL || window.webkitURL).revokeObjectURL(t2);
  }
}
class f {
  constructor(t2, e2 = false, s2 = false) {
    if (this._useWorker = false, this._element = t2, e2 && "function" == typeof this._element.transferControlToOffscreen) {
      this._useWorker = true, this._callbacks = /* @__PURE__ */ new Map(), this._pool = new c(() => [], (t3) => {
        t3.length = 0;
      }), this._pool.fill(1e3), this._commands = [];
      const e3 = t2.transferControlToOffscreen();
      this._worker = new w(), this._worker.postMessage({ cmd: "init", canvas: e3, debug: s2 }, [e3]), this._worker.onmessage = this.handleMessage.bind(this);
    } else
      this._renderer = new g(this._element, s2);
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
            const h2 = await o(e2);
            this.wrappedLoad(t2, h2, s2, i2);
          }
        else
          e2 instanceof Blob ? this._useWorker ? this.wrappedWorkerLoad(t2, e2, s2, i2) : this.wrappedLoad(t2, e2, s2, i2) : i2("Unsupported resource type: " + typeof e2);
      } else if (e2 = e2.startsWith("./") ? new URL(e2, document.baseURI).href : e2, this._useWorker)
        this.wrappedWorkerLoad(t2, e2, s2, i2);
      else {
        const h2 = await r.loadImage(e2);
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
  drawImageCropped(t2, e2, s2, i2, h2, n2, a2, o2, r2, d2) {
    this.onDraw("drawImageCropped", t2, e2, s2, i2, h2, n2, a2, o2, r2, d2);
  }
  drawText(t2, e2, s2, i2) {
    this.onDraw("drawText", t2, e2, s2, i2);
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
const v = { x: 0, y: 0 };
function Z(t2, e2, s2, i2, h2) {
  return (t2 - e2) / (s2 - e2) * (h2 - i2) + i2;
}
let G, X, C, W;
function R(t2, e2) {
  ({ left: G, top: X, width: C, height: W } = t2);
  const { left: s2, top: i2, width: h2, height: n2 } = e2;
  return C = G > s2 ? Math.min(C, h2 - (G - s2)) : Math.min(h2, C - (s2 - G)), W = X > i2 ? Math.min(W, n2 - (X - i2)) : Math.min(n2, W - (i2 - X)), { src: { left: G > s2 ? 0 : s2 - G, top: X > i2 ? 0 : i2 - X, width: C, height: W }, dest: { left: G > s2 ? G - s2 : 0, top: X > i2 ? X - i2 : 0, width: C, height: W } };
}
const x = (t2) => t2 > 0 ? t2 + 0.5 << 0 : 0 | t2, y = [], L = [], Y = s(1, 1, true).cvs;
class S {
  constructor(t2) {
    this._renderer = t2, this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  getChildrenUnderPoint(t2, e2, s2, i2, h2, n2 = false) {
    const a2 = [];
    let o2, r2, d2, l2, c2, p2 = t2.length;
    for (; p2--; )
      o2 = t2[p2], r2 = o2.getX(), d2 = o2.getY(), l2 = o2.getWidth(), c2 = o2.getHeight(), r2 < e2 + i2 && r2 + l2 > e2 && d2 < s2 + h2 && d2 + c2 > s2 && (!n2 || n2 && o2.collidable) && a2.push(o2);
    return a2;
  }
  pixelCollision(t2, e2, s2 = false) {
    const i2 = t2.getIntersection(e2);
    if (void 0 === i2)
      return false;
    this.getPixelArray(t2, i2, y), this.getPixelArray(e2, i2, L);
    const h2 = i2.width, n2 = i2.height;
    let a2 = 0;
    for (let t3 = 0; t3 < n2; ++t3)
      for (let e3 = 0; e3 < h2; ++e3) {
        if (1 === y[a2] && 1 === L[a2])
          return !s2 || { x: e3, y: t3 };
        ++a2;
      }
    return false;
  }
  async cache(t2) {
    const e2 = await this._renderer.getResource(t2);
    if (!e2)
      return false;
    const { width: s2, height: i2 } = e2;
    !function(t3, e3, s3, i3) {
      a(t3, e3, s3, i3);
    }(Y, e2, s2, i2);
    const { data: h2 } = Y.getContext("2d").getImageData(0, 0, s2, i2), n2 = new Uint8Array(h2.length / 4);
    for (let t3 = 0, e3 = n2.length; t3 < e3; ++t3) {
      const e4 = h2[4 * t3 + 3];
      n2[t3] = e4 < 5 ? 0 : 1;
    }
    return this._cacheMap.set(t2, { mask: n2, size: { width: s2, height: i2 } }), Y.width = Y.height = 1, true;
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
    const h2 = t2.getBounds(), n2 = x(e2.left - h2.left), a2 = x(e2.top - h2.top), o2 = x(e2.width), r2 = x(e2.height), { mask: d2, size: l2 } = this._cacheMap.get(i2);
    if (0 === o2 || 0 === r2)
      return void (s2.length = 0);
    s2.length = x(o2 * r2);
    const c2 = l2.height, p2 = l2.width, u2 = n2 + o2, m2 = a2 + r2;
    let g2 = -1, _2 = 0;
    for (let t3 = a2; t3 < m2; ++t3)
      for (let e3 = n2; e3 < u2; ++e3)
        _2 = e3 >= p2 || t3 >= c2 ? 0 : d2[t3 * p2 + e3], s2[++g2] = _2;
  }
}
class k {
  constructor() {
    this._children = [], this._disposed = false;
  }
  addChild(t2) {
    if (this.contains(t2))
      return this;
    const e2 = this._children.length;
    return e2 > 0 && (t2.last = this._children[e2 - 1], t2.last.next = t2), t2.next = void 0, t2.setParent(this), this._children.push(t2), this.invalidate(), this;
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
    return t2.getParent() === this;
  }
  invalidate() {
  }
  dispose() {
    this._disposed = true, this._parent && this._parent.removeChild(this);
    let t2 = this._children.length;
    for (; t2--; ) {
      const e2 = this._children[t2];
      e2.dispose(), e2.next = void 0, e2.last = void 0;
    }
    this._children = [];
  }
}
const { min: H, max: F } = Math;
class M extends k {
  constructor({ width: t2 = 300, height: e2 = 300, fps: s2 = 60, backgroundColor: i2 = null, animate: h2 = false, smoothing: n2 = true, stretchToFit: a2 = false, viewport: o2 = null, preventEventBubbling: r2 = false, parentElement: d2 = null, debug: l2 = false, optimize: c2 = "auto", viewportHandler: p2, onUpdate: u2, onResize: m2 } = {}) {
    if (super(), this.DEBUG = false, this.benchmark = { minElapsed: 1 / 0, maxElapsed: -1 / 0, minFps: 1 / 0, maxFps: -1 / 0 }, this.bbox = { left: 0, top: 0, right: 0, bottom: 0 }, this._smoothing = false, this._stretchToFit = false, this._HDPIscaleRatio = 1, this._preventDefaults = false, this._lastRender = 0, this._renderId = 0, this._renderPending = false, this._disposed = false, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._animate = false, this._hasFsHandler = false, this._isFullScreen = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = l2;
    const { userAgent: g2 } = navigator, _2 = g2.includes("Safari") && !g2.includes("Chrome"), b2 = ["auto", "worker"].includes(c2) && !_2;
    this._element = document.createElement("canvas"), this._renderer = new f(this._element, b2, l2), this.collision = new S(this._renderer), this._updateHandler = u2, this._renderHandler = this.render.bind(this), this._viewportHandler = p2, this._resizeHandler = m2, this.setFrameRate(s2), this.setAnimatable(h2), i2 && this.setBackgroundColor(i2), this._HDPIscaleRatio = window.devicePixelRatio || 1, this.setDimensions(t2, e2, true, true), o2 && this.setViewport(o2.width, o2.height), this._stretchToFit = a2, this.setSmoothing(n2), this.preventEventBubbling(r2), this.addListeners(), d2 instanceof HTMLElement && this.insertInPage(d2), this.handleResize();
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
    return t2.setCanvas(this), super.addChild(t2);
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
    this._viewport || (this._viewport = { width: t2, height: e2, left: 0, top: 0, right: t2, bottom: e2 });
    const s2 = this._viewport;
    s2.width = t2, s2.height = e2, this.panViewport(Math.min(s2.left, t2), Math.min(s2.top, e2));
  }
  panViewport(t2, e2, s2 = false) {
    var _a;
    const i2 = this._viewport;
    i2.left = F(0, H(t2, this._width - i2.width)), i2.right = i2.left + i2.width, i2.top = F(0, H(e2, this._height - i2.height)), i2.bottom = i2.top + i2.height, this.invalidate(), s2 && ((_a = this._viewportHandler) == null ? void 0 : _a.call(this, { type: "panned", value: i2 }));
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
    if (e2 || (e2 = this._stretchToFit), !this._hasFsHandler) {
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
  getCoordinate() {
    return void 0 === this._coords && (this._coords = this._element.getBoundingClientRect()), this._coords;
  }
  dispose() {
    this._disposed || (this._animate = false, window.cancelAnimationFrame(this._renderId), this.removeListeners(), super.dispose(), this._element.parentNode && this._element.parentNode.removeChild(this._element), requestAnimationFrame(() => {
      this._renderer.dispose(), this._renderer = void 0, this.collision.dispose(), this.collision = void 0;
    }), this._disposed = true);
  }
  handleInteraction(t2) {
    const e2 = this._children.length, s2 = this._viewport;
    let i2;
    if (e2 > 0)
      switch (i2 = this._children[e2 - 1], t2.type) {
        default:
          let h2 = 0, n2 = 0;
          const a2 = t2.changedTouches;
          let o2 = 0, r2 = a2.length;
          if (r2 > 0) {
            let { x: d3, y: l3 } = this.getCoordinate();
            for (s2 && (d3 -= s2.left, l3 -= s2.top), o2 = 0; o2 < r2; ++o2) {
              const s3 = a2[o2], { identifier: r3 } = s3;
              if (h2 = s3.pageX - d3, n2 = s3.pageY - l3, "touchstart" === t2.type) {
                for (; i2; ) {
                  if (!this._activeTouches.includes(i2) && i2.handleInteraction(h2, n2, t2)) {
                    this._activeTouches[r3] = i2;
                    break;
                  }
                  i2 = i2.last;
                }
                i2 = this._children[e2 - 1];
              } else
                i2 = this._activeTouches[r3], (i2 == null ? void 0 : i2.handleInteraction(h2, n2, t2)) && "touchmove" !== t2.type && (this._activeTouches[r3] = null);
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: d2, offsetY: l2 } = t2;
          if (this._isFullScreen) {
            const e3 = function(t3, e4, s3, i3, h3) {
              const n3 = window.innerHeight / h3, a3 = 0.5 * (window.innerWidth - i3 * n3);
              return v.x = Z(t3.clientX - s3.left - a3, 0, i3 * n3, 0, e4.width), v.y = Z(t3.clientY - s3.top, 0, h3 * n3, 0, e4.height), v;
            }(t2, this._element, this.getCoordinate(), this._width, this._height);
            d2 = e3.x, l2 = e3.y;
          }
          for (s2 && (d2 += s2.left, l2 += s2.top); i2 && !i2.handleInteraction(d2, l2, t2); )
            i2 = i2.last;
          break;
        case "wheel":
          const { deltaX: c2, deltaY: p2 } = t2, u2 = 20, m2 = 0 === c2 ? 0 : c2 > 0 ? u2 : -u2, g2 = 0 === p2 ? 0 : p2 > 0 ? u2 : -u2;
          this.panViewport(s2.left + m2, s2.top + g2, true);
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
      this.benchmark.minElapsed = H(this.benchmark.minElapsed, e3), this.benchmark.maxElapsed = F(this.benchmark.maxElapsed, e3), this._aFps !== 1 / 0 && (this.benchmark.minFps = H(this.benchmark.minFps, this._aFps), this.benchmark.maxFps = F(this.benchmark.maxFps, this._aFps));
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
  handleResize() {
    const { innerWidth: t2, innerHeight: e2 } = window;
    let s2 = this._preferredWidth, i2 = this._preferredHeight, h2 = 1;
    if (!this._viewport && (this._stretchToFit || t2 < s2 || e2 < i2)) {
      const { width: n2, height: a2 } = function(t3, e3, s3, i3) {
        const h3 = s3 / i3;
        let n3 = t3, a3 = e3;
        return t3 / e3 > h3 ? a3 = t3 / h3 : n3 = e3 * h3, { width: n3, height: a3 };
      }(s2, i2, t2, e2);
      h2 = t2 / n2, this.setDimensions(n2, a2, false, true);
    } else
      H(s2, t2), this.setDimensions(s2, i2, false);
    this.scale(h2);
  }
  updateCanvasSize() {
    var _a;
    const t2 = this._HDPIscaleRatio;
    let e2, s2;
    if (void 0 !== this._enqueuedSize && ({ width: e2, height: s2 } = this._enqueuedSize, this._enqueuedSize = void 0, this._width = e2, this._height = s2, this.bbox.right = e2, this.bbox.bottom = s2), this._viewport) {
      const t3 = this._width, i2 = this._height;
      e2 = H(this._viewport.width, t3), s2 = H(this._viewport.height, i2);
    }
    if (e2 && s2) {
      const i2 = this.getElement();
      this._renderer.setDimensions(e2 * t2, s2 * t2), i2.style.width = `${e2}px`, i2.style.height = `${s2}px`, (_a = this._resizeHandler) == null ? void 0 : _a.call(this, e2, s2);
    }
    this._renderer.scale(t2, t2), this.setSmoothing(this._smoothing), this._coords = void 0;
  }
}
const { min: z, max: K } = Math, I = 0.5;
class V extends k {
  constructor({ width: t2, height: e2, resourceId: s2, x: i2 = 0, y: h2 = 0, rotation: n2 = 0, collidable: a2 = false, interactive: o2 = false, mask: r2 = false, sheet: d2 = [], sheetTileWidth: l2 = 0, sheetTileHeight: c2 = 0 } = { width: 64, height: 64 }) {
    if (super(), this.hover = false, this.isDragging = false, this._mask = false, this._interactive = false, this._draggable = false, this._keepInBounds = false, this._pressed = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a Sprite without valid dimensions");
    if (this.collidable = a2, this._mask = r2, this._scale = 1, this._bounds = { left: 0, top: 0, width: t2, height: e2 }, this.setX(i2), this.setY(h2), this.setRotation(n2), this.setInteractive(o2), s2 && this.setResource(s2), Array.isArray(d2) && d2.length > 0) {
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
    const n2 = this._bounds.width, a2 = this._bounds.height, o2 = this._constraint ? this._constraint.width : this.canvas.getWidth(), r2 = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const s3 = z(0, -(n2 - o2)), i3 = z(0, -(a2 - r2)), h3 = r2 - a2;
      t2 = z(o2 - n2, K(t2, s3)), e2 = z(h3, K(e2, i3));
    } else
      t2 > o2 && (t2 += n2 * I), e2 > r2 && (e2 += a2 * I);
    this.setX(t2), this.setY(e2), h2 && this.invalidate();
  }
  getBounds() {
    return this._bounds;
  }
  getDrawProps() {
    return this._drawProps || this.invalidateDrawProps(true), this._drawProps;
  }
  getRotation() {
    return this._rotation;
  }
  setRotation(t2, e2) {
    this._rotation = t2 % 360, this._pivot = e2, this.invalidateDrawProps();
  }
  setScale(t2) {
    this._scale = t2, this.invalidateDrawProps();
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
  isVisible(t2) {
    return e2 = this._bounds, s2 = t2 || this.canvas.bbox, { left: G, top: X } = e2, G + e2.width >= s2.left && G <= s2.right && X + e2.height >= s2.top && X <= s2.bottom;
    var e2, s2;
  }
  draw(t2, e2) {
    const s2 = this._bounds;
    if (!!this._resourceId && this.isVisible(e2)) {
      const i3 = this._animation;
      let { left: h2, top: n2, width: a2, height: o2 } = s2;
      if (i3) {
        const s3 = i3.tileWidth ? i3.tileWidth : I + a2 << 0, r2 = i3.tileHeight ? i3.tileHeight : I + o2 << 0;
        e2 && (h2 -= e2.left, n2 -= e2.top), t2.drawImageCropped(this._resourceId, i3.col * s3, i3.type.row * r2, s3, r2, h2, n2, a2, o2, this._drawProps);
      } else if (e2) {
        const { src: i4, dest: h3 } = R(s2, e2);
        t2.drawImageCropped(this._resourceId, i4.left, i4.top, i4.width, i4.height, h3.left, h3.top, h3.width, h3.height, this._drawProps);
      } else
        t2.drawImage(this._resourceId, h2, n2, a2, o2, this._drawProps);
    }
    let i2 = this._children[0];
    for (; i2; )
      i2.draw(t2, e2), i2 = i2.next;
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
      const e2 = this._bounds, s2 = t2.getBounds(), i2 = K(e2.left, s2.left), h2 = K(e2.top, s2.top);
      return { left: i2, top: h2, width: z(e2.left + e2.width, s2.width + s2.height) - i2, height: z(e2.top + e2.height, s2.top + s2.height) - h2 };
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
    return this._constraint = { left: t2, top: e2, width: s2, height: i2 }, this._bounds.left = K(t2, this._bounds.left), this._bounds.top = K(e2, this._bounds.top), this._keepInBounds = true, this.getConstraint();
  }
  getConstraint() {
    return this._constraint;
  }
  addChild(t2) {
    return t2.setCanvas(this.canvas), super.addChild(t2);
  }
  dispose() {
    this._disposed || super.dispose();
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
  invalidateDrawProps(t2 = false) {
    if (t2 || 0 !== this._rotation || this._mask || 1 !== this._scale) {
      this._drawProps = this._drawProps ?? { alpha: 1, safeMode: false };
      const t3 = this._drawProps;
      t3.rotation = this._rotation, t3.pivot = this._pivot, t3.blendMode = this._mask ? "destination-in" : void 0, t3.scale = this._scale;
    }
  }
  updateAnimation(t2 = 1) {
    const e2 = this._animation;
    e2.counter += t2, e2.counter >= e2.fpt && (++e2.col, e2.counter = e2.counter % e2.fpt), e2.col > e2.maxCol && (e2.col = e2.type.col, "function" == typeof e2.onComplete && e2.onComplete(this));
  }
}
export {
  M as Canvas,
  r as Loader,
  V as Sprite
};
