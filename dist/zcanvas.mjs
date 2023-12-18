var L = (h, t, e) => {
  if (!t.has(h))
    throw TypeError("Cannot " + e);
};
var x = (h, t, e) => (L(h, t, "read from private field"), e ? e.call(h) : t.get(h)), z = (h, t, e) => {
  if (t.has(h))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(h) : t.set(h, e);
}, P = (h, t, e, i) => (L(h, t, "write to private field"), i ? i.call(h, e) : t.set(h, e), e);
class G {
  constructor(t, e) {
    this._context = t, this._cache = e;
  }
  /* public methods */
  getBackingStoreRatio() {
    const t = this._context;
    return t.webkitBackingStorePixelRatio || t.mozBackingStorePixelRatio || t.msBackingStorePixelRatio || t.oBackingStorePixelRatio || t.backingStorePixelRatio || 1;
  }
  setSmoothing(t) {
    const e = [
      "imageSmoothingEnabled",
      "mozImageSmoothingEnabled",
      "oImageSmoothingEnabled",
      "webkitImageSmoothingEnabled"
    ], i = [
      "-moz-crisp-edges",
      "-webkit-crisp-edges",
      "pixelated",
      "crisp-edges"
    ], s = this._context, n = s.canvas.style;
    e.forEach((r) => {
      s[r] !== void 0 && (s[r] = t);
    }), i.forEach((r) => {
      n["image-rendering"] = t ? void 0 : r;
    });
  }
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
  drawRect(t, e, i, s, n, r = "fill") {
    r === "fill" ? (this._context.fillStyle = n, this._context.fillRect(t, e, i, s)) : r === "stroke" && (this._context.lineWidth = 1, this._context.strokeStyle = n, this._context.strokeRect(t, e, i, s));
  }
  drawImage(t, e, i, s, n) {
    this._context.drawImage(t, e, i, s, n);
  }
  drawImageCropped(t, e, i, s, n, r, a, o, l) {
    this._context.drawImage(
      t,
      // TODO via Cache key identifier!!
      0.5 + e << 0,
      0.5 + i << 0,
      0.5 + s << 0,
      0.5 + n << 0,
      0.5 + r << 0,
      0.5 + a << 0,
      0.5 + o << 0,
      0.5 + l << 0
    );
  }
}
class q {
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
const b = {
  /**
   * Load the image contents described in aSource and fire a callback when the
   * resulting Bitmap has been loaded and is ready for rendering, the callback
   * method will receive a SizedImage object as its first argument.
   *
   * if an Error has occurred the second argument will be the Error
   *
   * @param {string}    aSource either base64 encoded bitmap data or (web)path
   *                    to an image file
   * @param {HTMLImageElement=} aOptImage optional HTMLImageElement to load the aSource
   *                    into, in case we'd like to re-use an existing Element
   *                    (will not work in Firefox repeatedly as load handlers
   *                    will only fire once)
   * @return {Promise<SizedImage>}
   */
  loadImage(h, t = null) {
    return new Promise((e, i) => {
      const s = t || new window.Image(), n = J(h), r = new q(), a = (l) => {
        r.dispose(), i(l);
      }, o = () => {
        r.dispose(), b.onReady(s).then((l) => e(W(s))).catch(i);
      };
      n || (j(h, s), r.add(s, "load", o), r.add(s, "error", a)), s.src = h, n && b.onReady(s).then((l) => e(W(s))).catch(i);
    });
  },
  /**
   * a quick query to check whether the Image is ready for rendering
   *
   * @public
   * @param {HTMLImageElement} aImage
   * @return {boolean}
   */
  isReady(h) {
    return h.complete !== !0 ? !1 : typeof h.naturalWidth == "number" && h.naturalWidth > 0;
  },
  /**
   * Executes given callback when given Image is actually ready for rendering
   * If the image was ready when this function was called, execution is synchronous
   * if not it will be made asynchronous via RAF delegation
   *
   * @public
   * @param {HTMLImageElement} aImage
   * @return {Promise<void>}
   */
  onReady(h) {
    return new Promise((t, e) => {
      let s = 0;
      function n() {
        b.isReady(h) ? t() : ++s === 60 ? (console.error(typeof h), e(new Error("Image could not be resolved. This shouldn't occur."))) : window.requestAnimationFrame(n);
      }
      n();
    });
  }
};
function j(h, t) {
  Q(h) || (t.crossOrigin = "Anonymous");
}
function J(h) {
  const t = (typeof h == "string" ? h : h.src).substr(0, 5);
  return t === "data:" || t === "blob:";
}
function K(h) {
  return {
    width: h.width || h.naturalWidth,
    height: h.height || h.naturalHeight
  };
}
function Q(h) {
  const { location: t } = window;
  return h.startsWith("./") || h.startsWith(`${t.protocol}//${t.host}`) ? !0 : !/^http[s]?:/.test(h);
}
function W(h) {
  const t = {
    image: h,
    size: null
  };
  return h instanceof window.HTMLImageElement && (t.size = K(h)), t;
}
let E;
function k() {
  return E || (E = document.createElement("canvas")), E;
}
function O() {
  E.width = 1, E.height = 1;
}
async function Z(h, t, e, i = !0) {
  if (h.size.width === t || h.size.height === e)
    return console.info("return as is"), h.image;
  T(k(), h.image, t, e);
  const s = k().toDataURL(i ? "image/png" : "image/jpg");
  O();
  const n = new Image();
  return await b.loadImage(s, n), n;
}
function T(h, t, e, i) {
  const s = h.getContext("2d");
  return h.width = e, h.height = i, s.clearRect(0, 0, e, i), s.drawImage(t, 0, 0, e, i), s;
}
var p;
class V {
  constructor() {
    /**
     * @private
     * @type {Map<string, CachedBitmapEntry>}
     */
    z(this, p, void 0);
    P(this, p, /* @__PURE__ */ new Map());
  }
  dispose() {
    x(this, p).clear(), P(this, p, void 0);
  }
  /**
   * @param {string} key 
   * @returns {Image|undefined}
   */
  get(t) {
    var e;
    return (e = x(this, p).get(t)) == null ? void 0 : e.bitmap;
  }
  set(t, e, i, s) {
    return x(this, p).set(t, {
      original: e,
      resizedImage: i,
      size: s
    }), i;
  }
  /**
   * Caches given image at provided width and height. This can be used
   * to speed up repeating rendering by using an appropriately sized source.
   * Must be invalidated whenever size of drawable element changes.
   * 
   * @param {string} key 
   * @param {HTMLImageElement|HTMLCanvasElement|string} image
   * @param {number=} width, defaults to image width
   * @param {number=} height, defaults to image height
   * @returns {Promise<Image>}
   */
  async cache(t, e, i = 0, s = 0) {
    const n = e instanceof window.HTMLCanvasElement, r = e instanceof window.HTMLImageElement;
    let a;
    n ? (a.width = e.width, a.height = e.height) : { size: a, image: e } = await b.loadImage(
      r ? e.src : e,
      r ? e : null
    );
    let o = e;
    return (i > 0 && a.width !== i || s > 0 && a.height !== s) && (o = await Z({ size: a, image: e }, i, s)), this.set(t, e, o, a), o;
  }
  has(t, e, i) {
    const s = x(this, p).get(t);
    return s ? (console.info("has entry for " + t + ":" + (s.size.width === e && s.size.height === i)), s.size.width === e && s.size.height === i) : !1;
  }
  /**
   * @param {string} key
   * @return {boolean}
   */
  clear(t) {
    return x(this, p).delete(t);
  }
}
p = new WeakMap();
class tt {
  constructor(t, e = !1) {
    if (this._element = t, e && typeof this._element.transferControlToOffscreen == "function") {
      const i = t.transferControlToOffscreen();
      this._worker = new Worker("./workers/canvas.worker.js"), this._worker.postMessage({
        cmd: "register",
        canvas: i
      }, [i]);
    } else
      this._renderer = new G(t.getContext("2d"), new V());
  }
  /* public methods */
  // @TODO when using offscreenCanvas post messages (will be difficult with getters though...)
  // @TODO can we just return a direct reference to the Renderer class when we're not using the offscreen canvas ???
  getBackingStoreRatio() {
    return this._renderer.getBackingStoreRatio();
  }
  setSmoothing(t) {
    this._renderer.setSmoothing(t);
  }
  save() {
    this._renderer.save();
  }
  restore() {
    this._renderer.restore();
  }
  scale(t, e) {
    this._renderer.scale(t, e);
  }
  setBlendMode(t) {
    this._renderer.setBlendMode(t);
  }
  clearRect(t, e, i, s) {
    this._renderer.clearRect(t, e, i, s);
  }
  drawRect(t, e, i, s, n, r) {
    this._renderer.drawRect(t, e, i, s, n, r);
  }
  drawImage(t, e, i, s, n) {
    this._renderer.drawImage(t, e, i, s, n);
  }
  drawImageCropped(t, e, i, s, n, r, a, o, l) {
    this._renderer.drawImageCropped(
      t,
      e,
      i,
      s,
      n,
      r,
      a,
      o,
      l
    );
  }
}
const { min: y, max: $, round: X } = Math, M = 60, et = M + 3;
class ot {
  constructor({
    width: t = 300,
    height: e = 300,
    fps: i = M,
    scale: s = 1,
    backgroundColor: n = null,
    animate: r = !1,
    smoothing: a = !0,
    stretchToFit: o = !1,
    viewport: l = null,
    preventEventBubbling: f = !1,
    parentElement: d = null,
    debug: c = !1,
    viewportHandler: _,
    onUpdate: m,
    useOffscreen: H = !1
  } = {}) {
    if (this.DEBUG = !1, this.benchmark = {
      minElapsed: 1 / 0,
      maxElapsed: -1 / 0,
      minFps: 1 / 0,
      maxFps: -1 / 0
    }, this.cache = new V(), this._smoothing = !1, this._stretchToFit = !1, this._HDPIscaleRatio = 1, this._preventDefaults = !1, this._lastRender = 0, this._renderId = 0, this._renderPending = !1, this._disposed = !1, this._scale = { x: 1, y: 1 }, this._activeTouches = [], this._children = [], this._animate = !1, t <= 0 || e <= 0)
      throw new Error("cannot construct a zCanvas without valid dimensions");
    this.DEBUG = c, this._element = document.createElement("canvas"), this._renderer = new tt(this._element, H), this._updateHandler = m, this._renderHandler = this.render.bind(this), this._viewportHandler = _, this.setFrameRate(i), this.setAnimatable(r), n && this.setBackgroundColor(n);
    const C = window.devicePixelRatio || 1, u = this._renderer.getBackingStoreRatio(), g = C / u;
    this._HDPIscaleRatio = C !== u ? g : 1, this.setDimensions(t, e, !0, !0), l && this.setViewport(l.width, l.height), s !== 1 && this.scale(s, s), o && this.stretchToFit(!0), d instanceof HTMLElement && this.insertInPage(d), this.setSmoothing(a), this.preventEventBubbling(f), this.addListeners(), this._animate && this.render();
  }
  /* public methods */
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
    this._renderer.setSmoothing(t), this._smoothing = t, this.invalidate();
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
    this._enqueuedSize = { width: t, height: e }, i === !0 && (this._preferredWidth = t, this._preferredHeight = e), s === !0 && A(this, this._renderer), this.invalidate();
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
    this._viewport = { width: t, height: e, left: 0, top: 0, right: t, bottom: e }, this.panViewport(0, 0), A(this, this._renderer);
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
    s.left = $(0, y(t, this._width - s.width)), s.right = s.left + s.width, s.top = $(0, y(e, this._height - s.height)), s.bottom = s.top + s.height, this.invalidate(), i && ((n = this._viewportHandler) == null || n.call(this, { type: "panned", value: s }));
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
   * safe method to draw Image data onto canvas while sanitizing the destination values to
   * overcome IndexSizeErrors and other nastiness
   *
   * @param {SpriteSource} source canvas drawable to draw
   * @param {number} destX destination x-coordinate of given image
   * @param {number} destY destination y-coordinate of given image
   * @param {number} destWidth destination width of given image
   * @param {number} destHeight destination width of given image
   * @param {number=} optSourceX optional, whether to use an alternative x-coordinate for the source rectangle
   * @param {number=} optSourceY optional, whether to use an alternative y-coordinate for the source rectangle
   * @param {number=} optSourceWidth optional, whether to use an alternative width for the source rectangle
   * @param {number=} optSourceHeight optional, whether to use an alternative height for the source rectangle
   */
  drawImage(t, e, i, s, n, r, a, o, l) {
    if (e = 0.5 + e << 0, i = 0.5 + i << 0, s = 0.5 + s << 0, n = 0.5 + n << 0, !(s <= 0 || n <= 0))
      if (typeof r == "number") {
        s = y(this._element.width, s), n = y(this._element.height, n);
        const f = s / o, d = n / l;
        r + o > t.width && (s -= f * (r + o - t.width), o -= r + o - t.width), a + l > t.height && (n -= d * (a + l - t.height), l -= a + l - t.height), this._renderer.drawImageCropped(
          t,
          // no rounding required here as these are integer values
          r,
          a,
          o,
          l,
          // but we do round the target coordinates
          e,
          i,
          s,
          n
        );
      } else
        this._renderer.drawImage(t, e, i, s, n);
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
    let s = this._preferredWidth, n = this._preferredHeight, r = 1, a = 1;
    i > e ? (n = t ? i / e * s : n, r = e / s, a = i / n) : (s = t ? e / i * n : s, r = e / s, a = i / n), this.setDimensions(X(s), X(n), !1, !0), this.scale(r, a);
  }
  dispose() {
    if (this._disposed)
      return;
    this._animate = !1, window.cancelAnimationFrame(this._renderId), this.removeListeners();
    let t = this.numChildren();
    for (; t--; )
      this._children[t].dispose();
    this._children = [], this._element.parentNode && this._element.parentNode.removeChild(this._element), this.cache.dispose(), this._disposed = !0;
  }
  /* event handlers */
  handleInteraction(t) {
    const e = this._children.length, i = this._viewport;
    let s;
    if (e > 0)
      switch (s = this._children[e - 1], t.type) {
        default:
          let n = 0, r = 0;
          const a = t.changedTouches;
          let o = 0, l = a.length;
          if (l > 0) {
            let { x: u, y: g } = this.getCoordinate();
            for (i && (u -= i.left, g -= i.top), o = 0; o < l; ++o) {
              const w = a[o], { identifier: B } = w;
              switch (n = w.pageX - u, r = w.pageY - g, t.type) {
                case "touchstart":
                  for (; s; ) {
                    if (!this._activeTouches.includes(s) && s.handleInteraction(n, r, t)) {
                      this._activeTouches[B] = s;
                      break;
                    }
                    s = s.last;
                  }
                  s = this._children[e - 1];
                  break;
                default:
                  s = this._activeTouches[B], s != null && s.handleInteraction(n, r, t) && t.type !== "touchmove" && (this._activeTouches[B] = null);
                  break;
              }
            }
          }
          break;
        case "mousedown":
        case "mousemove":
        case "mouseup":
          let { offsetX: f, offsetY: d } = t;
          for (i && (f += i.left, d += i.top); s && !s.handleInteraction(f, d, t); )
            s = s.last;
          break;
        case "wheel":
          const { deltaX: c, deltaY: _ } = t, m = 20, H = c === 0 ? 0 : c > 0 ? m : -m, C = _ === 0 ? 0 : _ > 0 ? m : -m;
          this.panViewport(i.left + H, i.top + C, !0);
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
    this._fps > M ? i = this._fps / this._aFps : this._fps === M && this._aFps > et ? i = 1 : i = 1 / (this._fps / this._aFps), this._lastRaf = t, this._lastRender = t - e % this._renderInterval, this._enqueuedSize && A(this, this._renderer);
    let s;
    const n = this._width, r = this._height;
    this._bgColor ? this._renderer.drawRect(0, 0, n, r, this._bgColor) : this._renderer.clearRect(0, 0, n, r);
    const a = typeof this._updateHandler == "function";
    for (a && this._updateHandler(t, i), s = this._children[0]; s; )
      a || s.update(t, i), s.draw(this._renderer, this._viewport), s = s.next;
    if (!this._disposed && this._animate && (this._renderPending = !0, this._renderId = window.requestAnimationFrame(this._renderHandler)), this.DEBUG && t > 2) {
      const o = window.performance.now() - t;
      this.benchmark.minElapsed = Math.min(this.benchmark.minElapsed, o), this.benchmark.maxElapsed = Math.max(this.benchmark.maxElapsed, o), this._aFps !== 1 / 0 && (this.benchmark.minFps = Math.min(this.benchmark.minFps, this._aFps), this.benchmark.maxFps = Math.max(this.benchmark.maxFps, this._aFps));
    }
  }
  /**
   * sprites have no HTML elements, the actual HTML listeners are
   * added onto the canvas, the Canvas will delegate events onto
   * the "children" of the canvas' Display List
   */
  addListeners() {
    this._eventHandler || (this._eventHandler = new q());
    const t = this._eventHandler, e = this.handleInteraction.bind(this), i = this._element;
    "ontouchstart" in window && ["start", "move", "end", "cancel"].forEach((s) => {
      t.add(i, `touch${s}`, e);
    }), ["down", "move"].forEach((s) => {
      t.add(i, `mouse${s}`, e);
    }), t.add(window, "mouseup", e), this._viewport && t.add(i, "wheel", e), this._stretchToFit && t.add(window, "resize", () => {
      this.stretchToFit(this._stretchToFit);
    });
  }
  /**
   * sprites have no HTML elements, the actual HTML listeners are
   * added onto the canvas, the Canvas will delegate events onto
   * the "children" of the canvas' Display List
   */
  removeListeners() {
    this._eventHandler && this._eventHandler.dispose(), this._eventHandler = void 0;
  }
  /**
   * return the bounding box of the canvas Element in the DOM
   */
  getCoordinate() {
    return this._coords === void 0 && (this._coords = this._element.getBoundingClientRect()), this._coords;
  }
}
function A(h, t) {
  const e = h._HDPIscaleRatio, i = h.getViewport();
  let s, n;
  if (h._enqueuedSize && ({ width: s, height: n } = h._enqueuedSize, h._enqueuedSize = void 0, h._width = s, h._height = n), i) {
    const r = h._width, a = h._height;
    s = y(i.width, r), n = y(i.height, a);
  }
  if (s && n) {
    const r = h.getElement();
    r.width = s * e, r.height = n * e, r.style.width = `${s}px`, r.style.height = `${n}px`;
  }
  t.scale(e, e), h.setSmoothing(h._smoothing), h._coords = void 0;
}
const N = (h, t) => {
  const { left: e, top: i } = h;
  return e + h.width >= t.left && e <= t.right && i + h.height >= t.top && i <= t.bottom;
}, it = (h, t) => {
  let { left: e, top: i, width: s, height: n } = h;
  const {
    left: r,
    top: a,
    width: o,
    height: l
  } = t;
  return e > r ? s = Math.min(s, o - (e - r)) : s = Math.min(o, s - (r - e)), i > a ? n = Math.min(n, l - (i - a)) : n = Math.min(l, n - (a - i)), {
    src: {
      // NOTE by default all Sprites draw their content from top left coordinate
      // we only correct for this if the visible area starts within the viewport
      left: e > r ? 0 : r - e,
      top: i > a ? 0 : a - i,
      width: s,
      height: n
    },
    dest: {
      left: e > r ? e - r : 0,
      top: i > a ? i - a : 0,
      width: s,
      height: n
    }
  };
}, { min: I, max: R } = Math, v = 0.5;
class lt {
  // coordinates of the event at the moment drag was started
  constructor({
    width: t,
    height: e,
    x: i = 0,
    y: s = 0,
    bitmap: n = void 0,
    collidable: r = !1,
    interactive: a = !1,
    mask: o = !1,
    sheet: l = [],
    sheetTileWidth: f = 0,
    sheetTileHeight: d = 0
  } = { width: 64, height: 64 }) {
    if (this.hover = !1, this.isDragging = !1, this._children = [], this._disposed = !1, this._mask = !1, this._interactive = !1, this._draggable = !1, this._keepInBounds = !1, this._bitmapReady = !1, this._pressed = !1, t <= 0 || e <= 0)
      throw new Error("cannot construct a zSprite without valid dimensions");
    if (this.collidable = r, this._mask = o, this._bounds = { left: 0, top: 0, width: t, height: e }, this.setX(i), this.setY(s), this.setInteractive(a), n && this.setBitmap(n), Array.isArray(l) && l.length > 0) {
      if (!n)
        throw new Error("cannot use a spritesheet without a valid Bitmap");
      this.setSheet(l, f, d);
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
    e !== t && (this._bounds.width = t, e !== 0 && (this._bounds.left -= t * v - e * v), this.invalidate());
  }
  getHeight() {
    return this._bounds.height;
  }
  setHeight(t) {
    const e = this._bounds.height || 0;
    e !== t && (this._bounds.height = t, e !== 0 && (this._bounds.top -= t * v - e * v), this.invalidate());
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
    const r = this._bounds.width, a = this._bounds.height, o = this._constraint ? this._constraint.width : this.canvas.getWidth(), l = this._constraint ? this._constraint.height : this.canvas.getHeight();
    if (this._keepInBounds) {
      const f = I(0, -(r - o)), d = I(0, -(a - l)), c = o - r, _ = l - a;
      t = I(c, R(t, f)), e = I(_, R(e, d));
    } else
      t > o && (t = t + r * v), e > l && (e = e + a * v);
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
    let s = this._bitmapReady;
    s && e && (s = N(i, e));
    let n = this._mask;
    if (n && t.save(), this._mask && t.setBlendMode("destination-in"), s) {
      const a = this._animation;
      let { left: o, top: l, width: f, height: d } = i;
      if (a) {
        const c = a.tileWidth ? a.tileWidth : v + f << 0, _ = a.tileHeight ? a.tileHeight : v + d << 0;
        e && (o -= e.left, l -= e.top), t.drawImageCropped(
          this._bitmap,
          // TODO via Cache key identifier
          a.col * c,
          // tile x offset
          a.type.row * _,
          // tile y offset
          c,
          _,
          o,
          l,
          f,
          d
        );
      } else if (e) {
        const { src: c, dest: _ } = it(i, e);
        t.drawImageCropped(
          this._bitmap,
          // TODO via Cache key identifier!!
          c.left,
          c.top,
          c.width,
          c.height,
          _.left,
          _.top,
          _.width,
          _.height
        );
      } else
        t.drawImage(
          this._bitmap,
          // TODO via Cache key identifier!!
          o,
          l,
          f,
          d
        );
    }
    let r = this._children[0];
    for (; r; )
      r.draw(t, e), r = r.next;
    this._mask && t.setBlendMode("source-over"), this.canvas.DEBUG && t.drawRect(this.getX(), this.getY(), this.getWidth(), this.getHeight(), "#FF0000", "stroke"), n && t.restore();
  }
  /**
   * evaluates whether given coordinate is within the Sprite bounds
   */
  insideBounds(t, e) {
    const { left: i, top: s, width: n, height: r } = this._bounds;
    return t >= i && t <= i + n && e >= s && e <= s + r;
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
      const e = this._bounds, i = t.getBounds(), s = R(e.left, i.left), n = R(e.top, i.top), r = I(e.left + e.width, i.width + i.height) - s, a = I(e.top + e.height, i.top + i.height) - n;
      return { left: s, top: n, width: r, height: a };
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
  getBitmap() {
    return this._bitmap;
  }
  /**
   * update / replace the Image contents of this Sprite, can be used
   * to swap spritesheets (for instance)
   *
   * @param {SpriteSource|null} bitmap
   * @param {number=} width optional new width to use for this Sprites bounds
   * @param {number=} height optional new width to use for this Sprites bounds
   */
  setBitmap(t, e, i) {
    const s = t instanceof window.HTMLCanvasElement, n = t instanceof window.HTMLImageElement;
    if (t && !s && !n && !(typeof t == "string"))
      throw new Error(`expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "${t}" instead`);
    return new Promise((a, o) => {
      if (this._bitmapReady = !1, !t) {
        this._bitmap = void 0;
        return;
      }
      const l = typeof e == "number", f = typeof i == "number";
      if (l && this.setWidth(e), f && this.setHeight(i), this._keepInBounds && this.canvas && (l || f)) {
        const d = -(this._bounds.width - this.canvas.getWidth()), c = -(this._bounds.height - this.canvas.getHeight());
        this._bounds.left > 0 ? this._bounds.left = 0 : this._bounds.left < d && (this._bounds.left = d), this._bounds.top > 0 ? this._bounds.top = 0 : this._bounds.top < c && (this._bounds.top = c);
      }
      if (s)
        return this._bitmap = t, this._bitmapReady = !0, this.invalidate(), a();
      b.loadImage(
        n ? t.src : t,
        n ? t : null
      ).then(({ size: d, image: c }) => {
        this._bitmap = c, this._bitmapReady = !0, this.invalidate(), a();
      }).catch((d) => {
        o(new Error(`zSprite.setBitmap() "${d == null ? void 0 : d.message}" occurred.`));
      });
    });
  }
  /**
   * Define the sprite sheet for this Sprite to use tile based animation
   * from its Bitmap, use in conjunction with setBitmap()
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
    return this._constraint = { left: t, top: e, width: i, height: s }, this._bounds.left = R(t, this._bounds.left), this._bounds.top = R(e, this._bounds.top), this._keepInBounds = !0, this.getConstraint();
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
  handlePress(t, e, i) {
  }
  /**
   * invoked when the user releases touch of this (previously pressed) Sprite
   *
   * @param {number} x position of the touch / cursor
   * @param {number} y position of the touch / cursor
   * @param {Event} event the original event that triggered this action
   */
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
    const r = this._children.length;
    if (r > 0)
      for (n = this._children[r - 1]; n; ) {
        if (s = n.handleInteraction(t, e, i), s)
          return !0;
        n = n.last;
      }
    if (!this._interactive)
      return !1;
    const { type: a } = i;
    if (this._pressed && (a === "touchend" || a === "mouseup"))
      return this._pressed = !1, this.isDragging && (this.isDragging = !1), Date.now() - this._pressTime < 250 && this.handleClick(), this.handleRelease(t, e, i), !0;
    if (this.insideBounds(t, e)) {
      if (this.hover = !0, a === "touchstart" || a === "mousedown")
        return this._pressTime = Date.now(), this._pressed = !0, this._draggable && (this.isDragging = !0, this._dragStartOffset = {
          x: this._bounds.left,
          y: this._bounds.top
        }, this._dragStartEventCoordinates = { x: t, y: e }), this.handlePress(t, e, i), a === "touchstart" && (i.stopPropagation(), i.preventDefault()), !0;
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
const S = /* @__PURE__ */ new Map(), F = [], D = [], st = (h, t, e = !1) => {
  const i = h.getIntersection(t);
  if (i === void 0)
    return !1;
  Y(h, i, F), Y(t, i, D);
  let s = 0;
  if (e === !0) {
    const n = i.width, r = i.height;
    for (let a = 0; a < r; ++a)
      for (let o = 0; o < n; ++o) {
        if (F[s] !== 0 && D[s] !== 0)
          return { x: o, y: a };
        ++s;
      }
  } else {
    const n = F.length;
    for (s; s < n; ++s)
      if (F[s] !== 0 && D[s] !== 0)
        return !0;
  }
  return !1;
}, Y = (h, t, e) => {
  const i = h.getBitmap(), s = h.getBounds(), n = parseInt(t.left - s.left), r = parseInt(t.top - s.top);
  let a = parseInt(t.width), o = parseInt(t.height);
  if (a === 0 || o === 0)
    return e.length = 0;
  e.length = parseInt(a * o);
  let l, f, d, c;
  const _ = S.get(i);
  if (_ && n + a < i.width)
    l = _, f = i.width, c = r, d = n;
  else {
    const u = !(i instanceof window.HTMLCanvasElement), g = (u ? k() : i).getContext("2d");
    u && T(k(), i, s.width, s.height), l = g.getImageData(n, r, a, o).data, f = a, c = 0, d = 0;
  }
  const m = c + o, H = d + a;
  let C = -1;
  for (let u = c; u < m; ++u)
    for (let g = d; g < H; ++g) {
      const w = (u * f + g) * 4;
      e[++C] = l[w + 3] << 24 | l[w] << 16 | l[w + 1] << 8 | l[w + 2];
    }
}, nt = (h, t, e, i, s, n = !1) => {
  const r = [];
  let a = h.length, o, l, f, d, c;
  for (; a--; )
    o = h[a], l = o.getX(), f = o.getY(), d = o.getWidth(), c = o.getHeight(), l < t + i && l + d > t && f < e + s && f + c > e && (!n || n && o.collidable) && r.push(o);
  return r;
}, ht = (h) => new Promise((t, e) => {
  !(h instanceof window.HTMLCanvasElement) ? b.onReady(h).then(() => {
    const { width: s, height: n } = h, r = k();
    S.set(
      h,
      T(r, h, s, n).getImageData(0, 0, s, n).data
    ), O(), t(!0);
  }).catch(e) : (S.set(h, h.getContext("2d").getImageData(0, 0, h.width, h.height).data), t(!0));
}), rt = (h) => U(h) ? (S.delete(h), !0) : !1, U = (h) => S.has(h), dt = {
  pixelCollision: st,
  getChildrenUnderPoint: nt,
  cache: ht,
  hasCache: U,
  clearCache: rt,
  isInsideViewport: N
};
export {
  ot as canvas,
  dt as collision,
  b as loader,
  lt as sprite
};
