let parseEntity = (tokens) => {
    return parseFunction(tokens); // functions are the only top level entity right now.
};

let parseFunction = tokens => {
    let firstToken;
    if (tokens.isNext('kkwt')) {
        firstToken = tokens.pop();
    } else {
        firstToken = tokens.popChain('knock', 'knock', 'who', "'", 's', 'there');
    }

    let nameToken = tokens.popName();
    tokens.popExpected('(');
    let args = [];
    while (!tokens.popIfPresent(')')) {
        if (args.length > 0) tokens.popExpected(',');
        args.push(tokens.popName());
    }

    let code = parseBlock(tokens);
    return {
        type: 'FUNCTION_DEFINITION',
        firstToken,
        nameToken,
        name: nameToken.value,
        args,
        code,
    };
};

let isBdtNext = tokens => {
    return tokens.isNext('bdt') || tokens.isNext('ba');
};

let isTssNext = tokens => {
    let tss = tokens.peek();
    if (!tss) return false;
    let value = tss.value;
    if (!value.startsWith('t')) return false;
    for (let i = 1; i < value.length; i++) {
        if (value[i] !== 's') return false;
    }
    return value.length >= 2;
};

let popTss = tokens => {
    if (!isTssNext(tokens)) tokens.popExpected('tss'); // throws
    return tokens.pop();
};

const BDT = ['ba', 'dum'];
let popBdt = tokens => {
    if (tokens.isNext('ba')) {
        let token = popChain('ba', 'dum');
        popTss(tokens);
    }
    return tokens.popExpected('bdt');
};

let parseBlock = tokens => {
    let lines = [];
    while (!isBdtNext(tokens) && !isIsrNext(tokens)) {
        lines.push(parseStatement(tokens));
    }
    if (isBdtNext(tokens)) popBdt(tokens);
    return lines;
};
