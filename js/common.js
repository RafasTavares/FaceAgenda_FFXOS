$(document).on('pageinit', function () {
  $.mobile.defaultPageTransition = 'none';
});

$(document).ajaxStart(function() {
  $.mobile.loading("show");
}).ajaxStop(function() {
  $.mobile.loading("hide");
});

function initialize(lat, lng) {
  var mapOptions = {
    center: new google.maps.LatLng(lat, lng),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    map: map
  });
}