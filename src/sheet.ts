import * as css from './index.css';
import $ from 'jquery';

export enum FieldType {LIST, TEXT, CHECK}

interface FieldData {
    name: string;
    value: string | number;
    type: FieldType;
}

interface RowData {
    fields: Array<FieldData>;
}

type ColumnEditFunc = (event: any) => void;

class Field {
    parent: Row;
    data: FieldData;
    dom: HTMLElement;
    editFunc: ColumnEditFunc | undefined = undefined;

    constructor(row: Row, data: FieldData) {
        this.parent = row;
        this.data = data;

        let htm = `<td name="${this.data.name}" data-type="${this.data.type}">${this.data.value}</td>`;
        this.dom = $(htm)[0];
        $(this.parent.dom).append($(this.dom));

        let that = this;
        let edit = function(event: any) {
            if (event.target != that.dom) {
                return false;
            }
            if (that.editFunc) {
                that.editFunc(event);
            }
        }

        $(this.dom).bind('dblclick', edit);
    }

    setFieldEditFunc(func: ColumnEditFunc) {
        this.editFunc = func;
    }
}

class Row {
    parent: Sheet;
    data: RowData;
    fields: Array<Field> = [];
    dom: HTMLElement;

    constructor(sheet: Sheet, data: RowData) {
        this.parent = sheet;
        this.data = data;

        let htm = `<tr></tr>`;
        this.dom = $(htm)[0];
        $(this.parent.dom).append($(this.dom));

        this.data.fields.map((f, i) => {
            let fd = new Field(this, f);
            if (sheet.colEditor){
                fd.setFieldEditFunc(sheet.colEditor[i]);
            }
            this.fields.push(fd);
        });
    }

    bindColumnEditFunc() {
        this.fields.forEach((f, i) => {
            if (this.parent.colEditor) {
                f.setFieldEditFunc(this.parent.colEditor[i]);
            }
        })
    }
}

type EditorFunc = {[col: number]: ColumnEditFunc};

export class Sheet {
    name: string;
    rows: Array<Row> = [];
    dom: HTMLElement;
    container: HTMLElement | undefined;
    colEditor: EditorFunc | undefined = undefined;

    constructor(name: string, container?: HTMLElement) {
        this.container = container;
        this.name = name;
        let htm = `<table id="${this.name}" class="${css.sheet}"></table>`;
        this.dom = $(htm)[0];
    }

    addRow(row: RowData) {
        let rw = new Row(this, row);
        this.rows.push(rw);
        let htm = row.fields.map((f, i, a) => {
            return `<td data-sn="${i}" data-type="${f.type}">${f.value}</td>`;
        }).reduce((p, c, i, a)=>{return p + c});
        // htm = `<tr data-sn="${this.rows.length}">${htm}</tr>`;
        $(rw.dom).attr('data-sn', this.rows.length);
        rw.bindColumnEditFunc();
    }

    delRow(n: number) {
        this.rows.splice(n, 1);
        let trs = $(this.dom).find('tr');
        for(let i = 0, l = trs.length; i < l; i++) {
            let tsn = $(trs[i]).attr('data-sn');
            if((''+n) == tsn) {
                trs[i].remove();
                break;
            }
        }
    }

    addColumnEditors(editors: EditorFunc) {
        this.colEditor = editors;
        this.rows.forEach((f, i)=>{
            f.bindColumnEditFunc();
        });
    }
}