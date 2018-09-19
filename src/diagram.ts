import * as css from './index.css';
import $ from 'jquery';

interface IContent {
    refresh(container: HTMLElement): void;
}

export class Diagram {
    container: HTMLElement;
    name: string;
    dom: HTMLElement;
    x: number = 0; y: number = 0; 
    lendPoint: Array<Diagram> = [];
    rendPoint: Array<Diagram> = [];
    content: any;

    constructor(container: HTMLElement, name: string, x:number, y:number) {
        this.container = container;
        this.name = name;
        this.x = x;
        this.y = y;

        let htm = `<div id="${this.name}" class="${css.diagram} ${css.shadow}" style="left: ${this.x}px; top: ${this.y}px;">
            <div class="${css.diagram_head}"><i class="fa fa-table"></i><span class="${css.span_text}">${this.name}</span></div>
            <div class="${css.diagram_body}"></div>
        </div>`;
        this.dom = $(htm)[0];
        $(container).append($(this.dom));

        let ox = 0;
        let oy = 0;
        let that = this;

        let dragstart = function(event: any) {
            event.preventDefault();
            if (event.button == 0) {
                // console.log('dwww....');
                ox = event.clientX? event.clientX : 0;
                oy = event.clientY? event.clientY : 0;

                // that.dom.style.pointer = 'hand';
                $(document).bind('mousemove', drag);
                $(document).bind('mouseup', dragend);
            }
        }

        let drag = function(event: any) {
            event.preventDefault();
            if (event.button == 0) {
                // console.log('mvvv...');
                let x = event.clientX? event.clientX - ox : 0;
                let y = event.clientY? event.clientY - oy : 0;
                let it = that.dom;
                it.style.left = `${it.offsetLeft + x}px`;
                it.style.top = `${it.offsetTop + y}px`;
                ox = ox + x;
                oy = oy + y;
            } 
        }

        let dragend = function(event: any) {
            event.preventDefault();
            // console.log('uppp...');
            // that.dom.style.pointer = '';
            $(document).unbind('mousemove', drag);
            $(document).unbind('mouseup', dragend);
        }

        $(this.dom).bind('mousedown', dragstart);

    }

    addContent(content: IContent) {
        this.content = content;
        this.content.refresh($(this.dom).children().last()[0]) ;
    }


}
