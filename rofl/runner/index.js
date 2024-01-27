TEXT_INCLUDE('interpreter.js');

let run = async bundle => {
    let executionContext = {
        ...bundle, 
        screen: GameUtil.buildScreen(),
    };
    await interpret(executionContext);
};
