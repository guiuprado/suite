angular.module('gsApp.workspaces.maps', [
  'gsApp.workspaces.maps.new',
  'gsApp.alertpanel',
  'gsApp.core.utilities',
  'ngSanitize'
])
.config(['$stateProvider',
    function($stateProvider) {
      $stateProvider.state('workspace.maps', {
        url: '/maps',
        templateUrl: '/workspaces/detail/maps.tpl.html',
        controller: 'WorkspaceMapsCtrl',
        abstract: true
      });
      $stateProvider.state('workspace.maps.main', {
        url: '/',
        templateUrl: '/workspaces/detail/maps/maps.main.tpl.html',
        controller: 'MapsMainCtrl'
      });
      $stateProvider.state('workspace.maps.new', {
        url: '/new',
        templateUrl: '/workspaces/detail/maps/createnew/map.new.tpl.html',
        controller: 'NewMapCtrl'
      });
    }])
.controller('WorkspaceMapsCtrl', ['$scope', '$state', '$stateParams',
  '$sce', '$window', '$log', 'GeoServer', 'AppEvent',
    function($scope, $state, $stateParams, $sce, $window, $log,
      GeoServer, AppEvent) {

      $scope.workspace = $stateParams.workspace;
      $scope.thumbnails = {};
      $scope.olmaps = {};

      GeoServer.maps.get($scope.workspace).then(
        function(result) {
          if (result.success) {
            $scope.maps = result.data;

            // load all map thumbnails & metadata
            for (var i=0; i < $scope.maps.length; i++) {
              var map = $scope.maps[i];
              var layers = '';

              $scope.maps[i].workspace = $scope.workspace;
              $scope.maps[i].layergroupname = $scope.workspace + ':' + map.name;
              var bbox = $scope.maps[i].bbox = '&bbox=' + map.bbox.west +
               ',' + map.bbox.south + ',' + map.bbox.east + ',' +
               map.bbox.north;

              var url = GeoServer.map.thumbnail.get(map.workspace,
                map.layergroupname, 250, 250);
              var srs = '&srs=' + map.proj.srs;

              $scope.thumbnails[map.name] = url + bbox +
                '&format=image/png' + srs;
            }
          } else {
            $scope.alerts = [{
              type: 'warning',
              message: 'Unable to load workspace maps.',
              fadeout: true
            }];
          }
        });

      $scope.mapsHome = function() {
        if (!$state.is('workspace.maps.main')) {
          $state.go('workspace.maps.main', {workspace:$scope.workspace});
        }
      };

      $scope.createMap = function() {
        $state.go('workspace.maps.new', {workspace:$scope.workspace});
      };
      $scope.$on(AppEvent.CreateNewMap, function() {
        $scope.createMap();
      });

    }])
.controller('MapsMainCtrl', ['$scope', '$state', '$stateParams',
  '$sce', '$window', '$log', 'GeoServer',
    function($scope, $state, $stateParams, $sce, $window, $log,
      GeoServer) {

      $scope.workspace = $stateParams.workspace;

      $scope.sanitizeHTML = function(description) {
        return $sce.trustAsHtml(description);
      };

      $scope.newOLWindow = function(map) {
        var baseUrl = GeoServer.map.openlayers.get(map.workspace,
          map.name, map.bbox, 800, 500);
        $window.open(baseUrl);
      };

      $scope.onEdit = function(map) {
        $state.go('map.compose', {
          workspace: map.workspace,
          name: map.name
        });
      };

    }]);