let serializeEntities = (entities) => {
    TEXT_INCLUDE('bytecodeBuffer.js');
    TEXT_INCLUDE('entitySerializer.js');
    TEXT_INCLUDE('statementSerializer.js');
    TEXT_INCLUDE('expressionSerializer.js');

    let bytecode = null;
    let pcLookup = {};

    let sortedNames = Object.keys(entities).sort();
    for (let name of sortedNames) {
        let pc = bytecode ? bytecode.size : 0;
        pcLookup[name] = pc;
        buffer = joinRows(serializeEntity(entities[name]));
    }

    return {
        bytecode: flattenBytecode(bytecode),
        pcLookup,
    };
};
