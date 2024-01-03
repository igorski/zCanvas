declare module "src/DisplayObject" {
    import type Canvas from "src/Canvas";
    import type Sprite from "src/Sprite";
    export default class DisplayObject<T> {
        protected _children: Sprite[];
        protected _disposed: boolean;
        protected _parent: DisplayObject<Canvas | Sprite> | undefined;
        constructor();
        addChild(child: Sprite): DisplayObject<T>;
        removeChild(child: Sprite): Sprite;
        getChildAt(index: number): Sprite | undefined;
        removeChildAt(index: number): Sprite | undefined;
        numChildren(): number;
        getChildren(): Sprite[];
        contains(child: Sprite): boolean;
        invalidate(): void;
        dispose(): void;
    }
}
declare module "src/rendering/IRenderer" {
    import type { Point } from "src/definitions/types";
    export interface IRenderer {
        save(): void;
        restore(): void;
        translate(x: number, y: number): void;
        scale(xScale: number, yScale?: number): void;
        rotate(angleInRadians: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        setBlendMode(type: GlobalCompositeOperation): void;
        setAlpha(value: number): void;
        createPattern(resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat"): void;
        drawPath(points: Point[], color?: ColorOrTransparent, stroke?: StrokeProps): void;
        clearRect(x: number, y: number, width: number, height: number, props?: DrawProps): void;
        drawRect(x: number, y: number, width: number, height: number, color?: ColorOrTransparent, stroke?: StrokeProps, props?: DrawProps): void;
        drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color?: ColorOrTransparent, stroke?: StrokeProps, props?: DrawProps): void;
        drawCircle(x: number, y: number, radius: number, color?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawEllipse(x: number, y: number, xRadius: number, yRadius: number, color?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawImage(resourceId: string, x: number, y: number, width?: number, height?: number, props?: DrawProps): void;
        drawImageCropped(resourceId: string, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number, props?: DrawProps): void;
        drawText(text: TextProps, x: number, y: number, props?: DrawProps): void;
        drawPattern(patternResourceId: string, x: number, y: number, width: number, height: number): void;
        drawImageData(imageData: ImageData, x: number, y: number, sourceX?: number, sourceY?: number, destWidth?: number, destHeight?: number): void;
    }
    export type StrokeProps = {
        color: string;
        size: number;
        close?: boolean;
        dash?: number[];
        cap?: "butt" | "round" | "square";
    };
    export type TextProps = {
        text: string;
        color: string;
        font?: string;
        size?: number;
        unit?: string;
        lineHeight?: number;
        spacing?: number;
        center?: boolean;
    };
    export type ColorOrTransparent = string | undefined;
    export type DrawProps = {
        scale: number;
        rotation: number;
        alpha: number;
        blendMode?: GlobalCompositeOperation;
        pivot?: Point;
        safeMode?: boolean;
    };
}
declare module "src/utils/ImageMath" {
    import type { Rectangle, Size, BoundingBox, Viewport } from "src/definitions/types";
    export const DEG_TO_RAD: number;
    export function fastRound(num: number): number;
    export function isInsideArea(rect: Rectangle, area: BoundingBox): boolean;
    export function calculateDrawRectangle(spriteBounds: Rectangle, viewport: Viewport): {
        src: Rectangle;
        dest: Rectangle;
    };
    export function constrainAspectRatio(idealWidth: number, idealHeight: number, availableWidth: number, availableHeight: number): Size;
    export function transformRectangle(rectangle: Rectangle, angleInDegrees: number, scale: number, outRectangle: Rectangle): Rectangle;
}
declare module "src/Sprite" {
    import type Canvas from "src/Canvas";
    import DisplayObject from "src/DisplayObject";
    import type { Point, Rectangle, SpriteSheet, Viewport } from "src/definitions/types";
    import type { IRenderer, DrawProps } from "src/rendering/IRenderer";
    export interface SpriteProps {
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
    }
    type TransformProps = {
        scale: number;
        rotation: number;
        alpha: number;
    };
    export default class Sprite extends DisplayObject<Sprite> {
        collidable: boolean;
        hover: boolean;
        isDragging: boolean;
        canvas: Canvas | undefined;
        last: Sprite | undefined;
        next: Sprite | undefined;
        protected _bounds: Rectangle;
        protected _tfb: Rectangle | undefined;
        protected _mask: boolean;
        protected _interactive: boolean;
        protected _draggable: boolean;
        protected _keepInBounds: boolean;
        protected _cstrt: Rectangle | undefined;
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
        protected _resourceId: string;
        private _dp;
        private _tf;
        protected _pTime: number;
        protected _pressed: boolean;
        protected _dro: Point;
        protected _drc: Point;
        constructor({ resourceId, x, y, width, height, rotation, collidable, interactive, mask, sheet, }: SpriteProps);
        getDraggable(): boolean;
        setDraggable(draggable: boolean, keepInBounds?: boolean): void;
        getInteractive(): boolean;
        setInteractive(value: boolean): void;
        getX(): number;
        setX(value: number): void;
        getY(): number;
        setY(value: number): void;
        getWidth(): number;
        setWidth(value: number): void;
        getHeight(): number;
        setHeight(value: number): void;
        setBounds(left: number, top: number, width?: number, height?: number): void;
        getBounds(getTransformed?: boolean): Rectangle;
        getRotation(): number;
        setRotation(angleInDegrees: number, pivot?: Point): void;
        getScale(): number;
        setScale(scaleFactor: number): void;
        getTransforms(): TransformProps;
        isVisible(viewport?: Viewport): boolean;
        insideBounds(x: number, y: number): boolean;
        collidesWith(sprite: Sprite): boolean;
        getIntersection(sprite: Sprite): Rectangle | undefined;
        collidesWithEdge(sprite: Sprite, edge: 0 | 1 | 2 | 3): boolean;
        setResource(resourceId: string | null, width?: number, height?: number): void;
        getResourceId(): string | undefined;
        setSheet(sheet: SpriteSheet[], width?: number, height?: number): void;
        switchAnimation(sheetIndex: number): void;
        setParent(parent: DisplayObject<Canvas | Sprite> | undefined): void;
        getParent(): DisplayObject<Canvas | Sprite> | undefined;
        setCanvas(canvas: Canvas): void;
        setConstraint(left: number, top: number, width: number, height: number): Rectangle;
        getConstraint(): Rectangle;
        addChild(child: Sprite): DisplayObject<Sprite>;
        update(now: DOMHighResTimeStamp, framesSinceLastUpdate: number): void;
        draw(renderer: IRenderer, viewport?: Viewport): void;
        dispose(): void;
        protected getDrawProps(): DrawProps | undefined;
        protected handlePress(x: number, y: number, event: Event): void;
        protected handleRelease(x: number, y: number, event: Event): void;
        protected handleClick(): void;
        protected handleMove(x: number, y: number, event: Event): void;
        handleInteraction(x: number, y: number, event: MouseEvent | TouchEvent): boolean;
        invalidate(): void;
        protected invalidateDrawProps({ alpha, scale, rotation, pivot }: {
            alpha?: number;
            scale?: number;
            rotation?: number;
            pivot?: Point;
        }): void;
        protected updateAnimation(framesSinceLastRender?: number): void;
        private gdp;
    }
}
declare module "src/definitions/types" {
    export type { CanvasProps } from "src/Canvas";
    export type { SpriteProps } from "src/Sprite";
    import type Sprite from "src/Sprite";
    export type { IRenderer, ColorOrTransparent, DrawProps, StrokeProps, TextProps } from "src/rendering/IRenderer";
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
    export type BoundingBox = {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    export type Viewport = BoundingBox & Size;
    export type ImageSource = HTMLImageElement | HTMLCanvasElement | File | Blob | ImageData | ImageBitmap | string;
    export type SpriteSheet = {
        row: number;
        col: number;
        amount: number;
        fpt: number;
        onComplete?: (sprite: Sprite) => void;
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
    export function createCanvas(width?: number, height?: number, optimizedReads?: boolean): {
        cvs: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
    };
    export function getTempCanvas(): HTMLCanvasElement;
    export function clearTempCanvas(): void;
    export function resizeImage(image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width: number, height: number): Promise<ImageBitmap>;
    export function cloneCanvas(canvasToClone: HTMLCanvasElement): HTMLCanvasElement;
    export function imageToCanvas(cvs: HTMLCanvasElement, image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width?: number, height?: number): void;
    export function imageToBitmap(image: HTMLImageElement | HTMLCanvasElement | Blob): Promise<ImageBitmap>;
    export function blobToImage(blob: Blob): Promise<HTMLImageElement>;
}
declare module "src/utils/FileUtil" {
    export function readFile(file: File): Promise<Blob>;
}
declare module "src/utils/Loader" {
    import type { Size } from "src/definitions/types";
    type SizedImage = {
        size: Size;
        image: HTMLImageElement;
    };
    const Loader: {
        loadImage(source: string | Blob | File): Promise<SizedImage>;
        loadBitmap(source: string | Blob | File): Promise<ImageBitmap>;
        isReady(image: HTMLImageElement): boolean;
        onReady(image: HTMLImageElement): Promise<void>;
    };
    export default Loader;
}
declare module "src/rendering/components/TextRenderer" {
    import type { TextProps } from "src/rendering/IRenderer";
    type MeasuredLineDef = {
        line: string;
        top: number;
    };
    export function renderMultiLineText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, lines: MeasuredLineDef[], props: TextProps, x: number, y: number): void;
    export function measureLines(props: TextProps, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): {
        lines: MeasuredLineDef[];
        width: number;
        height: number;
    };
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
    import type { IRenderer, DrawProps, StrokeProps, TextProps } from "src/rendering/IRenderer";
    import type { Point } from "src/definitions/types";
    import Cache from "src/utils/Cache";
    export enum ResetCommand {
        NONE = 0,
        ALL = 1,
        TRANSFORM = 2
    }
    export default class RendererImpl implements IRenderer {
        private _debug;
        _cvs: HTMLCanvasElement | OffscreenCanvas;
        _ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        _bmp: Cache<ImageBitmap>;
        _ptn: Cache<CanvasPattern>;
        constructor(canvas: HTMLCanvasElement | OffscreenCanvas, _debug?: boolean);
        dispose(): void;
        cacheResource(id: string, bitmap: ImageBitmap): void;
        getResource(id: string): ImageBitmap | undefined;
        disposeResource(id: string): void;
        setDimensions(width: number, height: number): void;
        setSmoothing(enabled: boolean): void;
        setPixelRatio(ratio: number): void;
        save(): void;
        restore(): void;
        translate(x: number, y: number): void;
        scale(xScale: number, yScale?: number): void;
        rotate(angleInRadians: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        setBlendMode(mode: GlobalCompositeOperation): void;
        setAlpha(value: number): void;
        createPattern(resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat"): void;
        drawPath(points: Point[], color?: string, stroke?: StrokeProps): void;
        clearRect(x: number, y: number, width: number, height: number, props?: DrawProps): void;
        drawRect(x: number, y: number, width: number, height: number, color?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawCircle(x: number, y: number, radius: number, fillColor?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawEllipse(x: number, y: number, xRadius: number, yRadius: number, fillColor?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawImage(resourceId: string, x: number, y: number, width?: number, height?: number, props?: DrawProps): void;
        drawImageCropped(resourceId: string, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number, props?: DrawProps): void;
        drawText(text: TextProps, x: number, y: number, props?: DrawProps): void;
        drawPattern(patternResourceId: string, x: number, y: number, width: number, height: number): void;
        drawImageData(imageData: ImageData, x: number, y: number, sourceX?: number, sourceY?: number, destWidth?: number, destHeight?: number): void;
        protected prepare(props: DrawProps, x: number, y: number, width: number, height: number): ResetCommand;
        protected applyReset(cmd: ResetCommand): void;
    }
}
declare module "src/rendering/RenderAPI" {
    import type { ImageSource, Point, Size } from "src/definitions/types";
    import type { IRenderer, ColorOrTransparent, DrawProps, StrokeProps, TextProps } from "src/rendering/IRenderer";
    export default class RenderAPI implements IRenderer {
        private _el;
        private _rdr;
        private _wkr;
        private _useW;
        private _pl;
        private _cmds;
        private _cbs;
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
        setPixelRatio(ratio: number): void;
        save(): void;
        restore(): void;
        translate(x: number, y: number): void;
        rotate(angleInRadians: number): void;
        transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
        scale(xScale: number, yScale?: number): void;
        setBlendMode(type: GlobalCompositeOperation): void;
        setAlpha(value: number): void;
        drawPath(points: Point[], color?: ColorOrTransparent, stroke?: StrokeProps): void;
        clearRect(x: number, y: number, width: number, height: number, props?: DrawProps): void;
        drawRect(x: number, y: number, width: number, height: number, color?: ColorOrTransparent, stroke?: StrokeProps, props?: DrawProps): void;
        drawRoundRect(x: number, y: number, width: number, height: number, radius: number, color?: ColorOrTransparent, stroke?: StrokeProps, props?: DrawProps): void;
        drawCircle(x: number, y: number, radius: number, fillColor?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawEllipse(x: number, y: number, xRadius: number, yRadius: number, color?: string, stroke?: StrokeProps, props?: DrawProps): void;
        drawImage(resourceId: string, x: number, y: number, width: number, height: number, props?: DrawProps): void;
        drawImageCropped(resourceId: string, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number, props?: DrawProps): void;
        drawText(text: TextProps, x: number, y: number, props?: DrawProps): void;
        drawPattern(patternResourceId: string, x: number, y: number, width: number, height: number): void;
        drawImageData(imageData: ImageData, x: number, y: number, sourceX?: number, sourceY?: number, destWidth?: number, destHeight?: number): void;
        protected onDraw(cmd: keyof IRenderer, ...args: any[]): void;
        protected getBackend(cmd: string, ...args: any[]): void;
    }
}
declare module "src/utils/Fullscreen" {
    import type { Point } from "src/definitions/types";
    export function toggleFullScreen(element: HTMLElement): void;
    export function transformPointer(event: MouseEvent, element: HTMLCanvasElement, rect: DOMRect, canvasWidth: number, canvasHeight: number): Point;
}
declare module "src/utils/Optimization" {
    export function useWorker(optimize: "auto" | "worker" | "none"): boolean;
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
        getChildrenInArea(sprites: Sprite[], x: number, y: number, width: number, height: number, collidablesOnly?: boolean): Sprite[];
        pixelCollision(sprite1: Sprite, sprite2: Sprite): Point | undefined;
        cache(resourceId: string): Promise<boolean>;
        clearCache(resourceId: string): boolean;
        hasCache(resourceId: string): boolean;
        protected getPixelArray(sprite: Sprite, rect: Rectangle, pixels: number[]): void;
    }
}
declare module "src/Canvas" {
    import type { Size, Point, BoundingBox, Viewport, ImageSource } from "src/definitions/types";
    import { IRenderer } from "src/rendering/IRenderer";
    import RenderAPI from "src/rendering/RenderAPI";
    import EventHandler from "src/utils/EventHandler";
    import Collision from "src/Collision";
    import DisplayObject from "src/DisplayObject";
    import type Sprite from "src/Sprite";
    export interface CanvasProps {
        width?: number;
        height?: number;
        fps?: number;
        backgroundColor?: string;
        animate?: boolean;
        smoothing?: boolean;
        stretchToFit?: boolean;
        autoSize?: boolean;
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
    export default class Canvas extends DisplayObject<Canvas> {
        DEBUG: boolean;
        collision: Collision;
        bbox: BoundingBox;
        protected _el: HTMLCanvasElement;
        protected _rdr: RenderAPI;
        protected _vp: Viewport | undefined;
        protected _smooth: boolean;
        protected _stretch: boolean;
        protected _pxr: number;
        protected _renHdlr: (now: DOMHighResTimeStamp) => void;
        protected _upHdlr?: (now: DOMHighResTimeStamp, framesSinceLastRender: number) => void;
        protected _resHdrl?: (width: number, height: number) => void;
        protected _vpHdlr?: ({}: {
            type: "panned";
            value: Viewport;
        }) => void;
        protected _hdlr: EventHandler;
        protected _prevDef: boolean;
        protected _lastRender: number;
        protected _renderId: number;
        protected _renderPending: boolean;
        protected _disposed: boolean;
        protected _scale: Point;
        protected _aTchs: Sprite[];
        protected _coords: DOMRect | undefined;
        protected _width: number;
        protected _height: number;
        protected _prefWidth: number;
        protected _prefHeight: number;
        protected _qSize: Size | undefined;
        protected _animate: boolean;
        protected _lastRaf: DOMHighResTimeStamp;
        protected _fps: number;
        protected _aFps: number;
        protected _rIval: number;
        protected _bgColor: string | undefined;
        protected _isFs: boolean;
        protected _hasFsH: boolean;
        constructor({ width, height, fps, backgroundColor, animate, smoothing, stretchToFit, autoSize, viewport, preventEventBubbling, parentElement, debug, optimize, viewportHandler, onUpdate, onResize, }?: CanvasProps);
        loadResource(id: string, source: ImageSource): Promise<Size>;
        getResource(id: string): Promise<ImageBitmap | undefined>;
        disposeResource(id: string): void;
        getContent(resourceId?: string): Promise<HTMLCanvasElement>;
        getRenderer(): IRenderer;
        insertInPage(container: HTMLElement): void;
        getElement(): HTMLCanvasElement;
        preventEventBubbling(value: boolean): void;
        addChild(child: Sprite): DisplayObject<Canvas>;
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
        setFullScreen(value: boolean, stretchToFit?: boolean): void;
        getCoordinate(): DOMRect;
        dispose(): void;
        protected handleInteraction(event: MouseEvent | TouchEvent | WheelEvent): void;
        protected render(now?: DOMHighResTimeStamp): void;
        protected addListeners(addResizeListener?: boolean): void;
        protected removeListeners(): void;
        protected handleResize(): void;
        protected updateCanvasSize(): void;
    }
}
declare module "zcanvas" {
    import Canvas from "src/Canvas";
    import Sprite from "src/Sprite";
    import Loader from "src/utils/Loader";
    export * from "src/definitions/types";
    export { Canvas, Sprite, Loader };
}
//# sourceMappingURL=zcanvas.d.ts.map