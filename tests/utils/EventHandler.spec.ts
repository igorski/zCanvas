import { describe, it, expect, beforeEach, vi } from "vitest";
import EventHandler from "../../src/utils/EventHandler";

describe( "EventHandler", () => {
    let eventHandler: EventHandler;
    let element: HTMLElement;

    beforeEach(() => {
        eventHandler = new EventHandler();
        element = document.createElement( "button" );
    });

    it( "should be able to attach a listener to an HTML Element", () => {
        const attachSpy = vi.spyOn( element, "addEventListener" );

        const type = "click";
        const listener = vi.fn();
        
        eventHandler.add( element, type, listener );

        expect( attachSpy ).toHaveBeenCalledWith( type, listener, false );
    });

    it( "should know whether it has a listener for a specific type for a specific HTML Element", () => {
        eventHandler.add( element, "click", vi.fn() );

        expect( eventHandler.has( element, "mouseover" )).toBe( false );

        eventHandler.add( element, "mouseover", vi.fn() );

        expect( eventHandler.has( element, "mouseover" )).toBe( true );
        expect( eventHandler.has( element, "click" )).toBe( true );
    });

    it( "should be able to remove an added listener from an HTML Element", () => {
        const detachSpy = vi.spyOn( element, "removeEventListener" );

        const listener = vi.fn();

        eventHandler.add( element, "click", listener );
        eventHandler.remove( element, "click" );

        expect( detachSpy ).toHaveBeenCalledWith( "click", listener, false );
    });

    it( "should know whether it has removed a listener for a specific type for a specific HTML Element", () => {
        eventHandler.add( element, "click", vi.fn() );
        eventHandler.add( element, "mouseover", vi.fn() );

        eventHandler.remove( element, "click" );

        expect( eventHandler.has( element, "mouseover" )).toBe( true );
        expect( eventHandler.has( element, "click" )).toBe( false );
    });

    it( "should detach all attached listeners on dispose", () => {
        eventHandler.add( element, "click", vi.fn() );
        eventHandler.add( element, "mouseover", vi.fn() );

        const removeSpy = vi.spyOn( eventHandler, "remove" );

        eventHandler.dispose();

        expect( removeSpy ).toHaveBeenCalledWith( element, "click" );
        expect( removeSpy ).toHaveBeenCalledWith( element, "mouseover" );
    });
});