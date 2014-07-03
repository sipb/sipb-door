// Angular module
var heatApp = angular.module('heatApp', []);

// Angular Controller 
function visualControl($scope, $filter, $http) {

  /*
    INITIALIZE VARIABLES
  */

  // Datetime manipulation functions
  var hourSeconds = 60 * 60
  var daySeconds = 24 * hourSeconds;
  var weekSeconds = 7 * daySeconds;

  // Contains references to svg rectangles representing the timetable 
  var heats = [[],[],[],[],[],[],[]];

  // Semantic map of day index -> day name
  var dayMap = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
  };

  // Global object that contains percentage of time door is opened
  var freq = {
    sunday: {},
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {}
  };

  // Initialize empty angular form object
  $scope.formData = {};

  // Function that resets or initialises freq object
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

  // Form functions
  $scope.processForm = function() {
    d = $scope.formData
    if (!(d.startDate || d.endDate)) {
      $scope.message = "Invalid date formats! Need to set both dates!";
    } else if (d.startDate.getTime() > d.endDate.getTime()) {
      $scope.message = "Invalid dates! The first date should be before the second date!";
    } else {
      // Convert to Unixtime without affecting original object
      r = {}
      r.startDate = Date.parse($filter('date')(d.startDate, 'dd/MMM/yyyy HH:mm:ss')) / 1000;
      r.endDate = Date.parse($filter('date')(d.endDate, 'dd/MMM/yyyy HH:mm:ss')) / 1000;
      $http({
          method  : 'POST',
          url     : './data.cgi',
          data    : r,
          headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  
      })
        .success(function(data) {
          resetHeats();
          updateGraphic(data);          
          $scope.message = "Got data!"
        });
    }
  }

  /*
    INITIAL DISPLAY
  */

  // Display stuff here
  svgContainer = d3.select("body").append("svg")
      .attr("width", 800)
      .attr("height", 620)
      //.style("border", "1px solid #ccc");

  for (i = _l = 0; _l <= 23; i = ++_l) {
    text = svgContainer.append("text")
        .attr("x", 25)
        .attr("y", 63 + i * 20)
        .style("text-anchor", "middle")
        .text(i + "h");
  }

  // Display gradient bar
  gradient = svgContainer.append("svg:defs")
    .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

  gradient.append("svg:stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffffff");

  gradient.append("svg:stop")
      .attr("offset", "50%")
      .attr("stop-color", "#C86C59");

  gradient.append("svg:stop")
      .attr("offset", "90%")
      .attr("stop-color", "#221105");

  gradient.append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", "#000000");

  svgContainer.append("rect")
      .attr("x", 90)
      .attr("y", 560)
      .attr("width", 500)
      .attr("height", 20)
      .style({
        "fill": "url(#gradient)",
        "stroke": "#D6D6D6",
        "stroke-width": "1px"
      });

  svgContainer.append("text")
      .attr("x", 65)
      .attr("y", 574)
      .style("text-anchor", "middle")
      .text("0%");

  svgContainer.append("text")
      .attr("x", 620)
      .attr("y", 574)
      .style("text-anchor", "middle")
      .text("100%");

  // Display labels
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
            "fill": "hsl(12, 50%, 50%)",
            "stroke": "#D6D6D6",
            "stroke-width": "1px"
          });
    }
  }

  // Update graphic given data tuples
  updateGraphic = function(data) {
    var occurrence = (data[data.length-1][1] - data[0][0]) / weekSeconds;
    occurrence = Math.max(occurrence, 1);

    // Sets freq object to contain fraction of hours opened
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

      for (hour in dayFreq) {
        if (hour == 24) continue;
        frac = dayFreq[hour] / occurrence;
        hue = 24 * frac;
        lightness = (1 - frac) * 100;
        
        heats[i][hour].transition().style("fill", "hsl(" + hue + ", 50%," + lightness + "%)").duration(1000).delay( i * 120 + Number(hour) * 10);
      }
    }
  }

}
