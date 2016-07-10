describe('testing controller', function () {

  var $httpBackend, $scope, createController;

  var $controller;

  // Called before each 'it'
  beforeEach(function (){
    angular.mock.module('app');

    angular.mock.inject(function($injector){
      
      // We will use this to create controllers inside every 'it'.
      var $controller = $injector.get('$controller');
      
      // We will use this to mock http request inside every 'it'.
      $httpBackend = $injector.get('$httpBackend');
      
      // We will use this to create a scope for every controller inside every 'it'.
      $scope = $injector.get('$rootScope');

      createController = function() {
        return $controller('controller', {'$scope' : $scope });
      };
    });

  });

  // Called after each 'it'.
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('$scope.getGithubUser', function() {

    // Wrong API 
    it('try to get user with wrong api', function() {
      var controller = createController();
      // The server is not responding, so the $http service will return -1.
      // I found this by using console.log to print the error when the url was wrong.
      $httpBackend.expectGET('https://api.github.com/users/').respond(-1, '');
      $scope.username = '';
      $scope.getGithubUser();
      $httpBackend.flush();
      // Checks
      expect($scope.serverFound).toEqual(false);
      });

    // Wrong user name.  
    it('try to get user without name', function() {
      var controller = createController();
      // I saw the 404 response code using the firefox webtools.
      $httpBackend.expectGET('https://api.github.com/users/').respond(404, '');
      $scope.username = '';
      $scope.getGithubUser();
      $httpBackend.flush();
      expect($scope.serverFound).toEqual(true);
      expect($scope.userTried).toEqual(true);
      expect($scope.userFound).toEqual(false);
    });

    // No repos. 
    it('try to get user without repos', function() {
      var controller = createController();
      // I saw the response contents using the firefox webtools.
      $httpBackend.expectGET('https://api.github.com/users/user1')
      .respond(200,' { ' +
        ' "name": "user 1", ' +
        ' "avatar_url": "https://avatars.githubusercontent.com/u/123", ' +
        ' "public_repos": 0 ' +
      '}');
      $scope.username = 'user1';
      $scope.getGithubUser();
      $httpBackend.flush();
      expect($scope.serverFound).toEqual(true);
      expect($scope.userTried).toEqual(true);
      expect($scope.userFound).toEqual(true);
      expect($scope.reposFound).toEqual(false);
      expect($scope.name).toEqual('user 1');
      expect($scope.avatar_url).toEqual('https://avatars.githubusercontent.com/u/123');
    });
    
    // User with repos.
    it('try to get user with repos', function() {
      var controller = createController();
      $httpBackend.expectGET('https://api.github.com/users/user1')
      .respond(200,' { ' +
        ' "name": "user 1", ' +
        ' "avatar_url": "https://avatars.githubusercontent.com/u/123", ' +
        ' "public_repos": 1 ' +
      '}');
      $httpBackend.expectGET('https://api.github.com/users/user1/repos')
      .respond(200,' [{ ' +
        ' "html_url": "https://github.com/user1/repo1", ' +
        ' "name": "repo1", ' +
        ' "description": "My repo" ' +
      '}]');
      $scope.username = 'user1';
      $scope.getGithubUser();
      $httpBackend.flush();
      expect($scope.serverFound).toEqual(true);
      expect($scope.userTried).toEqual(true);
      expect($scope.userFound).toEqual(true);
      expect($scope.reposFound).toEqual(true);
      expect($scope.name).toEqual('user 1');
      expect($scope.avatar_url).toEqual('https://avatars.githubusercontent.com/u/123');
      expect($scope.repoData[0].html_url).toEqual('https://github.com/user1/repo1');
      expect($scope.repoData[0].name).toEqual('repo1');
      expect($scope.repoData[0].description).toEqual('My repo');
    });

  });
});
