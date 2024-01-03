import { vi } from "vitest";
import type { IRenderer } from "../src/rendering/IRenderer";

/**
 * Execute calls debounced by requestAnimationFrame()
 * Use together with vi.useFakeTimers();
 * Run each RAF callback by invoking vi.runAllTimers();
 * Don't forget to use vi.useRealTimers() and vi.restoreAllMocks() to clean up.
 */
export function mockRequestAnimationFrame( now = window.performance.now(), fps = 60 ) {
    vi.spyOn( window, "cancelAnimationFrame" ).mockImplementation( rafId => {
        clearTimeout( rafId );
    });

    vi.spyOn( window, "requestAnimationFrame" ).mockImplementation( cb => {
        const interval = 1000 / fps;
        const id = setTimeout(() => {
            now += interval;
            cb( now );
        }, interval );
        return id as unknown as number;
    });
}

export function createMockImageBitmap( width = 400, height = 300 ): ImageBitmap {
    return {
        width,
        height,
        close: vi.fn(),
    } as unknown as ImageBitmap;
}

export function createMockRenderer(): IRenderer {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        transform: vi.fn(),
        setAlpha: vi.fn(),
        setBlendMode: vi.fn(),
        createPattern: vi.fn(),

        drawPath: vi.fn(),
        clearRect: vi.fn(),
        drawRect: vi.fn(),
        drawRoundRect: vi.fn(),
        drawCircle: vi.fn(),
        drawEllipse: vi.fn(),
        drawImage: vi.fn(),
        drawImageCropped: vi.fn(),
        drawImageData: vi.fn(),
        drawPattern: vi.fn(),
        drawText: vi.fn(),
    };
}