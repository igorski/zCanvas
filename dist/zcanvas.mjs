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
  t2 instanceof Blob && (t2 = await function(t3) {
    const e2 = URL.createObjectURL(t3), s2 = () => {
      URL.revokeObjectURL(e2);
    };
    return new Promise((t4, h3) => {
      const n2 = new Image();
      n2.onload = () => {
        const { cvs: e3, ctx: h4 } = i(n2.width, n2.height);
        h4.drawImage(n2, 0, 0), s2(), t4(e3);
      }, n2.onerror = (t5) => {
        s2(), h3(t5);
      }, n2.src = e2;
    });
  }(t2)), n(s(), t2);
  const h2 = await createImageBitmap(s());
  return e.width = 1, e.height = 1, h2;
}
function n(t2, e2, i2, s2) {
  const h2 = t2.getContext("2d");
  i2 = i2 ?? e2.width, s2 = s2 ?? e2.height, t2.width = i2, t2.height = s2, h2.clearRect(0, 0, i2, s2), h2.drawImage(e2, 0, 0, i2, s2);
}
const r = { loadImage: (e2, i2) => new Promise((s2, h2) => {
  const n2 = i2 || new window.Image(), o2 = function(t2) {
    const e3 = ("string" == typeof t2 ? t2 : t2.src).substring(0, 5);
    return "data:" === e3 || "blob:" === e3;
  }(e2), d2 = new t(), l2 = () => {
    d2.dispose(), h2();
  }, c2 = () => {
    d2.dispose(), r.onReady(n2).then(() => s2(a(n2))).catch(h2);
  };
  var u2;
  o2 || (u2 = n2, function(t2) {
    const { location: e3 } = window;
    return !(!t2.startsWith("./") && !t2.startsWith(`${e3.protocol}//${e3.host}`)) || !/^http[s]?:/.test(t2);
  }(e2) || (u2.crossOrigin = "Anonymous"), d2.add(n2, "load", c2), d2.add(n2, "error", l2)), n2.src = e2, o2 && r.onReady(n2).then(() => s2(a(n2))).catch(h2);
}), async loadBitmap(t2) {
  const { image: e2 } = await r.loadImage(t2);
  return h(e2);
}, isReady: (t2) => true === t2.complete && ("number" == typeof t2.naturalWidth && t2.naturalWidth > 0), onReady: (t2) => new Promise((e2, i2) => {
  const s2 = 60;
  let h2 = 0;
  !function n2() {
    r.isReady(t2) ? e2() : ++h2 === s2 ? (console.error(typeof t2), i2(new Error("Image could not be resolved. This shouldn't occur."))) : window.requestAnimationFrame(n2);
  }();
}) };
function a(t2) {
  const e2 = { image: t2, size: { width: 0, height: 0 } };
  return t2 instanceof window.HTMLImageElement && (e2.size = function(t3) {
    return { width: t3.width || t3.naturalWidth, height: t3.height || t3.naturalHeight };
  }(t2)), e2;
}
class o {
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._map.clear(), this._map = void 0;
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
    if (!this.has(t2))
      return false;
    return this.get(t2).close(), this._map.delete(t2);
  }
}
const d = 0.5;
class l {
  constructor(t2) {
    this._canvas = t2, this._context = t2.getContext("2d"), this._cache = new o();
  }
  dispose() {
    this._cache.dispose(), this._cache = void 0, this._canvas = void 0;
  }
  cacheResource(t2, e2) {
    this._cache.set(t2, e2);
  }
  getResource(t2) {
    return this._cache.get(t2);
  }
  disposeResource(t2) {
    this._cache.remove(t2);
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
  scale(t2, e2 = t2) {
    this._context.scale(t2, e2);
  }
  setBlendMode(t2) {
    this._context.globalCompositeOperation = t2;
  }
  clearRect(t2, e2, i2, s2) {
    this._context.clearRect(t2, e2, i2, s2);
  }
  drawRect(t2, e2, i2, s2, h2, n2 = "fill") {
    if ("fill" === n2)
      this._context.fillStyle = h2, this._context.fillRect(t2, e2, i2, s2);
    else if ("stroke" === n2) {
      const n3 = 1;
      this._context.lineWidth = n3, this._context.strokeStyle = h2, this._context.strokeRect(d + (t2 - n3), d + (e2 - n3), i2, s2);
    }
  }
  drawCircle(t2, e2, i2, s2, h2) {
    this._context.beginPath(), this._context.arc(t2 + i2, e2 + i2, i2, 0, 2 * Math.PI, false), this._context.fillStyle = s2, this._context.fill(), h2 && (this._context.lineWidth = 5, this._context.strokeStyle = h2, this._context.stroke()), this._context.closePath();
  }
  drawImage(t2, e2, i2, s2, h2) {
    this._cache.has(t2) && (s2 <= 0 || h2 <= 0 || this._context.drawImage(this._cache.get(t2), e2, i2, s2, h2));
  }
  drawImageCropped(t2, e2, i2, s2, h2, n2, r2, a2, o2, l2 = false) {
    if (this._cache.has(t2)) {
      if (l2) {
        if (a2 <= 0 || o2 <= 0)
          return;
        const n3 = this._cache.get(t2), r3 = (a2 = Math.min(this._context.canvas.width, a2)) / s2, d2 = (o2 = Math.min(this._context.canvas.height, o2)) / h2;
        e2 + s2 > n3.width && (a2 -= r3 * (e2 + s2 - n3.width), s2 -= e2 + s2 - n3.width), i2 + h2 > n3.height && (o2 -= d2 * (i2 + h2 - n3.height), h2 -= i2 + h2 - n3.height);
      }
      this._context.drawImage(this._cache.get(t2), d + e2 << 0, d + i2 << 0, d + s2 << 0, d + h2 << 0, d + n2 << 0, d + r2 << 0, d + a2 << 0, d + o2 << 0);
    }
  }
}
const c = "IWZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NsYXNzIGV7Y29uc3RydWN0b3IoKXt0aGlzLl9tYXA9bmV3IE1hcH1kaXNwb3NlKCl7dGhpcy5fbWFwLmNsZWFyKCksdGhpcy5fbWFwPXZvaWQgMH1nZXQoZSl7cmV0dXJuIHRoaXMuX21hcC5nZXQoZSl9c2V0KGUsdCl7aWYodGhpcy5oYXMoZSkpe2lmKHRoaXMuZ2V0KGUpPT09dClyZXR1cm47dGhpcy5yZW1vdmUoZSl9dGhpcy5fbWFwLnNldChlLHQpfWhhcyhlKXtyZXR1cm4gdGhpcy5fbWFwLmhhcyhlKX1yZW1vdmUoZSl7cmV0dXJuISF0aGlzLmhhcyhlKSYmKHRoaXMuZ2V0KGUpLmNsb3NlKCksdGhpcy5fbWFwLmRlbGV0ZShlKSl9fWNvbnN0IHQ9LjU7Y2xhc3Mgc3tjb25zdHJ1Y3Rvcih0KXt0aGlzLl9jYW52YXM9dCx0aGlzLl9jb250ZXh0PXQuZ2V0Q29udGV4dCgiMmQiKSx0aGlzLl9jYWNoZT1uZXcgZX1kaXNwb3NlKCl7dGhpcy5fY2FjaGUuZGlzcG9zZSgpLHRoaXMuX2NhY2hlPXZvaWQgMCx0aGlzLl9jYW52YXM9dm9pZCAwfWNhY2hlUmVzb3VyY2UoZSx0KXt0aGlzLl9jYWNoZS5zZXQoZSx0KX1nZXRSZXNvdXJjZShlKXtyZXR1cm4gdGhpcy5fY2FjaGUuZ2V0KGUpfWRpc3Bvc2VSZXNvdXJjZShlKXt0aGlzLl9jYWNoZS5yZW1vdmUoZSl9c2V0RGltZW5zaW9ucyhlLHQpe3RoaXMuX2NhbnZhcy53aWR0aD1lLHRoaXMuX2NhbnZhcy5oZWlnaHQ9dH1zZXRTbW9vdGhpbmcoZSl7Y29uc3QgdD10aGlzLl9jb250ZXh0O1siaW1hZ2VTbW9vdGhpbmdFbmFibGVkIiwibW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkIiwib0ltYWdlU21vb3RoaW5nRW5hYmxlZCIsIndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZCJdLmZvckVhY2goKHM9Pnt2b2lkIDAhPT10W3NdJiYodFtzXT1lKX0pKX1zYXZlKCl7dGhpcy5fY29udGV4dC5zYXZlKCl9cmVzdG9yZSgpe3RoaXMuX2NvbnRleHQucmVzdG9yZSgpfXNjYWxlKGUsdD1lKXt0aGlzLl9jb250ZXh0LnNjYWxlKGUsdCl9c2V0QmxlbmRNb2RlKGUpe3RoaXMuX2NvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPWV9Y2xlYXJSZWN0KGUsdCxzLGEpe3RoaXMuX2NvbnRleHQuY2xlYXJSZWN0KGUsdCxzLGEpfWRyYXdSZWN0KGUscyxhLGksYyxvPSJmaWxsIil7aWYoImZpbGwiPT09byl0aGlzLl9jb250ZXh0LmZpbGxTdHlsZT1jLHRoaXMuX2NvbnRleHQuZmlsbFJlY3QoZSxzLGEsaSk7ZWxzZSBpZigic3Ryb2tlIj09PW8pe2NvbnN0IG89MTt0aGlzLl9jb250ZXh0LmxpbmVXaWR0aD1vLHRoaXMuX2NvbnRleHQuc3Ryb2tlU3R5bGU9Yyx0aGlzLl9jb250ZXh0LnN0cm9rZVJlY3QodCsoZS1vKSx0KyhzLW8pLGEsaSl9fWRyYXdDaXJjbGUoZSx0LHMsYSxpKXt0aGlzLl9jb250ZXh0LmJlZ2luUGF0aCgpLHRoaXMuX2NvbnRleHQuYXJjKGUrcyx0K3MscywwLDIqTWF0aC5QSSwhMSksdGhpcy5fY29udGV4dC5maWxsU3R5bGU9YSx0aGlzLl9jb250ZXh0LmZpbGwoKSxpJiYodGhpcy5fY29udGV4dC5saW5lV2lkdGg9NSx0aGlzLl9jb250ZXh0LnN0cm9rZVN0eWxlPWksdGhpcy5fY29udGV4dC5zdHJva2UoKSksdGhpcy5fY29udGV4dC5jbG9zZVBhdGgoKX1kcmF3SW1hZ2UoZSx0LHMsYSxpKXt0aGlzLl9jYWNoZS5oYXMoZSkmJihhPD0wfHxpPD0wfHx0aGlzLl9jb250ZXh0LmRyYXdJbWFnZSh0aGlzLl9jYWNoZS5nZXQoZSksdCxzLGEsaSkpfWRyYXdJbWFnZUNyb3BwZWQoZSxzLGEsaSxjLG8sbixoLHIsZD0hMSl7aWYodGhpcy5fY2FjaGUuaGFzKGUpKXtpZihkKXtpZihoPD0wfHxyPD0wKXJldHVybjtjb25zdCB0PXRoaXMuX2NhY2hlLmdldChlKSxvPShoPU1hdGgubWluKHRoaXMuX2NvbnRleHQuY2FudmFzLndpZHRoLGgpKS9pLG49KHI9TWF0aC5taW4odGhpcy5fY29udGV4dC5jYW52YXMuaGVpZ2h0LHIpKS9jO3MraT50LndpZHRoJiYoaC09byoocytpLXQud2lkdGgpLGktPXMraS10LndpZHRoKSxhK2M+dC5oZWlnaHQmJihyLT1uKihhK2MtdC5oZWlnaHQpLGMtPWErYy10LmhlaWdodCl9dGhpcy5fY29udGV4dC5kcmF3SW1hZ2UodGhpcy5fY2FjaGUuZ2V0KGUpLHQrczw8MCx0K2E8PDAsdCtpPDwwLHQrYzw8MCx0K288PDAsdCtuPDwwLHQraDw8MCx0K3I8PDApfX19bGV0IGEsaTtvbm1lc3NhZ2U9ZT0+e3N3aXRjaChlLmRhdGEuY21kKXtkZWZhdWx0OmJyZWFrO2Nhc2UiaW5pdCI6aT1lLmRhdGEuY2FudmFzLGE9bmV3IHMoaSksY29uc29sZS5pbmZvKCItLS0gaW5pdGlhbGl6ZWQgV29ya2VyIixpLGEpO2JyZWFrO2Nhc2UibG9hZFJlc291cmNlIjohYXN5bmMgZnVuY3Rpb24oZSx0KXt0cnl7bGV0IHM7aWYodCBpbnN0YW5jZW9mIEZpbGUpe2NvbnN0IGU9YXdhaXQgYXN5bmMgZnVuY3Rpb24oZSl7Y29uc3QgdD1uZXcgRmlsZVJlYWRlcjtyZXR1cm4gbmV3IFByb21pc2UoKChzLGEpPT57dC5vbmxvYWQ9dD0+e3ZhciBpO2lmKCEobnVsbD09KGk9bnVsbD09dD92b2lkIDA6dC50YXJnZXQpP3ZvaWQgMDppLnJlc3VsdCkpcmV0dXJuIGEoKTtzKG5ldyBCbG9iKFt0LnRhcmdldC5yZXN1bHRdLHt0eXBlOmUudHlwZX0pKX0sdC5vbmVycm9yPWU9PmEoZSksdC5yZWFkQXNBcnJheUJ1ZmZlcihlKX0pKX0odCk7cz1hd2FpdCBjcmVhdGVJbWFnZUJpdG1hcChlKX1lbHNlIGlmKHQgaW5zdGFuY2VvZiBCbG9iKXM9YXdhaXQgY3JlYXRlSW1hZ2VCaXRtYXAodCk7ZWxzZSBpZigic3RyaW5nIj09dHlwZW9mIHQpe2NvbnN0IGU9YXdhaXQgZmV0Y2godCksYT1hd2FpdCBlLmJsb2IoKTtzPWF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKGEpfWVsc2UgdCBpbnN0YW5jZW9mIEltYWdlQml0bWFwJiYocz10KTtudWxsPT1hfHxhLmNhY2hlUmVzb3VyY2UoZSxzKSxwb3N0TWVzc2FnZSh7Y21kOiJvbmxvYWQiLGlkOmUsc2l6ZTp7d2lkdGg6cy53aWR0aCxoZWlnaHQ6cy5oZWlnaHR9fSl9Y2F0Y2h7cG9zdE1lc3NhZ2Uoe2NtZDoib25lcnJvciIsaWQ6ZX0pfX0oZS5kYXRhLmlkLGUuZGF0YS5zb3VyY2UpO2JyZWFrO2Nhc2UiZ2V0UmVzb3VyY2UiOmNvbnN0IHQ9bnVsbD09YT92b2lkIDA6YS5nZXRSZXNvdXJjZShlLmRhdGEuaWQpO3Bvc3RNZXNzYWdlKHtjbWQ6Im9ucmVzb3VyY2UiLGlkOmUuZGF0YS5pZCxiaXRtYXA6dH0pO2JyZWFrO2Nhc2UiZGlzcG9zZVJlc291cmNlIjpudWxsPT1hfHxhLmRpc3Bvc2VSZXNvdXJjZSguLi5lLmRhdGEuYXJncyk7YnJlYWs7Y2FzZSJkaXNwb3NlIjpudWxsPT1hfHxhLmRpc3Bvc2UoKSxpPXZvaWQgMCxhPXZvaWQgMDticmVhaztjYXNlInNldFNtb290aGluZyI6Y2FzZSJzZXREaW1lbnNpb25zIjpjYXNlInNhdmUiOmNhc2UicmVzdG9yZSI6Y2FzZSJzY2FsZSI6Y2FzZSJzZXRCbGVuZE1vZGUiOmNhc2UiY2xlYXJSZWN0IjpjYXNlImRyYXdSZWN0IjpjYXNlImRyYXdJbWFnZSI6Y2FzZSJkcmF3SW1hZ2VDcm9wcGVkIjphJiZhW2UuZGF0YS5jbWRdKC4uLmUuZGF0YS5hcmdzKX19fSgpOwo=", u = "undefined" != typeof window && window.Blob && new Blob([atob(c)], { type: "text/javascript;charset=utf-8" });
function p() {
  let t2;
  try {
    if (t2 = u && (window.URL || window.webkitURL).createObjectURL(u), !t2)
      throw "";
    return new Worker(t2);
  } catch (t3) {
    return new Worker("data:application/javascript;base64," + c);
  } finally {
    t2 && (window.URL || window.webkitURL).revokeObjectURL(t2);
  }
}
class _ {
  constructor(t2, e2 = false) {
    if (this._useWorker = false, this._element = t2, e2 && "function" == typeof this._element.transferControlToOffscreen) {
      this._useWorker = true, this._callbacks = /* @__PURE__ */ new Map();
      const e3 = t2.transferControlToOffscreen();
      this._worker = new p(), this._worker.postMessage({ cmd: "init", canvas: e3 }, [e3]), this._worker.onmessage = this.handleMessage.bind(this);
    } else
      this._renderer = new l(this._element);
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
            const h2 = await async function(t3) {
              const e3 = new FileReader();
              return new Promise((i3, s3) => {
                e3.onload = (e4) => {
                  var _a;
                  if (!((_a = e4 == null ? void 0 : e4.target) == null ? void 0 : _a.result))
                    return s3();
                  i3(new Blob([e4.target.result], { type: t3.type }));
                }, e3.onerror = (t4) => s3(t4), e3.readAsArrayBuffer(t3);
              });
            }(e2);
            this.wrappedLoad(t2, h2, i2, s2);
          }
        else
          e2 instanceof Blob ? this._useWorker ? this.wrappedWorkerLoad(t2, e2, i2, s2) : this.wrappedLoad(t2, e2, i2, s2) : s2("Unsupported resource type");
      } else if (this._useWorker)
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
  dispose() {
    this.getBackend("dispose"), setTimeout(() => {
      var _a, _b;
      (_a = this._worker) == null ? void 0 : _a.terminate(), this._worker = void 0, (_b = this._callbacks) == null ? void 0 : _b.clear();
    }, 50);
  }
  getBackend(t2, ...e2) {
    this._useWorker ? this._worker.postMessage({ cmd: t2, args: [...e2] }) : this._renderer[t2](...e2);
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
        this._callbacks.get(i2).reject(new Error()), this._callbacks.delete(i2);
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
  setSmoothing(t2) {
    this.getBackend("setSmoothing", t2);
  }
  save() {
    this.getBackend("save");
  }
  restore() {
    this.getBackend("restore");
  }
  scale(t2, e2) {
    this.getBackend("scale", t2, e2);
  }
  setBlendMode(t2) {
    this.getBackend("setBlendMode", t2);
  }
  clearRect(t2, e2, i2, s2) {
    this.getBackend("clearRect", t2, e2, i2, s2);
  }
  drawRect(t2, e2, i2, s2, h2, n2) {
    this.getBackend("drawRect", t2, e2, i2, s2, h2, n2);
  }
  drawCircle(t2, e2, i2, s2, h2) {
    this.getBackend("drawCircle", t2, e2, i2, s2, h2);
  }
  drawImage(t2, e2, i2, s2, h2) {
    this.getBackend("drawImage", t2, e2, i2, s2, h2);
  }
  drawImageCropped(t2, e2, i2, s2, h2, n2, r2, a2, o2, d2) {
    this.getBackend("drawImageCropped", t2, e2, i2, s2, h2, n2, r2, a2, o2, d2);
  }
}
const g = (t2) => t2 > 0 ? t2 + 0.5 << 0 : 0 | t2, m = [], f = [], w = i(1, 1, true).cvs;
class b {
  constructor() {
    this._cacheMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._cacheMap.clear(), this._cacheMap = void 0;
  }
  getChildrenUnderPoint(t2, e2, i2, s2, h2, n2 = false) {
    const r2 = [];
    let a2, o2, d2, l2, c2, u2 = t2.length;
    for (; u2--; )
      a2 = t2[u2], o2 = a2.getX(), d2 = a2.getY(), l2 = a2.getWidth(), c2 = a2.getHeight(), o2 < e2 + s2 && o2 + l2 > e2 && d2 < i2 + h2 && d2 + c2 > i2 && (!n2 || n2 && a2.collidable) && r2.push(a2);
    return r2;
  }
  pixelCollision(t2, e2, i2 = false) {
    const s2 = t2.getIntersection(e2);
    if (void 0 === s2)
      return false;
    this.getPixelArray(t2, s2, m), this.getPixelArray(e2, s2, f);
    let h2 = 0;
    if (true === i2) {
      const t3 = s2.width, e3 = s2.height;
      for (let i3 = 0; i3 < e3; ++i3)
        for (let e4 = 0; e4 < t3; ++e4) {
          if (0 !== m[h2] && 0 !== f[h2])
            return { x: e4, y: i3 };
          ++h2;
        }
    } else {
      const t3 = m.length;
      for (; h2 < t3; ++h2)
        if (0 !== m[h2] && 0 !== f[h2])
          return true;
    }
    return false;
  }
  cache(t2, e2) {
    const { width: i2, height: s2 } = e2;
    !function(t3, e3, i3, s3) {
      n(t3, e3, i3, s3);
    }(w, e2, i2, s2), this._cacheMap.set(t2, { data: w.getContext("2d").getImageData(0, 0, i2, s2).data, size: { width: i2, height: s2 } }), w.width = w.height = 1;
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
    const h2 = t2.getBounds(), n2 = g(e2.left - h2.left), r2 = g(e2.top - h2.top), a2 = g(e2.width), o2 = g(e2.height), { data: d2, size: l2 } = this._cacheMap.get(s2);
    if (0 === a2 || 0 === o2)
      return void (i2.length = 0);
    i2.length = g(a2 * o2);
    const c2 = l2.width, u2 = r2 + o2, p2 = n2 + a2;
    let _2 = -1;
    for (let t3 = r2; t3 < u2; ++t3)
      for (let e3 = n2; e3 < p2; ++e3) {
        const s3 = 4 * (t3 * c2 + e3);
        i2[++_2] = d2[s3 + 3];
      }
  }
}
const { min: v, max: Z, round: W } = Math;
class X {
  constructor({ width: t2 = 300, height: e2 = 300, fps: i2 = 60, scale: s2 = 1, backgroundColor: h2 = null, animate: n2 = false, smoothing: r2 = true, stretchToFit: a2 = false, viewport: o2 = null, preventEventBubbling: d2 = false, parentElement: l2 = null, debug: c2 = false, viewportHandler: u2, onUpdate: p2, useOffscreen: g2 = false } = {}) {
    if (this.DEBUG = false, this.benchmark = { minElapsed: 1 / 0, maxElapsed: -1 / 0, minFps: 1 / 0, maxFps: -1 / 0 }, this._smoothing = false, this._stretchToFit = false, this._HDPIscaleRatio = 1, this._preventDefaults = false, this._lastRender = 0, this._renderId = 0, this._renderPending = false, this._disposed = false, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._children = [], this._animate = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = c2, this._element = document.createElement("canvas"), this._renderer = new _(this._element, g2), this.collision = new b(), this._updateHandler = p2, this._renderHandler = this.render.bind(this), this._viewportHandler = u2, this.setFrameRate(i2), this.setAnimatable(n2), h2 && this.setBackgroundColor(h2), this._HDPIscaleRatio = window.devicePixelRatio || 1, this.setDimensions(t2, e2, true, true), o2 && this.setViewport(o2.width, o2.height), 1 !== s2 && this.scale(s2, s2), a2 && this.stretchToFit(true), l2 instanceof HTMLElement && this.insertInPage(l2), this.setSmoothing(r2), this.preventEventBubbling(d2), this.addListeners(), this._animate && this.render();
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
    this._renderer.setSmoothing(t2);
    const e2 = this._element.style;
    ["-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges"].forEach((i2) => {
      e2["image-rendering"] = t2 ? void 0 : i2;
    }), this._smoothing = t2, this.invalidate();
  }
  getWidth() {
    return this._enqueuedSize ? this._enqueuedSize.width : this._width;
  }
  getHeight() {
    return this._enqueuedSize ? this._enqueuedSize.height : this._height;
  }
  setDimensions(t2, e2, i2 = true, s2 = false) {
    this._enqueuedSize = { width: t2, height: e2 }, true === i2 && (this._preferredWidth = t2, this._preferredHeight = e2), true === s2 && this.updateCanvasSize(), this.invalidate();
  }
  getViewport() {
    return this._viewport;
  }
  setViewport(t2, e2) {
    this._viewport = { width: t2, height: e2, left: 0, top: 0, right: t2, bottom: e2 }, this.panViewport(0, 0), this.updateCanvasSize();
  }
  panViewport(t2, e2, i2 = false) {
    var _a;
    const s2 = this._viewport;
    s2.left = Z(0, v(t2, this._width - s2.width)), s2.right = s2.left + s2.width, s2.top = Z(0, v(e2, this._height - s2.height)), s2.bottom = s2.top + s2.height, this.invalidate(), i2 && ((_a = this._viewportHandler) == null ? void 0 : _a.call(this, { type: "panned", value: s2 }));
  }
  setBackgroundColor(t2) {
    this._bgColor = t2;
  }
  setAnimatable(t2) {
    var _a;
    this._animate, this._animate = t2, this._lastRaf = ((_a = window.performance) == null ? void 0 : _a.now()) || Date.now(), t2 && !this._renderPending && this._renderHandler(this._lastRaf);
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
    this._stretchToFit = t2;
    const { innerWidth: e2, innerHeight: i2 } = window;
    let s2 = this._preferredWidth, h2 = this._preferredHeight, n2 = 1, r2 = 1;
    i2 > e2 ? (h2 = t2 ? i2 / e2 * s2 : h2, n2 = e2 / s2, r2 = i2 / h2) : (s2 = t2 ? e2 / i2 * h2 : s2, n2 = e2 / s2, r2 = i2 / h2), this.setDimensions(W(s2), W(h2), false, true), this.scale(n2, r2);
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
          const r2 = t2.changedTouches;
          let a2 = 0, o2 = r2.length;
          if (o2 > 0) {
            let { x: d3, y: l3 } = this.getCoordinate();
            for (i2 && (d3 -= i2.left, l3 -= i2.top), a2 = 0; a2 < o2; ++a2) {
              const i3 = r2[a2], { identifier: o3 } = i3;
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
          const { deltaX: c2, deltaY: u2 } = t2, p2 = 20, _2 = 0 === c2 ? 0 : c2 > 0 ? p2 : -p2, g2 = 0 === u2 ? 0 : u2 > 0 ? p2 : -p2;
          this.panViewport(i2.left + _2, i2.top + g2, true);
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
    const r2 = "function" == typeof this._updateHandler;
    for (r2 && this._updateHandler(t2, i2), s2 = this._children[0]; s2; )
      r2 || s2.update(t2, i2), s2.draw(this._renderer, this._viewport), s2 = s2.next;
    if (!this._disposed && this._animate && (this._renderPending = true, this._renderId = window.requestAnimationFrame(this._renderHandler)), this.DEBUG && t2 > 2) {
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
    }), e2.add(window, "mouseup", i2), this._viewport && e2.add(s2, "wheel", i2), this._stretchToFit && e2.add(window, "resize", () => {
      this.stretchToFit(this._stretchToFit);
    });
  }
  removeListeners() {
    var _a;
    (_a = this._eventHandler) == null ? void 0 : _a.dispose(), this._eventHandler = void 0;
  }
  getCoordinate() {
    return void 0 === this._coords && (this._coords = this._element.getBoundingClientRect()), this._coords;
  }
  updateCanvasSize() {
    const t2 = this._HDPIscaleRatio;
    let e2, i2;
    if (this._enqueuedSize && ({ width: e2, height: i2 } = this._enqueuedSize, this._enqueuedSize = void 0, this._width = e2, this._height = i2), this._viewport) {
      const t3 = this._width, s2 = this._height;
      e2 = v(this._viewport.width, t3), i2 = v(this._viewport.height, s2);
    }
    if (e2 && i2) {
      const s2 = this.getElement();
      this._renderer.setDimensions(e2 * t2, i2 * t2), s2.style.width = `${e2}px`, s2.style.height = `${i2}px`;
    }
    this._renderer.scale(t2, t2), this.setSmoothing(this._smoothing), this._coords = void 0;
  }
}
const { min: y, max: R } = Math, C = 0.5;
class G {
  constructor({ width: t2, height: e2, resourceId: i2, x: s2 = 0, y: h2 = 0, collidable: n2 = false, interactive: r2 = false, mask: a2 = false, sheet: o2 = [], sheetTileWidth: d2 = 0, sheetTileHeight: l2 = 0 } = { width: 64, height: 64 }) {
    if (this.hover = false, this.isDragging = false, this._children = [], this._disposed = false, this._mask = false, this._interactive = false, this._draggable = false, this._keepInBounds = false, this._pressed = false, t2 <= 0 || e2 <= 0)
      throw new Error("cannot construct a zSprite without valid dimensions");
    if (this.collidable = n2, this._mask = a2, this._bounds = { left: 0, top: 0, width: t2, height: e2 }, this.setX(s2), this.setY(h2), this.setInteractive(r2), i2 && this.setResource(i2), Array.isArray(o2) && o2.length > 0) {
      if (!i2)
        throw new Error("cannot use a spritesheet without a valid resource id");
      this.setSheet(o2, d2, l2);
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
    e2 !== t2 && (this._bounds.width = t2, 0 !== e2 && (this._bounds.left -= t2 * C - e2 * C), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t2) {
    const e2 = this._bounds.height || 0;
    e2 !== t2 && (this._bounds.height = t2, 0 !== e2 && (this._bounds.top -= t2 * C - e2 * C), this.invalidate());
  }
  setBounds(t2, e2, i2, s2) {
    if (this._constraint)
      t2 -= this._constraint.left, e2 -= this._constraint.top;
    else if (!this.canvas)
      throw new Error("cannot update position of a Sprite that has no constraint or is not added to a canvas");
    let h2 = false;
    "number" == typeof i2 && (h2 = this._bounds.width !== i2, this._bounds.width = i2), "number" == typeof s2 && (h2 = h2 || this._bounds.height !== s2, this._bounds.height = s2);
    const n2 = this._bounds.width, r2 = this._bounds.height, a2 = this._constraint ? this._constraint.width : this.canvas.getWidth(), o2 = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const i3 = y(0, -(n2 - a2)), s3 = y(0, -(r2 - o2)), h3 = o2 - r2;
      t2 = y(a2 - n2, R(t2, i3)), e2 = y(h3, R(e2, s3));
    } else
      t2 > a2 && (t2 += n2 * C), e2 > o2 && (e2 += r2 * C);
    this.setX(t2), this.setY(e2), h2 && this.invalidate();
  }
  getBounds() {
    return this._bounds;
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
    if (!this.canvas)
      return;
    const i2 = this._bounds;
    let s2 = !!this._resourceId;
    s2 && e2 && (s2 = ((t3, e3) => {
      const { left: i3, top: s3 } = t3;
      return i3 + t3.width >= e3.left && i3 <= e3.right && s3 + t3.height >= e3.top && s3 <= e3.bottom;
    })(i2, e2));
    let h2 = this._mask;
    if (h2 && t2.save(), this._mask && t2.setBlendMode("destination-in"), s2) {
      const s3 = this._animation;
      let { left: h3, top: n3, width: r2, height: a2 } = i2;
      if (s3) {
        const i3 = s3.tileWidth ? s3.tileWidth : C + r2 << 0, o2 = s3.tileHeight ? s3.tileHeight : C + a2 << 0;
        e2 && (h3 -= e2.left, n3 -= e2.top), t2.drawImageCropped(this._resourceId, s3.col * i3, s3.type.row * o2, i3, o2, h3, n3, r2, a2);
      } else if (e2) {
        const { src: s4, dest: h4 } = ((t3, e3) => {
          let { left: i3, top: s5, width: h5, height: n4 } = t3;
          const { left: r3, top: a3, width: o2, height: d2 } = e3;
          return h5 = i3 > r3 ? Math.min(h5, o2 - (i3 - r3)) : Math.min(o2, h5 - (r3 - i3)), n4 = s5 > a3 ? Math.min(n4, d2 - (s5 - a3)) : Math.min(d2, n4 - (a3 - s5)), { src: { left: i3 > r3 ? 0 : r3 - i3, top: s5 > a3 ? 0 : a3 - s5, width: h5, height: n4 }, dest: { left: i3 > r3 ? i3 - r3 : 0, top: s5 > a3 ? s5 - a3 : 0, width: h5, height: n4 } };
        })(i2, e2);
        t2.drawImageCropped(this._resourceId, s4.left, s4.top, s4.width, s4.height, h4.left, h4.top, h4.width, h4.height);
      } else
        t2.drawImage(this._resourceId, h3, n3, r2, a2);
    }
    let n2 = this._children[0];
    for (; n2; )
      n2.draw(t2, e2), n2 = n2.next;
    this._mask && t2.setBlendMode("source-over"), this.canvas.DEBUG && t2.drawRect(this.getX(), this.getY(), this.getWidth(), this.getHeight(), "#FF0000", "stroke"), h2 && t2.restore();
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
      const e2 = this._bounds, i2 = t2.getBounds(), s2 = R(e2.left, i2.left), h2 = R(e2.top, i2.top);
      return { left: s2, top: h2, width: y(e2.left + e2.width, i2.width + i2.height) - s2, height: y(e2.top + e2.height, i2.top + i2.height) - h2 };
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
    return this._constraint = { left: t2, top: e2, width: i2, height: s2 }, this._bounds.left = R(t2, this._bounds.left), this._bounds.top = R(e2, this._bounds.top), this._keepInBounds = true, this.getConstraint();
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
    const { type: r2 } = i2;
    if (this._pressed && ("touchend" === r2 || "mouseup" === r2))
      return this._pressed = false, this.isDragging && (this.isDragging = false), Date.now() - this._pressTime < 250 && this.handleClick(), this.handleRelease(t2, e2, i2), true;
    if (this.insideBounds(t2, e2)) {
      if (this.hover = true, "touchstart" === r2 || "mousedown" === r2)
        return this._pressTime = Date.now(), this._pressed = true, this._draggable && (this.isDragging = true, this._dragStartOffset = { x: this._bounds.left, y: this._bounds.top }, this._dragStartEventCoordinates = { x: t2, y: e2 }), this.handlePress(t2, e2, i2), "touchstart" === r2 && (i2.stopPropagation(), i2.preventDefault()), true;
    } else
      this.hover = false;
    return !!this.isDragging && (this.handleMove(t2, e2, i2), true);
  }
  invalidate() {
    this.canvas && this.canvas.invalidate();
  }
  updateAnimation(t2 = 1) {
    const e2 = this._animation;
    e2.counter += t2, e2.counter >= e2.fpt && (++e2.col, e2.counter = e2.counter % e2.fpt), e2.col > e2.maxCol && (e2.col = e2.type.col, "function" == typeof e2.onComplete && e2.onComplete(this));
  }
}
export {
  X as Canvas,
  r as Loader,
  G as Sprite
};
