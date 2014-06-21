$(document).ready(function() {
  $.getJSON( "./data.py", function( data ) {

    var daySeconds = 60 * 60 * 24;
    var weekSeconds = 7 * daySeconds;

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

    for (day in freq) {
      dayObj = freq[day];
      for (hour = _i = 0; _i <= 23; hour = ++_i) {
        dayObj[hour] = 0;
      }
    }

    for (_j = 0, _len = data.length; _j < _len; _j++) {
      _ref = data[_j], opened = _ref[0], closed = _ref[1];
      daysPassed = [opened, closed].map(function(t) {
        return Math.floor(t / daySeconds);
      });
      _ref1 = daysPassed.map(function(days) {
        return days % 7;
      }), dayOpened = _ref1[0], dayClosed = _ref1[1];
      if (dayOpened === dayClosed) {
        freq[map[dayOpened]] += (opened - closed) / daySeconds;
      } else {
        for (i = _k = dayOpened; dayOpened <= dayClosed ? _k <= dayClosed : _k >= dayClosed; i = dayOpened <= dayClosed ? ++_k : --_k) {
          switch (i) {
            case dayOpened:
              freq[map[i]] += (daySeconds - (opened % daySeconds)) / daySeconds;
              break;
            case dayClosed:
              freq[map[i]] += (closed % daySeconds) / daySeconds;
              break;
            default:
              freq[map[i]] += 1;
          }
        }
      }
    }

    console.log(JSON.stringify(freq));
    console.log(JSON.stringify(data));
  })
});
