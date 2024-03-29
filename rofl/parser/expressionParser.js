let parseExpression = (() => {

    let parseStringValue = (throwToken, value) => {
        let str = value.substring(1, value.length - 1);
        let sb = '';
        for (let i = 0; i < str.length; i++) {
            let c = str[i];
            if (c === '\\') {
                if (i + 1 < str.length) {
                    c = str[++i];
                    let newChar = escapeSequences[c];

                    if (!newChar) throw throwError(throwToken, "Invalid string escape sequence: '\\" + c + "'");
                    sb += newChar;
                } else {
                    throw throwError(throwToken, "A string constant cannot end with an unescaped backslash.");
                }
            } else {
                sb += c;
            }
        }
        return sb;
    };

    let buildOpParser = (ops, nextParser, useShortCircuit) => {
        let opLookup = new Set(ops.split(' '));
        return (tokens) => {
            let root = nextParser(tokens);
            let next = tokens.peekValueNonNull();
            if (opLookup.has(next)) {
                let expressions = [root];
                let opTokens = [];
                while (opLookup.has(next)) {
                    opTokens.push(tokens.pop());
                    expressions.push(nextParser(tokens));
                    next = tokens.peekValueNonNull();
                }
                return buildPairs(expressions, opTokens, useShortCircuit);
            }
            return root;
        };
    };

    let buildPairs = (expressions, ops, isShortCircuit) => {
        let acc;
        if (isShortCircuit) {
            acc = expressions.pop();
            while (expressions.length) {
                acc = {
                    type: 'OP_PAIR',
                    left: expressions.pop(),
                    right: acc,
                    opToken: ops.pop(),
                    isShortCircuit: true,
                };
                acc.firstToken = acc.left.firstToken;
            }
        } else {
            acc = expressions[0];
            for (let i = 1; i < expressions.length; i++) {
                acc = {
                    type: 'OP_PAIR',
                    firstToken: acc.firstToken,
                    left: acc,
                    right: expressions[i],
                    opToken: ops[i - 1],
                    isShortCircuit: false,
                };
            }
        }
        return acc;
    };

    let parseTernary = (tokens) => {
        let root = parseBooleanCombination(tokens);
        if (tokens.isNext('redneck')) {
            let opToken = tokens.popExpected('redneck');
            tokens.popExpected('?');
            let trueValue = parseTernary(tokens);
            tokens.popExpected('bolshevik');
            tokens.popExpected('?');
            let falseValue = parseTernary(tokens);
            return {
                type: 'TERNARY',
                firstToken: root.firstToken,
                opToken,
                condition: root,
                trueExpression: trueValue,
                falseExpression: falseValue,
            };
        }
        return root;
    };

    let parseUnary = tokens => {
        if (tokens.isNext('-')) {
            let op = tokens.pop();
            return {
                type: 'NEGATIVE',
                firstToken: op,
                expression: parseUnary(tokens),
            };
        }

        let root = parseAtomic(tokens);

        while (true) {
            switch (tokens.peekValueNonNull()) {
                case 'NOT':
                case 'PSYCHE':
                    {
                        let op = tokens.pop();
                        root = {
                            type: 'BOOLEAN_NOT',
                            firstToken: root.firstToken,
                            opToken: op,
                            expression: root,
                        };
                        break;
                    }

                case '[':
                    {
                        let opToken = tokens.pop();
                        let index = parseExpression(tokens);
                        tokens.popExpected(']');
                        root = {
                            type: 'INDEX',
                            firstToken: root.firstToken,
                            root,
                            index,
                            opToken,
                        };
                        break;
                    }

                case '(':
                    {
                        let opToken = tokens.pop();
                        let args = [];
                        while (!tokens.popIfPresent(')')) {
                            if (args.length) tokens.popExpected(',');
                            args.push(parseExpression(tokens));
                        }
                        root = {
                            type: 'FUNCTION_INVOCATION',
                            firstToken: root.firstToken,
                            opToken,
                            args,
                            root,
                        };
                        break;
                    }

                case '->':
                case '.':
                    {
                        let opToken = tokens.pop();
                        let fieldName = tokens.popName("field name");
                        root = {
                            type: 'DOT_FIELD',
                            firstToken: root.firstToken,
                            opToken,
                            nameToken: fieldName,
                            name: fieldName.value,
                            isMethodRef: opToken.value === '->',
                            root,
                        };
                        break;
                    }

                default: return root;
            }
        }
    };

    let parseExponents = buildOpParser('**', parseUnary);
    let parseMultiplication = buildOpParser('* / %', parseExponents);
    let parseAddition = buildOpParser('+ -', parseMultiplication);
    let parseInequality = buildOpParser('< > >= <=', parseAddition);
    let parseEquality = buildOpParser('== !=', parseInequality);
    let parseBooleanCombination = buildOpParser('&& ||', parseEquality, true);

    let parseAtomic = tokens => {
        if (tokens.popIfPresent('(')) {
            let expression = parseExpression(tokens);
            tokens.popExpected(')');
            return expression;
        }


        let token = tokens.peek();
        if (!token) tokens.ensureMore();
        switch (tokens.peekValueNonNull()) {
            case 'nope':
            case 'yup':
                tokens.pop();
                return { type: 'BOOLEAN_CONSTANT', firstToken: token, value: token.value === 'yup' };

            case 'nada':
                tokens.pop();
                return { type: 'NULL_CONSTANT', firstToken: token, value: null };

            case 'lol':
                tokens.pop();
                tokens.popExpected('whatever');
                return { type: 'SYS_INVOKE', firstToken: token, name: 'randomFloat', args: [] };

            case '$':
                {
                    tokens.pop();
                    let nameToken = tokens.popName('system function name');
                    return { type: 'SYS_REF', firstToken: token, name: nameToken.value };
                }

            case '[':
                {
                    tokens.pop();
                    let items = [];
                    let nextAllowed = true;
                    while (!tokens.isNext(']') && nextAllowed) {
                        items.push(parseExpression(tokens));
                        nextAllowed = tokens.popIfPresent(',');
                    }
                    tokens.popExpected(']');
                    return {
                        type: 'LIST_DEFINITION',
                        firstToken: token,
                        items,
                    };
                }
        }

        let value;
        switch (token.type) {
            case 'INTEGER':
                tokens.pop();
                value = parseInt(token.value);
                if (isNaN(value) || !isFinite(value)) {
                    throw throwError(token, "Invalid integer constant value: '" + token.value + "'");
                }
                return {
                    type: 'INTEGER_CONSTANT',
                    firstToken: token,
                    value,
                };

            case 'FLOAT':
                tokens.pop();
                value = parseFloat(token.value);
                if (isNaN(value) || !isFinite(value)) {
                    throw throwError(token, "Invalid float constant value: '" + token.value + "'");
                }
                return {
                    type: 'FLOAT_CONSTANT',
                    firstToken: token,
                    value,
                };

            case 'STRING':
                tokens.pop();
                value = parseStringValue(token, token.value);
                return {
                    type: 'STRING_CONSTANT',
                    firstToken: token,
                    value,
                };

            case 'NAME':
                tokens.pop();
                return {
                    type: 'VARIABLE',
                    firstToken: token,
                    name: token.value,
                };

            default:
                throw throwError(token, "Unexpected token: '" + token.value + "'");
        }
    };

    return parseTernary;
})();
