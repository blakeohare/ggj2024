let serializeExpression = expr => {
    switch (expr.type) {
        case 'INTEGER_CONSTANT': return serializeInteger(expr);
        default: throw new Error(expr.type);
    }
};

let serializeInteger = ic => {
    return createRow('PUSH_INTEGER', ic, null, ic.value);
};
