export interface IRenderer {
    getBackingStoreRatio: () => number;
    setSmoothing: ( enabled: boolean ) => void;

    save: () => void
    restore: () => void
    scale: ( xScale: number, yScale?: number ) => void
    setBlendMode: ( type: GlobalCompositeOperation ) => void

    clearRect: ( x: number, y: number, width: number, height: number ) => void;
    drawRect: ( x: number, y: number, width: number, height: number, color: string, fillType?: "fill" | "stroke" ) => void
    drawImage: (
        bitmap: ImageBitmap,
        x: number,
        y: number,
        width?: number,
        height?: number
    ) => void
    drawImageCropped: (
        bitmap: ImageBitmap,
        sourceX: number,
        sourceY: number,
        sourceWidth: number,
        sourceHeight: number,
        destinationX: number,
        destinationY: number,
        destinationWidth: number,
        destinationHeight: number
    ) => void
}
