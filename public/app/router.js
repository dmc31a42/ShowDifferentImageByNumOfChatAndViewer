var router = angular.module('ShowDifferentImageByNumOfChatAndViewer.router', []);

router
    .config(['$urlRouterProvider',
        function($urlRouterProvider){
            $urlRouterProvider.otherwise('/home');
        }
    ]
);

router
    .config(['$stateProvider',
        function($stateProvider) {
            $stateProvider
                .state('home', {
                    url :'/home',
                    views: {
                        '': {
                            templateUrl: 'partials/home.html',
                            controller: 'ShowDifferentImageByNumOfChatAndViewer.home',
                        }
                    }
                })
        }
]);