declare module "src/rendering/IRenderer" {
    import type { Point } from "src/definitions/types";
    export interface IRenderer {
        save(): void;
        restore(): void;
        translate(x: number, y: number): void;
        rotate(angleInRadians: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        scale(xScale: number, yScale?: number): void;
        setBlendMode(type: GlobalCompositeOperation): void;
        setAlpha(value: number): void;
        clearRect(x: number, y: number, width: number, height: number): void;
        drawRect(x: number, y: number, width: number, height: number, color: string, fillType?: "fill" | "stroke"): void;
        drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color: string, fillType?: "fill" | "stroke"): void;
        drawCircle(x: number, y: number, radius: number, fillColor?: string, strokeColor?: string): void;
        drawImage(resourceId: string, x: number, y: number, width?: number, height?: number, drawContext?: DrawContext): void;
        drawImageCropped(resourceId: string, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number, drawContext?: DrawContext): void;
        createPattern(resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat"): void;
        drawPattern(patternResourceId: string, x: number, y: number, width: number, height: number): void;
    }
    export type DrawContext = {
        scale?: number;
        rotation?: number;
        pivot?: Point;
        alpha?: number;
        blendMode?: GlobalCompositeOperation;
        safeMode?: boolean;
    };
}
declare module "src/utils/ImageMath" {
    import type { Rectangle, Viewport, TransformedDrawBounds } from "src/definitions/types";
    export const isInsideViewport: (spriteBounds: Rectangle, viewport: Viewport) => boolean;
    export const calculateDrawRectangle: (spriteBounds: Rectangle, viewport: Viewport) => TransformedDrawBounds;
}
declare module "src/Sprite" {
    import type Canvas from "src/Canvas";
    import type { Point, Rectangle, SpriteSheet, Viewport } from "src/definitions/types";
    import type { IRenderer, DrawContext } from "src/rendering/IRenderer";
    interface SpriteProps {
        width: number;
        height: number;
        x?: number;
        y?: number;
        rotation?: number;
        resourceId?: string;
        collidable?: boolean;
        interactive?: boolean;
        mask?: boolean;
        sheet?: SpriteSheet[];
        sheetTileWidth?: number;
        sheetTileHeight?: number;
    }
    export default class Sprite {
        collidable: boolean;
        hover: boolean;
        isDragging: boolean;
        canvas: Canvas | undefined;
        last: Sprite | undefined;
        next: Sprite | undefined;
        protected _bounds: Rectangle;
        protected _rotation: number;
        protected _pivot: Point | undefined;
        protected _scale: number;
        protected _children: Sprite[];
        protected _parent: Sprite | Canvas | undefined;
        protected _disposed: boolean;
        protected _mask: boolean;
        protected _interactive: boolean;
        protected _draggable: boolean;
        protected _keepInBounds: boolean;
        protected _constraint: Rectangle | undefined;
        protected _sheet: SpriteSheet[] | undefined;
        protected _animation: {
            type?: SpriteSheet;
            col: number;
            maxCol: number;
            fpt: number;
            counter: number;
            tileWidth: number;
            tileHeight: number;
            onComplete?: (sprite: Sprite) => void;
        } | undefined;
        protected _drawContext: DrawContext | undefined;
        protected _resourceId: string;
        protected _pressTime: number;
        protected _pressed: boolean;
        protected _dragStartOffset: Point;
        protected _dragStartEventCoordinates: Point;
        constructor({ width, height, resourceId, x, y, rotation, collidable, interactive, mask, sheet, sheetTileWidth, sheetTileHeight }?: SpriteProps);
        getDraggable(): boolean;
        setDraggable(draggable: boolean, keepInBounds?: boolean): void;
        getX(): number;
        setX(value: number): void;
        getY(): number;
        setY(value: number): void;
        getWidth(): number;
        setWidth(value: number): void;
        getHeight(): number;
        setHeight(value: number): void;
        setBounds(left: number, top: number, width?: number, height?: number): void;
        getBounds(): Rectangle;
        getRotation(): number;
        setRotation(angleInDegrees: number, optPivot?: Point): void;
        setScale(value: number): void;
        getInteractive(): boolean;
        setInteractive(value: boolean): void;
        update(now: DOMHighResTimeStamp, framesSinceLastUpdate: number): void;
        draw(renderer: IRenderer, viewport?: Viewport): void;
        insideBounds(x: number, y: number): boolean;
        collidesWith(sprite: Sprite): boolean;
        getIntersection(sprite: Sprite): Rectangle | undefined;
        collidesWithEdge(sprite: Sprite, edge: 0 | 1 | 2 | 3): boolean;
        setResource(resourceId: string | null, width?: number, height?: number): void;
        getResourceId(): string | undefined;
        setSheet(sheet: SpriteSheet[], width?: number, height?: number): void;
        switchAnimation(sheetIndex: number): void;
        setParent(parent: Sprite | Canvas | undefined): void;
        getParent(): Sprite | Canvas | undefined;
        setCanvas(canvas: Canvas): void;
        setConstraint(left: number, top: number, width: number, height: number): Rectangle;
        getConstraint(): Rectangle;
        addChild(child: Sprite): Sprite;
        removeChild(child: Sprite): Sprite;
        getChildAt(index: number): Sprite | undefined;
        removeChildAt(index: number): Sprite | undefined;
        numChildren(): number;
        getChildren(): Sprite[];
        contains(child: Sprite): boolean;
        dispose(): void;
        protected handlePress(x: number, y: number, event: Event): void;
        protected handleRelease(x: number, y: number, event: Event): void;
        protected handleClick(): void;
        protected handleMove(x: number, y: number, event: Event): void;
        handleInteraction(x: number, y: number, event: Event): boolean;
        invalidate(): void;
        protected invalidateDrawContext(): void;
        protected updateAnimation(framesSinceLastRender?: number): void;
    }
}
declare module "src/definitions/types" {
    import type Sprite from "src/Sprite";
    export type { IRenderer } from "src/rendering/IRenderer";
    export type Size = {
        width: number;
        height: number;
    };
    export type Point = {
        x: number;
        y: number;
    };
    export type Rectangle = {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    export type ImageSource = HTMLImageElement | HTMLCanvasElement | File | Blob | ImageData | ImageBitmap | string;
    export type SizedImage = {
        size: Size;
        image: HTMLImageElement;
    };
    export type Viewport = {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        height: number;
    };
    export type SpriteSheet = {
        row: number;
        col: number;
        amount: number;
        fpt: number;
        onComplete?: (sprite: Sprite) => void;
    };
    export type TransformedDrawBounds = {
        src: Rectangle;
        dest: Rectangle;
    };
}
declare module "src/utils/EventHandler" {
    export default class EventHandler {
        private _eventMap;
        protected _disposed: boolean;
        constructor();
        add(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject): boolean;
        has(target: EventTarget, type: string): boolean;
        remove(target: EventTarget, type: string): boolean;
        dispose(): void;
    }
}
declare module "src/utils/ImageUtil" {
    import type { SizedImage } from "src/definitions/types";
    export function createCanvas(width?: number, height?: number, optimizedReads?: boolean): {
        cvs: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
    };
    export function getTempCanvas(): HTMLCanvasElement;
    export function clearTempCanvas(): void;
    export function resizeImage(sizedImage: SizedImage, width: number, height: number): Promise<ImageBitmap>;
    export function cloneCanvas(canvasToClone: HTMLCanvasElement): HTMLCanvasElement;
    export function imageToCanvas(cvs: HTMLCanvasElement, image: HTMLImageElement | ImageBitmap, width: number, height: number): void;
    export function imageToBitmap(image: HTMLImageElement | HTMLCanvasElement | Blob): Promise<ImageBitmap>;
    export function blobToImage(blob: Blob): Promise<HTMLImageElement>;
}
declare module "src/utils/FileUtil" {
    export function readFile(file: File): Promise<Blob>;
}
declare module "src/Loader" {
    import type { SizedImage } from "src/definitions/types";
    const Loader: {
        loadImage(source: string | Blob | File): Promise<SizedImage>;
        loadBitmap(source: string): Promise<ImageBitmap>;
        isReady(image: HTMLImageElement): boolean;
        onReady(image: HTMLImageElement): Promise<void>;
    };
    export default Loader;
}
declare module "src/utils/Cache" {
    export default class Cache<T> {
        private _map;
        private _createFn;
        private _destroyFn;
        private _index;
        constructor(createFn?: () => T, destroyFn?: (entity: T) => void);
        dispose(): void;
        get(key: string): T | undefined;
        set(key: string, entity: T): void;
        has(key: string): boolean;
        remove(key: string): boolean;
        next(): T | undefined;
        fill(amount: number): void;
        reset(): void;
    }
}
declare module "src/rendering/RendererImpl" {
    import type { IRenderer, DrawContext } from "src/rendering/IRenderer";
    import Cache from "src/utils/Cache";
    export default class RendererImpl implements IRenderer {
        private _debug;
        _canvas: HTMLCanvasElement | OffscreenCanvas;
        _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        _bitmapCache: Cache<ImageBitmap>;
        _patternCache: Cache<CanvasPattern>;
        constructor(canvas: HTMLCanvasElement | OffscreenCanvas, _debug?: boolean);
        dispose(): void;
        cacheResource(id: string, bitmap: ImageBitmap): void;
        getResource(id: string): ImageBitmap | undefined;
        disposeResource(id: string): void;
        setDimensions(width: number, height: number): void;
        setSmoothing(enabled: boolean): void;
        save(): void;
        restore(): void;
        translate(x: number, y: number): void;
        rotate(angleInRadians: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        scale(xScale: number, yScale?: number): void;
        setBlendMode(mode: GlobalCompositeOperation): void;
        setAlpha(value: number): void;
        clearRect(x: number, y: number, width: number, height: number): void;
        drawRect(x: number, y: number, width: number, height: number, color: string, fillType?: string): void;
        drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color: string, fillType?: "fill" | "stroke"): void;
        drawCircle(x: number, y: number, radius: number, fillColor?: string, strokeColor?: string): void;
        drawImage(resourceId: string, x: number, y: number, width?: number, height?: number, drawContext?: DrawContext): void;
        drawImageCropped(resourceId: string, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number, drawContext?: DrawContext): void;
        createPattern(resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat"): void;
        drawPattern(patternResourceId: string, x: number, y: number, width: number, height: number): void;
        private applyDrawContext;
    }
}
declare module "src/rendering/RenderAPI" {
    import type { ImageSource, Size } from "src/definitions/types";
    import type { IRenderer, DrawContext } from "src/rendering/IRenderer";
    export default class RenderAPI implements IRenderer {
        private _element;
        private _renderer;
        private _worker;
        private _useWorker;
        private _pool;
        private _commands;
        private _callbacks;
        constructor(canvas: HTMLCanvasElement, useOffscreen?: boolean, debug?: boolean);
        loadResource(id: string, source: ImageSource): Promise<Size>;
        getResource(id: string): Promise<ImageBitmap | undefined>;
        disposeResource(id: string): void;
        onCommandsReady(): void;
        dispose(): void;
        protected handleMessage(message: MessageEvent): void;
        private wrappedWorkerLoad;
        private wrappedLoad;
        setDimensions(width: number, height: number): void;
        createPattern(resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat"): void;
        setSmoothing(enabled: boolean): void;
        save(): void;
        restore(): void;
        translate(x: number, y: number): void;
        rotate(angleInRadians: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        scale(xScale: number, yScale?: number): void;
        setBlendMode(type: GlobalCompositeOperation): void;
        setAlpha(value: number): void;
        clearRect(x: number, y: number, width: number, height: number): void;
        drawRect(x: number, y: number, width: number, height: number, color: string, fillType?: "fill" | "stroke"): void;
        drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color: string, fillType?: "fill" | "stroke"): void;
        drawCircle(x: number, y: number, radius: number, fillColor?: string, strokeColor?: string): void;
        drawImage(resourceId: string, x: number, y: number, width: number, height: number, drawContext?: DrawContext): void;
        drawImageCropped(resourceId: string, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number, drawContext?: DrawContext): void;
        drawPattern(patternResourceId: string, x: number, y: number, width: number, height: number): void;
        protected onDraw(cmd: string, ...args: any[]): void;
        protected getBackend(cmd: string, ...args: any[]): void;
    }
}
declare module "src/Collision" {
    import type { Point, Rectangle } from "src/definitions/types";
    import type RenderAPI from "src/rendering/RenderAPI";
    import type Sprite from "src/Sprite";
    export default class Collision {
        private _renderer;
        private _cacheMap;
        constructor(_renderer: RenderAPI);
        dispose(): void;
        getChildrenUnderPoint(sprites: Sprite[], aX: number, aY: number, aWidth: number, aHeight: number, aOnlyCollidables?: boolean): Sprite[];
        pixelCollision(sprite1: Sprite, sprite2: Sprite, optReturnAsCoordinate?: boolean): Point | boolean;
        cache(resourceId: string): Promise<boolean>;
        clearCache(resourceId: string): boolean;
        hasCache(resourceId: string): boolean;
        getPixelArray(sprite: Sprite, rect: Rectangle, pixels: number[]): void;
    }
}
declare module "src/Canvas" {
    import type { Size, Point, Viewport, ImageSource } from "src/definitions/types";
    import RenderAPI from "src/rendering/RenderAPI";
    import EventHandler from "src/utils/EventHandler";
    import Collision from "src/Collision";
    import type Sprite from "src/Sprite";
    import { IRenderer } from "src/rendering/IRenderer";
    interface CanvasProps {
        width?: number;
        height?: number;
        fps?: number;
        scale?: number;
        backgroundColor?: string;
        animate?: boolean;
        smoothing?: boolean;
        stretchToFit?: boolean;
        viewport?: Size;
        viewportHandler?: ({}: {
            type: "panned";
            value: Viewport;
        }) => void;
        preventEventBubbling?: boolean;
        optimize?: "auto" | "worker" | "none";
        parentElement?: HTMLElement;
        onUpdate?: (now: DOMHighResTimeStamp, framesSinceLastRender: number) => void;
        onResize?: (width: number, height: number) => void;
        debug?: boolean;
    }
    export default class Canvas {
        DEBUG: boolean;
        benchmark: {
            minElapsed: number;
            maxElapsed: number;
            minFps: number;
            maxFps: number;
        };
        collision: Collision;
        protected _element: HTMLCanvasElement;
        protected _renderer: RenderAPI;
        protected _viewport: Viewport | undefined;
        protected _smoothing: boolean;
        protected _stretchToFit: boolean;
        protected _HDPIscaleRatio: number;
        protected _renderHandler: (now: DOMHighResTimeStamp) => void;
        protected _updateHandler?: (now: DOMHighResTimeStamp, framesSinceLastRender: number) => void;
        protected _resizeHandler?: (width: number, height: number) => void;
        protected _viewportHandler?: ({}: {
            type: "panned";
            value: Viewport;
        }) => void;
        protected _eventHandler: EventHandler;
        protected _preventDefaults: boolean;
        protected _lastRender: number;
        protected _renderId: number;
        protected _renderPending: boolean;
        protected _disposed: boolean;
        protected _scale: Point;
        protected _activeTouches: Sprite[];
        protected _children: Sprite[];
        protected _coords: DOMRect | undefined;
        protected _width: number;
        protected _height: number;
        protected _enqueuedSize: Size | undefined;
        protected _preferredWidth: number;
        protected _preferredHeight: number;
        protected _animate: boolean;
        protected _lastRaf: DOMHighResTimeStamp;
        protected _fps: number;
        protected _aFps: number;
        protected _renderInterval: number;
        protected _bgColor: string | undefined;
        constructor({ width, height, fps, scale, backgroundColor, animate, smoothing, stretchToFit, viewport, preventEventBubbling, parentElement, debug, optimize, viewportHandler, onUpdate, onResize, }?: CanvasProps);
        loadResource(id: string, source: ImageSource): Promise<Size>;
        getResource(id: string): Promise<ImageBitmap | undefined>;
        disposeResource(id: string): void;
        getRenderer(): IRenderer;
        insertInPage(container: HTMLElement): void;
        getElement(): HTMLCanvasElement;
        preventEventBubbling(value: boolean): void;
        addChild(child: Sprite): Canvas;
        removeChild(child: Sprite): Sprite;
        getChildAt(index: number): Sprite | undefined;
        removeChildAt(index: number): Sprite | undefined;
        numChildren(): number;
        getChildren(): Sprite[];
        contains(child: Sprite): boolean;
        invalidate(): void;
        getFrameRate(): number;
        setFrameRate(value: number): void;
        getActualFrameRate(): number;
        getRenderInterval(): number;
        getSmoothing(): boolean;
        setSmoothing(enabled: boolean): void;
        getWidth(): number;
        getHeight(): number;
        setDimensions(width: number, height: number, setAsPreferredDimensions?: boolean, immediate?: boolean): void;
        getViewport(): Viewport | undefined;
        setViewport(width: number, height: number): void;
        panViewport(x: number, y: number, broadcast?: boolean): void;
        setBackgroundColor(color: string): void;
        setAnimatable(value: boolean): void;
        isAnimatable(): boolean;
        scale(x: number, y?: number): void;
        stretchToFit(value: boolean): void;
        handleResize(): void;
        getCoordinate(): DOMRect;
        dispose(): void;
        protected handleInteraction(event: Event): void;
        protected render(now?: DOMHighResTimeStamp): void;
        protected addListeners(): void;
        protected removeListeners(): void;
        private updateCanvasSize;
    }
}
declare module "zcanvas" {
    import Canvas from "src/Canvas";
    import Loader from "src/Loader";
    import Sprite from "src/Sprite";
    export * from "src/definitions/types";
    export { Canvas, Loader, Sprite };
}
//# sourceMappingURL=zcanvas.d.ts.map