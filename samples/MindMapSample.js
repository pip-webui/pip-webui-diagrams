

class MindMapController {
  //  public data//: any;

    constructor(
        $scope
    ) {
        // Initial test data
        const children = [
            {title: 'Trip to Moscow', img: 'http://static.boredpanda.com/blog/wp-content/uploads/2016/01/moscow-city-looked-like-a-fairytale-during-orthodox-christmas-12__700.jpg'},
            {title: 'Write article', img: 'http://www.housingeurope.eu/site/theme/_assets/img/type-article.png'},
            {title: 'Read Business model generation', img: 'https://images-na.ssl-images-amazon.com/images/G/01/aplusautomation/vendorimages/166c46b1-fe38-484d-985c-4f2da8e95aad.jpg._CB522951874_.jpg'}
        ];

        $scope.data = [{title: 'Alex Dvoykin', img: 'https://pp.userapi.com/c323817/v323817971/44b9/Ip_p6lXHFbU.jpg', children: children}];
    }
}

angular
    .module('app.Diagrams')
    .controller('pipMindMapSampleController', MindMapController);