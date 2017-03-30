

class MindMapController {
  //  public data//: any;

    constructor(
        $scope
    ) {
        // Initial test data
        $scope.data = [];
    }
}


angular
    .module('app.Diagrams')
    .controller('pipMindMapSampleController', MindMapController);