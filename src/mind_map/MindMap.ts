{
    interface IMindMapBindings {
        [key: string]: any;

        data: any;
    }

    const MindMapBindings: IMindMapBindings = {
        data: '<pipData'
    }

    class MindMapBindingsChanges implements ng.IOnChangesObject, IMindMapBindings {
        [key: string]: any;

        data: ng.IChangesObject < any > ;
    }

    class MindMapController implements ng.IController, IMindMapBindings {
        private duration: number = 750;
        private root: any;
        private margin: any = {
            top: 20,
            right: 120,
            bottom: 20,
            left: 120
        };
        private parent: JQuery;
        private height: number;
        private width: number;
        private viewerWidth: number = $(document).width();
        private viewerHeight: number = $(document).height();
        private svg: any;
        private zoomListener: any;
        private dropShadowFilter: any;
        private tree: d3.layout.Tree < any > ;
        private line: d3.svg.Line < any > ;
        private isDragLinkHead: boolean = false;
        private selectedLink: any = null;
        private newNode: any = null;
        private dragedCircle: any = null;
        private startPointOfHead: any = {
            x: null,
            y: null
        };
        private endPointOfHead: any = {
            x: null,
            y: null
        };
        private i: number = 0;

        public data: any[];

        constructor(
            private $element: JQuery
        ) {
            this.zoomListener = d3.behavior.zoom().scaleExtent([0.2, 2.5]).on('zoom', () => {
                this.zoom();
            });
        }

        public $onInit() {
            this.parent = this.$element.parent();
            this.height = this.parent.height();
            this.width = this.parent.width();

            this.initSvg();
            this.initArrowMarkers();
            this.initShadowFilter();

            // Init coordinates for root element TODO: maybe move to function
            this.root = this.data[0];
            this.root.x0 = this.height / 2;
            this.root.y0 = 0;

            this.centerNode(this.root);
            d3.select(self.frameElement).style("height", "500px");
        }

        public $onChanges(changes: MindMapBindingsChanges) {
            if (changes.data && changes.data.currentValue !== changes.data.previousValue) {
                this.data = changes.data.currentValue;
            }
        }

        private initSvg() {
            this.svg = d3
                .select(this.$element.get(0))
                .append("svg")
                .attr('id', 'root')
                .attr("width", this.viewerWidth)
                .attr("height", this.height - 4) // Minus 4 to avoid the appearance of a scroll
                .call(this.zoomListener)
                .append("g")
                .attr('class', 'baseG')
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        }

        private initArrowMarkers() {
            this.svg
                .append("marker")
                .attr({
                    "id": "arrow",
                    "viewBox": "0 -5 10 10",
                    "refX": 36,
                    "refY": 0,
                    "markerWidth": 4,
                    "markerHeight": 4,
                    "orient": "auto"
                })
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("class", "arrowHead");

            this.svg
                .append("marker")
                .attr({
                    "id": "arrowSelected",
                    "viewBox": "0 -5 10 10",
                    "refX": 52,
                    "refY": 0,
                    "markerWidth": 4,
                    "markerHeight": 4,
                    "orient": "auto"
                })
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("class", "arrowSelectedHead");
        }

        private initShadowFilter() {
            this.dropShadowFilter = this.svg.append('svg:filter')
                .attr('id', 'drop-shadow')
                .attr('height', '130%');
            this.dropShadowFilter.append('svg:feGaussianBlur')
                .attr('in', 'SourceAlpha')
                .attr('stdDeviation', 1)
                .attr('result', 'blur');
            this.dropShadowFilter.append('svg:feOffset')
                .attr('in', 'blur')
                .attr('dx', 0)
                .attr('dy', 2)
                .attr('result', 'offsetBlur');
            this.dropShadowFilter.append('svg:feComponentTransfer')
                .attr('in', 'offsetBlur')
                .attr('result', 'transfer')
                .append('svg:feFuncA')
                .attr('type', 'linear')
                .attr('slope', 0.4);
            this.dropShadowFilter.append('svg:feBlend')
                .attr('in', 'SourceGraphic')
                .attr('in2', 'transfer')
                .attr('mode', 'normal');
        }

        private update(source: any) {
            const updatePoints = () => {
                _.each(nodes, (d) => {
                    if (d.fx && d.fy) {
                        d.x = d.fx;
                        d.y = d.fy;
                    }
                });
            }

            const updateLinks = () => {
                const allLinks = this.svg.selectAll("path.link");

                allLinks
                    .attr('sx', function (d) {
                        return d.source.x;
                    })
                    .attr('sy', function (d) {
                        return d.source.y;
                    })
                    .attr('tx', function (d) {
                        return d.target.x;
                    })
                    .attr('ty', function (d) {
                        return d.target.y;
                    });
            }

            // Compute the new tree layout
            const nodes = this.tree.nodes(this.root).reverse(),
                links = this.tree.links(nodes);

            // Update the nodes…
            const node = this.svg.selectAll("g.node")
                .data(nodes, (d) => {
                    return d.id || (d.id = ++this.i);
                });

            updatePoints();

            const dragNodeVar = d3.behavior.drag()
                .origin(Object)
                .on("dragstart", (d: any) => {
                    this.removeLinkSelections();
                    d.dragThisTime = false;
                    d3.event['sourceEvent'].stopPropagation();
                })
                .on("dragend", (d: any) => {
                    updatePoints();
                    updateLinks();
                })
                .on("drag", (d: any) => {
                    this.dragNode(d);
                });

            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return getTransform(source);
                })
                .on("dblclick", (d) => {
                    this.dblclick(d);
                })
                .on("click", (d) => {
                    this.click(d);
                })
                .on("mouseover", (d) => {
                    this.mouseoverNode(d);
                })
                .on("mouseout", (d) => {
                    this.mouseoutNode(d);
                })
                .call(dragNodeVar);

            // Pattern to fill circle by avatar
            nodeEnter.append("pattern")
                .attr("id", (d) => {
                    return 'pattern-image-' + d.id;
                })
                .attr("height", 1)
                .attr("width", 1)
                .attr("x", "0")
                .attr("y", "0")
                .append('image')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', 64)
                .attr('width', 64)
                .attr("xlink:href", (d) => {
                    return d.img;
                });

            nodeEnter.append('circle')
                .attr('r', 16)
                .attr('class', 'substrate')
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .style('filter', 'url(#drop-shadow)');

            // Node circle
            nodeEnter.append('circle')
                .attr('r', 16)
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .attr('class', 'goal-avatar')
                .attr('fill', (d) => {
                    return "url(#pattern-image-" + d.id + ")";
                });

            // Name of the node
            nodeEnter
                .append("text")
                .attr("x", 36)
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .attr("text-anchor", "start")
                .text((d) => {
                    return d.title;
                })
                .call(this.getBB)
                .style("display", 'none');

            nodeEnter
                .append('svg:foreignObject')
                .attr('class', 'input-object')
                .attr("x", 33)
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .attr("y", -11)
                .attr("width", (d) => {
                    return d.bbox.width + 16
                })
                .attr("height", (d) => {
                    return d.bbox.height
                })
                .append('xhtml:input')
                .attr('disabled', true)
                .attr('value', (d) => {
                    return d.title;
                })
                .on('click', (d) => {
                    this.onNodeTextClick(d);
                })
                .on('keydown', (d) => {
                    this.onChangeNodeName(d);
                })
                .on('focus', (d) => {
                    d.changingName = true;
                })
                .on('blur', (d) => {
                    d.changingName = false;
                })
                .style('width', (d) => {
                    return (d.bbox.width + 16) + 'px'
                })
                .style('height', (d) => {
                    return (d.bbox.height) + 'px'
                });

            const getBB = (selection) => {
                _.each(selection, (d) => {
                    d.bbox = this.getBBox();
                })
            }

            const getTransform = (d) => {
                if (d.userDragged) {
                    return "translate(" + d.x + "," + d.y + ")";
                } else {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ", 0)";
                }
            }

            // Transition nodes to their new position.
            const nodeUpdate = node.transition()
                .duration(this.duration)
                .attr("transform", (d) => {
                    return getTransform(d);
                })
                .each('end', function (d, i) {
                    d.treeX = _.clone(d.x);
                    d.treeY = _.clone(d.y);

                    d.x = d3.transform(d3.select(this).attr("transform")).translate[0];
                    d.y = d3.transform(d3.select(this).attr("transform")).translate[1];

                    d.fx = d3.transform(d3.select(this).attr("transform")).translate[0];
                    d.fy = d3.transform(d3.select(this).attr("transform")).translate[1];
                    d.userDragged = true;
                });

            nodeUpdate.select("circle")
                .style("fill", (d) => {
                    return "url(" + d.img + ")";
                })
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .attr("r", '32px');

            nodeUpdate.select(".goal-avatar")
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .attr("r", '32px');

            nodeUpdate.select("foreignObject.input-object")
                .attr('transform', (d) => {
                    return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
                })
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit();
            nodeExit
                .select(".input-object")
                .style("opacity", 0);
            nodeExit
                .transition()
                .duration(this.duration)
                .attr("transform", (d) => {
                    return getTransform(source);
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 16)
                .style("fill-opacity", 0);

            // Update the links…
            const link = this.svg.selectAll("g.link-form")
                .data(links, (d) => {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter()
                .insert("g", "g")
                .attr('class', 'link-form')
                .insert("path")
                .attr("class", (d) => {
                    return "link arrow " + "to-" + d.target.id + " from-" + d.source.id;
                })
                .style("opacity", 0)
                .attr("d", () => {
                    return this.line(
                        [{
                                'x': source.y0,
                                'y': source.x0
                            },
                            {
                                'x': source.y0,
                                'y': source.x0
                            }
                        ]
                    )
                })
                .on('click', (d) => {
                    this.onLinkClick(d);
                });

            // Transition links to their new position.
            link
                .transition()
                .duration(this.duration)
                .select("path.link")
                .each('end', function (l, i) {
                    d3.select(this)
                        .attr({
                            "d": (d) => {
                                return this.line(
                                    [{
                                            'x': d.source.x,
                                            'y': d.source.y
                                        },
                                        {
                                            'x': d.target.x,
                                            'y': d.target.y
                                        }
                                    ]
                                );
                            }
                        })
                        .attr('sx', (d) => {
                            return d.source.x;
                        })
                        .attr('sy', (d) => {
                            return d.source.y;
                        })
                        .attr('tx', (d) => {
                            return d.target.x;
                        })
                        .attr('ty', (d) => {
                            return d.target.y;
                        })
                        .style("opacity", 1)
                        .attr({"marker-end": "url(#arrow)"});
                });

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .remove();

            // Stash the old positions for transition.
            _.each(nodes, (d) => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        private centerNode(source: any) {
            let scale = this.zoomListener.scale(),
                x = -source.x0,
                y = -source.y0;

            x = x * scale + this.viewerWidth / 2;
            y = y * scale + this.viewerHeight / 2;

            d3.select('.baseG').transition()
                .duration(this.duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            this.zoomListener.scale(scale);
            this.zoomListener.translate([x, y]);
        }

        private zoom() {
            this.svg.attr("transform", "translate(" + d3.event['translate'] + ")scale(" + d3.event['scale'] + ")");
        }
    }

    const MindMap: ng.IComponentOptions = {
        controller: MindMapController,
        bindings: MindMapBindings
    }

    angular.module('pipMindMap')
        .component('pipMindMap', MindMap);
}