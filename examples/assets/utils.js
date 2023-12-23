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
 * @param {() => void} leftDownHandler action to execute when left button is held down
 * @param {() => void} leftUpHandler action to execute when left button is released
 * @param {() => void} rightDownHandler action to execute when right button is held down
 * @param {() => void} rightUpHandler action to execute when right button is released
 * @param {() => void} actionDownHandler action to execute when action button is held down
 * @param {() => void} actionUpHandler action to execute when action button is released
 */
function createJoypad( container,
    leftDownHandler, leftUpHandler, rightDownHandler, rightUpHandler, actionDownHandler, actionUpHandler )
{
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

    function listenToMouseUp( callback ) {
        // we need to listen to mouseup events fired on the window otherwise we
        // might get stuck when the mouse button is release after the cursor has moved outside of the button
        const handler = () => {
            window.removeEventListener( "mouseup", handler );
            callback();
        };
        window.addEventListener( "mouseup", handler ); 
    }

    leftBtn.addEventListener( "mousedown", () => {
        listenToMouseUp( leftUpHandler );
        leftDownHandler();
    });
    rightBtn.addEventListener( "mousedown", () => {
        listenToMouseUp( rightUpHandler )
        rightDownHandler();
    });
    actionButton.addEventListener( "mousedown", () => {
        listenToMouseUp( actionUpHandler );
        actionDownHandler();
    });

    // touch events

    leftBtn.addEventListener( "touchstart", leftDownHandler );
    rightBtn.addEventListener( "touchstart", rightDownHandler );
    actionButton.addEventListener( "touchstart", actionDownHandler );

    leftBtn.addEventListener( "touchcancel", leftUpHandler );
    leftBtn.addEventListener( "touchend", leftUpHandler );
  
    rightBtn.addEventListener( "touchcancel", rightUpHandler );
    rightBtn.addEventListener( "touchend", rightUpHandler );
  
    actionButton.addEventListener( "touchcancel", actionUpHandler );
    actionButton.addEventListener( "touchend", actionUpHandler );
}
