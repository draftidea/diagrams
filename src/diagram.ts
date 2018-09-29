import * as css from './index.css';
import $ from 'jquery';
import Raphael from 'raphael';
import { realpath } from 'fs';

interface IContent {
    dom: HTMLElement;
}

export enum RelationType {
    FOREIGN_KEY, ASSOCIATION
}

export class Relation {
    paper: DPaper;
    name: string;
    type: RelationType;
    srcField: string;
    srcDiagram: Diagram;
    dstDiagram: Diagram;
    dstField: string;
    path: RaphaelPath | undefined;

    constructor(paper: DPaper, name: string, type: RelationType, srcDiagram: Diagram, dstDiagram: Diagram, srcField: string, dstField: string) {
        this.paper = paper;
        this.name = name;
        this.srcField = srcField;
        this.type = type;
        this.srcDiagram = srcDiagram;
        this.dstDiagram = dstDiagram;
        this.dstField = dstField;
    }

    redraw() {
        if (this.path) {
            this.path.remove();
        }
        this.draw();
    }

    draw() {
        let x0 =  this.srcDiagram.box!.attr('x');
        let y0 = this.srcDiagram.box!.attr('y');
        let w0 = this.srcDiagram.box!.attr('width');
        let h0 = this.srcDiagram.box!.attr('height');
        let pointTop0 = {x: x0 + w0 / 2, y: y0};
        let pointBottom0 = {x: x0 + w0 / 2, y: y0 + h0};
        let pointLeft0 = {x: x0, y: y0 + h0 / 2};
        let pointRight0 = {x: x0 + w0,  y: y0 + h0 / 2};

        let x1 = this.dstDiagram.box!.attr('x');
        let y1 = this.dstDiagram.box!.attr('y');
        let w1 = this.dstDiagram.box!.attr('width');
        let h1 = this.dstDiagram.box!.attr('height');
        let pointTop1 = {x: x1 + w1 / 2 , y: y1};
        let pointBottom1 = {x: x1 + w1 / 2 , y: y1 + h1};
        let pointLeft1 = {x: x1, y: y1 + h1 / 2};
        let pointRight1 = {x: x1 + w1, y: y1 + h1 / 2};

        let lineStr = `M${pointTop0.x} ${pointTop0.y} L${pointTop1.x} ${pointTop1.y} z`;
        this.path = this.paper.raphael.path(lineStr); 
    }

    get(name: string) {
        return this;
    }
    
}

export class Diagram {
    paper: DPaper;
    container: HTMLElement;
    name: string;
    dom: HTMLElement;
    x: number = 0; y: number = 0; 
    
    content: any;
    listeners: {[name: string]: (event: any) => any} = {};
    box: RaphaelElement | undefined = undefined;

    constructor(paper: DPaper, container: HTMLElement, name: string, x:number, y:number) {
        this.paper = paper;
        this.container = container;
        this.name = name;
        this.x = x;
        this.y = y;

        let htm = `<div id="${this.name}" class="${css.diagram} ${css.shadow}" style="left: ${this.x}px; top: ${this.y}px;">
            <div class="${css.diagram_head}"><div class="${css.head_title}"><i class="fa fa-table"></i><span class="${css.span_text}">${this.name}</span></div><div class="${css.head_icons}"><a><i class="fa fa-window-minimize"></i></a></div></div>
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

        let redrawRelation = function() {
            let relations = that.paper.findRelation(that.name) ;
            for(let relation of relations) {
                relation.redraw();
            }
        }

        let onMove = function(event: any) {
            if (that.box) {
                that.box.attr("x", that.x + 2);
                that.box.attr("y", that.y + 2);
                that.box.attr("width", that.dom.clientWidth - 4);
                that.box.attr("height", that.dom.clientHeight - 4);
            }
            redrawRelation();
            if (that.listeners['onMove']) {
                return that.listeners['onMove'](that);
            }
            return false;
        }

        let onResize = function(event: any) {
            if (that.box) {
                that.box.attr("width", that.dom.clientWidth - 4);
                that.box.attr("height", that.dom.clientHeight - 4);
            }
            redrawRelation();
            if (that.listeners['onResize']) {
                return that.listeners['onResize'](that);
            }
            return false;
        }

        $(this.dom).find('a').last().click((event) => {
            // console.log('click...');
            let ii = $(event.target);
            // console.log(ii);
            if (ii.hasClass('fa-window-minimize')) {
                ii.removeClass('fa-window-minimize');
                ii.addClass('fa-window-maximize');
                ii.parent().parent().parent().siblings(`div.${css.diagram_body}`).last().show();
                onResize(event);
            } else {
                ii.removeClass('fa-window-maximize');
                ii.addClass('fa-window-minimize'); 
                ii.parent().parent().parent().siblings(`div.${css.diagram_body}`).last().hide();
                onResize(event);
            }
        })
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
        let slc = `div.${css.diagram_body}`;
        let bd = $(this.dom).children(slc).last();
        bd.empty().append(this.content.dom).hide();
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
    relations: Relation[] = [];

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
        });

        $(window).scroll(() => {
            let x = document.documentElement.clientWidth;
            let y = Math.max(document.body.clientHeight, document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            this.raphael.setSize(x, y);
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

    addRelation(relation: Relation) {
        this.relations.push(relation);
        relation.draw();
    }
    
    findRelation(name: string): Relation[]{
        let result = [];
        for(let relation of this.relations) {
            if (relation.srcDiagram.name == name || relation.dstDiagram.name == name){
                result.push(relation);
            }
        }
        return result;
    }


}