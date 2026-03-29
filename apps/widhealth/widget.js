(() => {
  let width = 24;
  let height = 24;
  let interval;

  function draw() {
    let status = Bangle.getHealthStatus("last") || {};
    let bpm = Math.round(status.bpm || 0);
    let con = Math.round(status.bpmConfidence || 0);

    g.setColor(g.theme.bg);
    g.clearRect(this.x, this.y, this.x + width, this.y + height);
    g.setColor(g.theme.fg);
    g.setFont("6x8", bpm >= 100 ? 1 : 2).setFontAlign(0, 0);
    g.drawString(bpm, this.x + width / 2, this.y + 6);
    g.setFont("6x8").setFontAlign(0, 0);
    g.drawString(con, this.x + width / 2, this.y + height - 4);
  }

  WIDGETS.widhealth = {
    area: "tl",
    width: 24,
    draw: draw,
    remove: function () { if (interval) clearInterval(interval); interval = undefined; }
  };

  interval = setInterval(function () {
    WIDGETS.widhealth.draw(WIDGETS.widhealth);
  }, 2 * 60000);

})();
