satellite.ng.app.services.authServiceFactory = function ($baseHttpService, $q, $window)
{
  var svc = this;

  $.extend( svc, $baseHttpService);

  svc.name = "auth";

  svc.getCurrent = _getCurrent;
  svc.login = _login;
  svc.register = _register;
  svc.logout = _logout;

  svc.user = null;

  _init();

  function _init()
  {
    if ($window.sessionStorage["userInfo"]) {
      svc.user = JSON.parse($window.sessionStorage["userInfo"]);
    }
  }

  function _getCurrent(data, onSuccess, onError)
  {
    if(svc.user === {})
      return false;

    return svc.user;
  }

  function _logout() {
    var deferred = $q.defer();

    $http({
      method: "POST",
      url: "/api/auth/logout"

    }).then(function(result) {

      $window.sessionStorage["userInfo"] = null;
      svc.user = null;
      deferred.resolve(result);

    }, function(error) {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  function _register(userName, email, password) {

    var deferred = $q.defer();

    svc.$http.post("/api/auth/local/register", {
      username: userName,
      email:email,
      password: password
    }).then(function(result) {

      console.log("response from server", result);

      svc.user = {
        accessToken: result.data.access_token,
        userName: result.data.userName
      };

      $window.sessionStorage["userInfo"] = JSON.stringify(svc.user);

      deferred.resolve(svc.user);

    }, function(error) {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  function _login(userName, password) {

    var deferred = $q.defer();

    svc.$http.post("/api/auth/local", {
      identifier: userName,
      password: password
    }).then(function(result) {

      console.log("response from server", result);

      svc.user = {
        accessToken: result.data.access_token,
        userName: result.data.userName
      };

      $window.sessionStorage["userInfo"] = JSON.stringify(svc.user);

      deferred.resolve(svc.user);

    }, function(error) {
      deferred.reject(error);
    });

    return deferred.promise;
  }

};

satellite.ng.addService(satellite.ng.app.module
  , "$authService"
  , ["$baseHttpService", "$q", "$window"]
  , satellite.ng.app.services.authServiceFactory);
