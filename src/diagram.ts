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
    circles: RaphaelElement[] = [];

    constructor(paper: DPaper, name: string, type: RelationType, srcDiagram: Diagram, dstDiagram: Diagram, srcField: string, dstField: string) {
        this.paper = paper;
        this.name = name;
        this.srcField = srcField;
        this.type = type;
        this.srcDiagram = srcDiagram;
        this.dstDiagram = dstDiagram;
        this.dstField = dstField;
    }

    destructor() {
        if (this.path) {
            this.path.remove();
        }
        for(let circle of this.circles) {
            if (circle) {
                circle.remove();
            }
        }
        this.circles = [];
    }

    redraw() {
        if (this.path) {
            this.path.remove();
        }
        for(let circle of this.circles) {
            if (circle) {
                circle.remove();
            }
        }
        this.circles = [];
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
        
        
        let src_top = pointTop0;
        let src_rgt = pointRight0;
        let src_btm = pointBottom0;
        let dst_top = pointTop1;
        let dst_lft = pointLeft1;
        let dst_btm = pointBottom1;
        if (x0 > x1) {
            src_top = pointTop1;
            src_rgt = pointRight1;
            src_btm = pointBottom1;
            dst_top = pointTop0;
            dst_lft = pointLeft0;
            dst_btm = pointBottom0;
        }
        let src_ctr = {x: src_top.x, y: src_rgt.y};
        let dst_ctr = {x: dst_top.x, y: dst_lft.y};
        let tg = -(dst_ctr.y - src_ctr.y) / (dst_ctr.x - src_ctr.x);

        let src_p = src_rgt
        let dst_p = dst_lft;
        
        let mdl_p1 = {x: src_p.x + 10, y: src_p.y};
        let mdl_p2 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: src_p.y};
        let mdl_p3 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: dst_p.y};
        let mdl_p4 = {x: dst_p.x - 10 , y: dst_p.y}; 

        if (tg <= 1 && tg >= -1) {
            console.log(1)
            src_p = src_rgt
            dst_p = dst_lft;
            if ((dst_ctr.x - src_ctr.x - 8) <  ((w0 + w1) / 2)) {
                if (tg >= 0) {
                    console.log(11);
                    src_p = src_top;
                    dst_p = dst_top;
                    mdl_p1 = {x: src_p.x, y: src_p.y - 10};
                    mdl_p2 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: src_p.y -10};
                    mdl_p3 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: dst_p.y - 10};
                    mdl_p4 = {x: dst_p.x , y: dst_p.y - 10};
                } else {
                    console.log(12);
                    src_p = src_btm;
                    dst_p = dst_btm;
                    console.log(src_p);

                    mdl_p1 = {x: src_p.x, y: src_p.y + 10};
                    mdl_p2 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: src_p.y + 10};
                    mdl_p3 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: dst_p.y + 10};
                    mdl_p4 = {x: dst_p.x , y: dst_p.y + 10};
                }
            }
        } else {
            console.log(2);
            if (tg > 0) {
                console.log(21);
                src_p = src_top;
                dst_p = dst_lft;
                if ((dst_ctr.x - src_ctr.x - 8) <  ((w0 + w1) / 2)) {
                    console.log(211);
                    dst_p = dst_top;
                    mdl_p1 = {x: src_p.x, y: src_p.y - 10};
                    mdl_p2 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: src_p.y - 10};
                    mdl_p3 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: dst_p.y - 10};
                    mdl_p4 = {x: dst_p.x, y: dst_p.y - 10 };
                }
            } else {
                console.log(22);
                src_p = src_btm;
                dst_p = dst_lft;
                if ((dst_ctr.x - src_ctr.x) <  ((w0 + w1) / 2)) {
                    console.log(221);
                    dst_p = dst_btm;
                    mdl_p1 = {x: src_p.x, y: src_p.y + 10};
                    mdl_p2 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: src_p.y + 10};
                    mdl_p3 = {x: src_p.x + (dst_p.x - src_p.x) / 2, y: dst_p.y + 10} ;
                    mdl_p4 = {x: dst_p.x , y: dst_p.y + 10};
                }
            }
        }

        console.log(src_p);
        let lineStr = `M${src_p.x} ${src_p.y} L${mdl_p1.x} ${mdl_p1.y}L${mdl_p2.x} ${mdl_p2.y} L${mdl_p3.x} ${mdl_p3.y} L${mdl_p4.x} ${mdl_p4.y} L${dst_p.x} ${dst_p.y} `;
        console.log(lineStr);
        this.path = this.paper.raphael.path(lineStr); 
        this.circles.push(this.paper.raphael.circle(src_p.x, src_p.y, 6).attr({fill: "#000"}));
        this.circles.push(this.paper.raphael.circle(dst_p.x, dst_p.y, 6).attr({fill: "#000"}));
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

    redraw(x: number, y:number) {
        this.x = x;
        this.y = y;
        this.dom.style.left = `${this.x}px`;
        this.dom.style.top = `${this.y}px`;
        if (this.box) {
            this.box.attr("x", this.x + 2);
            this.box.attr("y", this.y + 2);
            this.box.attr("width", this.dom.clientWidth - 4);
            this.box.attr("height", this.dom.clientHeight - 4);
        }
        let relations = this.paper.findRelation(this.name) ;
        for(let relation of relations) {
            relation.redraw();
        }
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

export class WPage {
    bar: CtrlBar;
    paper: DPaper;

    constructor(barId: string, paperId: string) {
        this.bar = new CtrlBar($(`#${barId}`)[0], 'bar');
        this.paper = new DPaper($(`#${paperId}`)[0], 'paper');
    }
}

export class CtrlBar {
    name: string;
    container: HTMLElement;

    constructor(container: HTMLElement, name: string) {
        this.container = container;
        this.name = name;

        let ul = $('<ul></ul>');

        let btn1 = $('<a title="open model file"><i class="fa fa-folder-open"></i></a>').click((event)=>{
            console.log('open model file');
        });
        let li1 = $('<li></li>').append(btn1);
        ul.append(li1);

        let btn2 = $('<a title="save model file"><i class="fa fa-floppy-o"></i></a>').click((event) => {
            console.log("save model file");
        });
        let li2 = $('<li></li>').append(btn2);
        ul.append(li2);

        ul.append($('<li class="spliter">|</li>'));


        $(this.container).append(ul);
        $(this.container).addClass(css.bar);

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

        $(this.container).addClass(css.paper);

        $(window).resize(() => {
            let x = document.documentElement.clientWidth;
            let y = Math.max(document.body.clientHeight, document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
            this.raphael.setSize(x, y);
            let col = Math.floor(this.raphael.width / 200);
            let i = 0;
            for(let d of this.diagrams) {
                d.redraw(i % col * 200, Math.floor(i / col) * 200 + 60);
                i += 1;
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