var DTO = DTO || {};

DTO.Forms = (function(window, undefined) {
  var init = function() {
    initTextBoxLists();
  };

  var initTextBoxLists = function() {
    $('button.add-more').on('click', function (e) {
      e.preventDefault();
      var $group = $(this).parent().prev('.input-group');
      var clone = $group.find('input').first().clone();
      clone.val('');
      $group.append(clone);

      if(clone.hasClass('auto-complete')) {
        DTO.GoogleMaps.init();
      }
    });
  };

  return {
    init : init
  }
})(window);

DTO.Forms.MockPersistence = (function(window, undefined) {
  var init = function() {
    persistHttpGetParams();
  };

  var extractHttpGetParams = function() {
    var match,
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) {
        return decodeURIComponent(s.replace( /\+/g, " "));
      },
      query = window.location.search.substring(1);
    var urlParams = {};
    while (match = search.exec(query)) {
      var key = decode(match[1]);
      if(key in urlParams) {
        var val = '' + urlParams[key] + ', ' + decode(match[2]);
        urlParams[key] = val;
      }
      else {
        urlParams[key] = decode(match[2]);
      }
    }
    return urlParams;
  };

  var persistHttpGetParams = function() {
    var params = extractHttpGetParams();
    for(var key in params) {
      $('form').append('<input type="hidden" id="' + key + '" name="' + key + '" value="' + params[key] + '" />')
    }
  };

  var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  var setTextContentOfSpanElements = function() {
    var params = extractHttpGetParams();
    for(var key in params) {
      $('span#' + key).text(params[key]);
    }
  };

  return {
    init : init,
    getParameterByName : getParameterByName,
    setTextContentOfSpanElements : setTextContentOfSpanElements
  }
})(window);

$(function() {
  $('.btn-login').on('click',function(e) {
    e.preventDefault();

    var html = document.documentElement;

    var el = document.getElementById('loginContainer');
    
    if (el.classList.contains('hide'))
    {
      el.classList.remove('hide');
      setTimeout(function(){   
        el.classList.add('slide-up');
        html.classList.add('no-scroll');
      },200);
    }
  });
  
})

DTO.GoogleMaps = (function(window, undefined) {
  var API_KEY = 'AIzaSyB92uNcFUglUi2raycalrPhJxF4-pnHuIo';
  var ENTER_KEY = 13;

  var autoComplete,
    components = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
  };

  var init = function() {
    $('input.auto-complete').each(function() {
      var $input = $(this);
      window.googleMapsCallback = function() {
        autoComplete = new google.maps.places.Autocomplete(
          $input[0], { types: ['address'],
                componentRestrictions: {country: 'au'} }); // restrict to country au ie. australia
          $input.bind('keypress', function(e) {
          if(e.which === ENTER_KEY) {
            e.preventDefault();
          }
        });
        autoComplete.addListener('place_changed', fillInAddress);
      };
      if($input.hasClass('geo-locate')) {
        $input.on('focus', function() {
          geolocate();
        });
      }
      addScriptTagOnLoad();
    });
  };

  var fillInAddress = function() {
    var place = autoComplete.getPlace();
    for(var component in components) {
      var element = document.getElementById(component);
      if(element !== null) {
        element.value = '';
      }
    }

    var address = '';
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];
      if (components[addressType]) {
        var val = place.address_components[i][components[addressType]];
        var element = document.getElementById(addressType);
        if(element !== null) {
          element.value = val;
        }
        if (address.length === 0) {
          address = val;
        } else {
          address = address + ' ' + val;
        }
      }
    }
    if (address.length > 0) {
      geocodeAddress(address);
    }
  };

  var geocodeAddress = function(address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        $('#lat').val(latitude);
        $('#lng').val(longitude);
      }
    });
  };

  var geolocate = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        autoComplete.setBounds(circle.getBounds());
      });
    }
  };

  var addScriptTagOnLoad = function() {
    window.addEventListener('load', function() {
      loadScript('https://maps.googleapis.com/maps/api/js?key=' + API_KEY +
        '&signed_in=true&libraries=places&callback=googleMapsCallback')
    }, false);
  };

  var loadScript = function(url, callback){
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    if(typeof callback === 'function') {
      script.addEventListener('load', callback, false);
    }
    script.setAttribute('src', url);
    document.body.appendChild(script);
  };

  return {
    init : init
  }
})(window);

DTO.Dropdowns = (function(window, undefined) {
  var init = function() {
    $('a.dropdown').each(function() {
      var icon = $(this).find('i');
      var target = $(this).data('target');
      
      $(target).find('.fa-times').on('click', function() {
        fadeOut(icon, target);
      });

      $(this).on('click', function(e) {
        e.preventDefault();
        if($(target).hasClass('out')) {
          fadeIn(icon, target);
        }
        else {
          fadeOut(icon, target);
        }
      });
    });
  };

  var fadeIn = function(icon, target) {
    $(icon).addClass('fa-caret-up');
    $(icon).removeClass('fa-caret-down');
    $(target).removeClass('out');
  };

  var fadeOut = function(icon, target) {
    $(icon).addClass('fa-caret-down');
    $(icon).removeClass('fa-caret-up');
    $(target).addClass('out');
  };

  return {
    init : init
  }
})(window);

$(function() {
  DTO.Forms.init();
  DTO.Forms.MockPersistence.init();
  DTO.GoogleMaps.init();
  DTO.Dropdowns.init();
});

$(function($) {
  $('a[href="#"]').click(function(e) {
     e.preventDefault();
  });
});
