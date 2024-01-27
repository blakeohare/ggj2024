let joinRows = (...rows) => {
    rows = rows.filter(v => !!v);
    if (rows.length === 0) return null;
    if (rows.length === 1) return rows[0];
    let acc = rows[0];
    for (let i = 1; i < rows.length; i++) {
        acc = {
            left: acc,
            right: rows[i],
            size: acc.size + rows[i].size,
            first: acc.first,
            last: rows[i].last,
        };
    }
    return acc;
};

let createRow = (op, token, stringArg, args) => {
    let o = {
        op,
        isLeaf: true,
        size: 1,
        token,
        str: stringArg,
        args: args,
    };
    o.first = o;
    o.last = o;
    return o;
};

let flattenBytecode = (buffer) => {
    let q = [buffer];
    let output = [];
    while (q.length) {
        let current = q.pop();
        if (current.isLeaf) {
            output.push(current);
        } else {
            q.push(current.right, current.left);
        }
    }

    return output.map(row => {
        return {
            op: row.op,
            str: row.str,
            token: row.token,
            args: row.args,
            arg0: row.args[0] || 0,
        };
    });
};
