const STATES = [{ 
    title: 'Mind Map',
    icon: 'share',
    name: 'mind_map', 
    url: '/mind_map', 
    controller: 'pipMindMapSampleController', 
    templateUrl: 'MindMapSample.html' 
}];

function configureDiagramsRoutes(
    $stateProvider,//: ng.ui.IStateProvider
    $mdIconProvider,
    $urlRouterProvider
) {
    "ngInject";

    $mdIconProvider.iconSet('icons', '../lib/images/icons.svg', 512);

    // Configure module routes
    _.each(STATES, (state) => {
        $stateProvider.state(state.name, {
            url: state.url, 
            controller: state.controller, 
            controllerAs: 'vm',
            templateUrl: state.templateUrl
        })
    });

    $urlRouterProvider.otherwise('/mind_map');
}

class MainController {
    constructor(
        $scope,//: angular.IScope
        $rootScope,
        $state,
        $mdSidenav,
        pipSystemInfo//: pip.services.ISystemInfo
    ) {
        $scope.title = 'Diagrams';
        $scope.content = STATES;
        $scope.browser = pipSystemInfo.browserName;

        $scope.onSwitchPage = (state) => {
            $mdSidenav('left').close();
            $state.go(state);
        };

        $scope.onToggleMenu = () => {
            $mdSidenav('left').toggle();
        };

        $scope.isActiveState = (state) => {
            return $state.current.name == state;
        };

    }
}

angular
    .module('app.Diagrams', ['ngMaterial', 'pipServices', 'pipDiagrams'])
    .controller('samplesMainController', MainController)
    .config(configureDiagramsRoutes);