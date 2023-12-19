class P {
  constructor() {
    this._eventMap = [], this._disposed = !1;
  }
  /* public methods */
  /**
   * attach a listener and an event handler to an element
   *
   * @param {EventTarget} target
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @return {boolean} whether the listener has been attached successfully
   */
  add(t, e, i) {
    return this.has(t, e) ? !1 : (t.addEventListener(e, i, !1), this._eventMap.push({ target: t, type: e, listener: i }), !0);
  }
  /**
   * query whether a listener for a specific event type has already
   * been registered for the given element
   *
   * @param {EventTarget} target
   * @param {string} type
   * @return {boolean} whether the listener already exists
   */
  has(t, e) {
    let i = this._eventMap.length;
    for (; i--; ) {
      const s = this._eventMap[i];
      if (s.target === t && s.type == e)
        return !0;
    }
    return !1;
  }
  /**
   * remove a previously registered handler from an element
   *
   * @param {EventTarget} target
   * @param {string} type
   * @return {boolean} whether the listener has been found and removed
   */
  remove(t, e) {
    let i = this._eventMap.length;
    for (; i--; ) {
      const s = this._eventMap[i];
      if (s.target === t && s.type === e)
        return t.removeEventListener(e, s.listener, !1), this._eventMap.splice(i, 1), !0;
    }
    return !1;
  }
  dispose() {
    if (this._disposed)
      return;
    let t = this._eventMap.length;
    for (; t--; ) {
      const e = this._eventMap[t];
      this.remove(e.target, e.type);
    }
    this._eventMap = null, this._disposed = !0;
  }
}
let X;
function L(h = 0, t = 0, e = !1) {
  const i = document.createElement("canvas"), s = i.getContext("2d", e ? { willReadFrequently: !0 } : void 0);
  return h !== 0 && t !== 0 && (i.width = h, i.height = t), { cvs: i, ctx: s };
}
function F() {
  return X || (X = L().cvs), X;
}
function B() {
  X.width = 1, X.height = 1;
}
function U(h, t, e, i) {
  K(h, t, e, i);
}
async function H(h) {
  h instanceof Blob && (h = await j(h)), K(F(), h);
  const t = await createImageBitmap(F());
  return B(), t;
}
function K(h, t, e, i) {
  const s = h.getContext("2d");
  e = e ?? t.width, i = i ?? t.height, h.width = e, h.height = i, s.clearRect(0, 0, e, i), s.drawImage(t, 0, 0, e, i);
}
function j(h) {
  const t = URL.createObjectURL(h), e = () => {
    URL.revokeObjectURL(t);
  };
  return new Promise((i, s) => {
    const n = new Image();
    n.onload = () => {
      const { cvs: a, ctx: r } = L(n.width, n.height);
      r.drawImage(n, 0, 0), e(), i(a);
    }, n.onerror = (a) => {
      e(), s(a);
    }, n.src = t;
  });
}
const Z = {
  /**
   * Load the image contents described in aSource and fire a callback when the
   * resulting Bitmap has been loaded and is ready for rendering, the callback
   * method will receive a SizedImage object as its first argument.
   *
   * if an Error has occurred the second argument will be the Error
   *
   * @param {string}    source either base64 encoded bitmap data or (web)path
   *                    to an image file
   * @param {HTMLImageElement=} optImage optional HTMLImageElement to load the aSource
   *                    into, in case we'd like to re-use an existing Element
   *                    (will not work in Firefox repeatedly as load handlers
   *                    will only fire once)
   * @return {Promise<SizedImage>}
   */
  loadImage(h, t) {
    return new Promise((e, i) => {
      const s = t || new window.Image(), n = J(h), a = new P(), r = () => {
        a.dispose(), i();
      }, d = () => {
        a.dispose(), Z.onReady(s).then(() => e(z(s))).catch(i);
      };
      n || (T(h, s), a.add(s, "load", d), a.add(s, "error", r)), s.src = h, n && Z.onReady(s).then(() => e(z(s))).catch(i);
    });
  },
  async loadBitmap(h) {
    const { image: t } = await Z.loadImage(h);
    return H(t);
  },
  /**
   * a quick query to check whether given Image is ready for rendering on Canvas
   */
  isReady(h) {
    return h.complete !== !0 ? !1 : typeof h.naturalWidth == "number" && h.naturalWidth > 0;
  },
  /**
   * Executes given callback when given Image is actually ready for rendering
   * If the image was ready when this function was called, execution is synchronous
   * if not it will be made asynchronous via RAF delegation
   */
  onReady(h) {
    return new Promise((t, e) => {
      let s = 0;
      function n() {
        Z.isReady(h) ? t() : ++s === 60 ? (console.error(typeof h), e(new Error("Image could not be resolved. This shouldn't occur."))) : window.requestAnimationFrame(n);
      }
      n();
    });
  }
};
function T(h, t) {
  D(h) || (t.crossOrigin = "Anonymous");
}
function J(h) {
  const t = (typeof h == "string" ? h : h.src).substring(0, 5);
  return t === "data:" || t === "blob:";
}
function Q(h) {
  return {
    width: h.width || h.naturalWidth,
    height: h.height || h.naturalHeight
  };
}
function D(h) {
  const { location: t } = window;
  return h.startsWith("./") || h.startsWith(`${t.protocol}//${t.host}`) ? !0 : !/^http[s]?:/.test(h);
}
function z(h) {
  const t = {
    image: h,
    size: { width: 0, height: 0 }
  };
  return h instanceof window.HTMLImageElement && (t.size = Q(h)), t;
}
async function A(h) {
  const t = new FileReader();
  return new Promise((e, i) => {
    t.onload = (s) => {
      var n;
      if (!((n = s == null ? void 0 : s.target) != null && n.result))
        return i();
      e(new Blob([s.target.result], { type: h.type }));
    }, t.onerror = (s) => i(s), t.readAsArrayBuffer(h);
  });
}
class O {
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._map.clear(), this._map = void 0;
  }
  get(t) {
    return this._map.get(t);
  }
  set(t, e) {
    if (this.has(t)) {
      if (this.get(t) === e)
        return;
      this.remove(t);
    }
    this._map.set(t, e);
  }
  has(t) {
    return this._map.has(t);
  }
  remove(t) {
    return this.has(t) ? (this.get(t).close(), this._map.delete(t)) : !1;
  }
}
const f = 0.5;
class q {
  constructor(t) {
    this._canvas = t, this._context = t.getContext("2d"), this._cache = new O();
  }
  dispose() {
    this._cache.dispose(), this._cache = void 0, this._canvas = void 0;
  }
  /* public methods */
  cacheResource(t, e) {
    this._cache.set(t, e);
  }
  getResource(t) {
    return this._cache.get(t);
  }
  disposeResource(t) {
    this._cache.remove(t);
  }
  setDimensions(t, e) {
    this._canvas.width = t, this._canvas.height = e;
  }
  setSmoothing(t) {
    const e = [
      "imageSmoothingEnabled",
      "mozImageSmoothingEnabled",
      "oImageSmoothingEnabled",
      "webkitImageSmoothingEnabled"
    ], i = this._context;
    e.forEach((s) => {
      i[s] !== void 0 && (i[s] = t);
    });
  }
  /* IRenderer wrappers */
  save() {
    this._context.save();
  }
  restore() {
    this._context.restore();
  }
  scale(t, e = t) {
    this._context.scale(t, e);
  }
  setBlendMode(t) {
    this._context.globalCompositeOperation = t;
  }
  clearRect(t, e, i, s) {
    this._context.clearRect(t, e, i, s);
  }
  drawRect(t, e, i, s, n, a = "fill") {
    a === "fill" ? (this._context.fillStyle = n, this._context.fillRect(t, e, i, s)) : a === "stroke" && (this._context.lineWidth = 1, this._context.strokeStyle = n, this._context.strokeRect(f + (t - 1), f + (e - 1), i, s));
  }
  drawCircle(t, e, i, s, n) {
    this._context.beginPath(), this._context.arc(t + i, e + i, i, 0, 2 * Math.PI, !1), this._context.fillStyle = s, this._context.fill(), n && (this._context.lineWidth = 5, this._context.strokeStyle = n, this._context.stroke()), this._context.closePath();
  }
  drawImage(t, e, i, s, n) {
    this._cache.has(t) && (s <= 0 || n <= 0 || this._context.drawImage(this._cache.get(t), e, i, s, n));
  }
  drawImageCropped(t, e, i, s, n, a, r, d, o, c = !1) {
    if (this._cache.has(t)) {
      if (c) {
        if (d <= 0 || o <= 0)
          return;
        const l = this._cache.get(t);
        d = Math.min(this._context.canvas.width, d), o = Math.min(this._context.canvas.height, o);
        const u = d / s, p = o / n;
        e + s > l.width && (d -= u * (e + s - l.width), s -= e + s - l.width), i + n > l.height && (o -= p * (i + n - l.height), n -= i + n - l.height);
      }
      this._context.drawImage(
        this._cache.get(t),
        f + e << 0,
        f + i << 0,
        f + s << 0,
        f + n << 0,
        f + a << 0,
        f + r << 0,
        f + d << 0,
        f + o << 0
      );
    }
  }
}
const E = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NsYXNzIGd7Y29uc3RydWN0b3IoKXt0aGlzLl9tYXA9bmV3IE1hcH1kaXNwb3NlKCl7dGhpcy5fbWFwLmNsZWFyKCksdGhpcy5fbWFwPXZvaWQgMH1nZXQodCl7cmV0dXJuIHRoaXMuX21hcC5nZXQodCl9c2V0KHQsZSl7aWYodGhpcy5oYXModCkpe2lmKHRoaXMuZ2V0KHQpPT09ZSlyZXR1cm47dGhpcy5yZW1vdmUodCl9dGhpcy5fbWFwLnNldCh0LGUpfWhhcyh0KXtyZXR1cm4gdGhpcy5fbWFwLmhhcyh0KX1yZW1vdmUodCl7cmV0dXJuIHRoaXMuaGFzKHQpPyh0aGlzLmdldCh0KS5jbG9zZSgpLHRoaXMuX21hcC5kZWxldGUodCkpOiExfX1jb25zdCBuPS41O2NsYXNzIGZ7Y29uc3RydWN0b3IodCl7dGhpcy5fY2FudmFzPXQsdGhpcy5fY29udGV4dD10LmdldENvbnRleHQoIjJkIiksdGhpcy5fY2FjaGU9bmV3IGd9ZGlzcG9zZSgpe3RoaXMuX2NhY2hlLmRpc3Bvc2UoKSx0aGlzLl9jYWNoZT12b2lkIDAsdGhpcy5fY2FudmFzPXZvaWQgMH1jYWNoZVJlc291cmNlKHQsZSl7dGhpcy5fY2FjaGUuc2V0KHQsZSl9Z2V0UmVzb3VyY2UodCl7cmV0dXJuIHRoaXMuX2NhY2hlLmdldCh0KX1kaXNwb3NlUmVzb3VyY2UodCl7dGhpcy5fY2FjaGUucmVtb3ZlKHQpfXNldERpbWVuc2lvbnModCxlKXt0aGlzLl9jYW52YXMud2lkdGg9dCx0aGlzLl9jYW52YXMuaGVpZ2h0PWV9c2V0U21vb3RoaW5nKHQpe2NvbnN0IGU9WyJpbWFnZVNtb290aGluZ0VuYWJsZWQiLCJtb3pJbWFnZVNtb290aGluZ0VuYWJsZWQiLCJvSW1hZ2VTbW9vdGhpbmdFbmFibGVkIiwid2Via2l0SW1hZ2VTbW9vdGhpbmdFbmFibGVkIl0scz10aGlzLl9jb250ZXh0O2UuZm9yRWFjaChhPT57c1thXSE9PXZvaWQgMCYmKHNbYV09dCl9KX1zYXZlKCl7dGhpcy5fY29udGV4dC5zYXZlKCl9cmVzdG9yZSgpe3RoaXMuX2NvbnRleHQucmVzdG9yZSgpfXNjYWxlKHQsZT10KXt0aGlzLl9jb250ZXh0LnNjYWxlKHQsZSl9c2V0QmxlbmRNb2RlKHQpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPXR9Y2xlYXJSZWN0KHQsZSxzLGEpe3RoaXMuX2NvbnRleHQuY2xlYXJSZWN0KHQsZSxzLGEpfWRyYXdSZWN0KHQsZSxzLGEsYyxfPSJmaWxsIil7Xz09PSJmaWxsIj8odGhpcy5fY29udGV4dC5maWxsU3R5bGU9Yyx0aGlzLl9jb250ZXh0LmZpbGxSZWN0KHQsZSxzLGEpKTpfPT09InN0cm9rZSImJih0aGlzLl9jb250ZXh0LmxpbmVXaWR0aD0xLHRoaXMuX2NvbnRleHQuc3Ryb2tlU3R5bGU9Yyx0aGlzLl9jb250ZXh0LnN0cm9rZVJlY3QobisodC0xKSxuKyhlLTEpLHMsYSkpfWRyYXdDaXJjbGUodCxlLHMsYSxjKXt0aGlzLl9jb250ZXh0LmJlZ2luUGF0aCgpLHRoaXMuX2NvbnRleHQuYXJjKHQrcyxlK3MscywwLDIqTWF0aC5QSSwhMSksdGhpcy5fY29udGV4dC5maWxsU3R5bGU9YSx0aGlzLl9jb250ZXh0LmZpbGwoKSxjJiYodGhpcy5fY29udGV4dC5saW5lV2lkdGg9NSx0aGlzLl9jb250ZXh0LnN0cm9rZVN0eWxlPWMsdGhpcy5fY29udGV4dC5zdHJva2UoKSksdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKX1kcmF3SW1hZ2UodCxlLHMsYSxjKXt0aGlzLl9jYWNoZS5oYXModCkmJihhPD0wfHxjPD0wfHx0aGlzLl9jb250ZXh0LmRyYXdJbWFnZSh0aGlzLl9jYWNoZS5nZXQodCksZSxzLGEsYykpfWRyYXdJbWFnZUNyb3BwZWQodCxlLHMsYSxjLF8sZCxoLGwseD0hMSl7aWYodGhpcy5fY2FjaGUuaGFzKHQpKXtpZih4KXtpZihoPD0wfHxsPD0wKXJldHVybjtjb25zdCByPXRoaXMuX2NhY2hlLmdldCh0KTtoPU1hdGgubWluKHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLGgpLGw9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0LGwpO2NvbnN0IGI9aC9hLHY9bC9jO2UrYT5yLndpZHRoJiYoaC09YiooZSthLXIud2lkdGgpLGEtPWUrYS1yLndpZHRoKSxzK2M+ci5oZWlnaHQmJihsLT12KihzK2Mtci5oZWlnaHQpLGMtPXMrYy1yLmhlaWdodCl9dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fY2FjaGUuZ2V0KHQpLG4rZTw8MCxuK3M8PDAsbithPDwwLG4rYzw8MCxuK188PDAsbitkPDwwLG4raDw8MCxuK2w8PDApfX19YXN5bmMgZnVuY3Rpb24gcChpKXtjb25zdCB0PW5ldyBGaWxlUmVhZGVyO3JldHVybiBuZXcgUHJvbWlzZSgoZSxzKT0+e3Qub25sb2FkPWE9Pnt2YXIgYztpZighKChjPWE9PW51bGw/dm9pZCAwOmEudGFyZ2V0KSE9bnVsbCYmYy5yZXN1bHQpKXJldHVybiBzKCk7ZShuZXcgQmxvYihbYS50YXJnZXQucmVzdWx0XSx7dHlwZTppLnR5cGV9KSl9LHQub25lcnJvcj1hPT5zKGEpLHQucmVhZEFzQXJyYXlCdWZmZXIoaSl9KX1sZXQgbyxtO29ubWVzc2FnZT1pPT57c3dpdGNoKGkuZGF0YS5jbWQpe2RlZmF1bHQ6YnJlYWs7Y2FzZSJpbml0IjptPWkuZGF0YS5jYW52YXMsbz1uZXcgZihtKSxjb25zb2xlLmluZm8oIi0tLSBpbml0aWFsaXplZCBXb3JrZXIiLG0sbyk7YnJlYWs7Y2FzZSJsb2FkUmVzb3VyY2UiOncoaS5kYXRhLmlkLGkuZGF0YS5zb3VyY2UpO2JyZWFrO2Nhc2UiZ2V0UmVzb3VyY2UiOmNvbnN0IHQ9bz09bnVsbD92b2lkIDA6by5nZXRSZXNvdXJjZShpLmRhdGEuaWQpO3Bvc3RNZXNzYWdlKHtjbWQ6Im9ucmVzb3VyY2UiLGlkOmkuZGF0YS5pZCxiaXRtYXA6dH0pO2JyZWFrO2Nhc2UiZGlzcG9zZVJlc291cmNlIjpvPT1udWxsfHxvLmRpc3Bvc2VSZXNvdXJjZSguLi5pLmRhdGEuYXJncyk7YnJlYWs7Y2FzZSJkaXNwb3NlIjpvPT1udWxsfHxvLmRpc3Bvc2UoKSxtPXZvaWQgMCxvPXZvaWQgMDticmVhaztjYXNlInNldFNtb290aGluZyI6Y2FzZSJzZXREaW1lbnNpb25zIjpjYXNlInNhdmUiOmNhc2UicmVzdG9yZSI6Y2FzZSJzY2FsZSI6Y2FzZSJzZXRCbGVuZE1vZGUiOmNhc2UiY2xlYXJSZWN0IjpjYXNlImRyYXdSZWN0IjpjYXNlImRyYXdJbWFnZSI6Y2FzZSJkcmF3SW1hZ2VDcm9wcGVkIjpvJiZvW2kuZGF0YS5jbWRdKC4uLmkuZGF0YS5hcmdzKTticmVha319O2FzeW5jIGZ1bmN0aW9uIHcoaSx0KXt0cnl7bGV0IGU7aWYodCBpbnN0YW5jZW9mIEZpbGUpe2NvbnN0IHM9YXdhaXQgcCh0KTtlPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKHMpfWVsc2UgaWYodCBpbnN0YW5jZW9mIEJsb2IpZT1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcCh0KTtlbHNlIGlmKHR5cGVvZiB0PT0ic3RyaW5nIil7Y29uc3QgYT1hd2FpdChhd2FpdCBmZXRjaCh0KSkuYmxvYigpO2U9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAoYSl9ZWxzZSB0IGluc3RhbmNlb2YgSW1hZ2VCaXRtYXAmJihlPXQpO289PW51bGx8fG8uY2FjaGVSZXNvdXJjZShpLGUpLHBvc3RNZXNzYWdlKHtjbWQ6Im9ubG9hZCIsaWQ6aSxzaXplOnt3aWR0aDplLndpZHRoLGhlaWdodDplLmhlaWdodH19KX1jYXRjaHtwb3N0TWVzc2FnZSh7Y21kOiJvbmVycm9yIixpZDppfSl9fX0pKCk7Cg==", M = typeof window < "u" && window.Blob && new Blob([atob(E)], { type: "text/javascript;charset=utf-8" });
function $() {
  let h;
  try {
    if (h = M && (window.URL || window.webkitURL).createObjectURL(M), !h)
      throw "";
    return new Worker(h);
  } catch {
    return new Worker("data:application/javascript;base64," + E);
  } finally {
    h && (window.URL || window.webkitURL).revokeObjectURL(h);
  }
}
class tt {
  constructor(t, e = !1) {
    if (this._useWorker = !1, this._element = t, e && typeof this._element.transferControlToOffscreen == "function") {
      this._useWorker = !0, this._callbacks = /* @__PURE__ */ new Map();
      const i = t.transferControlToOffscreen();
      this._worker = new $(), this._worker.postMessage({
        cmd: "init",
        canvas: i
      }, [i]), this._worker.onmessage = this.handleMessage.bind(this);
    } else
      this._renderer = new q(this._element);
  }
  loadResource(t, e) {
    return new Promise(async (i, s) => {
      if (e instanceof ImageBitmap) {
        this._useWorker ? this.wrappedWorkerLoad(t, e, i, s, !0) : (this._renderer.cacheResource(t, e), i({ width: e.width, height: e.height }));
        return;
      }
      if (typeof e == "string") {
        if (this._useWorker)
          this.wrappedWorkerLoad(t, e, i, s);
        else {
          const n = await Z.loadImage(e);
          this.wrappedLoad(t, n.image, i, s);
        }
        return;
      }
      if (e instanceof HTMLImageElement || e instanceof HTMLCanvasElement) {
        const n = await H(e);
        return this.loadResource(t, n).then((a) => i(a));
      }
      if (e instanceof File) {
        if (this._useWorker)
          this.wrappedWorkerLoad(t, e, i, s);
        else {
          const n = await A(e);
          this.wrappedLoad(t, n, i, s);
        }
        return;
      } else if (e instanceof Blob) {
        this._useWorker ? this.wrappedWorkerLoad(t, e, i, s) : this.wrappedLoad(t, e, i, s);
        return;
      }
      s("Unsupported resource type");
    });
  }
  getResource(t) {
    return new Promise((e, i) => {
      this._useWorker ? (this._callbacks.set(t, { resolve: e, reject: i }), this._worker.postMessage({
        cmd: "getResource",
        id: t
      })) : e(this._renderer.getResource(t));
    });
  }
  disposeResource(t) {
    this.getBackend("disposeResource", t);
  }
  dispose() {
    this.getBackend("dispose"), setTimeout(() => {
      var t, e;
      (t = this._worker) == null || t.terminate(), this._worker = void 0, (e = this._callbacks) == null || e.clear();
    }, 50);
  }
  getBackend(t, ...e) {
    if (this._useWorker) {
      this._worker.postMessage({
        cmd: t,
        args: [...e]
      });
      return;
    }
    this._renderer[t](...e);
  }
  handleMessage(t) {
    const { cmd: e, id: i } = t.data;
    switch (e) {
      default:
        break;
      case "onload":
        if (!this._callbacks.has(i))
          return;
        this._callbacks.get(i).resolve(t.data.size), this._callbacks.delete(i);
        break;
      case "onerror":
        if (!this._callbacks.has(i))
          return;
        this._callbacks.get(i).reject(new Error()), this._callbacks.delete(i);
        break;
      case "onresource":
        this._callbacks.get(i).resolve(t.data.bitmap), this._callbacks.delete(i);
        break;
    }
  }
  wrappedWorkerLoad(t, e, i, s, n = !1) {
    this._callbacks.set(t, { resolve: i, reject: s }), this._worker.postMessage({
      cmd: "loadResource",
      source: e,
      id: t
    }, n ? [e] : []);
  }
  async wrappedLoad(t, e, i, s) {
    try {
      const n = await H(e);
      this._renderer.cacheResource(t, n), i({ width: n.width, height: n.height });
    } catch (n) {
      s(n);
    }
  }
  /* rendering API */
  // @TODO when using offscreenCanvas post messages (will be difficult with getters though...)
  // @TODO can we maybe just Proxy this upfront to prevent duplicate calls ??
  // @TODO can we just return a direct reference to the Renderer class when we're not using the offscreen canvas ???
  setDimensions(t, e) {
    this.getBackend("setDimensions", t, e);
  }
  setSmoothing(t) {
    this.getBackend("setSmoothing", t);
  }
  save() {
    this.getBackend("save");
  }
  restore() {
    this.getBackend("restore");
  }
  scale(t, e) {
    this.getBackend("scale", t, e);
  }
  setBlendMode(t) {
    this.getBackend("setBlendMode", t);
  }
  clearRect(t, e, i, s) {
    this.getBackend("clearRect", t, e, i, s);
  }
  drawRect(t, e, i, s, n, a) {
    this.getBackend("drawRect", t, e, i, s, n, a);
  }
  drawCircle(t, e, i, s, n) {
    this.getBackend("drawCircle", t, e, i, s, n);
  }
  drawImage(t, e, i, s, n) {
    this.getBackend("drawImage", t, e, i, s, n);
  }
  drawImageCropped(t, e, i, s, n, a, r, d, o, c) {
    this.getBackend(
      "drawImageCropped",
      t,
      e,
      i,
      s,
      n,
      a,
      r,
      d,
      o,
      c
    );
  }
}
const W = (h) => h > 0 ? h + 0.5 << 0 : h | 0, x = [], k = [], R = L(1, 1, !0).cvs;
class et {
  constructor() {
    this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  /**
   * retrieve all children in given Sprite list that are currently residing at
   * a given coordinate and rectangle, can be used in conjunction with sprite
   * "collidesWith"-method to query only the objects that are in its vicinity, greatly
   * freeing up CPU resources by not checking against out of bounds objects
   *
   * @param {Sprite[]} sprites
   * @param {number} aX x-coordinate
   * @param {number} aY y-coordinate
   * @param {number} aWidth rectangle width
   * @param {number} aHeight rectangle height
   * @param {boolean=} aOnlyCollidables optionally only return children that are collidable. defaults to false
   * @return {Sprite[]}
   */
  getChildrenUnderPoint(t, e, i, s, n, a = !1) {
    const r = [];
    let d = t.length, o, c, l, u, p;
    for (; d--; )
      o = t[d], c = o.getX(), l = o.getY(), u = o.getWidth(), p = o.getHeight(), c < e + s && c + u > e && l < i + n && l + p > i && (!a || a && o.collidable) && r.push(o);
    return r;
  }
  /**
   * query whether the current position of given sprite1 and sprite2
   * result in a collision at the pixel level. This method increases
   * accuracy when transparency should be taken into account. While it is
   * reasonably fast, rely on sprite.getIntersection() when rectangular, non-
   * transparent bounding boxes suffice
   *
   * @param {Sprite} sprite1
   * @param {Sprite} sprite2
   * @param {boolean=} optReturnAsCoordinate optional (defaults to false), when false
   *        boolean value is returned for the collision, when true an Object with
   *        x- and y-coordinates is returned to specify at which x- and y-coordinate
   *        a pixel collision occurred. This can be verified against sprite1's bounds
   *        to determine where the collision occurred (e.g. left, bottom, etc.) If no
   *        collision occurred, boolean false is returned
   *
   * @return {boolean|Point}
   */
  pixelCollision(t, e, i = !1) {
    const s = t.getIntersection(e);
    if (s === void 0)
      return !1;
    this.getPixelArray(t, s, x), this.getPixelArray(e, s, k);
    let n = 0;
    if (i === !0) {
      const a = s.width, r = s.height;
      for (let d = 0; d < r; ++d)
        for (let o = 0; o < a; ++o) {
          if (x[n] !== 0 && k[n] !== 0)
            return { x: o, y: d };
          ++n;
        }
    } else {
      const a = x.length;
      for (n; n < a; ++n)
        if (x[n] !== 0 && k[n] !== 0)
          return !0;
    }
    return !1;
  }
  /**
   * Add given Bitmap into the collision cache for faster collision handling
   * at the expense of using more memory
   */
  cache(t, e) {
    const { width: i, height: s } = e;
    U(R, e, i, s), this._cacheMap.set(
      t,
      {
        data: R.getContext("2d").getImageData(0, 0, i, s).data,
        size: { width: i, height: s }
      }
    ), R.width = R.height = 1;
  }
  /**
   * Removes given Bitmap from the collision cache
   */
  clearCache(t) {
    return this.hasCache(t) ? (this._cacheMap.delete(t), !0) : !1;
  }
  /**
   * Whether given Bitmap is present inside the collision cache
   */
  hasCache(t) {
    return this._cacheMap.has(t);
  }
  /**
   * Get an Array of pixels for the area described by given rect
   * inside the Bitmap of given sprite
   *
   * @param {Sprite} sprite
   * @param {Rectangle} rect
   * @param {number[]} pixels Array to write pixels into
   */
  getPixelArray(t, e, i) {
    const s = t.getResourceId();
    if (!this.hasCache(s))
      throw new Error(`Cannot get cached entry for resource "${s}". Cache it first.`);
    const n = t.getBounds(), a = W(e.left - n.left), r = W(e.top - n.top), d = W(e.width), o = W(e.height), { data: c, size: l } = this._cacheMap.get(s);
    if (d === 0 || o === 0) {
      i.length = 0;
      return;
    }
    i.length = W(d * o);
    const u = l.width, p = r + o, _ = a + d;
    let v = -1;
    for (let C = r; C < p; ++C)
      for (let g = a; g < _; ++g) {
        const Y = (C * u + g) * 4;
        i[++v] = c[Y + 3];
      }
  }
}
const { min: S, max: V, round: N } = Math, y = 60, it = y + 3;
class ht {
  constructor({
    width: t = 300,
    height: e = 300,
    fps: i = y,
    scale: s = 1,
    backgroundColor: n = null,
    animate: a = !1,
    smoothing: r = !0,
    stretchToFit: d = !1,
    viewport: o = null,
    preventEventBubbling: c = !1,
    parentElement: l = null,
    debug: u = !1,
    viewportHandler: p,
    onUpdate: _,
    useOffscreen: v = !1
  } = {}) {
    if (this.DEBUG = !1, this.benchmark = {
      minElapsed: 1 / 0,
      maxElapsed: -1 / 0,
      minFps: 1 / 0,
      maxFps: -1 / 0
    }, this._smoothing = !1, this._stretchToFit = !1, this._HDPIscaleRatio = 1, this._preventDefaults = !1, this._lastRender = 0, this._renderId = 0, this._renderPending = !1, this._disposed = !1, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._children = [], this._animate = !1, t <= 0 || e <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = u, this._element = document.createElement("canvas"), this._renderer = new tt(this._element, v), this.collision = new et(), this._updateHandler = _, this._renderHandler = this.render.bind(this), this._viewportHandler = p, this.setFrameRate(i), this.setAnimatable(a), n && this.setBackgroundColor(n), this._HDPIscaleRatio = window.devicePixelRatio || 1, this.setDimensions(t, e, !0, !0), o && this.setViewport(o.width, o.height), s !== 1 && this.scale(s, s), d && this.stretchToFit(!0), l instanceof HTMLElement && this.insertInPage(l), this.setSmoothing(r), this.preventEventBubbling(c), this.addListeners(), this._animate && this.render();
  }
  /* public methods */
  loadResource(t, e) {
    return this._renderer.loadResource(t, e);
  }
  getResource(t) {
    return this._renderer.getResource(t);
  }
  disposeResource(t) {
    return this._renderer.disposeResource(t);
  }
  /**
   * appends this Canvas to the DOM (i.e. adds the references <canvas>-
   * element into the supplied container
   *
   * @param {HTMLElement} container DOM node to append the Canvas to
   */
  insertInPage(t) {
    if (this._element.parentNode)
      throw new Error("Canvas already present in DOM");
    t.appendChild(this._element);
  }
  /**
   * get the <canvas>-element inside the DOM that is used
   * to render this Canvas' contents
   */
  getElement() {
    return this._element;
  }
  /**
   * whether or not all events captured by the Canvas can
   * bubble down in the document, when true, DOM events that
   * have interacted with the Canvas will stop their propagation
   * and prevent their default behaviour
   */
  preventEventBubbling(t) {
    this._preventDefaults = t;
  }
  /**
   * @param {Sprite} child
   * @return {Canvas} this Canvas - for chaining purposes
   */
  addChild(t) {
    if (this.contains(t))
      return this;
    const e = this._children.length;
    return e > 0 && (t.last = this._children[e - 1], t.last.next = t), t.next = void 0, t.setCanvas(this), t.setParent(this), this._children.push(t), this.invalidate(), this;
  }
  /**
   * @param {Sprite} child the child to remove from this Canvas
   * @return {Sprite} the removed child - for chaining purposes
   */
  removeChild(t) {
    t.setParent(void 0), t.setCanvas(void 0);
    const e = this._children.indexOf(t);
    e !== -1 && this._children.splice(e, 1);
    const i = t.last, s = t.next;
    return i && (i.next = s), s && (s.last = i), t.last = t.next = void 0, this.invalidate(), t;
  }
  /**
   * retrieve a child of this Canvas by its index in the Display List
   * @param {number} index of the object in the Display List
   * @return {Sprite} the referenced object
   */
  getChildAt(t) {
    return this._children[t];
  }
  /**
   * remove a child from this Canvas' Display List at the given index
   *
   * @param {number} index of the object to remove
   * @return {Sprite} the removed sprite
   */
  removeChildAt(t) {
    return this.removeChild(this.getChildAt(t));
  }
  /**
   * @return {number} the amount of children in this Canvas' Display List
   */
  numChildren() {
    return this._children.length;
  }
  getChildren() {
    return this._children;
  }
  /**
   * check whether a given display object is present in this object's display list
   */
  contains(t) {
    return t.canvas === this;
  }
  /**
   * invoke when the state of the Canvas has changed (i.e.
   * the visual contents should change), this will invoke
   * a new render request
   *
   * render requests are only executed when the UI is ready
   * to render (on animationFrame), as such this method can be invoked
   * repeatedly between render cycles without actually triggering
   * multiple render executions (a single one will suffice)
   */
  invalidate() {
    !this._animate && !this._renderPending && (this._renderPending = !0, this._renderId = window.requestAnimationFrame(this._renderHandler));
  }
  /**
   * return the framerate of the Canvas, can be queried by
   * child sprites to calculate strictly timed animated operations
   */
  getFrameRate() {
    return this._fps;
  }
  setFrameRate(t) {
    this._fps = t, this._aFps = t, this._renderInterval = 1e3 / t;
  }
  /**
   * Returns the actual framerate achieved by the zCanvas renderer
   */
  getActualFrameRate() {
    return this._aFps;
  }
  /**
   * retrieve the render interval for this Canvas, this basically
   * describes the elapsed time in milliseconds between each successive
   * render at the current framerate
   */
  getRenderInterval() {
    return this._renderInterval;
  }
  getSmoothing() {
    return this._smoothing;
  }
  /**
   * toggle the smoothing of the Canvas' contents.
   * for pixel art-type graphics, setting the smoothing to
   * false will yield crisper results
   */
  setSmoothing(t) {
    this._renderer.setSmoothing(t);
    const e = [
      "-moz-crisp-edges",
      "-webkit-crisp-edges",
      "pixelated",
      "crisp-edges"
    ], i = this._element.style;
    e.forEach((s) => {
      i["image-rendering"] = t ? void 0 : s;
    }), this._smoothing = t, this.invalidate();
  }
  getWidth() {
    return this._enqueuedSize ? this._enqueuedSize.width : this._width;
  }
  getHeight() {
    return this._enqueuedSize ? this._enqueuedSize.height : this._height;
  }
  /**
   * updates the dimensions of the Canvas (this actually enqueues the update and will only
   * execute it once the canvas draws to prevent flickering on constants resize operations
   * as browsers will clear the existing Canvas content when adjusting its dimensions)
   *
   * @param {number} width
   * @param {number} height
   * @param {boolean=} setAsPreferredDimensions optional, defaults to true, stretchToFit handler
   *        overrides this to ensure returning to correct dimensions when disabling stretchToFit
   * @param {boolean=} optImmediate optional, whether to apply immediately, defaults to false
   *        to prevent flickering of existing screen contents during repeated resize
   */
  setDimensions(t, e, i = !0, s = !1) {
    this._enqueuedSize = { width: t, height: e }, i === !0 && (this._preferredWidth = t, this._preferredHeight = e), s === !0 && this.updateCanvasSize(), this.invalidate();
  }
  getViewport() {
    return this._viewport;
  }
  /**
   * In case the Canvas isn't fully visible (for instance because it is part
   * of a scrollable container), you can define the visible bounds (relative to
   * the full Canvas width/height) here. This can be used to improve rendering
   * performance on large Canvas instances by only rendering the visible area.
   */
  setViewport(t, e) {
    this._viewport = { width: t, height: e, left: 0, top: 0, right: t, bottom: e }, this.panViewport(0, 0), this.updateCanvasSize();
  }
  /**
   * Updates the horizontal and vertical position of the viewport.
   *
   * @param {number} x
   * @param {number} y
   * @param {boolean=} broadcast optionally broadcast change to registered handler
   */
  panViewport(t, e, i = !1) {
    var n;
    const s = this._viewport;
    s.left = V(0, S(t, this._width - s.width)), s.right = s.left + s.width, s.top = V(0, S(e, this._height - s.height)), s.bottom = s.top + s.height, this.invalidate(), i && ((n = this._viewportHandler) == null || n.call(this, { type: "panned", value: s }));
  }
  /**
   * set the background color for the Canvas, either hexadecimal
   * or RGB/RGBA, e.g. "#FF0000" or "rgba(255,0,0,1)";
   */
  setBackgroundColor(t) {
    this._bgColor = t;
  }
  setAnimatable(t) {
    var e;
    this._animate, this._animate = t, this._lastRaf = ((e = window.performance) == null ? void 0 : e.now()) || Date.now(), t && !this._renderPending && this._renderHandler(this._lastRaf);
  }
  isAnimatable() {
    return this._animate;
  }
  /**
   * Scales the canvas Element. This can be used to render content at a lower
   * resolution but scale it up to fit the screen (for instance when rendering pixel art
   * with smoothing disabled for crisp definition).
   *
   * @param {number} x the factor to scale the horizontal axis by
   * @param {number=} y the factor to scale the vertical axis by, defaults to x
   */
  scale(t, e = t) {
    this._scale = { x: t, y: e };
    const i = t === 1 && e === 1 ? "" : `scale(${t}, ${e})`, { style: s } = this._element;
    s["-webkit-transform-origin"] = s["transform-origin"] = "0 0", s["-webkit-transform"] = s.transform = i, this.invalidate();
  }
  /**
   * Stretches the Canvas to fit inside the available window size, keeping the
   * dominant sides of the preferred dimensions in relation to the window dimensions.
   * This method will disregard scaling factors.
   *
   * @param {boolean=} value whether to stretch the canvas to fit the window size
   */
  stretchToFit(t) {
    this._stretchToFit = t;
    const { innerWidth: e, innerHeight: i } = window;
    let s = this._preferredWidth, n = this._preferredHeight, a = 1, r = 1;
    i > e ? (n = t ? i / e * s : n, a = e / s, r = i / n) : (s = t ? e / i * n : s, a = e / s, r = i / n), this.setDimensions(N(s), N(n), !1, !0), this.scale(a, r);
  }
  dispose() {
    if (this._disposed)
      return;
    this._animate = !1, window.cancelAnimationFrame(this._renderId), this.removeListeners();
    let t = this.numChildren();
    for (; t--; )
      this._children[t].dispose();
    this._children = [], this._element.parentNode && this._element.parentNode.removeChild(this._element), requestAnimationFrame(() => {
      this._renderer.dispose(), this._renderer = void 0, this.collision.dispose(), this.collision = void 0;
    }), this._disposed = !0;
  }
  /* event handlers */
  handleInteraction(t) {
    const e = this._children.length, i = this._viewport;
    let s;
    if (e > 0)
      switch (s = this._children[e - 1], t.type) {
        default:
          let n = 0, a = 0;
          const r = t.changedTouches;
          let d = 0, o = r.length;
          if (o > 0) {
            let { x: g, y: Y } = this.getCoordinate();
            for (i && (g -= i.left, Y -= i.top), d = 0; d < o; ++d) {
              const G = r[d], { identifier: I } = G;
              switch (n = G.pageX - g, a = G.pageY - Y, t.type) {
                case "touchstart":
                  for (; s; ) {
                    if (!this._activeTouches.includes(s) && s.handleInteraction(n, a, t)) {
                      this._activeTouches[I] = s;
                      break;
                    }
                    s = s.last;
                  }
                  s = this._children[e - 1];
                  break;
                default:
                  s = this._activeTouches[I], s != null && s.handleInteraction(n, a, t) && t.type !== "touchmove" && (this._activeTouches[I] = null);
                  break;
              }
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: c, offsetY: l } = t;
          for (i && (c += i.left, l += i.top); s && !s.handleInteraction(c, l, t); )
            s = s.last;
          break;
        case "wheel":
          const { deltaX: u, deltaY: p } = t, _ = 20, v = u === 0 ? 0 : u > 0 ? _ : -_, C = p === 0 ? 0 : p > 0 ? _ : -_;
          this.panViewport(i.left + v, i.top + C, !0);
          break;
      }
    this._preventDefaults && (t.stopPropagation(), t.preventDefault()), this._animate || this.invalidate();
  }
  /* protected methods */
  /**
   * the render loop drawing the Objects onto the Canvas, shouldn't be
   * invoked directly but by the animation loop or an update request
   *
   * @param {DOMHighResTimeStamp} now time elapsed since document time origin
   */
  render(t = 0) {
    this._renderPending = !1;
    const e = t - this._lastRender;
    if (this._animate && e / this._renderInterval < 0.999) {
      this._renderId = window.requestAnimationFrame(this._renderHandler), this._lastRaf = t;
      return;
    }
    this._aFps = 1e3 / (t - this._lastRaf);
    let i;
    this._fps > y ? i = this._fps / this._aFps : this._fps === y && this._aFps > it ? i = 1 : i = 1 / (this._fps / this._aFps), this._lastRaf = t, this._lastRender = t - e % this._renderInterval, this._enqueuedSize && this.updateCanvasSize();
    let s;
    const n = this._width, a = this._height;
    this._bgColor ? this._renderer.drawRect(0, 0, n, a, this._bgColor) : this._renderer.clearRect(0, 0, n, a);
    const r = typeof this._updateHandler == "function";
    for (r && this._updateHandler(t, i), s = this._children[0]; s; )
      r || s.update(t, i), s.draw(this._renderer, this._viewport), s = s.next;
    if (!this._disposed && this._animate && (this._renderPending = !0, this._renderId = window.requestAnimationFrame(this._renderHandler)), this.DEBUG && t > 2) {
      const d = window.performance.now() - t;
      this.benchmark.minElapsed = Math.min(this.benchmark.minElapsed, d), this.benchmark.maxElapsed = Math.max(this.benchmark.maxElapsed, d), this._aFps !== 1 / 0 && (this.benchmark.minFps = Math.min(this.benchmark.minFps, this._aFps), this.benchmark.maxFps = Math.max(this.benchmark.maxFps, this._aFps));
    }
  }
  /**
   * sprites have no HTML elements, the actual HTML listeners are
   * added onto the canvas, the Canvas will delegate events onto
   * the "children" of the canvas' Display List
   */
  addListeners() {
    this._eventHandler || (this._eventHandler = new P());
    const t = this._eventHandler, e = this.handleInteraction.bind(this), i = this._element;
    "ontouchstart" in window && ["start", "move", "end", "cancel"].forEach((s) => {
      t.add(i, `touch${s}`, e);
    }), ["down", "move"].forEach((s) => {
      t.add(i, `mouse${s}`, e);
    }), t.add(window, "mouseup", e), this._viewport && t.add(i, "wheel", e), this._stretchToFit && t.add(window, "resize", () => {
      this.stretchToFit(this._stretchToFit);
    });
  }
  removeListeners() {
    var t;
    (t = this._eventHandler) == null || t.dispose(), this._eventHandler = void 0;
  }
  /**
   * return the bounding box of the canvas Element in the DOM
   */
  getCoordinate() {
    return this._coords === void 0 && (this._coords = this._element.getBoundingClientRect()), this._coords;
  }
  updateCanvasSize() {
    const t = this._HDPIscaleRatio;
    let e, i;
    if (this._enqueuedSize && ({ width: e, height: i } = this._enqueuedSize, this._enqueuedSize = void 0, this._width = e, this._height = i), this._viewport) {
      const s = this._width, n = this._height;
      e = S(this._viewport.width, s), i = S(this._viewport.height, n);
    }
    if (e && i) {
      const s = this.getElement();
      this._renderer.setDimensions(e * t, i * t), s.style.width = `${e}px`, s.style.height = `${i}px`;
    }
    this._renderer.scale(t, t), this.setSmoothing(this._smoothing), this._coords = void 0;
  }
}
const st = (h, t) => {
  const { left: e, top: i } = h;
  return e + h.width >= t.left && e <= t.right && i + h.height >= t.top && i <= t.bottom;
}, nt = (h, t) => {
  let { left: e, top: i, width: s, height: n } = h;
  const {
    left: a,
    top: r,
    width: d,
    height: o
  } = t;
  return e > a ? s = Math.min(s, d - (e - a)) : s = Math.min(d, s - (a - e)), i > r ? n = Math.min(n, o - (i - r)) : n = Math.min(o, n - (r - i)), {
    src: {
      // NOTE by default all Sprites draw their content from top left coordinate
      // we only correct for this if the visible area starts within the viewport
      left: e > a ? 0 : a - e,
      top: i > r ? 0 : r - i,
      width: s,
      height: n
    },
    dest: {
      left: e > a ? e - a : 0,
      top: i > r ? i - r : 0,
      width: s,
      height: n
    }
  };
}, { min: b, max: w } = Math, m = 0.5;
class at {
  // coordinates of the event at the moment drag was started
  constructor({
    width: t,
    height: e,
    resourceId: i,
    x: s = 0,
    y: n = 0,
    collidable: a = !1,
    interactive: r = !1,
    mask: d = !1,
    sheet: o = [],
    sheetTileWidth: c = 0,
    sheetTileHeight: l = 0
  } = { width: 64, height: 64 }) {
    if (this.hover = !1, this.isDragging = !1, this._children = [], this._disposed = !1, this._mask = !1, this._interactive = !1, this._draggable = !1, this._keepInBounds = !1, this._pressed = !1, t <= 0 || e <= 0)
      throw new Error("cannot construct a zSprite without valid dimensions");
    if (this.collidable = a, this._mask = d, this._bounds = { left: 0, top: 0, width: t, height: e }, this.setX(s), this.setY(n), this.setInteractive(r), i && this.setResource(i), Array.isArray(o) && o.length > 0) {
      if (!i)
        throw new Error("cannot use a spritesheet without a valid resource id");
      this.setSheet(o, c, l);
    }
  }
  /* public methods */
  /**
   * whether the Sprite is draggable
   */
  getDraggable() {
    return this._draggable;
  }
  /**
   * toggle the draggable mode of this Sprite
   *
   * @param {boolean} draggable whether we want to activate / deactivate the dragging mode
   * @param {Boolean=} keepInBounds optional, whether we should keep dragging within bounds
   *                   this will default to the bounds of the canvas, or can be a custom
   *                   restraint (see "setConstraint")
   */
  setDraggable(t, e = !1) {
    this._draggable = t, this._keepInBounds = this._constraint ? !0 : e, t && !this._interactive && this.setInteractive(!0);
  }
  getX() {
    return this._bounds.left;
  }
  setX(t) {
    const e = t - this._bounds.left;
    this._bounds.left = this._constraint ? t + this._constraint.left : t;
    let i = this._children[0];
    for (; i; )
      i.isDragging || i.setX(i._bounds.left + e), i = i.next;
  }
  getY() {
    return this._bounds.top;
  }
  setY(t) {
    const e = t - this._bounds.top;
    this._bounds.top = this._constraint ? t + this._constraint.top : t;
    let i = this._children[0];
    for (; i; )
      i.isDragging || i.setY(i._bounds.top + e), i = i.next;
  }
  getWidth() {
    return this._bounds.width;
  }
  setWidth(t) {
    const e = this._bounds.width || 0;
    e !== t && (this._bounds.width = t, e !== 0 && (this._bounds.left -= t * m - e * m), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t) {
    const e = this._bounds.height || 0;
    e !== t && (this._bounds.height = t, e !== 0 && (this._bounds.top -= t * m - e * m), this.invalidate());
  }
  /**
   * update the position of this Sprite, where setX and setY operate directly on the
   * Sprites coordinates, this method validates the requested coordinates against the
   * defined constraints of this Sprite to ensure it remains within the constraints
   *
   * @param {number} left desired x-coordinate
   * @param {number} top desired y-coordinate
   * @param {number=} width optionally desired width, defaults to current size
   * @param {number=} height optionally desired width, defaults to current size
   */
  setBounds(t, e, i, s) {
    if (this._constraint)
      t -= this._constraint.left, e -= this._constraint.top;
    else if (!this.canvas)
      throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");
    let n = !1;
    typeof i == "number" && (n = this._bounds.width !== i, this._bounds.width = i), typeof s == "number" && (n = n || this._bounds.height !== s, this._bounds.height = s);
    const a = this._bounds.width, r = this._bounds.height, d = this._constraint ? this._constraint.width : this.canvas.getWidth(), o = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const c = b(0, -(a - d)), l = b(0, -(r - o)), u = d - a, p = o - r;
      t = b(u, w(t, c)), e = b(p, w(e, l));
    } else
      t > d && (t = t + a * m), e > o && (e = e + r * m);
    this.setX(t), this.setY(e), n && this.invalidate();
  }
  getBounds() {
    return this._bounds;
  }
  /**
   * whether this Sprite is interactive (should responds to user
   * interactions such as mouse hover, mouse clicks / touches, etc.)
   */
  getInteractive() {
    return this._interactive;
  }
  /**
   * toggle whether this Sprite can receive user interaction events, when
   * false this Sprite is omitted from "handleInteraction"-queries
   * executed when the user interacts with the parent StageCanvas element
   */
  setInteractive(t) {
    this._interactive = t;
  }
  /**
   * invoked on each render cycle before the draw-method is invoked, you can override this in your subclass
   * for custom logic / animation such as updating the state of this Object (like position, size, etc.)
   *
   * (!) this method will NOT fire if "onUpdate" was provided to the canvas, onUpdate can be used to
   * centralize all update logic (e.g. for game loops)
   *
   * @public
   * @param {DOMHighResTimeStamp} now the current timestamp relative
   *                              to the document time origin. Can be used
   *                              to perform strict timed operations.
   * @param {number} framesSinceLastUpdate the amount of frames that have elapsed
   *                 since the last update. This should usually equal 1 but can
   *                 be higher / lower at canvas frame rates other than the device framerate.
   *                 This value can be used to calculate appropriate values for timed operations
   *                 (e.g. animation speed) to compensate for dropped frames
   */
  update(t, e) {
    let i = this._children[0];
    for (; i; )
      i.update(t, e), i = i.next;
    this._animation && this.updateAnimation(e);
  }
  /**
   * invoked by the canvas whenever it renders a new frame / updates the on-screen contents
   * this is where the Sprite is responsible for rendering its contents onto the screen
   * By default, it will render it's Bitmap image/spritesheet at its described coordinates and dimensions,
   * but you can override this method for your own custom rendering logic (e.g. drawing custom shapes)
   *
   * @param {IRenderer} renderer to draw on
   * @param {Viewport=} viewport optional viewport defining the currently visible canvas area
   */
  draw(t, e) {
    if (!this.canvas)
      return;
    const i = this._bounds;
    let s = !!this._resourceId;
    s && e && (s = st(i, e));
    let n = this._mask;
    if (n && t.save(), this._mask && t.setBlendMode("destination-in"), s) {
      const r = this._animation;
      let { left: d, top: o, width: c, height: l } = i;
      if (r) {
        const u = r.tileWidth ? r.tileWidth : m + c << 0, p = r.tileHeight ? r.tileHeight : m + l << 0;
        e && (d -= e.left, o -= e.top), t.drawImageCropped(
          this._resourceId,
          r.col * u,
          // tile x offset
          r.type.row * p,
          // tile y offset
          u,
          p,
          d,
          o,
          c,
          l
        );
      } else if (e) {
        const { src: u, dest: p } = nt(i, e);
        t.drawImageCropped(
          this._resourceId,
          u.left,
          u.top,
          u.width,
          u.height,
          p.left,
          p.top,
          p.width,
          p.height
        );
      } else
        t.drawImage(this._resourceId, d, o, c, l);
    }
    let a = this._children[0];
    for (; a; )
      a.draw(t, e), a = a.next;
    this._mask && t.setBlendMode("source-over"), this.canvas.DEBUG && t.drawRect(this.getX(), this.getY(), this.getWidth(), this.getHeight(), "#FF0000", "stroke"), n && t.restore();
  }
  /**
   * evaluates whether given coordinate is within the Sprite bounds
   */
  insideBounds(t, e) {
    const { left: i, top: s, width: n, height: a } = this._bounds;
    return t >= i && t <= i + n && e >= s && e <= s + a;
  }
  /**
   * queries the bounding box of another sprite to check whether it overlaps the bounding box of this sprite, this
   * can be used as a fast method to detect collisions, though note it is less accurate than checking at the pixel
   * level as it will match the entire bounding box, and omit checking for (for instance) transparent areas!
   *
   * @param {Sprite} sprite the sprite to check against
   * @return {boolean} whether a collision has been detected
   */
  collidesWith(t) {
    if (t === this)
      return !1;
    const e = this._bounds, i = t.getBounds();
    return !(e.top + e.height < i.top || e.top > i.top + i.height || e.left + e.width < i.left || e.left > i.left + i.width);
  }
  /**
   * get the intersection area where given aSprite collides with this sprite
   * returns undefined if no intersection occurs
   */
  getIntersection(t) {
    if (this.collidesWith(t)) {
      const e = this._bounds, i = t.getBounds(), s = w(e.left, i.left), n = w(e.top, i.top), a = b(e.left + e.width, i.width + i.height) - s, r = b(e.top + e.height, i.top + i.height) - n;
      return { left: s, top: n, width: a, height: r };
    }
  }
  /**
   * queries the bounding box of another sprite to check whether its edges collide
   * with the edges of this sprite, this can be used as a fast method to detect whether
   * movement should be impaired on either side of this sprite (for instance wall collision detection)
   *
   * NOTE : ONLY query against results of canvas' "getChildrenUnderPoint"-method as for brevity (and speeds)
   * sake, we only check the desired plane, and not against the other axis.
   *
   * @public
   * @param {Sprite} sprite the sprite to check against
   * @param {number} edge the edge to check 0 = left, 1 = above, 2 = right, 3 = below this is relative
   *                 to the edge of THIS sprite
   *
   * @return {boolean} whether collision with the given edge has been detected
   */
  collidesWithEdge(t, e) {
    if (t === this)
      return !1;
    if (isNaN(e) || e < 0 || e > 3)
      throw new Error("invalid argument for edge");
    switch (e) {
      case 0:
        return this.getX() <= t.getX() + t.getWidth();
      case 1:
        return this.getY() <= t.getY() + t.getHeight();
      case 2:
        return this.getX() + this.getWidth() <= t.getX();
      case 3:
        return this.getY() + this.getHeight() >= t.getY();
    }
    return !1;
  }
  /**
   * update / replace the Image contents of this Sprite, can be used
   * to swap spritesheets (for instance)
   *
   * @param {string} resourceId
   * @param {number=} width optional new width to use for this Sprites bounds
   * @param {number=} height optional new width to use for this Sprites bounds
   */
  setResource(t, e, i) {
    this._resourceId = t;
    const s = typeof e == "number", n = typeof i == "number";
    if (s && this.setWidth(e), n && this.setHeight(i), this._keepInBounds && this.canvas && (s || n)) {
      const a = -(this._bounds.width - this.canvas.getWidth()), r = -(this._bounds.height - this.canvas.getHeight());
      this._bounds.left > 0 ? this._bounds.left = 0 : this._bounds.left < a && (this._bounds.left = a), this._bounds.top > 0 ? this._bounds.top = 0 : this._bounds.top < r && (this._bounds.top = r);
    }
  }
  getResourceId() {
    return this._resourceId;
  }
  /**
   * Define the sprite sheet for this Sprite to use tile based animation
   * from its Bitmap, use in conjunction with setResource()
   *
   * @param {SpriteSheet[]} sheet
   * @param {number=} width optional width to use for a single tile, defaults to Sprite bounds width
   * @param {number=} height optional height to use for a single tile, defaults to Sprite bounds height
   */
  setSheet(t, e, i) {
    if (this._sheet = t, !t) {
      this._animation = void 0;
      return;
    }
    this._animation = {
      type: null,
      col: 0,
      // which horizontal tile in the sprite sheet is current
      maxCol: 0,
      // the maximum horizontal index that is allowed before the animation should loop
      fpt: 0,
      // "frames per tile" what is the max number of count before we switch tile
      counter: 0,
      // the frame counter that is increased on each frame render
      tileWidth: this.getWidth(),
      tileHeight: this.getHeight()
    }, typeof e == "number" && (this._animation.tileWidth = e), typeof i == "number" && (this._animation.tileHeight = i), this.switchAnimation(0);
  }
  /**
   * switch the current animation that should be playing from this Sprites tile sheet
   *
   * @param {number} sheetIndex index of the animation as defined in the _tileSheet Array
   */
  switchAnimation(t) {
    const e = this._animation, i = this._sheet[t];
    e.type = i, e.fpt = i.fpt, e.maxCol = i.col + (i.amount - 1), e.col = i.col, e.counter = 0, e.onComplete = i.onComplete;
  }
  /**
   * set a reference to the parent sprite containing this one
   */
  setParent(t) {
    this._parent = t;
  }
  getParent() {
    return this._parent;
  }
  /**
   * set a reference to the canvas that is rendering this sprite
   */
  setCanvas(t) {
    this.canvas = t;
    for (const e of this._children)
      e.setCanvas(t);
  }
  /**
   * a Sprite can be constrained in its movement (when dragging) to ensure it remains
   * within desired boundaries
   *
   * a parent constraint specifies the boundaries of this Sprites "container"
   * which can be used when dragging this sprite within boundaries. this constraint
   * will by default be equal to the canvas' dimensions (when "setCanvas" is invoked)
   * but this method can be invoked to override it to a custom Rectangle
   */
  setConstraint(t, e, i, s) {
    return this._constraint = { left: t, top: e, width: i, height: s }, this._bounds.left = w(t, this._bounds.left), this._bounds.top = w(e, this._bounds.top), this._keepInBounds = !0, this.getConstraint();
  }
  getConstraint() {
    return this._constraint;
  }
  /**
   * append another Sprite to the display list of this sprite
   *
   * @param {Sprite} child to append
   * @return {Sprite} this object - for chaining purposes
   */
  addChild(t) {
    if (this.contains(t))
      return this;
    const e = this._children.length;
    return e > 0 && (t.last = this._children[e - 1], t.last.next = t, t.next = void 0), t.setCanvas(this.canvas), t.setParent(this), this._children.push(t), this.invalidate(), this;
  }
  /**
   * remove a child Sprite from this sprites display list
   *
   * @param {Sprite} child the child to remove
   * @return {Sprite} the removed child
   */
  removeChild(t) {
    t.setParent(void 0), t.setCanvas(void 0);
    const e = this._children.indexOf(t);
    e !== -1 && this._children.splice(e, 1);
    const i = t.last, s = t.next;
    return i && (i.next = s), s && (s.last = i), t.last = t.next = void 0, this.invalidate(), t;
  }
  /**
   * get a child of this Sprite by its index in the Display List
   *
   * @param {number} index of the object in the Display List
   * @return {Sprite} the Sprite present at the given index
   */
  getChildAt(t) {
    return this._children[t];
  }
  /**
   * remove a child from this object's Display List at the given index
   *
   * @param {number} index of the object to remove
   * @return {Sprite} the Sprite removed at the given index
   */
  removeChildAt(t) {
    return this.removeChild(this.getChildAt(t));
  }
  /**
   * @return {number} the amount of children in this object's Display List
   */
  numChildren() {
    return this._children.length;
  }
  getChildren() {
    return this._children;
  }
  /**
   * check whether a given display object is present in this object's display list
   */
  contains(t) {
    return t._parent === this;
  }
  /**
   * clean up all resources allocated to this Sprite
   */
  dispose() {
    if (this._disposed)
      return;
    this._disposed = !0, this._parent && this._parent.removeChild(this);
    let t = this._children.length;
    for (; t--; ) {
      const e = this._children[t];
      e.dispose(), e.next = void 0, e.last = void 0;
    }
    this._children = [];
  }
  /* event handlers */
  /**
   * invoked when the user clicks / touches this sprite, NOTE : this
   * is a "down"-handler and indicates the sprite has just been touched
   *
   * @param {number} x position of the touch / cursor
   * @param {number} y position of the touch / cursor
   * @param {Event} event the original event that triggered this action
   */
  // @ts-expect-error TS6133 unused parameters. They are here to provide a clear API for overrides in subclasses
  handlePress(t, e, i) {
  }
  /**
   * invoked when the user releases touch of this (previously pressed) Sprite
   *
   * @param {number} x position of the touch / cursor
   * @param {number} y position of the touch / cursor
   * @param {Event} event the original event that triggered this action
   */
  // @ts-expect-error TS6133 unused parameters. They are here to provide a clear API for overrides in subclasses
  handleRelease(t, e, i) {
  }
  /**
   * invoked when user has clicked / tapped this Sprite, this indicates
   * the user has pressed and released within 250 ms
   */
  handleClick() {
  }
  /**
   * move handler, invoked by the "handleInteraction"-method
   * to delegate drag logic
   */
  // @ts-expect-error TS6133 unused parameters. They are here to provide a clear API for overrides in subclasses
  handleMove(t, e, i) {
    const s = this._dragStartOffset.x + (t - this._dragStartEventCoordinates.x), n = this._dragStartOffset.y + (e - this._dragStartEventCoordinates.y);
    this.setBounds(s, n, this._bounds.width, this._bounds.height);
  }
  /**
   * invoked when the user interacts with the canvas, this method evaluates
   * the event data and checks whether it applies to this sprite and
   * when it does, applicable delegate handlers will be invoked on this Object
   * (see "handlePress", "handleRelease", "handleClick", "handleMove")
   *
   * do NOT override this method, override the individual "protected" handlers instead
   *
   * @param {number} x the events X offset, passed for quick evaluation of position updates
   * @param {number} y the events Y offset, passed for quick evaluation of position updates
   * @param {Event} event the original event that triggered this action
   * @return {boolean} whether this Sprite is handling the event
   */
  handleInteraction(t, e, i) {
    let s = !1, n;
    const a = this._children.length;
    if (a > 0)
      for (n = this._children[a - 1]; n; ) {
        if (s = n.handleInteraction(t, e, i), s)
          return !0;
        n = n.last;
      }
    if (!this._interactive)
      return !1;
    const { type: r } = i;
    if (this._pressed && (r === "touchend" || r === "mouseup"))
      return this._pressed = !1, this.isDragging && (this.isDragging = !1), Date.now() - this._pressTime < 250 && this.handleClick(), this.handleRelease(t, e, i), !0;
    if (this.insideBounds(t, e)) {
      if (this.hover = !0, r === "touchstart" || r === "mousedown")
        return this._pressTime = Date.now(), this._pressed = !0, this._draggable && (this.isDragging = !0, this._dragStartOffset = {
          x: this._bounds.left,
          y: this._bounds.top
        }, this._dragStartEventCoordinates = { x: t, y: e }), this.handlePress(t, e, i), r === "touchstart" && (i.stopPropagation(), i.preventDefault()), !0;
    } else
      this.hover = !1;
    return this.isDragging ? (this.handleMove(t, e, i), !0) : !1;
  }
  /**
   * Whenever a change has occurred, this Sprite can request an
   * invalidation of the Canvas to ensure the on screen representation
   * matches the latest state.
   */
  invalidate() {
    this.canvas && this.canvas.invalidate();
  }
  /* protected methods */
  /**
   * invoked by the update()-method prior to rendering
   * this will step between the frames in the tilesheet
   *
   * @param {number=} framesSinceLastRender
   */
  updateAnimation(t = 1) {
    const e = this._animation;
    e.counter += t, e.counter >= e.fpt && (++e.col, e.counter = e.counter % e.fpt), e.col > e.maxCol && (e.col = e.type.col, typeof e.onComplete == "function" && e.onComplete(this));
  }
}
export {
  ht as Canvas,
  at as Sprite,
  st as isInsideViewport
};
