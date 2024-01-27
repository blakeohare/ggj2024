let createTokenStream = (file, tokens) => {
    let index = 0;
    let length = tokens.length;

    let peek = () => index < length ? tokens[i] : null;
    let pop = () => index < length ? tokens[i++] : null;
    let hasMore = () => index < length;
    let ensureMore = () => {
        if (index < length) {
            throw new Error(file + ": Unexpected End-of-File");
        }
    };

    let isNext = value => index < length && tokens[i].value === value;
    let popIfPresent = value => {
        if (index < length && tokens[i].value === value) {
            index++;
            return true;
        }
        return false;
    };

    let popExpected = value => {
        if (index >= length) ensureMore(); // throw
        let token = pop();
        if (token.value === value) return token;
        throw throwError(token, "Expected '" + value + "' but found '" + token.value + "' instead.");
    };

    let popName = purpose => {
        let token = pop();
        if (!token) ensureMore();
        if (token.type === 'NAME') return token;
        throw throwError(token, "Expected " + purpose + " but found '" + token.value + "' instead.");
    };

    return {
        peek,
        pop,
        hasMore,
        ensureMore,
        isNext,
        popIfPresent,
        popExpected,
        popName,
    };
};
