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

    let popChain = (...values) => {
        let first = null;
        for (let value of values) {
            let token = popExpected(value);
            first = first || token;
        }
        return first;
    };

    let peekValue = () => index < length ? tokens[i].value : null;
    let peekValueNonNull = () => index < length ? tokens[i].value : '';

    let popAlts = (value, valueChain) => {
        if (isNext(valueChain[0])) return popChain(valueChain);
        return popExpected(value);
    };

    return {
        peek,
        peekValue,
        peekValueNonNull,
        pop,
        hasMore,
        ensureMore,
        isNext,
        popIfPresent,
        popExpected,
        popChain,
        popName,
        popAlts,
    };
};
