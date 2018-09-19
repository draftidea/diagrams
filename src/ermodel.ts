import {parseSQL} from './sqlparser';

export class DBTabelField {
    name: string;
    type: string;
    length: number;
    key: string;
    allowNull: string;
    defaultVal: string;
    extra: string;
    comment: string;

    constructor(name: string, type: string, length: number, key: string, allowNull: string, defaultVal: string, extra: string, comment: string) {
        this.name = name;
        this.type = type;
        this.length = length;
        this.key = key;
        this.allowNull = allowNull;
        this.defaultVal = defaultVal;
        this.extra = extra;
        this.comment = comment;
    }
}

export class DBTableIndex {
    name: string ;
    type: string ;
    algorithm: string ;
    field: string ;

    constructor(name: string, type: string, algorithm: string, field: string) {
        this.name = name;
        this.type = type;
        this.algorithm = algorithm;
        this.field = field;
    }
}

export class DBTableConstraint {
    name: string ; 
    type: string;
    field: string;
    refTable: string;
    refField: string;
    onDelete: string;
    onUpdate: string;

    constructor(name: string, type: string, field: string, refTable: string, refField: string, onDelete: string, onUpdate: string) {
        this.name = name;
        this.type = type;
        this.field = field;
        this.refField = refField;
        this.refTable = refTable;
        this.onDelete = onDelete;
        this.onUpdate = onUpdate;
    }
}

export class DBTable {
    name: string = "";
    engine: string = "InnoDB";
    charset: string = "UTF-8";
    comment: string = "";
    indexs: Array<DBTableIndex> = [];
    fields: Array<DBTabelField> = [];
    constraints: Array<DBTableConstraint> = [];
    constructor(name?: string, engine?:string, charset?: string, comment?:string) {
        if (name) {
            this.name = name;
        }
        if (engine) {
            this.engine = engine;
        }
        if (charset) {
            this.charset = charset;
        }
        if (comment) {
            this.comment = comment;
        }
    }

    parse(sql: string) {
        let table = parseSQL(sql)
        this.name = table.name;
        this.engine = table.name;
        this.charset = table.charset;
        this.comment = table.comment;

        if (!this.fields) {
            this.fields = [];
        }
        table.fields.forEach((f, i) => {
            let tp = f.type;
            let ln = 0;
            if(tp.indexOf("(") > 0) {
                let tn = tp.substr(tp.indexOf('('));
                tp = tp.replace(tn, '');
                ln = parseInt(tn.replace('(', '').replace(')',''), 10);
            }
            this.fields.push(new DBTabelField(f.name, tp, ln, "", f.null, f.default, f.extra, f.comment));
        });

        table.indexs.forEach((x, i) => {
            this.indexs.push(new DBTableIndex(x.name, x.type, x.algorithm, x.field));
        });

        table.constraints.forEach((c, i) => {
            this.constraints.push(new DBTableConstraint(c.name, c.type, c.field, c.ref_table, c.ref_field, c.on_delete, c.on_update));
        })
    }

}

export class ERModel {
    name: string;
    dbHost: string;
    dbPort: string;
    dbName: string;
    dbUser: string;
    dbPassword: string;

    dbTables: {[name: string]: DBTable} = {};

    constructor(name: string, dbHost: string, dbPort: string, dbName: string, dbUser: string, dbPassword: string) {
        this.name = name;
        this.dbHost = dbHost;
        this.dbPort = dbPort;
        this.dbName = dbName;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
    }

    add(table: DBTable) {
        this.dbTables[table.name] = table;
    }

    get(name: string) : DBTable {
        return this.dbTables[name];
    }

    toJson(): string {
        return JSON.stringify(this);
    }


}