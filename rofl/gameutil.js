const GameUtil = (() => {
    
    let clearElement = e => {
        while (e.firstChild) e.removeChild(e.firstChild);
    };
    
    let buildScreen = () => {
        let screen = createImage(640, 480);
        clearElement(document.body);
        document.body.append(screen.canvas);
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

    return Object.freeze({
        buildScreen,
        createImage,     
    });
})();
