var controller = angular.module('ShowDifferentImageByNumOfChatAndViewer.home', []);

controller.controller('ShowDifferentImageByNumOfChatAndViewer.home', ['socket','$scope', 
    function(socket, $scope){
        $scope.State = {
            currentCut: {
                cut: 0,
                imagePath: 'img/default.gif'
            }
        }
        socket.on('common', function(data){
            $scope.State = data
        });
        socket.emit('common',{});
    }
]);