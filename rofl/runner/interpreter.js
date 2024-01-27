let runtimeError = (ec, pc, frame, err) => {
    frame.pc = pc;
    let trace = [];
    let walker = frame;
    while (walker) {
        let token = (ec.bytecode[walker.pc] || {}).token;
        if (token) {
            trace.push("[" + token.file + "] Line " + token.line + " Column " + token.col);
        } else {
            trace.push("<PC: " + frame.pc + "> (no source info available)");
        }
        walker = walker.prev;
    }

    throw new Error([err, "Stack Trace: ", ...trace.map(e => '  ' + e)].join('\n'));
};

let interpret = async bundle => {
    let { bytecode, pcLookup, images, screen, globals } = bundle;
    let ec = bundle;
    let frame = {
        pc: pcLookup['main'],
        locals: {},
        values: [],
        args: [],
        prev: null
    };
    let row;

    // These are allocated once for speed.
    let { pc, values, locals } = frame;
    let i, j, k;
    let err;
    let value, value1, value2, value3;
    let bool1, bool2, bool3;
    let argc;
    let args;
    let output, left, right;
    let str, str1, str2, str3;
    let list1, list2;
    let obj, obj1, obj2;

    const VALUE_TRUE = globals.globalTrue;
    const VALUE_FALSE = globals.globalFalse;
    const VALUE_NULL = globals.globalNull;

    while (true) {
        row = bytecode[pc];
        switch (row.op) {

            case 'ASSIGN_FIELD':
                right = values.pop();
                left = values.pop();
                switch (left.type) {
                    case 'STRUCT':
                        left.internalValue[row.str] = right;
                        break;
                    default:
                        err = "Unable to assign a field to this type of value.";
                        TEXT_INCLUDE('macros/error.js');
                        break;
                }
                break;

            case 'ASSIGN_INDEX':
                value = values.pop();
                right = values.pop();
                left = values.pop();
                switch (left.type) {
                    case 'LIST':
                        list1 = left.internalValue;
                        if (right.type !== 'INT') {
                            err = "Lists can only be assigned at integer indexes.";
                        } else {
                            i = right.internalValue;
                            if (i < 0) i += list1.length;
                            if (i < 0 || i >= list1.length) {
                                err = "The index is out of bounds. Index: " + i + ", Length: " + list1.length + ".";
                            } else {
                                list1[i] = value;
                            }
                        }
                        break;
                    case 'MAP':
                        if (right.type !== 'INT' && right.type !== 'STRING') {
                            err = "Hash maps can only be assigned at integer and string keys.";
                        } else {
                            k = right.internalValue;
                            left.internalValue[k] = value;
                        }
                        break;
                    default:
                        err = "The " + formattedTypeName(left.type) + " does not support index assignment.";
                        break;
                }

                if (err) {
                    TEXT_INCLUDE('macros/error.js');
                }

                break;

            case 'ASSIGN_VAR':
                locals[row.str] = values.pop();
                break;

            case 'BINARY_OP':
                right = values.pop();
                left = values.pop();
                output = null;
                switch (left.type + row.str + right.type) {
                    case 'INT+INT':
                        output = buildInteger(globals, left.internalValue + right.internalValue);
                        break;

                    case 'INT+FLOAT':
                    case 'FLOAT+INT':
                    case 'FLOAT+FLOAT':
                        output = buildFloat(globals, left.internalValue + right.internalValue);
                        break;

                    case 'INT*INT':
                        output = buildInteger(globals, left.internalValue * right.internalValue);
                        break;

                    case 'INT*FLOAT':
                    case 'FLOAT*INT':
                    case 'FLOAT*FLOAT':
                        output = buildFloat(globals, left.internalValue * right.internalValue);
                        break;


                    case 'INT==FLOAT':
                    case 'FLOAT==INT':
                        output = left.internalValue === right.internalValue ? VALUE_TRUE : VALUE_FALSE;
                        break;

                    case 'INT!=FLOAT':
                    case 'FLOAT!=INT':
                        output = left.internalValue === right.internalValue ? VALUE_TRUE : VALUE_FALSE;
                        break;

                    case 'INT<INT':
                    case 'INT<FLOAT':
                    case 'FLOAT<INT':
                    case 'FLOAT<FLOAT':
                        output = left.internalValue < right.internalValue ? VALUE_TRUE : VALUE_FALSE;
                        break;

                    case 'INT>INT':
                    case 'INT>FLOAT':
                    case 'FLOAT>INT':
                    case 'FLOAT>FLOAT':
                        output = left.internalValue > right.internalValue ? VALUE_TRUE : VALUE_FALSE;
                        break;

                    case 'INT<=INT':
                    case 'INT<=FLOAT':
                    case 'FLOAT<=INT':
                    case 'FLOAT<=FLOAT':
                        output = left.internalValue <= right.internalValue ? VALUE_TRUE : VALUE_FALSE;
                        break;

                    case 'INT>=INT':
                    case 'INT>=FLOAT':
                    case 'FLOAT>=INT':
                    case 'FLOAT>=FLOAT':
                        output = left.internalValue >= right.internalValue ? VALUE_TRUE : VALUE_FALSE;
                        break;


                    default:
                        if (row.str === '==' || row.str === '!=') {

                            if (left.type !== right.type) bool1 = false;
                            else bool1 = left.internalValue === right.internalValue;

                            if (row.str === '!=') bool1 = !bool1;
                            output = bool1 ? VALUE_TRUE : VALUE_FALSE;
                        } else if (row.str === '+' && (left.type === 'STRING' || right.type === 'STRING')) {
                            output = buildString(globals, valueToString(globals, left) + valueToString(globals, right));
                        } else {
                            err = "Invalid operation between these types: " + formattedTypeName(left.type) + " " + row.str + " " + formattedTypeName(right.type);
                        }
                        break;
                }
                if (err) {
                    TEXT_INCLUDE('macros/error.js');
                }
                values.push(output);
                break;

            case 'BOOLEAN_NOT':
                value = values.pop();
                if (value.type !== 'BOOL') {
                    err = 'NOT can only be applied to boolean values.';
                    TEXT_INCLUDE('macros/error.js');
                } else {
                    values.push(value.internalValue ? VALUE_FALSE : VALUE_TRUE);
                }
                break;

            case 'DOT':
                left = values.pop();
                output = null;
                err = null;
                switch (left.type) {

                    case 'LIST':
                        switch (row.str) {
                            case 'length':
                                output = buildInteger(globals, left.internalValue.length);
                                break;

                            default:
                                err = "Lists do not have a field named '." + row.str + "'";
                                break;
                        }
                        break;
                    case 'STRING':
                        switch (row.str) {
                            case 'length':
                                output = buildInteger(globals, left.internalValue.length);
                                break;
                            default:
                                err = "Strings do not have a field named '." + row.str + "'";
                                break;
                        }
                        break;

                    case 'IMAGE':
                        switch (row.str) {
                            case 'width':
                            case 'height':
                                output = buildInteger(globals, left.internalValue[row.str]);
                                break;

                            default:
                                err = "The image type has no field named ." + row.str;
                                break;
                        }
                        break;

                    case 'STRUCT':
                        output = left.internalValue[row.str];
                        if (!output) {
                            err = "Use of undefined struct field: '." + row.str + "'";
                        }
                        break;

                    default:
                        err = "The " + formattedTypeName(left.type) + " type does not support dot notation.";
                        break;
                }

                if (err) {
                    TEXT_INCLUDE('macros/error.js');
                }
                if (!output) output = VALUE_NULL;
                values.push(output);

                break;

            case 'ENSURE_ARGC':
                if (frame.args.length !== row.arg0) {
                    err = "Invalid number of arguments. Expected " + row.arg0 + " but received " + frame.args.length + " instead.";
                    TEXT_INCLUDE('macros/error.js');
                }
                break;

            case 'ENSURE_BOOLEAN':
                value = values[values.length - 1];
                if (value.type !== 'BOOL') {
                    err = "A boolean value was expected here but found a " + formattedTypeName(value.type) + " instead.";
                    TEXT_INCLUDE('macros/error.js');
                }
                break;

            case 'INDEX':
                right = values.pop();
                left = values.pop();

                switch (left.type) {
                    case 'LIST':
                        if (right.type !== 'INT') {
                            err = "Lists can only be indexed with an integer type.";
                        } else {
                            list1 = left.internalValue;
                            i = right.internalValue;
                            if (i < 0) i += list1.length;
                            if (i < 0 || i >= list1.length) {
                                err = "List index is out of bounds. Index was " + i + " but the length was " + list1.length + ".";
                            } else {
                                output = list1[i];
                            }
                        }
                        break;
                    default:
                        err = "The " + formattedTypeName(left.type) + " type does not support indexing.";
                        break;
                }

                if (err) {
                    TEXT_INCLUDE('macros/error.js');
                }
                values.push(output);
                break;

            case 'INVOKE':
                args = [];
                argc = row.arg0;
                while (argc > 0) {
                    argc--;
                    args.push(values.pop());
                }
                args.reverse();
                argc = args.length;
                left = values.pop();
                int1 = row.args[1];
                if (int1 === 1) {
                    // invoking a method on a struct using ->
                    if (left.type !== 'STRUCT') {
                        err = "Cannot use -> on non-structs";
                        TEXT_INCLUDE('macros/error.js');
                    }
                    // prepend the original struct as the first argument and then
                    // just pretend it's a normal function.
                    args = [left, ...args];
                    left = left.internalValue[row.str];
                    if (!left) {
                        err = "This struct has no field named '" + row.str + "'";
                        TEXT_INCLUDE('macros/error.js');
                    }
                    if (left.type !== 'FUNCTION') {
                        err = "The field '" + row.str + "' contains a " + formattedTypeName(left.type) + " but it is invoked like a function.";
                        TEXT_INCLUDE('macros/error.js');
                    }
                    int1 = 0; // treat as a simple function.
                }

                if (int1 === 0) {
                    // simple function invocation

                    if (left.type !== 'FUNCTION') {
                        err = "Cannot invoke a " + formattedTypeName(left.type) + " like a function.";
                        TEXT_INCLUDE('macros/error.js');
                    }
                    frame.pc = pc;
                    frame = {
                        prev: frame,
                        locals: {},
                        values: [],
                        args,
                        pc: left.internalValue.pc - 1,
                    };
                    args = null;
                    pc = frame.pc;
                    locals = frame.locals;
                    values = frame.values;
                } else { // (int1 === 2)
                    // invoking a method using a dot
                    output = null;
                    switch (left.type) {
                        case 'STRING':
                            switch (row.str) {
                                case 'toUpper':
                                    output = { type: 'STRING', internalValue: left.internalValue.toUpperCase() };
                                    break;
                                case 'toLower':
                                    output = { type: 'STRING', internalValue: left.internalValue.toLowerCase() };
                                    break;
                                default:
                                    err = "Strings do not have a method called '" + row.str + "'";
                                    break;
                            }
                            break;

                        case 'MAP':
                            switch (row.str) {
                                case 'get':
                                    if (argc === 2) {
                                        output = args[1];
                                        right = args[0];
                                        if (right.type === 'INT' || right.type === 'STRING') {
                                            output = left.internalValue[right.internalValue];
                                            if (!output) {
                                                output = VALUE_NULL;
                                            }
                                        } else {
                                            err = "Hash maps require an integer or string key";
                                        }
                                    } else {
                                        err = "HashMap.get() requires two arguments: a key and a default value.";
                                    }
                                    break;
                            }
                            break;

                        default:
                            err = "There are no methods on the type " + formattedTypeName(left.type) + ".";
                            break;
                    }

                    if (err) {
                        TEXT_INCLUDE('macros/error.js');
                    }
                    if (!output) output = VALUE_NULL;
                    values.push(output);
                }
                break;

            case 'JUMP':
                pc += row.arg0;
                break;

            case 'LIST_DEF':
                args = [];
                argc = row.arg0;
                while (argc > 0) {
                    argc--;
                    args.push(values.pop());
                }
                args.reverse();
                values.push({ type: 'LIST', internalValue: args });
                args = null;
                break;

            case 'POP':
                values.pop();
                break;

            case 'POP_AND_JUMP_IF_FALSE':
                value = values.pop();
                if (!value.internalValue) {
                    pc += row.arg0;
                }
                break;


            case 'PUSH_ARG':
                values.push(frame.args[row.arg0]);
                break;

            case 'PUSH_BOOLEAN':
                row.op = 'PUSH_VALUE';
                row.valueCache = buildBool(globals, row.arg0);
                pc--;
                break;

            case 'PUSH_INTEGER':
                row.op = 'PUSH_VALUE';
                row.valueCache = buildInteger(globals, row.arg0);
                pc--;
                break;

            case 'PUSH_NULL':
                row.op = 'PUSH_VALUE';
                row.valueCache = VALUE_NULL;
                pc--;
                break;

            case 'PUSH_STRING':
                row.op = 'PUSH_VALUE';
                row.valueCache = buildCommonString(globals, row.str);
                pc--;
                break;

            case 'PUSH_VALUE':
                values.push(row.valueCache);
                break;

            case 'RETURN':

                value = values.pop();
                frame = frame.prev;
                if (!frame) {
                    return; // Execution completed successfully.
                }
                locals = frame.locals;
                values = frame.values;
                pc = frame.pc;
                values.push(value);

                break;

            case 'SYS_INVOKE':
                args = [];
                argc = row.arg0;
                while (argc) {
                    args.push(values.pop());
                    argc--;
                }
                argc = row.arg0;
                args.reverse();
                output = null;
                switch (row.str) {

                    case 'drawImage':
                        if (argc !== 4 || args[0].type !== 'IMAGE' || args[1].type !== 'IMAGE' || args[2].type !== 'INT' || args[3].type !== 'INT') {
                            err = "$drawImage requires 2 image arguments and 2 integer arguments.";
                        } else {
                            GameUtil.drawImage(args[0].internalValue, args[1].internalValue, args[2].internalValue, args[3].internalValue);
                        }
                        break;


                    case 'drawRectangle':
                        if (argc !== 8 || args[0].type !== 'IMAGE') {
                            err = "8 arguments expected for $drawRect. The first argument must be an image.";
                        } else {
                            for (i = 1; i < 8; i++) {
                                if (args[i].type !== 'INT') {
                                    err = "$drawRect requires an image argument followed by 7 integer arguments.";
                                    break;
                                }
                            }

                            if (!err) {
                                GameUtil.drawRect(
                                    args[0].internalValue,
                                    args[1].internalValue,
                                    args[2].internalValue,
                                    args[3].internalValue,
                                    args[4].internalValue,
                                    args[5].internalValue,
                                    args[6].internalValue,
                                    args[7].internalValue);
                            }
                        }
                        break;

                    case 'flushDrawBuffer':
                        output = VALUE_NULL;
                        if (argc !== 1 || args[0].type !== 'IMAGE') {
                            err = "$flushDrawBuffer() requires a single image.";
                        } else {
                            GameUtil.blitToScreen(args[0].internalValue);
                            output = VALUE_NULL;
                        }
                        break;

                    case 'getNextEvent':
                        value = GameUtil.getNextEvent();
                        if (!value) {
                            output = VALUE_NULL;
                        } else {
                            output = convertNativeStructToValue(globals, value);
                        }
                        break;

                    case 'hashmap':
                        output = { type: 'MAP', internalValue: {} };
                        break;
                    case 'loadImage':
                        if (argc !== 1 && args[0].type !== 'STRING') {
                            err = "$loadImage() expects a string path argument.";
                        } else {

                            value = images[args[0].internalValue];
                            if (!value) {
                                err = "The image path '" + args[0].internalValue + "' was invalid.";
                            } else {
                                output = {
                                    type: 'IMAGE',
                                    internalValue: GameUtil.cloneImage(value),
                                }
                            }
                        }
                        break;

                    case 'newImage':
                        if (argc !== 2 || args[0].type !== 'INT' || args[1].type !== 'INT') {
                            err = "2 arguments expected for $newImage()";
                        } else {
                            output = { type: 'IMAGE', internalValue: GameUtil.createImage(args[0].internalValue, args[1].internalValue) };
                        }
                        break;

                    case 'object':
                        output = { type: 'STRUCT', internalValue: {} };
                        break;

                    case 'unixTime':
                        output = buildFloat(globals, new Date().getTime() / 1000.0);
                        break;

                    default: throw new Error("Implement system invocation: $" + row.str);
                }

                if (err) {
                    TEXT_INCLUDE('macros/error.js');
                }
                if (!output) output = VALUE_NULL;
                values.push(output);
                break;

            case 'VAR':
                value = locals[row.str];
                if (!value) {
                    if (pcLookup[row.str]) {
                        row.op = 'PUSH_VALUE';
                        row.valueCache = {
                            type: 'FUNCTION',
                            internalValue: {
                                name: row.str,
                                pc: pcLookup[row.str],
                            }
                        };
                        pc--;
                    } else {
                        err = "Use of unassigned variable: '" + row.str + "'";
                        TEXT_INCLUDE('macros/error.js');
                    }
                } else {
                    values.push(value);
                }
                break;

            default:
                throw new Error("TODO: implement op: " + row.op);
        }
        pc++;
    }
};
