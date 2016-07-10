angular.module('app', [])

.controller('controller', function($scope, $http) {

  var githubUrl = "https://api.github.com/users/";

  // Resets all variables of scope.
  function resetVars() {
    $scope.serverFound = true;
    $scope.userTried = false;
    $scope.userFound = false;
    $scope.reposFound = false;
  }

  resetVars();
  
  // This function is called only when the user has repositories.
  // It makes another http get request to the GitHub API.
  function loadRepos() {
    $http.get(githubUrl + $scope.username + "/repos")
    .success(function (data) {
      // Repos found.
      $scope.repoData = data;
      if (data.message ==  "Not Found") {
        // In normal conditions it must not reach here.
        // User does not have repos.
        $scope.reposFound = false;
      }
    })
    .error(function (data, status) {
      // In normal conditions it must not reach here.
      // User does not exist.
      $scope.reposFound = false;
    });
  };

  // Makes a http request to  github in order to get the user.
  // If the user has repos, it will try to get the repos too.
  $scope.getGithubUser = function () {
    resetVars();

    $http.get(githubUrl + $scope.username)
    .success(function (data) {
      $scope.userTried = true;

      if (data.login == 'undefined') {
        // We requested a user without providing a username.
        $scope.userFound = false;
        return;
      }

      // User found.
      $scope.userFound = true;
      
      // If the user does not have a name then we use his login name.
      if (data.name == "") {
        $scope.name = data.login;
      } else {
        $scope.name = data.name;
      }

      $scope.avatar_url = data.avatar_url;

      if (data.public_repos==0) {
        // User does not have repos.
        $scope.reposFound = false;
      } else {
        // User has repos, try to read them.  
        $scope.reposFound = true;
        loadRepos();
      }
    })
    .error(function (data, status) {
      if (status==-1) {
        // The server does not exist.
        $scope.serverFound = false;
      }
      //User not found.
      $scope.userTried = true;
      $scope.userFound = false;
    });
  }

})
