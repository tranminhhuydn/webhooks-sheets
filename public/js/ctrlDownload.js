'use strict';

/* Controllers */
//https://thuvienhoasen.org/a3535/phat-hoc-pho-thong-khoa-thu-1-nhan-thua-phat-giao
function AppCtrl($scope, socket) {
  $scope.status ={index:0,length:0,currentPoint:0}
  $scope.currentPoint = $scope.status.currentPoint 
  
  // Socket listeners
  // ================
  
  socket.on('send:download', function (site) {
    $scope.sites.push(site);
    if(site.index)
    $scope.status.index = site.index
  });
  socket.on('send:status', function (status) {
    $scope.status = status;
  });
  // Private helpers
  // ===============

  // Methods published to the scope
  // ==============================
  $scope.sites = [];
  $scope.sendDownload = function () {
    
    socket.emit('send:download', {
      site: $scope.site,
      projectName:$scope.projectName,
      currentPoint:$scope.currentPoint
    });

    // add the message to our model locally
    // $scope.sites.push({
    //   text: $scope.site
    // });
    //reset site
    $scope.sites = []
    // clear siteDownload box
    //$scope.site = '';
  };


  socket.on('/downloadfile/download', function (site) {
    //alert(site)
    $scope.sites.push(site);
    if(site.index)
    $scope.status.index = site.index
  });

  $scope.sendDownloadv2 = function () {
    
    socket.emit('/downloadfile/download', {
      site: $scope.site,
      projectName:$scope.projectName,
      currentPoint:$scope.currentPoint
    });

    // add the message to our model locally
    // $scope.sites.push({
    //   text: $scope.site
    // });
    //reset site
    $scope.sites = []
    // clear siteDownload box
    //$scope.site = '';
  };
}
 