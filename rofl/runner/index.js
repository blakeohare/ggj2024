let run = (() => {

    TEXT_INCLUDE('interpreter.js');
    TEXT_INCLUDE('valueUtil.js');

    return async bundle => {
        let executionContext = {
            ...bundle,
            globals: createGlobals(),
            screen: GameUtil.buildScreen(),
        };
        await interpret(executionContext);
    };

})();