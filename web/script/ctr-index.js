'use strict';

// Create a module for our core Store services
angular.module('dashboard')
.controller('indexController',['authenticationService','$scope','$window',
  function(authenticationService,$scope,$window) {
    $scope.currentYear = new Date().getFullYear();
    $scope.isAuthenticated = false;
    $scope.logingIn = false;

    //when the user is authenticated, hide the login screen and
    authenticationService
    .whenAuthenticated()
    .then(function(){
      $scope.logingIn = true;
      return authenticationService.getProfile();
    })
    .then(function(result){
        //TODO: once delievered, remove the rangle.io domain from below.
        if(['risevision.com','riseholdings.com','risedisplay.com','risenext.com','rangle.io'].indexOf(result.email.split('@')[1]) < 0 ){
          $scope.loginErrorMessage = 'Failed to Login: Your Email Domain is Not Allowed to Access This Page.';
          return authenticationService.logout();
        }else{
          $scope.userName = result.name;
          $scope.userEmail = result.email;
          $scope.userProfileImgUrl = result.picture;
          $scope.isAuthenticated = true;
        }        
    })
    .then(null,function(error){
      console.error(error);      
    })
    .finally(function(){
      $scope.logingIn = false;
    });

    //log the user out of the system
    $scope.logout = function(){
      authenticationService.logout()
      .then(function(){
        $window.location.reload();
      },function(error){console.error(error);});
    };

    //login the user and set display scope variables for the header
    $scope.login = function(){
      $scope.logingIn = true;

      authenticationService.login()
      .then(null, function(error){
        console.error(error);
        $scope.logingIn = false;
        $scope.loginErrorMessage = 'Failed to login: ' + error.toString();
      });             
    }; 
  }
]); //mainController