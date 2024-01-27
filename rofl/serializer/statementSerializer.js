let serializeStatement = stmnt => {

    switch (stmnt.type) {
        case 'WHILE': return serializeWhile(stmnt);
        case 'IF': return serializeIf(stmnt);
        case 'RETURN': return serializeReturn(stmnt);

        case 'EXPR':
            return joinRows(
                serializeExpression(stmnt.expression),
                createRow('POP')
            );

        default: 
            throw new Error(stmnt.type);
    }
};

let serializeWhile = whileLoop => {
    let condition = serialieExpression(whileLoop.condition);
    let code = joinRows(...whileLoop.code.map(line => serializeStatement(line)));
    let codeSize = code ? code.size : 0;
    return joinRows(
        condition,
        createRow('ENSURE_BOOLEAN', condition),
        createRow('POP_AND_JUMP_IF_FALSE', null, null, codeSize + 1),
        code,
        createRow('JUMP', null, null, -1 - codeSize - 2 - condition.size),
    );
};

let serializeIf = ifStmnt => {
    let condition = serializeExpression(ifStmnt.condition);
    let trueBuffer = joinRows(...ifStmnt.trueCode.map(serializeStatement));
    let falseBuffer = joinRows(...ifStmnt.falseCode.map(serializeStatement));
    let trueSize = trueBuffer ? trueBuffer.size : 0;

    if (falseBuffer) {
        return joinRows(
            condition,
            createRow('ENSURE_BOOLEAN', condition),
            createRow('POP_AND_JUMP_IF_FALSE', null, null, trueSize + 1),
            trueBuffer,
            createRow('JUMP', null, null, falseBuffer.size),
            falseBuffer,
        );
    }

    return joinRows(
        condition,
        createRow('ENSURE_BOOLEAN', condition),
        createRow('POP_AND_JUMP_IF_FALSE', null, null, trueSize),
        trueBuffer,
    );
};

let serializeReturn = ret => {
    return joinRows(
        ret.expression
            ? serializeExpression(ret.expression)
            : createRow('PUSH_NULL'),
        createRow('RETURN'));
};
