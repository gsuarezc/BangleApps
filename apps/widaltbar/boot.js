{
  let waiting = false;
  let settings = Object.assign(
    require('Storage').readJSON("widaltbar.default.json", true) || {},
    require('Storage').readJSON("widaltbar.json", true) || {}
  );

  let completion = function(){
    waiting = false;
    settings.updated = Date.now();
    require('Storage').writeJSON("widaltbar.json", settings);
  };

  if (settings.enabled) {    
    let weather = require("Storage").readJSON('widaltbar.json') || {};
    if (weather && weather.weather && weather.weather.time) lastUpdate = weather.weather.time;

    if (!settings.updated || settings.updated + settings.refresh * 1000 * 60 < Date.now()){
      setTimeout(() => {
        if (!waiting){
          waiting = true;
          require("widaltbar").pull(completion);
        }
      }, 5000);
    }
    setInterval(() => {
      if (!waiting && NRF.getSecurityStatus().connected){
        waiting = true;
        require("widaltbar").pull(completion);
      }
    }, settings.refresh * 1000 * 60);
  }
}
