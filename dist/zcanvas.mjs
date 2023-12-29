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
  }(t2)), o(i(), t2);
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
function o(t2, e2, s2, i2) {
  const h2 = t2.getContext("2d");
  s2 = s2 ?? e2.width, i2 = i2 ?? e2.height, t2.width = s2, t2.height = i2, h2.clearRect(0, 0, s2, i2), h2.drawImage(e2, 0, 0, s2, i2);
}
async function a(t2) {
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
  if (e2 instanceof File ? h2 = await a(e2) : e2 instanceof Blob && (h2 = e2), void 0 !== h2) {
    try {
      const t2 = await n(h2);
      r.onReady(t2).then(() => s2(d(t2)));
    } catch (t2) {
      i2(t2);
    }
    return;
  }
  const o2 = function(t2) {
    const e3 = t2.substring(0, 5);
    return "data:" === e3 || "blob:" === e3;
  }(e2), l2 = new window.Image(), c2 = new t(), p2 = () => {
    c2.dispose(), i2();
  }, u2 = () => {
    c2.dispose(), r.onReady(l2).then(() => s2(d(l2))).catch(i2);
  };
  var g2;
  o2 || (g2 = l2, function(t2) {
    const { location: e3 } = window;
    return !(!t2.startsWith("./") && !t2.startsWith(`${e3.protocol}//${e3.host}`)) || !/^http[s]?:/.test(t2);
  }(e2) || (g2.crossOrigin = "Anonymous"), c2.add(l2, "load", u2), c2.add(l2, "error", p2)), l2.src = e2, o2 && u2();
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
const { min: p, max: u } = Math, g = 0.5;
let m, _, b, w;
const f = Math.PI / 180;
function Z(t2) {
  return t2 > 0 ? t2 + 0.5 << 0 : 0 | t2;
}
function G(t2, e2) {
  ({ left: m, top: _, width: b, height: w } = t2);
  const { left: s2, top: i2, width: h2, height: n2 } = e2;
  return b = m > s2 ? p(b, h2 - (m - s2)) : p(h2, b - (s2 - m)), w = _ > i2 ? p(w, n2 - (_ - i2)) : p(n2, w - (i2 - _)), { src: { left: m > s2 ? 0 : s2 - m, top: _ > i2 ? 0 : i2 - _, width: b, height: w }, dest: { left: m > s2 ? m - s2 : 0, top: _ > i2 ? _ - i2 : 0, width: b, height: w } };
}
function y(t2, e2, s2) {
  const { left: i2, top: h2, width: n2, height: o2 } = t2;
  return s2.width = n2 * e2, s2.height = o2 * e2, s2.left = i2 - (s2.width - n2) * g, s2.top = h2 - (s2.height - o2) * g, s2;
}
const v = "transparent", x = 0.5;
let R, X = 1, W = "setTransform";
class C {
  constructor(t2, e2 = false) {
    this._debug = e2, this._cvs = t2, this._ctx = t2.getContext("2d"), this._bmp = new c(void 0, (t3) => {
      t3.close();
    }), this._ptn = new c();
  }
  dispose() {
    this._bmp.dispose(), this._ptn.dispose(), this._cvs = void 0;
  }
  cacheResource(t2, e2) {
    this._bmp.set(t2, e2);
  }
  getResource(t2) {
    return this._bmp.get(t2);
  }
  disposeResource(t2) {
    this._bmp.remove(t2);
  }
  setDimensions(t2, e2) {
    this._cvs.width = t2, this._cvs.height = e2;
  }
  setSmoothing(t2) {
    const e2 = this._ctx;
    ["imageSmoothingEnabled", "mozImageSmoothingEnabled", "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"].forEach((s2) => {
      void 0 !== e2[s2] && (e2[s2] = t2);
    });
  }
  setPixelRatio(t2) {
    X = t2, W = 1 === X ? "setTransform" : "transform";
  }
  save() {
    this._ctx.save();
  }
  restore() {
    this._ctx.restore();
  }
  translate(t2, e2) {
    this._ctx.translate(t2, e2);
  }
  rotate(t2) {
    this._ctx.rotate(t2);
  }
  transform(t2, e2, s2, i2, h2, n2) {
    this._ctx.transform(t2, e2, s2, i2, h2, n2);
  }
  scale(t2, e2 = t2) {
    this._ctx.scale(t2, e2);
  }
  setBlendMode(t2) {
    this._ctx.globalCompositeOperation = t2;
  }
  setAlpha(t2) {
    this._ctx.globalAlpha = t2;
  }
  drawPath(t2, e2 = v, s2) {
    R.beginPath(), R.moveTo(t2[0].x, t2[0].y);
    for (const e3 of t2)
      R.lineTo(e3.x, e3.y);
    e2 !== v && R.fill(), s2 && (R.lineWidth = s2.size, R.strokeStyle = s2.color, R.stroke()), R.closePath();
  }
  clearRect(t2, e2, s2, i2, h2) {
    const n2 = h2 ? this.prepare(h2, t2, e2, s2, i2) : 0;
    this._ctx.clearRect(t2, e2, s2, i2), this.applyReset(n2);
  }
  drawRect(t2, e2, s2, i2, h2 = v, n2, o2) {
    const a2 = o2 ? this.prepare(o2, t2, e2, s2, i2) : 0;
    R = this._ctx, h2 !== v && (R.fillStyle = h2, R.fillRect(t2, e2, s2, i2)), n2 && (R.lineWidth = n2.size, R.strokeStyle = n2.color, R.strokeRect(x + t2, x + e2, s2, i2)), this.applyReset(a2);
  }
  drawRoundRect(t2, e2, s2, i2, h2, n2 = v, o2, a2) {
    const r2 = a2 ? this.prepare(a2, t2, e2, s2, i2) : 0;
    R = this._ctx, n2 !== v && (R.fillStyle = n2, R.fillRect(t2, e2, s2, i2)), o2 && (R.lineWidth = o2.size, R.strokeStyle = o2.color, R.beginPath(), R.roundRect(x + t2, x + e2, s2, i2, h2), R.stroke()), this.applyReset(r2);
  }
  drawCircle(t2, e2, s2, i2 = v, h2, n2) {
    const o2 = n2 ? this.prepare(n2, t2, e2, 2 * s2, 2 * s2) : 0;
    R = this._ctx, R.beginPath(), R.arc(t2 + s2, e2 + s2, s2, 0, 2 * Math.PI, false), i2 !== v && (R.fillStyle = i2, R.fill()), h2 && (R.lineWidth = h2.size, R.strokeStyle = h2.color, R.closePath(), R.stroke()), this.applyReset(o2);
  }
  drawImage(t2, e2, s2, i2, h2, n2) {
    if (!this._bmp.has(t2))
      return;
    const o2 = n2 ? this.prepare(n2, e2, s2, i2, h2) : 0;
    void 0 === i2 ? this._ctx.drawImage(this._bmp.get(t2), e2, s2) : this._ctx.drawImage(this._bmp.get(t2), e2, s2, i2, h2), this._debug && this.drawRect(e2, s2, i2, h2, v, { size: 1, color: "red" }), this.applyReset(o2);
  }
  drawImageCropped(t2, e2, s2, i2, h2, n2, o2, a2, r2, d2) {
    if (!this._bmp.has(t2))
      return;
    if (d2 == null ? void 0 : d2.safeMode) {
      if (a2 <= 0 || r2 <= 0)
        return;
      const n3 = this._bmp.get(t2), o3 = (a2 = Math.min(this._ctx.canvas.width, a2)) / i2, d3 = (r2 = Math.min(this._ctx.canvas.height, r2)) / h2;
      e2 + i2 > n3.width && (a2 -= o3 * (e2 + i2 - n3.width), i2 -= e2 + i2 - n3.width), s2 + h2 > n3.height && (r2 -= d3 * (s2 + h2 - n3.height), h2 -= s2 + h2 - n3.height);
    }
    const l2 = d2 ? this.prepare(d2, n2, o2, a2, r2) : 0;
    this._ctx.drawImage(this._bmp.get(t2), x + e2 << 0, x + s2 << 0, x + i2 << 0, x + h2 << 0, x + n2 << 0, x + o2 << 0, x + a2 << 0, x + r2 << 0), this._debug && this.drawRect(n2, o2, a2, r2, v, { size: 1, color: "red" }), this.applyReset(l2);
  }
  drawText(t2, e2, s2, i2) {
    const { lines: h2, width: n2, height: o2 } = function(t3, e3) {
      l(t3, e3);
      const s3 = t3.text.split("\n"), i3 = [];
      let h3, n3 = 0, o3 = 0, a3 = e3.measureText("Wq");
      h3 = t3.lineHeight ? t3.lineHeight : a3.actualBoundingBoxAscent + a3.actualBoundingBoxDescent;
      const r2 = a3.actualBoundingBoxAscent;
      let d2 = 0;
      return s3.forEach((s4, l2) => {
        if (d2 = Math.round(r2 + l2 * h3), t3.spacing) {
          const e4 = s4.split("");
          n3 = Math.max(n3, e4.length * t3.spacing);
        } else
          a3 = e3.measureText(s4), n3 = Math.max(n3, a3.actualBoundingBoxRight);
        i3.push({ line: s4, top: d2 }), o3 += h3;
      }), { lines: i3, width: Math.ceil(n3), height: Math.ceil(o3) };
    }(t2, this._ctx);
    t2.center && (e2 -= n2 * x, s2 -= o2 * x);
    const a2 = i2 ? this.prepare(i2, e2, s2, n2, o2) : 0;
    !function(t3, e3, s3, i3, h3) {
      l(s3, t3);
      const n3 = s3.spacing ?? 1;
      e3.forEach(({ line: e4, top: o3 }) => {
        s3.spacing ? e4.split("").forEach((e5, s4) => {
          t3.fillText(e5, i3 + Math.round(s4 * n3), h3 + o3);
        }) : t3.fillText(e4, i3, h3 + o3);
      });
    }(this._ctx, h2, t2, e2, s2), this.applyReset(a2);
  }
  createPattern(t2, e2) {
    this._bmp.has(t2) && this._ptn.set(t2, this._ctx.createPattern(this._bmp.get(t2), e2));
  }
  drawPattern(t2, e2, s2, i2, h2) {
    if (!this._ptn.has(t2))
      return;
    const n2 = this._ptn.get(t2);
    this._ctx.fillStyle = n2, this._ctx.fillRect(e2, s2, i2, h2);
  }
  prepare(t2, e2, s2, i2, h2) {
    var _a, _b;
    const n2 = 1 !== t2.scale, o2 = 0 !== t2.rotation, a2 = 1 !== t2.alpha, r2 = void 0 !== t2.blendMode, d2 = a2 || r2, l2 = n2 || o2;
    if (d2)
      this.save();
    else if (!l2)
      return 0;
    if (l2) {
      const n3 = t2.scale ?? 1, o3 = ((_a = t2.pivot) == null ? void 0 : _a.x) ?? e2 + i2 * x, a3 = ((_b = t2.pivot) == null ? void 0 : _b.y) ?? s2 + h2 * x, r3 = t2.rotation * f, d3 = Math.cos(r3) * n3, l3 = Math.sin(r3) * n3;
      this._ctx[W](d3, l3, -l3, d3, o3 - o3 * d3 + a3 * l3, a3 - o3 * l3 - a3 * d3);
    }
    return r2 && this.setBlendMode(t2.blendMode), a2 && this.setAlpha(t2.alpha), d2 ? 1 : 2;
  }
  applyReset(t2) {
    2 === t2 ? this._ctx.setTransform(X, 0, 0, X, 0, 0) : 1 === t2 && this.restore();
  }
}
const L = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIHQodCxlKXtlLmZvbnQ9YCR7dC5zaXplfSR7dC51bml0fSAiJHt0LmZvbnR9ImAsZS5maWxsU3R5bGU9dC5jb2xvcn1jbGFzcyBle2NvbnN0cnVjdG9yKHQsZSl7dGhpcy5faW5kZXg9MCx0aGlzLl9tYXA9bmV3IE1hcCx0aGlzLl9jcmVhdGVGbj10LHRoaXMuX2Rlc3Ryb3lGbj1lfWRpc3Bvc2UoKXtjb25zdCB0PVsuLi50aGlzLl9tYXBdLm1hcCgoKFt0XSk9PnQpKTtmb3IoO3QubGVuZ3RoPjA7KXRoaXMucmVtb3ZlKHQuc2hpZnQoKSk7dGhpcy5fbWFwPXZvaWQgMH1nZXQodCl7cmV0dXJuIHRoaXMuX21hcC5nZXQodCl9c2V0KHQsZSl7aWYodGhpcy5oYXModCkpe2lmKHRoaXMuZ2V0KHQpPT09ZSlyZXR1cm47dGhpcy5yZW1vdmUodCl9dGhpcy5fbWFwLnNldCh0LGUpfWhhcyh0KXtyZXR1cm4gdGhpcy5fbWFwLmhhcyh0KX1yZW1vdmUodCl7dmFyIGU7aWYoIXRoaXMuaGFzKHQpKXJldHVybiExO2NvbnN0IHM9dGhpcy5nZXQodCk7cmV0dXJuIG51bGw9PShlPXRoaXMuX2Rlc3Ryb3lGbil8fGUuY2FsbCh0aGlzLHMpLHRoaXMuX21hcC5kZWxldGUodCl9bmV4dCgpe2xldCB0O2NvbnN0IGU9dGhpcy5faW5kZXgudG9TdHJpbmcoKTtyZXR1cm4gdGhpcy5oYXMoZSk/dD10aGlzLmdldChlKTp0aGlzLl9jcmVhdGVGbiYmKHQ9dGhpcy5fY3JlYXRlRm4oKSx0aGlzLnNldChlLHQpKSwrK3RoaXMuX2luZGV4LHR9ZmlsbCh0KXtjb25zdCBlPXRoaXMuX2luZGV4O2ZvcihsZXQgcz0wO3M8dDsrK3MpdGhpcy5uZXh0KCk7dGhpcy5faW5kZXg9ZX1yZXNldCgpe3RoaXMuX2luZGV4PTB9fWNvbnN0IHM9TWF0aC5QSS8xODAsaT0idHJhbnNwYXJlbnQiLGE9LjU7bGV0IG8scixuLGg9MSxjPSJzZXRUcmFuc2Zvcm0iO2NsYXNzIGx7Y29uc3RydWN0b3IodCxzPSExKXt0aGlzLl9kZWJ1Zz1zLHRoaXMuX2N2cz10LHRoaXMuX2N0eD10LmdldENvbnRleHQoIjJkIiksdGhpcy5fYm1wPW5ldyBlKHZvaWQgMCwodD0+e3QuY2xvc2UoKX0pKSx0aGlzLl9wdG49bmV3IGV9ZGlzcG9zZSgpe3RoaXMuX2JtcC5kaXNwb3NlKCksdGhpcy5fcHRuLmRpc3Bvc2UoKSx0aGlzLl9jdnM9dm9pZCAwfWNhY2hlUmVzb3VyY2UodCxlKXt0aGlzLl9ibXAuc2V0KHQsZSl9Z2V0UmVzb3VyY2UodCl7cmV0dXJuIHRoaXMuX2JtcC5nZXQodCl9ZGlzcG9zZVJlc291cmNlKHQpe3RoaXMuX2JtcC5yZW1vdmUodCl9c2V0RGltZW5zaW9ucyh0LGUpe3RoaXMuX2N2cy53aWR0aD10LHRoaXMuX2N2cy5oZWlnaHQ9ZX1zZXRTbW9vdGhpbmcodCl7Y29uc3QgZT10aGlzLl9jdHg7WyJpbWFnZVNtb290aGluZ0VuYWJsZWQiLCJtb3pJbWFnZVNtb290aGluZ0VuYWJsZWQiLCJvSW1hZ2VTbW9vdGhpbmdFbmFibGVkIiwid2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkIl0uZm9yRWFjaCgocz0+e3ZvaWQgMCE9PWVbc10mJihlW3NdPXQpfSkpfXNldFBpeGVsUmF0aW8odCl7aD10LGM9MT09PWg/InNldFRyYW5zZm9ybSI6InRyYW5zZm9ybSJ9c2F2ZSgpe3RoaXMuX2N0eC5zYXZlKCl9cmVzdG9yZSgpe3RoaXMuX2N0eC5yZXN0b3JlKCl9dHJhbnNsYXRlKHQsZSl7dGhpcy5fY3R4LnRyYW5zbGF0ZSh0LGUpfXJvdGF0ZSh0KXt0aGlzLl9jdHgucm90YXRlKHQpfXRyYW5zZm9ybSh0LGUscyxpLGEsbyl7dGhpcy5fY3R4LnRyYW5zZm9ybSh0LGUscyxpLGEsbyl9c2NhbGUodCxlPXQpe3RoaXMuX2N0eC5zY2FsZSh0LGUpfXNldEJsZW5kTW9kZSh0KXt0aGlzLl9jdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPXR9c2V0QWxwaGEodCl7dGhpcy5fY3R4Lmdsb2JhbEFscGhhPXR9ZHJhd1BhdGgodCxlPWkscyl7by5iZWdpblBhdGgoKSxvLm1vdmVUbyh0WzBdLngsdFswXS55KTtmb3IoY29uc3QgaSBvZiB0KW8ubGluZVRvKGkueCxpLnkpO2UhPT1pJiZvLmZpbGwoKSxzJiYoby5saW5lV2lkdGg9cy5zaXplLG8uc3Ryb2tlU3R5bGU9cy5jb2xvcixvLnN0cm9rZSgpKSxvLmNsb3NlUGF0aCgpfWNsZWFyUmVjdCh0LGUscyxpLGEpe2NvbnN0IG89YT90aGlzLnByZXBhcmUoYSx0LGUscyxpKTowO3RoaXMuX2N0eC5jbGVhclJlY3QodCxlLHMsaSksdGhpcy5hcHBseVJlc2V0KG8pfWRyYXdSZWN0KHQsZSxzLHIsbj1pLGgsYyl7Y29uc3QgbD1jP3RoaXMucHJlcGFyZShjLHQsZSxzLHIpOjA7bz10aGlzLl9jdHgsbiE9PWkmJihvLmZpbGxTdHlsZT1uLG8uZmlsbFJlY3QodCxlLHMscikpLGgmJihvLmxpbmVXaWR0aD1oLnNpemUsby5zdHJva2VTdHlsZT1oLmNvbG9yLG8uc3Ryb2tlUmVjdChhK3QsYStlLHMscikpLHRoaXMuYXBwbHlSZXNldChsKX1kcmF3Um91bmRSZWN0KHQsZSxzLHIsbixoPWksYyxsKXtjb25zdCBkPWw/dGhpcy5wcmVwYXJlKGwsdCxlLHMscik6MDtvPXRoaXMuX2N0eCxoIT09aSYmKG8uZmlsbFN0eWxlPWgsby5maWxsUmVjdCh0LGUscyxyKSksYyYmKG8ubGluZVdpZHRoPWMuc2l6ZSxvLnN0cm9rZVN0eWxlPWMuY29sb3Isby5iZWdpblBhdGgoKSxvLnJvdW5kUmVjdChhK3QsYStlLHMscixuKSxvLnN0cm9rZSgpKSx0aGlzLmFwcGx5UmVzZXQoZCl9ZHJhd0NpcmNsZSh0LGUscyxhPWkscixuKXtjb25zdCBoPW4/dGhpcy5wcmVwYXJlKG4sdCxlLDIqcywyKnMpOjA7bz10aGlzLl9jdHgsby5iZWdpblBhdGgoKSxvLmFyYyh0K3MsZStzLHMsMCwyKk1hdGguUEksITEpLGEhPT1pJiYoby5maWxsU3R5bGU9YSxvLmZpbGwoKSksciYmKG8ubGluZVdpZHRoPXIuc2l6ZSxvLnN0cm9rZVN0eWxlPXIuY29sb3Isby5jbG9zZVBhdGgoKSxvLnN0cm9rZSgpKSx0aGlzLmFwcGx5UmVzZXQoaCl9ZHJhd0ltYWdlKHQsZSxzLGEsbyxyKXtpZighdGhpcy5fYm1wLmhhcyh0KSlyZXR1cm47Y29uc3Qgbj1yP3RoaXMucHJlcGFyZShyLGUscyxhLG8pOjA7dm9pZCAwPT09YT90aGlzLl9jdHguZHJhd0ltYWdlKHRoaXMuX2JtcC5nZXQodCksZSxzKTp0aGlzLl9jdHguZHJhd0ltYWdlKHRoaXMuX2JtcC5nZXQodCksZSxzLGEsbyksdGhpcy5fZGVidWcmJnRoaXMuZHJhd1JlY3QoZSxzLGEsbyxpLHtzaXplOjEsY29sb3I6InJlZCJ9KSx0aGlzLmFwcGx5UmVzZXQobil9ZHJhd0ltYWdlQ3JvcHBlZCh0LGUscyxvLHIsbixoLGMsbCxkKXtpZighdGhpcy5fYm1wLmhhcyh0KSlyZXR1cm47aWYobnVsbD09ZD92b2lkIDA6ZC5zYWZlTW9kZSl7aWYoYzw9MHx8bDw9MClyZXR1cm47Y29uc3QgaT10aGlzLl9ibXAuZ2V0KHQpLGE9KGM9TWF0aC5taW4odGhpcy5fY3R4LmNhbnZhcy53aWR0aCxjKSkvbyxuPShsPU1hdGgubWluKHRoaXMuX2N0eC5jYW52YXMuaGVpZ2h0LGwpKS9yO2Urbz5pLndpZHRoJiYoYy09YSooZStvLWkud2lkdGgpLG8tPWUrby1pLndpZHRoKSxzK3I+aS5oZWlnaHQmJihsLT1uKihzK3ItaS5oZWlnaHQpLHItPXMrci1pLmhlaWdodCl9Y29uc3QgcD1kP3RoaXMucHJlcGFyZShkLG4saCxjLGwpOjA7dGhpcy5fY3R4LmRyYXdJbWFnZSh0aGlzLl9ibXAuZ2V0KHQpLGErZTw8MCxhK3M8PDAsYStvPDwwLGErcjw8MCxhK248PDAsYStoPDwwLGErYzw8MCxhK2w8PDApLHRoaXMuX2RlYnVnJiZ0aGlzLmRyYXdSZWN0KG4saCxjLGwsaSx7c2l6ZToxLGNvbG9yOiJyZWQifSksdGhpcy5hcHBseVJlc2V0KHApfWRyYXdUZXh0KGUscyxpLG8pe2NvbnN0e2xpbmVzOnIsd2lkdGg6bixoZWlnaHQ6aH09ZnVuY3Rpb24oZSxzKXt0KGUscyk7Y29uc3QgaT1lLnRleHQuc3BsaXQoIlxuIiksYT1bXTtsZXQgbyxyPTAsbj0wLGg9cy5tZWFzdXJlVGV4dCgiV3EiKTtvPWUubGluZUhlaWdodD9lLmxpbmVIZWlnaHQ6aC5hY3R1YWxCb3VuZGluZ0JveEFzY2VudCtoLmFjdHVhbEJvdW5kaW5nQm94RGVzY2VudDtjb25zdCBjPWguYWN0dWFsQm91bmRpbmdCb3hBc2NlbnQ7bGV0IGw9MDtyZXR1cm4gaS5mb3JFYWNoKCgodCxpKT0+e2lmKGw9TWF0aC5yb3VuZChjK2kqbyksZS5zcGFjaW5nKXtjb25zdCBzPXQuc3BsaXQoIiIpO3I9TWF0aC5tYXgocixzLmxlbmd0aCplLnNwYWNpbmcpfWVsc2UgaD1zLm1lYXN1cmVUZXh0KHQpLHI9TWF0aC5tYXgocixoLmFjdHVhbEJvdW5kaW5nQm94UmlnaHQpO2EucHVzaCh7bGluZTp0LHRvcDpsfSksbis9b30pKSx7bGluZXM6YSx3aWR0aDpNYXRoLmNlaWwociksaGVpZ2h0Ok1hdGguY2VpbChuKX19KGUsdGhpcy5fY3R4KTtlLmNlbnRlciYmKHMtPW4qYSxpLT1oKmEpO2NvbnN0IGM9bz90aGlzLnByZXBhcmUobyxzLGksbixoKTowOyFmdW5jdGlvbihlLHMsaSxhLG8pe3QoaSxlKTtjb25zdCByPWkuc3BhY2luZz8/MTtzLmZvckVhY2goKCh7bGluZTp0LHRvcDpzfSk9PntpLnNwYWNpbmc/dC5zcGxpdCgiIikuZm9yRWFjaCgoKHQsaSk9PntlLmZpbGxUZXh0KHQsYStNYXRoLnJvdW5kKGkqciksbytzKX0pKTplLmZpbGxUZXh0KHQsYSxvK3MpfSkpfSh0aGlzLl9jdHgscixlLHMsaSksdGhpcy5hcHBseVJlc2V0KGMpfWNyZWF0ZVBhdHRlcm4odCxlKXt0aGlzLl9ibXAuaGFzKHQpJiZ0aGlzLl9wdG4uc2V0KHQsdGhpcy5fY3R4LmNyZWF0ZVBhdHRlcm4odGhpcy5fYm1wLmdldCh0KSxlKSl9ZHJhd1BhdHRlcm4odCxlLHMsaSxhKXtpZighdGhpcy5fcHRuLmhhcyh0KSlyZXR1cm47Y29uc3Qgbz10aGlzLl9wdG4uZ2V0KHQpO3RoaXMuX2N0eC5maWxsU3R5bGU9byx0aGlzLl9jdHguZmlsbFJlY3QoZSxzLGksYSl9cHJlcGFyZSh0LGUsaSxvLHIpe3ZhciBuLGg7Y29uc3QgbD0xIT09dC5zY2FsZSxkPTAhPT10LnJvdGF0aW9uLHA9MSE9PXQuYWxwaGEsbT12b2lkIDAhPT10LmJsZW5kTW9kZSxnPXB8fG0sdT1sfHxkO2lmKGcpdGhpcy5zYXZlKCk7ZWxzZSBpZighdSlyZXR1cm4gMDtpZih1KXtjb25zdCBsPXQuc2NhbGU/PzEsZD0obnVsbD09KG49dC5waXZvdCk/dm9pZCAwOm4ueCk/P2UrbyphLHA9KG51bGw9PShoPXQucGl2b3QpP3ZvaWQgMDpoLnkpPz9pK3IqYSxtPXQucm90YXRpb24qcyxnPU1hdGguY29zKG0pKmwsdT1NYXRoLnNpbihtKSpsO3RoaXMuX2N0eFtjXShnLHUsLXUsZyxkLWQqZytwKnUscC1kKnUtcCpnKX1yZXR1cm4gbSYmdGhpcy5zZXRCbGVuZE1vZGUodC5ibGVuZE1vZGUpLHAmJnRoaXMuc2V0QWxwaGEodC5hbHBoYSksZz8xOjJ9YXBwbHlSZXNldCh0KXsyPT09dD90aGlzLl9jdHguc2V0VHJhbnNmb3JtKGgsMCwwLGgsMCwwKToxPT09dCYmdGhpcy5yZXN0b3JlKCl9fW9ubWVzc2FnZT10PT57c3dpdGNoKHQuZGF0YS5jbWQpe2RlZmF1bHQ6YnJlYWs7Y2FzZSJpbml0IjpuPXQuZGF0YS5jYW52YXMscj1uZXcgbChuLHQuZGF0YS5kZWJ1Zyk7YnJlYWs7Y2FzZSJsb2FkUmVzb3VyY2UiOiFhc3luYyBmdW5jdGlvbih0LGUpe3RyeXtsZXQgcztpZihlIGluc3RhbmNlb2YgRmlsZSl7Y29uc3QgdD1hd2FpdCBhc3luYyBmdW5jdGlvbih0KXtjb25zdCBlPW5ldyBGaWxlUmVhZGVyO3JldHVybiBuZXcgUHJvbWlzZSgoKHMsaSk9PntlLm9ubG9hZD1lPT57dmFyIGE7aWYoIShudWxsPT0oYT1udWxsPT1lP3ZvaWQgMDplLnRhcmdldCk/dm9pZCAwOmEucmVzdWx0KSlyZXR1cm4gaSgpO3MobmV3IEJsb2IoW2UudGFyZ2V0LnJlc3VsdF0se3R5cGU6dC50eXBlfSkpfSxlLm9uZXJyb3I9dD0+aSh0KSxlLnJlYWRBc0FycmF5QnVmZmVyKHQpfSkpfShlKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKHQpfWVsc2UgaWYoZSBpbnN0YW5jZW9mIEJsb2Ipcz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcChlKTtlbHNlIGlmKCJzdHJpbmciPT10eXBlb2YgZSl7Y29uc3QgdD1hd2FpdCBmZXRjaChlKSxpPWF3YWl0IHQuYmxvYigpO3M9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoaSl9ZWxzZSBlIGluc3RhbmNlb2YgSW1hZ2VCaXRtYXAmJihzPWUpO251bGw9PXJ8fHIuY2FjaGVSZXNvdXJjZSh0LHMpLHBvc3RNZXNzYWdlKHtjbWQ6Im9ubG9hZCIsaWQ6dCxzaXplOnt3aWR0aDpzLndpZHRoLGhlaWdodDpzLmhlaWdodH19KX1jYXRjaChzKXtwb3N0TWVzc2FnZSh7Y21kOiJvbmVycm9yIixpZDp0LGVycm9yOihudWxsPT1zP3ZvaWQgMDpzLm1lc3NhZ2UpPz9zfSl9fSh0LmRhdGEuaWQsdC5kYXRhLnNvdXJjZSk7YnJlYWs7Y2FzZSJnZXRSZXNvdXJjZSI6Y29uc3QgZT1udWxsPT1yP3ZvaWQgMDpyLmdldFJlc291cmNlKHQuZGF0YS5pZCk7cG9zdE1lc3NhZ2Uoe2NtZDoib25yZXNvdXJjZSIsaWQ6dC5kYXRhLmlkLGJpdG1hcDplfSk7YnJlYWs7Y2FzZSJkaXNwb3NlUmVzb3VyY2UiOm51bGw9PXJ8fHIuZGlzcG9zZVJlc291cmNlKC4uLnQuZGF0YS5hcmdzKTticmVhaztjYXNlImRpc3Bvc2UiOm51bGw9PXJ8fHIuZGlzcG9zZSgpLG49dm9pZCAwLHI9dm9pZCAwO2JyZWFrO2Nhc2UicmVuZGVyIjppZighcnx8IXQuZGF0YS5jb21tYW5kcylyZXR1cm47Zm9yKGNvbnN0IHMgb2YgdC5kYXRhLmNvbW1hbmRzKXtjb25zdCB0PXMuc2hpZnQoKTtyW3RdKC4uLnMpfXBvc3RNZXNzYWdlKHtjbWQ6Im9ucmVuZGVyIn0pO2JyZWFrO2Nhc2Uic2V0RGltZW5zaW9ucyI6Y2FzZSJzZXRQaXhlbFJhdGlvIjpjYXNlInNldFNtb290aGluZyI6Y2FzZSJjcmVhdGVQYXR0ZXJuIjpyW3QuZGF0YS5jbWRdKC4uLnQuZGF0YS5hcmdzKX19fSgpOwo=", S = "undefined" != typeof window && window.Blob && new Blob([atob(L)], { type: "text/javascript;charset=utf-8" });
function Y() {
  let t2;
  try {
    if (t2 = S && (window.URL || window.webkitURL).createObjectURL(S), !t2)
      throw "";
    return new Worker(t2);
  } catch (t3) {
    return new Worker("data:application/javascript;base64," + L);
  } finally {
    t2 && (window.URL || window.webkitURL).revokeObjectURL(t2);
  }
}
class z {
  constructor(t2, e2 = false, s2 = false) {
    if (this._useW = false, this._el = t2, e2 && "function" == typeof this._el.transferControlToOffscreen) {
      this._useW = true, this._cbs = /* @__PURE__ */ new Map(), this._pl = new c(() => [], (t3) => {
        t3.length = 0;
      }), this._pl.fill(1e3), this._cmds = [];
      const e3 = t2.transferControlToOffscreen();
      this._wkr = new Y(), this._wkr.postMessage({ cmd: "init", canvas: e3, debug: s2 }, [e3]), this._wkr.onmessage = this.handleMessage.bind(this);
    } else
      this._rdr = new C(this._el, s2);
  }
  loadResource(t2, e2) {
    return new Promise(async (s2, i2) => {
      if (e2 instanceof ImageBitmap)
        this._useW ? this.wrappedWorkerLoad(t2, e2, s2, i2, true) : (this._rdr.cacheResource(t2, e2), s2({ width: e2.width, height: e2.height }));
      else if ("string" != typeof e2) {
        if (e2 instanceof HTMLImageElement || e2 instanceof HTMLCanvasElement) {
          const i3 = await h(e2);
          return this.loadResource(t2, i3).then((t3) => s2(t3));
        }
        if (e2 instanceof File)
          if (this._useW)
            this.wrappedWorkerLoad(t2, e2, s2, i2);
          else {
            const h2 = await a(e2);
            this.wrappedLoad(t2, h2, s2, i2);
          }
        else
          e2 instanceof Blob ? this._useW ? this.wrappedWorkerLoad(t2, e2, s2, i2) : this.wrappedLoad(t2, e2, s2, i2) : i2("Unsupported resource type: " + typeof e2);
      } else if (e2 = e2.startsWith("./") ? new URL(e2, document.baseURI).href : e2, this._useW)
        this.wrappedWorkerLoad(t2, e2, s2, i2);
      else {
        const h2 = await r.loadImage(e2);
        this.wrappedLoad(t2, h2.image, s2, i2);
      }
    });
  }
  getResource(t2) {
    return new Promise((e2, s2) => {
      this._useW ? (this._cbs.set(t2, { resolve: e2, reject: s2 }), this._wkr.postMessage({ cmd: "getResource", id: t2 })) : e2(this._rdr.getResource(t2));
    });
  }
  disposeResource(t2) {
    this.getBackend("disposeResource", t2);
  }
  onCommandsReady() {
    this._useW && (this._wkr.postMessage({ cmd: "render", commands: this._cmds }), this._cmds.length = 0, this._pl.reset());
  }
  dispose() {
    this.getBackend("dispose"), setTimeout(() => {
      var _a, _b;
      (_a = this._wkr) == null ? void 0 : _a.terminate(), this._wkr = void 0, (_b = this._cbs) == null ? void 0 : _b.clear();
    }, 50);
  }
  handleMessage(t2) {
    const { cmd: e2, id: s2 } = t2.data;
    switch (e2) {
      default:
        break;
      case "onload":
        if (!this._cbs.has(s2))
          return;
        this._cbs.get(s2).resolve(t2.data.size), this._cbs.delete(s2);
        break;
      case "onerror":
        if (!this._cbs.has(s2))
          return;
        this._cbs.get(s2).reject(new Error(t2.data.error)), this._cbs.delete(s2);
        break;
      case "onresource":
        this._cbs.get(s2).resolve(t2.data.bitmap), this._cbs.delete(s2);
    }
  }
  wrappedWorkerLoad(t2, e2, s2, i2, h2 = false) {
    this._cbs.set(t2, { resolve: s2, reject: i2 }), this._wkr.postMessage({ cmd: "loadResource", source: e2, id: t2 }, h2 ? [e2] : []);
  }
  async wrappedLoad(t2, e2, s2, i2) {
    try {
      const i3 = await h(e2);
      this._rdr.cacheResource(t2, i3), s2({ width: i3.width, height: i3.height });
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
  drawPath(t2, e2, s2) {
    this.onDraw("drawPath", t2, e2, s2);
  }
  clearRect(t2, e2, s2, i2, h2) {
    this.onDraw("clearRect", t2, e2, s2, i2, h2);
  }
  drawRect(t2, e2, s2, i2, h2, n2, o2) {
    this.onDraw("drawRect", t2, e2, s2, i2, h2, n2, o2);
  }
  drawRoundRect(t2, e2, s2, i2, h2, n2, o2, a2) {
    this.onDraw("drawRoundRect", t2, e2, s2, i2, h2, n2, o2, a2);
  }
  drawCircle(t2, e2, s2, i2 = "transparent", h2, n2) {
    this.onDraw("drawCircle", t2, e2, s2, i2, h2, n2);
  }
  drawImage(t2, e2, s2, i2, h2, n2) {
    this.onDraw("drawImage", t2, e2, s2, i2, h2, n2);
  }
  drawImageCropped(t2, e2, s2, i2, h2, n2, o2, a2, r2, d2) {
    this.onDraw("drawImageCropped", t2, e2, s2, i2, h2, n2, o2, a2, r2, d2);
  }
  drawText(t2, e2, s2, i2) {
    this.onDraw("drawText", t2, e2, s2, i2);
  }
  drawPattern(t2, e2, s2, i2, h2) {
    this.onDraw("drawPattern", t2, e2, s2, i2, h2);
  }
  onDraw(t2, ...e2) {
    if (this._useW) {
      const s2 = this._pl.next();
      return s2.length = 0, s2.push(t2, ...e2), void this._cmds.push(s2);
    }
    this._rdr[t2](...e2);
  }
  getBackend(t2, ...e2) {
    if (this._useW)
      return this._wkr.postMessage({ cmd: t2, args: [...e2] });
    this._rdr[t2](...e2);
  }
}
const H = { x: 0, y: 0 };
function K(t2, e2, s2, i2, h2) {
  return (t2 - e2) / (s2 - e2) * (h2 - i2) + i2;
}
const k = [], I = [], M = s(1, 1, true).cvs;
class F {
  constructor(t2) {
    this._renderer = t2, this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  getChildrenInArea(t2, e2, s2, i2, h2, n2 = false) {
    const o2 = [];
    let a2, r2, d2, l2, c2, p2 = t2.length;
    for (; p2--; )
      a2 = t2[p2], r2 = a2.getX(), d2 = a2.getY(), l2 = a2.getWidth(), c2 = a2.getHeight(), r2 < e2 + i2 && r2 + l2 > e2 && d2 < s2 + h2 && d2 + c2 > s2 && (!n2 || n2 && a2.collidable) && o2.push(a2);
    return o2;
  }
  pixelCollision(t2, e2) {
    const s2 = t2.getIntersection(e2);
    if (void 0 === s2)
      return;
    this.getPixelArray(t2, s2, k), this.getPixelArray(e2, s2, I);
    const i2 = s2.width, h2 = s2.height;
    let n2 = 0;
    for (let t3 = 0; t3 < h2; ++t3)
      for (let e3 = 0; e3 < i2; ++e3) {
        if (1 === k[n2] && 1 === I[n2])
          return { x: e3, y: t3 };
        ++n2;
      }
  }
  async cache(t2) {
    const e2 = await this._renderer.getResource(t2);
    if (!e2)
      return false;
    const { width: s2, height: i2 } = e2;
    !function(t3, e3, s3, i3) {
      o(t3, e3, s3, i3);
    }(M, e2, s2, i2);
    const { data: h2 } = M.getContext("2d").getImageData(0, 0, s2, i2), n2 = new Uint8Array(h2.length / 4);
    for (let t3 = 0, e3 = n2.length; t3 < e3; ++t3) {
      const e4 = h2[4 * t3 + 3];
      n2[t3] = e4 < 5 ? 0 : 1;
    }
    return this._cacheMap.set(t2, { mask: n2, size: { width: s2, height: i2 } }), M.width = M.height = 1, true;
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
    const h2 = t2.getBounds(), n2 = Z(e2.left - h2.left), o2 = Z(e2.top - h2.top), a2 = Z(e2.width), r2 = Z(e2.height), { mask: d2, size: l2 } = this._cacheMap.get(i2);
    if (a2 <= 0 || r2 <= 0)
      return void (s2.length = 0);
    s2.length = Z(a2 * r2);
    const c2 = l2.height, p2 = l2.width, u2 = n2 + a2, g2 = o2 + r2;
    let m2 = -1, _2 = 0;
    for (let t3 = o2; t3 < g2; ++t3)
      for (let e3 = n2; e3 < u2; ++e3)
        _2 = e3 >= p2 || t3 >= c2 ? 0 : d2[t3 * p2 + e3], s2[++m2] = _2;
  }
}
class P {
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
const { min: V, max: N } = Math;
class Q extends P {
  constructor({ width: t2 = 300, height: e2 = 300, fps: s2 = 60, backgroundColor: i2 = null, animate: h2 = false, smoothing: n2 = true, stretchToFit: o2 = false, autoSize: a2 = true, viewport: r2 = null, preventEventBubbling: d2 = false, parentElement: l2 = null, debug: c2 = false, optimize: p2 = "auto", viewportHandler: u2, onUpdate: g2, onResize: m2 } = {}) {
    if (super(), this.DEBUG = false, this.bbox = { left: 0, top: 0, right: 0, bottom: 0 }, this._smooth = false, this._stretch = false, this._pxr = 1, this._prevDef = false, this._lastRender = 0, this._renderId = 0, this._renderPending = false, this._disposed = false, this._scale = { x: 1, y: 1 }, this._aTchs = [], this._animate = false, this._isFs = false, this._hasFsH = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = c2, this._el = document.createElement("canvas"), this._rdr = new z(this._el, function(t3) {
      if ("worker" === t3)
        return true;
      const { userAgent: e3 } = navigator, s3 = e3.includes("Safari") && !e3.includes("Chrome");
      return "auto" === t3 && !s3;
    }(p2), c2), this.collision = new F(this._rdr), this._upHdlr = g2, this._renHdlr = this.render.bind(this), this._vpHdlr = u2, this._resHdrl = m2, this.setFrameRate(s2), this.setAnimatable(h2), i2 && this.setBackgroundColor(i2), this._pxr = window.devicePixelRatio || 1, this._rdr.setPixelRatio(this._pxr), this.setDimensions(t2, e2, true, true), r2 && this.setViewport(r2.width, r2.height), this._stretch = o2, this.setSmoothing(n2), this.preventEventBubbling(d2), this.addListeners(a2), l2 instanceof HTMLElement && this.insertInPage(l2), requestAnimationFrame(() => this.handleResize());
  }
  loadResource(t2, e2) {
    return this._rdr.loadResource(t2, e2);
  }
  getResource(t2) {
    return this._rdr.getResource(t2);
  }
  disposeResource(t2) {
    return this._rdr.disposeResource(t2);
  }
  getRenderer() {
    return this._rdr;
  }
  insertInPage(t2) {
    if (this._el.parentNode)
      throw new Error("Canvas already present in DOM");
    t2.appendChild(this._el);
  }
  getElement() {
    return this._el;
  }
  preventEventBubbling(t2) {
    this._prevDef = t2;
  }
  addChild(t2) {
    return t2.setCanvas(this), super.addChild(t2);
  }
  invalidate() {
    this._animate || this._renderPending || (this._renderPending = true, this._renderId = window.requestAnimationFrame(this._renHdlr));
  }
  getFrameRate() {
    return this._fps;
  }
  setFrameRate(t2) {
    this._fps = t2, this._aFps = t2, this._rIval = 1e3 / t2;
  }
  getActualFrameRate() {
    return this._aFps;
  }
  getRenderInterval() {
    return this._rIval;
  }
  getSmoothing() {
    return this._smooth;
  }
  setSmoothing(t2) {
    this._rdr.setSmoothing(t2), t2 ? this._el.style["image-rendering"] = "" : ["-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges"].forEach((t3) => {
      this._el.style["image-rendering"] = t3;
    }), this._smooth = t2, this.invalidate();
  }
  getWidth() {
    return this._qSize ? this._qSize.width : this._width;
  }
  getHeight() {
    return this._qSize ? this._qSize.height : this._height;
  }
  setDimensions(t2, e2, s2 = true, i2 = false) {
    this._qSize = { width: t2, height: e2 }, s2 && (this._prefWidth = t2, this._prefHeight = e2), i2 && this.updateCanvasSize(), this.invalidate();
  }
  getViewport() {
    return this._vp;
  }
  setViewport(t2, e2) {
    this._vp || (this._vp = { width: t2, height: e2, left: 0, top: 0, right: t2, bottom: e2 });
    const s2 = this._vp;
    s2.width = t2, s2.height = e2, this.panViewport(Math.min(s2.left, t2), Math.min(s2.top, e2));
  }
  panViewport(t2, e2, s2 = false) {
    var _a;
    const i2 = this._vp;
    i2.left = N(0, V(t2, this._width - i2.width)), i2.right = i2.left + i2.width, i2.top = N(0, V(e2, this._height - i2.height)), i2.bottom = i2.top + i2.height, this.invalidate(), s2 && ((_a = this._vpHdlr) == null ? void 0 : _a.call(this, { type: "panned", value: i2 }));
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
    const s2 = 1 === t2 && 1 === e2 ? "" : `scale(${t2}, ${e2})`, { style: i2 } = this._el;
    i2["-webkit-transform-origin"] = i2["transform-origin"] = "0 0", i2["-webkit-transform"] = i2.transform = s2, this.invalidate();
  }
  stretchToFit(t2) {
    this._stretch = t2, this.handleResize();
  }
  setFullScreen(t2, e2 = false) {
    if (e2 || (e2 = this._stretch), !this._hasFsH) {
      this._hasFsH = true;
      const t3 = document, s2 = () => {
        this._isFs = t3.webkitIsFullScreen || t3.mozFullScreen || true === t3.msFullscreenElement, e2 && (this._stretch = this._isFs);
      };
      ["webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange"].forEach((e3) => {
        this._hdlr.add(t3, e3, s2);
      });
    }
    t2 !== this._isFs && function(t3) {
      let e3;
      e3 = t3.fullscreenElement || t3.webkitFullscreenElement ? t3.exitFullscreen || t3.webkitExitFullscreen || t3.mozCancelFullScreen || t3.msExitFullscreen : t3.requestFullScreen || t3.webkitRequestFullScreen || t3.mozRequestFullScreen || t3.msRequestFullscreen, e3 && e3.call(t3);
    }(this._el);
  }
  getCoordinate() {
    return void 0 === this._coords && (this._coords = this._el.getBoundingClientRect()), this._coords;
  }
  dispose() {
    this._disposed || (this._animate = false, window.cancelAnimationFrame(this._renderId), this.removeListeners(), super.dispose(), this._el.parentNode && this._el.parentNode.removeChild(this._el), requestAnimationFrame(() => {
      this._rdr.dispose(), this._rdr = void 0, this.collision.dispose(), this.collision = void 0;
    }), this._disposed = true);
  }
  handleInteraction(t2) {
    const e2 = this._children.length, s2 = this._vp;
    let i2;
    if (e2 > 0)
      switch (i2 = this._children[e2 - 1], t2.type) {
        default:
          let h2 = 0, n2 = 0;
          const o2 = t2.changedTouches;
          let a2 = 0, r2 = o2.length;
          const d2 = 1 / this._scale.x, l2 = 1 / this._scale.y;
          if (r2 > 0) {
            let { x: c3, y: p3 } = this.getCoordinate();
            for (s2 && (c3 -= s2.left, p3 -= s2.top), a2 = 0; a2 < r2; ++a2) {
              const s3 = o2[a2], { identifier: r3 } = s3;
              if (h2 = s3.pageX * d2 - c3, n2 = s3.pageY * l2 - p3, "touchstart" === t2.type) {
                for (; i2; ) {
                  if (!this._aTchs.includes(i2) && i2.handleInteraction(h2, n2, t2)) {
                    this._aTchs[r3] = i2;
                    break;
                  }
                  i2 = i2.last;
                }
                i2 = this._children[e2 - 1];
              } else
                i2 = this._aTchs[r3], (i2 == null ? void 0 : i2.handleInteraction(h2, n2, t2)) && "touchmove" !== t2.type && (this._aTchs[r3] = null);
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: c2, offsetY: p2 } = t2;
          if (this._isFs) {
            const e3 = function(t3, e4, s3, i3, h3) {
              const n3 = window.innerHeight / h3, o3 = 0.5 * (window.innerWidth - i3 * n3);
              return H.x = K(t3.clientX - s3.left - o3, 0, i3 * n3, 0, e4.width), H.y = K(t3.clientY - s3.top, 0, h3 * n3, 0, e4.height), H;
            }(t2, this._el, this.getCoordinate(), this._width, this._height);
            c2 = e3.x / this._pxr, p2 = e3.y / this._pxr;
          }
          for (s2 && (c2 += s2.left, p2 += s2.top); i2 && !i2.handleInteraction(c2, p2, t2); )
            i2 = i2.last;
          break;
        case "wheel":
          const { deltaX: u2, deltaY: g2 } = t2, m2 = 20, _2 = 0 === u2 ? 0 : u2 > 0 ? m2 : -m2, b2 = 0 === g2 ? 0 : g2 > 0 ? m2 : -m2;
          this.panViewport(s2.left + _2, s2.top + b2, true);
      }
    this._prevDef && (t2.stopPropagation(), t2.preventDefault()), this._animate || this.invalidate();
  }
  render(t2 = 0) {
    this._renderPending = false;
    const e2 = t2 - this._lastRender;
    if (this._animate && e2 / this._rIval < 0.999)
      return this._renderId = window.requestAnimationFrame(this._renHdlr), void (this._lastRaf = t2);
    let s2, i2;
    this._aFps = 1e3 / (t2 - this._lastRaf), s2 = this._fps > 60 ? this._fps / this._aFps : 60 === this._fps && this._aFps > 63 ? 1 : 1 / (this._fps / this._aFps), this._lastRaf = t2, this._lastRender = t2 - e2 % this._rIval, this._qSize && this.updateCanvasSize();
    const h2 = this._width, n2 = this._height;
    this._bgColor ? this._rdr.drawRect(0, 0, h2, n2, this._bgColor) : this._rdr.clearRect(0, 0, h2, n2);
    const o2 = "function" == typeof this._upHdlr;
    for (o2 && this._upHdlr(t2, s2), i2 = this._children[0]; i2; )
      o2 || i2.update(t2, s2), i2.draw(this._rdr, this._vp), i2 = i2.next;
    this._rdr.onCommandsReady(), !this._disposed && this._animate && (this._renderPending = true, this._renderId = window.requestAnimationFrame(this._renHdlr));
  }
  addListeners(e2 = false) {
    this._hdlr || (this._hdlr = new t());
    const s2 = this._hdlr, i2 = this.handleInteraction.bind(this), h2 = this._el;
    "ontouchstart" in window && ["start", "move", "end", "cancel"].forEach((t2) => {
      s2.add(h2, `touch${t2}`, i2);
    }), ["down", "move"].forEach((t2) => {
      s2.add(h2, `mouse${t2}`, i2);
    }), s2.add(window, "mouseup", i2), this._vp && s2.add(h2, "wheel", i2), e2 && s2.add(window, "resize", this.handleResize.bind(this));
  }
  removeListeners() {
    var _a;
    (_a = this._hdlr) == null ? void 0 : _a.dispose(), this._hdlr = void 0;
  }
  handleResize() {
    const { innerWidth: t2, innerHeight: e2 } = window;
    let s2 = this._prefWidth, i2 = this._prefHeight, h2 = 1;
    if (!this._vp && this._stretch) {
      const { width: n2, height: o2 } = function(t3, e3, s3, i3) {
        const h3 = s3 / i3;
        let n3 = t3, o3 = e3;
        return t3 / e3 > h3 ? o3 = t3 / h3 : n3 = e3 * h3, { width: n3, height: o3 };
      }(s2, i2, t2, e2);
      h2 = t2 / n2, this.setDimensions(n2, o2, false, true);
    } else
      V(s2, t2), this.setDimensions(s2, i2, false), this._vp || s2 > t2 && (h2 = t2 / s2);
    this.scale(h2);
  }
  updateCanvasSize() {
    var _a;
    const t2 = this._smooth ? this._pxr : 1;
    let e2, s2;
    if (void 0 !== this._qSize && ({ width: e2, height: s2 } = this._qSize, this._qSize = void 0, this._width = e2, this._height = s2, this.bbox.right = e2, this.bbox.bottom = s2), this._vp) {
      const t3 = this._width, i2 = this._height;
      e2 = V(this._vp.width, t3), s2 = V(this._vp.height, i2);
    }
    if (e2 && s2) {
      const i2 = this.getElement();
      this._rdr.setDimensions(e2 * t2, s2 * t2), i2.style.width = `${e2}px`, i2.style.height = `${s2}px`, (_a = this._resHdrl) == null ? void 0 : _a.call(this, e2, s2);
    }
    this._rdr.scale(t2), this.setSmoothing(this._smooth), this._coords = void 0;
  }
}
const { min: J, max: B } = Math, U = 0.5;
class T extends P {
  constructor({ resourceId: t2, x: e2 = 0, y: s2 = 0, width: i2 = 10, height: h2 = 10, rotation: n2 = 0, collidable: o2 = false, interactive: a2 = false, mask: r2 = false, sheet: d2 }) {
    if (super(), this.hover = false, this.isDragging = false, this._mask = false, this._interactive = false, this._draggable = false, this._keepInBounds = false, this._pressed = false, i2 <= 0 || h2 <= 0)
      throw new Error("cannot construct a Sprite without valid dimensions");
    if (this.collidable = o2, this._mask = r2, this._bounds = { left: e2, top: s2, width: i2, height: h2 }, r2 && this.gdp(), 0 !== n2 && this.setRotation(n2), t2 && this.setResource(t2), d2) {
      if (!t2)
        throw new Error("cannot use a spritesheet without a valid resource id");
      this.setSheet(d2, i2, h2);
    }
    this.setInteractive(a2);
  }
  getDraggable() {
    return this._draggable;
  }
  setDraggable(t2, e2 = false) {
    this._draggable = t2, this._keepInBounds = !!this._cstrt || e2, t2 && !this._interactive && this.setInteractive(true);
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
    if (0 === e2)
      return;
    this._bounds.left = this._cstrt ? t2 + this._cstrt.left : t2, this._tfb && (this._tfb.left += e2);
    let s2 = this._children[0];
    for (; s2; )
      s2.isDragging || s2.setX(s2._bounds.left + e2), s2 = s2.next;
    this.invalidate();
  }
  getY() {
    return this._bounds.top;
  }
  setY(t2) {
    const e2 = t2 - this._bounds.top;
    if (0 === e2)
      return;
    this._bounds.top = this._cstrt ? t2 + this._cstrt.top : t2, this._tfb && (this._tfb.top += e2);
    let s2 = this._children[0];
    for (; s2; )
      s2.isDragging || s2.setY(s2._bounds.top + e2), s2 = s2.next;
    this.invalidate();
  }
  getWidth() {
    return this._bounds.width;
  }
  setWidth(t2) {
    const e2 = this._bounds.width;
    e2 !== t2 && (this._bounds.width = t2, 0 !== e2 && (this._bounds.left -= t2 * U - e2 * U), !this._tfb || 0 === this.getRotation() && 1 === this.getScale() || this.invalidateDrawProps({ rotation: this.getRotation(), scale: this.getScale() }), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t2) {
    const e2 = this._bounds.height;
    e2 !== t2 && (this._bounds.height = t2, 0 !== e2 && (this._bounds.top -= t2 * U - e2 * U), !this._tfb || 0 === this.getRotation() && 1 === this.getScale() || this.invalidateDrawProps({ rotation: this.getRotation(), scale: this.getScale() }), this.invalidate());
  }
  setBounds(t2, e2, s2, i2) {
    this._cstrt && (t2 -= this._cstrt.left, e2 -= this._cstrt.top);
    let h2 = false;
    "number" == typeof s2 && (h2 = this._bounds.width !== s2, this._bounds.width = s2), "number" == typeof i2 && (h2 = h2 || this._bounds.height !== i2, this._bounds.height = i2);
    const n2 = this._bounds.width, o2 = this._bounds.height, a2 = this._cstrt ? this._cstrt.width : this.canvas.getWidth(), r2 = this._cstrt ? this._cstrt.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const s3 = J(0, -(n2 - a2)), i3 = J(0, -(o2 - r2)), h3 = r2 - o2;
      t2 = J(a2 - n2, B(t2, s3)), e2 = J(h3, B(e2, i3));
    } else
      t2 > a2 && (t2 += n2 * U), e2 > r2 && (e2 += o2 * U);
    this.setX(t2), this.setY(e2), h2 && this.invalidate();
  }
  getBounds(t2 = false) {
    return t2 && this._tfb ? this._tfb : this._bounds;
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
      const { scale: t2, rotation: e2, alpha: s2 } = this.gdp();
      this._tf = { scale: t2, rotation: e2, alpha: s2 };
    }
    return this._tf;
  }
  isVisible(t2) {
    return !!this.canvas && (e2 = this._tfb || this._bounds, s2 = t2 ?? this.canvas.bbox, { left: m, top: _ } = e2, m + e2.width >= s2.left && m <= s2.right && _ + e2.height >= s2.top && _ <= s2.bottom);
    var e2, s2;
  }
  insideBounds(t2, e2) {
    const { left: s2, top: i2, width: h2, height: n2 } = this._bounds;
    return t2 >= s2 && t2 <= s2 + h2 && e2 >= i2 && e2 <= i2 + n2;
  }
  collidesWith(t2) {
    if (t2 === this)
      return false;
    const e2 = this.getBounds(true), s2 = t2.getBounds(true);
    return !(e2.top + e2.height < s2.top || e2.top > s2.top + s2.height || e2.left + e2.width < s2.left || e2.left > s2.left + s2.width);
  }
  getIntersection(t2) {
    if (this.collidesWith(t2)) {
      const e2 = this._bounds, s2 = t2.getBounds(), i2 = B(e2.left, s2.left), h2 = B(e2.top, s2.top);
      return { left: i2, top: h2, width: J(e2.left + e2.width, s2.width + s2.height) - i2, height: J(e2.top + e2.height, s2.top + s2.height) - h2 };
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
    this._sheet = t2, t2 ? (this._animation = { type: null, col: 0, maxCol: 0, fpt: 0, counter: 0, tileWidth: e2 ?? this.getWidth(), tileHeight: s2 ?? this.getHeight() }, this.switchAnimation(0)) : this._animation = void 0;
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
    return this._cstrt = { left: t2, top: e2, width: s2, height: i2 }, this._bounds.left = B(t2, this._bounds.left), this._bounds.top = B(e2, this._bounds.top), this._keepInBounds = true, this.getConstraint();
  }
  getConstraint() {
    return this._cstrt;
  }
  addChild(t2) {
    return t2.setCanvas(this.canvas), super.addChild(t2);
  }
  update(t2, e2) {
    let s2 = this._children[0];
    for (; s2; )
      s2.update(t2, e2), s2 = s2.next;
    this._animation && this.updateAnimation(e2);
  }
  draw(t2, e2) {
    const s2 = this._bounds;
    if (!!this._resourceId && this.isVisible(e2)) {
      const i3 = this._animation;
      let { left: h2, top: n2, width: o2, height: a2 } = s2;
      if (i3) {
        const s3 = i3.tileWidth ? i3.tileWidth : U + o2 << 0, r2 = i3.tileHeight ? i3.tileHeight : U + a2 << 0;
        e2 && (h2 -= e2.left, n2 -= e2.top), t2.drawImageCropped(this._resourceId, i3.col * s3, i3.type.row * r2, s3, r2, h2, n2, o2, a2, this.getDrawProps());
      } else if (e2) {
        const { src: i4, dest: h3 } = G(s2, e2);
        t2.drawImageCropped(this._resourceId, i4.left, i4.top, i4.width, i4.height, h3.left, h3.top, h3.width, h3.height, this.getDrawProps());
      } else
        t2.drawImage(this._resourceId, h2, n2, o2, a2, this.getDrawProps());
    }
    let i2 = this._children[0];
    for (; i2; )
      i2.draw(t2, e2), i2 = i2.next;
  }
  dispose() {
    this._disposed || super.dispose();
  }
  getDrawProps() {
    if (this._tf) {
      const { alpha: t2, rotation: e2, scale: s2 } = this._tf;
      (this._dp.alpha !== t2 || this._dp.rotation !== e2 || this._dp.scale !== s2) && this.invalidateDrawProps({ rotation: e2, alpha: t2, scale: s2 });
    }
    return this._dp;
  }
  handlePress(t2, e2, s2) {
  }
  handleRelease(t2, e2, s2) {
  }
  handleClick() {
  }
  handleMove(t2, e2, s2) {
    const i2 = this._dro.x + (t2 - this._drc.x), h2 = this._dro.y + (e2 - this._drc.y);
    this.setBounds(i2, h2, this._bounds.width, this._bounds.height);
  }
  handleInteraction(t2, e2, s2) {
    let i2;
    const h2 = this._children.length;
    if (h2 > 0)
      for (i2 = this._children[h2 - 1]; i2; ) {
        if (i2.handleInteraction(t2, e2, s2))
          return true;
        i2 = i2.last;
      }
    if (!this._interactive)
      return false;
    const { type: n2 } = s2;
    if (this._pressed && ("touchend" === n2 || "mouseup" === n2))
      return this._pressed = false, this.isDragging && (this.isDragging = false), window.performance.now() - this._pTime < 250 && this.handleClick(), this.handleRelease(t2, e2, s2), true;
    if (this.insideBounds(t2, e2)) {
      if (this.hover = true, "touchstart" === n2 || "mousedown" === n2)
        return this._pTime = window.performance.now(), this._pressed = true, this._draggable && (this.isDragging = true, this._dro = { x: this._bounds.left, y: this._bounds.top }, this._drc = { x: t2, y: e2 }), this.handlePress(t2, e2, s2), "touchstart" === n2 && (s2.stopPropagation(), s2.preventDefault()), true;
    } else
      this.hover = false;
    return !!this.isDragging && (this.handleMove(t2, e2, s2), true);
  }
  invalidate() {
    var _a;
    (_a = this.canvas) == null ? void 0 : _a.invalidate();
  }
  invalidateDrawProps({ alpha: t2, scale: e2, rotation: s2, pivot: i2 }) {
    const h2 = this.gdp();
    h2.alpha = t2 ?? h2.alpha, h2.scale = e2 ?? h2.scale, h2.rotation = s2 ?? h2.rotation, h2.pivot = i2 ?? h2.pivot, void 0 === s2 && void 0 === e2 || (this._tfb || (this._tfb = { ...this._bounds }), function(t3, e3, s3, i3) {
      if (0 === e3 && 1 === s3)
        return y(t3, 1, i3);
      const { left: h3, top: n2, width: o2, height: a2 } = y(t3, s3, i3);
      if (0 !== e3) {
        const t4 = -o2 * g, s4 = o2 * g, r2 = o2 * g, d2 = -o2 * g, l2 = a2 * g, c2 = a2 * g, m2 = -a2 * g, _2 = -a2 * g, b2 = e3 * f, w2 = Math.cos(b2), Z2 = Math.sin(b2), G2 = t4 * w2 + l2 * Z2, y2 = -t4 * Z2 + l2 * w2, v2 = s4 * w2 + c2 * Z2, x2 = -s4 * Z2 + c2 * w2, R2 = r2 * w2 + m2 * Z2, X2 = -r2 * Z2 + m2 * w2, W2 = d2 * w2 + _2 * Z2, C2 = -d2 * Z2 + _2 * w2, L2 = p(G2, v2, R2, W2), S2 = u(G2, v2, R2, W2), Y2 = p(y2, x2, X2, C2), z2 = u(y2, x2, X2, C2);
        i3.width = S2 - L2, i3.height = z2 - Y2, i3.left = h3 - (i3.width * g - o2 * g), i3.top = n2 - (i3.height * g - a2 * g);
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
  Q as Canvas,
  r as Loader,
  T as Sprite
};
