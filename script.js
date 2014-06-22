$(document).ready(function() {
  $.getJSON( "./data.py", function( data ) {

    var hourSeconds = 60 * 60
    var daySeconds = 24 * hourSeconds;
    var weekSeconds = 7 * daySeconds;

    console.log(data);

    var occurrence = (data[data.length-1][1] - data[0][0]) / (hourSeconds * 24 * 7)

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

    // Initialise 24 hour object
    for (day in freq) {
      dayObj = freq[day];
      for (hour = _i = 0; _i <= 23; hour = ++_i) {
        dayObj[hour] = 0;
      }
    }

    updateHours = function(day, opened, closed) {
      var hourClosed, hourOpened, i, _j, _results;
      hourOpened = Math.floor(opened / hourSeconds);
      hourClosed = Math.floor(closed / hourSeconds);
      opened = opened - hourOpened * hourSeconds;
      closed = closed - hourClosed * hourSeconds;

      if (hourOpened === hourClosed) {
        day[hourOpened] += (opened - closed) / hourSeconds;
      } else {
        for (i = _j = hourOpened; hourOpened <= hourClosed ? _j <= hourClosed : _j >= hourClosed; i = hourOpened <= hourClosed ? ++_j : --_j) {
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
        console.log("hi");
        updateHours(freq[dayMap[dayOpened]], residueOpened, residueClosed);
      } else {
        for (i = _k = dayOpened; dayOpened <= dayClosed ? _k <= dayClosed : _k >= dayClosed; i = dayOpened <= dayClosed ? ++_k : --_k) {
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

    svgContainer = d3.select("body").append("svg")
        .attr("width", 800)
        .attr("height", 580)
        .style("border", "1px solid #ccc");

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
        frac = dayFreq[hour] / occurrence;
        console.log(frac);
        y = hour * 20;
        hue = 25 * frac;
        lightness = (1 - frac) * 100;
        
        rectangle = svgContainer.append("rect")
            .attr("x", 50 + x)
            .attr("y", 50 + y)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", 100)
            .attr("height", 20)
            .style({
              "fill": "hsl(" + hue + ",50%," + lightness + "%)",
              "stroke": "#E6E6E6",
              "stroke-width": "1px"
            });
      }
    }

    console.log(JSON.stringify(freq));
  })
});
