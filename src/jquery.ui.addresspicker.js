/*
 * jQuery UI addresspicker @VERSION
 *
 * Copyright 2010, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   jquery.ui.core.js
 *   jquery.ui.widget.js
 *   jquery.ui.autocomplete.js
 */
(function( $, undefined ) {

$.widget( "ui.addresspicker", {
  options: {
    appendAddressString: "",
    mapOptions: {
      zoom: 5,
      center: new google.maps.LatLng(46, 2),
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    },
    elements: {
      map: false,
      lat: false,
      lng: false,
      locality: false,
      address: false,
      zip_code: false,
      country: false,
      countryCode: false
    },
    draggableMarker: true
  },

  init: function() {
    var lat = this.lat.val();
    var lng = this.lng.val();
    this._updateInput(lat, lng);
  },

  marker: function() {
    return this.gmarker;
  },

  map: function() {
    return this.gmap;
  },

  updatePosition: function() {
    this._updatePosition(this.gmarker.getPosition());
    this.gmap.setZoom(10);
  },

  reloadPosition: function() {
    this.gmarker.setVisible(true);
    this.gmarker.setPosition(new google.maps.LatLng(this.lat.val(), this.lng.val()));
    this.gmap.setCenter(this.gmarker.getPosition());
  },

  selected: function() {
    return this.selectedResult;
  },

  _create: function() {
    this.geocoder = new google.maps.Geocoder();
    this.element.autocomplete({
      source: $.proxy(this._geocode, this),
      focus:  $.proxy(this._focusAddress, this),
      select: $.proxy(this._selectAddress, this)
    });

    this.lat         = $(this.options.elements.lat);
    this.lng         = $(this.options.elements.lng);
    this.address     = $(this.options.elements.address);
    this.zip_code    = $(this.options.elements.zip_code);
    this.locality    = $(this.options.elements.locality);
    this.country     = $(this.options.elements.country);
    this.countryCode = $(this.options.elements.countryCode);
    if (this.options.elements.map) {
      this.mapElement = $(this.options.elements.map);
      this._initMap();
    }
  },

  _initMap: function() {
    if (this.lat && this.lat.val()) {
      this.options.mapOptions.center = new google.maps.LatLng(this.lat.val(), this.lng.val());
    }

    this.gmap = new google.maps.Map(this.mapElement[0], this.options.mapOptions);
    this.gmarker = new google.maps.Marker({
      position: this.options.mapOptions.center,
      map:this.gmap,
      draggable: this.options.draggableMarker});
    google.maps.event.addListener(this.gmarker, 'dragend', $.proxy(this._markerMoved, this));
    this.gmarker.setVisible(false);
  },

  _updatePosition: function(location) {
    if (this.lat) {
      this.lat.val(location.lat());
    }
    if (this.lng) {
      this.lng.val(location.lng());
    }
  },

  _markerMoved: function() {
    var location = this.gmarker.getPosition();
    this._updatePosition(location);
    this._updateInput(location.lat(), location.lng());
  },

  // Update input method
  _updateInput: function(lat, lng)
  {
    var self = this;
    var latlng = new google.maps.LatLng(lat, lng);

    this.geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          self.element.val(results[0].formatted_address);
        }
      }
    });
  },

  // Autocomplete source method: fill its suggests with google geocoder results
  _geocode: function(request, response) {
    var address = request.term, self = this;
    this.geocoder.geocode( { 'address': address + this.options.appendAddressString}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          results[i].label =  results[i].formatted_address;
        };
      }
      response(results);
    })
  },

  _findInfo: function(result, type, attr) {
    if (typeof attr == 'undefined') { attr = 'long_name'; }

    for (var i = 0; i < result.address_components.length; i++) {
      var component = result.address_components[i];
      if (component.types.indexOf(type) !=-1) {
        return component[attr];
      }
    }
    return false;
  },

  _focusAddress: function(event, ui) {
    var address = ui.item;
    if (!address) {
      return;
    }

    if (this.gmarker) {
      this.gmarker.setPosition(address.geometry.location);
      this.gmarker.setVisible(true);

      this.gmap.fitBounds(address.geometry.viewport);
    }
    this._updatePosition(address.geometry.location);

    if (this.locality) {
      this.locality.val(this._findInfo(address, 'locality'));
    }
    if (this.address) {
      this.address.val(this._findInfo(address, 'route') + " " + this._findInfo(address, 'street_number'));
    }
    if (this.zip_code) {
      this.zip_code.val(this._findInfo(address, 'postal_code'));
    }
    if (this.country) {
      this.country.val(this._findInfo(address, 'country'));
    }

    if (this.countryCode) {
      this.countryCode.val(this._findInfo(address, 'country', 'short_name'));
    }

  },

  _selectAddress: function(event, ui) {
    this.selectedResult = ui.item;
  }
});

$.extend( $.ui.addresspicker, {
  version: "@VERSION"
});


// make IE think it doesn't suck
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
    for(var i=0; i<this.length; i++){
      if(this[i]==obj){
        return i;
      }
    }
    return -1;
  }
}

})( jQuery );
