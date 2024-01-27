let createGlobals = () => {
    let g = {
        globalTrue: { type: 'BOOL', internalValue: true },
        globalFalse: { type: 'BOOL', internalValue: false },
        globalNull: { type: 'NULL', internalValue: null },
        oneF: { type: 'FLOAT', internalValue: 1.0 },
        zeroF: { type: 'FLOAT', internalValue: 0.0 },
        emptyString: { type: 'STRING', internalValue: "" },
        commonStrings: {},
        one: null,
        zero: null,
        posInts: [],
        negInts: [],
    };

    g.zero = { type: 'INT', internalValue: 0 };
    g.posInts.push(g.zero);
    g.negInts.push(g.zero);

    for (let i = 1; i <= 1000; i++) {
        g.posInts.push({ type: 'INT', internalValue: i });
        g.negInts.push({ type: 'INT', internalValue: -i });
    }
    g.one = g.posInts[1];
    g.commonStrings[''] = g.emptyString;

    return g;
};

let buildBool = (globals, v) => v ? globals.globalTrue : globals.globalFalse;

let buildInteger = (globals, v) => {
    if (v > 1000 || v < -1000) return { type: 'INT', internalValue: v };
    if (v < 0) return globals.negInts[-v];
    return globals.posInts[v];
};

let buildFloat = (globals, v) => {
    if (v === 0) return globals.zeroF;
    if (v === 1) return globals.oneF;
    return { type: 'FLOAT', internalValue: v };
};

let buildString = (globals, str) => {
    let v = globals.commonStrings[str];
    if (v) return v;
    return { type: 'STRING', internalValue: str };
};

let buildCommonString = (globals, str) => {
    let v = globals.commonStrings[str];
    if (!v) {
        v = buildString(globals, str);
        globals.commonStrings[str] = v;
    }
    return v;
};

let formattedTypeName = t => {
    switch (t) {
        case 'INT': return 'integer';
        case 'BOOL': return 'boolean';
        case 'MAP': return 'hash map';

        default:
            return t.toLowerCase();
    }
};

let convertNativeToValue = (globals, v) => {
    let type = typeof v;
    if (type === 'number') {
        if (isNaN(v) || !isFinite(v)) return globals.globalNull;
        if (v % 1 === 0) return buildInteger(globals, v);
        return buildFloat(globals, v);
    }
    if (v === null || v === undefined) return globals.globalNull;
    if (type === 'boolean') return buildBool(globals, v);
    if (type === 'string') return buildString(globals, v);
    return globals.globalNull;
};

let convertNativeStructToValue = (globals, obj) => {
    let output = {};
    for (let key of Object.keys(obj)) {
        let value = obj[key];
        output[key] = convertNativeToValue(globals, value);
    }
    return { type: 'STRUCT', internalValue: output };
};