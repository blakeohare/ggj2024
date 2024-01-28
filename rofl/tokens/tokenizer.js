let tokenize = (file, content) => {

    let chars = (content.split('\r\n').join('\n') + '\n').split('');

    let lines = [];
    let cols = [];
    let line = 1;
    let col = 1;
    for (let char of chars) {
        lines.push(line);
        cols.push(col);
        if (char === '\n') {
            line++;
            col = 1;
        } else {
            col++;
        }
    }

    let mode = 'NORMAL';
    let modeSubtype = null;
    let tokenStart = 0;

    let whitespace = new Set(' \n\r\t'.split(''));
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let alphanums = new Set([
        ...letters.split(''),
        ...letters.toUpperCase().split(''),
        ...numbers.split(''),
        '_',
    ]);
    let numerals = new Set(numbers.split(''));
    let keywords = new Set([
        ...'gag kkwt who ymbari isr bdt lol redneck bolshevik tyw'.split(' '),
        ...'nope yup nada'.split(' '),
        ...'running knock you in ba tip'.split(' '),
        ...'heckle call'.split(' '),
    ]);

    let multicharTokens = new Set([
        ...'-> == ** && || != <= =>'.split(' '),
    ]);

    let tokens = [];

    let c;
    for (let i = 0; i < chars.length; i++) {
        c = chars[i];
        switch (mode) {
            case 'NORMAL':
                if (whitespace.has(c)) { }
                else if (alphanums.has(c)) {
                    mode = 'WORD';
                    tokenStart = i;
                } else if (c === '"' || c === "'") {
                    if (c === "'" && tokens.length && tokens[tokens.length - 1].value === 'who' && chars[i + 1] === 's') {
                        // This is actually a "who's" and not a string, which is used by knock knock who's there.
                        tokens.push({ file, value: chars[i], line: lines[i], col: cols[i], type: 'PUNC' });
                    } else {
                        mode = 'STRING';
                        tokenStart = i;
                        modeSubtype = c;
                    }
                } else if (multicharTokens.has(c + chars[i + 1])) {
                    tokens.push({ file, value: chars[i] + chars[i + 1], line: lines[i], col: cols[i], type: 'PUNC' });
                    i++;
                } else {
                    tokens.push({ file, value: chars[i], line: lines[i], col: cols[i], type: 'PUNC' });
                }
                break;

            case 'WORD':
                if (!alphanums.has(c)) {
                    let value = chars.slice(tokenStart, i).join('');
                    if (value === 'heckle') {
                        mode = 'COMMENT';
                    } else {
                        tokens.push({ file, value, line: lines[tokenStart], col: cols[tokenStart], type: 'WORD' });
                        mode = 'NORMAL';
                    }
                    --i;
                }
                break;

            case 'STRING':
                if (c === modeSubtype) {
                    tokens.push({ file, value: chars.slice(tokenStart, i + 1).join(''), line: lines[tokenStart], col: cols[tokenStart], type: 'STRING' });
                    mode = 'NORMAL';
                } else if (c === '\\') {
                    i++;
                }
                break;

            case 'COMMENT':
                if (c === 'c' && chars.slice(i, i + 'call security'.length).join('') === 'call security') {
                    i += 'call security'.length - 1;
                    mode = 'NORMAL';
                }
                break;
        }
    }

    if (mode !== 'NORMAL') {
        throw new Error("[" + file + "]: Unclosed " + mode.toLowerCase());
    }

    tokens.forEach(t => {
        if (t.type === 'WORD') {
            if (numerals.has(t.value[0])) {
                t.type = 'INTEGER';
            } else if (keywords.has(t.value)) {
                t.type = 'KEYWORD';
            } else {
                t.type = 'NAME';
            }
        }
    });

    for (let i = 0; i < tokens.length; i++) {
        let center = tokens[i];
        let left = tokens[i - 1] || null;
        let right = tokens[i + 1] || null;
        if (center) {
            if (left && (left.line !== center.line || left.col + left.value.length !== center.col)) {
                left = null;
            }
            if (right && (right.line !== center.line || center.col + center.value.length !== right.col)) {
                right = null;
            }

            if (center.value === '.') {
                if (left && left.type === 'INTEGER') {
                    left.value += '.';
                    left.type = 'FLOAT';
                    tokens[i] = left;
                    tokens[i - 1] = null;
                    center = left;
                    left = null;
                }

                if (right && right.type === 'INTEGER') {
                    center.value += right.value;
                    center.type = 'FLOAT';
                    right = null;
                    tokens[i + 1] = null;
                }
            }
        }
    }

    tokens = tokens.filter(v => !!v);

    return tokens;
};
