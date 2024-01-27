let parseStatement = (tokens) => {
    switch (tokens.peekValueNonNull()) {
        case 'gag':
        case 'running':
            return parseWhile(tokens);
        case 'ymbari':
        case 'you':
            return parseIf(tokens);
        case 'tyw':
        case 'tip':
            return parseReturn(tokens);
    }

    let expr = parseExpression(tokens);
    let stmnt;
    if (tokens.isNext('=')) {
        let eqToken = tokens.pop();
        let value = parseExpression(tokens);
        stmnt = {
            type: 'ASSIGN',
            firstToken: expr.firstToken,
            target: expr,
            opToken: eqToken,
            value,
        };
    } else {
        stmnt = {
            type: 'EXPRESSION',
            firstToken: expr.firstToken,
            expression: expr,
        };
    }
    tokens.popExpected(';');
    return stmnt;
};

const GAG = 'running gag'.split(' ');
let parseWhile = tokens => {
    let firstToken = tokens.popAlts('gag', GAG);
    tokens.popExpected('(');
    let condition = parseExpression(tokens);
    tokens.popExpected(')');
    let code = parseBlock(tokens);
    return {
        type: 'WHILE',
        firstToken,
        condition,
        code,
    };
};

const YMBARI = 'you might be a redneck if'.split(' ');
const ISR = 'in soviet russia'.split(' ');
let isIsrNext = tokens => {
    return tokens.isNext('in') || tokens.isNext('isr');
};

let parseIf = tokens => {
    let firstToken = tokens.popAlts('ymbari', YMBARI);
    tokens.popExpected('(');
    let condition = parseExpression(tokens);
    tokens.popExpected(')');
    let trueCode = parseBlock(tokens, true);
    let falseCode = [];

    if (isIsrNext(tokens)) {
        tokens.popAlts('isr', ISR);
        if (tokens.isNext('ymbari') || tokens.isNext('you')) {
            falseCode = [parseIf(tokens)];
        } else {
            falseCode = parseBlock(tokens, true);
            popBdt(tokens);
        }
    } else {
        popBdt(tokens);
    }

    return {
        type: 'IF',
        firstToken,
        condition,
        trueCode,
        falseCode,
    };
};

const TYW = 'tip your waitress'.split(' ');
let parseReturn = tokens => {
    let firstToken = tokens.popAlts('tyw', TYW);
    let expression = tokens.isNext(';') ? null : parseExpression(tokens);
    tokens.popExpected(';');
    return {
        type: 'RETURN',
        firstToken,
        expression,
    };
};
