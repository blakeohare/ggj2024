let interpret = async bundle => {
    let { bytecode, pcLookup, images, screen } = bundle;
    let frame = {
        pc: pcLookup['main'],
        locals: {},
        values: [],
    };
    let stack = [frame];
    let row;

    while (true) {
        row = bytecode[pc];
        switch (row.op) {
            case 'JUMP':
                pc += row.arg0;
                break;

            default:
                throw new Error("TODO: implement op: " + row.op);
        }
        pc++;
    }
};
