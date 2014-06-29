// Angular module
var heatApp = angular.module('heatApp', []);

// Angular Controller 
function visualControl($scope, $http) {

  /*
    INITIALIZE VARIABLES
  */

  // Datetime manipulation functions
  var hourSeconds = 60 * 60
  var daySeconds = 24 * hourSeconds;
  var weekSeconds = 7 * daySeconds;

  var heats = [[],[],[],[],[],[],[]];

  var dayMap = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
  };

  var freq = {
    sunday: {},
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {}
  };

  // Function that resets or initialises heats 
  resetHeats = function() {
    for (day in freq) {
      dayObj = freq[day];
      for (hour = _i = 0; _i <= 23; hour = ++_i) {
        dayObj[hour] = 0;
      }
    }
  }

  // Initialise 24 hour object
  resetHeats();

  // Acquire data
  $http({
      method  : 'POST',
      url     : './data.cgi',
  })
    .success( function( data, status ) {
      updateGraphic(data);
    })
    .error(function(data, status, headers, config) {
      console.log("error! go work on better debugging, you.");
    });

  /*
    FUNCTIONS
  */

  // Form functions
  $scope.formData = {};

  $scope.processForm = function() {
    d = $scope.formData
    if (typeof(d.startDate) == "undefined" || typeof(d.endDate) == "undefined"){
      $scope.message = "Need to set both dates!";
    } else if (d.startDate.getTime() > d.endDate.getTime()) {
      $scope.message = "Invalid! The first date is after the second date!";
    } else {
      $http({
          method  : 'POST',
          url     : './data.cgi',
          data    : d,
          headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
      })
        .success(function(data) {
          $scope.message = "Got data, but display function not properly set"
          resetHeats();
          updateGraphic(data);          
        });
    }
  }


  /*
    INITIAL DISPLAY
  */

  // Display stuff here
  svgContainer = d3.select("body").append("svg")
      .attr("width", 800)
      .attr("height", 580);
      //.style("border", "1px solid #ccc");

  for (i = _l = 0; _l <= 23; i = ++_l) {
    text = svgContainer.append("text")
        .attr("x", 25)
        .attr("y", 63 + i * 20)
        .style("text-anchor", "middle")
        .text(i + "h");
  }

  // Display gradient bar
  //legend = svgContainer.append("rect")
  //    .attr

  for (i = _l = 0; _l <= 6; i = ++_l) {
    dayFreq = freq[dayMap[i]];
    x = i * 100;

    text = svgContainer.append("text")
        .attr("x", 100 + x)
        .attr("y", 40)
        .style("text-anchor", "middle")
        .text(dayMap[i])

    for (hour in dayFreq) {
      if (hour == 24) continue;
      y = hour * 20;
      
      heats[i][hour] = svgContainer.append("rect")
          .attr("x", 50 + x)
          .attr("y", 50 + y)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("width", 100)
          .attr("height", 20)
          .style({
            "fill": "hsl(240, 50%, 100%)",
            "stroke": "#E6E6E6",
            "stroke-width": "1px"
          });
    }
  }

  // Begin update graphic function
  updateGraphic = function(data) {
    var occurrence = (data[data.length-1][1] - data[0][0]) / (hourSeconds * 24 * 7);

    updateHours = function(day, opened, closed) {
      var i, _j, _results;
      var hourOpened = Math.floor(opened / hourSeconds);
      var hourClosed = Math.floor(closed / hourSeconds);
      opened = opened - hourOpened * hourSeconds;
      closed = closed - hourClosed * hourSeconds;

      if (hourOpened === hourClosed) {
        day[hourOpened] += (opened - closed) / hourSeconds;
      } else {
        for (i = _j = hourOpened; _j <= hourClosed; i = ++_j) {
          switch (i) {
            case hourOpened:
              day[i] += (hourSeconds - opened) / hourSeconds;
              break;
            case hourClosed:
              day[i] += closed / hourSeconds;
              break;
            default:
              day[i] += 1;
          }
        }
      }
    };

    for (_j = 0, _len = data.length; _j < _len; _j++) {
      tuple = data[_j];
      daysPassed = tuple.map(function(t) {
        return Math.floor(t / daySeconds);
      });
      residueOpened = tuple[0] - daysPassed[0] * daySeconds;
      residueClosed = tuple[1] - daysPassed[1] * daySeconds;
      _ref1 = daysPassed.map(function(days) {
        return days % 7;
      }), dayOpened = _ref1[0], dayClosed = _ref1[1];

      if (daysPassed[0] === daysPassed[1]) {
        updateHours(freq[dayMap[dayOpened]], residueOpened, residueClosed);
      } else {
        for (i = dayOpened; dayOpened < dayClosed ? i <= dayClosed : i >= dayClosed; dayOpened < dayClosed ? ++i : --i) {
          day = freq[dayMap[i]];
          switch (i) {
            case dayOpened:
              updateHours(day, residueOpened, daySeconds);
              break;
            case dayClosed:
              updateHours(day, 0, residueClosed);
              break;
            default:
              if (dayClosed > dayOpened) {
                updateHours(day, 0, daySeconds);
              }
          }
        } 
      } 
    }

    for (i = _l = 0; _l <= 6; i = ++_l) {
      dayFreq = freq[dayMap[i]];
      x = i * 100;

      for (hour in dayFreq) {
        if (hour == 24) continue;
        frac = dayFreq[hour] / occurrence;
        y = hour * 20;
        hue = 24 * frac;
        lightness = (1 - frac) * 100;
        
        heats[i][hour].transition().style("fill", "hsl(" + hue + ", 50%," + lightness + "%)").duration(1000).delay( i * 120 + Number(hour) * 10);
      }
    }
  }

}
