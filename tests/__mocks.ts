import { vi } from "vitest";
import type { IRenderer } from "../src/rendering/IRenderer";

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
        setBlendMode: vi.fn(),

        clearRect: vi.fn(),
        drawRect: vi.fn(),
        drawCircle: vi.fn(),
        drawImage: vi.fn(),
        drawImageCropped: vi.fn(),
    };
}