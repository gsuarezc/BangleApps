function parseWeather(response,lat,lon) {
  let omData = JSON.parse(response);
  
  let isOmData = omData.elevation && 1;
  // try {
  //   isOmData = omData.elevation && True;
  // } catch (_e) {}

  if (isOmData) {
    let json = require("Storage").readJSON('widaltbar.json') || {};
    let weather = {};
    weather.time = Date.now();
    weather.elevation = omData.elevation[0];
    weather.lat = lat;
    weather.lon = lon;

    json.weather = weather;
    require("Storage").writeJSON('widaltbar.json', json);
    return undefined;
  } else {
    return /*LANG*/"Not OWM data";
  }
}

exports.pull = function(completionCallback) {
  let location = require("Storage").readJSON("mylocation.json", 1) || {
    "lat": 51.50,
    "lon": 0.12,
    "location": "London"
  };
  let settings = Object.assign(
    require('Storage').readJSON("widaltbar.default.json", true) || {},
    require('Storage').readJSON("widaltbar.json", true) || {}
  );
  let uri = "https://api.open-meteo.com/v1/elevation?latitude=" + location.lat.toFixed(5) + "&longitude=" + location.lon.toFixed(5);
  if (Bangle.http){
    if(settings.weather.lat != location.lat && settings.weather.lon != location.lon){
      Bangle.http(uri, {timeout:10000}).then(event => {
        let result = parseWeather(event.resp,location.lat,location.lon);
        if (completionCallback) completionCallback(result);
      }).catch((e)=>{
        if (completionCallback) completionCallback(e);
      });
    }else{
      let weather = {};
      weather.time = Date.now();
      settings.weather = weather;
      require("Storage").writeJSON('widaltbar.json', settings);
    }
  } else {
    if (completionCallback) completionCallback(/*LANG*/"No http method found");
  }
};
