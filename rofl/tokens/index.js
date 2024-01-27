let getTokenStream = (() => {

    TEXT_INCLUDE('tokenizer.js');
    TEXT_INCLUDE('TokenStream.js');

    return (file, content) => {
        let tokenList = tokenize(file, content);
        return createTokenStream(file, tokenList);
    };
})();
