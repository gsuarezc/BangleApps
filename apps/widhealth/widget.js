(() => {
  let width = 24; // width of the widget
  let height = 24; // height of the widget
  let interval;

  function draw() {
    if (interval) clearInterval(interval);
    interval = setInterval(function () {
      WIDGETS.widhealth.draw(WIDGETS.widhealth);
    }, 2 * 60000);
    g.reset();
    g.setColor(g.theme.bg);
    g.clearRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
    g.setFont("6x8", 2).setFontAlign(0, 0);
    g.setColor(g.theme.fg);
    let bpm = Math.round(Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm);
    let con = Math.round(Bangle.getHealthStatus().bpmConfidence || Bangle.getHealthStatus("last").bpmConfidence);
    let b = (g.stringMetrics(bpm));
    if (b.width > width) { g.setFont("6x8").setFontAlign(0, 0); b = (g.stringMetrics(bpm)); }
    g.drawRect(this.x, this.y, this.x + width, this.y + height - 1); // check the bounds!
    g.drawString(bpm, this.x + width / 2, this.y + b.height / 2);
    g.setFont("6x8").setFontAlign(0, 0);
    let c = (g.stringMetrics(con));
    g.drawString(con, this.x + width / 2, this.y + height - c.height / 2);
  }



  // add your widget
  WIDGETS.widhealth = {
    area: "tl",
    width: 24,
    draw: draw
  };

})();
