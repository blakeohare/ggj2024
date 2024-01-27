let parseEntities = (() => {
    TEXT_INCLUDE('entityParser.js');
    TEXT_INCLUDE('statementParser.js');
    TEXT_INCLUDE('expressionParser.js');

    return (tokens) => {
        let entities = [];
        while (tokens.hasMore()) {
            let entity = parseEntity(tokens);
            entities.push(entity);
        }
        return entities;
    };
})();
