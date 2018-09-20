import * as css from './index.css';
import $ from 'jquery';
import Raphael from 'raphael';

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
    listeners: {[name: string]: (event: any) => any} = {};
    box: RaphaelElement | undefined = undefined;

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

        let onDragstart = function(event: any) {
            event.preventDefault();
            if (event.button == 0) {
                // console.log('dwww....');
                ox = event.clientX? event.clientX : 0;
                oy = event.clientY? event.clientY : 0;

                // that.dom.style.pointer = 'hand';
                $(document).bind('mousemove', onDrag);
                $(document).bind('mouseup', onDragend);
            }
        }

        let onDragend = function(event: any) {
            event.preventDefault();
            // console.log('uppp...');
            // that.dom.style.pointer = '';
            $(document).unbind('mousemove', onDrag);
            $(document).unbind('mouseup', onDragend);
        }

        let onDrag = function(event: any) {
            event.preventDefault();
            if (event.button == 0) {
                // console.log('mvvv...');
                let x = event.clientX? event.clientX - ox : 0;
                let y = event.clientY? event.clientY - oy : 0;
                let it = that.dom;
                that.x += x;
                that.y += y;
                it.style.left = `${that.x + x}px`;
                it.style.top = `${that.y + y}px`;
                ox = ox + x;
                oy = oy + y;

                onMove(event);
            } 
        }

        let onMove = function(event: any) {
            if (that.box) {
                that.box.attr("x", that.x + 2);
                that.box.attr("y", that.y + 2);
                that.box.attr("width", that.dom.clientWidth - 4);
                that.box.attr("height", that.dom.clientHeight - 4);
            }
            if (that.listeners['onMove']) {
                return that.listeners['onMove'](event);
            }
            
            return false;
        }

        let onResize = function(event: any) {
            if (that.box) {
                that.box.attr("width", that.dom.clientWidth - 4);
                that.box.attr("height", that.dom.clientHeight - 4);
            }
            if (that.listeners['onResize']) {
                return that.listeners['onResize'](event);
            }
            
            return false;
        }

        $(this.dom).bind('mousedown', onDragstart);
    }

    destructor() {
        if (this.box) {
            this.box.remove();
        }
        this.dom.remove();
    }

    addListener(name: string, func: (event: any) => any) {
        this.listeners[name] = func;
    }

    addContent(content: IContent) {
        this.content = content;
        this.content.refresh($(this.dom).children().last()[0]) ;
    }

    setBox(box: RaphaelElement) {
        this.box = box;
    }
}


export class DPaper {
    name: string;
    raphael: RaphaelPaper;
    container: HTMLElement;
    diagrams: Diagram[] = [];

    constructor(container: HTMLElement, name: string) {
        this.container = container;
        this.name = name;
        this.raphael = Raphael(container, container.clientWidth, container.clientHeight);

        $(window).resize(() => {
            let x = document.documentElement.clientWidth;
            let y = Math.max(document.body.clientHeight, document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            this.raphael.setSize(x, y);
            for(let d of this.diagrams) {
                if (d.box) {
                    d.box.attr('width', d.dom.clientWidth-4);
                    d.box.attr('height', d.dom.clientHeight-4);
                }
            }
            // console.log(`resize: document.body.clientHeight = ${document.body.clientHeight}, document.documentElement.clientHeight = ${document.documentElement.clientHeight}`);
            // console.log(`resize: document.body.scrollHeight = ${document.body.scrollHeight}, document.documentElement.scrollHeight = ${document.documentElement.scrollHeight}`);
            // console.log(`resize: document.body.offsetHeight = ${document.body.offsetHeight}, document.docuemntElement.offsetHeight = ${document.documentElement.offsetHeight}`);
        });

        $(window).scroll(() => {
            let x = document.documentElement.clientWidth;
            let y = Math.max(document.body.clientHeight, document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            this.raphael.setSize(x, y);
            // console.log(`scroll: document.body.clientHeight = ${document.body.clientHeight}, document.documentElement.clientHeight = ${document.documentElement.clientHeight}`);
            // console.log(`scroll: document.body.scrollHeight = ${document.body.scrollHeight}, document.documentElement.scrollHeight = ${document.documentElement.scrollHeight}`);
            // console.log(`scroll: document.body.offsetHeight = ${document.body.offsetHeight}, document.docuemntElement.offsetHeight = ${document.documentElement.offsetHeight}`);
        });
    }

    addDiagram(diagram: Diagram) {
        diagram.setBox(this.raphael.rect(diagram.dom.offsetLeft+2, diagram.dom.offsetTop+2, diagram.dom.clientWidth-4, diagram.dom.clientHeight-4));
        this.diagrams.push(diagram);
    }

    findDiagram(name: string): Diagram | undefined {
        for(let diagram of this.diagrams) {
            if (diagram.name == name) {
                return diagram;
            }
        }
    }

    removeDiagram(name: string): Diagram | undefined {
        for(let i = 0, ln = this.diagrams.length; i < ln; i++) {
            if (this.diagrams[i].name == name) {
                return this.diagrams.splice(i, 1)[0];
            }
        }
    }

}