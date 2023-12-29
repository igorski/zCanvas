import { describe, expect, it, vi } from "vitest";
import { useWorker } from "../../src/utils/Optimization";

describe( "Optimization", () => {
    const SAFARI_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";
    const SAFARI_USER_AGENT_IOS = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1";

    it( "should not use the Worker when the 'none' value is provided", () => {
        expect( useWorker( "none" )).toBe( false );
    });

    it( "should use the Worker when the 'auto' value is provided", () => {
        expect( useWorker( "auto" )).toBe( true );
    });

    it( "should not use the Worker when the 'auto' value is provided and the browser is Safari", () => {
        vi.spyOn( navigator, "userAgent", "get" ).mockImplementationOnce(() => SAFARI_USER_AGENT );
        expect( useWorker( "auto" )).toBe( false );
    });

    it( "should not use the Worker when the 'auto' value is provided and the browser is mobile Safari", () => {
       vi.spyOn( navigator, "userAgent", "get" ).mockImplementationOnce(() => SAFARI_USER_AGENT_IOS );
        expect( useWorker( "auto" )).toBe( false );
    });

    it( "should use the Worker when the 'worker' value is explicitly provided", () => {
        vi.spyOn( navigator, "userAgent", "get" ).mockImplementationOnce(() => SAFARI_USER_AGENT );
        expect( useWorker( "worker" )).toBe( true );
    });
});