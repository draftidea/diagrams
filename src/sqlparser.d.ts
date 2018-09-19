
export interface SQLField {
    name: string;
    type: string;
    null: string;
    default: string;
    extra: string;
    comment: string;
}

export interface SQLIndex {
    name: string;
    type: string;
    algorithm: string;
    field: string;
}

export interface SQLConstraint  {
    name: string; 
    type: string;
    field: string;
    ref_table: string;
    ref_field: string;
    on_delete: string;
    on_update: string;
}

export interface SQLTable {
    name: string;
    engine: string;
    comment: string;
    charset: string;
    fields: Array<SQLField>;
    indexs: Array<SQLIndex>;
    constraints: Array<SQLConstraint>;
}

export function parseSQL(sql: string): SQLTable;


