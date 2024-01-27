let serializeExpression = expr => {
    switch (expr.type) {
        case 'BOOLEAN_CONSTANT': return serializeBoolean(expr);
        case 'BOOLEAN_NOT': return serializeBooleanNot(expr);
        case 'DOT_FIELD': return serializeDotField(expr);
        case 'FLOAT_CONSTANT': return serializeFloat(expr);
        case 'FUNCTION_INVOCATION': return serializeInvocation(expr);
        case 'INDEX': return serializeIndex(expr);
        case 'INTEGER_CONSTANT': return serializeInteger(expr);
        case 'LIST_DEFINITION': return serializeListDefinition(expr);
        case 'NEGATIVE': return serializeNegative(expr);
        case 'NULL_CONSTANT': return serializeNull(expr);
        case 'OP_PAIR': return serializeOpPair(expr);
        case 'STRING_CONSTANT': return serializeString(expr);
        case 'SYS_REF': throw throwError(expr, "System functions must be invoked.");
        case 'SYS_INVOKE': return serializeSystemInvoke(expr);
        case 'TERNARY': return serializeTernary(expr);
        case 'VARIABLE': return serializeVariable(expr);
        default: throw new Error(expr.type);
    }
};

let serializeNegative = neg => {
    let root = neg.expression;
    if (root.type === 'INTEGER_CONSTANT' || root.type === 'FLOAT_CONSTANT') {
        root.value *= -1;
        return serializeExpression(root);
    }

    return joinRows(
        serializeExpression(neg.expression),
        createRow('NEGATIVE', neg));
};

let serializeSystemInvoke = si => {
    let args = si.args;
    let argc = args.length;
    return joinRows(
        ...args.map(serializeExpression),
        createRow('SYS_INVOKE', si, si.name, argc));
};

let serializeIndex = idx => {
    return joinRows(
        serializeExpression(idx.root),
        serializeExpression(idx.index),
        createRow('INDEX', idx));
};

let serializeFloat = fc => {
    return createRow('PUSH_FLOAT', fc, fc.value + '');
};

let serializeTernary = t => {
    let condBuf = serializeExpression(t.condition);
    let trueBuf = serializeExpression(t.trueExpression);
    let falseBuf = serializeExpression(t.falseExpression);

    return joinRows(
        condBuf,
        createRow('ENSURE_BOOLEAN', t.condition),
        createRow('POP_AND_JUMP_IF_FALSE', null, null, trueBuf.size + 1),
        trueBuf,
        createRow('JUMP', null, null, falseBuf.size),
        falseBuf,
    );
};

let serializeString = sc => {
    return createRow('PUSH_STRING', sc, sc.value);
};

let serializeDotField = df => {
    if (df.isMethodRef) throw new Error("Cannot use -> on an expression without immediately invoking it.");

    return joinRows(
        serializeExpression(df.root),
        createRow('DOT', df.opToken, df.name));
};

let serializeNull = nc => {
    return createRow('PUSH_NULL', nc);
};

let serializeOpPair = pair => {
    let op = pair.opToken;
    let leftBuf = serializeExpression(pair.left);
    let rightBuf = serializeExpression(pair.right);

    if (op.value === '&&') {
        return joinRows(
            leftBuf,
            createRow('ENSURE_BOOLEAN', pair.left),
            createRow('JUMP_IF_FALSE_ELSE_POP', null, null, rightBuf.size),
            rightBuf
        );
    }

    if (op.value === '||') {
        return joinRows(
            leftBuf,
            createRow('ENSURE_BOOLEAN', pair.left),
            createRow('JUMP_IF_TRUE_ELSE_POP', null, null, rightBuf.size),
            rightBuf
        );
    }

    return joinRows(
        leftBuf,
        rightBuf,
        createRow('BINARY_OP', op, op.value));
};

let serializeListDefinition = ld => {
    return joinRows(
        ...ld.items.map(serializeExpression),
        createRow('LIST_DEF', ld, null, ld.items.length)
    );
};

let serializeBooleanNot = bn => {
    return joinRows(
        serializeExpression(bn.expression),
        createRow('BOOLEAN_NOT', bn));
};

let serializeVariable = v => {
    return createRow('VAR', v, v.name);
};

let serializeInvocation = fi => {

    let args = joinRows(...fi.args.map(serializeExpression));
    let argc = fi.args.length;

    if (fi.root.type === 'SYS_REF') {
        return joinRows(
            args,
            createRow('SYS_INVOKE', fi, fi.root.name, argc));
    }

    if (fi.root.type === 'DOT_FIELD') {
        let df = fi.root;
        return joinRows(
            serializeExpression(df.root),
            args,
            createRow('INVOKE', fi.opToken, df.name, [argc, df.isMethodRef ? 1 : 2])
        );
    }

    return joinRows(
        serializeExpression(fi.root),
        args,
        createRow('INVOKE', fi.opToken, null, [argc, 0]));
};

let serializeBoolean = bc => {
    return createRow('PUSH_BOOLEAN', bc, null, bc.value ? 1 : 0);
};

let serializeInteger = ic => {
    return createRow('PUSH_INTEGER', ic, null, ic.value);
};
