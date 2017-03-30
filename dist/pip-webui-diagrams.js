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
            this.zoomListener = d3.behavior.zoom().scaleExtent([0.2, 2.5]).on('zoom', function () {
                _this.zoom();
            });
        }
        MindMapController.prototype.$onInit = function () {
            this.parent = this.$element.parent();
            this.height = this.parent.height();
            this.width = this.parent.width();
            this.initSvg();
            this.initArrowMarkers();
            this.initShadowFilter();
            this.root = this.data[0];
            this.root.x0 = this.height / 2;
            this.root.y0 = 0;
            this.centerNode(this.root);
            d3.select(self.frameElement).style("height", "500px");
        };
        MindMapController.prototype.$onChanges = function (changes) {
            if (changes.data && changes.data.currentValue !== changes.data.previousValue) {
                this.data = changes.data.currentValue;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvbWluZF9tYXAvTWluZE1hcC50cyIsInNyYy9taW5kX21hcC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxzQkFBb0I7QUFFcEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUU7SUFDMUIsWUFBWTtDQUNmLENBQUMsQ0FBQzs7QUNKSCxDQUFDO0lBT0csSUFBTSxlQUFlLEdBQXFCO1FBQ3RDLElBQUksRUFBRSxVQUFVO0tBQ25CLENBQUE7SUFFRDtRQUFBO1FBSUEsQ0FBQztRQUFELDZCQUFDO0lBQUQsQ0FKQSxBQUlDLElBQUE7SUFFRDtRQWtDSSwyQkFDWSxRQUFnQjtZQUQ1QixpQkFNQztZQUxXLGFBQVEsR0FBUixRQUFRLENBQVE7WUFsQ3BCLGFBQVEsR0FBVyxHQUFHLENBQUM7WUFFdkIsV0FBTSxHQUFRO2dCQUNsQixHQUFHLEVBQUUsRUFBRTtnQkFDUCxLQUFLLEVBQUUsR0FBRztnQkFDVixNQUFNLEVBQUUsRUFBRTtnQkFDVixJQUFJLEVBQUUsR0FBRzthQUNaLENBQUM7WUFJTSxnQkFBVyxHQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQyxpQkFBWSxHQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQU01QyxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUNoQyxpQkFBWSxHQUFRLElBQUksQ0FBQztZQUN6QixZQUFPLEdBQVEsSUFBSSxDQUFDO1lBQ3BCLGlCQUFZLEdBQVEsSUFBSSxDQUFDO1lBQ3pCLHFCQUFnQixHQUFRO2dCQUM1QixDQUFDLEVBQUUsSUFBSTtnQkFDUCxDQUFDLEVBQUUsSUFBSTthQUNWLENBQUM7WUFDTSxtQkFBYyxHQUFRO2dCQUMxQixDQUFDLEVBQUUsSUFBSTtnQkFDUCxDQUFDLEVBQUUsSUFBSTth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LEdBQUcsU0FBUyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTyxnQ0FBSSxHQUFaO1lBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzNHLENBQUM7UUFDTCx3QkFBQztJQUFELENBMUpBLEFBMEpDLElBQUE7SUFFRCxJQUFNLE9BQU8sR0FBeUI7UUFDbEMsVUFBVSxFQUFFLGlCQUFpQjtRQUM3QixRQUFRLEVBQUUsZUFBZTtLQUM1QixDQUFBO0lBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7U0FDdkIsU0FBUyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUMxQyxDQUFDOzs7QUNwTEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFakMscUJBQW1CIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAnLi9taW5kX21hcCc7XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgncGlwRGlhZ3JhbXMnLCBbXHJcbiAgICAncGlwTWluZE1hcCdcclxuXSk7Iiwie1xyXG4gICAgaW50ZXJmYWNlIElNaW5kTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgZGF0YTogYW55O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IE1pbmRNYXBCaW5kaW5nczogSU1pbmRNYXBCaW5kaW5ncyA9IHtcclxuICAgICAgICBkYXRhOiAnPHBpcERhdGEnXHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTWluZE1hcEJpbmRpbmdzQ2hhbmdlcyBpbXBsZW1lbnRzIG5nLklPbkNoYW5nZXNPYmplY3QsIElNaW5kTWFwQmluZGluZ3Mge1xyXG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcclxuXHJcbiAgICAgICAgZGF0YTogbmcuSUNoYW5nZXNPYmplY3QgPCBhbnkgPiA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgTWluZE1hcENvbnRyb2xsZXIgaW1wbGVtZW50cyBuZy5JQ29udHJvbGxlciwgSU1pbmRNYXBCaW5kaW5ncyB7XHJcbiAgICAgICAgcHJpdmF0ZSBkdXJhdGlvbjogbnVtYmVyID0gNzUwO1xyXG4gICAgICAgIHByaXZhdGUgcm9vdDogYW55O1xyXG4gICAgICAgIHByaXZhdGUgbWFyZ2luOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIHRvcDogMjAsXHJcbiAgICAgICAgICAgIHJpZ2h0OiAxMjAsXHJcbiAgICAgICAgICAgIGJvdHRvbTogMjAsXHJcbiAgICAgICAgICAgIGxlZnQ6IDEyMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcHJpdmF0ZSBwYXJlbnQ6IEpRdWVyeTtcclxuICAgICAgICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHZpZXdlcldpZHRoOiBudW1iZXIgPSAkKGRvY3VtZW50KS53aWR0aCgpO1xyXG4gICAgICAgIHByaXZhdGUgdmlld2VySGVpZ2h0OiBudW1iZXIgPSAkKGRvY3VtZW50KS5oZWlnaHQoKTtcclxuICAgICAgICBwcml2YXRlIHN2ZzogYW55O1xyXG4gICAgICAgIHByaXZhdGUgem9vbUxpc3RlbmVyOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSBkcm9wU2hhZG93RmlsdGVyOiBhbnk7XHJcbiAgICAgICAgcHJpdmF0ZSB0cmVlOiBkMy5sYXlvdXQuVHJlZSA8IGFueSA+IDtcclxuICAgICAgICBwcml2YXRlIGxpbmU6IGQzLnN2Zy5MaW5lIDwgYW55ID4gO1xyXG4gICAgICAgIHByaXZhdGUgaXNEcmFnTGlua0hlYWQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBwcml2YXRlIHNlbGVjdGVkTGluazogYW55ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIG5ld05vZGU6IGFueSA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBkcmFnZWRDaXJjbGU6IGFueSA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGFydFBvaW50T2ZIZWFkOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIHg6IG51bGwsXHJcbiAgICAgICAgICAgIHk6IG51bGxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHByaXZhdGUgZW5kUG9pbnRPZkhlYWQ6IGFueSA9IHtcclxuICAgICAgICAgICAgeDogbnVsbCxcclxuICAgICAgICAgICAgeTogbnVsbFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBkYXRhOiBhbnlbXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgICAgIHByaXZhdGUgJGVsZW1lbnQ6IEpRdWVyeVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICB0aGlzLnpvb21MaXN0ZW5lciA9IGQzLmJlaGF2aW9yLnpvb20oKS5zY2FsZUV4dGVudChbMC4yLCAyLjVdKS5vbignem9vbScsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9vbSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25Jbml0KCkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudCA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5wYXJlbnQuaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLnBhcmVudC53aWR0aCgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbml0U3ZnKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdEFycm93TWFya2VycygpO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRTaGFkb3dGaWx0ZXIoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluaXQgY29vcmRpbmF0ZXMgZm9yIHJvb3QgZWxlbWVudCBUT0RPOiBtYXliZSBtb3ZlIHRvIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IHRoaXMuZGF0YVswXTtcclxuICAgICAgICAgICAgdGhpcy5yb290LngwID0gdGhpcy5oZWlnaHQgLyAyO1xyXG4gICAgICAgICAgICB0aGlzLnJvb3QueTAgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jZW50ZXJOb2RlKHRoaXMucm9vdCk7XHJcbiAgICAgICAgICAgIGQzLnNlbGVjdChzZWxmLmZyYW1lRWxlbWVudCkuc3R5bGUoXCJoZWlnaHRcIiwgXCI1MDBweFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyAkb25DaGFuZ2VzKGNoYW5nZXM6IE1pbmRNYXBCaW5kaW5nc0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgaWYgKGNoYW5nZXMuZGF0YSAmJiBjaGFuZ2VzLmRhdGEuY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzLmRhdGEucHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gY2hhbmdlcy5kYXRhLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBpbml0U3ZnKCkge1xyXG4gICAgICAgICAgICB0aGlzLnN2ZyA9IGQzXHJcbiAgICAgICAgICAgICAgICAuc2VsZWN0KHRoaXMuJGVsZW1lbnQuZ2V0KDApKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2lkJywgJ3Jvb3QnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB0aGlzLnZpZXdlcldpZHRoKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgdGhpcy5oZWlnaHQgLSA0KSAvLyBNaW51cyA0IHRvIGF2b2lkIHRoZSBhcHBlYXJhbmNlIG9mIGEgc2Nyb2xsXHJcbiAgICAgICAgICAgICAgICAuY2FsbCh0aGlzLnpvb21MaXN0ZW5lcilcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnYmFzZUcnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLm1hcmdpbi5sZWZ0ICsgXCIsXCIgKyB0aGlzLm1hcmdpbi50b3AgKyBcIilcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRBcnJvd01hcmtlcnMoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZnXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwibWFya2VyXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImFycm93XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJ2aWV3Qm94XCI6IFwiMCAtNSAxMCAxMFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmWFwiOiAzNixcclxuICAgICAgICAgICAgICAgICAgICBcInJlZllcIjogMCxcclxuICAgICAgICAgICAgICAgICAgICBcIm1hcmtlcldpZHRoXCI6IDQsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJtYXJrZXJIZWlnaHRcIjogNCxcclxuICAgICAgICAgICAgICAgICAgICBcIm9yaWVudFwiOiBcImF1dG9cIlxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5hcHBlbmQoXCJwYXRoXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImRcIiwgXCJNMCwtNUwxMCwwTDAsNVwiKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImFycm93SGVhZFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3ZnXHJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKFwibWFya2VyXCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cih7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImFycm93U2VsZWN0ZWRcIixcclxuICAgICAgICAgICAgICAgICAgICBcInZpZXdCb3hcIjogXCIwIC01IDEwIDEwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZYXCI6IDUyLFxyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmWVwiOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwibWFya2VyV2lkdGhcIjogNCxcclxuICAgICAgICAgICAgICAgICAgICBcIm1hcmtlckhlaWdodFwiOiA0LFxyXG4gICAgICAgICAgICAgICAgICAgIFwib3JpZW50XCI6IFwiYXV0b1wiXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZChcInBhdGhcIilcclxuICAgICAgICAgICAgICAgIC5hdHRyKFwiZFwiLCBcIk0wLC01TDEwLDBMMCw1XCIpXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYXJyb3dTZWxlY3RlZEhlYWRcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGluaXRTaGFkb3dGaWx0ZXIoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlciA9IHRoaXMuc3ZnLmFwcGVuZCgnc3ZnOmZpbHRlcicpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignaWQnLCAnZHJvcC1zaGFkb3cnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsICcxMzAlJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlci5hcHBlbmQoJ3N2ZzpmZUdhdXNzaWFuQmx1cicpXHJcbiAgICAgICAgICAgICAgICAuYXR0cignaW4nLCAnU291cmNlQWxwaGEnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3N0ZERldmlhdGlvbicsIDEpXHJcbiAgICAgICAgICAgICAgICAuYXR0cigncmVzdWx0JywgJ2JsdXInKTtcclxuICAgICAgICAgICAgdGhpcy5kcm9wU2hhZG93RmlsdGVyLmFwcGVuZCgnc3ZnOmZlT2Zmc2V0JylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbicsICdibHVyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdkeCcsIDApXHJcbiAgICAgICAgICAgICAgICAuYXR0cignZHknLCAyKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3Jlc3VsdCcsICdvZmZzZXRCbHVyJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlci5hcHBlbmQoJ3N2ZzpmZUNvbXBvbmVudFRyYW5zZmVyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbicsICdvZmZzZXRCbHVyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdyZXN1bHQnLCAndHJhbnNmZXInKVxyXG4gICAgICAgICAgICAgICAgLmFwcGVuZCgnc3ZnOmZlRnVuY0EnKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ3R5cGUnLCAnbGluZWFyJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdzbG9wZScsIDAuNCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcFNoYWRvd0ZpbHRlci5hcHBlbmQoJ3N2ZzpmZUJsZW5kJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbicsICdTb3VyY2VHcmFwaGljJylcclxuICAgICAgICAgICAgICAgIC5hdHRyKCdpbjInLCAndHJhbnNmZXInKVxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ21vZGUnLCAnbm9ybWFsJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGNlbnRlck5vZGUoc291cmNlOiBhbnkpIHtcclxuICAgICAgICAgICAgbGV0IHNjYWxlID0gdGhpcy56b29tTGlzdGVuZXIuc2NhbGUoKSxcclxuICAgICAgICAgICAgICAgIHggPSAtc291cmNlLngwLFxyXG4gICAgICAgICAgICAgICAgeSA9IC1zb3VyY2UueTA7XHJcblxyXG4gICAgICAgICAgICB4ID0geCAqIHNjYWxlICsgdGhpcy52aWV3ZXJXaWR0aCAvIDI7XHJcbiAgICAgICAgICAgIHkgPSB5ICogc2NhbGUgKyB0aGlzLnZpZXdlckhlaWdodCAvIDI7XHJcblxyXG4gICAgICAgICAgICBkMy5zZWxlY3QoJy5iYXNlRycpLnRyYW5zaXRpb24oKVxyXG4gICAgICAgICAgICAgICAgLmR1cmF0aW9uKHRoaXMuZHVyYXRpb24pXHJcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHggKyBcIixcIiArIHkgKyBcIilzY2FsZShcIiArIHNjYWxlICsgXCIpXCIpO1xyXG4gICAgICAgICAgICB0aGlzLnpvb21MaXN0ZW5lci5zY2FsZShzY2FsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuem9vbUxpc3RlbmVyLnRyYW5zbGF0ZShbeCwgeV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB6b29tKCkge1xyXG4gICAgICAgICAgICB0aGlzLnN2Zy5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgZDMuZXZlbnRbJ3RyYW5zbGF0ZSddICsgXCIpc2NhbGUoXCIgKyBkMy5ldmVudFsnc2NhbGUnXSArIFwiKVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgTWluZE1hcDogbmcuSUNvbXBvbmVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgY29udHJvbGxlcjogTWluZE1hcENvbnRyb2xsZXIsXHJcbiAgICAgICAgYmluZGluZ3M6IE1pbmRNYXBCaW5kaW5nc1xyXG4gICAgfVxyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdwaXBNaW5kTWFwJylcclxuICAgICAgICAuY29tcG9uZW50KCdwaXBNaW5kTWFwJywgTWluZE1hcCk7XHJcbn0iLCJhbmd1bGFyLm1vZHVsZSgncGlwTWluZE1hcCcsIFtdKTtcclxuXHJcbmltcG9ydCAnLi9NaW5kTWFwJzsiXX0=