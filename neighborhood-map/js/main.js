var map;

var locations = [];

var infowindow = null;

//Define Locations
var locationObj1 = { id: "1", title: "SAP Labs India", lat: 12.9784095, lng: 77.7154715 };
var locationObj2 = { id: "2", title: "Phoenix Marketcity", lat: 12.9827538, lng: 77.7038393 };
var locationObj3 = { id: "3", title: "Kritunga Restaurant", lat: 12.9754852, lng: 77.7263189 };
var locationObj4 = { id: "4", title: "Sri Sathya Sai General Hospital", lat: 12.9801062, lng: 77.7237548 };
var locationObj5 = { id: "5", title: "Inox", lat: 12.9659789, lng: 77.7173899 };
var locationObj6 = { id: "6", title: "Kappors Cafe", lat: 12.9712065, lng: 77.7096544 };
var locationObj7 = { id: "7", title: "Chinnappanahalli Lake Park", lat: 12.965017, lng: 77.7077661 };
var locationObj8 = { id: "8", title: "Decathlan Whitefield", lat: 12.9917983, lng: 77.7005536 };
var locationObj9 = { id: "9", title: "Prestige Shantiniketan", lat: 12.9921328, lng: 77.7287919 };
var locationObj10 = { id: "10", title: "Ericsson India Global Services", lat: 12.984285, lng: 77.696979 };

//Add Locations
locations.push(locationObj1);
locations.push(locationObj2);
locations.push(locationObj3);
locations.push(locationObj4);
locations.push(locationObj5);
locations.push(locationObj6);
locations.push(locationObj7);
locations.push(locationObj8);
locations.push(locationObj9);
locations.push(locationObj10);

function initialize() {
	//Initial location
	var center = new google.maps.LatLng(12.9784095, 77.7154715);
	map = new google.maps.Map(document.getElementById("map"), { zoom: 14, center: center });
}

function addMarker(location) {
	var title = location.title;
	var pos = new google.maps.LatLng(location.lat, location.lng);
	var content = location.title;
	var self = this;

	this.visible = ko.observable(true);

	self.id = location.id;
	this.title = title;

	self.response = {};

	self.marker = new google.maps.Marker({
		title: title,
		position: pos,
		map: map
	});

	this.click = function (location) {
		google.maps.event.trigger(self.marker, "click");
	};

	// Foursquare Keys
	var clientId = "BBOWVRM2PIQMRJNYIARIYSN524H4V1L1UVMYSFY5L5ZFNQEL";
	var secretId = "GI4XA0J4UNOU2JLDPRKMTAODLN1XYXUVIUN0KP5LYWH0HN0Y";

	var apiUrl = "https://api.foursquare.com/v2/venues/search?ll=" + location.lat + "," + location.lng + "&client_id=" + clientId +
		"&client_secret=" + secretId + "&query=" + location.title + "&v=20170708";

	// Foursquare API Call for getting location details
	$.getJSON(apiUrl).done(function (data, id) {
		// Store response
		self.response = data.response.venues[0];
	}).fail(function () {
		alert(
			"Something wrong with FourSquare API, Please try again later"
		);
	});

	// Add listener for marker click on Google Maps
	google.maps.event.addListener(self.marker, "click", function () {
		console.log(self.response);
		infowindow.marker = this;
		var contentStr = "<h6>" + this.title + "</h6>";
		var addressArr = self.response.location.formattedAddress;
		for (var i = 0; i < addressArr.length; ++i) {
			contentStr += "" + addressArr[i] + "</br>";
		}

		infowindow.setContent('<h6 style="color:coral">' + contentStr + "</h6>");
		infowindow.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');

		infowindow.open(map, this);

	});

	self.filterMarkers = ko.computed(function () {
		if (self.visible() == true) {
			self.marker.setVisible(true);
		} else {
			self.marker.setVisible(false);
		}
	});
}

function initMap() {
	infowindow = new google.maps.InfoWindow({ content: "" });
	//Initialize only when DOM is loaded, otherwise wait for few seconds before attempting initialization
	if (g_domLoaded == true) {
		initialize();
		ko.applyBindings(new ViewModel());
	}
	else {
		setTimeout(initMap, 3000);
	}
}

function getLocationDetails(url) {

}

function ViewModel() {
	var self = this;
	this.searchLocation = ko.observable(""); //
	this.markersArray = ko.observableArray([]); //

	for (var i = 0; i < locations.length; ++i) {
		var marker = new addMarker(locations[i]);
		//g_markers.push(marker);
		self.markersArray.push(marker);
		console.log(marker);
	}

	this.locationList = ko.computed(function () {
		var searchStr = self.searchLocation().toLowerCase();
		if (searchStr) {
			return ko.utils.arrayFilter(self.markersArray(), function (location) {
				var str = location.title.toLowerCase();
				var bFound = str.indexOf(searchStr) == -1 ? false : true;
				location.visible(bFound);
				return bFound;
			});
		}
		self.markersArray().forEach(function (location) {
			location.visible(true);
		});
		return self.markersArray();
	}, self);
};

//Add listener for DOMContentLoaded, set g_domLoaded flag true
var g_domLoaded = false;
window.addEventListener("DOMContentLoaded", function () {
	g_domLoaded = true;
}, true);
