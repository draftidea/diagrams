import $ from 'jquery';
import { Diagram } from "./diagram";
import { Sheet, FieldType } from './sheet'
import { DBTable, DBTabelField, DBTableConstraint, DBTableIndex, ERModel } from './ermodel';
import * as mysql from 'mysql';
// import {Promise} from 'es6-promise';
import fs from 'fs';

export interface DBConnOption {
    host: string ;
    port: number ;
    database: string;
    user: string;
    password: string;
    multipleStatements: boolean;
    timeout: number;
}

function doQuery(sql: string, conn: mysql.Connection): Promise<any[]> {
    return new Promise((resolve, reject) => {
        conn.query(sql, (err: mysql.MysqlError, rss: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(rss);
            }
        })
    });
}

async function loadModelFromDB(connConfig: DBConnOption): Promise<ERModel> {
    let ermodel = new ERModel('ermodel', connConfig.host, `${connConfig.port}`, connConfig.database, connConfig.user, connConfig.password);

    let conn = mysql.createConnection(connConfig);
    conn.connect(err => {
        if (err) {
            console.log('connect db fail: ${err}');
        }
    });

    const rss1: any[] = await doQuery("show tables", conn);
    let sqls: string[] = [];
    rss1.forEach(rs => {
        sqls.push('show create table ' + rs['Tables_in_' + connConfig.database]);
    });
    let multiSqls = sqls.join(';');
    const rss2 = await doQuery(multiSqls, conn);
    conn.end();
    rss2.forEach(rs => {
        let table = new DBTable();
        table.parse(rs[0]['Create Table']);
        ermodel.add(table);
    })
    return Promise.resolve(ermodel);
}

async function loadModelFromJson(filename: string): Promise<ERModel> {
    let jsonstr: string = '';
    let readstream = fs.createReadStream(filename, { flags: 'r', encoding: 'utf-8' })
    return new Promise<ERModel>((resolve, reject) => {
        readstream.on('readable', () => {
            let chunk;
            while ((chunk = readstream.read()) != null) {
                jsonstr = jsonstr + chunk;
            }
        }).on('end', () => {
            resolve(JSON.parse(jsonstr));
        });
    });
}

export function loadModel(source: string | DBConnOption, callback: (err?: Error, model?: ERModel) => void) {
    if (typeof source == 'string') {
        let p0 = loadModelFromJson(source);
        p0.then(mdl => callback(undefined, mdl)).catch(err => callback(err, undefined));
    } else {
        let p1 = loadModelFromDB(source);
        p1.then(mdl => callback(undefined, mdl)).catch(err => callback(err, undefined));
    }
}

function buildSheetFromTable(table: DBTable): Sheet {
    let sheet = new Sheet(table.name);
    for(const fld of table.fields) {
        let row = {fields: [
            {name: 'name', value: fld.name, type: FieldType.TEXT},
            {name: 'type', value: fld.type, type: FieldType.LIST},
            {name: 'length', value: fld.length, type: FieldType.TEXT},
            {name: 'key', value: fld.key, type: FieldType.TEXT},
            {name: 'allow null', value: fld.allowNull, type: FieldType.TEXT},
            {name: 'default', value: fld.defaultVal, type: FieldType.TEXT},
            {name: 'extra', value: fld.extra, type: FieldType.TEXT},
            {name: 'comment', value: fld.comment, type: FieldType.TEXT}
        ]};
        sheet.addRow(row);
    }

    let textEditFunc =  function(obj: HTMLElement) {
        let vlu = $(obj).text();
        let nd = `<input type="text" value="${vlu}"></input>`;
        $(obj).empty().html(nd).find('input:first').focus(function(){
            this.focus();
        }).blur(function(){
            let v = <string>$(this).val();
            $(this).parent().empty().text(v);
        }).focus();
    };

    sheet.addColumnEditors({
        0: function(event) {
            textEditFunc(event.target);
        },
        1: function(event) {
            let nm = $(event.target).attr('name');
            let vl = $(event.target).text();
            let tp = $(event.target).attr('data-type');
            let nd = `<select> <option value="int">int</option>
                                <option value="bigint">bigint</option>
                                <option value="varchar">varchar</option>
                                <option value="datetime">datetime</option>
                                <option value="bit">bit</option> </select>`;
            let $nd = $(event.target).empty().html(nd).find('select:first').focus(function(){
                this.focus();
            }).blur(function(){
                let v = <string>$(this).children('option:selected').val();
                $(this).parent().empty().text(v);
            }).focus().find('option').each(function(){
                let v = <string>$(this).val();
                if (v == vl) {
                    $(this).attr('selected', 'selected');
                }
            });
        },
        2: function(event) {
            textEditFunc(event.target);
        },
        3: function(event) {
            textEditFunc(event.target);
        },
        4: function(event) {
            textEditFunc(event.target);
        },
        5: function(event) {
            textEditFunc(event.target);
        },
        6: function(event) {
            textEditFunc(event.target);
        },
        7: function(event) {
            textEditFunc(event.target);
        },
    })
    return sheet;
}

export function showModel(model: ERModel) {
    let i = 0;
    let diagrams = [];
    for (const key in model.dbTables) {
        let table = model.dbTables[key];
        let diagram = new Diagram($('#paper')[0], key, i % 5 * 200, i / 5 *200);
        diagram.addContent(buildSheetFromTable(table));
        diagrams.push(diagram);
        i = i + 1;
    }
    console.log(diagrams);
}

// sheet.addRow({fields: [
//     {name: "col1", value: "12", type: FieldType.TEXT},
//     {name: "col2", value: "22", type: FieldType.TEXT},
//     {name: "col3", value: "33", type: FieldType.TEXT}
// ]});

// // let editors : {[col: number]: (event: any) => void} = {};
// // editors[0] = function(event){ console.log('column 1 click...')};
// // editors[1] = function(event){ console.log('column 2 click...')};
// // editors[2] = function(event){ console.log('column 3 click...')};

// sheet.addColumnEditors({
//     0: function(event) {
//         let nm = $(event.target).attr('name');
//         let vl = $(event.target).text();
//         let tp = $(event.target).attr('data-type');
//         console.log('click [name= ' + nm + '], [type = ' + tp +'], [value = ' + vl + ']');
//     },
//     1: function(event) {
//         let nm = $(event.target).attr('name');
//         let vl = $(event.target).text();
//         let tp = $(event.target).attr('data-type');
//         console.log('click [name= ' + nm + '], [type = ' + tp +'], [value = ' + vl + ']');
//     },
//     2: function(event) {
//         let nm = $(event.target).attr('name');
//         let vl = $(event.target).text();
//         let tp = $(event.target).attr('data-type');
//         console.log('click [name= ' + nm + '], [type = ' + tp +'], [value = ' + vl + ']');
//     }
// });