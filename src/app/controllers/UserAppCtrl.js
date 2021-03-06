app.controller('UserAppCtrl',['$scope', '$http','$q', function($scope, $http, $q){

  // Default options for ChartJs directive.
  $scope.options = {
    animation: false,
    pointDot: false,
    benzierCurve: false,
    scaleGridLineColor: "rgba(0,0,0,0)",
    scaleLineColor: "rgba(0,0,0,0)",
    scaleShowGridLines: false,
    scaleShowLabels: false
  };
  
  // Initialize, and manipulate the data to a way that is usable.
  $scope.Init = function(){

    // Set height/width of our chart depending on the width of the monitor
    if(window.screen.width > 2400){

      $scope.chartHeight = 150;
      $scope.chartWidth = 400;

    } else if(window.screen.width < 1200){
      $scope.chartHeight = 100;
      $scope.chartWidth = 150;
      
    } else {
      $scope.chartHeight = 150;
      $scope.chartWidth = 250;
    }

    var d = $q.defer();

    // Wait for two async responses to return.
    // Then process this data.
    $q.all([
      getUsers(),
      getLogs()
    ]).then(function(data){
      $scope.users = data[0];
      $scope.logs  = data[1];
      // Join our data in a magical way!
      $scope.joinData();
    });

  };

  // Returns a promise to obtain user data.
  var getUsers = function(){
    var deferred = $q.defer();
    $http.get('users.json')
     .success(function(results){
        deferred.resolve(results);              
      });
    return deferred.promise;
  };

  // Returns a promise to obtain log data.
  var getLogs = function(){
    var deferred = $q.defer();
    $http.get('logs.json')
     .success(function(results){
        deferred.resolve(results);              
      });
    return deferred.promise;
  };


  // Joins the User, and the Log data together
  // (1) Joins user and log data together on user.id and log.user_id
  // (2) Calculates number of conversions/impressions, and sums conversion revenue.
  // (3) Fills an array with buckets that are each day, and the conversions recieved on those days.
  // (4) Formats data for graph, and modifies the User to contain all calculated data.
  $scope.joinData = function(){
    var impressionArr, num_impressions,
        conversionArr, num_conversions, revenue;

    // (1) Joins user and log data together on user.id and log.user_id
    _.map($scope.users, function(u){
        var timeBuckets = {};

        // (2) Calculates number of conversions/impressions, and sums conversion revenue.
        impressionArr = _.where($scope.logs, {user_id: u.id, type: 'impression'});
        numImpressions = impressionArr.length;
        conversionArr = _.where($scope.logs, {user_id: u.id, type: 'conversion'});
        numConversions = conversionArr.length;
        
        revenue = _(conversionArr).reduce(function(mem, d) {
          mem = parseInt(d.revenue) + mem;
          return mem;
        }, 0);

        var start = '';
        var end = '';

        // (3) Fills an array with buckets that are each day, and the conversions recieved on those days.
        _.map(conversionArr, function(o){

          o.dateObj = new Date(o.time);

          // Calculate the start and end dates of our range!
          if(start == ''){
            start = o.dateObj;
          } else if(start > o.dateObj){
            start = o.dateObj;
          }
          // if end date is less than the current date, then surely the end date is the current date!
          if(end == ''){
            end = o.dateObj;
          } else if(end < o.dateObj){
            end = o.dateObj;
          }

          var timeBucketKey = o.dateObj.getFullYear() + '-' + o.dateObj.getMonth() + '-'+ o.dateObj.getDate()
          if(!angular.isDefined(timeBuckets[timeBucketKey])){
            timeBuckets[timeBucketKey] = 0;
          }
          else{
            timeBuckets[timeBucketKey]++;
          }
        });

        // (4) Formats data for graph, and modifies the User to contain all calculated data.
        var lineBucketArr = [];
        var lineBucketLabels = [];
        

        _.each(timeBuckets, function(value,key) {
          lineBucketArr.push(value);
          lineBucketLabels.push('');
        });

        u.lineData = {
          labels : lineBucketLabels,
          datasets : [
          {
            fillColor : "rgba(0,0,0,0)",
            strokeColor : "rgba(0,0,0,1)",
            pointStrokeColor : "#fff",
            data : lineBucketArr
          }]
        };
        u.startDate = start.getMonth() + '/' + start.getDate() + '/' + start.getFullYear();
        u.endDate = end.getMonth() + '/' + end.getDate() + '/' + end.getFullYear();
        u.revenue = revenue;
        u.num_conversions = numConversions;
        u.num_impressions = numImpressions;
        return;
    });

  };

}]);
