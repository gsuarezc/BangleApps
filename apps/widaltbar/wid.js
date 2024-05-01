(() => {
  var alt = "";
  var elev = "";
  var lastBar = 0;
  let width = 24;
  let height = 24;
  var settings = Object.assign({
    interval: 60000,
  }, require('Storage').readJSON("widaltbar.json", true) || {});
  let jwea = require("Storage").readJSON('weather.json') || {};
  let temp = 0;
  let hpa = 0;
  try {
    temp = jwea.weather.temp||0;
    hpa = jwea.weather.hpa||0;
    elev = settings.weather.elevation||0;
  } catch(_e){}

  function calcAlt(P, P0, T0) {
    // Constants
    const L = 0.0065; // Temperature lapse rate (K/m)
    const g0 = 9.80665; // Gravitational acceleration (m/s²)
    const M = 0.0289644; // Molar mass of dry air (kg/mol)
    const R = 8.31446; // Universal gas constant (J/(mol·K))
    // Convert temperature to Kelvin if necessary
    // T0 = T0 + 273.15; // Assuming T0 is in Celsius
    // Calculate the change in altitude (h)
    const h = (T0 / L) * (1 - Math.pow(P / P0, R * L / (g0 * M)));
    return h;
  }

  Bangle.on("pressure", (p) => {
    if (p.pressure.toFixed(2) != lastBar) {
      lastBar = p.pressure.toFixed(2);
      if (hpa && temp) {
        alt = Math.round(calcAlt(lastBar * 100, hpa * 100, temp));
      }
      WIDGETS.openmwid.draw();
    }
    let ho = new Date();
    console.log(ho.toISOString(), "- Alt:", alt + "m");
    if (settings.enabled && hpa && temp) {
      setTimeout(() => {
        if(!Bangle.isBarometerOn()){
          Bangle.getPressure().then(d => {
            console.log("U", d.pressure.toFixed(1));
          });
        }
      }, settings.interval);
    }
  });

  function draw() {
    if (!Bangle.isLCDOn()) return;
    g.reset();
    g.setColor(g.theme.bg);
    g.fillRect(this.x, this.y, this.x + this.width, this.y + 23);
    g.setColor(g.theme.fg);
    g.drawRect(this.x, this.y, this.x + width, this.y + height - 1); // check the bounds!
    g.setFont("6x8", 1).setFontAlign(0, 0);
    let c = (g.stringMetrics(alt));
    let o = (g.stringMetrics(elev));
    g.drawImage(atob("EBCBAAAAAAAIAAwgFXAX0BCYIIggTD/EYPZADkACf/4AAAAA"), this.x + 1, this.y-1, { scale: 0.6 });
    g.setFontAlign(0, 0).drawString(alt,  this.x + width / 2, this.y + height - o.height - (c.height / 2));
    g.setFontAlign(1, 0).drawString(elev, this.x + width / 2 + 3, this.y + height - o.height / 2);
  }
  // First run
  if(!Bangle.isBarometerOn()){
    Bangle.getPressure().then(d => {
      console.log("I", d.pressure.toFixed(1));
    });
    }

  WIDGETS.openmwid = {
    area: "tl",
    width: width,
    draw: draw
  };

})();
