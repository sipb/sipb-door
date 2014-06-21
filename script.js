$(document).ready(function() {
  $.getJSON( "./data.py", function( data ) {
    console.log(JSON.stringify(data));
  })
});
