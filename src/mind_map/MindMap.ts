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

        data: ng.IChangesObject<any>;
    }

    class MindMapController implements ng.IController, IMindMapBindings {
        public data: any;

        constructor() { }

        public $onChanges(changes: MindMapBindingsChanges) {
            if (changes.data && changes.data.currentValue !== changes.data.previousValue) {
                this.data = changes.data.currentValue;
            }
        }
    }

    const MindMap: ng.IComponentOptions = {
        controller: MindMapController,
        bindings: MindMapBindings
    }

    angular.module('pipMindMap', [])
        .component('pipMindMap', MindMap);

}