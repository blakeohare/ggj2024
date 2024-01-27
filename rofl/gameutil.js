const GameUtil = (() => {

    let clearElement = e => {
        while (e.firstChild) e.removeChild(e.firstChild);
    };

    let screen = null;
    let buildScreen = () => {
        screen = createImage(640, 480);
        clearElement(document.body);
        document.body.append(screen.canvas);
        let el = screen.canvas;
        let getCoord = ev => {
            let rect = el.getBoundingClientRect();
            let x = Math.floor(640 * (ev.clientX - rect.left) / rect.width);
            let y = Math.floor(480 * (ev.clientY - rect.top) / rect.height);
            return { x, y };
        };
        el.addEventListener('pointerdown', ev => {
            eventQueue.push({ type: 'MOUSE_DOWN', ...getCoord(ev) });
        });
        el.addEventListener('pointerup', ev => {
            eventQueue.push({ type: 'MOUSE_UP', ...getCoord(ev) });
        });
        el.addEventListener('pointermove', ev => {
            eventQueue.push({ type: 'MOUSE_MOVE', ...getCoord(ev) });
        });
    };

    let cloneImage = (image) => {
        let img = createImage(image.width, image.height);
        img.ctx.drawImage(image.canvas, 0, 0);
        return img;
    };

    let eventQueue = [];
    let getNextEvent = () => {
        if (eventQueue.length) {
            return eventQueue.shift();
        }
        return null;
    };

    let createImage = (width, height) => {
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return {
            canvas,
            ctx: canvas.getContext('2d'),
            width,
            height,
        };
    };

    let drawRect = (img, x, y, w, h, r, g, b) => {
        img.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        img.ctx.fillRect(x, y, w, h);
    };

    let drawImage = (dst, src, x, y) => {
        dst.ctx.drawImage(src.canvas, x, y);
    };

    let blitToScreen = (img) => {
        screen.ctx.drawImage(img.canvas, 0, 0);
    };

    return Object.freeze({
        blitToScreen,
        buildScreen,
        createImage,
        cloneImage,
        drawImage,
        drawRect,
        getNextEvent,
    });

})();
