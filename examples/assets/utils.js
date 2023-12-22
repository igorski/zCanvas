const IDEAL_FPS = 60; // see #fps range slider

/**
 * Adds some functionality that allows us to keep the Canvas' container and
 * Canvas contents in sync across resolution / available window space changes
 * 
 * @param {HTMLElement} container of the demo content
 * @param {Canvas} zCanvas instance
 */
function addCanvasDemoControls( container, zCanvas ) {
    
    // add frame rate control

    const fpsControl = container.querySelector( "#fps" );
    if ( fpsControl ) {
        fpsControl.oninput = event => {
            zCanvas.setFrameRate( parseFloat( event.target.value ));
        };
    }

    // fullscreen toggle

    const fullscreenControl = container.querySelector( "#fullscreen" );
    if ( fullscreenControl ) {
        fullscreenControl.onclick = () => {
            zCanvas.setFullScreen( true, true );
        };
    }
}

/**
 * Creates a simple joypad to control actors with in the demo content
 * 
 * @param {HTMLElement} container 
 * @param {( e: ) => void} leftHandler action to execute when left button is held down
 * @param {( e: ) => void}} rightHandler action to execute when right button is held down
 * @param {( e: ) => void}} actionHandler action to execute when action button is tapped
 * @param {( e: ) => void}} releaseHandler action to execute when left and right buttons are released
 */
function createJoypad( container, leftHandler, rightHandler, actionHandler, releaseHandler ) {
    const leftBtn = document.createElement( "button" );
    leftBtn.id  = "left-btn";

    const rightBtn = document.createElement( "button" );
    rightBtn.id  = "right-btn";

    const actionButton = document.createElement( "button" );
    actionButton.id  = "action-btn";

    container.appendChild( leftBtn );
    container.appendChild( rightBtn );
    container.appendChild( actionButton );

    window.addEventListener( "contextmenu", e => {
        e.preventDefault(); // block opening context menu on right click
    });

    // mouse events

    function listenToMouseUp() {
        // we need to listen to mouseup events fired on the window otherwise we
        // might get stuck when the mouse button is release after the cursor has moved outside of the button
        const handler = () => {
            window.removeEventListener( "mouseup", handler );
            releaseHandler();
        };
        window.addEventListener( "mouseup", handler ); 
    }

    leftBtn.addEventListener( "mousedown", () => {
        listenToMouseUp();
        leftHandler();
    });
    rightBtn.addEventListener( "mousedown", () => {
        listenToMouseUp()
        rightHandler();
    });
    actionButton.addEventListener( "mousedown", () => {
        listenToMouseUp();
        actionHandler();
    });

    // touch events

    leftBtn.addEventListener( "touchstart", leftHandler );
    rightBtn.addEventListener( "touchstart", rightHandler );
    actionButton.addEventListener( "touchstart", actionHandler );
    leftBtn.addEventListener( "touchcancel", releaseHandler );
    rightBtn.addEventListener( "touchcancel", releaseHandler );
    leftBtn.addEventListener ( "touchend", releaseHandler );
    rightBtn.addEventListener( "touchend", releaseHandler );
}
