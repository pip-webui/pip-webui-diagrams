(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.pip || (g.pip = {})).diagrams = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
require("./mind_map");
angular.module('pipDiagrams', [
    'pipMindMap'
]);
},{"./mind_map":3}],2:[function(require,module,exports){
{
    var MindMapBindings = {
        data: '<pipData'
    };
    var MindMapBindingsChanges = (function () {
        function MindMapBindingsChanges() {
        }
        return MindMapBindingsChanges;
    }());
    var MindMapController = (function () {
        function MindMapController($element) {
            var _this = this;
            this.$element = $element;
            this.duration = 750;
            this.margin = {
                top: 20,
                right: 120,
                bottom: 20,
                left: 120
            };
            this.viewerWidth = $(document).width();
            this.viewerHeight = $(document).height();
            this.isDragLinkHead = false;
            this.selectedLink = null;
            this.newNode = null;
            this.dragedCircle = null;
            this.startPointOfHead = {
                x: null,
                y: null
            };
            this.endPointOfHead = {
                x: null,
                y: null
            };
            this.i = 0;
            this.zoomListener = d3.behavior.zoom().scaleExtent([0.2, 2.5]).on('zoom', function () {
                _this.zoom();
            });
            this.initComponent();
        }
        MindMapController.prototype.initComponent = function () {
            this.parent = this.$element.parent();
            this.height = this.parent.height();
            this.width = this.parent.width();
            this.initSvg();
            this.initArrowMarkers();
            this.initShadowFilter();
            this.initCommonVars();
            if (!this.data || !_.isArray(this.data))
                return;
            this.setRoot();
            this.update(this.root);
            this.centerNode(this.root);
            d3.select(self.frameElement).style("height", "500px");
        };
        MindMapController.prototype.setRoot = function () {
            this.root = this.data[0];
            this.root.x0 = this.height / 2;
            this.root.y0 = 0;
        };
        MindMapController.prototype.$onChanges = function (changes) {
            if (changes.data && changes.data.currentValue !== changes.data.previousValue) {
                this.data = changes.data.currentValue;
                this.setRoot();
                this.update(this.root);
                this.centerNode(this.root);
            }
        };
        MindMapController.prototype.initSvg = function () {
            this.svg = d3
                .select(this.$element.get(0))
                .append("svg")
                .attr('id', 'root')
                .attr("width", this.viewerWidth)
                .attr("height", this.height - 4)
                .call(this.zoomListener)
                .append("g")
                .attr('class', 'baseG')
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        };
        MindMapController.prototype.initArrowMarkers = function () {
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
        };
        MindMapController.prototype.initShadowFilter = function () {
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
        };
        MindMapController.prototype.initCommonVars = function () {
            this.tree = d3.layout.tree()
                .size([this.viewerWidth, this.viewerHeight])
                .nodeSize([50, 600])
                .separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 2) / a.depth;
            });
            this.line = d3.svg.line()
                .x(function (d) {
                return d.x;
            })
                .y(function (d) {
                return d.y;
            })
                .interpolate('linear');
            console.log();
        };
        MindMapController.prototype.update = function (source) {
            var _this = this;
            if (!this.tree)
                return;
            var updatePoints = function () {
                _.each(nodes, function (d) {
                    if (d.fx && d.fy) {
                        d.x = d.fx;
                        d.y = d.fy;
                    }
                });
            };
            var updateLinks = function () {
                var allLinks = _this.svg.selectAll("path.link");
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
            };
            var getTransform = function (d) {
                if (d.userDragged) {
                    return "translate(" + d.x + "," + d.y + ")";
                }
                else {
                    return "rotate(" + (d.x - 90) + ")translate(" + d.y + ", 0)";
                }
            };
            var nodes = this.tree.nodes(this.root).reverse(), links = this.tree.links(nodes);
            var node = this.svg.selectAll("g.node")
                .data(nodes, function (d) {
                return d.id || (d.id = ++_this.i);
            });
            updatePoints();
            var dragNodeVar = d3.behavior.drag()
                .origin(Object)
                .on("dragstart", function (d) {
                _this.removeLinkSelections();
                d.dragThisTime = false;
                d3.event['sourceEvent'].stopPropagation();
            })
                .on("dragend", function (d) {
                updatePoints();
                updateLinks();
            })
                .on("drag", function (d) {
                _this.dragNode(d);
            });
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                return getTransform(source);
            })
                .on("dblclick", function (d) {
                _this.dblclickNode(d);
            })
                .on("click", function (d) {
                _this.clickNode(d);
            })
                .on("mouseover", function (d) {
                _this.mouseoverNode(d);
            })
                .on("mouseout", function (d) {
                _this.mouseoutNode(d);
            })
                .call(dragNodeVar);
            nodeEnter.append("pattern")
                .attr("id", function (d) {
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
                .attr("xlink:href", function (d) {
                return d.img;
            });
            nodeEnter.append('circle')
                .attr('r', 16)
                .attr('class', 'substrate')
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .style('filter', 'url(#drop-shadow)');
            nodeEnter.append('circle')
                .attr('r', 16)
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .attr('class', 'goal-avatar')
                .attr('fill', function (d) {
                return "url(#pattern-image-" + d.id + ")";
            });
            nodeEnter
                .append("text")
                .attr("x", 36)
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .attr("text-anchor", "start")
                .text(function (d) {
                return d.title;
            })
                .call(this.getBB)
                .style("display", 'none');
            nodeEnter
                .append('svg:foreignObject')
                .attr('class', 'input-object')
                .attr("x", 33)
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .attr("y", -11)
                .attr("width", function (d) {
                return d.bbox.width + 16;
            })
                .attr("height", function (d) {
                return d.bbox.height;
            })
                .append('xhtml:input')
                .attr('disabled', true)
                .attr('value', function (d) {
                return d.title;
            })
                .on('click', function (d) {
                _this.onNodeTextClick(d);
            })
                .on('keydown', function (d) {
                _this.onChangeNodeName(d);
            })
                .on('focus', function (d) {
                d.changingName = true;
            })
                .on('blur', function (d) {
                d.changingName = false;
            })
                .style('width', function (d) {
                return (d.bbox.width + 16) + 'px';
            })
                .style('height', function (d) {
                return (d.bbox.height) + 'px';
            });
            var nodeUpdate = node.transition()
                .duration(this.duration)
                .attr("transform", function (d) {
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
                .style("fill", function (d) {
                return "url(" + d.img + ")";
            })
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .attr("r", '32px');
            nodeUpdate.select(".goal-avatar")
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .attr("r", '32px');
            nodeUpdate.select("foreignObject.input-object")
                .attr('transform', function (d) {
                return d.userDragged ? "" : "rotate(" + (-d.x + 90) + ")";
            })
                .style("fill-opacity", 1);
            var nodeExit = node.exit();
            nodeExit
                .select(".input-object")
                .style("opacity", 0);
            nodeExit
                .transition()
                .duration(this.duration)
                .attr("transform", function (d) {
                return getTransform(source);
            })
                .remove();
            nodeExit.select("circle")
                .attr("r", 16)
                .style("fill-opacity", 0);
            var link = this.svg.selectAll("g.link-form")
                .data(links, function (d) {
                return d.target.id;
            });
            link.enter()
                .insert("g", "g")
                .attr('class', 'link-form')
                .insert("path")
                .attr("class", function (d) {
                return "link arrow " + "to-" + d.target.id + " from-" + d.source.id;
            })
                .style("opacity", 0)
                .attr("d", function () {
                return _this.line([{
                        'x': source.y0,
                        'y': source.x0
                    },
                    {
                        'x': source.y0,
                        'y': source.x0
                    }
                ]);
            })
                .on('click', function (d) {
                _this.onLinkClick(d);
            });
            link
                .transition()
                .duration(this.duration)
                .select("path.link")
                .each('end', function (l, i) {
                d3.select(d3.selectAll('path.link')[0][i])
                    .attr({
                    "d": function (d) {
                        return _this.line([{
                                'x': d.source.x,
                                'y': d.source.y
                            },
                            {
                                'x': d.target.x,
                                'y': d.target.y
                            }
                        ]);
                    }
                })
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
                })
                    .style("opacity", 1)
                    .attr({
                    "marker-end": "url(#arrow)"
                });
            });
            link.exit().transition().remove();
            _.each(nodes, function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        };
        MindMapController.prototype.dblclickNode = function (d) {
            this.removeLinkSelections();
            d3.event['stopPropagation']();
            if (d.children) {
                d._children = d.children;
                d.children = null;
            }
            else {
                d.children = d._children;
                d._children = null;
            }
            this.update(d);
            this.centerNode(d);
        };
        MindMapController.prototype.showNodeActions = function (element, d) {
            var _this = this;
            var positions = [{
                    x: 40,
                    y: -40
                }, {
                    x: 0,
                    y: -55
                }, {
                    x: -40,
                    y: -40
                }, {
                    x: -55,
                    y: 0
                }, {
                    x: -40,
                    y: 40
                }, {
                    x: 0,
                    y: 55
                }], curElement = d3.select($(element).parent('.node').get(0));
            curElement
                .attr('class', 'node selected')
                .select('.input-object')
                .attr("width", function (d) {
                return Math.min(d.bbox.width + 16, 250);
            })
                .attr("height", function (d) {
                return d.bbox.height + 16;
            })
                .attr("y", -19)
                .select('input')
                .attr('disabled', false)
                .style("width", function (d) {
                return Math.min(d.bbox.width + 16, 250) + 'px';
            })
                .style("height", function (d) {
                return (d.bbox.height + 16) + 'px';
            });
            for (var i = 0; i < 6; i++) {
                curElement
                    .append('circle')
                    .attr('r', 0)
                    .attr('actionNumber', i)
                    .attr('class', 'goal-action')
                    .attr('transform', function (d) {
                    return d.userDragged ? "" : "rotate(" + (-d.treeX + 90) + ")";
                })
                    .attr('cx', positions[i].x)
                    .attr('cy', positions[i].y)
                    .style('filter', 'url(#drop-shadow)')
                    .on('click', function (d) {
                    _this.onNodeActionClick(d, _this);
                })
                    .transition()
                    .duration(200 * (i + 1))
                    .attr('r', 16);
            }
            d.nodeSelected = true;
        };
        MindMapController.prototype.hideNodeActions = function (element, d) {
            var curElement = d3.select($(element).parent('.node').get(0));
            curElement
                .attr('class', 'node')
                .selectAll('.goal-action')
                .transition()
                .duration(this.duration - 400)
                .attr('r', 0)
                .remove();
            curElement
                .select('.input-object')
                .attr("y", -11)
                .attr("width", function (d) {
                return Math.min(d.bbox.width + 16, 250);
            })
                .attr("height", function (d) {
                return d.bbox.height;
            })
                .select('input')
                .attr('disabled', true)
                .style("width", function (d) {
                return Math.min(d.bbox.width + 16, 250) + 'px';
            })
                .style("height", function (d) {
                return d.bbox.height + 'px';
            });
            d.nodeSelected = false;
        };
        MindMapController.prototype.clickNode = function (d) {
            this.removeLinkSelections();
            if (d.dragThisTime)
                return;
            d.clicked = !d.clicked;
            d.clicked ? this.showNodeActions(d3.event['target'], d) : this.hideNodeActions(d3.event['target'], d);
        };
        MindMapController.prototype.onNodeTextClick = function (d) {
            if (d.nodeSelected) {
                d3.event['stopPropagation']();
            }
        };
        MindMapController.prototype.removeLinkSelections = function () {
            d3.selectAll('path.link')
                .attr({
                "marker-end": "url(#arrow)"
            })
                .classed('selected', false);
            d3.selectAll('.circleHead')
                .remove();
            this.selectedLink = null;
        };
        MindMapController.prototype.onChangeNodeName = function (d) {
        };
        MindMapController.prototype.onNodeActionClick = function (d, element) {
            d3.event['stopPropagation']();
            console.log('source: ', d);
            console.log('action number: ', element.attributes.actionNumber.value);
        };
        MindMapController.prototype.mouseoverNode = function (d) {
            if (this.isDragLinkHead) {
                console.log('dragedCircle.attributes.type.value', this.dragedCircle.attributes.type.value);
            }
        };
        MindMapController.prototype.mouseoutNode = function (d) {
            if (this.isDragLinkHead) {
                this.endPointOfHead.x = null;
                this.endPointOfHead.y = null;
                this.newNode = null;
            }
        };
        MindMapController.prototype.dragNode = function (d) {
            if (d.changingName)
                return;
        };
        MindMapController.prototype.dragLinkHead = function () {
        };
        MindMapController.prototype.onLinkClick = function (d) {
            var _this = this;
            this.removeLinkSelections();
            var dragLinkHeadVar = d3.behavior.drag()
                .origin(Object)
                .on("dragstart", function (draged) {
                d3.event['sourceEvent'].stopPropagation();
            })
                .on("dragend", function (draged) {
                _this.isDragLinkHead = false;
                var curLink = d3.select(_this.selectedLink);
            })
                .on("drag", function () {
                _this.dragLinkHead();
            });
            var drawHeadCircles = function () {
                d3.selectAll('.circleHead')
                    .remove();
                _this.svg
                    .append('circle')
                    .attr('class', 'circleHead')
                    .attr('r', 10)
                    .attr('type', 'end')
                    .attr('cx', _this.selectedLink.getPointAtLength(_this.selectedLink.getTotalLength() - 42).x)
                    .attr('cy', _this.selectedLink.getPointAtLength(_this.selectedLink.getTotalLength() - 42).y)
                    .call(dragLinkHeadVar);
                _this.svg
                    .append('circle')
                    .attr('class', 'circleHead')
                    .attr('r', 10)
                    .attr('type', 'start')
                    .attr('cx', _this.selectedLink.getPointAtLength(42).x)
                    .attr('cy', _this.selectedLink.getPointAtLength(42).y)
                    .call(dragLinkHeadVar);
            };
            this.selectedLink = this;
            drawHeadCircles();
        };
        MindMapController.prototype.getBB = function (selection) {
            selection.each(function (d) {
                d.bbox = this.getBBox();
            });
        };
        MindMapController.prototype.centerNode = function (source) {
            var scale = this.zoomListener.scale(), x = -source.x0, y = -source.y0;
            x = x * scale + this.viewerWidth / 2;
            y = y * scale + this.viewerHeight / 2;
            d3.select('.baseG').transition()
                .duration(this.duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            this.zoomListener.scale(scale);
            this.zoomListener.translate([x, y]);
        };
        MindMapController.prototype.zoom = function () {
            this.svg.attr("transform", "translate(" + d3.event['translate'] + ")scale(" + d3.event['scale'] + ")");
        };
        return MindMapController;
    }());
    var MindMap = {
        controller: MindMapController,
        bindings: MindMapBindings
    };
    angular.module('pipMindMap')
        .component('pipMindMap', MindMap);
}
},{}],3:[function(require,module,exports){
"use strict";
angular.module('pipMindMap', []);
require("./MindMap");
},{"./MindMap":2}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbWluZF9tYXAvTWluZE1hcC50cyIsInNyYy9taW5kX21hcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxzQkFBb0I7QUFFcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUU7SUFDMUIsWUFBWTtDQUNmLENBQUMsQ0FBQzs7QUNKSCxDQUFDO0lBT0csSUFBTSxlQUFlLEdBQXFCO1FBQ3RDLElBQUksRUFBRSxVQUFVO0tBQ25CLENBQUE7SUFFRDtRQUFBO1FBSUEsQ0FBQztRQUFELDZCQUFDO0lBQUQsQ0FKQSxBQUlDLElBQUE7SUFFRDtRQW1DSSwyQkFDWSxRQUFnQjtZQUQ1QixpQkFRQztZQVBXLGFBQVEsR0FBUixRQUFRLENBQVE7WUFuQ3BCLGFBQVEsR0FBVyxHQUFHLENBQUM7WUFFdkIsV0FBTSxHQUFRO2dCQUNsQixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsR0FBRztnQkFDVixNQUFNLEVBQUUsRUFBRTtnQkFDVixJQUFJLEVBQUUsR0FBRzthQUNaLENBQUM7WUFJTSxnQkFBVyxHQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQyxpQkFBWSxHQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQU01QyxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUNoQyxpQkFBWSxHQUFRLElBQUksQ0FBQztZQUN6QixZQUFPLEdBQVEsSUFBSSxDQUFDO1lBQ3BCLGlCQUFZLEdBQVEsSUFBSSxDQUFDO1lBQ3pCLHFCQUFnQixHQUFRO2dCQUM1QixDQUFDLEVBQUUsSUFBSTtnQkFDUCxDQUFDLEVBQUUsSUFBSTthQUNWLENBQUM7WUFDTSxtQkFBYyxHQUFRO2dCQUMxQixDQUFDLEVBQUUsSUFBSTtnQkFDUCxDQUFDLEVBQUUsSUFBSTth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Q0FBQyxXQUFXLEVBQUUsWUFBWSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDM0csQ0FBQztRQUNMLHdCQUFDO0lBQUQsQ0E5NkJBLEFBODZCQyxJQUFBO0lBRUQsSUFBTSxPQUFPLEdBQXlCO1FBQ2xDLFVBQVUsRUFBRSxpQkFBaUI7UUFDN0IsUUFBUSxFQUFFLGVBQWU7S0FDNUIsQ0FBQTtJQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1NBQ3ZCLFNBQVMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDMUMsQ0FBQzs7O0FDeDhCRCxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVqQyxxQkFBbUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICcuL21pbmRfbWFwJztcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdwaXBEaWFncmFtcycsIFtcclxuICAgICdwaXBNaW5kTWFwJ1xyXG5dKTsiLCJ7XHJcbiAgICBpbnRlcmZhY2UgSU1pbmRNYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBkYXRhOiBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTWluZE1hcEJpbmRpbmdzOiBJTWluZE1hcEJpbmRpbmdzID0ge1xyXG4gICAgICAgIGRhdGE6ICc8cGlwRGF0YSdcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBNaW5kTWFwQmluZGluZ3NDaGFuZ2VzIGltcGxlbWVudHMgbmcuSU9uQ2hhbmdlc09iamVjdCwgSU1pbmRNYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgW2tleTogc3RyaW5nXTogYW55O1xyXG5cclxuICAgICAgICBkYXRhOiBuZy5JQ2hhbmdlc09iamVjdCA8IGFueSA+IDtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBNaW5kTWFwQ29udHJvbGxlciBpbXBsZW1lbnRzIG5nLklDb250cm9sbGVyLCBJTWluZE1hcEJpbmRpbmdzIHtcclxuICAgICAgICBwcml2YXRlIGR1cmF0aW9uOiBudW1iZXIgPSA3NTA7XHJcbiAgICAgICAgcHJpdmF0ZSByb290OiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBtYXJnaW46IGFueSA9IHtcclxuICAgICAgICAgICAgdG9wOiAyMCxcclxuICAgICAgICAgICAgcmlnaHQ6IDEyMCxcclxuICAgICAgICAgICAgYm90dG9tOiAyMCxcclxuICAgICAgICAgICAgbGVmdDogMTIwXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwcml2YXRlIHBhcmVudDogSlF1ZXJ5O1xyXG4gICAgICAgIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgdmlld2VyV2lkdGg6IG51bWJlciA9ICQoZG9jdW1lbnQpLndpZHRoKCk7XHJcbiAgICAgICAgcHJpdmF0ZSB2aWV3ZXJIZWlnaHQ6IG51bWJlciA9ICQoZG9jdW1lbnQpLmhlaWdodCgpO1xyXG4gICAgICAgIHByaXZhdGUgc3ZnOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSB6b29tTGlzdGVuZXI6IGFueTtcclxuICAgICAgICBwcml2YXRlIGRyb3BTaGFkb3dGaWx0ZXI6IGFueTtcclxuICAgICAgICBwcml2YXRlIHRyZWU6IGQzLmxheW91dC5UcmVlIDwgYW55ID4gO1xyXG4gICAgICAgIHByaXZhdGUgbGluZTogZDMuc3ZnLkxpbmUgPCBhbnkgPiA7XHJcbiAgICAgICAgcHJpdmF0ZSBpc0RyYWdMaW5rSGVhZDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHByaXZhdGUgc2VsZWN0ZWRMaW5rOiBhbnkgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgbmV3Tm9kZTogYW55ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGRyYWdlZENpcmNsZTogYW55ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIHN0YXJ0UG9pbnRPZkhlYWQ6IGFueSA9IHtcclxuICAgICAgICAgICAgeDogbnVsbCxcclxuICAgICAgICAgICAgeTogbnVsbFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcHJpdmF0ZSBlbmRQb2ludE9mSGVhZDogYW55ID0ge1xyXG4gICAgICAgICAgICB4OiBudWxsLFxyXG4gICAgICAgICAgICB5OiBudWxsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwcml2YXRlIGk6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBkYXRhOiBhbnlbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21MaXN0ZW5lciA9IGQzLmJlaGF2aW9yLnpvb20oKS5zY2FsZUV4dGVudChbMC4yLCAyLjVdKS5vbignem9vbScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdENvbXBvbmVudCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluaXRDb21wb25lbnQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGFyZW50ID0gdGhpcy4kZWxlbWVudC5wYXJlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLnBhcmVudC5oZWlnaHQoKTtcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMucGFyZW50LndpZHRoKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmluaXRTdmcoKTtcclxuICAgICAgICAgICAgdGhpcy5pbml0QXJyb3dNYXJrZXJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFNoYWRvd0ZpbHRlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRDb21tb25WYXJzKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0YSB8fCAhXy5pc0FycmF5KHRoaXMuZGF0YSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0Um9vdCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnJvb3QpO1xyXG4gICAgICAgICAgICB0aGlzLmNlbnRlck5vZGUodGhpcy5yb290KTtcclxuICAgICAgICAgICAgZDMuc2VsZWN0KHNlbGYuZnJhbWVFbGVtZW50KS5zdHlsZShcImhlaWdodFwiLCBcIjUwMHB4XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzZXRSb290KCkge1xyXG4gICAgICAgICAgICAvLyBJbml0IGNvb3JkaW5hdGVzIGZvciByb290IGVsZW1lbnRcclxuICAgICAgICAgICAgdGhpcy5yb290ID0gdGhpcy5kYXRhWzBdO1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QueDAgPSB0aGlzLmhlaWdodCAvIDI7XHJcbiAgICAgICAgICAgIHRoaXMucm9vdC55MCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgJG9uQ2hhbmdlcyhjaGFuZ2VzOiBNaW5kTWFwQmluZGluZ3NDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2VzLmRhdGEgJiYgY2hhbmdlcy5kYXRhLmN1cnJlbnRWYWx1ZSAhPT0gY2hhbmdlcy5kYXRhLnByZXZpb3VzVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IGNoYW5nZXMuZGF0YS5jdXJyZW50VmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFJvb3QoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKHRoaXMucm9vdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNlbnRlck5vZGUodGhpcy5yb290KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0U3ZnKCkge1xyXG4gICAgICAgICAgICB0aGlzLnN2ZyA9IGQzXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2lkJywgJ3Jvb3QnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB0aGlzLnZpZXdlcldpZHRoKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgdGhpcy5oZWlnaHQgLSA0KSAvLyBNaW51cyA0IHRvIGF2b2lkIHRoZSBhcHBlYXJhbmNlIG9mIGEgc2Nyb2xsXHJcbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLnpvb21MaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnYmFzZUcnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgXCIsXCIgKyB0aGlzLm1hcmdpbi50b3AgKyBcIilcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRBcnJvd01hcmtlcnMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZnXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwibWFya2VyXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImFycm93XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ2aWV3Qm94XCI6IFwiMCAtNSAxMCAxMFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmWFwiOiAzNixcclxuICAgICAgICAgICAgICAgICAgICBcInJlZllcIjogMCxcclxuICAgICAgICAgICAgICAgICAgICBcIm1hcmtlcldpZHRoXCI6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtYXJrZXJIZWlnaHRcIjogNCxcclxuICAgICAgICAgICAgICAgICAgICBcIm9yaWVudFwiOiBcImF1dG9cIlxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgXCJNMCwtNUwxMCwwTDAsNVwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImFycm93SGVhZFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3ZnXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwibWFya2VyXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImFycm93U2VsZWN0ZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBcInZpZXdCb3hcIjogXCIwIC01IDEwIDEwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZYXCI6IDUyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmWVwiOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWFya2VyV2lkdGhcIjogNCxcclxuICAgICAgICAgICAgICAgICAgICBcIm1hcmtlckhlaWdodFwiOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgIFwib3JpZW50XCI6IFwiYXV0b1wiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiZFwiLCBcIk0wLC01TDEwLDBMMCw1XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYXJyb3dTZWxlY3RlZEhlYWRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRTaGFkb3dGaWx0ZXIoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlciA9IHRoaXMuc3ZnLmFwcGVuZCgnc3ZnOmZpbHRlcicpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignaWQnLCAnZHJvcC1zaGFkb3cnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsICcxMzAlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlci5hcHBlbmQoJ3N2ZzpmZUdhdXNzaWFuQmx1cicpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignaW4nLCAnU291cmNlQWxwaGEnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0ZERldmlhdGlvbicsIDEpXHJcbiAgICAgICAgICAgICAgICAuYXR0cigncmVzdWx0JywgJ2JsdXInKTtcclxuICAgICAgICAgICAgdGhpcy5kcm9wU2hhZG93RmlsdGVyLmFwcGVuZCgnc3ZnOmZlT2Zmc2V0JylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbicsICdibHVyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeCcsIDApXHJcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCAyKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3Jlc3VsdCcsICdvZmZzZXRCbHVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlci5hcHBlbmQoJ3N2ZzpmZUNvbXBvbmVudFRyYW5zZmVyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbicsICdvZmZzZXRCbHVyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdyZXN1bHQnLCAndHJhbnNmZXInKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnc3ZnOmZlRnVuY0EnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3R5cGUnLCAnbGluZWFyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdzbG9wZScsIDAuNCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlci5hcHBlbmQoJ3N2ZzpmZUJsZW5kJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbicsICdTb3VyY2VHcmFwaGljJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbjInLCAndHJhbnNmZXInKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ21vZGUnLCAnbm9ybWFsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRDb21tb25WYXJzKCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyZWUgPSBkMy5sYXlvdXQudHJlZSgpXHJcbiAgICAgICAgICAgICAgICAuc2l6ZShbdGhpcy52aWV3ZXJXaWR0aCwgdGhpcy52aWV3ZXJIZWlnaHRdKVxyXG4gICAgICAgICAgICAgICAgLm5vZGVTaXplKFs1MCwgNjAwXSlcclxuICAgICAgICAgICAgICAgIC5zZXBhcmF0aW9uKGZ1bmN0aW9uIChhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhLnBhcmVudCA9PSBiLnBhcmVudCA/IDEgOiAyKSAvIGEuZGVwdGg7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGluZSA9IGQzLnN2Zy5saW5lKClcclxuICAgICAgICAgICAgICAgIC54KGZ1bmN0aW9uIChkOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC54O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC55KGZ1bmN0aW9uIChkOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC55O1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5pbnRlcnBvbGF0ZSgnbGluZWFyJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdXBkYXRlKHNvdXJjZTogYW55KSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50cmVlKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVQb2ludHMgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBfLmVhY2gobm9kZXMsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQuZnggJiYgZC5meSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkLnggPSBkLmZ4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkLnkgPSBkLmZ5O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVMaW5rcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFsbExpbmtzID0gdGhpcy5zdmcuc2VsZWN0QWxsKFwicGF0aC5saW5rXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGFsbExpbmtzXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N4JywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQuc291cmNlLng7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignc3knLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5zb3VyY2UueTtcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0eCcsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnRhcmdldC54O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3R5JywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudGFyZ2V0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdldFRyYW5zZm9ybSA9IChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZC51c2VyRHJhZ2dlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIGQueCArIFwiLFwiICsgZC55ICsgXCIpXCI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcInJvdGF0ZShcIiArIChkLnggLSA5MCkgKyBcIil0cmFuc2xhdGUoXCIgKyBkLnkgKyBcIiwgMClcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ29tcHV0ZSB0aGUgbmV3IHRyZWUgbGF5b3V0XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy50cmVlLm5vZGVzKHRoaXMucm9vdCkucmV2ZXJzZSgpLFxyXG4gICAgICAgICAgICAgICAgbGlua3MgPSB0aGlzLnRyZWUubGlua3Mobm9kZXMpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBub2Rlc+KAplxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5zdmcuc2VsZWN0QWxsKFwiZy5ub2RlXCIpXHJcbiAgICAgICAgICAgICAgICAuZGF0YShub2RlcywgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5pZCB8fCAoZC5pZCA9ICsrdGhpcy5pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB1cGRhdGVQb2ludHMoKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRyYWdOb2RlVmFyID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcbiAgICAgICAgICAgICAgICAub3JpZ2luKE9iamVjdClcclxuICAgICAgICAgICAgICAgIC5vbihcImRyYWdzdGFydFwiLCAoZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVMaW5rU2VsZWN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIGQuZHJhZ1RoaXNUaW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZDMuZXZlbnRbJ3NvdXJjZUV2ZW50J10uc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLm9uKFwiZHJhZ2VuZFwiLCAoZDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlUG9pbnRzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGlua3MoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAub24oXCJkcmFnXCIsIChkOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdOb2RlKGQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBFbnRlciBhbnkgbmV3IG5vZGVzIGF0IHRoZSBwYXJlbnQncyBwcmV2aW91cyBwb3NpdGlvbi5cclxuICAgICAgICAgICAgY29uc3Qgbm9kZUVudGVyID0gbm9kZS5lbnRlcigpLmFwcGVuZChcImdcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRUcmFuc2Zvcm0oc291cmNlKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAub24oXCJkYmxjbGlja1wiLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGJsY2xpY2tOb2RlKGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGlja05vZGUoZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLm9uKFwibW91c2VvdmVyXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZW92ZXJOb2RlKGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbihcIm1vdXNlb3V0XCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3VzZW91dE5vZGUoZCk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhbGwoZHJhZ05vZGVWYXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gUGF0dGVybiB0byBmaWxsIGNpcmNsZSBieSBhdmF0YXJcclxuICAgICAgICAgICAgbm9kZUVudGVyLmFwcGVuZChcInBhdHRlcm5cIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BhdHRlcm4taW1hZ2UtJyArIGQuaWQ7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBcIjBcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCBcIjBcIilcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJ2ltYWdlJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgMClcclxuICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgMClcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCA2NClcclxuICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIDY0KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4bGluazpocmVmXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQuaW1nO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBub2RlRW50ZXIuYXBwZW5kKCdjaXJjbGUnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3InLCAxNilcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdzdWJzdHJhdGUnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudXNlckRyYWdnZWQgPyBcIlwiIDogXCJyb3RhdGUoXCIgKyAoLWQueCArIDkwKSArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5zdHlsZSgnZmlsdGVyJywgJ3VybCgjZHJvcC1zaGFkb3cpJyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOb2RlIGNpcmNsZVxyXG4gICAgICAgICAgICBub2RlRW50ZXIuYXBwZW5kKCdjaXJjbGUnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3InLCAxNilcclxuICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnVzZXJEcmFnZ2VkID8gXCJcIiA6IFwicm90YXRlKFwiICsgKC1kLnggKyA5MCkgKyBcIilcIjtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnZ29hbC1hdmF0YXInKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcInVybCgjcGF0dGVybi1pbWFnZS1cIiArIGQuaWQgKyBcIilcIjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gTmFtZSBvZiB0aGUgbm9kZVxyXG4gICAgICAgICAgICBub2RlRW50ZXJcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgMzYpXHJcbiAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC51c2VyRHJhZ2dlZCA/IFwiXCIgOiBcInJvdGF0ZShcIiArICgtZC54ICsgOTApICsgXCIpXCI7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcInN0YXJ0XCIpXHJcbiAgICAgICAgICAgICAgICAudGV4dCgoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMuZ2V0QkIpXHJcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJkaXNwbGF5XCIsICdub25lJyk7XHJcblxyXG4gICAgICAgICAgICBub2RlRW50ZXJcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3N2Zzpmb3JlaWduT2JqZWN0JylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdpbnB1dC1vYmplY3QnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDMzKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudXNlckRyYWdnZWQgPyBcIlwiIDogXCJyb3RhdGUoXCIgKyAoLWQueCArIDkwKSArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAtMTEpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQuYmJveC53aWR0aCArIDE2XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5iYm94LmhlaWdodFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoJ3hodG1sOmlucHV0JylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdkaXNhYmxlZCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbignY2xpY2snLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Ob2RlVGV4dENsaWNrKGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbigna2V5ZG93bicsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNoYW5nZU5vZGVOYW1lKGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbignZm9jdXMnLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGQuY2hhbmdpbmdOYW1lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAub24oJ2JsdXInLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGQuY2hhbmdpbmdOYW1lID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKCd3aWR0aCcsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkLmJib3gud2lkdGggKyAxNikgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdoZWlnaHQnLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoZC5iYm94LmhlaWdodCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRyYW5zaXRpb24gbm9kZXMgdG8gdGhlaXIgbmV3IHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBjb25zdCBub2RlVXBkYXRlID0gbm9kZS50cmFuc2l0aW9uKClcclxuICAgICAgICAgICAgICAgIC5kdXJhdGlvbih0aGlzLmR1cmF0aW9uKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0VHJhbnNmb3JtKGQpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5lYWNoKCdlbmQnLCBmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGQudHJlZVggPSBfLmNsb25lKGQueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZC50cmVlWSA9IF8uY2xvbmUoZC55KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZC54ID0gZDMudHJhbnNmb3JtKGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwidHJhbnNmb3JtXCIpKS50cmFuc2xhdGVbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgZC55ID0gZDMudHJhbnNmb3JtKGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwidHJhbnNmb3JtXCIpKS50cmFuc2xhdGVbMV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGQuZnggPSBkMy50cmFuc2Zvcm0oZDMuc2VsZWN0KHRoaXMpLmF0dHIoXCJ0cmFuc2Zvcm1cIikpLnRyYW5zbGF0ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICBkLmZ5ID0gZDMudHJhbnNmb3JtKGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwidHJhbnNmb3JtXCIpKS50cmFuc2xhdGVbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgZC51c2VyRHJhZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG5vZGVVcGRhdGUuc2VsZWN0KFwiY2lyY2xlXCIpXHJcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJmaWxsXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidXJsKFwiICsgZC5pbWcgKyBcIilcIjtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC51c2VyRHJhZ2dlZCA/IFwiXCIgOiBcInJvdGF0ZShcIiArICgtZC54ICsgOTApICsgXCIpXCI7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsICczMnB4Jyk7XHJcblxyXG4gICAgICAgICAgICBub2RlVXBkYXRlLnNlbGVjdChcIi5nb2FsLWF2YXRhclwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudXNlckRyYWdnZWQgPyBcIlwiIDogXCJyb3RhdGUoXCIgKyAoLWQueCArIDkwKSArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiclwiLCAnMzJweCcpO1xyXG5cclxuICAgICAgICAgICAgbm9kZVVwZGF0ZS5zZWxlY3QoXCJmb3JlaWduT2JqZWN0LmlucHV0LW9iamVjdFwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudXNlckRyYWdnZWQgPyBcIlwiIDogXCJyb3RhdGUoXCIgKyAoLWQueCArIDkwKSArIFwiKVwiO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5zdHlsZShcImZpbGwtb3BhY2l0eVwiLCAxKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRyYW5zaXRpb24gZXhpdGluZyBub2RlcyB0byB0aGUgcGFyZW50J3MgbmV3IHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBjb25zdCBub2RlRXhpdCA9IG5vZGUuZXhpdCgpO1xyXG4gICAgICAgICAgICBub2RlRXhpdFxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdChcIi5pbnB1dC1vYmplY3RcIilcclxuICAgICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XHJcbiAgICAgICAgICAgIG5vZGVFeGl0XHJcbiAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAuZHVyYXRpb24odGhpcy5kdXJhdGlvbilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldFRyYW5zZm9ybShzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgIG5vZGVFeGl0LnNlbGVjdChcImNpcmNsZVwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDE2KVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwiZmlsbC1vcGFjaXR5XCIsIDApO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBsaW5rc+KAplxyXG4gICAgICAgICAgICBjb25zdCBsaW5rID0gdGhpcy5zdmcuc2VsZWN0QWxsKFwiZy5saW5rLWZvcm1cIilcclxuICAgICAgICAgICAgICAgIC5kYXRhKGxpbmtzLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnRhcmdldC5pZDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gRW50ZXIgYW55IG5ldyBsaW5rcyBhdCB0aGUgcGFyZW50J3MgcHJldmlvdXMgcG9zaXRpb24uXHJcbiAgICAgICAgICAgIGxpbmsuZW50ZXIoKVxyXG4gICAgICAgICAgICAgICAgLmluc2VydChcImdcIiwgXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnbGluay1mb3JtJylcclxuICAgICAgICAgICAgICAgIC5pbnNlcnQoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwibGluayBhcnJvdyBcIiArIFwidG8tXCIgKyBkLnRhcmdldC5pZCArIFwiIGZyb20tXCIgKyBkLnNvdXJjZS5pZDtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxpbmUoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiBzb3VyY2UueTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiBzb3VyY2UueDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gnOiBzb3VyY2UueTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiBzb3VyY2UueDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTGlua0NsaWNrKGQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUcmFuc2l0aW9uIGxpbmtzIHRvIHRoZWlyIG5ldyBwb3NpdGlvbi5cclxuICAgICAgICAgICAgbGlua1xyXG4gICAgICAgICAgICAgICAgLnRyYW5zaXRpb24oKVxyXG4gICAgICAgICAgICAgICAgLmR1cmF0aW9uKHRoaXMuZHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0KFwicGF0aC5saW5rXCIpXHJcbiAgICAgICAgICAgICAgICAuZWFjaCgnZW5kJywgKGwsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoZDMuc2VsZWN0QWxsKCdwYXRoLmxpbmsnKVswXVtpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkXCI6IChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubGluZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAneCc6IGQuc291cmNlLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3knOiBkLnNvdXJjZS55XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd4JzogZC50YXJnZXQueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAneSc6IGQudGFyZ2V0LnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzeCcsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5zb3VyY2UueDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N5JywgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnNvdXJjZS55O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHgnLCAoZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGQudGFyZ2V0Lng7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0eScsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC50YXJnZXQueTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hcmtlci1lbmRcIjogXCJ1cmwoI2Fycm93KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUcmFuc2l0aW9uIGV4aXRpbmcgbm9kZXMgdG8gdGhlIHBhcmVudCdzIG5ldyBwb3NpdGlvbi5cclxuICAgICAgICAgICAgbGluay5leGl0KCkudHJhbnNpdGlvbigpLnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3Rhc2ggdGhlIG9sZCBwb3NpdGlvbnMgZm9yIHRyYW5zaXRpb24uXHJcbiAgICAgICAgICAgIF8uZWFjaChub2RlcywgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgIGQueDAgPSBkLng7XHJcbiAgICAgICAgICAgICAgICBkLnkwID0gZC55O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGJsY2xpY2tOb2RlKGQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVMaW5rU2VsZWN0aW9ucygpO1xyXG4gICAgICAgICAgICBkMy5ldmVudFsnc3RvcFByb3BhZ2F0aW9uJ10oKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICBkLl9jaGlsZHJlbiA9IGQuY2hpbGRyZW47XHJcbiAgICAgICAgICAgICAgICBkLmNoaWxkcmVuID0gbnVsbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGQuY2hpbGRyZW4gPSBkLl9jaGlsZHJlbjtcclxuICAgICAgICAgICAgICAgIGQuX2NoaWxkcmVuID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZShkKTtcclxuICAgICAgICAgICAgdGhpcy5jZW50ZXJOb2RlKGQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzaG93Tm9kZUFjdGlvbnMoZWxlbWVudCwgZCkge1xyXG4gICAgICAgICAgICB2YXIgcG9zaXRpb25zID0gW3tcclxuICAgICAgICAgICAgICAgICAgICB4OiA0MCxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtNDBcclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IC01NVxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IC00MCxcclxuICAgICAgICAgICAgICAgICAgICB5OiAtNDBcclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICB4OiAtNTUsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogMFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IC00MCxcclxuICAgICAgICAgICAgICAgICAgICB5OiA0MFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogNTVcclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICAgICAgY3VyRWxlbWVudCA9IGQzLnNlbGVjdCgkKGVsZW1lbnQpLnBhcmVudCgnLm5vZGUnKS5nZXQoMCkpO1xyXG5cclxuICAgICAgICAgICAgY3VyRWxlbWVudFxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ25vZGUgc2VsZWN0ZWQnKVxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdCgnLmlucHV0LW9iamVjdCcpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKGQuYmJveC53aWR0aCArIDE2LCAyNTApXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZC5iYm94LmhlaWdodCArIDE2XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIC0xOSlcclxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJ2lucHV0JylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdkaXNhYmxlZCcsIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwid2lkdGhcIiwgKGQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oZC5iYm94LndpZHRoICsgMTYsIDI1MCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwiaGVpZ2h0XCIsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChkLmJib3guaGVpZ2h0ICsgMTYpICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY3VyRWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3InLCAwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdhY3Rpb25OdW1iZXInLCBpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdnb2FsLWFjdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnVzZXJEcmFnZ2VkID8gXCJcIiA6IFwicm90YXRlKFwiICsgKC1kLnRyZWVYICsgOTApICsgXCIpXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY3gnLCBwb3NpdGlvbnNbaV0ueClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY3knLCBwb3NpdGlvbnNbaV0ueSlcclxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2ZpbHRlcicsICd1cmwoI2Ryb3Atc2hhZG93KScpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsIChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Ob2RlQWN0aW9uQ2xpY2soZCwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgLmR1cmF0aW9uKDIwMCAqIChpICsgMSkpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3InLCAxNik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGQubm9kZVNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaGlkZU5vZGVBY3Rpb25zKGVsZW1lbnQsIGQpIHtcclxuICAgICAgICAgICAgdmFyIGN1ckVsZW1lbnQgPSBkMy5zZWxlY3QoJChlbGVtZW50KS5wYXJlbnQoJy5ub2RlJykuZ2V0KDApKTtcclxuXHJcbiAgICAgICAgICAgIGN1ckVsZW1lbnRcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlJylcclxuICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy5nb2FsLWFjdGlvbicpXHJcbiAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAuZHVyYXRpb24odGhpcy5kdXJhdGlvbiAtIDQwMClcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdyJywgMClcclxuICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgIGN1ckVsZW1lbnRcclxuICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5pbnB1dC1vYmplY3QnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIC0xMSlcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oZC5iYm94LndpZHRoICsgMTYsIDI1MClcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmJib3guaGVpZ2h0XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnNlbGVjdCgnaW5wdXQnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5zdHlsZShcIndpZHRoXCIsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKGQuYmJveC53aWR0aCArIDE2LCAyNTApICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5zdHlsZShcImhlaWdodFwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmJib3guaGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBkLm5vZGVTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjbGlja05vZGUoZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUxpbmtTZWxlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgIGlmIChkLmRyYWdUaGlzVGltZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgZC5jbGlja2VkID0gIWQuY2xpY2tlZDtcclxuICAgICAgICAgICAgZC5jbGlja2VkID8gdGhpcy5zaG93Tm9kZUFjdGlvbnMoZDMuZXZlbnRbJ3RhcmdldCddLCBkKSA6IHRoaXMuaGlkZU5vZGVBY3Rpb25zKGQzLmV2ZW50Wyd0YXJnZXQnXSwgZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIG9uTm9kZVRleHRDbGljayhkKSB7XHJcbiAgICAgICAgICAgIGlmIChkLm5vZGVTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgZDMuZXZlbnRbJ3N0b3BQcm9wYWdhdGlvbiddKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVtb3ZlTGlua1NlbGVjdGlvbnMoKSB7XHJcbiAgICAgICAgICAgIGQzLnNlbGVjdEFsbCgncGF0aC5saW5rJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKHtcclxuICAgICAgICAgICAgICAgICAgICBcIm1hcmtlci1lbmRcIjogXCJ1cmwoI2Fycm93KVwiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNsYXNzZWQoJ3NlbGVjdGVkJywgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgZDMuc2VsZWN0QWxsKCcuY2lyY2xlSGVhZCcpXHJcbiAgICAgICAgICAgICAgICAucmVtb3ZlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkTGluayA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIG9uQ2hhbmdlTm9kZU5hbWUoZCkgeyAvLyBnZXQgdGFyZ2V0XHJcbiAgICAgICAgICAgIC8vY29uc3QgY3VyRWxlbWVudCA9IGQzLnNlbGVjdCgvKnRoaXMucGFyZW50Tm9kZS5wYXJlbnROb2RlKi8pO1xyXG5cclxuICAgICAgICAgICAgLy9kLnRpdGxlID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2Rpc3BsYXknLCBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoZC50aXRsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsKHRoaXMuZ2V0QkIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRWxlbWVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLmlucHV0LW9iamVjdCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZHVyYXRpb24odGhpcy5kdXJhdGlvbiAtIDQwMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oZC5iYm94LndpZHRoICsgMTYsIDI1MClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCdpbnB1dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJ3aWR0aFwiLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1pbihkLmJib3gud2lkdGggKyAxNiwgMjUwKSArICdweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pOyovXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIG9uTm9kZUFjdGlvbkNsaWNrKGQsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZDMuZXZlbnRbJ3N0b3BQcm9wYWdhdGlvbiddKCk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc291cmNlOiAnLCBkKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FjdGlvbiBudW1iZXI6ICcsIGVsZW1lbnQuYXR0cmlidXRlcy5hY3Rpb25OdW1iZXIudmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBtb3VzZW92ZXJOb2RlKGQpIHsgLy8gZ2V0IHRhcmdldFxyXG4gICAgICAgICAgICBpZiAodGhpcy5pc0RyYWdMaW5rSGVhZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RyYWdlZENpcmNsZS5hdHRyaWJ1dGVzLnR5cGUudmFsdWUnLCB0aGlzLmRyYWdlZENpcmNsZS5hdHRyaWJ1dGVzLnR5cGUudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZC5pZCA9PSAnMScgJiYgdGhpcy5kcmFnZWRDaXJjbGUuYXR0cmlidXRlcy50eXBlLnZhbHVlID09ICdlbmQnICYmIHRoaXMuc2VsZWN0ZWRMaW5rLl9fZGF0YV9fLnNvdXJjZS5pZCAhPSAnMScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcImhvdmVyXCIsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZChcInJlZFwiLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jbGFzc2VkKFwiaG92ZXJcIiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVuZFBvaW50T2ZIZWFkLnggPSBkLng7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5kUG9pbnRPZkhlYWQueSA9IGQueTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZXdOb2RlID0gZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9Ki9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBtb3VzZW91dE5vZGUoZCkgeyAvLyBnZXQgdGFyZ2V0XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRHJhZ0xpbmtIZWFkKSB7XHJcbiAgICAgICAgICAgICAgICAvL2QzLnNlbGVjdCh0aGlzKVxyXG4gICAgICAgICAgICAgICAgLy8gICAgLmNsYXNzZWQoXCJob3ZlclwiLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC8vICAgIC5jbGFzc2VkKFwicmVkXCIsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVuZFBvaW50T2ZIZWFkLnggPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmRQb2ludE9mSGVhZC55ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV3Tm9kZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhZ05vZGUoZCkgeyAvLyBnZXQgdGFyZ2V0XHJcbiAgICAgICAgICAgIGlmIChkLmNoYW5naW5nTmFtZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkLnVzZXJEcmFnZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZC5kcmFnVGhpc1RpbWUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkLmZ4ID0gZDMuZXZlbnQueDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZC5meSA9IGQzLmV2ZW50Lnk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdG9FbGVtcyA9IGQzLnNlbGVjdEFsbCgnLnRvLScgKyBkLmlkKVswXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb21FbGVtcyA9IGQzLnNlbGVjdEFsbCgnLmZyb20tJyArIGQuaWQpWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRWxlbSA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckVsZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBkLmZ4ICsgJywnICsgZC5meSArICcpJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLmdvYWwtYXZhdGFyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckVsZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3QoJy5zdWJzdHJhdGUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIG51bGwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRWxlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNlbGVjdCgnLnRleHQtc3Vic3RyYXRlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckVsZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJy5nb2FsLWFjdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgbnVsbCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJFbGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2VsZWN0KCcuaW5wdXQtb2JqZWN0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvRWxlbXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KGVsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lKFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZWxlbS5hdHRyaWJ1dGVzLnN4LnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGVsZW0uYXR0cmlidXRlcy5zeS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBkLmZ4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IGQuZnlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tRWxlbXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZDMuc2VsZWN0KGVsZW0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5lKFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogZC5meCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBkLmZ5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IGVsZW0uYXR0cmlidXRlcy50eC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBlbGVtLmF0dHJpYnV0ZXMudHkudmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7Ki9cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZHJhZ0xpbmtIZWFkKCkgeyAvLyBnZXQgdGFyZ2V0XHJcbiAgICAgICAgICAgIC8qdmFyIGN1ckVsZW0gPSBkMy5zZWxlY3QodGhpcyksXHJcbiAgICAgICAgICAgICAgICB4ID0gKE51bWJlcihjdXJFbGVtLmF0dHIoJ2N4JykpICsgTnVtYmVyKGQzLmV2ZW50LmR4KSkudG9GaXhlZCgyKSxcclxuICAgICAgICAgICAgICAgIHkgPSAoTnVtYmVyKGN1ckVsZW0uYXR0cignY3knKSkgKyBOdW1iZXIoZDMuZXZlbnQuZHkpKS50b0ZpeGVkKDIpO1xyXG5cclxuICAgICAgICAgICAgY3VyRWxlbVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2N4JywgeClcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdjeScsIHkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlcy50eXBlLnZhbHVlID09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJy5jaXJjbGVIZWFkW3R5cGU9c3RhcnRdJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3Qoc2VsZWN0ZWRMaW5rKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZShbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHNlbGVjdGVkTGluay5hdHRyaWJ1dGVzLnN4LnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHNlbGVjdGVkTGluay5hdHRyaWJ1dGVzLnN5LnZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnLmNpcmNsZUhlYWRbdHlwZT1lbmRdJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3Qoc2VsZWN0ZWRMaW5rKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluZShbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IHgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogeVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBzZWxlY3RlZExpbmsuYXR0cmlidXRlcy50eC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBzZWxlY3RlZExpbmsuYXR0cmlidXRlcy50eS52YWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSovXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIG9uTGlua0NsaWNrKGQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVMaW5rU2VsZWN0aW9ucygpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGRyYWdMaW5rSGVhZFZhciA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG4gICAgICAgICAgICAgICAgLm9yaWdpbihPYmplY3QpXHJcbiAgICAgICAgICAgICAgICAub24oXCJkcmFnc3RhcnRcIiwgZnVuY3Rpb24gKGRyYWdlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGQzLmV2ZW50Wydzb3VyY2VFdmVudCddLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCB0YXJnZXRcclxuICAgICAgICAgICAgICAgICAgICAvL2QzLnNlbGVjdCh0aGlzKS5hdHRyKCAncG9pbnRlci1ldmVudHMnLCAnbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zdGFydFBvaW50T2ZIZWFkLnggPSBOdW1iZXIoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2N4JykpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zdGFydFBvaW50T2ZIZWFkLnkgPSBOdW1iZXIoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2N5JykpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5pc0RyYWdMaW5rSGVhZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLmRyYWdlZENpcmNsZSA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLm9uKFwiZHJhZ2VuZFwiLCAoZHJhZ2VkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RyYWdMaW5rSGVhZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJMaW5rID0gZDMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRMaW5rKTtcclxuICAgICAgICAgICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbmRQb2ludE9mSGVhZC54ICE9IG51bGwgJiYgdGhpcy5lbmRQb2ludE9mSGVhZC55ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdGQuc291cmNlLmNoaWxkcmVuID0gXy53aXRob3V0KGQuc291cmNlLmNoaWxkcmVuLCBkLnRhcmdldCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0aWYgKHRoaXMuYXR0cmlidXRlcy50eXBlLnZhbHVlID09ICdlbmQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdGlmIChkLnNvdXJjZS5pZCAhPSB0aGlzLm5ld05vZGUuaWQgJiYgXy5maW5kSW5kZXgoZC5zb3VyY2UuY2hpbGRyZW4sIChvOiBhbnkpID0+IHsgcmV0dXJuIG8uaWQgPT0gdGhpcy5uZXdOb2RlLmlkOyB9KSA8IDApIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHR7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0ZC5zb3VyY2UuY2hpbGRyZW4ucHVzaCh0aGlzLm5ld05vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdGQudGFyZ2V0ID0gdGhpcy5uZXdOb2RlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRjdXJMaW5rXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHQuYXR0cignZCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMubGluZShbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHRcdFx0e3g6IHRoaXMuc2VsZWN0ZWRMaW5rLmF0dHJpYnV0ZXMuc3gudmFsdWUsIHk6IHRoaXMuc2VsZWN0ZWRMaW5rLmF0dHJpYnV0ZXMuc3kudmFsdWV9LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdFx0XHR7eDogdGhpcy5lbmRQb2ludE9mSGVhZC54LCB5OiB0aGlzLmVuZFBvaW50T2ZIZWFkLnl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHRcdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdFx0fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdC5hdHRyKCd0eCcsIHRoaXMuZW5kUG9pbnRPZkhlYWQueClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdC5hdHRyKCd0eScsIHRoaXMuZW5kUG9pbnRPZkhlYWQueSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdFx0XHRyZXR1cm4gJ2xpbmsgYXJyb3cgc2VsZWN0ZWQgdG8tJyArIHRoaXMubmV3Tm9kZS5pZCArICcgZnJvbS0nICsgZC5zb3VyY2UuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHR9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0ZHJhd0hlYWRDaXJjbGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0Ly8gUmVtb3ZlIGxpbmtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRjdXJMaW5rLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdGQzLnNlbGVjdEFsbCgnLmNpcmNsZUhlYWQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0fSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdGlmIChkLnRhcmdldC5pZCAhPSBuZXdHb2FsLmlkICYmIF8uZmluZEluZGV4KG5ld0dvYWwuY2hpbGRyZW4sIGZ1bmN0aW9uKG8pIHsgcmV0dXJuIG8uaWQgPT0gZC50YXJnZXQuaWQ7IH0pIDwgMCkgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRuZXdHb2FsLmNoaWxkcmVuID0gbmV3R29hbC5jaGlsZHJlbiB8fCBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRuZXdHb2FsLmNoaWxkcmVuLnB1c2goZC50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdGQuc291cmNlID0gbmV3R29hbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0Y3VyTGlua1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdFx0LmF0dHIoJ2QnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHRcdHJldHVybiBsaW5lKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdFx0XHR7eDogZW5kUG9pbnRPZkhlYWQueCwgeTogZW5kUG9pbnRPZkhlYWQueX0sIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdFx0XHRcdHt4OiBzZWxlY3RlZExpbmsuYXR0cmlidXRlcy50eC52YWx1ZSwgeTogc2VsZWN0ZWRMaW5rLmF0dHJpYnV0ZXMudHkudmFsdWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHRcdF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdFx0fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdC5hdHRyKCdzeCcsIGVuZFBvaW50T2ZIZWFkLngpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHQuYXR0cignc3knLCBlbmRQb2ludE9mSGVhZC55KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdFx0LmF0dHIoJ2NsYXNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHRcdHJldHVybiAnbGluayBhcnJvdyBzZWxlY3RlZCB0by0nICsgZC50YXJnZXQuaWQgKyAnIGZyb20tJyArIG5ld0dvYWwuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XHR9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0ZHJhd0hlYWRDaXJjbGVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gUmVtb3ZlIGxpbmtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRjdXJMaW5rLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdGQzLnNlbGVjdEFsbCgnLmNpcmNsZUhlYWQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0Y3VyTGlua1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHQuYXR0cignZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBcdFx0XHRcdHJldHVybiBsaW5lKFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdHt4OiBzZWxlY3RlZExpbmsuYXR0cmlidXRlcy5zeC52YWx1ZSwgeTogc2VsZWN0ZWRMaW5rLmF0dHJpYnV0ZXMuc3kudmFsdWV9LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdFx0XHRcdHt4OiBzZWxlY3RlZExpbmsuYXR0cmlidXRlcy50eC52YWx1ZSwgeTogc2VsZWN0ZWRMaW5rLmF0dHJpYnV0ZXMudHkudmFsdWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdFx0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFx0XHRcdH0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgXHRcdGRyYXdIZWFkQ2lyY2xlcygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QoJy5ub2RlLmhvdmVyJykuY2xhc3NlZCgnaG92ZXInLCBmYWxzZSkuY2xhc3NlZCgncmVkJywgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0ciggJ3BvaW50ZXItZXZlbnRzJywgJycgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2VkQ2lyY2xlID0gbnVsbDsqL1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5vbihcImRyYWdcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0xpbmtIZWFkKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRyYXdIZWFkQ2lyY2xlcyA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbCgnLmNpcmNsZUhlYWQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN2Z1xyXG4gICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2NpcmNsZUhlYWQnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdyJywgMTApXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3R5cGUnLCAnZW5kJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY3gnLCB0aGlzLnNlbGVjdGVkTGluay5nZXRQb2ludEF0TGVuZ3RoKHRoaXMuc2VsZWN0ZWRMaW5rLmdldFRvdGFsTGVuZ3RoKCkgLSA0MikueClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY3knLCB0aGlzLnNlbGVjdGVkTGluay5nZXRQb2ludEF0TGVuZ3RoKHRoaXMuc2VsZWN0ZWRMaW5rLmdldFRvdGFsTGVuZ3RoKCkgLSA0MikueSlcclxuICAgICAgICAgICAgICAgICAgICAuY2FsbChkcmFnTGlua0hlYWRWYXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc3ZnXHJcbiAgICAgICAgICAgICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnY2lyY2xlSGVhZCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3InLCAxMClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cigndHlwZScsICdzdGFydCcpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2N4JywgdGhpcy5zZWxlY3RlZExpbmsuZ2V0UG9pbnRBdExlbmd0aCg0MikueClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cignY3knLCB0aGlzLnNlbGVjdGVkTGluay5nZXRQb2ludEF0TGVuZ3RoKDQyKS55KVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGRyYWdMaW5rSGVhZFZhcik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vdmFyIGN1ckVsZW0gPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKSwgLy8gZ2V0IHRhcmdldFxyXG4gICAgICAgICAgICAvLyAgICBhdHRycyA9IGN1ckVsZW1bMF1bMF0uYXR0cmlidXRlcztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRMaW5rID0gdGhpcztcclxuICAgICAgICAgICAgZHJhd0hlYWRDaXJjbGVzKCk7XHJcblxyXG4gICAgICAgICAgICAvKmN1ckVsZW1cclxuICAgICAgICAgICAgICAgIC5zZWxlY3QoXCJwYXRoLmxpbmtcIilcclxuICAgICAgICAgICAgICAgIC5jbGFzc2VkKCdzZWxlY3RlZCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignbWFya2VyLWVuZCcsICd1cmwoI2Fycm93U2VsZWN0ZWQpJyk7Ki9cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0QkIoc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgICBkLmJib3ggPSB0aGlzLmdldEJCb3goKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY2VudGVyTm9kZShzb3VyY2U6IGFueSkge1xyXG4gICAgICAgICAgICBsZXQgc2NhbGUgPSB0aGlzLnpvb21MaXN0ZW5lci5zY2FsZSgpLFxyXG4gICAgICAgICAgICAgICAgeCA9IC1zb3VyY2UueDAsXHJcbiAgICAgICAgICAgICAgICB5ID0gLXNvdXJjZS55MDtcclxuXHJcbiAgICAgICAgICAgIHggPSB4ICogc2NhbGUgKyB0aGlzLnZpZXdlcldpZHRoIC8gMjtcclxuICAgICAgICAgICAgeSA9IHkgKiBzY2FsZSArIHRoaXMudmlld2VySGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgICAgIGQzLnNlbGVjdCgnLmJhc2VHJykudHJhbnNpdGlvbigpXHJcbiAgICAgICAgICAgICAgICAuZHVyYXRpb24odGhpcy5kdXJhdGlvbilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgeCArIFwiLFwiICsgeSArIFwiKXNjYWxlKFwiICsgc2NhbGUgKyBcIilcIik7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbUxpc3RlbmVyLnNjYWxlKHNjYWxlKTtcclxuICAgICAgICAgICAgdGhpcy56b29tTGlzdGVuZXIudHJhbnNsYXRlKFt4LCB5XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHpvb20oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZnLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBkMy5ldmVudFsndHJhbnNsYXRlJ10gKyBcIilzY2FsZShcIiArIGQzLmV2ZW50WydzY2FsZSddICsgXCIpXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBNaW5kTWFwOiBuZy5JQ29tcG9uZW50T3B0aW9ucyA9IHtcclxuICAgICAgICBjb250cm9sbGVyOiBNaW5kTWFwQ29udHJvbGxlcixcclxuICAgICAgICBiaW5kaW5nczogTWluZE1hcEJpbmRpbmdzXHJcbiAgICB9XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3BpcE1pbmRNYXAnKVxyXG4gICAgICAgIC5jb21wb25lbnQoJ3BpcE1pbmRNYXAnLCBNaW5kTWFwKTtcclxufSIsImFuZ3VsYXIubW9kdWxlKCdwaXBNaW5kTWFwJywgW10pO1xyXG5cclxuaW1wb3J0ICcuL01pbmRNYXAnOyJdfQ==