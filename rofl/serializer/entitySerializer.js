let serializeEntity = entity => {
    if (entity.type !== 'FUNCTION_DEFINITION') throw new Error(); // should not happen

    return serializeFunctionDefinition(entity);
};

let serializeFunctionDefinition = func => {
    let buffer = createRow('ENSURE_ARGC', func, null, func.args.length);
    for (let i = 0; i < args.length; i++) {
        buffer = joinRows(
            buffer, 
            createRow('PUSH_ARG', null, null, i),
            createRow('ASSIGN_VAR', args[i], args[i].value),
        );
    }

    for (let line of func.code) {
        buffer = joinRows(buffer, serializeStatement(line));
    }

    if (buffer.last.op !== 'RETURN') {
        buffer = joinRows(
            buffer, 
            createRow('PUSH_NULL'),
            createRow('RETURN'),
        );
    }

    return buffer; 
};
