TEXT_INCLUDE('gameutil.js');

const ROFL = (() => {
    TEXT_INCLUDE('tokens/index.js');
    TEXT_INCLUDE('parser/index.js');
    TEXT_INCLUDE('serializer/index.js');
    TEXT_INCLUDE('runner/index.js');

    let throwError = (tokenOrNode, msg) => {
        let token = (tokenOrNode && tokenOrNode.firstToken) ? tokenOrNode.firstToken: tokenOrNode;
        if (token) {
            msg = "[" + token.file + "] Line " + token.line + " Column " + token.col + ": " + msg;
        }
        throw new Error(msg);
    };

    return async (files) => {
        let codeFiles = Object.keys(files).filter(f => f.endsWith('.rofl'));
        let imageFiles = Object.keys(files).filter(f => f.endsWith('.png'));

        let entities = [];
        for (let codeFile of codeFiles) {
            let tokens = getTokenStream(codeFile, files[codeFile]);
            entities.push(...parseEntities(tokens));
        }

        let bundle = serializeEntities(entities);

        let imageList = await Promise.all(imageFiles.map(imageKey => {
            return new Promise(res => {
                let imgEl = document.createElement('image');
                imgEl.addEventListener('load', () => {
                    let canvas = document.createElement('canvas');
                    let width = imgEl.width;
                    let height = imgEl.height;
                    canvas.width = width;
                    canvas.height = height;
                    let ctx = canvas.getContext('2d');
                    ctx.drawImage(imgEl, 0, 0);
                    res({ canvas, ctx, width, height, originalPath: imageKey });
                });
            });
        }));
        let images = {};
        imageList.forEach(img => { images[img.originalPath] = img; });

        await run(bundle);
    };
})();
