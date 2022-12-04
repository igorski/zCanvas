declare module "src/utils/event-handler" {
    export default EventHandler;
    function EventHandler(): void;
    class EventHandler {
        private _eventMappings;
        protected _disposed: boolean;
        add(aElement: HTMLElement, aType: string, aCallback: Function): boolean;
        has(aElement: HTMLElement, aType: string): boolean;
        remove(aElement: HTMLElement, aType: string): boolean;
        dispose(): void;
    }
}
declare module "src/utils/inheritance" {
    export default Inheritance;
    namespace Inheritance {
        function extend(aSubClass: Function, aSuperClass: Function): void;
    }
}
declare module "src/Canvas" {
    export default Canvas;
    function Canvas({ width, height, fps, scale, backgroundColor, animate, smoothing, stretchToFit, viewport, handler, preventEventBubbling, parentElement, debug, onUpdate }?: {
        width?: number;
        height?: number;
        fps?: number;
        scale?: number;
        backgroundColor?: string;
        animate?: boolean;
        smoothing?: boolean;
        stretchToFit?: boolean;
        viewport?: {
            width: number;
            height: number;
        };
        handler?: Function;
        preventEventBubbling?: boolean;
        parentElement?: null;
        onUpdate?: Function;
        debug?: boolean;
    }): void;
    class Canvas {
        constructor({ width, height, fps, scale, backgroundColor, animate, smoothing, stretchToFit, viewport, handler, preventEventBubbling, parentElement, debug, onUpdate }?: {
            width?: number;
            height?: number;
            fps?: number;
            scale?: number;
            backgroundColor?: string;
            animate?: boolean;
            smoothing?: boolean;
            stretchToFit?: boolean;
            viewport?: {
                width: number;
                height: number;
            };
            handler?: Function;
            preventEventBubbling?: boolean;
            parentElement?: null;
            onUpdate?: Function;
            debug?: boolean;
        });
        public DEBUG: boolean;
        protected _smoothing: boolean;
        protected _updateHandler: Function;
        protected _renderHandler: Function;
        protected _lastRender: number;
        protected _renderId: number;
        protected _renderPending: boolean;
        protected _disposed: boolean;
        protected _scale: object;
        protected _handler: Function;
        protected _activeTouches: Array<Sprite>;
        protected _children: Array<Sprite>;
        protected _coords: DOMRect;
        protected _element: HTMLCanvasElement;
        protected _canvasContext: CanvasRenderingContext2D;
        protected _HDPIscaleRatio: number;
        public insertInPage(aContainer: HTMLElement): void;
        public override getElement(): HTMLElement;
        public preventEventBubbling(value: boolean): void;
        protected _preventDefaults: boolean;
        public addChild(aChild: Sprite): Canvas;
        public removeChild(aChild: Sprite): Sprite;
        public getChildAt(index: number): Sprite;
        public removeChildAt(index: number): Sprite;
        public numChildren(): number;
        public getChildren(): Array<Sprite>;
        public contains(aChild: Sprite): boolean;
        public invalidate(): void;
        public getFrameRate(): number;
        public setFrameRate(value: number): void;
        protected _fps: number;
        protected _aFps: number;
        protected _renderInterval: number;
        public getActualFrameRate(): number;
        public getRenderInterval(): number;
        public setSmoothing(enabled: boolean): void;
        public getWidth(): number;
        public getHeight(): number;
        public setDimensions(width: number, height: number, setAsPreferredDimensions?: boolean | undefined, optImmediate?: boolean | undefined): void;
        protected _enqueuedSize: {
            width: number;
            height: number;
        };
        protected _preferredWidth: number;
        protected _preferredHeight: number;
        public setViewport(width: number, height: number): void;
        protected _viewport: {
            left: number;
            top: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        };
        public panViewport(x: number, y: number, broadcast?: boolean | undefined): void;
        public setBackgroundColor(color: string): void;
        protected _bgColor: string;
        public setAnimatable(value: boolean): void;
        protected _animate: boolean;
        protected _lastRaf: DOMHighResTimeStamp;
        public isAnimatable(): boolean;
        public drawImage(aSource: (new (width?: number, height?: number) => HTMLImageElement) | HTMLCanvasElement, destX: number, destY: number, destWidth: number, destHeight: number, aOptSourceX?: number | undefined, aOptSourceY?: number | undefined, aOptSourceWidth?: number | undefined, aOptSourceHeight?: number | undefined): void;
        public scale(x: number, y?: number | undefined): void;
        public stretchToFit(value?: boolean | undefined): void;
        protected _stretchToFit: boolean;
        public dispose(): void;
        protected handleInteraction(event: Event): void;
        protected render(now?: DOMHighResTimeStamp): void;
        protected addListeners(): void;
        protected _eventHandler: EventHandler;
        protected removeListeners(): void;
        protected getCoordinate(): DOMRect;
    }
    namespace Canvas {
        function extend(extendingFunction: Function): Canvas;
    }
    import EventHandler from "src/utils/event-handler";
}
declare module "src/Loader" {
    export default Loader;
    namespace Loader {
        function loadImage(aSource: string, aOptImage?: HTMLImageElement): Promise<{
            size: {
                width: number;
                height: number;
            };
            image: HTMLImageElement;
        }>;
        function isReady(aImage: HTMLImageElement): boolean;
        function onReady(aImage: HTMLImageElement): Promise<void>;
    }
}
declare module "src/utils/image-math" {
    export function isInsideViewport(spriteBounds: {
        left: number;
        top: number;
        width: number;
        height: number;
    }, viewport: {
        left: number;
        top: number;
        width: number;
        height: number;
    }): boolean;
    export function calculateDrawRectangle(spriteBounds: {
        left: number;
        top: number;
        width: number;
        height: number;
    }, viewport: {
        left: number;
        top: number;
        width: number;
        height: number;
    }): {
        source: {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        dest: {
            left: number;
            top: number;
            width: number;
            height: number;
        };
    };
}
declare module "src/Sprite" {
    export default Sprite;
    function Sprite({ width, height, x, y, bitmap, collidable, interactive, mask, sheet, sheetTileWidth, sheetTileHeight }?: {
        width: number;
        height: number;
        x?: number;
        y?: number;
        bitmap?: (new (width?: number, height?: number) => HTMLImageElement) | HTMLCanvasElement | string;
        collidable?: boolean;
        interactive?: boolean;
        mask?: boolean;
        sheet?: Array<{
            row: number;
            col: number;
            amount: number;
            fpt: 5;
        }>;
        sheetTileWidth?: number;
        sheetTileHeight?: number;
    }): void;
    class Sprite {
        constructor({ width, height, x, y, bitmap, collidable, interactive, mask, sheet, sheetTileWidth, sheetTileHeight }?: {
            width: number;
            height: number;
            x?: number;
            y?: number;
            bitmap?: (new (width?: number, height?: number) => HTMLImageElement) | HTMLCanvasElement | string;
            collidable?: boolean;
            interactive?: boolean;
            mask?: boolean;
            sheet?: Array<{
                row: number;
                col: number;
                amount: number;
                fpt: 5;
            }>;
            sheetTileWidth?: number;
            sheetTileHeight?: number;
        });
        protected _children: Array<Sprite>;
        protected _disposed: boolean;
        public collidable: boolean;
        public hover: boolean;
        protected _mask: boolean;
        protected _bounds: {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        protected _parent: Sprite | canvas;
        public last: Sprite;
        public next: Sprite;
        public canvas: Canvas;
        protected _bitmap: HTMLImageElement | HTMLCanvasElement;
        protected _bitmapReady: boolean;
        protected _draggable: boolean;
        protected _keepInBounds: boolean;
        public isDragging: boolean;
        public getDraggable(): boolean;
        public setDraggable(aValue: boolean, aKeepInBounds?: boolean | undefined): void;
        public getX(): number;
        public setX(aValue: number): void;
        public getY(): number;
        public setY(aValue: number): void;
        public getWidth(): number;
        public setWidth(aValue: number): void;
        public getHeight(): number;
        public setHeight(aValue: number): void;
        public setBounds(left: number, top: number, width?: number | undefined, height?: number | undefined): void;
        public getBounds(): {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        public getInteractive(): boolean;
        public setInteractive(aValue: boolean): void;
        protected _interactive: boolean;
        public update(now: DOMHighResTimeStamp, framesSinceLastUpdate: number): void;
        public draw(canvasContext: CanvasRenderingContext2D, viewport?: {
            left: number;
            top: number;
            width: number;
            height: number;
            right: number;
            bottom: number;
        }): void;
        public insideBounds(x: number, y: number): boolean;
        public collidesWith(aSprite: Sprite): boolean;
        public getIntersection(aSprite: Sprite): {
            left: number;
            top: number;
            width: number;
            height: number;
        } | null;
        public collidesWithEdge(aSprite: Sprite, aEdge: number): boolean;
        public getBitmap(): (new (width?: number, height?: number) => HTMLImageElement) | HTMLCanvasElement | string;
        public setBitmap(aImage?: (HTMLImageElement | HTMLCanvasElement | string | null) | undefined, aOptWidth?: number | undefined, aOptHeight?: number | undefined): Promise<void>;
        protected _bitmapWidth: number;
        protected _bitmapHeight: number;
        public setSheet(sheet: {
            row: number;
            col: number;
            amount: number;
            fpt: 5;
            onComplete: Function;
        }[], width?: number | undefined, height?: number | undefined): void;
        protected _sheet: {
            row: number;
            col: number;
            amount: number;
            fpt: 5;
            onComplete: Function;
        }[];
        _animation: {
            type: string | null;
            col: number;
            maxCol: number;
            fpt: number;
            counter: number;
        };
        public switchAnimation(sheetIndex: number): void;
        public setParent(aParent: Sprite | Canvas): void;
        public getParent(): Sprite | Canvas;
        public setCanvas(canvas: Canvas): void;
        public setConstraint(left: number, top: number, width: number, height: number): {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        protected _constraint: {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        public getConstraint(): {
            left: number;
            top: number;
            width: number;
            height: number;
        };
        public addChild(aChild: Sprite): Sprite;
        public removeChild(aChild: Sprite): Sprite;
        public getChildAt(index: number): Sprite;
        public removeChildAt(index: number): Sprite;
        public numChildren(): number;
        public getChildren(): Array<Sprite>;
        public contains(aChild: Sprite): boolean;
        public dispose(): void;
        protected handlePress(x: number, y: number, event: Event): void;
        protected handleRelease(x: number, y: number, event: Event): void;
        protected handleClick(): void;
        protected handleMove(x: number, y: number, event: Event): void;
        public handleInteraction(x: number, y: number, event: Event): boolean;
        _pressed: boolean;
        protected _pressTime: number;
        protected _dragStartOffset: {
            x: number;
            y: number;
        };
        protected _dragStartEventCoordinates: {
            x: number;
            y: number;
        };
        protected updateAnimation(framesSinceLastRender?: number | undefined): void;
        protected invalidate(): void;
        protected drawOutline(canvasContext: CanvasRenderingContext2D): void;
    }
    namespace Sprite {
        function extend(extendingFunction: Function): Sprite;
    }
}
declare module "src/Collision" {
    export function pixelCollision(sprite1: Sprite, sprite2: Sprite, optReturnAsCoordinate?: boolean | undefined): boolean | {
        x: number;
        y: number;
    };
    export function getPixelArray(sprite: Sprite, rect: {
        left: number;
        top: number;
        width: number;
        height: number;
    }, pixels: Array<number>): number;
    export function getChildrenUnderPoint(aSpriteList: Array<Sprite>, aX: number, aY: number, aWidth: number, aHeight: number, aOnlyCollidables?: boolean | undefined): Array<Sprite>;
    export function cache(bitmap: HTMLCanvasElement | HTMLImageElement): Promise<boolean>;
    export function clearCache(bitmap: HTMLCanvasElement | HTMLImageElement): boolean;
    export function hasCache(bitmap: HTMLCanvasElement | HTMLImageElement): boolean;
}
declare module "zcanvas" {
    import canvas from "src/Canvas";
    import sprite from "src/Sprite";
    import loader from "src/Loader";
    export namespace collision {
        export { pixelCollision };
        export { getChildrenUnderPoint };
        export { cache };
        export { hasCache };
        export { clearCache };
    }
    import { pixelCollision } from "src/Collision";
    import { getChildrenUnderPoint } from "src/Collision";
    import { cache } from "src/Collision";
    import { hasCache } from "src/Collision";
    import { clearCache } from "src/Collision";
    export { canvas, sprite, loader };
}
//# sourceMappingURL=zcanvas.d.ts.map