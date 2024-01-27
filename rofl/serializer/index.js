let serializeEntities = (entities) => {
    TEXT_INCLUDE('bytecodeBuffer.js');
    TEXT_INCLUDE('entitySerializer.js');
    TEXT_INCLUDE('statementSerializer.js');
    TEXT_INCLUDE('expressionSerializer.js');

    let bytecode = null;
    let pcLookup = {};

    let entityByName = {};
    for (let entity of entities) {
        if (entityByName[entity.name]) throw throwError(entity, "There are multiple entities defined named '" + entity.name + "'");
        entityByName[entity.name] = entity;
    }
    let sortedNames = Object.keys(entityByName).sort();
    for (let name of sortedNames) {
        let pc = bytecode ? bytecode.size : 0;
        pcLookup[name] = pc;
        bytecode = joinRows(bytecode, serializeEntity(entityByName[name]));
    }

    return {
        bytecode: flattenBytecode(bytecode),
        pcLookup,
    };
};
