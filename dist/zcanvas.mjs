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
async function o(t2) {
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
const r = { loadImage: (e2) => new Promise(async (i2, s2) => {
  let h2;
  if (e2 instanceof File ? h2 = await o(e2) : e2 instanceof Blob && (h2 = e2), void 0 !== h2) {
    try {
      const t2 = await n(h2);
      r.onReady(t2).then(() => i2(d(t2)));
    } catch (t2) {
      s2(t2);
    }
    return;
  }
  const a2 = function(t2) {
    const e3 = t2.substring(0, 5);
    return "data:" === e3 || "blob:" === e3;
  }(e2), l2 = new window.Image(), c2 = new t(), p2 = () => {
    c2.dispose(), s2();
  }, u2 = () => {
    c2.dispose(), r.onReady(l2).then(() => i2(d(l2))).catch(s2);
  };
  var m2;
  a2 || (m2 = l2, function(t2) {
    const { location: e3 } = window;
    return !(!t2.startsWith("./") && !t2.startsWith(`${e3.protocol}//${e3.host}`)) || !/^http[s]?:/.test(t2);
  }(e2) || (m2.crossOrigin = "Anonymous"), c2.add(l2, "load", u2), c2.add(l2, "error", p2)), l2.src = e2, a2 && u2();
}), async loadBitmap(t2) {
  const { image: e2 } = await r.loadImage(t2);
  return h(e2);
}, isReady: (t2) => true === t2.complete && ("number" == typeof t2.naturalWidth && t2.naturalWidth > 0), onReady: (t2) => new Promise((e2, i2) => {
  const s2 = 60;
  let h2 = 0;
  !function n2() {
    r.isReady(t2) ? e2() : ++h2 === s2 ? i2(new Error("Image could not be resolved. This shouldn't occur.")) : window.requestAnimationFrame(n2);
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
const { min: p, max: u } = Math, m = 0.5;
let g, b, _, w;
const f = Math.PI / 180;
function G(t2) {
  return t2 > 0 ? t2 + 0.5 << 0 : 0 | t2;
}
function v(t2, e2) {
  ({ left: g, top: b, width: _, height: w } = t2);
  const { left: i2, top: s2, width: h2, height: n2 } = e2;
  return _ = g > i2 ? p(_, h2 - (g - i2)) : p(h2, _ - (i2 - g)), w = b > s2 ? p(w, n2 - (b - s2)) : p(n2, w - (s2 - b)), { src: { left: g > i2 ? 0 : i2 - g, top: b > s2 ? 0 : s2 - b, width: _, height: w }, dest: { left: g > i2 ? g - i2 : 0, top: b > s2 ? b - s2 : 0, width: _, height: w } };
}
function Z(t2, e2, i2) {
  const { left: s2, top: h2, width: n2, height: a2 } = t2;
  return i2.width = n2 * e2, i2.height = a2 * e2, i2.left = s2 - (i2.width - n2) * m, i2.top = h2 - (i2.height - a2) * m, i2;
}
const X = "transparent", x = 0.5;
let R, C = 1, L = "setTransform";
class y {
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
    ["imageSmoothingEnabled", "mozImageSmoothingEnabled", "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"].forEach((i2) => {
      void 0 !== e2[i2] && (e2[i2] = t2);
    });
  }
  setPixelRatio(t2) {
    C = t2, L = 1 === C ? "setTransform" : "transform";
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
  drawPath(t2, e2 = X, i2) {
    R.beginPath(), R.moveTo(t2[0].x, t2[0].y);
    for (const e3 of t2)
      R.lineTo(e3.x, e3.y);
    e2 !== X && R.fill(), i2 && (R.lineWidth = i2.size, R.strokeStyle = i2.color, R.stroke()), R.closePath();
  }
  clearRect(t2, e2, i2, s2, h2) {
    const n2 = h2 ? this.prepare(h2, t2, e2, i2, s2) : 0;
    this._context.clearRect(t2, e2, i2, s2), this.applyReset(n2);
  }
  drawRect(t2, e2, i2, s2, h2 = X, n2, a2) {
    const o2 = a2 ? this.prepare(a2, t2, e2, i2, s2) : 0;
    R = this._context, h2 !== X && (R.fillStyle = h2, R.fillRect(t2, e2, i2, s2)), n2 && (R.lineWidth = n2.size, R.strokeStyle = n2.color, R.strokeRect(x + t2, x + e2, i2, s2)), this.applyReset(o2);
  }
  drawRoundRect(t2, e2, i2, s2, h2, n2 = X, a2, o2) {
    const r2 = o2 ? this.prepare(o2, t2, e2, i2, s2) : 0;
    R = this._context, n2 !== X && (R.fillStyle = n2, R.fillRect(t2, e2, i2, s2)), a2 && (R.lineWidth = a2.size, R.strokeStyle = a2.color, R.beginPath(), R.roundRect(x + t2, x + e2, i2, s2, h2), R.stroke()), this.applyReset(r2);
  }
  drawCircle(t2, e2, i2, s2 = X, h2, n2) {
    const a2 = n2 ? this.prepare(n2, t2, e2, 2 * i2, 2 * i2) : 0;
    R = this._context, R.beginPath(), R.arc(t2 + i2, e2 + i2, i2, 0, 2 * Math.PI, false), s2 !== X && (R.fillStyle = s2, R.fill()), h2 && (R.lineWidth = h2.size, R.strokeStyle = h2.color, R.closePath(), R.stroke()), this.applyReset(a2);
  }
  drawImage(t2, e2, i2, s2, h2, n2) {
    if (!this._bitmapCache.has(t2))
      return;
    const a2 = n2 ? this.prepare(n2, e2, i2, s2, h2) : 0;
    void 0 === s2 ? this._context.drawImage(this._bitmapCache.get(t2), e2, i2) : this._context.drawImage(this._bitmapCache.get(t2), e2, i2, s2, h2), this._debug && this.drawRect(e2, i2, s2, h2, X, { size: 1, color: "red" }), this.applyReset(a2);
  }
  drawImageCropped(t2, e2, i2, s2, h2, n2, a2, o2, r2, d2) {
    if (!this._bitmapCache.has(t2))
      return;
    if (d2 == null ? void 0 : d2.safeMode) {
      if (o2 <= 0 || r2 <= 0)
        return;
      const n3 = this._bitmapCache.get(t2), a3 = (o2 = Math.min(this._context.canvas.width, o2)) / s2, d3 = (r2 = Math.min(this._context.canvas.height, r2)) / h2;
      e2 + s2 > n3.width && (o2 -= a3 * (e2 + s2 - n3.width), s2 -= e2 + s2 - n3.width), i2 + h2 > n3.height && (r2 -= d3 * (i2 + h2 - n3.height), h2 -= i2 + h2 - n3.height);
    }
    const l2 = d2 ? this.prepare(d2, n2, a2, o2, r2) : 0;
    this._context.drawImage(this._bitmapCache.get(t2), x + e2 << 0, x + i2 << 0, x + s2 << 0, x + h2 << 0, x + n2 << 0, x + a2 << 0, x + o2 << 0, x + r2 << 0), this._debug && this.drawRect(n2, a2, o2, r2, X, { size: 1, color: "red" }), this.applyReset(l2);
  }
  drawText(t2, e2, i2, s2) {
    const { lines: h2, width: n2, height: a2 } = function(t3, e3) {
      l(t3, e3);
      const i3 = t3.text.split("\n"), s3 = [];
      let h3, n3 = 0, a3 = 0, o3 = e3.measureText("Wq");
      h3 = t3.lineHeight ? t3.lineHeight : o3.actualBoundingBoxAscent + o3.actualBoundingBoxDescent;
      const r2 = o3.actualBoundingBoxAscent;
      let d2 = 0;
      return i3.forEach((i4, l2) => {
        if (d2 = Math.round(r2 + l2 * h3), t3.spacing) {
          const e4 = i4.split("");
          n3 = Math.max(n3, e4.length * t3.spacing);
        } else
          o3 = e3.measureText(i4), n3 = Math.max(n3, o3.actualBoundingBoxRight);
        s3.push({ line: i4, top: d2 }), a3 += h3;
      }), { lines: s3, width: Math.ceil(n3), height: Math.ceil(a3) };
    }(t2, this._context);
    t2.center && (e2 -= n2 * x, i2 -= a2 * x);
    const o2 = s2 ? this.prepare(s2, e2, i2, n2, a2) : 0;
    !function(t3, e3, i3, s3, h3) {
      l(i3, t3);
      const n3 = i3.spacing ?? 1;
      e3.forEach(({ line: e4, top: a3 }) => {
        i3.spacing ? e4.split("").forEach((e5, i4) => {
          t3.fillText(e5, s3 + Math.round(i4 * n3), h3 + a3);
        }) : t3.fillText(e4, s3, h3 + a3);
      });
    }(this._context, h2, t2, e2, i2), this.applyReset(o2);
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
  prepare(t2, e2, i2, s2, h2) {
    var _a, _b;
    const n2 = 1 !== t2.scale, a2 = 0 !== t2.rotation, o2 = 1 !== t2.alpha, r2 = void 0 !== t2.blendMode, d2 = o2 || r2, l2 = n2 || a2;
    if (d2)
      this.save();
    else if (!l2)
      return 0;
    if (l2) {
      const n3 = t2.scale ?? 1, a3 = ((_a = t2.pivot) == null ? void 0 : _a.x) ?? e2 + s2 * x, o3 = ((_b = t2.pivot) == null ? void 0 : _b.y) ?? i2 + h2 * x, r3 = t2.rotation * f, d3 = Math.cos(r3) * n3, l3 = Math.sin(r3) * n3;
      this._context[L](d3, l3, -l3, d3, a3 - a3 * d3 + o3 * l3, o3 - a3 * l3 - o3 * d3);
    }
    return r2 && this.setBlendMode(t2.blendMode), o2 && this.setAlpha(t2.alpha), d2 ? 1 : 2;
  }
  applyReset(t2) {
    2 === t2 ? this._context.setTransform(C, 0, 0, C, 0, 0) : 1 === t2 && this.restore();
  }
}
const W = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIHQodCxlKXtlLmZvbnQ9YCR7dC5zaXplfSR7dC51bml0fSAiJHt0LmZvbnR9ImAsZS5maWxsU3R5bGU9dC5jb2xvcn1jbGFzcyBle2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5faW5kZXg9MCx0aGlzLl9tYXA9bmV3IE1hcCx0aGlzLl9jcmVhdGVGbj10LHRoaXMuX2Rlc3Ryb3lGbj1lfWRpc3Bvc2UoKXtjb25zdCB0PVsuLi50aGlzLl9tYXBdLm1hcCgoKFt0XSk9PnQpKTtmb3IoO3QubGVuZ3RoPjA7KXRoaXMucmVtb3ZlKHQuc2hpZnQoKSk7dGhpcy5fbWFwPXZvaWQgMH1nZXQodCl7cmV0dXJuIHRoaXMuX21hcC5nZXQodCl9c2V0KHQsZSl7aWYodGhpcy5oYXModCkpe2lmKHRoaXMuZ2V0KHQpPT09ZSlyZXR1cm47dGhpcy5yZW1vdmUodCl9dGhpcy5fbWFwLnNldCh0LGUpfWhhcyh0KXtyZXR1cm4gdGhpcy5fbWFwLmhhcyh0KX1yZW1vdmUodCl7dmFyIGU7aWYoIXRoaXMuaGFzKHQpKXJldHVybiExO2NvbnN0IHM9dGhpcy5nZXQodCk7cmV0dXJuIG51bGw9PShlPXRoaXMuX2Rlc3Ryb3lGbil8fGUuY2FsbCh0aGlzLHMpLHRoaXMuX21hcC5kZWxldGUodCl9bmV4dCgpe2xldCB0O2NvbnN0IGU9dGhpcy5faW5kZXgudG9TdHJpbmcoKTtyZXR1cm4gdGhpcy5oYXMoZSk/dD10aGlzLmdldChlKTp0aGlzLl9jcmVhdGVGbiYmKHQ9dGhpcy5fY3JlYXRlRm4oKSx0aGlzLnNldChlLHQpKSwrK3RoaXMuX2luZGV4LHR9ZmlsbCh0KXtjb25zdCBlPXRoaXMuX2luZGV4O2ZvcihsZXQgcz0wO3M8dDsrK3MpdGhpcy5uZXh0KCk7dGhpcy5faW5kZXg9ZX1yZXNldCgpe3RoaXMuX2luZGV4PTB9fWNvbnN0IHM9TWF0aC5QSS8xODAsaT0idHJhbnNwYXJlbnQiLGE9LjU7bGV0IG8sbixyLGg9MSxjPSJzZXRUcmFuc2Zvcm0iO2NsYXNzIGx7Y29uc3RydWN0b3IodCxzPSExKXt0aGlzLl9kZWJ1Zz1zLHRoaXMuX2NhbnZhcz10LHRoaXMuX2NvbnRleHQ9dC5nZXRDb250ZXh0KCIyZCIpLHRoaXMuX2JpdG1hcENhY2hlPW5ldyBlKHZvaWQgMCwodD0+e3QuY2xvc2UoKX0pKSx0aGlzLl9wYXR0ZXJuQ2FjaGU9bmV3IGV9ZGlzcG9zZSgpe3RoaXMuX2JpdG1hcENhY2hlLmRpc3Bvc2UoKSx0aGlzLl9wYXR0ZXJuQ2FjaGUuZGlzcG9zZSgpLHRoaXMuX2NhbnZhcz12b2lkIDB9Y2FjaGVSZXNvdXJjZSh0LGUpe3RoaXMuX2JpdG1hcENhY2hlLnNldCh0LGUpfWdldFJlc291cmNlKHQpe3JldHVybiB0aGlzLl9iaXRtYXBDYWNoZS5nZXQodCl9ZGlzcG9zZVJlc291cmNlKHQpe3RoaXMuX2JpdG1hcENhY2hlLnJlbW92ZSh0KX1zZXREaW1lbnNpb25zKHQsZSl7dGhpcy5fY2FudmFzLndpZHRoPXQsdGhpcy5fY2FudmFzLmhlaWdodD1lfXNldFNtb290aGluZyh0KXtjb25zdCBlPXRoaXMuX2NvbnRleHQ7WyJpbWFnZVNtb290aGluZ0VuYWJsZWQiLCJtb3pJbWFnZVNtb290aGluZ0VuYWJsZWQiLCJvSW1hZ2VTbW9vdGhpbmdFbmFibGVkIiwid2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkIl0uZm9yRWFjaCgocz0+e3ZvaWQgMCE9PWVbc10mJihlW3NdPXQpfSkpfXNldFBpeGVsUmF0aW8odCl7aD10LGM9MT09PWg/InNldFRyYW5zZm9ybSI6InRyYW5zZm9ybSJ9c2F2ZSgpe3RoaXMuX2NvbnRleHQuc2F2ZSgpfXJlc3RvcmUoKXt0aGlzLl9jb250ZXh0LnJlc3RvcmUoKX10cmFuc2xhdGUodCxlKXt0aGlzLl9jb250ZXh0LnRyYW5zbGF0ZSh0LGUpfXJvdGF0ZSh0KXt0aGlzLl9jb250ZXh0LnJvdGF0ZSh0KX10cmFuc2Zvcm0odCxlLHMsaSxhLG8pe3RoaXMuX2NvbnRleHQudHJhbnNmb3JtKHQsZSxzLGksYSxvKX1zY2FsZSh0LGU9dCl7dGhpcy5fY29udGV4dC5zY2FsZSh0LGUpfXNldEJsZW5kTW9kZSh0KXt0aGlzLl9jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj10fXNldEFscGhhKHQpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQWxwaGE9dH1kcmF3UGF0aCh0LGU9aSxzKXtvLmJlZ2luUGF0aCgpLG8ubW92ZVRvKHRbMF0ueCx0WzBdLnkpO2Zvcihjb25zdCBpIG9mIHQpby5saW5lVG8oaS54LGkueSk7ZSE9PWkmJm8uZmlsbCgpLHMmJihvLmxpbmVXaWR0aD1zLnNpemUsby5zdHJva2VTdHlsZT1zLmNvbG9yLG8uc3Ryb2tlKCkpLG8uY2xvc2VQYXRoKCl9Y2xlYXJSZWN0KHQsZSxzLGksYSl7Y29uc3Qgbz1hP3RoaXMucHJlcGFyZShhLHQsZSxzLGkpOjA7dGhpcy5fY29udGV4dC5jbGVhclJlY3QodCxlLHMsaSksdGhpcy5hcHBseVJlc2V0KG8pfWRyYXdSZWN0KHQsZSxzLG4scj1pLGgsYyl7Y29uc3QgbD1jP3RoaXMucHJlcGFyZShjLHQsZSxzLG4pOjA7bz10aGlzLl9jb250ZXh0LHIhPT1pJiYoby5maWxsU3R5bGU9cixvLmZpbGxSZWN0KHQsZSxzLG4pKSxoJiYoby5saW5lV2lkdGg9aC5zaXplLG8uc3Ryb2tlU3R5bGU9aC5jb2xvcixvLnN0cm9rZVJlY3QoYSt0LGErZSxzLG4pKSx0aGlzLmFwcGx5UmVzZXQobCl9ZHJhd1JvdW5kUmVjdCh0LGUscyxuLHIsaD1pLGMsbCl7Y29uc3QgZD1sP3RoaXMucHJlcGFyZShsLHQsZSxzLG4pOjA7bz10aGlzLl9jb250ZXh0LGghPT1pJiYoby5maWxsU3R5bGU9aCxvLmZpbGxSZWN0KHQsZSxzLG4pKSxjJiYoby5saW5lV2lkdGg9Yy5zaXplLG8uc3Ryb2tlU3R5bGU9Yy5jb2xvcixvLmJlZ2luUGF0aCgpLG8ucm91bmRSZWN0KGErdCxhK2UscyxuLHIpLG8uc3Ryb2tlKCkpLHRoaXMuYXBwbHlSZXNldChkKX1kcmF3Q2lyY2xlKHQsZSxzLGE9aSxuLHIpe2NvbnN0IGg9cj90aGlzLnByZXBhcmUocix0LGUsMipzLDIqcyk6MDtvPXRoaXMuX2NvbnRleHQsby5iZWdpblBhdGgoKSxvLmFyYyh0K3MsZStzLHMsMCwyKk1hdGguUEksITEpLGEhPT1pJiYoby5maWxsU3R5bGU9YSxvLmZpbGwoKSksbiYmKG8ubGluZVdpZHRoPW4uc2l6ZSxvLnN0cm9rZVN0eWxlPW4uY29sb3Isby5jbG9zZVBhdGgoKSxvLnN0cm9rZSgpKSx0aGlzLmFwcGx5UmVzZXQoaCl9ZHJhd0ltYWdlKHQsZSxzLGEsbyxuKXtpZighdGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpKXJldHVybjtjb25zdCByPW4/dGhpcy5wcmVwYXJlKG4sZSxzLGEsbyk6MDt2b2lkIDA9PT1hP3RoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlLHMpOnRoaXMuX2NvbnRleHQuZHJhd0ltYWdlKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlLHMsYSxvKSx0aGlzLl9kZWJ1ZyYmdGhpcy5kcmF3UmVjdChlLHMsYSxvLGkse3NpemU6MSxjb2xvcjoicmVkIn0pLHRoaXMuYXBwbHlSZXNldChyKX1kcmF3SW1hZ2VDcm9wcGVkKHQsZSxzLG8sbixyLGgsYyxsLGQpe2lmKCF0aGlzLl9iaXRtYXBDYWNoZS5oYXModCkpcmV0dXJuO2lmKG51bGw9PWQ/dm9pZCAwOmQuc2FmZU1vZGUpe2lmKGM8PTB8fGw8PTApcmV0dXJuO2NvbnN0IGk9dGhpcy5fYml0bWFwQ2FjaGUuZ2V0KHQpLGE9KGM9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMud2lkdGgsYykpL28scj0obD1NYXRoLm1pbih0aGlzLl9jb250ZXh0LmNhbnZhcy5oZWlnaHQsbCkpL247ZStvPmkud2lkdGgmJihjLT1hKihlK28taS53aWR0aCksby09ZStvLWkud2lkdGgpLHMrbj5pLmhlaWdodCYmKGwtPXIqKHMrbi1pLmhlaWdodCksbi09cytuLWkuaGVpZ2h0KX1jb25zdCBwPWQ/dGhpcy5wcmVwYXJlKGQscixoLGMsbCk6MDt0aGlzLl9jb250ZXh0LmRyYXdJbWFnZSh0aGlzLl9iaXRtYXBDYWNoZS5nZXQodCksYStlPDwwLGErczw8MCxhK288PDAsYStuPDwwLGErcjw8MCxhK2g8PDAsYStjPDwwLGErbDw8MCksdGhpcy5fZGVidWcmJnRoaXMuZHJhd1JlY3QocixoLGMsbCxpLHtzaXplOjEsY29sb3I6InJlZCJ9KSx0aGlzLmFwcGx5UmVzZXQocCl9ZHJhd1RleHQoZSxzLGksbyl7Y29uc3R7bGluZXM6bix3aWR0aDpyLGhlaWdodDpofT1mdW5jdGlvbihlLHMpe3QoZSxzKTtjb25zdCBpPWUudGV4dC5zcGxpdCgiXG4iKSxhPVtdO2xldCBvLG49MCxyPTAsaD1zLm1lYXN1cmVUZXh0KCJXcSIpO289ZS5saW5lSGVpZ2h0P2UubGluZUhlaWdodDpoLmFjdHVhbEJvdW5kaW5nQm94QXNjZW50K2guYWN0dWFsQm91bmRpbmdCb3hEZXNjZW50O2NvbnN0IGM9aC5hY3R1YWxCb3VuZGluZ0JveEFzY2VudDtsZXQgbD0wO3JldHVybiBpLmZvckVhY2goKCh0LGkpPT57aWYobD1NYXRoLnJvdW5kKGMraSpvKSxlLnNwYWNpbmcpe2NvbnN0IHM9dC5zcGxpdCgiIik7bj1NYXRoLm1heChuLHMubGVuZ3RoKmUuc3BhY2luZyl9ZWxzZSBoPXMubWVhc3VyZVRleHQodCksbj1NYXRoLm1heChuLGguYWN0dWFsQm91bmRpbmdCb3hSaWdodCk7YS5wdXNoKHtsaW5lOnQsdG9wOmx9KSxyKz1vfSkpLHtsaW5lczphLHdpZHRoOk1hdGguY2VpbChuKSxoZWlnaHQ6TWF0aC5jZWlsKHIpfX0oZSx0aGlzLl9jb250ZXh0KTtlLmNlbnRlciYmKHMtPXIqYSxpLT1oKmEpO2NvbnN0IGM9bz90aGlzLnByZXBhcmUobyxzLGkscixoKTowOyFmdW5jdGlvbihlLHMsaSxhLG8pe3QoaSxlKTtjb25zdCBuPWkuc3BhY2luZz8/MTtzLmZvckVhY2goKCh7bGluZTp0LHRvcDpzfSk9PntpLnNwYWNpbmc/dC5zcGxpdCgiIikuZm9yRWFjaCgoKHQsaSk9PntlLmZpbGxUZXh0KHQsYStNYXRoLnJvdW5kKGkqbiksbytzKX0pKTplLmZpbGxUZXh0KHQsYSxvK3MpfSkpfSh0aGlzLl9jb250ZXh0LG4sZSxzLGkpLHRoaXMuYXBwbHlSZXNldChjKX1jcmVhdGVQYXR0ZXJuKHQsZSl7dGhpcy5fYml0bWFwQ2FjaGUuaGFzKHQpJiZ0aGlzLl9wYXR0ZXJuQ2FjaGUuc2V0KHQsdGhpcy5fY29udGV4dC5jcmVhdGVQYXR0ZXJuKHRoaXMuX2JpdG1hcENhY2hlLmdldCh0KSxlKSl9ZHJhd1BhdHRlcm4odCxlLHMsaSxhKXtpZighdGhpcy5fcGF0dGVybkNhY2hlLmhhcyh0KSlyZXR1cm47Y29uc3Qgbz10aGlzLl9wYXR0ZXJuQ2FjaGUuZ2V0KHQpO3RoaXMuX2NvbnRleHQuZmlsbFN0eWxlPW8sdGhpcy5fY29udGV4dC5maWxsUmVjdChlLHMsaSxhKX1wcmVwYXJlKHQsZSxpLG8sbil7dmFyIHIsaDtjb25zdCBsPTEhPT10LnNjYWxlLGQ9MCE9PXQucm90YXRpb24scD0xIT09dC5hbHBoYSxtPXZvaWQgMCE9PXQuYmxlbmRNb2RlLGc9cHx8bSx1PWx8fGQ7aWYoZyl0aGlzLnNhdmUoKTtlbHNlIGlmKCF1KXJldHVybiAwO2lmKHUpe2NvbnN0IGw9dC5zY2FsZT8/MSxkPShudWxsPT0ocj10LnBpdm90KT92b2lkIDA6ci54KT8/ZStvKmEscD0obnVsbD09KGg9dC5waXZvdCk/dm9pZCAwOmgueSk/P2krbiphLG09dC5yb3RhdGlvbipzLGc9TWF0aC5jb3MobSkqbCx1PU1hdGguc2luKG0pKmw7dGhpcy5fY29udGV4dFtjXShnLHUsLXUsZyxkLWQqZytwKnUscC1kKnUtcCpnKX1yZXR1cm4gbSYmdGhpcy5zZXRCbGVuZE1vZGUodC5ibGVuZE1vZGUpLHAmJnRoaXMuc2V0QWxwaGEodC5hbHBoYSksZz8xOjJ9YXBwbHlSZXNldCh0KXsyPT09dD90aGlzLl9jb250ZXh0LnNldFRyYW5zZm9ybShoLDAsMCxoLDAsMCk6MT09PXQmJnRoaXMucmVzdG9yZSgpfX1vbm1lc3NhZ2U9dD0+e3N3aXRjaCh0LmRhdGEuY21kKXtkZWZhdWx0OmJyZWFrO2Nhc2UiaW5pdCI6cj10LmRhdGEuY2FudmFzLG49bmV3IGwocix0LmRhdGEuZGVidWcpO2JyZWFrO2Nhc2UibG9hZFJlc291cmNlIjohYXN5bmMgZnVuY3Rpb24odCxlKXt0cnl7bGV0IHM7aWYoZSBpbnN0YW5jZW9mIEZpbGUpe2NvbnN0IHQ9YXdhaXQgYXN5bmMgZnVuY3Rpb24odCl7Y29uc3QgZT1uZXcgRmlsZVJlYWRlcjtyZXR1cm4gbmV3IFByb21pc2UoKChzLGkpPT57ZS5vbmxvYWQ9ZT0+e3ZhciBhO2lmKCEobnVsbD09KGE9bnVsbD09ZT92b2lkIDA6ZS50YXJnZXQpP3ZvaWQgMDphLnJlc3VsdCkpcmV0dXJuIGkoKTtzKG5ldyBCbG9iKFtlLnRhcmdldC5yZXN1bHRdLHt0eXBlOnQudHlwZX0pKX0sZS5vbmVycm9yPXQ9PmkodCksZS5yZWFkQXNBcnJheUJ1ZmZlcih0KX0pKX0oZSk7cz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcCh0KX1lbHNlIGlmKGUgaW5zdGFuY2VvZiBCbG9iKXM9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoZSk7ZWxzZSBpZigic3RyaW5nIj09dHlwZW9mIGUpe2NvbnN0IHQ9YXdhaXQgZmV0Y2goZSksaT1hd2FpdCB0LmJsb2IoKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKGkpfWVsc2UgZSBpbnN0YW5jZW9mIEltYWdlQml0bWFwJiYocz1lKTtudWxsPT1ufHxuLmNhY2hlUmVzb3VyY2UodCxzKSxwb3N0TWVzc2FnZSh7Y21kOiJvbmxvYWQiLGlkOnQsc2l6ZTp7d2lkdGg6cy53aWR0aCxoZWlnaHQ6cy5oZWlnaHR9fSl9Y2F0Y2gocyl7cG9zdE1lc3NhZ2Uoe2NtZDoib25lcnJvciIsaWQ6dCxlcnJvcjoobnVsbD09cz92b2lkIDA6cy5tZXNzYWdlKT8/c30pfX0odC5kYXRhLmlkLHQuZGF0YS5zb3VyY2UpO2JyZWFrO2Nhc2UiZ2V0UmVzb3VyY2UiOmNvbnN0IGU9bnVsbD09bj92b2lkIDA6bi5nZXRSZXNvdXJjZSh0LmRhdGEuaWQpO3Bvc3RNZXNzYWdlKHtjbWQ6Im9ucmVzb3VyY2UiLGlkOnQuZGF0YS5pZCxiaXRtYXA6ZX0pO2JyZWFrO2Nhc2UiZGlzcG9zZVJlc291cmNlIjpudWxsPT1ufHxuLmRpc3Bvc2VSZXNvdXJjZSguLi50LmRhdGEuYXJncyk7YnJlYWs7Y2FzZSJkaXNwb3NlIjpudWxsPT1ufHxuLmRpc3Bvc2UoKSxyPXZvaWQgMCxuPXZvaWQgMDticmVhaztjYXNlInJlbmRlciI6aWYoIW58fCF0LmRhdGEuY29tbWFuZHMpcmV0dXJuO2Zvcihjb25zdCBzIG9mIHQuZGF0YS5jb21tYW5kcyl7Y29uc3QgdD1zLnNoaWZ0KCk7blt0XSguLi5zKX1wb3N0TWVzc2FnZSh7Y21kOiJvbnJlbmRlciJ9KTticmVhaztjYXNlInNldERpbWVuc2lvbnMiOmNhc2Uic2V0UGl4ZWxSYXRpbyI6Y2FzZSJzZXRTbW9vdGhpbmciOmNhc2UiY3JlYXRlUGF0dGVybiI6blt0LmRhdGEuY21kXSguLi50LmRhdGEuYXJncyl9fX0oKTsK", S = "undefined" != typeof window && window.Blob && new Blob([atob(W)], { type: "text/javascript;charset=utf-8" });
function k() {
  let t2;
  try {
    if (t2 = S && (window.URL || window.webkitURL).createObjectURL(S), !t2)
      throw "";
    return new Worker(t2);
  } catch (t3) {
    return new Worker("data:application/javascript;base64," + W);
  } finally {
    t2 && (window.URL || window.webkitURL).revokeObjectURL(t2);
  }
}
class Y {
  constructor(t2, e2 = false, i2 = false) {
    if (this._useWorker = false, this._element = t2, e2 && "function" == typeof this._element.transferControlToOffscreen) {
      this._useWorker = true, this._callbacks = /* @__PURE__ */ new Map(), this._pool = new c(() => [], (t3) => {
        t3.length = 0;
      }), this._pool.fill(1e3), this._commands = [];
      const e3 = t2.transferControlToOffscreen();
      this._worker = new k(), this._worker.postMessage({ cmd: "init", canvas: e3, debug: i2 }, [e3]), this._worker.onmessage = this.handleMessage.bind(this);
    } else
      this._renderer = new y(this._element, i2);
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
            const h2 = await o(e2);
            this.wrappedLoad(t2, h2, i2, s2);
          }
        else
          e2 instanceof Blob ? this._useWorker ? this.wrappedWorkerLoad(t2, e2, i2, s2) : this.wrappedLoad(t2, e2, i2, s2) : s2("Unsupported resource type: " + typeof e2);
      } else if (e2 = e2.startsWith("./") ? new URL(e2, document.baseURI).href : e2, this._useWorker)
        this.wrappedWorkerLoad(t2, e2, i2, s2);
      else {
        const h2 = await r.loadImage(e2);
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
      var _a, _b;
      (_a = this._worker) == null ? void 0 : _a.terminate(), this._worker = void 0, (_b = this._callbacks) == null ? void 0 : _b.clear();
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
  setPixelRatio(t2) {
    this.getBackend("setPixelRatio", t2);
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
  drawPath(t2, e2, i2) {
    this.onDraw("drawPath", t2, e2, i2);
  }
  clearRect(t2, e2, i2, s2, h2) {
    this.onDraw("clearRect", t2, e2, i2, s2, h2);
  }
  drawRect(t2, e2, i2, s2, h2, n2, a2) {
    this.onDraw("drawRect", t2, e2, i2, s2, h2, n2, a2);
  }
  drawRoundRect(t2, e2, i2, s2, h2, n2, a2, o2) {
    this.onDraw("drawRoundRect", t2, e2, i2, s2, h2, n2, a2, o2);
  }
  drawCircle(t2, e2, i2, s2 = "transparent", h2, n2) {
    this.onDraw("drawCircle", t2, e2, i2, s2, h2, n2);
  }
  drawImage(t2, e2, i2, s2, h2, n2) {
    this.onDraw("drawImage", t2, e2, i2, s2, h2, n2);
  }
  drawImageCropped(t2, e2, i2, s2, h2, n2, a2, o2, r2, d2) {
    this.onDraw("drawImageCropped", t2, e2, i2, s2, h2, n2, a2, o2, r2, d2);
  }
  drawText(t2, e2, i2, s2) {
    this.onDraw("drawText", t2, e2, i2, s2);
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
const z = { x: 0, y: 0 };
function H(t2, e2, i2, s2, h2) {
  return (t2 - e2) / (i2 - e2) * (h2 - s2) + s2;
}
const F = [], K = [], M = i(1, 1, true).cvs;
class I {
  constructor(t2) {
    this._renderer = t2, this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  getChildrenUnderPoint(t2, e2, i2, s2, h2, n2 = false) {
    const a2 = [];
    let o2, r2, d2, l2, c2, p2 = t2.length;
    for (; p2--; )
      o2 = t2[p2], r2 = o2.getX(), d2 = o2.getY(), l2 = o2.getWidth(), c2 = o2.getHeight(), r2 < e2 + s2 && r2 + l2 > e2 && d2 < i2 + h2 && d2 + c2 > i2 && (!n2 || n2 && o2.collidable) && a2.push(o2);
    return a2;
  }
  pixelCollision(t2, e2) {
    const i2 = t2.getIntersection(e2);
    if (void 0 === i2)
      return;
    this.getPixelArray(t2, i2, F), this.getPixelArray(e2, i2, K);
    const s2 = i2.width, h2 = i2.height;
    let n2 = 0;
    for (let t3 = 0; t3 < h2; ++t3)
      for (let e3 = 0; e3 < s2; ++e3) {
        if (1 === F[n2] && 1 === K[n2])
          return { x: e3, y: t3 };
        ++n2;
      }
  }
  async cache(t2) {
    const e2 = await this._renderer.getResource(t2);
    if (!e2)
      return false;
    const { width: i2, height: s2 } = e2;
    !function(t3, e3, i3, s3) {
      a(t3, e3, i3, s3);
    }(M, e2, i2, s2);
    const { data: h2 } = M.getContext("2d").getImageData(0, 0, i2, s2), n2 = new Uint8Array(h2.length / 4);
    for (let t3 = 0, e3 = n2.length; t3 < e3; ++t3) {
      const e4 = h2[4 * t3 + 3];
      n2[t3] = e4 < 5 ? 0 : 1;
    }
    return this._cacheMap.set(t2, { mask: n2, size: { width: i2, height: s2 } }), M.width = M.height = 1, true;
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
    const h2 = t2.getBounds(), n2 = G(e2.left - h2.left), a2 = G(e2.top - h2.top), o2 = G(e2.width), r2 = G(e2.height), { mask: d2, size: l2 } = this._cacheMap.get(s2);
    if (0 === o2 || 0 === r2)
      return void (i2.length = 0);
    i2.length = G(o2 * r2);
    const c2 = l2.height, p2 = l2.width, u2 = n2 + o2, m2 = a2 + r2;
    let g2 = -1, b2 = 0;
    for (let t3 = a2; t3 < m2; ++t3)
      for (let e3 = n2; e3 < u2; ++e3)
        b2 = e3 >= p2 || t3 >= c2 ? 0 : d2[t3 * p2 + e3], i2[++g2] = b2;
  }
}
class N {
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
const { min: V, max: Q } = Math;
class P extends N {
  constructor({ width: t2 = 300, height: e2 = 300, fps: i2 = 60, backgroundColor: s2 = null, animate: h2 = false, smoothing: n2 = true, stretchToFit: a2 = false, autoSize: o2 = true, viewport: r2 = null, preventEventBubbling: d2 = false, parentElement: l2 = null, debug: c2 = false, optimize: p2 = "auto", viewportHandler: u2, onUpdate: m2, onResize: g2 } = {}) {
    if (super(), this.DEBUG = false, this.benchmark = { minElapsed: 1 / 0, maxElapsed: -1 / 0, minFps: 1 / 0, maxFps: -1 / 0 }, this.bbox = { left: 0, top: 0, right: 0, bottom: 0 }, this._smoothing = false, this._stretchToFit = false, this._pxr = 1, this._preventDefaults = false, this._lastRender = 0, this._renderId = 0, this._renderPending = false, this._disposed = false, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._animate = false, this._hasFsHandler = false, this._isFullScreen = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = c2, this._element = document.createElement("canvas"), this._renderer = new Y(this._element, function(t3) {
      if ("worker" === t3)
        return true;
      const { userAgent: e3 } = navigator, i3 = e3.includes("Safari") && !e3.includes("Chrome");
      return "auto" === t3 && !i3;
    }(p2), c2), this.collision = new I(this._renderer), this._updateHandler = m2, this._renderHandler = this.render.bind(this), this._viewportHandler = u2, this._resizeHandler = g2, this.setFrameRate(i2), this.setAnimatable(h2), s2 && this.setBackgroundColor(s2), this._pxr = window.devicePixelRatio || 1, this._renderer.setPixelRatio(this._pxr), this.setDimensions(t2, e2, true, true), r2 && this.setViewport(r2.width, r2.height), this._stretchToFit = a2, this.setSmoothing(n2), this.preventEventBubbling(d2), this.addListeners(o2), l2 instanceof HTMLElement && this.insertInPage(l2), requestAnimationFrame(() => this.handleResize());
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
  setDimensions(t2, e2, i2 = true, s2 = false) {
    this._enqueuedSize = { width: t2, height: e2 }, i2 && (this._preferredWidth = t2, this._preferredHeight = e2), s2 && this.updateCanvasSize(), this.invalidate();
  }
  getViewport() {
    return this._viewport;
  }
  setViewport(t2, e2) {
    this._viewport || (this._viewport = { width: t2, height: e2, left: 0, top: 0, right: t2, bottom: e2 });
    const i2 = this._viewport;
    i2.width = t2, i2.height = e2, this.panViewport(Math.min(i2.left, t2), Math.min(i2.top, e2));
  }
  panViewport(t2, e2, i2 = false) {
    var _a;
    const s2 = this._viewport;
    s2.left = Q(0, V(t2, this._width - s2.width)), s2.right = s2.left + s2.width, s2.top = Q(0, V(e2, this._height - s2.height)), s2.bottom = s2.top + s2.height, this.invalidate(), i2 && ((_a = this._viewportHandler) == null ? void 0 : _a.call(this, { type: "panned", value: s2 }));
  }
  setBackgroundColor(t2) {
    this._bgColor = t2;
  }
  setAnimatable(t2) {
    this._lastRaf = window.performance.now(), t2 && !this._renderPending && this.invalidate(), this._animate = t2;
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
  setFullScreen(t2, e2 = false) {
    if (e2 || (e2 = this._stretchToFit), !this._hasFsHandler) {
      this._hasFsHandler = true;
      const t3 = document, i2 = () => {
        this._isFullScreen = t3.webkitIsFullScreen || t3.mozFullScreen || true === t3.msFullscreenElement, e2 && (this._stretchToFit = this._isFullScreen);
      };
      ["webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange"].forEach((e3) => {
        this._eventHandler.add(t3, e3, i2);
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
    const e2 = this._children.length, i2 = this._viewport;
    let s2;
    if (e2 > 0)
      switch (s2 = this._children[e2 - 1], t2.type) {
        default:
          let h2 = 0, n2 = 0;
          const a2 = t2.changedTouches;
          let o2 = 0, r2 = a2.length;
          const d2 = 1 / this._scale.x, l2 = 1 / this._scale.y;
          if (r2 > 0) {
            let { x: c3, y: p3 } = this.getCoordinate();
            for (i2 && (c3 -= i2.left, p3 -= i2.top), o2 = 0; o2 < r2; ++o2) {
              const i3 = a2[o2], { identifier: r3 } = i3;
              if (h2 = i3.pageX * d2 - c3, n2 = i3.pageY * l2 - p3, "touchstart" === t2.type) {
                for (; s2; ) {
                  if (!this._activeTouches.includes(s2) && s2.handleInteraction(h2, n2, t2)) {
                    this._activeTouches[r3] = s2;
                    break;
                  }
                  s2 = s2.last;
                }
                s2 = this._children[e2 - 1];
              } else
                s2 = this._activeTouches[r3], (s2 == null ? void 0 : s2.handleInteraction(h2, n2, t2)) && "touchmove" !== t2.type && (this._activeTouches[r3] = null);
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: c2, offsetY: p2 } = t2;
          if (this._isFullScreen) {
            const e3 = function(t3, e4, i3, s3, h3) {
              const n3 = window.innerHeight / h3, a3 = 0.5 * (window.innerWidth - s3 * n3);
              return z.x = H(t3.clientX - i3.left - a3, 0, s3 * n3, 0, e4.width), z.y = H(t3.clientY - i3.top, 0, h3 * n3, 0, e4.height), z;
            }(t2, this._element, this.getCoordinate(), this._width, this._height);
            c2 = e3.x, p2 = e3.y;
          }
          for (i2 && (c2 += i2.left, p2 += i2.top); s2 && !s2.handleInteraction(c2, p2, t2); )
            s2 = s2.last;
          break;
        case "wheel":
          const { deltaX: u2, deltaY: m2 } = t2, g2 = 20, b2 = 0 === u2 ? 0 : u2 > 0 ? g2 : -g2, _2 = 0 === m2 ? 0 : m2 > 0 ? g2 : -g2;
          this.panViewport(i2.left + b2, i2.top + _2, true);
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
      this.benchmark.minElapsed = V(this.benchmark.minElapsed, e3), this.benchmark.maxElapsed = Q(this.benchmark.maxElapsed, e3), this._aFps !== 1 / 0 && (this.benchmark.minFps = V(this.benchmark.minFps, this._aFps), this.benchmark.maxFps = Q(this.benchmark.maxFps, this._aFps));
    }
  }
  addListeners(e2 = false) {
    this._eventHandler || (this._eventHandler = new t());
    const i2 = this._eventHandler, s2 = this.handleInteraction.bind(this), h2 = this._element;
    "ontouchstart" in window && ["start", "move", "end", "cancel"].forEach((t2) => {
      i2.add(h2, `touch${t2}`, s2);
    }), ["down", "move"].forEach((t2) => {
      i2.add(h2, `mouse${t2}`, s2);
    }), i2.add(window, "mouseup", s2), this._viewport && i2.add(h2, "wheel", s2), e2 && i2.add(window, "resize", this.handleResize.bind(this));
  }
  removeListeners() {
    var _a;
    (_a = this._eventHandler) == null ? void 0 : _a.dispose(), this._eventHandler = void 0;
  }
  handleResize() {
    const { innerWidth: t2, innerHeight: e2 } = window;
    let i2 = this._preferredWidth, s2 = this._preferredHeight, h2 = 1;
    if (!this._viewport && this._stretchToFit) {
      const { width: n2, height: a2 } = function(t3, e3, i3, s3) {
        const h3 = i3 / s3;
        let n3 = t3, a3 = e3;
        return t3 / e3 > h3 ? a3 = t3 / h3 : n3 = e3 * h3, { width: n3, height: a3 };
      }(i2, s2, t2, e2);
      h2 = t2 / n2, this.setDimensions(n2, a2, false, true);
    } else
      V(i2, t2), this.setDimensions(i2, s2, false), this._viewport || i2 > t2 && (h2 = t2 / i2);
    this.scale(h2);
  }
  updateCanvasSize() {
    var _a;
    const t2 = this._smoothing ? this._pxr : 1;
    let e2, i2;
    if (void 0 !== this._enqueuedSize && ({ width: e2, height: i2 } = this._enqueuedSize, this._enqueuedSize = void 0, this._width = e2, this._height = i2, this.bbox.right = e2, this.bbox.bottom = i2), this._viewport) {
      const t3 = this._width, s2 = this._height;
      e2 = V(this._viewport.width, t3), i2 = V(this._viewport.height, s2);
    }
    if (e2 && i2) {
      const s2 = this.getElement();
      this._renderer.setDimensions(e2 * t2, i2 * t2), s2.style.width = `${e2}px`, s2.style.height = `${i2}px`, (_a = this._resizeHandler) == null ? void 0 : _a.call(this, e2, i2);
    }
    this._renderer.scale(t2), this.setSmoothing(this._smoothing), this._coords = void 0;
  }
}
const { min: J, max: U } = Math, j = 0.5;
class B extends N {
  constructor({ width: t2, height: e2, resourceId: i2, x: s2 = 0, y: h2 = 0, rotation: n2 = 0, collidable: a2 = false, interactive: o2 = false, mask: r2 = false, sheet: d2 = [], sheetTileWidth: l2 = 0, sheetTileHeight: c2 = 0 } = { width: 0, height: 0 }) {
    if (super(), this.hover = false, this.isDragging = false, this._mask = false, this._interactive = false, this._draggable = false, this._keepInBounds = false, this._pressed = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a Sprite without valid dimensions");
    if (this.collidable = a2, this._mask = r2, this._bounds = { left: s2, top: h2, width: t2, height: e2 }, r2 && this.gdp(), 0 !== n2 && this.setRotation(n2), i2 && this.setResource(i2), d2.length > 0) {
      if (!i2)
        throw new Error("cannot use a spritesheet without a valid resource id");
      this.setSheet(d2, l2, c2);
    }
    this.setInteractive(o2);
  }
  getDraggable() {
    return this._draggable;
  }
  setDraggable(t2, e2 = false) {
    this._draggable = t2, this._keepInBounds = !!this._constraint || e2, t2 && !this._interactive && this.setInteractive(true);
  }
  getInteractive() {
    return this._interactive;
  }
  setInteractive(t2) {
    this._interactive = t2;
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
    e2 !== t2 && (this._bounds.width = t2, 0 !== e2 && (this._bounds.left -= t2 * j - e2 * j), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t2) {
    const e2 = this._bounds.height || 0;
    e2 !== t2 && (this._bounds.height = t2, 0 !== e2 && (this._bounds.top -= t2 * j - e2 * j), this.invalidate());
  }
  setBounds(t2, e2, i2, s2) {
    if (this._constraint)
      t2 -= this._constraint.left, e2 -= this._constraint.top;
    else if (!this.canvas)
      throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");
    let h2 = false;
    "number" == typeof i2 && (h2 = this._bounds.width !== i2, this._bounds.width = i2), "number" == typeof s2 && (h2 = h2 || this._bounds.height !== s2, this._bounds.height = s2);
    const n2 = this._bounds.width, a2 = this._bounds.height, o2 = this._constraint ? this._constraint.width : this.canvas.getWidth(), r2 = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const i3 = J(0, -(n2 - o2)), s3 = J(0, -(a2 - r2)), h3 = r2 - a2;
      t2 = J(o2 - n2, U(t2, i3)), e2 = J(h3, U(e2, s3));
    } else
      t2 > o2 && (t2 += n2 * j), e2 > r2 && (e2 += a2 * j);
    this.setX(t2), this.setY(e2), h2 && this.invalidate();
  }
  getBounds() {
    return this._bounds;
  }
  getRotation() {
    var _a;
    return ((_a = this._dp) == null ? void 0 : _a.rotation) ?? 0;
  }
  setRotation(t2, e2) {
    this.invalidateDrawProps({ rotation: t2 % 360, pivot: e2 });
  }
  getScale() {
    var _a;
    return ((_a = this._dp) == null ? void 0 : _a.scale) ?? 1;
  }
  setScale(t2) {
    this.invalidateDrawProps({ scale: t2 });
  }
  getTransforms() {
    if (!this._tf) {
      const { scale: t2, rotation: e2, alpha: i2 } = this.gdp();
      this._tf = { scale: t2, rotation: e2, alpha: i2 };
    }
    return this._tf;
  }
  isVisible(t2) {
    return e2 = this._tfb || this._bounds, i2 = t2 || this.canvas.bbox, { left: g, top: b } = e2, g + e2.width >= i2.left && g <= i2.right && b + e2.height >= i2.top && b <= i2.bottom;
    var e2, i2;
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
      const e2 = this._bounds, i2 = t2.getBounds(), s2 = U(e2.left, i2.left), h2 = U(e2.top, i2.top);
      return { left: s2, top: h2, width: J(e2.left + e2.width, i2.width + i2.height) - s2, height: J(e2.top + e2.height, i2.top + i2.height) - h2 };
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
    this._resourceId = t2, "number" == typeof e2 && this.setWidth(e2), "number" == typeof i2 && this.setHeight(i2), this.invalidate();
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
    return this._constraint = { left: t2, top: e2, width: i2, height: s2 }, this._bounds.left = U(t2, this._bounds.left), this._bounds.top = U(e2, this._bounds.top), this._keepInBounds = true, this.getConstraint();
  }
  getConstraint() {
    return this._constraint;
  }
  addChild(t2) {
    return t2.setCanvas(this.canvas), super.addChild(t2);
  }
  update(t2, e2) {
    let i2 = this._children[0];
    for (; i2; )
      i2.update(t2, e2), i2 = i2.next;
    this._animation && this.updateAnimation(e2);
  }
  draw(t2, e2) {
    const i2 = this._bounds;
    if (!!this._resourceId && this.isVisible(e2)) {
      const s3 = this._animation;
      let { left: h2, top: n2, width: a2, height: o2 } = i2;
      if (s3) {
        const i3 = s3.tileWidth ? s3.tileWidth : j + a2 << 0, r2 = s3.tileHeight ? s3.tileHeight : j + o2 << 0;
        e2 && (h2 -= e2.left, n2 -= e2.top), t2.drawImageCropped(this._resourceId, s3.col * i3, s3.type.row * r2, i3, r2, h2, n2, a2, o2, this.getDrawProps());
      } else if (e2) {
        const { src: s4, dest: h3 } = v(i2, e2);
        t2.drawImageCropped(this._resourceId, s4.left, s4.top, s4.width, s4.height, h3.left, h3.top, h3.width, h3.height, this.getDrawProps());
      } else
        t2.drawImage(this._resourceId, h2, n2, a2, o2, this.getDrawProps());
    }
    let s2 = this._children[0];
    for (; s2; )
      s2.draw(t2, e2), s2 = s2.next;
  }
  dispose() {
    this._disposed || super.dispose();
  }
  getDrawProps() {
    if (this._tf) {
      const { alpha: t2, rotation: e2, scale: i2 } = this._tf;
      (this._dp.rotation !== e2 || this._dp.alpha !== t2 || this._dp.scale !== i2) && this.invalidateDrawProps({ rotation: e2, alpha: t2, scale: i2 });
    }
    return this._dp;
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
    let s2;
    const h2 = this._children.length;
    if (h2 > 0)
      for (s2 = this._children[h2 - 1]; s2; ) {
        if (s2.handleInteraction(t2, e2, i2))
          return true;
        s2 = s2.last;
      }
    if (!this._interactive)
      return false;
    const { type: n2 } = i2;
    if (this._pressed && ("touchend" === n2 || "mouseup" === n2))
      return this._pressed = false, this.isDragging && (this.isDragging = false), window.performance.now() - this._pressTime < 250 && this.handleClick(), this.handleRelease(t2, e2, i2), true;
    if (this.insideBounds(t2, e2)) {
      if (this.hover = true, "touchstart" === n2 || "mousedown" === n2)
        return this._pressTime = window.performance.now(), this._pressed = true, this._draggable && (this.isDragging = true, this._dragStartOffset = { x: this._bounds.left, y: this._bounds.top }, this._dragStartEventCoordinates = { x: t2, y: e2 }), this.handlePress(t2, e2, i2), "touchstart" === n2 && (i2.stopPropagation(), i2.preventDefault()), true;
    } else
      this.hover = false;
    return !!this.isDragging && (this.handleMove(t2, e2, i2), true);
  }
  invalidate() {
    this.canvas && this.canvas.invalidate();
  }
  invalidateDrawProps({ alpha: t2, scale: e2, rotation: i2, pivot: s2 }) {
    const h2 = this.gdp();
    h2.alpha = t2 ?? h2.alpha, h2.scale = e2 ?? h2.scale, h2.rotation = i2 ?? h2.rotation, h2.pivot = s2 ?? h2.pivot, void 0 === i2 && void 0 === e2 || (this._tfb || (this._tfb = { ...this._bounds }), function(t3, e3, i3, s3) {
      if (0 === e3 && 1 === i3)
        return Z(t3, 1, s3);
      const { left: h3, top: n2, width: a2, height: o2 } = Z(t3, i3, s3);
      if (0 !== e3) {
        const t4 = -a2 * m, i4 = a2 * m, r2 = a2 * m, d2 = -a2 * m, l2 = o2 * m, c2 = o2 * m, g2 = -o2 * m, b2 = -o2 * m, _2 = e3 * f, w2 = Math.cos(_2), G2 = Math.sin(_2), v2 = t4 * w2 + l2 * G2, Z2 = -t4 * G2 + l2 * w2, X2 = i4 * w2 + c2 * G2, x2 = -i4 * G2 + c2 * w2, R2 = r2 * w2 + g2 * G2, C2 = -r2 * G2 + g2 * w2, L2 = d2 * w2 + b2 * G2, y2 = -d2 * G2 + b2 * w2, W2 = p(v2, X2, R2, L2), S2 = u(v2, X2, R2, L2), k2 = p(Z2, x2, C2, y2), Y2 = u(Z2, x2, C2, y2);
        s3.width = S2 - W2, s3.height = Y2 - k2, s3.left = h3 - (s3.width * m - a2 * m), s3.top = n2 - (s3.height * m - o2 * m);
      }
    }(this._bounds, h2.rotation, h2.scale, this._tfb));
  }
  updateAnimation(t2 = 1) {
    const e2 = this._animation;
    e2.counter += t2, e2.counter >= e2.fpt && (++e2.col, e2.counter = e2.counter % e2.fpt), e2.col > e2.maxCol && (e2.col = e2.type.col, "function" == typeof e2.onComplete && e2.onComplete(this));
  }
  gdp() {
    return this._dp = this._dp || { alpha: 1, blendMode: this._mask ? "destination-in" : void 0, safeMode: false, scale: 1, rotation: 0 }, this._dp;
  }
}
export {
  P as Canvas,
  r as Loader,
  B as Sprite
};
